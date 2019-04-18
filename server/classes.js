/****************************************** 
Filename: Classes.js
Description: This file contains all classes used by the server to handle
all actions in Tracker. 
******************************************/
/* Node requirements */
const request = require('request');
// const http = require('http');

/* Card class to hold information from a specific record to be displayed
   on Tracker */
class Card {
  constructor(data){
    this.recordId = data.customId;
    this.shortNotes = data.shortNotes;
    this.capId = data.id;
    this.contact = data.contacts;
    this.addresses = data.addresses;
    this.parcels = data.parcels;
    this.description = data.description;
    typeof(data.status) != 'undefined' ? this.status = data.status.value : this.status = '';
    this.updateDate = data.updateDate;
    this.openedDate = data.openedDate;
    this.workflowHistory = [];
    this.fullObject = data;
  }
}
/* User Class holds user data retrieved from local database */
class User {
  constructor(userObject){
    this.username = userObject.username;
    this.firstName = userObject.user_first;
    this.lastName = userObject.user_last;
    this.email = userObject.user_email;
    this.initials = userObject.user_initials;
    this.department = userObject.user_dept;  
    this.user_ip = userObject.user_ip;  
  }
}
/* Server class acts as the main process for application. This class holds contains all interactions with
   the connections to client sockets and Accela. */
class Server {
  constructor (io, configs) {
    /* Server startup functions */

    this._TOKEN4 = ''; //variable used to store token to talk to Accela
    this.configs = configs; // pass needed arguments from server file
    this.appid = configs["appid"]; //Accela registered app id and secret
    this.appsecret = configs["appsecret"];
    this.env = configs["env"]; //PROD or SUPP
    this.username = configs["accela-username"];
    this.password = configs["accela-password"];
    this.agency = configs["accela-agency"];
    this.apiscope = configs["accela-scope"];
    this.serverData = {}; //object that holds all card data
    this.users = []; //holds list of logged in users
    this.userList = []; //holds list of ALL users in database (username, first, last)
    this.io = io; //pass socket io object
    /* Grab token and get any data from Accela */
    this.token_refresh(); // get accela data is called in token callback >>> this.getAccelaData(this.getDate(), null);       
  }

  /* Server function that uses socket io to communicate with connected clients. Default functionality is to send to all clients, but if a third parameter is passed, function assumes its the client to send to. */
  emit (signal, data) {
    if(arguments.length == 3){ // custom emit to one socket arg[2] should be the client to send to
      arguments[2].emit(signal, data);
    } else { //default send emit to all sockets     
      console.log('emitting:', signal, data.recordId);
      this.io.sockets.emit(signal, data);
    }
    
  }
  /* Hidden function designed to act as a server restart in case any errors occur or changes from Accela need to be pulled */
  restart() {
    console.log('restart was ordered...');
    process.exit();
    this.getAccelaData(this.getDate(), null);
  }

  /* gets current date in YYYY-MM-DD. If arg, converts to new format. */ 
  getDate () {
    let date = new Date();
    if(arguments.length) date = new Date(arguments[0]);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
  }

