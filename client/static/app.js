'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* This file holds constants for client to lookup icon and standard comments based on the department parameter */

/* constant contains the html strings for all department icons used in Tracker */
var icons = {
  'Reception': '<i class="fa fa-user reception-icon" aria-hidden="true" title="Reception"></i>',
  'Real Property Review': '<i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i>',
  'Building Residential Review': '<i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i>',
  'Building Commercial Review': '<i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i>',
  'Site Development Review': '<i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i>',
  'Land Use Review': '<i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i>',
  'Fire Protection Review': '<i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i>',
  'Traffic Review': '<i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i>',
  'Historic Review': '<i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i>',
  'Permit Specialist': '<i class="fa fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i>',
  'Application Services Review': '<i class="fas fa-id-card-alt" title="Application Services"></i>',
  'Inspections': '<i class="fa fa-eye inspections-icon" aria-hidden="true" title="Inspection"></i>',
  'Unknown': '<i class="fa fa-question-circle unknown-icon" aria-hidden="true" title="Unknown"></i>',
  'wait': '<i class="far fa-clock waiting-icon" aria-hidden="true" title="Waiting For"></i>',
  'with': '<i class="far fa-handshake with-icon" aria-hidden="true" title="Currently With"></i>',
  'Time After WF Closed': '<i class="far fa-question-circle unknown-icon" aria-hidden="true" title="Unknown"></i>'
};
/* constant contains all standard comments used by each department in Tracker */
var standardComments = {
  'Real Property Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Residential Building Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Commercial Building Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Site Development Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Land Use Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Fire Protection Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Traffic Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Historic Review': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Permit Specialist': ['Permit paid for and obtained; customer ready for departure', 'Fees waived and obtained; customer ready for departure', 'No permit obtained; customer ready for departure', 'Additional questions for Real Property', 'Additional questions for Building', 'Additional questions for Site', 'Additional questions for Land Use', 'Additional questions for Fire', 'Additional questions for Traffic', 'Additional questions for Historic'],
  'Reception': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Application Services': ['Ready for Permit Specialist', 'Sending back to Reception', 'Ready for departure'],
  'Admin': ['I know it all. No need for comments', 'Go away']

};
/* Function escapes special characters from a string that cant be pushed to Accela */
var escapeSpecialChars = function escapeSpecialChars(un) {
  return un.replace(/\n/g, '. ').replace(/\'/g, '\\\'').replace(/\&/g, '').replace(/\r/g, '').replace(/\t/g, '    ').replace(/\b/g, '').replace(/\f/g, '');
};
/***************************************************************************
Filename: controller.js
Description: This controller class handles any data manipulation and all connection
to and from the server and connected client. Any actions manipulating the
view will invoke View class functions.
****************************************************************************/

