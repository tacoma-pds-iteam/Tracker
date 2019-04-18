/***************************************************************************
Filename: handlers.js
Description: This file holds all of the Servers handlers for each client
connection. Each handler will invoke some server function defined in the 
Server class, or send back out the data from one client to all clients.
****************************************************************************/
module.exports = function(socket, client, server, db, classes, transporter, configs) { 
	/* This file starts on client connection */ 
	getLoggedInUsers(socket); //retrieves logged in users on connect
	/* Server handlers start */
    client.on("login", function (data) { //validate user login
    	db.query(`SELECT * FROM users where username = "${data}"`, (err, rows) => {
		    if(err || !rows.length) client.emit('loginresult', err); //user not found
		    else { //user that tried to login was found in DB, allow login
		    	let username = rows[0].username;
		    	let x = loginDB(username, "Y", client.handshake.address); // set DB to 'logged in'
		    	getLoggedInUsers(socket); //get new list of logged in users
		    	let user = new classes.User(rows[0]); //create user object for server data to use later
		    	server.users.push(user); 
		    	client.emit('loginresult', rows); // send logged in user data to client
  			}
  		});
	});

    client.on("logout", function (data) { // user wants to logout, reset ip address and logged in flag
    	db.query(`UPDATE users SET user_logged_in = "N", user_ip = "" WHERE user_ip = "${client.handshake.address}"`, (err, rows) => {
        if(err) 
          console.log(' Failed to logout :' + err); //fail
        else  {
           console.log('logged out', data); //success
           getLoggedInUsers(socket); //get new list of users
           server.removeLoggedInUser(data); //remove user from server data
        }
      });
	});

	client.on("create-record", function (data) { //create record
		let clean = cleanNewCard(data.info); // clean incoming data for anything that will break accela
		console.log('Creating new card...');
		server.createRecord(clean, data.user, client); // server pushes data to Accela
	});

	client.on("new-chat-message", function (data) { // chat message was received
		socket.emit('new-chat-message',data); //send back to all clients
	});

	client.on("new-activity-message", function (data) { // activity was received
		socket.emit('new-activity-message',data); //send back to all clients
	});

	client.on("send-email", function (data) { // send email command was sent, send email with given data
		data.from = configs["em-user"];// set default email
		sendEmail(transporter, data); //send email
	});

	client.on("update-workflow", function (data) { // update workflow handler
		if(data.status == 'Activate') // reception 'supervisor' button needs client to send email after finish
			server.updateWorkflow(data.record,data.user,data.task,data.status,data.notes,data.hours, client);
		else 
			server.updateWorkflow(data.record,data.user,data.task,data.status,data.notes,data.hours); //update without client data
	});

	client.on("pull-data", function() { // client requested data from server
		let data = server.getServerData(); // grab cards from server
		for(let i in data){
			socket.emit('card-data', data[i]); // send each card one by one for smaller packages (faster)
		}		
	});
	client.on('init-wf', function(rec) { // client needs card data before it can update workflow
		client.emit('init-wf', server.snagRecord(rec)); //grab record and send back to client
	});
	client.on('reroute-wf', function (data) { // card is being rerouted for review to departments
		server.rerouteDepartment(data, client); // reroute workflow
	});
	client.on('email-search', function (data) {  //client searching for emails
		queryEmail(data); // hidden function to 'reset' the cards from Accela data
	});
	client.on('restart-server', function (data) {  //client clicked the dog logo (hidden button)
		server.restart(); // hidden function to 'reset' the cards from Accela data
	});
	/* Function cleans the data sent from clients for creating a new record in Accela */
   	function cleanNewCard(data){		
   		console.log(data);
		let addressArray = cleanAddress(data.address); // clean APO data
		let parcelArray = cleanParcel(data.parcel);
		let ownerArray = cleanOwner(data.owner);
		let recType = configs["accela-record-type"].split("/");
   		return { // clean data object for Accela
			"type": {
				"module": recType[0],
				"value": configs["accela-record-type"],
				"type": recType[1],
				"text": "Walk-in Record",
				"alias": "Walk-in Record",
				"subType": recType[2],
				"category": recType[3],
				"group": recType[0],
				"id": configs["accela-record-type-id"]
			},
			"module": recType[0],
			"description": data.description,
			"initiatedProduct": "TRACKER",
			"createdBy": data.dispositionNote,
			"dispositionNote": data.dispositionNote,
			"shortNotes": data.shortNotes,
			"addresses": addressArray,
			"parcels": parcelArray,
			"contacts": [{
				"isPrimary": "Y",
				"firstName": data.contact,
				"status": {
					value: "A",
					text: "Active"
				},
				"type": {
					value: "Applicant",
					text: "Applicant"
				}
			}],
			"owners": ownerArray
		};   		
   	}
   	/* Function cleans the address object sent by client in new record call */
   	function cleanAddress(a){
   		let clean = [];
   		for(let i in a){
   			clean.push({
   				"houseNumberStart": a[i].number,
				"streetName": a[i].name,
				"postalCode": a[i].zip,
				"city": a[i].city,
				"state": {
					"value": "WA",
					"text": "WA"
				},
				"streetDirection": a[i].direction,
				"streetSuffix": {
					"value": a[i].suffix,
					"text": a[i].suffix,
				},
				"description": "INCITY",
				"unitStart": a[i].unit,
				"streetAddress": "" + `${a[i].number} ${a[i].direction} ${a[i].name} ${a[i].suffix}`
			});
   		}
   		return clean;
   	}
   	/* Function cleans the parcel object sent by client in new record call */
   	function cleanParcel(par){
   		let clean = [];
   		for(let i in par){
   			clean.push({
				"parcelNumber": par[i].parcelNumber
			});
   		}
   		return clean;
   	}
   	/* Function cleans the owner object sent by client in new record call */
   	function cleanOwner(own){
   		let clean = [];
   		for(let i in own){
   			clean.push({
				"fullName": own[i].name,
				"isPrimary": "Y",
				"mailAddress": {
					"addressLine2": own[i].full_address,
					"city": own[i].city,
					"postalCode": own[i].zip,
					"state": {
						"text": own[i].state,
						"value": own[i].state
					}
				}
			});
   		}
   		return clean;
   	}
   	/* Function to set user to logged in from a specific IP */
   	function loginDB(username, yn, ip){
   		db.query(`UPDATE users SET user_logged_in = "${yn}", user_ip = "${ip}" WHERE username = "${username}"`, (err, rows) => {
		    if(err) 
		    	console.log('logged in result fail: ' + err); //fail
  		});
   	}
   	/* Function grabs all logged in users from DB */
   	function getLoggedInUsers(s) {
   		db.query(`SELECT * FROM users where user_logged_in = "Y"`, (err, rows) => {
		    if(err) return -1; //user not found
		    else {
		    	s.emit('logged-in-users',rows);
  			}
  		});
   	}
   	/* Function sends email given options sent from client */
   	function sendEmail(transporter, options){
	    // Options param example:
		//   var mailOptions = {
		//   from: 'tracker.cot@gmail.com',
		//   to: 'myfriend@yahoo.com',
		//   subject: 'Sending Email using Node.js',
		//   text: 'That was easy!'
		//   *OR* html: '<h1>Welcome</h1><p>That was easy!</p>'
		// };
	   transporter.sendMail(options, function(error, info){
		  	let data = {
		  		isSuccess: false
		  	};
		    if (error) {
		      console.log(error);
		    } else {
		      data.isSuccess = true;
		      console.log('Email sent: ' + info.response);
		    }
		    client.emit('send-email-response', data);
	   });
	}
	/* Function sends sql query to user database that returns emails for email modal. Limits to 3 results max */
  function queryEmail(text){
  	let q = `SELECT user_email, user_first, user_last from users where user_email like '${text}%' or user_first like '${text}%' or user_last like '${text}%' limit 3`;
  	// console.log(q);
    db.query(q, (err, rows) => {
		    if(err) return -1; //user not found
		    else {
		    	client.emit('email-search',rows);
  			}
  		});
  } 

};