  /* Function to grab all relevant Accela record data, including Contacts and Addresses for given date (String in YYYY-MM-DD). if second parameter is populated, only pull record data for that one record. */
  getAccelaData (date, recordSearch) {
    /* default form to request data from Accela*/
    let _form = {
      "module": this.configs['accela-module'],//"Permits",
      "type": {
        "value": this.configs['accela-record-type']//"Permits/Walk-in Record/NA/NA"
      }
    };

    /* Set additional form elements based on recordSearch parameter */
    if (recordSearch) {
      _form.customId = recordSearch; //add specific record number to form
    } else {
      _form.openedDateFrom = date; //take the date passed in
      _form.opendDateTo = date;
    }
    
    request({
        crossDomain: true,
        url: "https://apis.accela.com/v4/search/records?limit=100&fields=customId,description,status,shortNotes,addresses,contacts,parcels&expand=addresses,contacts,parcels",
        method: 'POST',
        headers: {
          'x-accela-appid': this.appid,
          'Authorization': this._TOKEN4,
        },
        form: JSON.stringify(_form)
    }, (err, resp, result) => {
      if(!err && resp.statusCode == 200){ //successful response
        let res = JSON.parse((resp.body)).result; //parsed result
        if (res) {
          if (recordSearch) { // When only one record is given, assume we need to populate addresses and contacts only
            console.log(res);
            let _id = this.getAccelaID(recordSearch); // Set obj to var for easy grabbing

            this.serverData[_id].contact = res[0].contacts; //update record in server data object
            this.serverData[_id].addresses = res[0].addresses;

            this.serverData[_id].parcels = res[0].parcels;
            
            this.emit('update-contact-address', this.serverData[_id]); // Send update to clients
          } else { 
            for(let i = 0, l = res.length; i < l; i++){ //go through all returned results
              let newCard = new Card(JSON.parse(JSON.stringify(res[i]))); //generate card object

              this.serverData[newCard.capId] = newCard; // update server data object

              this.emit('card-data', this.serverData[newCard.capId]); //send each card to clients

              this.getAccelaWorkflow(newCard.recordId); // get workflow history of each record from Accela
              this.getShortNotes(newCard.capId); // get updated shortnotes of each record from Accela
            }
          }
        }        
      } else { // error response
        console.log('Error getting card: ');
        console.log(result);
      }
    });
  }
  /* Function to get workflow history of a given record. */
  getAccelaWorkflow (id) {
    let _record = this.getAccelaID(id); //gets Accela CAP ID from customId

    request({
      "crossDomain": true,
      "url": `https://apis.accela.com/v4/records/${_record}/workflowTasks/histories`,
      "method": 'GET',
      "headers": {
          'x-accela-appid': this.appid,
          'Authorization': this._TOKEN4
      }
    }, (err, resp, result) => {
      if(!err && resp.statusCode == 200) { //success
        // console.log(result);
        result = JSON.parse(result);
        if(result.result){
          if(result.result.length) { //valid data from response
            result = result.result;
            for(let i = 0; i < result.length; i++){ //each workflow entry
              let fullName = this.findFullName(result[i].dispositionNote); // get username of staff who did action

              fullName = (fullName) ? fullName : "Accela Action"; //if cant find, assume an automated action from Accela

              /* Push workflow entry in server data objects history array */
              this.serverData[_record].workflowHistory.push({
                task: result[i].description,
                status: result[i].status,
                comment: result[i].comment,
                hoursSpent: result[i].hoursSpent,
                user: result[i].dispositionNote,
                timeStamp: result[i].lastModifiedDate,
                fullName: fullName
            });
          }
            if(this.serverData[_record].workflowHistory.length){ // If you have any history, send to clients
              this.emit('update-workflow-history', this.serverData[_record]);
            }
          } 
        }         
      } else { // error response
        console.log('Error: ');
        console.log(result);
      }
  });
  }
  /* Utility Function walks through full user list and finds the full name of the given username */
  findFullName(user) {
    if (user) {
      user = user.toUpperCase(); // convert to upper
      for (let i = 0; i < this.userList.length; i++) {
        if (user == this.userList[i].username) {
          return this.userList[i].user_first + ' ' + this.userList[i].user_last;
        }
      }
    }
  }

  /* Utility Function walks through full user list and finds the group emails for each defined task */
  findTaskGroupEmail(taskName) {
      for (let i = 0; i < this.userList.length; i++) {
        if (taskName == this.userList[i].user_first) return this.userList[i].user_email.toLowerCase(); // make lowercase for visual
      }
  }