var Controller = function () {
  function Controller(main) {
    _classCallCheck(this, Controller);

    //initialize view and cookies
    this.cookies = main.cookies;
    this.view = main.view;
    this.socket = main.socket;

    /* Set Initial State of page*/
    this.clearChatMessages();
    this.setSocketHandlers();
    // this.drawChart();  wait for next release..
  }

  /* Initialize socket handlers. Calls another controller function to do an action */


  _createClass(Controller, [{
    key: 'setSocketHandlers',
    value: function setSocketHandlers() {
      var _this = this;

      this.socket.on('connect', function () {
        // on connection to server
        console.log('Connected to Server!');
        _this.initSocketConnection();
      });
      this.socket.on('disconnect', function () {
        //disconnecting from server
        console.log('Disconnected from Server!');
        $('.error-message').show();
      });
      this.socket.on('loginresult', function (user) {
        // get login data from server, login user and update cookies if needed
        _this.loginResult(user);
      });
      this.socket.on('logged-in-users', function (users) {
        // get global logged in users from server and update list
        _this.updateLoggedInUsers(users);
      });
      this.socket.on('new-chat-message', function (message) {
        // chat message received, push to chat box
        _this.cleanNewMessage(message);
      });
      this.socket.on('new-activity-message', function (message) {
        // new activity received, update activity log
        //console.log('activity:', message);
        _this.cleanActivity(message);
      });
      this.socket.on('card-data', function (data) {
        // cards received from server, draw/update page
        _this.drawCardData(data);
      });
      this.socket.on('send-email-response', function (data) {
        // email was sent, clean up email modal
        _this.emailHandler(data);
      });
      this.socket.on('email-modal-open', function (data) {
        // email fields received, populate email modal 
        _this.populateEmailModal(data);
      });
      this.socket.on('email-recipients', function (data) {
        // email recipients received, populate email modal with recipients 
        //console.log('email recipients:', data);
        _this.populateEmailRecipients(data);
      });

      this.socket.on('init-wf', function (data) {
        // get individual record from server to send workflow update 
        _this.updateWF(data);
      });
      this.socket.on('update-contact-address', function (data) {
        // update contact and address info for specific card
        _this.updateContactAddress(data);
      });
      this.socket.on('update-workflow-history', function (data) {
        //update workflow history for specific card
        _this.updateWorkflowHistory(data);
      });
      this.socket.on('update-shortnotes', function (data) {
        // updates card based on shortnotes, uses same functions as 'card-data'
        _this.updateShortnotes(data);
      });
      this.socket.on('email-search', function (data) {
        // updates card based on shortnotes, uses same functions as 'card-data'
        _this.updateEmailSearchResults(data);
      });
    }
    /* Hidden function to repopulate server data with Accela data. This is to help reception correct routing issues in shortnotes */

  }, {
    key: 'restartServer',
    value: function restartServer() {
      console.log('requesting restart server...Password required.');
      var pass = prompt("You are requesting a server restart. Please enter the password:");
      if (pass == 'restartMe') {
        // correct password for restart
        $('.reception-bucket').find('.drop').remove();
        $('.review-bucket').find('.drop').remove();
        $('.departed-bucket').find('.drop').remove(); // remove all cards
        this.socket.emit('restart-server', 1); // send process kill command to server
      } else {
        // incorrect
        var tryAgain = confirm('The password you entered is incorrect. Try again?...');
        if (tryAgain) this.restartServer(); // recursive call to try again
      }
    }
    /* Function populates the email modal with a standard template for sending the iteam some feedback about Tracker */

  }, {
    key: 'sendIteamFeedback',
    value: function sendIteamFeedback() {
      var el = $('.email-modal');
      var user = this.cookies.getCookie("userFullName"); // get name of user sending the feedback
      var body = "Hello,\n\nI have some feedback on Tracker I would like to share.\n\nFeedback: *Insert your feedback here*\n\nThanks,\n" + user;

      $('.info-modal').removeClass('open'); //close the info modal and open the email modal
      el.addClass('open');

      this.view.setEmailFields(el, '[Tracker] I have feedback to share', body); // invoke view to update email modal 
    }
    /* Function invokes view to update logged in user list */

  }, {
    key: 'updateLoggedInUsers',
    value: function updateLoggedInUsers(users) {
      this.view.updateLoggedInUsers(users);
    }

    /* function updates the contact and address of a record that already exists in the client */

  }, {
    key: 'updateContactAddress',
    value: function updateContactAddress(data) {
      this.view.updateContactAddress(data);
    }
    /* function updates the workflow history of a record that already exists in the client */

  }, {
    key: 'updateWorkflowHistory',
    value: function updateWorkflowHistory(data) {
      this.view.updateWorkflowHistory(data);
    }
    /* function calls drawCard to update specific card on page. */

  }, {
    key: 'updateShortnotes',
    value: function updateShortnotes(data) {
      //console.log('updateShortnotes was fired!');
      this.drawCardData(data);
    }
    /* Function cleans data and populates the email modal window with relevant data about new customer */

  }, {
    key: 'populateEmailModal',
    value: function populateEmailModal(data) {
      var shortNotes = this.parseShortNotes(data.shortNotes);
      var _name = data.contact[0].firstName;
      var _address = '';
      if (typeof data.addresses != 'undefined') _address = data.addresses.length ? data.addresses[0].streetAddress : 'No Address Given';

      this.setEmailFields(data.recordId, _name, _address, data.description); //populate email
      $('.email-icon').addClass('shake-slow').addClass('shake-constant').addClass('shake-constant--hover'); //shakes email icon to notify reception that the data has been populated
      $('.email-icon i').addClass('notification'); // flashes the icon red to notify user
    }
    /* Function cleans data and populates the email modal window with relevant data about new customer */

  }, {
    key: 'populateEmailRecipients',
    value: function populateEmailRecipients(data) {
      var recipients = data.recipients;
      for (var i = 0; i < recipients.length; i++) {
        //console.log('email', i);
        var cleanName = recipients[i].name.split(" Review")[0];
        this.view.addEmailToRecipientList(cleanName, recipients[i].email);
      }
    }
    /* card data was received from server, need to parse and
      invoke draw functions from view */

  }, {
    key: 'drawCardData',
    value: function drawCardData(data) {
      var cardData = {};
      var recordNumber = data.recordId;
      var shortNotes = this.parseShortNotes(data.shortNotes);
      cardData.recordNumber = recordNumber;
      cardData.shortNotes = shortNotes;
      cardData.description = data.description;
      cardData.customerName = [];

      if (data.contact) {
        //clean contact data
        for (var k = 0; k < data.contact.length; k++) {
          cardData.customerName.push(data.contact[k].firstName);
        }
      }

      if (cardData.customerName.length == 0) {
        //add default if no name found
        cardData.customerName.push("[No Customer Name]");
      }
      cardData.address = [];
      if (data.addresses) {
        //clean addresses
        for (var j = 0; j < data.addresses.length; j++) {
          cardData.address.push(this.firstCapString(data.addresses[j].streetAddress));
        }
      }
      if (cardData.address.length == 0) {
        //default
        cardData.address.push("No Address");
      }
      cardData.parcels = [];
      if (data.parcels) {
        for (var _j = 0; _j < data.parcels.length; _j++) {
          cardData.parcels.push(data.parcels[_j].parcelNumber);
        }
      }
      cardData.workflowHistory = data.workflowHistory;
      cardData.user = this.cookies.getCookie('username');
      // Checks if card exists on page
      var _id = '#' + recordNumber;
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

  }, {
    key: 'toggleNewCardAddress',
    value: function toggleNewCardAddress(el) {
      this.view.toggleNewCardAddress(el);
    }
    /* Function invokes view to reset the address fields on a new card */

  }, {
    key: 'resetNewCardAddress',
    value: function resetNewCardAddress(el) {
      this.view.resetNewCardAddress(el);
    }
    /* Function invokes view to add new form for additional address entry */

  }, {
    key: 'addNewCardAddressForm',
    value: function addNewCardAddressForm(el) {
      this.view.addNewCardAddressForm(el);
    }
    /* Function invokes view to clear address form on a new card entry */

  }, {
    key: 'clearAddressSelection',
    value: function clearAddressSelection(_el) {
      this.view.clearAddressSelection(_el);
    }
    /* Function invokes view to show or hide the departed column. Shows chat column or departed */

  }, {
    key: 'toggleDepartedColumn',
    value: function toggleDepartedColumn() {
      this.view.toggleDepartedColumn();
    }
    /* Function parses string version of shortnotes to shortnotes object for easier consumption  */

  }, {
    key: 'parseShortNotes',
    value: function parseShortNotes(shortNotes) {
      var d = {};
      shortNotes = shortNotes.split("|"); // split into [ timestamp, waiting for department array, with department array]

      if (shortNotes.length == 1) {
        // shortnotes is 'Departed'
        d.type = 'departed';
      } else if (shortNotes.length == 3) {
        // valid shortnote
        d.time = shortNotes[0];
        d.waiting = shortNotes[1].split(",");
        d.with = shortNotes[2].split(",");
        d.waiting.indexOf('Reception') >= 0 ? d.type = 'reception' : d.type = 'review';
      }
      return d;
    }
    /* Function  validates new card form to make sure all required data is entered before sending to server */

  }, {
    key: 'validateAndCreateNewCard',
    value: function validateAndCreateNewCard(_el) {
      var card = _el.parents('.drop');
      var _tmpHTML = card.html();
      var _firstName = escapeSpecialChars(card.find('.customer-name').val());
      _firstName = _firstName.slice(0, 1).toUpperCase() + _firstName.slice(1); // make sure its caps when created
      var _description = card.find('.record-description').val();

      if (_firstName.length && _description.length) {
        // has minimum information for a record
        this.view.setElementIsLoading(_el); // set loader and remove drop from page until server pushes new card
        this.createRecord(card); // sends card to server for creation
      } else {
        //something wasnt filled out, reset card and show error
        this.view.setHtml(card, _tmpHTML);
        this.view.addErrorClass(card.find('.customer-name'));
        this.view.addErrorClass(card.find('.record-description'));
      }
    }
    /* Function invokes view to open the given element (card) */

  }, {
    key: 'openElement',
    value: function openElement(_el) {
      this.view.openElement(_el);
    }
    /* Function invokes view to create a new card form to fill out */

  }, {
    key: 'createNewCardElement',
    value: function createNewCardElement() {
      this.view.createNewCardElement();
    }
    /* Function invokes view to remove the given 'new card' from the page */

  }, {
    key: 'deleteNewCardElement',
    value: function deleteNewCardElement(_el) {
      this.view.deleteNewCardElement(_el);
    }
    /* Function gets current time and invokes the view to reset the chatbox */

  }, {
    key: 'clearChatMessages',
    value: function clearChatMessages() {
      var currentTime = this.getTime(new Date());
      this.view.clearChatMessages(currentTime);
    }
    /* Function cleans new message received from server and invokes view to send to chatbox */

  }, {
    key: 'cleanNewMessage',
    value: function cleanNewMessage(message) {
      var smartMessage = this.parseMessage(message.message); // enables hyperlinks
      var time = this.getTime(new Date(), false);
      var user = message.name;
      var dept = message.dept.split(" ")[0].toLowerCase();

      this.view.addNewMessage(smartMessage, time, user, dept);
    }
    /* Function cleans activity message and invokes view function to add to activty log */

  }, {
    key: 'cleanActivity',
    value: function cleanActivity(message) {
      var time = this.getTime(new Date(), false);
      var dept = message.dept.split(" ")[0].toLowerCase();

      this.view.addActivity(message.message, time, dept);
    }
    /* Function sends new message to server for distribution */

  }, {
    key: 'sendNewMessage',
    value: function sendNewMessage(message) {
      var d = this.cookies.getCookie("department");
      var chatMessage = {};

      if (d) d = d.split(" ")[0];

      if (message.length == 0) {
        this.view.addErrorClass($('#chat-message-box'));
        return;
      }

      chatMessage = {
        name: '' + this.cookies.getCookie("userFullName"),
        message: '' + message,
        dept: d
      };

      this.socket.emit('new-chat-message', chatMessage); //send to server
      this.view.resetChatBox(); // reset the text entry field for the chat you just sent
    }
    /* Function sends activity message to server for distribution */

  }, {
    key: 'sendActivity',
    value: function sendActivity(message) {
      //console.log('sending activity', message);
      this.socket.emit('new-activity-message', message);
    }
    /* Function invokes view to collapse/open the accordion style menus in the information modal */

  }, {
    key: 'toggleAccordion',
    value: function toggleAccordion(_el) {
      this.view.toggleAccordion(_el);
    }
    /* Function initiates all cookies on page load when socket connection is established. Auto-login if user cookie is found */

  }, {
    key: 'initSocketConnection',
    value: function initSocketConnection() {
      var user = this.cookies.getCookie("username");

      if (user != null) {
        this.cookies.setCookie("loginFromCookies", "Y"); // user cookie was found, login using that cookie
        this.validateLogin(user); //validates user
      } else {
        this.cookies.setCookie("loginFromCookies", "N");
      }
    }
    /* Function takes login result from server and stores data in browser cookies. If not found, invokes view to return an error */

  }, {
    key: 'loginResult',
    value: function loginResult(result) {
      if (result != null && result.length != 0) {
        // if server gave back a user
        var user = result[0];
        var userFullName = user.user_first + ' ' + user.user_last;
        var dept = user.user_dept;

        if (dept.split(",").length > 1) {
          // if user belongs to more than one department, parse and validate
          dept = dept.split(",");
          for (var i in dept) {
            if (dept[i] == "Site") dept[i] = "Site Development Review";
            // else if (dept[i] == "Building") dept[i] = "Building Review";
            else if (dept[i] == "LandUse") dept[i] = "Land Use Review";else if (dept[i] == "Inspections") dept[i] = "";
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
          message: userFullName + ' logged in...',
          dept: this.cookies.getCookie("department") });
        this.socket.emit('pull-data'); // get data from server
      } else {
        console.log("user not found :'(...");
        this.view.inputError('.login-modal', "#un"); //couldnt find user, return error
      }
    }
    /* Function emits login username to server to verify its a valid user */

  }, {
    key: 'validateLogin',
    value: function validateLogin(username) {
      this.socket.emit('login', username);
    }
    /* Function that fires on the click of the login/logout header button. If already logged in, log out and vice versa */

  }, {
    key: 'loginButtonClick',
    value: function loginButtonClick() {
      var isLoggedIn = !$('body').hasClass('not-logged-in');

      if (isLoggedIn) {
        // need to log out instead
        var username = this.cookies.getCookie('username');
        var userFullName = this.cookies.getCookie('userFullName');
        var dept = this.cookies.getCookie('department');
        this.cookies.resetCookie("username", "userFullName", "department", "loginFromCookies"); //reset all cookies
        this.view.logout(); // remove data from page
        this.sendActivity({
          message: userFullName + ' logged out...',
          dept: dept });
        this.socket.emit("logout", username); //log out from server
        $('.login-modal-opener').attr('data-tooltip-text', 'Log In');
      } else {
        this.modalHandler('.login-modal'); // need to log in, so open modal to enter username
      }
      $('#un').focus();
    }
    /* function that invokes view modal opener function */

  }, {
    key: 'modalHandler',
    value: function modalHandler(modal) {
      this.view.modalHandler(modal);
    }
    /* function sets current dept and invokes dept change view function to update page with correct icons and views */

  }, {
    key: 'departmentChange',
    value: function departmentChange() {
      var currentDepartment = $('.department-modal .department-select').val();
      var icon = icons[currentDepartment];
      if (currentDepartment == 'Reception') {
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

  }, {
    key: 'selectRoutingDepartment',
    value: function selectRoutingDepartment(_el) {
      this.view.selectRoutingDepartment(_el);
    }

    /* Function gets departments the user wants to activate mid */

  }, {
    key: 'activateDepartmentInCycle',
    value: function activateDepartmentInCycle(_el) {
      var tasks = _el.siblings('.active'); // first get all task to be activated in 'activate departments class'
      var tArray = [];

      if (!tasks.length) {
        console.log('No tasks selected to activate. Cancelling action...');
        return;
      }
      for (var i = 0; i < tasks.length; i++) {
        // populate array of tasknames
        tArray.push($(tasks[i]).find('span').text());
      }
      tasks = tArray.join(); // string version of array for Accela to consume


      var recordNumber = _el.parents('.drop').find('.record-number').text();
      var _user = this.cookies.getCookie('username'); // Grabs username with cookies & finds Initials
      var _initials = _user[0] + _user[1];

      var _data = { // initialize data object for wf call
        record: recordNumber,
        user: _user,
        task: 'Reception',
        status: 'Activate',
        notes: 'Activate ' + tasks,
        hours: 0
      };
      // console.log(_data);
      // then send to server to make workflow call
      this.view.setElementIsLoading2(_el); // update button
      this.socket.emit('update-workflow', _data);
    }

    /* Function cleans data for creating a new card to send to server */

  }, {
    key: 'createRecord',
    value: function createRecord(el) {
      var _user = this.cookies.getCookie('username');
      var _tmpHTML = el.html(); // Grab drop elements
      var _firstName = escapeSpecialChars(el.find('.customer-name').val()); // Basic required information
      var _description = el.find('.record-description').val();
      var _addressArray = [];
      var addresses = el.find('.selected-address');

      for (var i = 0; i < addresses.length; i++) {
        // get all addresses entered on card
        var t = addresses[i];
        if ($(t).text()) {
          var val = $(t).find('.address-array').text().split("|");
          _addressArray.push(val);
        }
      }

      var cleanAddress = this.cleanAddress(_addressArray); // Cleans parcel & address for Accela delivery
      var cleanParcel = this.cleanParcel(_addressArray);

      var _ownerArray = [];
      var owners = el.find('.address-drop-area');
      for (var _i = 0; _i < owners.length; _i++) {
        // Finds Owner based on address input
        var _t2 = owners[_i];
        if ($(_t2).find('.owner-array').text()) {
          var _val = $(_t2).find('.owner-array').text().split("|");
          _ownerArray.push(_val);
        }
      }

      var cleanOwner = this.cleanOwner(_ownerArray); // clean owner data
      var _waitArray = [];
      var _shortNotes = new Date().getTime().toString() + '|';
      var _that = this;

      el.find('.department.active span').each(function () {
        // get all the selected departments to route to
        _waitArray.push(_that.fixTSI($(this).text()));
      });

      if (!_waitArray.length) {
        // Set shortnotes to reception if no other selection made
        _shortNotes += 'Reception|';
      } else {
        _shortNotes += _waitArray.join(',') + '|';
      }

      var d = { // Create data object
        description: _description,
        dispositionNote: _user,
        shortNotes: _shortNotes,
        address: cleanAddress,
        parcel: cleanParcel,
        contact: _firstName,
        owner: cleanOwner
      };

      var sender = { // Obj used to send username & data in single emit
        info: d,
        user: _user
      };

      this.socket.emit('create-record', sender); //send to server
    }

    /* Function used to get the record data from the server to update the workflow */

  }, {
    key: 'initializeUpdateWF',
    value: function initializeUpdateWF(_el) {
      var rec = _el.parents('.drop').find('.record-number').text(); //get record number
      this.socket.emit('init-wf', rec); //send it to server
    }

    /* Function updates workflow from a given record depending on its shortnotes (check in/check out/route/depart) */

  }, {
    key: 'updateWF',
    value: function updateWF(d) {
      var _dept = $('.department-modal .department-select').val();
      var _user = this.cookies.getCookie('username');
      var _initials = _user[0] + _user[1];
      var _sn = this.parseShortNotes(d.shortNotes); // Local variables from object
      var _wfHistory = d.workflowHistory;
      var _id = '#' + d.recordId;
      var _waitList = _sn.waiting,
          // Generates wait, with & reception varibles
      _withList = _sn.with,
          time = _sn.time;
      var _wait = false,
          _with = false,
          _reception = false;
      // Objects to be populated before function calls to view & server
      var _data = {};

      // Find current stage in workflow
      _with = _withList.indexOf(_dept) >= 0 ? true : false;
      _reception = _waitList.indexOf('Reception') >= 0 ? true : false;
      _wait = _waitList.indexOf(_dept) >= 0 ? true : false;

      // REMEMBER: If this snags it means shortnotes are not generating correctly
      if (_reception) {
        // Reception WF Task
        var _arr = [];
        var _snString = new Date().getTime().toString() + '|'; //generate timestamp
        // Set var to object for object functions... probably better way to do this
        var _that = this;
        $(_id).find('.department.active span').each(function () {
          //grab departments to route to
          _arr.push(_that.fixTSI($(this).text()));
        });
        // Generate shortnotes for sending
        if (!_arr.length) {
          // send to reception
          _snString += 'Reception|';
        } else {
          _snString += _arr.join(',') + '|'; // send to selected depts
        }

        var _receptTime = $('#' + d.recordId).find('.time-entry').val(); //grab timespent if any
        if (_receptTime == "") _receptTime = "0.01";
        _receptTime = parseFloat(_receptTime).toFixed(2);

        // Generate object for Reception status
        if (_arr.length >= 1 && _arr[0].indexOf('Depart') >= 0) {
          //reception selected depart
          _data = {
            record: d.recordId,
            user: _user,
            task: _dept,
            status: 'Customer Departed',
            notes: 'Customer departed\n\n[' + _initials + ']',
            hours: .01
          };
          $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
          $(_id).find('.time-entry').val("");
          $(_id).find('.btn').removeClass('active'); // deactivate buttons
          this.socket.emit('update-workflow', _data); //send to server
        } else {
          // reroute to selected departments
          _data = {
            record: d.recordId,
            user: _user,
            time: _receptTime,
            shortNotes: _snString,
            comment: $(_id).find('.drop-sub-header textarea').val()
          };
          $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
          $(_id).find('.time-entry').val("");
          $(_id).find('.btn').removeClass('active'); // deactivate buttons
          this.socket.emit('reroute-wf', _data);
        }
        this.view.setElementIsLoading2($(_id).find('.check-in-btn')); // set button to loader
      } else if (_wait) {
        // checking in customer
        _data = {
          record: d.recordId,
          user: _user,
          task: _dept,
          status: 'Customer Arrived',
          notes: 'Checking In\n\n[' + _initials + ']',
          hours: .01
        };

        $(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
        $(_id).find('.time-entry').val("");
        this.view.setElementIsLoading2($(_id).find('.check-in-btn')); //set button to loader
        this.socket.emit('update-workflow', _data);
      } else if (_with) {
        // Check out customer
        var _comment = $(_id).find('.drop-sub-header textarea').val();
        var _timeSpent = $(_id).find('.time-entry').val();

        if (_comment == "") {
          // Displays error if comment is empty
          $(_id).addClass('nope');
          $(_id).find('.drop-sub-header textarea').addClass('err');
          setTimeout(function (_) {
            $(_id).removeClass('nope');
            $(_id).find('.check-in-btn').removeClass('loader').html('<i class="fa fa-check" aria-hidden="true"></i> Check Out');
          }, 500);
          return; //cancel action
        }

        if (_timeSpent == "") {
          // Displays error if time spent is empty
          $(_id).addClass('nope');
          $(_id).find('.time-entry').addClass('err');
          setTimeout(function (_) {
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
          status: 'Send to Reception',
          notes: _comment + '\n\n[' + _initials + ']',
          hours: _timeSpent
          // console.log(_data);
        };$(_id).find('.drop-sub-header textarea').val(""); //reset comment and time fields
        $(_id).find('.time-entry').val("");
        this.view.setElementIsLoading2($(_id).find('.check-in-btn')); //set button to loader
        this.socket.emit('update-workflow', _data);
      }
    }

    /* Function that removes the shake alert classes from the email icon and toggles the email modal */

  }, {
    key: 'emailIconClicked',
    value: function emailIconClicked(el) {
      el.removeClass('shake-constant').removeClass('shake-slow').removeClass('shake-constant--hover').removeClass('notification');
      el.find('i').removeClass('notification');
      this.modalHandler('.email-modal');
    }
    /* Function that invokes view to clear the fields in the email modal */

  }, {
    key: 'clearEmailModal',
    value: function clearEmailModal(el) {
      this.view.clearEmailModal(el);
    }
    /* Function that validates the email modal */

  }, {
    key: 'emailHandler',
    value: function emailHandler(data) {
      var el = '.email-modal';
      if (data.isSuccess) {
        this.clearEmailModal($(el));
        this.modalHandler(el);
      } else {
        this.view.inputError(el, '.email-to-list h3, #email-subject, #email-body');
      }
    }
    /* Function that sends values to search user database for email results */

  }, {
    key: 'searchEmail',
    value: function searchEmail(text) {
      if (text.length) this.socket.emit('email-search', text);else this.view.updateEmailSearchResults([]); //remove any results if any
    }
    /* Function that cleans result from objects to strings and invokes the view function to update the list of emails to add in the email modal */

  }, {
    key: 'updateEmailSearchResults',
    value: function updateEmailSearchResults(results) {
      for (var i = 0; i < results.length; i++) {
        results[i] = '<span class="email-result-name">' + results[i].user_first + ' ' + results[i].user_last + '</span> (<span class="email-result-email">' + results[i].user_email + '</span>)';
      }
      this.view.updateEmailSearchResults(results);
    }
    /* Function that sets email input fields based on reception routing information. Will auto-populate emails based on department and puts custom email content in email body. */

  }, {
    key: 'setEmailFields',
    value: function setEmailFields(_recordNumber, _firstName, _address, _description) {
      var el = $('.email-modal');
      var subject = '[Tracker] Walk-in ' + _recordNumber + ' is ready to be seen';
      var body = 'Hello,\n\nThere is a customer that is waiting to be seen by your department. Please log-in to http://pds/track/ to check them in.  \n\nRecord Number: ' + _recordNumber + '\nCustomer Name: ' + _firstName + '\nAddress:               ' + _address + '\nDescription:         ' + _description + '\n\nAdditional Comments:\n\nThank You,\nPDS Reception';
      this.view.setEmailFields(el, subject, body); // invoke view to update modal
    }
    /* Function adds selected email to recipient list */

  }, {
    key: 'addEmailToRecipientList',
    value: function addEmailToRecipientList(el) {
      var name = el.next().html(),
          email = el.next().next().html();
      name = name == 'Permit Specialist Group' ? name.split(" Group")[0] : name.split(" Review Group")[0];
      this.view.clearEmailResults();
      this.view.addEmailToRecipientList(name, email);
    }
    /* Invokes view function to remove selected email from email list */

  }, {
    key: 'removeEmailFromRecipientList',
    value: function removeEmailFromRecipientList(el) {
      this.view.removeEmailFromRecipientList(el);
    }
    /* Function grabs data from email and sends to server for sending email */

  }, {
    key: 'sendEmail',
    value: function sendEmail(el) {
      var modal = $('.email-modal');
      var to = modal.find('.email-to');
      var subject = modal.find('#email-subject').val();
      var body = modal.find('#email-body').val();
      var emails = [];
      for (var i = 0; i < to.length; i++) {
        if ($(to[i]).find('.email-recipient').attr('title') != "N/A") emails.push($(to[i]).find('.email-recipient').attr('title'));
      }
      emails = emails.join(";");
      if (emails.length && subject.length && body.length) {
        // only send email if you have emailTo, subject and body
        //send email
        console.log('Sending email', emails, subject, body);
        this.view.setElementIsLoading2(el);
        var data = { // populate data in object
          to: emails,
          subject: subject,
          html: '<pre>' + body + '</pre>'
          // this.socket.emit('send-email', data); //send to server, COMMENTED OUT IN SUPP
        };
      } else {
        this.view.inputError('.email-modal', '.email-to-list h3, #email-subject, #email-body'); //show error
      }
    }
    /* Function to invoke view to show the additional departments section on a card */

  }, {
    key: 'showAdditionalDepartments',
    value: function showAdditionalDepartments(el) {
      this.view.showAdditionalDepartments(el);
    }
    /* Function to toggle the showing of the standard comments of a user and populate accordingly depending on user */

  }, {
    key: 'toggleStandardComments',
    value: function toggleStandardComments(_el, _e) {
      var _w = $(window).width();
      var _xOff = _e.pageX + 616 > _w ? _w - 616 : _e.pageX;
      var standardCommentBox = $('.standard-comment-list-wrap');
      var department = decodeURIComponent(this.cookies.getCookie("department"));
      standardCommentBox.toggleClass('open');
      if (standardCommentBox.hasClass('open')) {
        //open or close
        standardCommentBox.offset({
          top: _e.pageY,
          left: _xOff
        });
        standardCommentBox.find('.associated-record-number').text(_el.parents('.drop').find('.record-number').text());
        $('.standard-comment-list').html('');

        for (var i = 0, l = standardComments[department].length; i < l; i++) {
          //populate standard comments
          $('.standard-comment-list').append('<li class="standard-comment-list-item">' + standardComments[department][i] + '</li>');
        }
      } else {
        //close comment list (move off of page)
        setTimeout(function (_) {
          standardCommentBox.offset({
            top: -1000,
            left: 0
          });
        }, 500);
      }
    }
    /* Function that pushes the selected standard comment into the comment box */

  }, {
    key: 'chooseStandardComment',
    value: function chooseStandardComment(_el) {
      var _recordNumber = $('.standard-comment-list-wrap .associated-record-number').text();
      $('#' + _recordNumber + ' .drop-sub-header textarea').val(_el.text());
      $('.standard-comment-list-wrap').toggleClass('open');
    }
    /* Easter Egg function that shakes the buckets */

  }, {
    key: 'shakeBuckets',
    value: function shakeBuckets() {
      $('.bucket').toggleClass('shake-slow').toggleClass('shake-constant').toggleClass('shake-constant--hover');
    }
    /* Utility Function to get the time from a JS Date. Returns it in pretty string format */

  }, {
    key: 'getTime',
    value: function getTime(date) {
      var h = date.getHours(),
          m = date.getMinutes(),
          s = date.getSeconds(),
          timeOfDay = " AM",
          ret = "";
      if (m < 10) m = "0" + m;
      if (s < 10) s = "0" + s;
      if (h > 12) {
        h = (h - 12).toString();
        timeOfDay = " PM";
      }
      s = ":" + s;
      if (arguments.length == 2) {
        //exclude seconds
        s = "";
      }
      return h + ":" + m + s + timeOfDay;
    }
    /* Utility Function that returns todays date in pretty string format YYYY-MM-DD */

  }, {
    key: 'getToday',
    value: function getToday() {
      var _today = new Date();
      return _today.getFullYear() + '-' + (_today.getMonth() + 1) + '-' + _today.getDate();
    }

    /* Testing function that gets server data when the tracker icon is clicked */

  }, {
    key: 'logoPullData',
    value: function logoPullData() {
      this.socket.emit('pull-data');
    }
    /* Utility Function invokes view to add class on an element  */

  }, {
    key: 'addClass',
    value: function addClass(el, className) {
      this.view.addClass(el, className);
    }
    /* Utility Function invokes view to remove class from an element  */

  }, {
    key: 'removeClass',
    value: function removeClass(el, className) {
      this.view.removeClass(el, className);
    }
    /* Utility function to parse links in the message box */

  }, {
    key: 'parseMessage',
    value: function parseMessage(message) {
      var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
      return message.replace(urlRegex, function (x) {
        return '<a href="' + x + '" target="_blank">' + x + '</a>';
      });
    }
    /* Utility Function to clean address array into consumable form by Accela in the create record
      call. */

  }, {
    key: 'cleanAddress',
    value: function cleanAddress(a) {
      var ret = [];
      for (var i in a) {
        var address = a[i];
        ret.push({
          number: address[0],
          direction: address[1],
          name: address[2],
          suffix: address[4],
          city: address[6],
          zip: address[8],
          unit: address[5],
          full_address: address[0] + ' ' + address[1] + ' ' + address[2] + ' ' + address[4]
        });
      }
      return ret;
    }
    /* Utility Function to clean Parcel array into consumable form by Accela in the create record
      call. */

  }, {
    key: 'cleanParcel',
    value: function cleanParcel(a) {
      var ret = [];
      for (var i in a) {
        var address = a[i];
        //console.log('getting parcel from', address);
        ret.push({
          parcelNumber: address[9]
        });
      }
      return ret;
    }
    /* Utility Function to clean Owner array into consumable form by Accela in the create record
      call. */

  }, {
    key: 'cleanOwner',
    value: function cleanOwner(ownerArray) {
      var ret = [];
      for (var i in ownerArray) {
        var own = ownerArray[i];
        ret.push({
          name: own[0],
          full_address: own[1],
          city: own[2],
          state: own[3],
          zip: own[4]
        });
      }
      return ret;
    }
    /* Utility Function to update the departments to their actual accela workflow task names */

  }, {
    key: 'fixTSI',
    value: function fixTSI(d) {
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

  }, {
    key: 'firstCapString',
    value: function firstCapString(s) {
      var retString = '';

      if (typeof s != 'undefined' && s != null) {
        var stringArray = s.toString().split(' '); // split on space to get each word

        for (var i = 0, l = stringArray.length; i < l; i++) {
          retString += stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1).toLowerCase() + " ";
        }
      }
      return retString.trim();
    }
  }]);

  return Controller;
}();
/***************************************************************************
Filename: cookie.js
Description: This file holds methods for updating the browser cookies used 
by the controller.
****************************************************************************/


var Cookies = function () {
  function Cookies() {
    _classCallCheck(this, Cookies);

    this.username = "";
    this.path = "/";
  }
  /* Function replaces encoded space characters with real space value */


  _createClass(Cookies, [{
    key: '_spaceReplace',
    value: function _spaceReplace(_str) {
      // if cookie contains a space, encode it
      if (typeof _str != 'undefined') return _str.split('%20').join(' ');else return _str;
    }
    /* Function grabs cookie from browser with give identifier */

  }, {
    key: 'getCookie',
    value: function getCookie(key) {
      var cookieVal = void 0;
      var cookies = document.cookie.split(";");
      for (var i in cookies) {
        cookieVal = cookies[i].split("=");
        if (cookieVal && cookieVal[0].includes(key)) {
          return this._spaceReplace(cookieVal[1]);
        }
      }
      return null;
    }
    /* Function sets cookie in the browser */

  }, {
    key: 'setCookie',
    value: function setCookie(cookieName, cookieVal) {
      document.cookie = encodeURIComponent(cookieName) + '=' + encodeURIComponent(cookieVal) + ';path=' + this.path;
    }
    /* Function resets cookie values, essentially deleting them */

  }, {
    key: 'resetCookie',
    value: function resetCookie(key) {
      for (var i in arguments) {
        document.cookie = arguments[i] + '=; Path=' + this.path + ';expires=Thu, 01 Jan 1970 00:00:00 GMT;';
      }
    }
  }]);

  return Cookies;
}();
/***********************************
Filename: deadFunctions.js
Description: This file serves as a
graveyard for old, duplicate code
that may or may not be useful later.
**********************************/


var dead = function () {
  function dead() {
    _classCallCheck(this, dead);
  }

  _createClass(dead, [{
    key: '_makeInitials',
    value: function _makeInitials(_name) {
      if ((typeof _name === 'undefined' ? 'undefined' : _typeof(_name)) !== undefined) {
        var _words = _name.toString().split(' ');
        var _initials = '';
        for (var i = 0, l = _words.length; i < l; i++) {
          _initials += _words[i].charAt(0).toUpperCase();
        }
        return _initials;
      }
      return false;
    }
  }, {
    key: '_autoRefreshIntervalTime',
    value: function _autoRefreshIntervalTime() {
      var _ideal = 30000 - this._currentAvgLoadTime;
      if (_ideal > 1000) return _ideal;
      return 1000;
    }
  }, {
    key: 'getRecords',
    value: function getRecords() {
      var _dateToRun = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this._today;
    }
  }, {
    key: '_calculateAvgLoadTime',
    value: function _calculateAvgLoadTime(_newTime) {
      this._timesLoaded++;
      return (this._currentAvgLoadTime * this._timesLoaded + _newTime) / this._timesLoaded;
    }

    // Gets all record data based off card info

  }, {
    key: 'getRecordObj',
    value: function getRecordObj(rec) {
      this.socket.emit('get-data', rec);
    }
  }, {
    key: 'fixTSI',
    value: function fixTSI(d) {
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

    /* function changes the query date to view history from calendar option. Changes view
        and sends action to server. */

  }, {
    key: 'changeQueryDate',
    value: function changeQueryDate(_el) {
      var _now = new Date();
      var _inputDateArray = _el.val().split('-');
      var _targetDate = new Date(_inputDateArray[1] + '/' + _inputDateArray[2] + '/' + _inputDateArray[0]);
      _now = getDateInMilliseconds(_now);
      _targetDate = getDateInMilliseconds(_targetDate);
      if (_targetDate < _now) {
        this.getRecords(_el.val());
        this.modalHandler('.modal');
        this.view.swapViewType(true);
      } else if (_targetDate == _now) {
        this.getRecords();
        this.modalHandler('.modal');
        this.view.swapViewType(false);
      } else {
        this.view.addErrorClass(_el);
      }
    }

    /* helper function to reset time from date object and return epoch time for date
        comparison. */

  }, {
    key: 'getDateInMilliseconds',
    value: function getDateInMilliseconds(date) {
      date.setHours(0);
      date.setMinutes(0);
      date.setSeconds(0);
      date.setUTCMilliseconds(0);
      return date.getTime();
    }

    /* Gets workflow history from server*/

  }, {
    key: 'getWorkflowHistory',
    value: function getWorkflowHistory(_el) {
      // if(_el.parents('.drop').hasClass('open')) this.socket.emit('get-workflow-history', _el.text()); 
    }
  }, {
    key: 'compareArrays',
    value: function compareArrays(array1, array2) {
      console.log('comparing arrays:');
      console.log('a1:', array1);
      console.log('a2:', array2);
      if (array2.length - array1.length != 0) return false;
      for (var i = 0; i < array1.length; i++) {
        if (array1[i] != array2[i]) return false;
      }
      return true;
    }
  }, {
    key: 'drawChart',
    value: function drawChart() {
      var ctx = document.getElementById("stat-chart").getContext('2d');
      var myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ["8/1", "8/2", "8/3", "8/4", "8/5", "8/6"],
          datasets: [{
            label: 'Goal',
            data: [10, 10, 10, 10, 10, 10],
            // backgroundColor: [
            //     'rgba(255, 99, 132, 0.2)',
            //     'rgba(54, 162, 235, 0.2)',
            //     'rgba(255, 206, 86, 0.2)',
            //     'rgba(75, 192, 192, 0.2)',
            //     'rgba(153, 102, 255, 0.2)',
            //     'rgba(255, 159, 64, 0.2)'
            // ],
            borderColor: ['rgba(255, 159, 64, 1)'],
            fill: false,
            borderWidth: 1
          }, {
            label: 'Average Time Spent In Office',
            data: [12, 19, 3, 5, 2, 3],
            // backgroundColor: [
            //     'rgba(255, 99, 132, 0.2)',
            //     'rgba(54, 162, 235, 0.2)',
            //     'rgba(255, 206, 86, 0.2)',
            //     'rgba(75, 192, 192, 0.2)',
            //     'rgba(153, 102, 255, 0.2)',
            //     'rgba(255, 159, 64, 0.2)'
            // ],
            borderColor: ['rgba(255,99,132,1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
            fill: false,
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  }, {
    key: 'addLoader',
    value: function addLoader(_el) {
      _el.addClass('loader').html('<i class="fa fa-circle" aria-hidden="true"></i>');
      setTimeout(function () {
        _el.removeClass('loader').html('<i class="fa fa-check" aria-hidden="true"></i>');
      }, 500);
    }
  }, {
    key: 'removeStandardComments',
    value: function removeStandardComments() {
      $('.standard-comment-list-wrap').removeClass('open');
      setTimeout(function (_) {
        $('.standard-comment-list-wrap').offset({
          top: -1000,
          left: 0
        });
      }, 500);
    }
  }, {
    key: 'swapViewType',
    value: function swapViewType() {
      $('body').toggleClass('history-view');
      $('.depart-drop-area').toggleClass('grid-bucket');
      $('main').toggleClass('one-bucket').toggleClass('three-buckets');
    }
  }, {
    key: 'updateShortnotes',
    value: function updateShortnotes(data) {
      console.log('checking shortnotes for', data.recordId);
      // console.log(data);
      var _id = '#' + data.recordId;
    }
  }, {
    key: 'stdTimezoneOffset',
    value: function stdTimezoneOffset() {
      var _t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

      var _jan = new Date(_t.getFullYear(), 0, 1);
      var _jul = new Date(_t.getFullYear(), 6, 1);
      return Math.max(_jan.getTimezoneOffset(), _jul.getTimezoneOffset());
    }
  }, {
    key: 'setOffset',
    value: function setOffset() {
      var _t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

      if (_t.getTimezoneOffset() < this.stdTimezoneOffset()) _t.setTime(_t.getTime() + 1 * 60 * 60 * 1000);
      _t = _t.toISOString();
      _t = new Date(_t).getTime();
      return _t;
    }

    // Updates card based on new data from server

  }, {
    key: 'updateCard',
    value: function updateCard(cardData) {
      // Set function variables based on card data
      console.log('into update card...');
      console.log(cardData);
      // FUNCTION VARIABLES
      // User variables
      var _currentDepartment = $('.department-modal .department-select').val();
      var _user = cardData.user;

      // Local variables from object
      var _sn = cardData.shortNotes;
      var _wfHistory = cardData.workflowHistory;
      var _id = '#' + cardData.recordNumber;

      // Generate shortnote variables
      var _wait = _sn.waiting,
          _with = _sn.with,
          time = _sn.time;

      // Generation Icons
      var _departmentIcons = '';
      var _curReception = false,
          _curDeparted = false,
          _curWait = false,
          _curWith = false;
      var _hasWait = false,
          _hasWith = false;
      var _checkBtn = '';

      if (_sn.type == 'departed') {
        //remove timer and move to departed column
        $(_id).find('.current-wait-time').text("");
        $(_id).appendTo('.departed-bucket .depart-drop-area');
        $(_id).find('.drop-sub-header input').val("");
        $(_id).find('.drop-sub-header textarea').val("");
        $(_id).find('.drop-sub-header').hide();
        $(_id).find('.drop-sub-header2').hide();
        $(_id).find('.icons').html("");
        return;
      }

      if (_sn.time != $(_id).find('.timeStamp').text()) {
        //if different sn time, update
        // Generate last action time
        var _time = this.getWaitTime(_sn.time);
        $(_id).find('.current-wait-time time').text(_time);
      }

      if (_wait.length > 0 && _wait[0] != '') {
        //if card is waiting for department(s)
        _hasWait = true;
        _departmentIcons += '<span class=\'wait\'>' + icons['wait'];
        for (var i = 0; i < _wait.length; i++) {
          if (_wait[i] != '') {
            _departmentIcons += '' + icons[_wait[i]]; //get icons by dep name
          }
          if (_wait[i] == _currentDepartment) {
            //if waiting for current selected department, add check in btn
            _curWait = true;
            _checkBtn = 'Check In';
            if (_currentDepartment == "Reception") _checkBtn = 'Reroute';
          }
        }
        _departmentIcons += '</span>';

        // Check if currently in Reception or standard waiting
        console.log(_wait);
        console.log(_with);
        if (_wait[0] == 'Reception' && _with.length <= 1) {
          console.log('currently in reception!');
          _curReception = true;
          // $(_id).find('.check-in-btn').html(`<i class='fa fa-check' aria-hidden='true'></i> Reroute`); // adds reroute button
        }
      }

      // Generate with list icons
      if (_with.length > 0 && _with[0] != '') {
        _hasWith = true;
        _departmentIcons += '<span class=\'with\'>' + icons['with'];
        for (var _i2 = 0; _i2 < _with.length; _i2++) {
          if (_with[_i2] != '') {
            _departmentIcons += '' + icons[_with[_i2]];
          }
          if (_with[_i2] == _currentDepartment) {
            // add checkout button if current selected dept
            _curWith = true;
            _checkBtn = 'Check Out';
          }
        }
        _departmentIcons += '</span>';
      }

      // Check if card/customer has been departed
      if (_wait.length <= 1 && _with.length <= 1) {
        _curDeparted = true;
        $(_id).find('.department-select-row').hide();
      }

      // Checkin/out button generation
      if (_curWith || _curWait || _curReception) {
        $(_id).find('.department-select-row').hide();
        _departmentIcons += '\n        <button class=\'btn check-in-btn\'>\n          <i class=\'fa fa-check\' aria-hidden=\'true\'></i> ' + _checkBtn + '\n        </button>';
        // Change classes based on if dept is currently with/wait for customer
        if (_curWith) {
          $(_id).removeClass('waiting-for-me');
          $(_id).addClass('with-me');
        } else if (_curWait) {
          $(_id).addClass('waiting-for-me');
        } else if (_curReception) {
          $(_id).addClass('waiting-for-reception');
          $(_id).find('.department-select-row').show();
        }
      }

      if (!_curWith && !_curWait) {
        $(_id).removeClass('waiting-for-me').removeClass('with-me');
      }
      // Regenerate Icons
      $(_id).find('.icons').html(_departmentIcons);

      // Move card based on current WF
      if (_curReception) {
        $(_id).appendTo('.reception-bucket .wait-drop-area');
        $(_id).find('.drop-sub-header input').val("");
        $(_id).find('.drop-sub-header textarea').val("");
        $(_id).removeClass('with-me');
        $(_id).removeClass('open');
        $(_id).addClass('waiting-for-reception');
        $(_id).find('.check-in-btn').html('<i class=\'fa fa-check\' aria-hidden=\'true\'></i> Reroute');
        if (_currentDepartment == 'Reception') {
          $(_id).find('.drop-sub-header2, .drop-sub-header, .department-select-row').show();
        }
        // $('.reception-bucket .wait-drop-area').append($(_id));
      } else if (_hasWait) {
        $(_id).removeClass('waiting-for-reception');
        $(_id).appendTo('.review-bucket .wait-drop-area');
        // $('.review-bucket .wait-drop-area').append($(_id).html());
      } else if (_hasWith) {
        $(_id).removeClass('waiting-for-reception');
        $(_id).appendTo('.review-bucket .with-drop-area');
        // $('.review-bucket .with-drop-area').append($(_id).html());
      } else if (_curDeparted) {
        $(_id).removeClass('waiting-for-reception');
        $(_id).appendTo('.departed-bucket .depart-drop-area');
        $(_id).find('.drop-sub-header input').val("");
        $(_id).find('.drop-sub-header textarea').val("");
        // $('.depart-drop-area').append($(_id).html());
      }
    }
  }, {
    key: 'toggleSearch',
    value: function toggleSearch() {
      $('.site-header .menu .search-box').toggleClass('open');
      $('.site-header .menu').toggleClass('search-box-open');
      if ($('.site-header .menu .search-box').hasClass('open')) {
        $('.site-header .menu .search-box input').focus();
      } else {
        $('.site-header .menu .search-box input').blur();
      }
    }
  }, {
    key: 'search',
    value: function search() {
      $('.drop').unmark();
      $('.drop').mark($('.search-box input').val(), {
        "separateWordSearch": "true",
        "exclude": [".status-choices ul li div", "time", ".count-icon"]
      });
      if ($('.search-box input').val()) {
        $('.drop').each(function () {
          if ($(this).find('mark').length) $(this).removeClass('hide');else $(this).addClass('hide');
        });
      } else $('.drop').removeClass('hide');
    }
  }, {
    key: 'toggleStandardComments',
    value: function toggleStandardComments(_el, _e) {
      var _w = $(window).width();
      var _xOff = _e.pageX + 616 > _w ? _w - 616 : _e.pageX;
      var standardCommentBox = $('.standard-comment-list-wrap');
      var _currentDepartment = $('.department-modal .department-select').val();
      standardCommentBox.toggleClass('open');
      if (standardCommentBox.hasClass('open')) {
        standardCommentBox.offset({
          top: _e.pageY,
          left: _xOff
        });
        standardCommentBox.find('.associated-record-number').text(_el.parents('.drop').find('.record-number').text());
        $('.standard-comment-list').html('');
        for (var i = 0, l = standardComments[_currentDepartment].length; i < l; i++) {
          $('.standard-comment-list').append('<li class="standard-comment-list-item">' + standardComments[_currentDepartment][i] + '</li>');
        }
      } else {
        setTimeout(function (_) {
          standardCommentBox.offset({
            top: -1000,
            left: 0
          });
        }, 500);
      }
    }
  }, {
    key: 'chooseStandardComment',
    value: function chooseStandardComment(_el) {
      var _recordNumber = $('.standard-comment-list-wrap .associated-record-number').text();
      $('#' + _recordNumber + ' .drop-sub-header textarea').val(_el.text());
    }
  }, {
    key: '_recordsInProgress',
    value: function _recordsInProgress() {
      if ($('.drop .department-select-row .department.active').length > 0 || typeof $('.drop .drop-sub-header textarea').val() != "undefined" && $('.drop .drop-sub-header textarea').val().trim().length > 0 || $('.drop .drop-sub-header textarea').is(':focus')) return true;
      return false;
    }
  }]);

  return dead;
}();

var WorkflowEntry = function () {
  function WorkflowEntry(data) {
    _classCallCheck(this, WorkflowEntry);

    this.task = data.task;
    this.status = data.status;
    this.user = data.user;
    this.time = data.time;
    this.comment = data.comment;
  }
  /* Function that updates shortNotes in Accela */


  _createClass(WorkflowEntry, [{
    key: 'updateShortNotes',
    value: function updateShortNotes(sn, rec) {
      var id = this.getAccelaID(rec);
      // console.log('Updating Short Notes...');

      request({
        "crossDomain": true,
        "url": 'https://apis.accela.com/v4/records/' + id,
        "method": "PUT",
        "headers": {
          "x-accela-appid": this.appid,
          "authorization": this._TOKEN4
        },
        "data": JSON.stringify({
          shortNotes: sn
        })
      }, function (err, resp, result) {
        if (!err && resp.statusCode == 200) {
          // console.log("Short Notes Updated Correctly");
        } else {
          console.log("Error: ");
          console.log(result);
        }
      });
    }
  }]);

  return WorkflowEntry;
}();

/* function sends SQL command to get a specific user by a given ip address. This is used for sign ins by cookies */


function getUserByIP(con, client, ip, sockets) {
  con.query('SELECT * FROM users where user_ip = "' + ip + '"', function (err, rows) {
    if (err || !rows.length) sendAllLoggedIn(sockets, con); //user not found, send user list
    else {
        setLoggedInFlag(rows[0].username, "Y", ip, con, sockets);
        client.emit('user-auto-login', rows);
      }
  });
}

$(document).on('change', '.calendar-modal .date-select', function () {
  //
  main.controller.changeQueryDate($(this));
});

var Modal = function Modal(_el, _openElement) {
  _classCallCheck(this, Modal);

  this._el = _el;
  this._openElement = _openElement;
};
/***************************************************************************
Filename: gis.js
Description: This file handles all of the communications between the client
and the local GIS server.
****************************************************************************/


require(["dojo/dom", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"], function (dom, on, Query, QueryTask) {
  var $scope = void 0,
      loader = '<div class="loader" style="display:inherit"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></div>',
      queryTask = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_XAPO/MapServer/2"),
      //Addresses
  queryTask2 = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_XAPO/MapServer/1"),
      //Parcels - owner
  queryTask3 = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_AGIS/MapServer/26"),
      //Code Enforcement
  query = new Query(),
      query2 = new Query(),
      query3 = new Query(); // initialize gis queries

  query.returnGeometry = false;
  query2.returnGeometry = false; // we just want data, not geo

  query.outFields = ['ADDRESSNUMBER', 'STREETPREFIX', 'STREETNAME', 'STREETSUFFIX', 'STREETTYPE', 'UNIT', 'ZIPCITY', 'STATE', 'ZIPCODE', 'PARCELNUMBER']; // fields we want to retrieve from first query
  query2.outFields = ['Tax_Payer_Name', 'Delivery_Address', 'Taxpayer_TAXPAYERCITY', 'Taxpayer_TAXPAYERSTATE', 'Zipcode']; // fields we want to retrieve from second query
  query3.outFields = ['PARCEL', 'CODETEXT', 'NOTIFICATION', 'NOTIFDATETEXT']; // fields we want to retrieve from third query

  $(document).on('keydown', '.add-num, .add-street, .par-num', function (e) {
    // handler that fires on enter key when entering address number, street, or parcel
    if (e.keyCode == 13) {
      e.preventDefault(); //dont submit form

      $scope = $(this).parents('.address-drop-area'); // grab address form data
      executeAddress(); //execute query
    }
  });

  $(document).on('click', '.search-address', function () {
    // handler that fires when you click search address instead of enter
    $scope = $(this).parents('.address-drop-area');
    if ($scope.find('.add-num').val() || $scope.find('.add-street').val() || $scope.find('.par-num').val()) {
      // check if you have a value to search with first
      executeAddress(); //execute query
    } else {
      // show error
      $scope.find('input').addClass('err');
      setTimeout(function () {
        $scope.find('input').removeClass('err');
      }, 1000);
    }
  });

  $(document).on('click', '.address-choice', function () {
    // handler fires when an address is selected
    $(this).siblings('.address-choice').removeClass('active'); // remove selection from other choices
    $(this).addClass('active'); //add to current choice
    executeParcelOwnerCodeEnforcement($(this).children('.address-array').text()); // generate queries for query2 and query3
  });

  /* Function generates query for searching addresses in GIS server */
  function executeAddress() {
    var queryString = "",
        addNumber = $scope.find('.add-num').val(),
        addStreet = $scope.find('.add-street').val().toUpperCase(),
        parcel = $scope.find('.par-num').val().toUpperCase();

    $scope.find('.address-results-row').html(loader); // set to loader while we wait for query

    if (addNumber) {
      // add number to query search
      queryString += 'ADDRESSNUMBER = ' + addNumber;
    }
    if (addStreet) {
      //add street to query search
      if (queryString) queryString += ' AND '; // if already has query param, append
      queryString += 'STREETNAME like \'%' + addStreet + '%\'';
    }
    if (parcel) {
      //add parcel num to query search
      if (queryString) queryString += ' AND '; // append if needed
      queryString += 'PARCELNUMBER like \'%' + parcel + '%\'';
    }

    query.where = queryString; // set where statement in query object
    queryTask.execute(query, queryCallback1); //execute query and perform callback
  }
  /* Function callback from the initial address search query */
  function queryCallback1(results) {
    var addressChoices = [],
        choiceText = '',
        fullStringPiped = '',
        allitems = "",
        resultLength = results.features.length,
        resultHeader = "<span>Choose Address:</span>";

    if (!resultLength) {
      // no addresses found
      $scope.find('.address-results-row').html('<span>Choose Address:</span><div class="btn"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> No address found... Search again.</div>');
    } else {
      if (resultLength > 5) resultLength = 5; // only show the top 5 results

      for (var i = 0; i < resultLength; i++) {
        //generate address choice buttons html
        var featureAttributes = results.features[i].attributes; // result values object
        choiceText = '';
        fullStringPiped = '';

        for (var attr in featureAttributes) {
          if (attr != "ZIPCITY" && attr != "STATE" && attr != "ZIPCODE") choiceText += firstCapString(featureAttributes[attr]) + " "; // skip city state zip
          fullStringPiped += featureAttributes[attr] != null ? featureAttributes[attr] + "|" : "|"; // generate piped values
        }
        addressChoices.push('\n          <div class="address-choice btn" id="add' + i + '">\n          ' + choiceText + ' <span id="val' + i + '" class="address-array">' + fullStringPiped + '</span> \n          </div>'); // generate html array for later
      }

      $scope.find('.address-results-row').html(resultHeader + addressChoices.join("")); //set html 
    }
  }
  /* Function generates queries and executes query to get owner and code enforcement data */
  function executeParcelOwnerCodeEnforcement(text) {
    text = text.replace(/\s+$/, ''); //remove trailing whitespace if any
    var addressArray = text.split("|"),
        //split data on pipes
    parcelNumber = addressArray[9]; // grab parcel from piped string array of address data

    if (parcelNumber == null || parcelNumber == "") {
      // if no parcel number, cant do the other queries. quit
      $scope.find('.code-enforcement').html('<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count"> WARNING: No parcel or owner found for address</span></div></article>');
      return; //were done looking
    }

    query2.where = 'TaxParcelNumber like \'%' + parcelNumber + '%\';'; // generate query
    queryTask2.execute(query2, queryCallback2); //execute

    query3.where = 'PARCEL like \'%' + parcelNumber + '%\''; //generate query
    queryTask3.execute(query3, queryCallback3); // execute
  }
  /* Callback Function sets the results of owner query to card */
  function queryCallback2(results) {
    var ownerObject = results.features[0].attributes,
        // we only care about the first owner if theres multiple values returned
    ownerString = '';
    for (var i in ownerObject) {
      ownerString += ownerObject[i] + "|";
    }
    $scope.find('.owner-array').text(ownerString);
  }
  /* Callback Function gets any code enforcement cases from a parcel and sets it on the card */
  function queryCallback3(results) {
    var buttonText = '<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count">',
        codeCases = '',
        resultLength = results.features.length;

    if (resultLength) {
      // populate code section if any code cases 
      for (var i in results.features) {
        var att = results.features[i].attributes;
        codeCases += '<li>' + att["NOTIFDATETEXT"] + ' - ' + att["CODETEXT"] + ' (' + att["NOTIFICATION"] + ')</li>'; // generate li tags
      }
      $scope.find('.code-enforcement').html('<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count"> ' + resultLength + ' Code Case(s) on this parcel</span><i class="fa fa-chevron-down" aria-hidden="true"></i></div><div class="code-data">Parcel: ' + results.features[0].attributes["PARCEL"] + '<ul>' + codeCases + '</ul></div></article>');
    } else {
      $scope.find('.code-enforcement').html(""); // nothing
    }
  }
  /* Utility Function to capitalize the first character of every word in a given string */
  function firstCapString(s) {
    var retString = '';

    if (typeof s != 'undefined' && s != null) {
      var stringArray = s.toString().split(' '); // split on space to get each word

      for (var i = 0, l = stringArray.length; i < l; i++) {
        retString += stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1).toLowerCase() + " ";
      }
    }
    return retString.trim();
  }
});

/***************************************************************************
Filename: main.js
Description: This class is the instantiator class. There are no functions, only
to generate the various objects needed for the page. All actions are driven
by the controller and view classes. 
****************************************************************************/

var Main = function Main() {
  _classCallCheck(this, Main);

  this.cookies = new Cookies('SUPP');
  this.socket = io({
    reconnection: false,
    reconnectionAttempts: 1,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true
  }); // socket initialize
  this.view = new View(); // UI functions
  this.controller = new Controller(this); // pass cookies socket and view to controller
};

/***************************************************************************
Filename: view.js
Description: This class is intended to contain all UI modification functions. 
Any action that requires server contact should go through the controller class
as the driver. All functions listed here should be fired from the controller class or another
view function.
****************************************************************************/


var View = function () {
  function View() {
    var _this2 = this;

    _classCallCheck(this, View);

    setInterval(function (_) {
      _this2.setWaitTimeCounter(_this2); //update last action time every second for every card
    }, 1000);
  }

  /* Function expands or collapses the accordion panels on the info modal */


  _createClass(View, [{
    key: 'toggleAccordion',
    value: function toggleAccordion(_el) {
      _el.next('.accordion-panel').toggle(); // show/hide content
      if (_el.find('i').hasClass('fa-plus')) _el.find('i').removeClass('fa-plus').addClass('fa-minus'); // update icons
      else _el.find('i').removeClass('fa-minus').addClass('fa-plus');
    }
    /* Function updates time counter on every card */

  }, {
    key: 'setWaitTimeCounter',
    value: function setWaitTimeCounter(obj) {
      // Changes time of all 
      $('.current-wait-time time').each(function () {
        var _split = $(this).html().split(':');
        var _m = parseInt(_split[0]); // get min
        var _s = parseInt(_split[1]); // get sec

        _s++; //increment
        if (_s >= 60) {
          //if hit 60 seconds, increment min
          _s -= 60;
          _m++;
        }

        _s = obj._timeDigit(_s); //get clean strings
        _m = obj._timeDigit(_m);

        $(this).html(_m + ':' + _s); // update card

        if (parseInt(_m) >= 15) {
          // flash red if over 15 mins
          $(this).parents('.current-wait-time').addClass('long-wait');
        } else {
          $(this).parents('.current-wait-time').removeClass('long-wait');
        }
      });
    }
    /* Function updates card once additional address is selected. Updates button to clear instead of search */

  }, {
    key: 'toggleNewCardAddress',
    value: function toggleNewCardAddress(el) {
      var add = el.parents('.address-drop-area');
      el.parents('.drop').find('.multi-address-btn').toggle();
      add.find('.search-address').toggle();
      add.find('.clear-address').removeClass('clear-address').addClass('clear-selected-address');
      add.find('.selected-address').html('<div class="btn active">' + el.html() + '</div>');
      add.find('.drop-area-row').hide();
      add.find('.address-title-row').show();
    }

    /* Function resets html for entering a new address. Fires when the clear button is selected. */

  }, {
    key: 'resetNewCardAddress',
    value: function resetNewCardAddress(el) {
      el.html('\n          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true"></i> Clear</button></div>\n          <span class="selected-address"></span>\n          <div class="drop-area-row address-row">\n            <input type="number" placeholder="#" class="add-num">\n            <input type="text" placeholder="Street St." class="add-street">\n            <input type="number" placeholder="Parcel #" class="par-num" min="0">\n          </div>\n          <div class="drop-area-row address-results-row"></div>\n          <div class="owner-array"></div>\n          <div class="code-enforcement"></div>');
      el.parents('.drop').find('.multi-address-btn').toggle();
    }
    /* Function updates the search result list */

  }, {
    key: 'updateEmailSearchResults',
    value: function updateEmailSearchResults(results) {
      // if(!results.length) $('.email-search-results ul').html(`The search provided no results`);
      $('.email-search-results ul').html('');
      for (var i = 0; i < results.length; i++) {
        $('.email-search-results ul').append('<li class="email-search-result"><input type="checkbox"> ' + results[i] + '</li>');
      }
    }
    /* Function clears all fields in the email modal */

  }, {
    key: 'clearEmailResults',
    value: function clearEmailResults() {
      $('.email-search-results ul').html("");
      $('#email-search-input').val("");
    }
    /* Function adds user to the recipient list based on name and email(s). Also increases the counter by 1. */

  }, {
    key: 'addEmailToRecipientList',
    value: function addEmailToRecipientList(name, email) {
      $('.email-to-list ul').append('<li class="email-btn email-to">\n                <span class="email-recipient" title="' + email + '">' + name + '</span>\n                <span class="email-close"><i class="fas fa-times-circle"></i></span>\n              </li>');
      $('.email-to-list .recipient-count').html($('.email-to-list ul li').length);
    }
    /* Function removes email recipient from list and updates the counter */

  }, {
    key: 'removeEmailFromRecipientList',
    value: function removeEmailFromRecipientList(el) {
      el.remove();
      $('.email-to-list .recipient-count').html($('.email-to-list ul li').length);
    }
    /* Function sets email fields to content  in parameters */

  }, {
    key: 'setEmailFields',
    value: function setEmailFields(el, subject, body) {
      el.find('#email-subject').val(subject);
      el.find('#email-body').val(body);
    }
    /* Function clears email fields */

  }, {
    key: 'clearEmailModal',
    value: function clearEmailModal(el) {
      el.find('input').val("");
      el.find('textarea').val("");
      el.find('ul').html("");
      el.find('.recipient-count').html('0');
    }
    /* Function hides/shows the departed column. toggles chat column */

  }, {
    key: 'toggleDepartedColumn',
    value: function toggleDepartedColumn() {
      $('.departed-bucket').toggle();
      $('.chat-bucket').toggle();
    }
    /* Function clears inputs from address fields */

  }, {
    key: 'clearAddressSelection',
    value: function clearAddressSelection(_el) {
      _el.find('.address-row input').val("");
    }
    /* Function toggles open class on an element. Mainly for 'opening' cards to view additional info */

  }, {
    key: 'openElement',
    value: function openElement(_el) {
      if ($('.department-modal .department-select').val() == 'Reception') {
        // Show add department section if reception is selected
        $('.add-dep-btn').show();
      } else {
        $('.add-dep-btn').hide();
      }

      _el.toggleClass('open');
    }
    /* Function adds error classes to elements. Typically used for form validation errors */

  }, {
    key: 'inputError',
    value: function inputError(nopeElement, errElement) {
      $(nopeElement).addClass('nope');
      $(errElement).addClass('err');
      setTimeout(function (_) {
        $(nopeElement).removeClass('nope');
        $(errElement).removeClass('err').focus();
      }, 500); //remove after half second
    }
    /* Function adds error class to element */

  }, {
    key: 'addErrorClass',
    value: function addErrorClass(_el) {
      _el.addClass('err');
      setTimeout(function (_) {
        _el.removeClass('err');
      }, 1000);
    }
    /* Function adds activity message to activity log */

  }, {
    key: 'addActivity',
    value: function addActivity(message, time, dept) {
      $('.activity-log .drop-area ul').append('<li class="activity-' + dept + '">' + time + ': ' + message + '</li>');
    }
    /* Function adds new message to chat box. Uses department logic to update text color depending on who sent the message. */

  }, {
    key: 'addNewMessage',
    value: function addNewMessage(message, time, name, dept) {
      var m = '<li><time>' + time + '</time>  <span class="chat-' + dept + '"><b>' + name + '</b>:</span> <span>' + message + '</span></li> ';
      var container = $('.chat-messages')[0];
      var containerHeight = container.clientHeight;
      var contentHeight = container.scrollHeight;
      var isBottom = contentHeight - containerHeight - container.scrollTop <= 29;

      $('.chat-messages ul').append(m);
      var messageHeight = $('.chat-messages ul')[0].clientHeight - containerHeight;

      $('.chat-message-count').text(parseInt($('.chat-message-count').text()) + 1); //increment counter
      if ($('.chat-message-count').text() != '0') $('#no-chats').hide();

      if (isBottom) // scroll is at the bottom, stick to bottom
        container.scroll(0, messageHeight);
      //else dont scroll until back at the bottom
    }
    /* Function resets messages in chat box */

  }, {
    key: 'resetChatBox',
    value: function resetChatBox() {
      $('#chat-message-box').val("");
    }
    /* Function updates the 'currently logged in' box with user initial circles*/

  }, {
    key: 'updateLoggedInUsers',
    value: function updateLoggedInUsers(users) {
      $('.logged-in-users ul').html("");
      $('.chat-users').html('(' + users.length + ')'); //total users logged in

      for (var i in users) {
        var dept = users[i].user_dept;
        if (users[i].user_dept != null) {
          dept = dept.split(" ")[0].split(",")[0]; // take first word of dept for class name
          if (dept.toLowerCase() == 'buildingc') dept = 'building'; // chop off c for commercial building
        } else {
          dept = "Admin"; //default admin
        }
        var user = '<li class="avatar-circle avatar-circle-' + dept.toLowerCase() + '" data-tooltip="true" data-tooltip-pos="bottom" data-tooltip-text="' + users[i].user_first + ' ' + users[i].user_last + '">\n          <span class="initials">' + users[i].user_initials + '</span></li>'; //generate html
        $('.logged-in-users ul').append(user); //push html
      }
    }

    /* Function draws card to page if it doesnt already exist */

  }, {
    key: 'drawCard',
    value: function drawCard(cardData) {
      console.log(cardData);
      var _currentDepartment = $('.department-modal .department-select').val();
      var _createCard = '';
      var _departmentIcons = '';
      var _waitingForMe = '';
      var _withMe = '';
      var _reception = '';
      var _waitingForTime = '';
      var _content = '';
      var _checkBtn = '';
      // HTML empty variables
      var _routeGroups = '';
      var _subHeader = '';
      var _addReviewers = '';
      var _addAddresses = '';

      // Fix Description if required
      var _description = decodeURIComponent(cardData.description);

      // Generate starting wait time
      var _waitTime = this.getWaitTime(cardData.shortNotes.time);

      // Assigned variable to wait/with array
      var _wait = cardData.shortNotes.waiting;
      var _with = cardData.shortNotes.with;

      var _wfArea = this.drawWf(cardData.workflowHistory); // generate workflow history html

      if (typeof _wait == 'undefined') _wait = [""];
      if (typeof _with == 'undefined') _with = [""];
      _wait = _wait.filter(function (d) {
        return d.length > 0;
      }); //filters out empty strings
      _with = _with.filter(function (d) {
        return d.length > 0;
      });

      // Only set HTML if there is a waiting or with customer
      if (_wait || _with) {
        if (_wait.indexOf(_currentDepartment) >= 0) _waitingForMe = ' waiting-for-me'; // add my classes to card
        if (_with.indexOf(_currentDepartment) >= 0) _withMe = ' with-me';
        _departmentIcons = this.generateIcons(_wait, _with); //generate icons html

        // Variables used to determine if card is another section of wf
        var _curReception = false,
            _curDeparted = false;

        _routeGroups = this.generateRouting(); // routing department html

        // Set reception html and class if wait starts with reception and none with
        if (_wait.indexOf('Reception') >= 0 && !_with.length) {
          _reception = ' waiting-for-reception';
          _curReception = true;
          _checkBtn = 'Reroute';
        }

        if (!_wait.length && !_with.length) {
          // Not waiting with anyone, send to departed column
          // console.log('record is not waiting or with any reviewers. sending to departed...');
          _curDeparted = true;
        }

        // Set subheader if current department is with customer
        _subHeader = this.generateSubHeader();

        // Add section for mid-workflow reviewers
        _addReviewers = this.generateAddReviews();

        // example: _addresses = ['2338 S Wilkeson St', '4715 Slayden Rd', '1102 A St'];
        var _addresses = cardData.address;
        var _parcels = cardData.parcels;
        var _addressLinks = this.getAddressLinks(_addresses); //generate hyperlinks for addresses
        var _addAddresses2 = '';
        var _firstAddress = _typeof(_addresses[0]) == 'object' ? _addresses[0].streetAddress : _addresses[0];
        if (_parcels.length) {
          var _firstParcel = _parcels[0];
          _firstAddress += ' - ' + _firstParcel;
        }

        if (_addresses.length > 1) {
          _addAddresses2 = this.drawAdditionalAddresses(_addresses, _addressLinks, _parcels); //generate html for multi address if exists
        }

        if (cardData.customerName.length) {
          //capitalize name
          cardData.customerName[0] = cardData.customerName[0].slice(0, 1).toUpperCase() + cardData.customerName[0].slice(1);
        }

        // set full card html
        _createCard = '\n        <article class=\'drop existing-drop pre' + _waitingForMe + _withMe + _reception + '\' id=\'' + cardData.recordNumber + '\'>\n          <span style=\'display:none\' class=\'timeStamp\'>' + cardData.shortNotes.time + '</span>\n          <header class=\'drop-header\'>\n            <h3>\n              <span class=\'record-number\'>' + cardData.recordNumber + '</span> <span class=\'icons\'>' + _departmentIcons + '</span>\n            </h3>\n            ' + _routeGroups + '\n            ' + _subHeader + '\n          </header>\n          <section class=\'information-area\'>\n            <h4 class=\'customer-name\'>' + cardData.customerName + '</h4>\n            <a class=\'address-link\' href=\'' + _addressLinks[0] + '\' target="_blank" title="Find address on DART">\n              <i class=\'fas fa-map-marker-alt\' aria-hidden=\'true\'></i> <span class="address">' + _firstAddress + '\n              </span>\n            </a>\n            <div class=\'current-wait-time\'><span>Last Action...</span><time>' + _waitTime + '</time></div>\n          </section>\n          ' + _addAddresses2 + '\n          <section class=\'drop-area description-area\'>\n            ' + _description + '\n            <div class=\'shade\'></div>\n          </section>\n          <section class=\'loader comment-area drop-area\'>\n            <header>\n              <h4>Workflow History:</h4>\n              <span class=\'btn-content\'>\n                <button class=\'btn add-dep-btn\'>\n                  <i class=\'fas fa-plus\' aria-hiden=\'true\'></i> Department\n                </button>\n              </span>\n            </header>\n            ' + _wfArea + '\n          </section>\n          ' + _addReviewers + '\n        </article>';

        var _id = '#' + cardData.recordNumber; // id for reference
        // Write card to correct section
        if (_curReception) {
          //in reception column
          $('.reception-bucket .wait-drop-area').append(_createCard);
        } else if (_curDeparted) {
          // in departed
          $('.departed-bucket .depart-drop-area').append(_createCard);
          $(_id).find('.current-wait-time').text(""); //remove timer
          $(_id).appendTo('.departed-bucket .depart-drop-area');
          $(_id).find('.drop-sub-header').hide(); // hide sub header
        } else if (_wait.length) {
          //in review waiting column
          $('.review-bucket .wait-drop-area').append(_createCard);
        } else {
          //in review with column
          $('.review-bucket .with-drop-area').append(_createCard);
        }
      }
    }
    /* Function updates the contacts and addresses of a specific card */

  }, {
    key: 'updateContactAddress',
    value: function updateContactAddress(data) {
      console.log(data);
      var _id = '#' + data.recordId; // card identifier
      var mapIcon = '<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ';
      if (data.contact.length) {
        //set contact if exists
        var name = data.contact[0].firstName;
        $(_id).find('.customer-name').html(name.slice(0, 1).toUpperCase() + name.slice(1));
      }
      if (data.addresses) {
        //set addresses if exists
        var _addresses = data.addresses;
        var _parcels = [];
        var _addressLinks = this.getAddressLinks(_addresses);
        var _addAddresses = '';
        var _firstAddress = _typeof(_addresses[0]) == 'object' ? _addresses[0].streetAddress : _addresses[0];
        if (data.parcels.length) {
          _parcels = data.parcels;
          var _firstParcel = _parcels[0].parcelNumber;
          _firstAddress += ' - ' + _firstParcel;
        }
        if (_addresses.length > 1) {
          //generate multi address html
          _addAddresses = this.drawAdditionalAddresses(_addresses, _addressLinks, _parcels);
        }
        if ((typeof _firstAddress === 'undefined' ? 'undefined' : _typeof(_firstAddress)) == 'object') //type validation
          _firstAddress = _firstAddress.streetAddress;

        $(_id).find('.address-link').html(mapIcon + _firstAddress);
        $(_id).find('.address-link').attr("href", 'http://wsitd03/website/DART/StaffMap/index.html?find=' + _firstAddress);
        $(_id).find('.information-area').after(_addAddresses);
      }
    }
    /* Function generates the html for a cards addresses and parcels*/

  }, {
    key: 'generateAddressSection',
    value: function generateAddressSection(data) {
      console.log(data);
      var _id = '#' + data.recordId; // card identifier
      var _html = '<a class=\'address-link\' href=\'\' target="_blank" title="Find address on DART">\n              <i class=\'fas fa-map-marker-alt\' aria-hidden=\'true\'></i> <span class="address">\n              </span>\n            </a>';
      if (data.addresses.length) {
        var _addresses = data.addresses;
        var _parcels = [];
        var _addressLinks = this.getAddressLinks(_addresses);
        var _firstAddress = _addresses[0];
        if (data.parcels.length) {
          _parcels = data.parcels;
          var _firstParcel = _parcels[0].parcelNumber;
          _firstAddress += ' (' + _firstParcel + ')';
        }
      }
    }
    /* Function updates workflow history of a specific card*/

  }, {
    key: 'updateWorkflowHistory',
    value: function updateWorkflowHistory(data) {
      var _id = '#' + data.recordId; //card identifier
      $(_id).find('.reception-add-review').hide();
      $(_id).removeClass('open');
      $(_id).find('.reception-add-review').html('<div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Add Departments:</span></div>\n       <div class="drop-area-row department-select-row">\n          <button class="btn department activate-department-btn"><i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i> <span style="display:none">Real Property Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i> <span style="display:none">Building Residential Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i> <span style="display:none">Building Commercial Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i> <span style="display:none">Site Development Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i> <span style="display:none">Land Use Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i> <span style="display:none">Fire Protection Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i> <span style="display:none">Traffic Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i> <span style="display:none">Historic Review</span></button>\n          <button class="btn department activate-department-btn"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i> <span style="display:none">Permit Specialist</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true" title="Application Services"></i> <span style="display:none">Application Services Review</span></button>\n          <button class="btn department activate-department-btn add-department"><i class="fa fa-check" aria-hidden="true" title="Activate Departments"></i> <span>Add</span></button>\n          </div>'); // reset add review section

      if (data.workflowHistory.length) {
        // if any workflow history at all
        $(_id).find('.comment-area').html('<header>\n              <h4>Workflow History:</h4>\n              <span class="btn-content">\n                <button class="btn add-dep-btn" style="display: inline-block;">\n                  <i class="fas fa-plus" aria-hiden="true"></i> Department\n                </button>\n              </span>\n            </header>'); //reset header
        //console.log(data.workflowHistory);
        var workflowHtml = this.drawWf(data.workflowHistory); //generate WH html
        $(_id).find('.comment-area header').after(workflowHtml); //append to card
      }
    }
    /* Function generates the html for each workflow entry */

  }, {
    key: 'drawWf',
    value: function drawWf(wf) {
      var _display = '';
      var _commentClass = '',
          _isRecep = '',
          _time = '',
          _comment = '';
      var _accelaComment = '',
          _lastComment = '',
          _status = '';

      if (wf.length) {
        //if any workflow to draw
        _display += '<ul class=\'comments\'>'; //start list
        for (var i = 0; i < wf.length; i++) {
          if (wf[i].fullName && wf[i].timeStamp) {
            //entry must have user and timestamp to push into history
            if (i == wf.length - 2) {
              _lastComment = 'last-comment'; // I dont think this matters anymore, but im leaving it for now
            }

            if (wf[i].fullName == 'Accela Action') {
              // If workflow was done by automation (TSI updates)
              _accelaComment = ' accela-comment';
            }

            _commentClass = this.getTaskCommentClass(wf[i].task); //gets class of comment
            // Set display variables
            _time = this.convertTimeStamp(wf[i].timeStamp); //cleans timestamp
            _comment = this.removeCommentSignature(wf[i].comment); // cleans comment (removes initials)
            try {
              _comment = decodeURIComponent(_comment); //decodes any uri text in comment
            } catch (e) {} // if decoding breaks, just skip it          

            // sets status of action to display
            if (_comment == 'Checking In') {
              _status = 'Checking In';
              _comment = '';
            } else if (_comment.indexOf('Routing to:') >= 0 || _comment == 'Routing customer for review') {
              _status = 'Routing Customer';
              _comment = '';
            } else if (_comment.indexOf('Activate') >= 0) {
              _status = 'Add Departments';
            } else {
              _status = 'Checking Out';
            }

            // Create wf html
            _display += '\n            <li class=\'comment\'>\n              <div class=\'comment-header\'>\n                ' + icons[wf[i].task] + '\n                <div class=\'comment-description\'>\n                  <time class=\'timestamp\'>' + _time + ':</time>\n                <span class=\'comment-author comment-' + wf[i].task + '\'>' + wf[i].fullName + '</span>\n                </div>\n                <div class=\'comment-status\'>[' + _status + ']</div>\n              </div>\n              <div class=\'comment-content-area\'>\n                ' + _comment + '\n              </div>\n              <!--<hr class=\'' + _lastComment + '\'>-->\n            </li>';
          }
        }
        _display += '</ul>'; //close list

        return _display;
      }
    }

    /* Function converts task into which class to add for workflow history entries */

  }, {
    key: 'getTaskCommentClass',
    value: function getTaskCommentClass(task) {
      var _class = '';

      if (task == 'Reception' || task == 'Application Services Review') {
        _class = 'comment-user';
      } else if (task == 'Residential Building Review' || task == 'Commercial Building Review') {
        _class = 'comment-building';
      } else if (task == 'Real Property Review') {
        _class = 'comment-realprop';
      } else if (task == 'Site Development Review') {
        _class = 'comment-site';
      } else if (task == 'Land Use Review') {
        _class = 'comment-landuse';
      } else if (task == 'Fire Protection Review') {
        _class = 'comment-fire';
      } else if (task == 'Traffic Review') {
        _class = 'comment-traffic';
      } else if (task == 'Historic Review') {
        _class = 'comment-historic';
      } else if (task == 'Permit Specialist') {
        _class = 'comment-permit';
      }

      return _class;
    }

    // Removes signature from comments

  }, {
    key: 'removeCommentSignature',
    value: function removeCommentSignature(_comment) {
      if (_comment != '' && typeof _comment != 'undefined') {
        return _comment.slice(-1) == ']' ? _comment.substr(0, _comment.split('').length - 6) : _comment;
      } else if (_comment == '') return _comment;else return '';
    }

    /* Function updates the card based on the shortnotes received. updates headers and icons and also moves to correct bucket */

  }, {
    key: 'updateCardShortNotes',
    value: function updateCardShortNotes(cardData) {
      var _id = '#' + cardData.recordNumber;
      var _shortNotes = cardData.shortNotes;
      var waitArray = _shortNotes.waiting;
      var withArray = _shortNotes.with;
      var existingCard = $(_id);
      var _currentDepartment = $('.department-modal .department-select').val();
      var currentBucket = 'Departed'; // default bucket

      if (existingCard.parents('.reception-bucket').length) currentBucket = 'Reception';else if (existingCard.parents('.wait-drop-area').length) currentBucket = 'Waiting';else if (existingCard.parents('.with-drop-area').length) currentBucket = 'With';

      // existingCard.find('textarea, input').val(""); // reset input fields 
      existingCard.find('.btn').removeClass('active'); //deactivate all routing departments

      if (_shortNotes.type == 'Departed') {
        // hide all extras, only show base card and move to departed
        existingCard.find('.drop-sub-header2, .drop-sub-header, .current-wait-time').hide();
        existingCard.find('textarea, input').val("");
        existingCard.appendTo('.departed-bucket .depart-drop-area');
        return; //dont do anything else
      }

      if (typeof waitArray == 'undefined') waitArray = [];
      if (typeof withArray == 'undefined') withArray = [];
      waitArray = waitArray.filter(function (d) {
        return d.length > 0;
      }); //filters out empty strings
      withArray = withArray.filter(function (d) {
        return d.length > 0;
      });
      // console.log(waitArray,withArray);
      existingCard.find('.icons').html(this.generateIcons(waitArray, withArray)); //update icons and button with shortnotes data

      if (waitArray.indexOf(_currentDepartment) == -1 && withArray.indexOf(_currentDepartment) == -1) existingCard.find('.check-in-btn').hide(); // hide button if not in your department

      if (_shortNotes.time != $(_id).find('.timeStamp').text()) {
        //if different sn time, update last action time
        existingCard.find('.current-wait-time time').text(this.getWaitTime(_shortNotes.time));
        $(_id).find('.timeStamp').text(_shortNotes.time); //reset timestamp
      }

      existingCard.removeClass('with-me').removeClass('waiting-for-me').removeClass('waiting-for-reception'); // remove classes to update card headers
      if (waitArray.length) {
        //if waiting for anyone, move to wait bucket
        if (waitArray.indexOf('Reception') >= 0) {
          existingCard.appendTo('.reception-bucket .wait-drop-area'); //move to reception bucket
          existingCard.addClass('waiting-for-reception'); // add waiting-for-reception class
          if (_currentDepartment == 'Reception') existingCard.addClass('waiting-for-me');
        } else {
          existingCard.appendTo('.review-bucket .wait-drop-area'); //move to wait bucket
          if (waitArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('waiting-for-me'); //if waiting for you, show text fields by adding waiting-for-me class
          if (withArray.length && withArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('with-me'); //if waiting for someone AND with you, add with-me class to show text field
        }
      } else if (withArray.length) {
        //currently with some department 
        existingCard.appendTo('.review-bucket .with-drop-area'); // move to with bucket
        if (withArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('with-me'); //if with you, show text fields by adding with-me class
      } else {
        //(!withArray.length && !waitArray.length) { //welp, guess it goes in departed since it has nowhere else to go
        existingCard.appendTo('.departed-bucket .depart-drop-area');
      }
    }
    /* Function toggles the hide/show of the additional departments section on a card */

  }, {
    key: 'showAdditionalDepartments',
    value: function showAdditionalDepartments(el) {
      if (el.parents('.drop').find('.reception-add-review').is(':visible')) {
        el.parents('.drop').find('.reception-add-review').hide();
      } else {
        el.parents('.drop').find('.reception-add-review').find('.department-select-row').show();
        el.parents('.drop').find('.reception-add-review').show();
      }
    }
    /* Function generates the icons on a card given each department waiting or with */

  }, {
    key: 'generateIcons',
    value: function generateIcons(waitArray, withArray) {
      var buttonText = 'Check In'; //checkin by default
      var tempHtml = '';
      var currentDepartment = $('.department-modal .department-select').val();

      // console.log(currentDepartment, waitArray,withArray);
      //update button text
      if (withArray.indexOf(currentDepartment) >= 0) buttonText = 'Check Out';
      if (waitArray.indexOf('Reception') >= 0) buttonText = 'Reroute';

      var checkinButton = '<button class=\'btn check-in-btn\'>\n    <i class=\'fa fa-check\' aria-hidden=\'true\'></i> ' + buttonText + '</button>';

      if (waitArray.length) {
        // add waiting icons
        tempHtml += '<span class="wait">';
        for (var i in waitArray) {
          if (i == 0) tempHtml += icons['wait']; //add clock icon
          if (typeof icons[waitArray[i]] == 'undefined') tempHtml += icons['Unknown']; //cant find icon
          else tempHtml += icons[waitArray[i]]; //department icon
        }
        tempHtml += '</span>'; //close section
      }

      if (withArray.length) {
        //add with icons
        tempHtml += '<span class="with">';
        for (var _i3 in withArray) {
          if (_i3 == 0) tempHtml += icons['with']; //add handshake icon
          if (typeof icons[withArray[_i3]] == 'undefined') tempHtml += icons['Unknown']; //cant find icon
          else tempHtml += icons[withArray[_i3]]; //department icon
        }
        tempHtml += '</span>'; //close
      }

      tempHtml += checkinButton; //add button

      return tempHtml;
    }
    /* Function creates empty 'new customer' card for reception to fill out. Appends to top of reception bucket */

  }, {
    key: 'createNewCardElement',
    value: function createNewCardElement() {
      $('.reception-bucket .new-drop-area').append('<article class="drop new-drop pre newest">\n        <header class="drop-header">\n          <h3><input class="customer-name" type="text" placeholder="Customer Name"></h3>\n        </header>\n        <section class="drop-area">\n          <textarea name="record-description" class="record-description" rows="2" placeholder="Record Description"></textarea>\n        </section>\n        <section class="drop-area address-drop-area">\n          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true" title="Search GIS Database for entered address"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true" title="Clear address entry fields"></i> Clear</button></div>\n          <span class="selected-address"></span>\n          <div class="drop-area-row address-row">\n            <input type="number" placeholder="#" class="add-num">\n            <input type="text" placeholder="Street St." class="add-street">\n            <input type="number" placeholder="Parcel #" class="par-num" min="0">\n          </div>\n          <div class="drop-area-row address-results-row"></div>\n          <div class="owner-array"></div>\n          <div class="code-enforcement"></div>\n        </section>\n          <button class="btn multi-address-btn"><i class="fa fa-plus" aria-hidden="true"></i> Add</button>\n        <section class="drop-area department-select-area">\n          <div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Departments:</span></div>\n          <div class="drop-area-row department-select-row">\n            <div class="btn department"><i class="fa fa-home real-property-icon" aria-hidden="true"></i> <span>Real Property</span></div>\n            <div class="btn department"><i class="fas fa-warehouse building-icon" aria-hidden="true"></i> <span>Residential Building</span></div>\n            <div class="btn department"><i class="fa fa-building building-icon" aria-hidden="true"></i> <span>Commercial Building</span></div>\n            <div class="btn department"><i class="fa fa-truck site-icon" aria-hidden="true"></i> <span>Site</span></div>\n            <div class="btn department"><i class="fa fa-map land-use-icon" aria-hidden="true"></i> <span>Land Use</span></div>\n            <div class="btn department"><i class="fa fa-fire fire-icon" aria-hidden="true"></i> <span>Fire</span></div>\n            <div class="btn department"><i class="fa fa-car traffic-icon" aria-hidden="true"></i> <span>Traffic</span></div>\n            <div class="btn department"><i class="fa fa-history historic-icon" aria-hidden="true"></i> <span>Historic</span></div>\n            <div class="btn department"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true"></i> <span>Permit Specialist</span></div>\n            <div class="btn department"><i class="fas fa-id-card-alt application-services-icon" aria-hidden="true"></i> <span>Application Services</span></div>\n          </div>\n        </section>\n        <section class="drop-area action-area">\n          <button class="btn clear-btn"><i class="fa fa-trash" aria-hidden="true"></i> <span>Delete</span></button>\n          <button class="btn submit-btn"><i class="fa fa-arrow-right" aria-hidden="true"></i> <span>Create</span></button>\n        </section>\n      </article>');
    }
    /* Function that closes any open modals */

  }, {
    key: 'closeModal',
    value: function closeModal() {
      $('.wrap').removeClass('out-of-focus');
      $('.modals .behind').removeClass('open');
      $('.modal').addClass('out');
      setTimeout(function (_) {
        $('.modal').removeClass('open').removeClass('out');
      }, 500);
    }
    /* Function opens or closes a given modal depending on current state */

  }, {
    key: 'modalHandler',
    value: function modalHandler(modal) {
      if ($(modal).hasClass('open')) {
        //already open, close modal instead
        $('.wrap').removeClass('out-of-focus');
        $('.modals .behind').removeClass('open');
        $('.modal').addClass('out');
        setTimeout(function (_) {
          $('.modal').removeClass('open').removeClass('out');
        }, 500);
      } else {
        $('html, body').animate({
          scrollTop: 0
        }, 500);
        $('.modal').removeClass('open');
        $('.wrap').addClass('out-of-focus');
        $('.menu ul').removeClass('open');
        $(modal).addClass('open');
        $('.modals .behind').addClass('open');
      }
    }
    /* Function removes a 'new card' from the page */

  }, {
    key: 'deleteNewCardElement',
    value: function deleteNewCardElement(_el) {
      _el.parents('.drop').addClass('pre');
      this.setElementIsLoading2(_el);
      setTimeout(function (_) {
        _el.parents('.drop').remove();
      }, 500);
    }
    /* Function toggles active class to routing options (Turns buttons green). Also makes sure there arent more than 5 active selected at once */

  }, {
    key: 'selectRoutingDepartment',
    value: function selectRoutingDepartment(_el) {
      var activeCount = _el.parents('.drop').find('.department.active').length;
      var waitIcons = 0,
          withIcons = 0;
      if (_el.hasClass('activate-department-btn')) {
        // check current icons on card
        waitIcons = Math.max(0, _el.parents('.drop').find('.wait').children().length - 1); //subtract clock icon
        withIcons = Math.max(0, _el.parents('.drop').find('.with').children().length - 1); //subtract handshake icon

        activeCount += waitIcons + withIcons;
      }

      if (activeCount >= 5) {
        if (_el.hasClass('active')) _el.removeClass('active'); //allow removal of active
        else this.addErrorClass(_el); // error if trying to add another
      } else _el.toggleClass('active');

      if (_el.hasClass('close-department')) _el.siblings('.department').removeClass('active'); // if depart is selected, only allow depart to be active
      else _el.siblings('.close-department').removeClass('active'); // remove active from depart if another department is selected
    }
    /* Function adds additional address form to a 'new card' */

  }, {
    key: 'addNewCardAddressForm',
    value: function addNewCardAddressForm(_el) {
      var _el2 = _el.parents('.drop').find('.address-drop-area');
      _el2 = _el2[_el2.length - 1]; //find last address
      $('<section class="drop-area address-drop-area">\n          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true"></i> Clear</button></div>\n          <div class="selected-address">\n          </div>\n          <div class="drop-area-row address-row">\n            <input type="number" placeholder="#" class="add-num">\n            <input type="text" placeholder="Street St." class="add-street">\n            <input type="number" placeholder="Parcel #" class="par-num" min="0">\n          </div>\n          <div class="drop-area-row address-results-row"></div>\n          <div class="owner-array"></div>\n          <div class="code-enforcement"></div>\n        </section>').insertAfter($(_el2)); //add form to end
      _el.hide();
    }
    /* Function sets element to loading circles and removes the card from page. Used when creating a new record */

  }, {
    key: 'setElementIsLoading',
    value: function setElementIsLoading(_el) {
      _el.html('<section class="loader"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></section>');
      setTimeout(function () {
        // console.log("drop was removed from page");
        _el.parents('.drop').remove();
      }, 2000);
    }
    /* Function sets element to loading circles. Same as previous function, but doesnt remove card from page */

  }, {
    key: 'setElementIsLoading2',
    value: function setElementIsLoading2(_el) {
      _el.html('<section class="loader"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></section>');
    }
    /* Function clears all chat messages from the chat box */

  }, {
    key: 'clearChatMessages',
    value: function clearChatMessages(currentTime) {
      $('.last-refresh-timer').text(currentTime);
      $('.chat-messages ul').html("");
      $('.chat-message-count').text("0");
      $('#chat-message-box').val("");
      $('#no-chats').show();
    }
    /* Function updates the list of options in the department dropdown modal*/

  }, {
    key: 'updateDepartmentOptions',
    value: function updateDepartmentOptions(department) {
      var _departmentOptions = '';
      if (department == null || department == "Admin" || department == "Reception" || department == "Application Services") {
        //has all choices
        department = ['Reception', 'Application Services Review', 'Real Property Review', 'Building Residential Review', 'Building Commercial Review', 'Site Development Review', 'Land Use Review', 'Fire Protection Review', 'Traffic Review', 'Historic Review', 'Permit Specialist'];
      }
      department = typeof department == 'string' ? department.split(",") : department;

      for (var i = 0; i < department.length; i++) {
        if (department[i] == "Building Review") {
          //split building into both res and com
          department[i] = "Building Commercial Review";
          department.push("Building Residential Review");
        } else if (department[i] == "Building") department[i] = 'Building Residential Review';

        _departmentOptions += '<option value="' + department[i] + '">' + department[i] + '</option>';
      }

      $('.department-modal .department-select').html(_departmentOptions);
    }
    /* Function updates header with user info */

  }, {
    key: 'login',
    value: function login(userFullName) {
      $('body').removeClass('not-logged-in');
      $('h1').text('Welcome to Tracker, ' + userFullName);
    }
    /* Function clears header to initial state */

  }, {
    key: 'logout',
    value: function logout() {
      $('body').addClass('not-logged-in');
      $('h1').text('Welcome to Tracker, please log in...');
      $('#un').val("").focus();
      $('.reception-bucket,.review-bucket,.departed-bucket').find('.drop').remove();
    }

    /* Function resets cards with new department selected in department dropdown */

  }, {
    key: 'departmentChange',
    value: function departmentChange(icon) {
      $('.department-icon').html(icon); // Change menu icon based on selection

      $('.drop').each(function () {
        $(this).removeClass('waiting-for-reception').removeClass('waiting-for-me').removeClass('with-me'); // remove drop classes to reset based on icons
        var _wait = $(this).find('.wait');
        var _with = $(this).find('.with');

        if (_wait.length && _wait.html().toString().includes(icon)) {
          // icon found in waiting list
          $(this).addClass('waiting-for-me');
          $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Check In'); //update button text
          if (icon == '<i class="fa fa-user reception-icon" aria-hidden="true" title="Reception"></i>') {
            $(this).addClass('waiting-for-reception'); // current dept is reception
            $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Reroute'); // update button
          }
        } else if (_with.length && _with.html().toString().includes(icon)) {
          // icon found in with list
          $(this).addClass('with-me');
          $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Check Out'); //update button
        }
      });
    }

    /* Function generates html for card subheader */

  }, {
    key: 'generateSubHeader',
    value: function generateSubHeader() {
      return '\n      <section class=\'drop-sub-header\'>\n        <textarea></textarea>\n        <i class=\'far fa-comment-dots btn standard-comments\' aria-hidden=\'true\'></i>\n        <div class=\'time-entry-wrap\'>\n          <input type=\'text\' class=\'time-entry\'>\n        </div>\n      </section>';
    }

    /* Function generates html for card routing section (subheader2) */

  }, {
    key: 'generateRouting',
    value: function generateRouting() {
      return '\n      <section class=\'drop-sub-header2\'>\n        <div class=\'drop-area-row department-select-row\'>\n          <div class="btn department"><i class="fa fa-home real-property-icon" aria-hidden="true"></i> <span>Real Property</span></div>\n            <div class="btn department"><i class="fas fa-warehouse building-icon" aria-hidden="true"></i> <span>Residential Building</span></div>\n            <div class="btn department"><i class="fa fa-building building-icon" aria-hidden="true"></i> <span>Commercial Building</span></div>\n            <div class="btn department"><i class="fa fa-truck site-icon" aria-hidden="true"></i> <span>Site</span></div>\n            <div class="btn department"><i class="fa fa-map land-use-icon" aria-hidden="true"></i> <span>Land Use</span></div>\n            <div class="btn department"><i class="fa fa-fire fire-icon" aria-hidden="true"></i> <span>Fire</span></div>\n            <div class="btn department"><i class="fa fa-car traffic-icon" aria-hidden="true"></i> <span>Traffic</span></div>\n            <div class="btn department"><i class="fa fa-history historic-icon" aria-hidden="true"></i> <span>Historic</span></div>\n            <div class="btn department"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true"></i> <span>Permit Specialist</span></div>\n            <div class="btn department"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true"></i> <span>Application Services</span></div>\n          <div class=\'btn department close-department\'><i class=\'fas fa-sign-out-alt depart-icon\' aria-hidden=\'true\'></i> <span>Depart</span></div>\n        </div>\n      </section>';
    }

    /* Function generates html for card add additional reviewers section */

  }, {
    key: 'generateAddReviews',
    value: function generateAddReviews() {
      return '<section class=\'reception-add-review drop-area\'>\n      <div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Add Departments:</span></div>\n       <div class="drop-area-row department-select-row">\n          <button class="btn department activate-department-btn"><i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i> <span style="display:none">Real Property Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i> <span style="display:none">Building Residential Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i> <span style="display:none">Building Commercial Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i> <span style="display:none">Site Development Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i> <span style="display:none">Land Use Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i> <span style="display:none">Fire Protection Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i> <span style="display:none">Traffic Review</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i> <span style="display:none">Historic Review</span></button>\n          <button class="btn department activate-department-btn"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i> <span style="display:none">Permit Specialist</span></button>\n          <button class="btn department activate-department-btn"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true" title="Application Services"></i> <span style="display:none">Application Services Review</span></button>\n          <button class="btn department activate-department-btn add-department"><i class="fa fa-check" aria-hidden="true" title="Activate Departments"></i> <span>Add</span></button>\n          </div>\n        </section>';
    }

    /* Function generates html for address hyperlinks to DART map */

  }, {
    key: 'getAddressLinks',
    value: function getAddressLinks(arr) {
      var _links = [];
      for (var i = 0; i < arr.length; i++) {
        if (_typeof(arr[i]) == 'object') _links.push('http://geobase-dbnewer/website/DART/StaffMap/index.html?find=' + arr[i].streetAddress); //needed for update function on create
        else _links.push('http://geobase-dbnewer/website/DART/StaffMap/index.html?find=' + arr[i]);
      }
      return _links;
    }

    /* Function generates html for additional card addresses */

  }, {
    key: 'drawAdditionalAddresses',
    value: function drawAdditionalAddresses(address, link, parcel) {
      var _display = '<section class=\'drop-area additional-addresses\'>';

      // Skip first address
      for (var i = 1; i < address.length; i++) {
        if (_typeof(address[i]) == 'object') address[i] = address[i].streetAddress;
        var parcelNumber = '';
        if (_typeof(parcel[i]) != undefined) {
          parcelNumber = _typeof(parcel[i]) == 'object' ? ' - ' + parcel[i].parcelNumber : ' - ' + parcel[i];
        }

        _display += '\n        <a class=\'address-link\' href=\'' + link[i] + '\' target=\'_blank\' title="Find address on DART">\n          <span class=\'address\'>' + address[i] + '</span><span class=\'parcel\'>' + parcelNumber + '</span>\n        </a>';
        if (i != address.length - 1) {
          _display += '<br>';
        }
      }
      _display += '</section>';
      return _display;
    }

    /* Utility Function adds class to element */

  }, {
    key: 'addClass',
    value: function addClass(el, className) {
      el.addClass(className);
    }
    /* Utility Function removes class to element */

  }, {
    key: 'removeClass',
    value: function removeClass(el, className) {
      el.removeClass(className);
    }
    /* Utility Function sets elements html */

  }, {
    key: 'setHtml',
    value: function setHtml(element, html) {
      element.html(html);
    }
    /* Utility Function that gets the waiting time from a timestamp */

  }, {
    key: 'getWaitTime',
    value: function getWaitTime(t) {
      var _now = new Date();
      var _then = new Date(parseInt(t));
      var _t = (_now - _then) / 1000;
      var _m = Math.floor(_t / 60);
      var _s = _t - _m * 60;

      _m = this._timeDigit(_m); //pretty strings
      _s = this._timeDigit(_s);

      return _m + ':' + _s;
    }
    /* Utility Function to beautify digits and make sure they are always length 2 */

  }, {
    key: '_timeDigit',
    value: function _timeDigit(_t) {
      var _digit = Math.round(_t);

      if (_digit > 0) {
        if (_digit < 10) return '0' + _digit;else return _digit.toString();
      }
      return '00';
    }
    /* Utility Function that converts a timestamp string into a time of day */

  }, {
    key: 'convertTimeStamp',
    value: function convertTimeStamp(t) {
      var _date = void 0;
      var _offSet = new Date().getTimezoneOffset() / 60; //offsets for daylight savings

      if (_offSet < 10) {
        _offSet = '0' + _offSet;
      }

      _date = new Date(t.replace(' ', 'T') + '-' + _offSet + ':00');

      var hh = _date.getHours(),
          h = hh,
          min = ('0' + _date.getMinutes()).slice(-2),
          ampm = 'AM';

      if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
      } else if (hh == 12) {
        h = 12;
        ampm = 'PM';
      } else if (hh == 0) {
        h = 12;
      }

      return h + ':' + min + ' ' + ampm;
    }
  }]);

  return View;
}();
/***************************************************************************
Filename: zhandlers.js
Description: This file is intended to hold all of the client event listeners
that the user interacts with on the DOM. All handlers should invoke a controller
method.
****************************************************************************/


(function (_) {
  var main = new Main(); //instantiate controller, view, cookies and socket   

  /* Page element handlers */
  $(document).on('touchstart click', '.modal .close', function () {
    // handler to close modal windows
    main.controller.modalHandler('.modal');
  });
  $(document).on('click', '.info-modal .accordion', function () {
    // toggles accordion menus in info modal
    main.controller.toggleAccordion($(this));
  });
  $(document).on('click', '.new-drop-btn', function (e) {
    // creates new card form 
    e.preventDefault();
    main.controller.createNewCardElement();
  });
  $(document).on('mouseleave', '.standard-comment-list-wrap', function (e) {
    // removes standard comment from view once you navigate away from it
    $('.standard-comment-list-wrap').removeClass('open');
  });
  $(document).on('click', '.error-message', function (e) {
    // reloads the page if you click the error message
    window.location.reload();
  });
  $(document).on('click', '.code-enforcement', function () {
    // opens the code enforcement button to view details
    main.controller.openElement($(this));
  });
  $(document).on('click', '.login-modal-opener', function () {
    // opens login modal, or logs out
    main.controller.loginButtonClick();
  });
  $(document).on('click', '.calendar-modal-opener', function () {
    // opens calendar modal **Removed from current version
    main.controller.modalHandler('.calendar-modal');
  });
  $(document).on('click', '.department-icon', function () {
    // opens the department switch modal
    main.controller.modalHandler('.department-modal');
  });
  $(document).on('click', '.info-modal-opener', function () {
    // opens the info modal
    main.controller.modalHandler('.info-modal');
  });
  $(document).on('click', '.email-icon', function () {
    // opens the email modal
    main.controller.emailIconClicked($(this));
  });
  $(document).on('click', '.mobile-menu-open', function () {
    // opens menu options when viewing on mobile
    main.controller.openElement($('.menu ul'));
  });
  $(document).on('click', '.login-submit-btn', function (e) {
    // submits login data to server
    e.preventDefault();
    main.controller.validateLogin($('#un').val());
  });
  $(document).on('keypress', '#un', function (e) {
    // submits login data to server on 'enter' key
    if (e.which == 13) {
      e.preventDefault();
      main.controller.validateLogin($('#un').val());
    }
  });
  $(document).on('click', '.chat-submit-btn', function (e) {
    //sends new chat to chat box
    e.preventDefault();
    main.controller.sendNewMessage($('#chat-message-box').val());
  });
  $(document).on('keypress', '#chat-message-box', function (e) {
    // sends new chat to chat box on 'enter' key
    if (e.which == 13) {
      e.preventDefault();
      main.controller.sendNewMessage($('#chat-message-box').val());
    }
  });
  $(document).on('click', '.department-modal .submit-btn', function () {
    // submits department change to server
    main.controller.departmentChange();
  });
  $(document).on('click', '.email-modal .submit-btn', function () {
    //sends email from server
    main.controller.sendEmail($(this));
  });
  $(document).on('click', '.email-modal .clear-btn', function () {
    // clears email fields 
    main.controller.clearEmailModal($('.email-modal'));
  });
  $(document).on('click', '.drop .record-number', function () {
    // opens/collapses  card
    main.controller.openElement($(this).parents('.drop'));
  });
  $(document).on('click', '.chat-drop-header, .stat-drop-header', function () {
    // opens/collapses chat box
    main.controller.openElement($(this).parents('.drop'));
  });
  $(document).on('click', '.drop .submit-btn', function () {
    // submits new card to server
    main.controller.validateAndCreateNewCard($(this));
  });
  $(document).on('click', '.drop .clear-btn', function () {
    // clears chats from chatbox or deletes new card form
    if ($(this).parents('.chat-drop-area').length) main.controller.clearChatMessages();else main.controller.deleteNewCardElement($(this));
  });
  $(document).on('click', '.drop .department-select-row .btn, .activate-department-btn', function () {
    // activates selected department for routing
    main.controller.selectRoutingDepartment($(this));
  });
  $(document).on('click', '.add-department', function () {
    // submits add departments mid cycle
    main.controller.activateDepartmentInCycle($(this));
  });
  $(document).on('click', '.drop .clear-address', function () {
    // clears address form
    main.controller.clearAddressSelection($(this).parents('.address-drop-area'));
  });

  $(document).on('click', '.drop .check-in-btn', function () {
    // begins update workflow process when check in button is clicked
    main.controller.initializeUpdateWF($(this));
  });
  $(document).on('click', '.drop .standard-comments', function (e) {
    // hide/show standard comments by department
    main.controller.toggleStandardComments($(this), e);
  });
  $(document).on('click', '.standard-comment-list-item', function () {
    // sends chosen standard comment to comment field
    main.controller.chooseStandardComment($(this));
  });
  $(document).on('focus', '.time-entry', function () {
    // hide show time entry icon
    main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('blur', '.time-entry', function () {
    //hide show time entry icon
    if ($(this).val() != "") main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');else main.controller.removeClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('keyup', '.time-entry', function (e) {
    //hide show time entry icon
    if ($(this).val() != "") main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('click', '.departed-toggle', function () {
    // hide or show the departed column instead of the chat box
    main.controller.toggleDepartedColumn();
  });
  $(document).on('click', ".multi-address-btn", function () {
    // adds new address form for multiple addresses
    main.controller.addNewCardAddressForm($(this));
  });
  $(document).on('click', ".add-dep-btn", function () {
    // Show/Hide additional departments for mid cycle activation
    main.controller.showAdditionalDepartments($(this));
  });
  $(document).on('click', ".logo", function () {
    // sends reset command to server
    main.controller.restartServer();
  });
  $(document).on('click', ".address-choice", function () {
    // selects address choice
    main.controller.toggleNewCardAddress($(this));
  });
  $(document).on('click', '.drop .clear-selected-address', function () {
    // reset address form
    main.controller.resetNewCardAddress($(this).parents('.address-drop-area'));
  });
  $(document).on('click', '.iteam-feedback', function (e) {
    // easter egg! shake the buckets
    e.preventDefault();
    main.controller.sendIteamFeedback();
  });
  $(document).on('click', '.hidden-clicker', function (e) {
    // easter egg! shake the buckets
    e.preventDefault();
    main.controller.shakeBuckets();
  });
  $(document).on('keyup', '#email-search-input', function (e) {
    // searches user database for user emails with given search criteria
    main.controller.searchEmail($(this).val());
  });
  $(document).on('change', '.email-search-result input', function (e) {
    // searches user database for user emails with given search criteria
    main.controller.addEmailToRecipientList($(this));
  });
  $(document).on('click', '.email-close', function (e) {
    // searches user database for user emails with given search criteria
    main.controller.removeEmailFromRecipientList($(this).parent('li'));
  });
})();