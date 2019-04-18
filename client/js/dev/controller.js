/***************************************************************************
Filename: controller.js
Description: This controller class handles any data manipulation and all connection
to and from the server and connected client. Any actions manipulating the
view will invoke View class functions.
****************************************************************************/
class Controller {

  constructor(main) { //initialize view and cookies
    this.cookies = main.cookies;
    this.view = main.view;
    this.socket = main.socket;

    /* Set Initial State of page*/
    this.clearChatMessages();
    this.setSocketHandlers();
    // this.drawChart();  wait for next release..
  }

  /* Initialize socket handlers. Calls another controller function to do an action */
  setSocketHandlers() {
    this.socket.on('connect', () => { // on connection to server
      console.log('Connected to Server!');
      this.initSocketConnection();
    });
    this.socket.on('disconnect', () => { //disconnecting from server
      console.log('Disconnected from Server!');
      $('.error-message').show();
    });
    this.socket.on('loginresult', (user) => { // get login data from server, login user and update cookies if needed
      this.loginResult(user);
    });
    this.socket.on('logged-in-users', (users) => { // get global logged in users from server and update list
      this.updateLoggedInUsers(users);
    });
    this.socket.on('new-chat-message', (message) => { // chat message received, push to chat box
      this.cleanNewMessage(message);
    });
    this.socket.on('new-activity-message', (message) => { // new activity received, update activity log
      //console.log('activity:', message);
      this.cleanActivity(message);
    });
    this.socket.on('card-data', (data) => { // cards received from server, draw/update page
      this.drawCardData(data);
    });
    this.socket.on('send-email-response', (data) => { // email was sent, clean up email modal
      this.emailHandler(data);
    });
    this.socket.on('email-modal-open', (data) => { // email fields received, populate email modal 
      this.populateEmailModal(data);
    });
    this.socket.on('email-recipients', (data) => { // email recipients received, populate email modal with recipients 
      //console.log('email recipients:', data);
      this.populateEmailRecipients(data);
    });
    
    this.socket.on('init-wf', (data) => { // get individual record from server to send workflow update 
      this.updateWF(data);
    });
    this.socket.on('update-contact-address', (data) => { // update contact and address info for specific card
      this.updateContactAddress(data);
    });
    this.socket.on('update-workflow-history', (data) => { //update workflow history for specific card
      this.updateWorkflowHistory(data);
    });
    this.socket.on('update-shortnotes', (data) => { // updates card based on shortnotes, uses same functions as 'card-data'
      this.updateShortnotes(data);
    });
    this.socket.on('email-search', (data) => { // updates card based on shortnotes, uses same functions as 'card-data'
      this.updateEmailSearchResults(data);
    });
  }
  /* Hidden function to repopulate server data with Accela data. This is to help reception correct routing issues in shortnotes */
  restartServer() {
    console.log('requesting restart server...Password required.');
    let pass = prompt("You are requesting a server restart. Please enter the password:");
    if(pass == 'restartMe'){ // correct password for restart
      $('.reception-bucket').find('.drop').remove();
      $('.review-bucket').find('.drop').remove();
      $('.departed-bucket').find('.drop').remove(); // remove all cards
      this.socket.emit('restart-server', 1); // send process kill command to server
    } else { // incorrect
      let tryAgain = confirm('The password you entered is incorrect. Try again?...');
      if(tryAgain) this.restartServer(); // recursive call to try again
    }
    
  }
  /* Function populates the email modal with a standard template for sending the iteam some feedback about Tracker */
  sendIteamFeedback(){
    let el = $('.email-modal');
    let user = this.cookies.getCookie("userFullName"); // get name of user sending the feedback
    let body = "Hello,\n\nI have some feedback on Tracker I would like to share.\n\nFeedback: *Insert your feedback here*\n\nThanks,\n" + user;

    $('.info-modal').removeClass('open'); //close the info modal and open the email modal
    el.addClass('open');

    this.view.setEmailFields(el, '[Tracker] I have feedback to share', body); // invoke view to update email modal 
  }
  /* Function invokes view to update logged in user list */
  updateLoggedInUsers(users) {
    this.view.updateLoggedInUsers(users);
  }
  