  /* Function sends new card data object to Accela and returns the card object. If error, returns 
   error response object. Specific client object is passed through to Shortnotes function to generate 
   email notification for them only. This function assumes the data being passed is cleaned. */
  createRecord  (data, user, client)  {
    console.log(JSON.stringify(data));
    request({
      "url": 'https://apis.accela.com/v4/records',
      "method": 'POST',
      "headers": {
        'x-accela-appid': this.appid,
        'authorization': this._TOKEN4,
        'cache-control': 'no-cache'
      },
      "form": JSON.stringify(data)
      }, (err,resp, result) => {
      if(!err && resp.statusCode == 200){ //successful response
        let newCard = new Card(JSON.parse(result).result); //create card object from result

        this.serverData[newCard.capId] = newCard; // update server data object with new card

        
        this.emit('card-data', this.serverData[newCard.capId]); //send card to clients even though its missing address and contacts       
        this.getAccelaData(this.getDate(), newCard.recordId); // Grabs address & contacts for the given record and sends again to clients

       if (data.shortNotes.indexOf('Reception') < 0) {  // if shortnotes doesnt have reception, assume we need to route it to groups      
          let wf = this.setTSI (data); // Set TSI to selected departments
          let comment = this.getReviewComment(data); // sets cleaned comment to send to Accela
          /* request to update TSI for routing */
          request({
            "crossDomain": true,
            "url": `https://apis.accela.com/v4/records/${newCard.capId}/workflowTasks/${this.configs["accela-reception-step"]}-${this.configs["accela-workflow-id"]}/customForms`,
            "method": 'PUT',
            "headers": {
              "x-accela-appid": this.appid,
              "authorization": this._TOKEN4
            },
            "form": JSON.stringify([wf])
          }, (err, resp, result) => {
            if (!err && resp.statusCode == 200) { //successful update, can actually update the workflow now
              this.updateWorkflow(newCard.recordId, user, "Reception", "Send to Review", comment, .01, client); //remember client is passed to generate email notification
            } else { //couldnt update TSI
              console.log('TSI Error: ' + result);
            }
          });
        } 
        //else let it sit in reception because we want it there       
      } else { //card couldnt be created, probably a data entry problem
        console.log('Error creating card: ');
        console.log(result);
      }
    });
  }

  /* function gets the accela id in the server data based on a given record number.
    if not found, returns empty string */
  getAccelaID(recordNumber){
    for(let i in this.serverData){
      if (this.serverData[i].recordId == recordNumber) {
        return this.serverData[i].capId;
      }
    }
    return '';
  }

  /* Reroutes department from reception after initial record creation. Passes specific client for email notification */
  rerouteDepartment (data, client) {
    let _comment = data.comment;

    if (data.shortNotes.indexOf('Reception') < 0) { // if reception is not in shortnotes, route it to groups
      let _wf = this.setTSI(data); // set TSI object for Accela to consume
      let _capId = this.getAccelaID(data.record); // Accela CAP ID

      if (_comment == "") { // set default comment if none
        _comment = "Routing customer for review";
      }
      
      request({
        "crossDomain": true,
        "url": `https://apis.accela.com/v4/records/${_capId}/workflowTasks/${this.configs["accela-reception-step"]}-${this.configs["accela-workflow-id"]}/customForms`,
        "method": 'PUT',
        "headers": {
          "x-accela-appid": this.appid,
          "authorization": this._TOKEN4
        },
        "form": JSON.stringify([_wf])
      }, (err, resp, result) => {
        if (!err && resp.statusCode == 200) { //TSI updated successful, send the actual workflow update
          this.updateWorkflow(data.record, data.user, "Reception", "Send to Review", _comment, data.time, client);
        } else {
          console.log('TSI Error: ' + result);
        }
      });
    } else { //keep in reception, just wants to log some notes
      if (_comment == "") { // default comment
        _comment = "Customer stays in Reception";
      }

      this.updateWorkflow(data.record, data.user, "Reception", "Internal Notes", _comment, data.time); //send the notes to Accela
    }    
  }

  /* Utility Function that sets TSI object to show routed departments */
  setTSI (d) {    
    let _tsi = this.configs["accela-tsi"];
    let _wf = d.shortNotes.split('|')[1];// Grab departments from shortNotes
    
    for (let i in _tsi) {
      if (i != "id") { //skip the 'id' entry
        if (_wf.indexOf(i) > -1) { // Sets TSI entry to 'Yes' in object if found
          _tsi[i] = 'Yes';
        }
      }
    }

    return _tsi; // return updated object
  }