  /* function updates the contact and address of a record that already exists in the client */
  updateContactAddress(data) {
    this.view.updateContactAddress(data);
  }
  /* function updates the workflow history of a record that already exists in the client */
  updateWorkflowHistory(data) {
    this.view.updateWorkflowHistory(data);
  }
  /* function calls drawCard to update specific card on page. */
  updateShortnotes(data) {
    //console.log('updateShortnotes was fired!');
    this.drawCardData(data);
  }
  /* Function cleans data and populates the email modal window with relevant data about new customer */
  populateEmailModal(data) {
    let shortNotes = this.parseShortNotes(data.shortNotes);
    let _name = data.contact[0].firstName;
    let _address = '';
    if(typeof data.addresses != 'undefined')
      _address = data.addresses.length ? data.addresses[0].streetAddress : 'No Address Given';

    this.setEmailFields(data.recordId, _name, _address, data.description); //populate email
    $('.email-icon').addClass('shake-slow').addClass('shake-constant').addClass('shake-constant--hover'); //shakes email icon to notify reception that the data has been populated
    $('.email-icon i').addClass('notification'); // flashes the icon red to notify user
  }
  /* Function cleans data and populates the email modal window with relevant data about new customer */
  populateEmailRecipients(data){
    let recipients = data.recipients;
    for(let i=0;i<recipients.length;i++){
      //console.log('email', i);
      let cleanName = recipients[i].name.split(" Review")[0];
      this.view.addEmailToRecipientList(cleanName, recipients[i].email);
    }
  }
  /* card data was received from server, need to parse and
    invoke draw functions from view */
  drawCardData(data) {
    let cardData = {};
    let recordNumber = data.recordId;
    let shortNotes = this.parseShortNotes(data.shortNotes);
    cardData.recordNumber = recordNumber;
    cardData.shortNotes = shortNotes;
    cardData.description = data.description;
    cardData.customerName = [];

    if (data.contact) { //clean contact data
      for (let k = 0; k < data.contact.length; k++) {
        cardData.customerName.push(data.contact[k].firstName);
      }
    }

    if (cardData.customerName.length == 0) { //add default if no name found
      cardData.customerName.push("[No Customer Name]");
    }
    cardData.address = [];
    if (data.addresses) { //clean addresses
      for (let j = 0; j < data.addresses.length; j++) {
        cardData.address.push(this.firstCapString(data.addresses[j].streetAddress));
      }
    }
    if (cardData.address.length == 0) { //default
      cardData.address.push("No Address");
    } 
    cardData.parcels = [];
    if(data.parcels){
      for (let j = 0; j < data.parcels.length; j++) {
        cardData.parcels.push(data.parcels[j].parcelNumber);
      }
    }
    cardData.workflowHistory = data.workflowHistory;
    cardData.user = this.cookies.getCookie('username');
    // Checks if card exists on page
    let _id = '#' + recordNumber;
    if ($(_id).length != 0) {
      // If card already exists check if it needs updating by checking last workflow update or address,contact
      //console.log('Card exists. calling update card function...');
      this.view.updateCardShortNotes(cardData);
    } else {
      //console.log('drawing new card');
      this.view.drawCard(cardData); //card doesnt exist, draw it on the page
    }
  }
  /* Function invokes view to add a new address entry form when creating a new card */
  toggleNewCardAddress(el) {
    this.view.toggleNewCardAddress(el);
  }
  /* Function invokes view to reset the address fields on a new card */
  resetNewCardAddress(el) {
    this.view.resetNewCardAddress(el);
  }
  /* Function invokes view to add new form for additional address entry */
  addNewCardAddressForm(el) {
    this.view.addNewCardAddressForm(el);
  }
  /* Function invokes view to clear address form on a new card entry */
  clearAddressSelection(_el) {
    this.view.clearAddressSelection(_el);
  }
  /* Function invokes view to show or hide the departed column. Shows chat column or departed */
  toggleDepartedColumn() {
    this.view.toggleDepartedColumn();
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
  /* Function  validates new card form to make sure all required data is entered before sending to server */
  validateAndCreateNewCard(_el) {
    let card = _el.parents('.drop');
    let _tmpHTML = card.html();
    let _firstName = escapeSpecialChars(card.find('.customer-name').val());
    _firstName = _firstName.slice(0, 1).toUpperCase() + _firstName.slice(1); // make sure its caps when created
    let _description = card.find('.record-description').val();

    if (_firstName.length && _description.length) { // has minimum information for a record
      this.view.setElementIsLoading(_el); // set loader and remove drop from page until server pushes new card
      this.createRecord(card); // sends card to server for creation
    } else { //something wasnt filled out, reset card and show error
      this.view.setHtml(card, _tmpHTML);
      this.view.addErrorClass(card.find('.customer-name'));
      this.view.addErrorClass(card.find('.record-description'));
    }
  }
  /* Function invokes view to open the given element (card) */
  openElement(_el) {
    this.view.openElement(_el);
  }
  /* Function invokes view to create a new card form to fill out */
  createNewCardElement() {
    this.view.createNewCardElement();
  }
  /* Function invokes view to remove the given 'new card' from the page */
  deleteNewCardElement(_el) {
    this.view.deleteNewCardElement(_el);
  }
  /* Function gets current time and invokes the view to reset the chatbox */
  clearChatMessages() {
    let currentTime = this.getTime(new Date());
    this.view.clearChatMessages(currentTime);
  }
  /* Function cleans new message received from server and invokes view to send to chatbox */
  cleanNewMessage(message) {
    let smartMessage = this.parseMessage(message.message); // enables hyperlinks
    let time = this.getTime(new Date(), false);
    let user = message.name;
    let dept = message.dept.split(" ")[0].toLowerCase();

    this.view.addNewMessage(smartMessage, time, user, dept);
  }
  /* Function cleans activity message and invokes view function to add to activty log */
  cleanActivity(message) {
    let time = this.getTime(new Date(), false);
    let dept = message.dept.split(" ")[0].toLowerCase();

    this.view.addActivity(message.message, time, dept);
  }
  /* Function sends new message to server for distribution */
  sendNewMessage(message) {
    let d = this.cookies.getCookie("department");
    let chatMessage = {};

    if (d) d = d.split(" ")[0];

    if(message.length == 0){
      this.view.addErrorClass($('#chat-message-box'));
      return;
    } 

    chatMessage = {
      name: `${this.cookies.getCookie("userFullName")}`,
      message: `${message}`,
      dept: d
    };

    this.socket.emit('new-chat-message', chatMessage); //send to server
    this.view.resetChatBox(); // reset the text entry field for the chat you just sent
  }
  /* Function sends activity message to server for distribution */
  sendActivity(message){
    //console.log('sending activity', message);
    this.socket.emit('new-activity-message', message);
  }
  /* Function invokes view to collapse/open the accordion style menus in the information modal */
  toggleAccordion(_el) {
    this.view.toggleAccordion(_el);
  }
  /* Function initiates all cookies on page load when socket connection is established. Auto-login if user cookie is found */
  initSocketConnection() {
    let user = this.cookies.getCookie("username");

    if (user != null) {
      this.cookies.setCookie("loginFromCookies", "Y"); // user cookie was found, login using that cookie
      this.validateLogin(user); //validates user
    } else {
      this.cookies.setCookie("loginFromCookies", "N");
    }
  }
  /* Function takes login result from server and stores data in browser cookies. If not found, invokes view to return an error */
  loginResult(result) {
    if (result != null && result.length != 0) { // if server gave back a user
      let user = result[0];
      let userFullName = `${user.user_first} ${user.user_last}`;
      let dept = user.user_dept;

      if (dept.split(",").length > 1) { // if user belongs to more than one department, parse and validate
        dept = dept.split(",");
        for (let i in dept) {
          if (dept[i] == "Site") dept[i] = "Site Development Review";
          // else if (dept[i] == "Building") dept[i] = "Building Review";
          else if (dept[i] == "LandUse") dept[i] = "Land Use Review";
          else if (dept[i] == "Inspections") dept[i] = "";
        }
        dept = dept.join(",").split(",");
      }
      console.log(user.username + " is logged in!");
      $('.login-modal-opener').attr('data-tooltip-text', 'Log Out'); //update tooltip
      this.cookies.setCookie("username", user.username); //establish new cookies for logged in user
      this.cookies.setCookie("userFullName", userFullName);
      this.cookies.setCookie("department", dept);
      this.view.closeModal(); // closes login modal window
      this.view.login(userFullName);
      this.view.updateDepartmentOptions(dept); // reset deparment change options for user
      this.departmentChange(); //set default department
      if (this.cookies.getCookie("loginFromCookies") == 'N') this.sendActivity({
        message: `${userFullName} logged in...`,
        dept: this.cookies.getCookie("department")});
      this.socket.emit('pull-data'); // get data from server
    } else {
      console.log("user not found :'(...");
      this.view.inputError('.login-modal', "#un"); //couldnt find user, return error
    }
  }
  /* Function emits login username to server to verify its a valid user */
  validateLogin(username) {
    this.socket.emit('login', username);
  }
  /* Function that fires on the click of the login/logout header button. If already logged in, log out and vice versa */
  loginButtonClick() {
    let isLoggedIn = !$('body').hasClass('not-logged-in');

    if (isLoggedIn) { // need to log out instead
      let username = this.cookies.getCookie('username');
      let userFullName = this.cookies.getCookie('userFullName');
      let dept = this.cookies.getCookie('department');
      this.cookies.resetCookie("username", "userFullName", "department", "loginFromCookies"); //reset all cookies
      this.view.logout(); // remove data from page
      this.sendActivity({
        message: `${userFullName} logged out...`,
        dept: dept});
      this.socket.emit("logout", username); //log out from server
      $('.login-modal-opener').attr('data-tooltip-text', 'Log In');
    } else {
      this.modalHandler('.login-modal'); // need to log in, so open modal to enter username
    }
    $('#un').focus();
  }
  /* function that invokes view modal opener function */
  modalHandler(modal) {
    this.view.modalHandler(modal);
  }
  /* function sets current dept and invokes dept change view function to update page with correct icons and views */
  departmentChange() {
    let currentDepartment = $('.department-modal .department-select').val();
    let icon = icons[currentDepartment];
    if(currentDepartment == 'Reception'){
      $('.new-drop-btn').show();
      $('.drop').find('.add-dep-btn').show();
    } else {
      $('.new-drop-btn').hide();
      $('.drop').find('.add-dep-btn').hide();
    }
    this.view.closeModal();
    this.view.departmentChange(icon);
  }
  /* Function invokes view to toggle selected department to route */
  selectRoutingDepartment(_el) {
    this.view.selectRoutingDepartment(_el);
  }

  /* Function gets departments the user wants to activate mid */
  activateDepartmentInCycle(_el) {    
    let tasks = _el.siblings('.active');// first get all task to be activated in 'activate departments class'
    let tArray = [];

    if (!tasks.length) {
      console.log('No tasks selected to activate. Cancelling action...');
      return;
    }
    for (let i = 0; i < tasks.length; i++) { // populate array of tasknames
      tArray.push($(tasks[i]).find('span').text());
    }
    tasks = tArray.join(); // string version of array for Accela to consume

    
    let recordNumber = _el.parents('.drop').find('.record-number').text();    
    let _user = this.cookies.getCookie('username');// Grabs username with cookies & finds Initials
    let _initials = _user[0] + _user[1];

    
    let _data = { // initialize data object for wf call
      record: recordNumber,
      user: _user,
      task: `Reception`,
      status: `Activate`,
      notes: `Activate ${tasks}`,
      hours: 0
    };
    // console.log(_data);
    // then send to server to make workflow call
    this.view.setElementIsLoading2(_el); // update button
    this.socket.emit('update-workflow', _data);
  }
  
  
  /* Function cleans data for creating a new card to send to server */
  createRecord(el) {    
    let _user = this.cookies.getCookie('username');    
    let _tmpHTML = el.html(); // Grab drop elements
    let _firstName = escapeSpecialChars(el.find('.customer-name').val()); // Basic required information
    let _description = el.find('.record-description').val();    
    let _addressArray = [];
    let addresses = el.find('.selected-address');

    for (let i = 0; i < addresses.length; i++) { // get all addresses entered on card
      let t = addresses[i];
      if($(t).text()){
        let val = $(t).find('.address-array').text().split("|");
        _addressArray.push(val);
      }
    }
    
    let cleanAddress = this.cleanAddress(_addressArray);// Cleans parcel & address for Accela delivery
    let cleanParcel = this.cleanParcel(_addressArray);
    
    let _ownerArray = [];
    let owners = el.find('.address-drop-area');
    for (let i = 0; i < owners.length; i++) { // Finds Owner based on address input
      let t = owners[i];
      if($(t).find('.owner-array').text()){
        let val = $(t).find('.owner-array').text().split("|");
        _ownerArray.push(val);
      }
    }

    let cleanOwner = this.cleanOwner(_ownerArray); // clean owner data
    let _waitArray = [];
    let _shortNotes = `${new Date().getTime().toString()}|`;
    let _that = this;

    el.find('.department.active span').each(function() { // get all the selected departments to route to
      _waitArray.push(_that.fixTSI($(this).text()));
    });
    
    if (!_waitArray.length) { // Set shortnotes to reception if no other selection made
      _shortNotes += `Reception|`;
    } else {
      _shortNotes += `${_waitArray.join(',')}|`;
    }
    
    let d = { // Create data object
      description: _description,
      dispositionNote: _user,
      shortNotes: _shortNotes,
      address: cleanAddress,
      parcel: cleanParcel,
      contact: _firstName,
      owner: cleanOwner
    };
    
    let sender = { // Obj used to send username & data in single emit
      info: d,
      user: _user
    }

    this.socket.emit('create-record', sender); //send to server
  }
  
  /* Function used to get the record data from the server to update the workflow */
  initializeUpdateWF(_el) {
    let rec = _el.parents('.drop').find('.record-number').text(); //get record number
    this.socket.emit('init-wf', rec); //send it to server
  }
  
  /* Function updates workflow from a given record depending on its shortnotes (check in/check out/route/depart) */
  updateWF(d) {
    let _dept = $('.department-modal .department-select').val();
    let _user = this.cookies.getCookie('username');
    let _initials = _user[0] + _user[1];
    let _sn = this.parseShortNotes(d.shortNotes); // Local variables from object
    let _wfHistory = d.workflowHistory;
    let _id = '#' + d.recordId;
    let _waitList = _sn.waiting,// Generates wait, with & reception varibles
        _withList = _sn.with,
        time = _sn.time;
    let _wait = false,
        _with = false,
        _reception = false;
    // Objects to be populated before function calls to view & server
    let _data = {};

    // Find current stage in workflow
    _with = _withList.indexOf(_dept) >= 0 ? true : false;
    _reception = _waitList.indexOf('Reception') >= 0 ? true : false;
    _wait = _waitList.indexOf(_dept) >= 0 ? true : false;

    // REMEMBER: If this snags it means shortnotes are not generating correctly
    if (_reception) { // Reception WF Task
      let _arr = [];
      let _snString = `${new Date().getTime().toString()}|`; //generate timestamp
      // Set var to object for object functions... probably better way to do this
      let _that = this;
      $(_id).find('.department.active span').each(function() { //grab departments to route to
        _arr.push(_that.fixTSI($(this).text()));
      });
      // Generate shortnotes for sending
      if (!_arr.length) { // send to reception
        _snString += `Reception|`;
      } else {
        _snString += `${_arr.join(',')}|`; // send to selected depts
      }
      
      let _receptTime = $('#' + d.recordId).find('.time-entry').val(); //grab timespent if any
      if (_receptTime == "") _receptTime = "0.01";
      _receptTime = parseFloat(_receptTime).toFixed(2);

      // Generate object for Reception status
      if (_arr.length >= 1 && _arr[0].indexOf('Depart') >= 0) { //reception selected depart
        _data = {
          record: d.recordId,
          user: _user,
          task: _dept,
          status: `Customer Departed`,
          notes: `Customer departed\n\n[${_initials}]`,
          hours: .01
        };
        $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
        $(_id).find('.time-entry').val("");
        $(_id).find('.btn').removeClass('active'); // deactivate buttons
        this.socket.emit('update-workflow', _data); //send to server
      } else { // reroute to selected departments
        _data = {
          record: d.recordId,
          user: _user,
          time: _receptTime,
          shortNotes: _snString,
          comment: $(_id).find('.drop-sub-header textarea').val()
        }
        $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
        $(_id).find('.time-entry').val("");
        $(_id).find('.btn').removeClass('active'); // deactivate buttons
        this.socket.emit('reroute-wf', _data); 
      }
      this.view.setElementIsLoading2($(_id).find('.check-in-btn')); // set button to loader
    } else if (_wait) { // checking in customer
      _data = {
        record: d.recordId,
        user: _user,
        task: _dept,
        status: `Customer Arrived`,
        notes: `Checking In\n\n[${_initials}]`,
        hours: .01
      };

      $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
      $(_id).find('.time-entry').val("");
      this.view.setElementIsLoading2($(_id).find('.check-in-btn')); //set button to loader
      this.socket.emit('update-workflow', _data);
    } else if (_with) { // Check out customer
      let _comment = $(_id).find('.drop-sub-header textarea').val();
      let _timeSpent = $(_id).find('.time-entry').val();
      
      if (_comment == "") { // Displays error if comment is empty
        $(_id).addClass('nope');
        $(_id).find('.drop-sub-header textarea').addClass('err');
        setTimeout(_ => {
          $(_id).removeClass('nope');
          $(_id).find('.check-in-btn').removeClass('loader').html('<i class="fa fa-check" aria-hidden="true"></i> Check Out');
        }, 500);
        return; //cancel action
      }      
      
      if (_timeSpent == "") { // Displays error if time spent is empty
        $(_id).addClass('nope');
        $(_id).find('.time-entry').addClass('err');
        setTimeout(_ => {
          $(_id).removeClass('nope');
          $(_id).find('.check-in-btn').removeClass('loader').html('<i class="fa fa-check" aria-hidden="true"></i> Check Out');
        }, 500);
        return; //cancel action
      }

      _timeSpent = parseFloat(_timeSpent).toFixed(2);
      _data = {
        record: d.recordId,
        user: _user,
        task: _dept,
        status: `Send to Reception`,
        notes: `${_comment}\n\n[${_initials}]`,
        hours: _timeSpent
      }
      // console.log(_data);
      $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
      $(_id).find('.time-entry').val("");
      this.view.setElementIsLoading2($(_id).find('.check-in-btn')); //set button to loader
      this.socket.emit('update-workflow', _data);
    }
  }
  
  /* Function that removes the shake alert classes from the email icon and toggles the email modal */
  emailIconClicked(el) {
    el.removeClass('shake-constant').removeClass('shake-slow').removeClass('shake-constant--hover').removeClass('notification');
    el.find('i').removeClass('notification');
    this.modalHandler('.email-modal');
  }
  /* Function that invokes view to clear the fields in the email modal */
  clearEmailModal(el) {
    this.view.clearEmailModal(el);
  }
  /* Function that validates the email modal */
  emailHandler(data) {
    let el = '.email-modal';
    if (data.isSuccess) {
      this.clearEmailModal($(el));
      this.modalHandler(el);
    } else {
      this.view.inputError(el, '.email-to-list h3, #email-subject, #email-body');
    }
  }
  /* Function that sends values to search user database for email results */
  searchEmail(text){
    if(text.length)
      this.socket.emit('email-search', text);
    else
      this.view.updateEmailSearchResults([]); //remove any results if any
  }
  /* Function that cleans result from objects to strings and invokes the view function to update the list of emails to add in the email modal */
  updateEmailSearchResults(results){
    for(let i=0;i<results.length;i++){
      results[i] = `<span class="email-result-name">${results[i].user_first} ${results[i].user_last}</span> (<span class="email-result-email">${results[i].user_email}</span>)`;
    }
    this.view.updateEmailSearchResults(results);
  }
  /* Function that sets email input fields based on reception routing information. Will auto-populate emails based on department and puts custom email content in email body. */
  setEmailFields(_recordNumber, _firstName, _address, _description) {
    let el = $('.email-modal');
    let subject = `[Tracker] Walk-in ${_recordNumber} is ready to be seen`;
    let body = `Hello,

There is a customer that is waiting to be seen by your department. Please log-in to http://pds/track/ to check them in.  

Record Number: ${_recordNumber}
Customer Name: ${_firstName}
Address:               ${_address}
Description:         ${_description}

Additional Comments:

Thank You,
PDS Reception`;
    this.view.setEmailFields(el, subject, body); // invoke view to update modal
  }
  /* Function adds selected email to recipient list */
  addEmailToRecipientList(el){
    let name = el.next().html(), email = el.next().next().html();
    name = name == 'Permit Specialist Group' ? name.split(" Group")[0] : name.split(" Review Group")[0];
    this.view.clearEmailResults();
    this.view.addEmailToRecipientList(name,email);
  }
  /* Invokes view function to remove selected email from email list */
  removeEmailFromRecipientList(el){
    this.view.removeEmailFromRecipientList(el);
  }
  /* Function grabs data from email and sends to server for sending email */
  sendEmail(el) {
    let modal = $('.email-modal');
    let to = modal.find('.email-to');
    let subject = modal.find('#email-subject').val();
    let body = modal.find('#email-body').val();
    let emails = [];
    for(let i=0;i<to.length;i++){
      if($(to[i]).find('.email-recipient').attr('title') != "N/A")
        emails.push($(to[i]).find('.email-recipient').attr('title'));
    }
    emails = emails.join(";");
    if (emails.length && subject.length && body.length) { // only send email if you have emailTo, subject and body
      //send email
      console.log('Sending email', emails, subject, body);
      this.view.setElementIsLoading2(el);
      let data = { // populate data in object
        to: emails,
        subject: subject,
        html: `<pre>${body}</pre>`
      }
      // this.socket.emit('send-email', data); //send to server, COMMENTED OUT IN SUPP
    } else {
      this.view.inputError('.email-modal', '.email-to-list h3, #email-subject, #email-body'); //show error
    }
  }
  /* Function to invoke view to show the additional departments section on a card */
  showAdditionalDepartments(el) {
    this.view.showAdditionalDepartments(el);
  }
  /* Function to toggle the showing of the standard comments of a user and populate accordingly depending on user */
  toggleStandardComments(_el, _e) {
    let _w = $(window).width();
    let _xOff = _e.pageX + 616 > _w ? _w - 616 : _e.pageX;
    let standardCommentBox = $('.standard-comment-list-wrap');
    let department = decodeURIComponent(this.cookies.getCookie("department"));
    standardCommentBox.toggleClass('open');
    if (standardCommentBox.hasClass('open')) { //open or close
      standardCommentBox.offset({
        top: _e.pageY,
        left: _xOff
      });
      standardCommentBox.find('.associated-record-number').text(_el.parents('.drop').find('.record-number').text());
      $('.standard-comment-list').html('');

      for (let i = 0, l = standardComments[department].length; i < l; i++) { //populate standard comments
        $('.standard-comment-list').append(`<li class="standard-comment-list-item">${standardComments[department][i]}</li>`);
      }
    } else { //close comment list (move off of page)
      setTimeout(_ => {
        standardCommentBox.offset({
          top: -1000,
          left: 0
        });
      }, 500);
    }
  }
  /* Function that pushes the selected standard comment into the comment box */
  chooseStandardComment(_el) {
    let _recordNumber = $('.standard-comment-list-wrap .associated-record-number').text();
    $(`#${_recordNumber} .drop-sub-header textarea`).val(_el.text());
    $('.standard-comment-list-wrap').toggleClass('open');
  }
  /* Easter Egg function that shakes the buckets */
  shakeBuckets() {
      $('.bucket').toggleClass('shake-slow').toggleClass('shake-constant').toggleClass('shake-constant--hover');
  }
  /* Utility Function to get the time from a JS Date. Returns it in pretty string format */
  getTime(date) {
    let h = date.getHours(),
      m = date.getMinutes(),
      s = date.getSeconds(),
      timeOfDay = " AM",
      ret = "";
    if (m < 10) m = "0" + m;
    if (s < 10) s = "0" + s;
    if (h > 12) {
      h = (h - 12).toString()
      timeOfDay = " PM";
    }
    s = ":" + s;
    if (arguments.length == 2) { //exclude seconds
      s = "";
    }
    return h + ":" + m + s + timeOfDay;
  }
  /* Utility Function that returns todays date in pretty string format YYYY-MM-DD */
  getToday() {
    let _today = new Date();
    return `${_today.getFullYear()}-${_today.getMonth() + 1}-${_today.getDate()}`;
  }

  /* Testing function that gets server data when the tracker icon is clicked */
  logoPullData() {
    this.socket.emit('pull-data');
  }
  /* Utility Function invokes view to add class on an element  */
  addClass(el, className) {
    this.view.addClass(el, className);
  }
  /* Utility Function invokes view to remove class from an element  */
  removeClass(el, className) {
    this.view.removeClass(el, className);
  }
  /* Utility function to parse links in the message box */
  parseMessage(message) {
    var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return message.replace(urlRegex, x => `<a href="${x}" target="_blank">${x}</a>`);
  }
  /* Utility Function to clean address array into consumable form by Accela in the create record
    call. */
  cleanAddress(a) {
    let ret = [];
    for (let i in a) {
      let address = a[i];
      ret.push({
        number: address[0],
        direction: address[1],
        name: address[2],
        suffix: address[4],
        city: address[6],
        zip: address[8],
        unit: address[5],
        full_address: `${address[0]} ${address[1]} ${address[2]} ${address[4]}`
      })
    }
    return ret;
  }
  /* Utility Function to clean Parcel array into consumable form by Accela in the create record
    call. */
  cleanParcel(a) {
    let ret = [];
    for (let i in a) {
      let address = a[i];
      //console.log('getting parcel from', address);
      ret.push({
        parcelNumber: address[9]
      })
    }
    return ret;
  }
  /* Utility Function to clean Owner array into consumable form by Accela in the create record
    call. */
  cleanOwner(ownerArray) {
    let ret = [];
    for (let i in ownerArray) {
      let own = ownerArray[i];
      ret.push({
        name: own[0],
        full_address: own[1],
        city: own[2],
        state: own[3],
        zip: own[4]
      })
    }
    return ret;
  }
  /* Utility Function to update the departments to their actual accela workflow task names */
  fixTSI(d) {
    if (d == 'Site') {
      d += ' Development Review';
    } else if (d == 'Residential Building') {
      d = 'Building Residential Review';
    } else if (d == 'Commercial Building') {
      d = 'Building Commercial Review';
    } else if (d == 'Fire') {
      d += ' Protection Review';
    } else if (d != 'Admin' && d != 'Permit Specialist' && d != 'Reception') {
      d += ' Review';
    }
    return d;
  }
  /* Utility Function to capitalize the first character of every word in a given string */
  firstCapString (s) {
    let retString = '';

    if (typeof s != 'undefined' && s != null) {
      let stringArray = s.toString().split(' '); // split on space to get each word

      for(let i = 0, l = stringArray.length; i < l; i++) {
        retString += stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1).toLowerCase() + " ";
      }      
    } 
    return retString.trim();
  }
}