  /* Utility Function creates comment string for routing */
  getReviewComment (d) {
    let _wf = d.shortNotes.split('|')[1]; //gets waiting array

    return `Routing to: ${_wf}`;
  }

  /* Function sends workflow updates to Accela. Passes through client if its a reception update to set up email notification */
  updateWorkflow (recordNumber, username, task, taskStatus, taskComment, hours, client) {
    let tasks = this.configs["accela-task-steps"];
    let taskId = tasks.indexOf(task); //Accela task Id for the WALKINV3 workflow
    let id = this.getAccelaID(recordNumber); // accela record id
    let user = this.findUserObject(username); // find user object
    let userFirst = user.firstName;
    let autoMessage = `${userFirst} `; // automated message string
    let emailModal = false; // bool to send email or not
    let receptionSocket = null; // default null unless sent from reception

    request({
      "crossDomain": true,
      "url": `https://apis.accela.com/v4/records/${id}/workflowTasks/${taskId}-${this.configs["accela-workflow-id"]}?fields=comment,hoursSpent,status,lastModifiedDate,dispositionNote`,
      "method": 'PUT',
      "headers": {
        'x-accela-appid': this.appid,
        'authorization': this._TOKEN4
      },
      "form": JSON.stringify({
        status: {
          text: taskStatus,
          value: taskStatus
        },
        comment: taskComment,
        dispositionNote: user.username,
        hoursSpent: hours
      })
    }, (err,resp, result) => {
      if(!err && resp.statusCode == 200){ // successful, add entry to workflow history in card
        result = JSON.parse(result); // parse result

        if (result.result) { // make sure object is populated as expected
          result = result.result;

          if(typeof result != 'Array') result = [result]; // make sure parsed result is array

          if(result.length) { 
            for(let i = 0; i < result.length; i++){
              let fullName = this.findFullName(result[i].dispositionNote); // get name of user
              fullName = (fullName) ? fullName : "Accela Action"; // if not found assume accela did it
              /* append result to front of workflow history */
              this.serverData[id].workflowHistory.unshift({ 
                task: task,
                status: taskStatus,
                comment: taskComment,
                hoursSpent: hours,
                user: username,
                timeStamp: result[i].lastModifiedDate,
                fullName: fullName
              }); // must append to front since accela returns them in order of most recent instead of earliest first
            }

            this.emit('update-workflow-history', this.serverData[id]); //send entry to clients
            /* If status is from reception, populate automated message string with valid data */
            if(taskStatus == "Customer Arrived"){
              autoMessage += `checked in ${recordNumber}...`;
            } else if (taskStatus == "Send to Reception"){
              autoMessage += `checked out ${recordNumber}...`;
            } else if (taskStatus == "Send to Review"){
              autoMessage += `routed ${recordNumber} for review...`;
              emailModal = true;
              receptionSocket = client;
            } else if (taskStatus == "Customer Departed") {
              autoMessage += `departed ${recordNumber}...`;
            } else if (taskStatus == "Activate") {
              autoMessage += `activated new reviews on ${recordNumber}...`;
              emailModal = true;
              receptionSocket = client;
            } else {
              autoMessage += `updated ${recordNumber} to '${taskStatus}'...`;
            }
            this.sendActivity(autoMessage, user.department); // send activity to activity log
          }
        }
        this.getShortNotes(id, emailModal, receptionSocket); //get the new shortnotes from record caused by the workflow update
      } else { // couldnt update workflow
        console.log('Error: ');
        console.log(result);
      }
    });
  }
 /* function sends auto generated messages to every clients activity. */
  sendActivity(message, dept){
    this.io.sockets.emit('new-activity-message', {
      message: message,
      dept: dept
    });
  }
  /* Function gets shortnotes from record. updates serverData accordingly for refresh */ 
  getShortNotes(id){
    request ({
      "crossDomain": true,
      "url": `https://apis.accela.com/v4/records/${id}?fields=shortNotes&limit=1`,
      "method": "GET",
      "headers": {
        "x-accela-appid":this.appid,
        "authorization":this._TOKEN4
      }
    }, (err, resp, result) => {
      if (!err &&resp.statusCode == 200) { //success
        result = JSON.parse(result).result; //parse result

        if(result.length) {
          result = result[0]; // should only be one entry because we put 'limit 1' in the query

          this.serverData[id].shortNotes = result.shortNotes; //update server data object
          this.emit('update-shortnotes', this.serverData[id]); //send to clients

          if(arguments.length == 3 && arguments[1] == true){ // if specific socket has beed passed in send data to that client only for email notification
            this.emit('email-modal-open', this.serverData[id], arguments[2]);
            this.getEmailRecipients(this.serverData[id].shortNotes, arguments[2]);
          } 
        }
      } else { // couldnt grab shortnotes
        console.log("Error: ");
        console.log(result);
      }
    });
  }
  /* Function that finds the group emails from the user list and sends to client that is sending the email */
  getEmailRecipients(shortNotes, client){
    let snObject = this.parseShortNotes(shortNotes);
    let waitingDepts = snObject.waiting; //groups to send email to
    let recList = [];
    for(let i=0;i<waitingDepts.length;i++){
      if(waitingDepts[i] != "Building Commercial Group"){
        if(waitingDepts[i] == "Land Use Review") recList.push({name: "Building Residential Review", email: this.findTaskGroupEmail("Building Residential Review")});
        recList.push({name: waitingDepts[i], email: this.findTaskGroupEmail(waitingDepts[i])});
      }
       //generate object array with name/email for client      
    }
    this.emit('email-recipients', {recipients: recList}, client); //send to client
  }
  /* Function parses string version of shortnotes to shortnotes object for easier consumption  */
  parseShortNotes(shortNotes) {
    let d = {};
    shortNotes = shortNotes.split("|"); // split into [ timestamp, waiting for department array, with department array]

    if (shortNotes.length == 1) { // shortnotes is 'Departed'
      d.type = 'departed';
    } else if (shortNotes.length == 3) { // valid shortnote
      d.time = shortNotes[0];
      d.waiting = shortNotes[1].split(",");
      d.with = shortNotes[2].split(",");
      d.waiting.indexOf('Reception') >= 0 ? d.type = 'reception' : d.type = 'review'; 
    }
    return d;
  }
  /* Function gets new token from Accela and retrieves any data from today. */
  token_refresh () {
    request({
      "url": "https://apis.accela.com/oauth2/token",
      "method": "POST",
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
        "x-accela-appid": this.appid
      },
      "form": {
        "client_id": this.appid,
        "client_secret": this.appsecret,
        "grant_type": "password",
        "username": this.username,
        "password": this.password, // MAKE SURE THIS IS HIDDEN IF PUBLISHED PUBLICLY!
        "scope": this.apiscope,
        "agency_name": this.agency,
        "environment": this.env
      }
    }, (err,resp, result) => {
      if(resp.statusCode == 200){ // got token
        let temp = JSON.parse(result);
        this._TOKEN4 = temp.access_token; //set token to server variable

        console.log('TOKEN is ' + this._TOKEN4);

        this.getAccelaData(this.getDate(), null); // grab todays data
      } else { //something went wrong
        console.log("Couldnt Refresh token! - " + err);
      }
    });
  }
  /* Utility Function returns the whole server data object  */
  getServerData() {
    return this.serverData;
  }
  /* Function removes a user from the logged in user list */
  removeLoggedInUser(username){
    this.users.filter((i) => i.username != username);
  }
  /* Function finds the user object from logged in user list */
  findUserObject(username){
    return this.users.filter((i) => i.username == username)[0];
  }
  /* Utility Function returns server data from one record based on the record number */
  snagRecord (rec) {
    for (let i in this.serverData) {
      if (this.serverData[i].recordId == rec) return this.serverData[i];
    }
  }
}
/* Node exports to allow parent file to call classes */
module.exports = {
  Card: Card,
  User: User,
  Server: Server
}