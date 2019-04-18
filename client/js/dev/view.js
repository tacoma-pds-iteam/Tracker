/***************************************************************************
Filename: view.js
Description: This class is intended to contain all UI modification functions. 
Any action that requires server contact should go through the controller class
as the driver. All functions listed here should be fired from the controller class or another
view function.
****************************************************************************/
class View {
	constructor(){
    setInterval(_ => {
      this.setWaitTimeCounter(this); //update last action time every second for every card
    }, 1000);    
  }

  /* Function expands or collapses the accordion panels on the info modal */
  toggleAccordion(_el){
    _el.next('.accordion-panel').toggle(); // show/hide content
    if(_el.find('i').hasClass('fa-plus'))
      _el.find('i').removeClass('fa-plus').addClass('fa-minus'); // update icons
    else
      _el.find('i').removeClass('fa-minus').addClass('fa-plus');

  }
  /* Function updates time counter on every card */
  setWaitTimeCounter(obj) {
    // Changes time of all 
    $('.current-wait-time time').each(function () {
      let _split = $(this).html().split(':'); 
      let _m = parseInt(_split[0]); // get min
      let _s = parseInt(_split[1]); // get sec

      _s++; //increment
      if (_s >= 60) { //if hit 60 seconds, increment min
        _s -= 60;
        _m++;
      }

      _s = obj._timeDigit(_s); //get clean strings
      _m = obj._timeDigit(_m);

      $(this).html(`${_m}:${_s}`); // update card

      if (parseInt(_m) >= 15) { // flash red if over 15 mins
        $(this).parents('.current-wait-time').addClass('long-wait');
      } else {
        $(this).parents('.current-wait-time').removeClass('long-wait');
      }
    });
  }
  /* Function updates card once additional address is selected. Updates button to clear instead of search */
  toggleNewCardAddress(el){
    let add = el.parents('.address-drop-area');
    el.parents('.drop').find('.multi-address-btn').toggle();
    add.find('.search-address').toggle();
    add.find('.clear-address').removeClass('clear-address').addClass('clear-selected-address');
    add.find('.selected-address').html(`<div class="btn active">${el.html()}</div>`);
    add.find('.drop-area-row').hide();
    add.find('.address-title-row').show();
  }
  
  /* Function resets html for entering a new address. Fires when the clear button is selected. */
  resetNewCardAddress(el){
      el.html(`
          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true"></i> Clear</button></div>
          <span class="selected-address"></span>
          <div class="drop-area-row address-row">
            <input type="number" placeholder="#" class="add-num">
            <input type="text" placeholder="Street St." class="add-street">
            <input type="number" placeholder="Parcel #" class="par-num" min="0">
          </div>
          <div class="drop-area-row address-results-row"></div>
          <div class="owner-array"></div>
          <div class="code-enforcement"></div>`);
    el.parents('.drop').find('.multi-address-btn').toggle();
  }
  /* Function updates the search result list */
  updateEmailSearchResults(results){
    // if(!results.length) $('.email-search-results ul').html(`The search provided no results`);
    $('.email-search-results ul').html('');
    for(let i=0;i<results.length;i++){
      $('.email-search-results ul').append(`<li class="email-search-result"><input type="checkbox"> ${results[i]}</li>`);
    }
  }
  /* Function clears all fields in the email modal */
  clearEmailResults(){
    $('.email-search-results ul').html("");
    $('#email-search-input').val("");
  }
  /* Function adds user to the recipient list based on name and email(s). Also increases the counter by 1. */
  addEmailToRecipientList(name, email){
    $('.email-to-list ul').append(`<li class="email-btn email-to">
                <span class="email-recipient" title="${email}">${name}</span>
                <span class="email-close"><i class="fas fa-times-circle"></i></span>
              </li>`);
    $('.email-to-list .recipient-count').html($('.email-to-list ul li').length);
  }
  /* Function removes email recipient from list and updates the counter */
  removeEmailFromRecipientList(el){
    el.remove();
    $('.email-to-list .recipient-count').html($('.email-to-list ul li').length);
  }
  /* Function sets email fields to content  in parameters */
	setEmailFields(el, subject, body){
      el.find('#email-subject').val(subject);
      el.find('#email-body').val(body);
	}
  /* Function clears email fields */
	clearEmailModal(el){
    el.find('input').val("");
    el.find('textarea').val("");
    el.find('ul').html("");
    el.find('.recipient-count').html('0');
  }
  /* Function hides/shows the departed column. toggles chat column */
	toggleDepartedColumn(){
    	$('.departed-bucket').toggle();
    	$('.chat-bucket').toggle();
	}	
	/* Function clears inputs from address fields */
	clearAddressSelection(_el){
		_el.find('.address-row input').val("");
	}
  /* Function toggles open class on an element. Mainly for 'opening' cards to view additional info */
	openElement(_el){
    if ($('.department-modal .department-select').val() == 'Reception') {
    // Show add department section if reception is selected
      $('.add-dep-btn').show();
    } else {
      $('.add-dep-btn').hide();
    }

		_el.toggleClass('open');
	}
  /* Function adds error classes to elements. Typically used for form validation errors */
	inputError(nopeElement, errElement){
		$(nopeElement).addClass('nope');
	      $(errElement).addClass('err');
	      setTimeout(_ => {
	        $(nopeElement).removeClass('nope');
	        $(errElement).removeClass('err').focus();
	      }, 500); //remove after half second
	}
  /* Function adds error class to element */
	addErrorClass(_el){
		_el.addClass('err');
		setTimeout(_ => {
		_el.removeClass('err')
		}, 1000);
	}
  /* Function adds activity message to activity log */
  addActivity(message, time, dept){
    $('.activity-log .drop-area ul').append(`<li class="activity-${dept}">${time}: ${message}</li>`);
  }
  /* Function adds new message to chat box. Uses department logic to update text color depending on who sent the message. */
	addNewMessage(message, time, name, dept){
    let m = `<li><time>${time}</time>  <span class="chat-${dept}"><b>${name}</b>:</span> <span>${message}</span></li> `;
    var container = $('.chat-messages')[0];
    var containerHeight = container.clientHeight;
    var contentHeight = container.scrollHeight;
    var isBottom = contentHeight - containerHeight - container.scrollTop <= 29;


		$('.chat-messages ul').append(m);
    var messageHeight = $('.chat-messages ul')[0].clientHeight - containerHeight;
    
    $('.chat-message-count').text(parseInt($('.chat-message-count').text()) + 1); //increment counter
    if($('.chat-message-count').text() != '0') $('#no-chats').hide();


    if(isBottom) // scroll is at the bottom, stick to bottom
      container.scroll(0,messageHeight);
     //else dont scroll until back at the bottom
	}
  /* Function resets messages in chat box */
	resetChatBox() {
		$('#chat-message-box').val("");
	}
  /* Function updates the 'currently logged in' box with user initial circles*/
	updateLoggedInUsers(users){
      $('.logged-in-users ul').html("");
      $('.chat-users').html(`(${users.length})`); //total users logged in

      for (let i in users) {
        let dept = users[i].user_dept;
        if (users[i].user_dept != null) {
          dept = dept.split(" ")[0].split(",")[0]; // take first word of dept for class name
          if(dept.toLowerCase() == 'buildingc') dept = 'building'; // chop off c for commercial building
        } else {
          dept = "Admin"; //default admin
        }
        let user = `<li class="avatar-circle avatar-circle-${dept.toLowerCase()}" data-tooltip="true" data-tooltip-pos="bottom" data-tooltip-text="${users[i].user_first} ${users[i].user_last}">
          <span class="initials">${users[i].user_initials}</span></li>`; //generate html
        $('.logged-in-users ul').append(user); //push html
      }
	}

  /* Function draws card to page if it doesnt already exist */
	drawCard(cardData){
    console.log(cardData);
    let _currentDepartment = $('.department-modal .department-select').val();
    let _createCard = '';
    let _departmentIcons = '';
    let _waitingForMe = '';
    let _withMe = '';
    let _reception = '';
    let _waitingForTime = '';
    let _content = '';
    let _checkBtn = '';
    // HTML empty variables
    let _routeGroups = '';
    let _subHeader = '';
    let _addReviewers = '';
    let _addAddresses = '';

    // Fix Description if required
    let _description = decodeURIComponent(cardData.description);

    // Generate starting wait time
    let _waitTime = this.getWaitTime(cardData.shortNotes.time);

    // Assigned variable to wait/with array
    let _wait = cardData.shortNotes.waiting;
    let _with = cardData.shortNotes.with;

    let _wfArea = this.drawWf(cardData.workflowHistory); // generate workflow history html

    if(typeof _wait == 'undefined') _wait = [""];
    if(typeof _with == 'undefined') _with = [""];
    _wait = _wait.filter(d => d.length > 0); //filters out empty strings
    _with = _with.filter(d => d.length > 0);

    // Only set HTML if there is a waiting or with customer
    if (_wait || _with) {
      if(_wait.indexOf(_currentDepartment) >= 0) _waitingForMe = ' waiting-for-me'; // add my classes to card
      if(_with.indexOf(_currentDepartment) >= 0) _withMe = ' with-me';
      _departmentIcons = this.generateIcons(_wait, _with); //generate icons html

      // Variables used to determine if card is another section of wf
      let _curReception = false, _curDeparted = false;

      _routeGroups = this.generateRouting(); // routing department html

      // Set reception html and class if wait starts with reception and none with
      if (_wait.indexOf('Reception') >= 0 && !_with.length) { 
        _reception = ' waiting-for-reception';
        _curReception = true;
        _checkBtn = 'Reroute';
      }

      if (!_wait.length && !_with.length) { // Not waiting with anyone, send to departed column
        // console.log('record is not waiting or with any reviewers. sending to departed...');
        _curDeparted = true;
      }

      // Set subheader if current department is with customer
      _subHeader = this.generateSubHeader();

      // Add section for mid-workflow reviewers
      _addReviewers = this.generateAddReviews();

      // example: _addresses = ['2338 S Wilkeson St', '4715 Slayden Rd', '1102 A St'];
      let _addresses = cardData.address;
      let _parcels = cardData.parcels;
      let _addressLinks = this.getAddressLinks(_addresses); //generate hyperlinks for addresses
      let _addAddresses = '';
      let _firstAddress = typeof _addresses[0] == 'object' ? _addresses[0].streetAddress : _addresses[0];
      if(_parcels.length){
        let _firstParcel = _parcels[0];
        _firstAddress += ` - ${_firstParcel}`;
      }

      if (_addresses.length > 1) {
        _addAddresses = this.drawAdditionalAddresses(_addresses, _addressLinks, _parcels); //generate html for multi address if exists
      }

      if(cardData.customerName.length) { //capitalize name
       cardData.customerName[0] = cardData.customerName[0].slice(0,1).toUpperCase() + cardData.customerName[0].slice(1);
      }
      
      // set full card html
      _createCard = `
        <article class='drop existing-drop pre${_waitingForMe}${_withMe}${_reception}' id='${cardData.recordNumber}'>
          <span style='display:none' class='timeStamp'>${cardData.shortNotes.time}</span>
          <header class='drop-header'>
            <h3>
              <span class='record-number'>${cardData.recordNumber}</span> <span class='icons'>${_departmentIcons}</span>
            </h3>
            ${_routeGroups}
            ${_subHeader}
          </header>
          <section class='information-area'>
            <h4 class='customer-name'>${cardData.customerName}</h4>
            <a class='address-link' href='${_addressLinks[0]}' target="_blank" title="Find address on DART">
              <i class='fas fa-map-marker-alt' aria-hidden='true'></i> <span class="address">${_firstAddress}
              </span>
            </a>
            <div class='current-wait-time'><span>Last Action...</span><time>${_waitTime}</time></div>
          </section>
          ${_addAddresses}
          <section class='drop-area description-area'>
            ${_description}
            <div class='shade'></div>
          </section>
          <section class='loader comment-area drop-area'>
            <header>
              <h4>Workflow History:</h4>
              <span class='btn-content'>
                <button class='btn add-dep-btn'>
                  <i class='fas fa-plus' aria-hiden='true'></i> Department
                </button>
              </span>
            </header>
            ${_wfArea}
          </section>
          ${_addReviewers}
        </article>`;
      
      let _id = '#' + cardData.recordNumber; // id for reference
      // Write card to correct section
      if (_curReception) { //in reception column
        $('.reception-bucket .wait-drop-area').append(_createCard);
      } else if (_curDeparted) { // in departed
        $('.departed-bucket .depart-drop-area').append(_createCard);
        $(_id).find('.current-wait-time').text(""); //remove timer
        $(_id).appendTo('.departed-bucket .depart-drop-area');
        $(_id).find('.drop-sub-header').hide(); // hide sub header
      } else if (_wait.length) {  //in review waiting column
        $('.review-bucket .wait-drop-area').append(_createCard);
      } else { //in review with column
        $('.review-bucket .with-drop-area').append(_createCard);      
      }
  	}
  }
    /* Function updates the contacts and addresses of a specific card */
  updateContactAddress(data){
    console.log(data);
    let _id = '#' + data.recordId; // card identifier
    let mapIcon = '<i class="fas fa-map-marker-alt" aria-hidden="true"></i> ';
    if(data.contact.length){ //set contact if exists
      let name = data.contact[0].firstName;
      $(_id).find('.customer-name').html(name.slice(0,1).toUpperCase() + name.slice(1));
    }
    if(data.addresses){ //set addresses if exists
      let _addresses = data.addresses;
      let _parcels = [];
      let _addressLinks = this.getAddressLinks(_addresses);
      let _addAddresses = '';
      let _firstAddress = typeof _addresses[0] == 'object' ? _addresses[0].streetAddress : _addresses[0];
      if(data.parcels.length){
        _parcels = data.parcels;
        let _firstParcel = _parcels[0].parcelNumber;
        _firstAddress += ` - ${_firstParcel}`;
      }
      if (_addresses.length > 1) { //generate multi address html
        _addAddresses = this.drawAdditionalAddresses(_addresses, _addressLinks, _parcels);
      }
      if(typeof _firstAddress == 'object') //type validation
        _firstAddress = _firstAddress.streetAddress;

      $(_id).find('.address-link').html(mapIcon + _firstAddress);
      $(_id).find('.address-link').attr("href", `http://wsitd03/website/DART/StaffMap/index.html?find=${_firstAddress}`);
      $(_id).find('.information-area').after(_addAddresses);
    }
  }
  /* Function generates the html for a cards addresses and parcels*/
  generateAddressSection(data){
    console.log(data);
    let _id = '#' + data.recordId; // card identifier
    let _html = `<a class='address-link' href='' target="_blank" title="Find address on DART">
              <i class='fas fa-map-marker-alt' aria-hidden='true'></i> <span class="address">
              </span>
            </a>`; 
    if(data.addresses.length){ 
      let _addresses = data.addresses;
      let _parcels = [];
      let _addressLinks = this.getAddressLinks(_addresses);
      let _firstAddress = _addresses[0];
      if(data.parcels.length){
        _parcels = data.parcels;
        let _firstParcel = _parcels[0].parcelNumber;
        _firstAddress += ` (${_firstParcel})`;
      }
    }
    
  }
  /* Function updates workflow history of a specific card*/
  updateWorkflowHistory(data){
    let _id = '#' + data.recordId; //card identifier
    $(_id).find('.reception-add-review').hide();
    $(_id).removeClass('open');
    $(_id).find('.reception-add-review').html(`<div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Add Departments:</span></div>
       <div class="drop-area-row department-select-row">
          <button class="btn department activate-department-btn"><i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i> <span style="display:none">Real Property Review</span></button>
          <button class="btn department activate-department-btn"><i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i> <span style="display:none">Building Residential Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i> <span style="display:none">Building Commercial Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i> <span style="display:none">Site Development Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i> <span style="display:none">Land Use Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i> <span style="display:none">Fire Protection Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i> <span style="display:none">Traffic Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i> <span style="display:none">Historic Review</span></button>
          <button class="btn department activate-department-btn"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i> <span style="display:none">Permit Specialist</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true" title="Application Services"></i> <span style="display:none">Application Services Review</span></button>
          <button class="btn department activate-department-btn add-department"><i class="fa fa-check" aria-hidden="true" title="Activate Departments"></i> <span>Add</span></button>
          </div>`); // reset add review section

    if(data.workflowHistory.length){ // if any workflow history at all
      $(_id).find('.comment-area').html(`<header>
              <h4>Workflow History:</h4>
              <span class="btn-content">
                <button class="btn add-dep-btn" style="display: inline-block;">
                  <i class="fas fa-plus" aria-hiden="true"></i> Department
                </button>
              </span>
            </header>`); //reset header
      //console.log(data.workflowHistory);
      let workflowHtml = this.drawWf(data.workflowHistory); //generate WH html
      $(_id).find('.comment-area header').after(workflowHtml); //append to card
    }
  }
  /* Function generates the html for each workflow entry */
  drawWf (wf) {
    let _display = '';
    let _commentClass = '', _isRecep = '', _time = '', _comment = '';
    let _accelaComment = '', _lastComment = '', _status = '';

    if (wf.length) { //if any workflow to draw
      _display += `<ul class='comments'>`; //start list
      for (let i = 0; i < wf.length; i++) {
        if (wf[i].fullName && wf[i].timeStamp) { //entry must have user and timestamp to push into history
          if (i == wf.length - 2) {
            _lastComment = 'last-comment'; // I dont think this matters anymore, but im leaving it for now
          }

          if (wf[i].fullName == 'Accela Action') { // If workflow was done by automation (TSI updates)
            _accelaComment = ' accela-comment';
          }

          _commentClass = this.getTaskCommentClass(wf[i].task); //gets class of comment
          // Set display variables
          _time = this.convertTimeStamp(wf[i].timeStamp); //cleans timestamp
          _comment = this.removeCommentSignature(wf[i].comment); // cleans comment (removes initials)
          try {
            _comment = decodeURIComponent(_comment); //decodes any uri text in comment
          } catch(e){} // if decoding breaks, just skip it          
          
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
          _display += `
            <li class='comment'>
              <div class='comment-header'>
                ${icons[wf[i].task]}
                <div class='comment-description'>
                  <time class='timestamp'>${_time}:</time>
                <span class='comment-author comment-${wf[i].task}'>${wf[i].fullName}</span>
                </div>
                <div class='comment-status'>[${_status}]</div>
              </div>
              <div class='comment-content-area'>
                ${_comment}
              </div>
              <!--<hr class='${_lastComment}'>-->
            </li>`;
        }
      }
      _display += `</ul>`; //close list

      return _display;
    }
  }

  /* Function converts task into which class to add for workflow history entries */
  getTaskCommentClass(task) {
    let _class = '';

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
      _class =  'comment-fire';
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
  removeCommentSignature (_comment) {
    if (_comment != '' && typeof(_comment) != 'undefined') {
      return _comment.slice(-1) == ']' ?
          _comment.substr(0, _comment.split('').length - 6) :
          _comment;
    } else if (_comment == '')
      return _comment;
    else
      return '';
  }

  /* Function updates the card based on the shortnotes received. updates headers and icons and also moves to correct bucket */
  updateCardShortNotes (cardData) {
    let _id = '#' + cardData.recordNumber;
    let _shortNotes = cardData.shortNotes;
    let waitArray = _shortNotes.waiting;
    let withArray = _shortNotes.with;
    let existingCard = $(_id);
    let _currentDepartment = $('.department-modal .department-select').val();
    let currentBucket = 'Departed'; // default bucket

    if(existingCard.parents('.reception-bucket').length) currentBucket = 'Reception';
    else if (existingCard.parents('.wait-drop-area').length) currentBucket = 'Waiting';
    else if (existingCard.parents('.with-drop-area').length) currentBucket = 'With';

    // existingCard.find('textarea, input').val(""); // reset input fields 
    existingCard.find('.btn').removeClass('active'); //deactivate all routing departments

    if(_shortNotes.type == 'Departed'){ // hide all extras, only show base card and move to departed
      existingCard.find('.drop-sub-header2, .drop-sub-header, .current-wait-time').hide();
      existingCard.find('textarea, input').val("");
      existingCard.appendTo('.departed-bucket .depart-drop-area');
      return; //dont do anything else
    }

    if (typeof waitArray == 'undefined') waitArray = [];
    if (typeof withArray == 'undefined') withArray = [];
    waitArray = waitArray.filter(d => d.length > 0); //filters out empty strings
    withArray = withArray.filter(d => d.length > 0);
    // console.log(waitArray,withArray);
    existingCard.find('.icons').html(this.generateIcons(waitArray, withArray)); //update icons and button with shortnotes data

    if(waitArray.indexOf(_currentDepartment) == -1 && withArray.indexOf(_currentDepartment) == -1) existingCard.find('.check-in-btn').hide(); // hide button if not in your department

    if(_shortNotes.time != $(_id).find('.timeStamp').text()){ //if different sn time, update last action time
      existingCard.find('.current-wait-time time').text(this.getWaitTime(_shortNotes.time));
      $(_id).find('.timeStamp').text(_shortNotes.time); //reset timestamp
    }

    existingCard.removeClass('with-me').removeClass('waiting-for-me').removeClass('waiting-for-reception'); // remove classes to update card headers
    if(waitArray.length){ //if waiting for anyone, move to wait bucket
      if(waitArray.indexOf('Reception') >= 0) {
        existingCard.appendTo('.reception-bucket .wait-drop-area'); //move to reception bucket
        existingCard.addClass('waiting-for-reception'); // add waiting-for-reception class
        if(_currentDepartment == 'Reception') existingCard.addClass('waiting-for-me');
      } else {
        existingCard.appendTo('.review-bucket .wait-drop-area'); //move to wait bucket
        if(waitArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('waiting-for-me'); //if waiting for you, show text fields by adding waiting-for-me class
        if(withArray.length && withArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('with-me'); //if waiting for someone AND with you, add with-me class to show text field
      }
    } else if(withArray.length){ //currently with some department 
      existingCard.appendTo('.review-bucket .with-drop-area'); // move to with bucket
      if(withArray.indexOf(_currentDepartment) >= 0) existingCard.addClass('with-me'); //if with you, show text fields by adding with-me class
    } else { //(!withArray.length && !waitArray.length) { //welp, guess it goes in departed since it has nowhere else to go
      existingCard.appendTo('.departed-bucket .depart-drop-area');
    }
  }
  /* Function toggles the hide/show of the additional departments section on a card */
  showAdditionalDepartments(el) {
    if (el.parents('.drop').find('.reception-add-review').is(':visible')) {
      el.parents('.drop').find('.reception-add-review').hide();
    } else {
      el.parents('.drop').find('.reception-add-review').find('.department-select-row').show();
      el.parents('.drop').find('.reception-add-review').show();
    }
  }
 /* Function generates the icons on a card given each department waiting or with */
  generateIcons(waitArray, withArray){
    let buttonText = 'Check In'; //checkin by default
    let tempHtml = '';  
    let currentDepartment = $('.department-modal .department-select').val();    

    // console.log(currentDepartment, waitArray,withArray);
    //update button text
    if(withArray.indexOf(currentDepartment) >= 0) buttonText = 'Check Out';
    if(waitArray.indexOf('Reception') >= 0) buttonText = 'Reroute';


    let checkinButton = `<button class='btn check-in-btn'>
    <i class='fa fa-check' aria-hidden='true'></i> ${buttonText}</button>`;
    
    if(waitArray.length){ // add waiting icons
      tempHtml += `<span class="wait">`;
      for(let i in waitArray){
          if(i == 0) tempHtml += icons['wait']; //add clock icon
          if(typeof icons[waitArray[i]] == 'undefined') tempHtml += icons['Unknown']; //cant find icon
          else tempHtml += icons[waitArray[i]]; //department icon
      }
      tempHtml += '</span>'; //close section
    }

    if(withArray.length){ //add with icons
      tempHtml += `<span class="with">`;
      for(let i in withArray){
          if(i == 0) tempHtml += icons['with']; //add handshake icon
          if(typeof icons[withArray[i]] == 'undefined') tempHtml += icons['Unknown']; //cant find icon
          else tempHtml += icons[withArray[i]]; //department icon
      }
      tempHtml += '</span>'; //close
    }

    tempHtml += checkinButton; //add button

    return tempHtml;
  }  
  /* Function creates empty 'new customer' card for reception to fill out. Appends to top of reception bucket */
	createNewCardElement () {
    $('.reception-bucket .new-drop-area').append(`<article class="drop new-drop pre newest">
        <header class="drop-header">
          <h3><input class="customer-name" type="text" placeholder="Customer Name"></h3>
        </header>
        <section class="drop-area">
          <textarea name="record-description" class="record-description" rows="2" placeholder="Record Description"></textarea>
        </section>
        <section class="drop-area address-drop-area">
          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true" title="Search GIS Database for entered address"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true" title="Clear address entry fields"></i> Clear</button></div>
          <span class="selected-address"></span>
          <div class="drop-area-row address-row">
            <input type="number" placeholder="#" class="add-num">
            <input type="text" placeholder="Street St." class="add-street">
            <input type="number" placeholder="Parcel #" class="par-num" min="0">
          </div>
          <div class="drop-area-row address-results-row"></div>
          <div class="owner-array"></div>
          <div class="code-enforcement"></div>
        </section>
          <button class="btn multi-address-btn"><i class="fa fa-plus" aria-hidden="true"></i> Add</button>
        <section class="drop-area department-select-area">
          <div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Departments:</span></div>
          <div class="drop-area-row department-select-row">
            <div class="btn department"><i class="fa fa-home real-property-icon" aria-hidden="true"></i> <span>Real Property</span></div>
            <div class="btn department"><i class="fas fa-warehouse building-icon" aria-hidden="true"></i> <span>Residential Building</span></div>
            <div class="btn department"><i class="fa fa-building building-icon" aria-hidden="true"></i> <span>Commercial Building</span></div>
            <div class="btn department"><i class="fa fa-truck site-icon" aria-hidden="true"></i> <span>Site</span></div>
            <div class="btn department"><i class="fa fa-map land-use-icon" aria-hidden="true"></i> <span>Land Use</span></div>
            <div class="btn department"><i class="fa fa-fire fire-icon" aria-hidden="true"></i> <span>Fire</span></div>
            <div class="btn department"><i class="fa fa-car traffic-icon" aria-hidden="true"></i> <span>Traffic</span></div>
            <div class="btn department"><i class="fa fa-history historic-icon" aria-hidden="true"></i> <span>Historic</span></div>
            <div class="btn department"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true"></i> <span>Permit Specialist</span></div>
            <div class="btn department"><i class="fas fa-id-card-alt application-services-icon" aria-hidden="true"></i> <span>Application Services</span></div>
          </div>
        </section>
        <section class="drop-area action-area">
          <button class="btn clear-btn"><i class="fa fa-trash" aria-hidden="true"></i> <span>Delete</span></button>
          <button class="btn submit-btn"><i class="fa fa-arrow-right" aria-hidden="true"></i> <span>Create</span></button>
        </section>
      </article>`);
  }
  /* Function that closes any open modals */
  closeModal () {
    $('.wrap').removeClass('out-of-focus');
    $('.modals .behind').removeClass('open');
    $('.modal').addClass('out');
    setTimeout(_ => {
      $('.modal').removeClass('open').removeClass('out')
    }, 500);
  }
  /* Function opens or closes a given modal depending on current state */
  modalHandler (modal) {
  	if($(modal).hasClass('open')){ //already open, close modal instead
  		$('.wrap').removeClass('out-of-focus');
	    $('.modals .behind').removeClass('open');
	    $('.modal').addClass('out');
	    setTimeout(_ => {
	      $('.modal').removeClass('open').removeClass('out')
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
  deleteNewCardElement (_el) {
    _el.parents('.drop').addClass('pre');
    this.setElementIsLoading2(_el);
    setTimeout(_ => {
      _el.parents('.drop').remove();
    }, 500);
  }
  /* Function toggles active class to routing options (Turns buttons green). Also makes sure there arent more than 5 active selected at once */
  selectRoutingDepartment (_el) {
    let activeCount = _el.parents('.drop').find('.department.active').length;
    let waitIcons = 0, withIcons = 0;
    if(_el.hasClass('activate-department-btn')){ // check current icons on card
      waitIcons = Math.max(0,_el.parents('.drop').find('.wait').children().length - 1); //subtract clock icon
      withIcons = Math.max(0,_el.parents('.drop').find('.with').children().length - 1); //subtract handshake icon

      activeCount += waitIcons + withIcons;
    }

    if(activeCount >= 5){ 
      if(_el.hasClass('active'))
        _el.removeClass('active'); //allow removal of active
      else
        this.addErrorClass(_el); // error if trying to add another
    } else _el.toggleClass('active');

    if (_el.hasClass('close-department'))
      _el.siblings('.department').removeClass('active'); // if depart is selected, only allow depart to be active
    else
      _el.siblings('.close-department').removeClass('active'); // remove active from depart if another department is selected
  }
  /* Function adds additional address form to a 'new card' */
  addNewCardAddressForm(_el){
    let _el2 = _el.parents('.drop').find('.address-drop-area');
    _el2 = _el2[_el2.length - 1]; //find last address
    $(`<section class="drop-area address-drop-area">
          <div class="drop-area-row address-title-row"><span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> Address:</span> <button class="btn search-address"><i class="fa fa-check" aria-hidden="true"></i> Search</button> <button class="btn clear-address"><i class="fa fa-times" aria-hidden="true"></i> Clear</button></div>
          <div class="selected-address">
          </div>
          <div class="drop-area-row address-row">
            <input type="number" placeholder="#" class="add-num">
            <input type="text" placeholder="Street St." class="add-street">
            <input type="number" placeholder="Parcel #" class="par-num" min="0">
          </div>
          <div class="drop-area-row address-results-row"></div>
          <div class="owner-array"></div>
          <div class="code-enforcement"></div>
        </section>`).insertAfter($(_el2)); //add form to end
        _el.hide();  
  }
  /* Function sets element to loading circles and removes the card from page. Used when creating a new record */
  setElementIsLoading(_el){
    _el.html(`<section class="loader"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></section>`);
    setTimeout(() => {
    	// console.log("drop was removed from page");
    	_el.parents('.drop').remove();
    }, 2000);
  }
  /* Function sets element to loading circles. Same as previous function, but doesnt remove card from page */
  setElementIsLoading2(_el){
    _el.html(`<section class="loader"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></section>`);
  }
  /* Function clears all chat messages from the chat box */
  clearChatMessages(currentTime){
    $('.last-refresh-timer').text(currentTime);
    $('.chat-messages ul').html("");
    $('.chat-message-count').text("0");
    $('#chat-message-box').val("");
    $('#no-chats').show();
  }
  /* Function updates the list of options in the department dropdown modal*/
  updateDepartmentOptions(department){
    let _departmentOptions = '';
    if(department == null || department == "Admin" || department == "Reception" || department == "Application Services") { //has all choices
      department = ['Reception', 'Application Services Review', 'Real Property Review', 'Building Residential Review', 'Building Commercial Review', 'Site Development Review', 'Land Use Review', 'Fire Protection Review', 'Traffic Review', 'Historic Review', 'Permit Specialist'];
    }
    department = typeof department == 'string' ? department.split(",") : department;

    for (let i = 0; i < department.length; i++){
      if(department[i] == "Building Review"){ //split building into both res and com
        department[i] = "Building Commercial Review";
        department.push("Building Residential Review");
      } else if(department[i] == "Building") department[i] = 'Building Residential Review';

      _departmentOptions += `<option value="${department[i]}">${department[i]}</option>`;
    }

    $('.department-modal .department-select').html(_departmentOptions);
  }  
  /* Function updates header with user info */
  login(userFullName) {
  	$('body').removeClass('not-logged-in');
    $('h1').text(`Welcome to Tracker, ${userFullName}`);
  }
  /* Function clears header to initial state */
  logout() {
    $('body').addClass('not-logged-in');
    $('h1').text(`Welcome to Tracker, please log in...`);
    $('#un').val("").focus();
    $('.reception-bucket,.review-bucket,.departed-bucket').find('.drop').remove();
  }

  /* Function resets cards with new department selected in department dropdown */
  departmentChange (icon) {
    $('.department-icon').html(icon); // Change menu icon based on selection
    
    $('.drop').each(function () {
      $(this).removeClass('waiting-for-reception').removeClass('waiting-for-me').removeClass('with-me'); // remove drop classes to reset based on icons
      let _wait = $(this).find('.wait');
      let _with = $(this).find('.with');

      if(_wait.length && _wait.html().toString().includes(icon)){ // icon found in waiting list
        $(this).addClass('waiting-for-me');
        $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Check In'); //update button text
        if(icon == '<i class="fa fa-user reception-icon" aria-hidden="true" title="Reception"></i>'){ 
          $(this).addClass('waiting-for-reception'); // current dept is reception
          $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Reroute'); // update button
        }
      } else if(_with.length && _with.html().toString().includes(icon)){ // icon found in with list
        $(this).addClass('with-me');
        $(this).find('.check-in-btn').html('<i class="fa fa-check" aria-hidden="true"></i> Check Out'); //update button
      } 
    });
  }

  /* Function generates html for card subheader */
  generateSubHeader () {
    return `
      <section class='drop-sub-header'>
        <textarea></textarea>
        <i class='far fa-comment-dots btn standard-comments' aria-hidden='true'></i>
        <div class='time-entry-wrap'>
          <input type='text' class='time-entry'>
        </div>
      </section>`;
  }

  /* Function generates html for card routing section (subheader2) */
  generateRouting () {
    return `
      <section class='drop-sub-header2'>
        <div class='drop-area-row department-select-row'>
          <div class="btn department"><i class="fa fa-home real-property-icon" aria-hidden="true"></i> <span>Real Property</span></div>
            <div class="btn department"><i class="fas fa-warehouse building-icon" aria-hidden="true"></i> <span>Residential Building</span></div>
            <div class="btn department"><i class="fa fa-building building-icon" aria-hidden="true"></i> <span>Commercial Building</span></div>
            <div class="btn department"><i class="fa fa-truck site-icon" aria-hidden="true"></i> <span>Site</span></div>
            <div class="btn department"><i class="fa fa-map land-use-icon" aria-hidden="true"></i> <span>Land Use</span></div>
            <div class="btn department"><i class="fa fa-fire fire-icon" aria-hidden="true"></i> <span>Fire</span></div>
            <div class="btn department"><i class="fa fa-car traffic-icon" aria-hidden="true"></i> <span>Traffic</span></div>
            <div class="btn department"><i class="fa fa-history historic-icon" aria-hidden="true"></i> <span>Historic</span></div>
            <div class="btn department"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true"></i> <span>Permit Specialist</span></div>
            <div class="btn department"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true"></i> <span>Application Services</span></div>
          <div class='btn department close-department'><i class='fas fa-sign-out-alt depart-icon' aria-hidden='true'></i> <span>Depart</span></div>
        </div>
      </section>`;
  }

  /* Function generates html for card add additional reviewers section */
  generateAddReviews () {
   return `<section class='reception-add-review drop-area'>
      <div class="drop-area-row"><i class="fa fa-paper-plane" aria-hidden="true"></i> <span>Add Departments:</span></div>
       <div class="drop-area-row department-select-row">
          <button class="btn department activate-department-btn"><i class="fa fa-home real-property-icon" aria-hidden="true" title="Real Property"></i> <span style="display:none">Real Property Review</span></button>
          <button class="btn department activate-department-btn"><i class="fas fa-warehouse building-icon" aria-hidden="true" title="Residential Building"></i> <span style="display:none">Building Residential Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-building building-icon" aria-hidden="true" title="Commercial Building"></i> <span style="display:none">Building Commercial Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-truck site-icon" aria-hidden="true" title="Site Development"></i> <span style="display:none">Site Development Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-map land-use-icon" aria-hidden="true" title="Land Use"></i> <span style="display:none">Land Use Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-fire fire-icon" aria-hidden="true" title="Fire"></i> <span style="display:none">Fire Protection Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-car traffic-icon" aria-hidden="true" title="Traffic"></i> <span style="display:none">Traffic Review</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-history historic-icon" aria-hidden="true" title="Historic"></i> <span style="display:none">Historic Review</span></button>
          <button class="btn department activate-department-btn"><i class="far fa-id-card permit-specialist-icon" aria-hidden="true" title="Permit Specialist"></i> <span style="display:none">Permit Specialist</span></button>
          <button class="btn department activate-department-btn"><i class="fa fa-id-card-alt application-services-icon" aria-hidden="true" title="Application Services"></i> <span style="display:none">Application Services Review</span></button>
          <button class="btn department activate-department-btn add-department"><i class="fa fa-check" aria-hidden="true" title="Activate Departments"></i> <span>Add</span></button>
          </div>
        </section>`;
  }

  /* Function generates html for address hyperlinks to DART map */
  getAddressLinks (arr) {
    let _links = [];
    for (let i = 0; i < arr.length; i++) {
      if(typeof arr[i] == 'object')
        _links.push(`http://geobase-dbnewer/website/DART/StaffMap/index.html?find=${arr[i].streetAddress}`); //needed for update function on create
      else 
        _links.push(`http://geobase-dbnewer/website/DART/StaffMap/index.html?find=${arr[i]}`);
    }
    return _links;
  }

  /* Function generates html for additional card addresses */
  drawAdditionalAddresses (address, link, parcel) {
    let _display = `<section class='drop-area additional-addresses'>`;

    // Skip first address
    for (let i = 1; i < address.length; i++) {
      if(typeof address[i] == 'object') address[i] = address[i].streetAddress;
      let parcelNumber = '';
      if(typeof parcel[i] != undefined){
        parcelNumber = typeof parcel[i] == 'object' ? ` - ${parcel[i].parcelNumber}` : ` - ${parcel[i]}`;
      }
       
      _display += `
        <a class='address-link' href='${link[i]}' target='_blank' title="Find address on DART">
          <span class='address'>${address[i]}</span><span class='parcel'>${parcelNumber}</span>
        </a>`;
      if (i != address.length - 1) {
        _display += `<br>`;
      }
    }
    _display += `</section>`;
    return _display;
  }

  /* Utility Function adds class to element */
  addClass(el, className){
    el.addClass(className);
  }
  /* Utility Function removes class to element */
  removeClass(el, className){
      el.removeClass(className);
  }
  /* Utility Function sets elements html */
  setHtml(element, html){
    element.html(html);
  }
  /* Utility Function that gets the waiting time from a timestamp */
  getWaitTime(t) {
    let _now = new Date();
    let _then = new Date(parseInt(t));
    let _t = (_now - _then) / 1000;
    let _m = Math.floor(_t / 60);
    let _s = _t - (_m * 60);

    _m = this._timeDigit(_m); //pretty strings
    _s = this._timeDigit(_s);

    return `${_m}:${_s}`; 
  }
  /* Utility Function to beautify digits and make sure they are always length 2 */
  _timeDigit(_t) {
    let _digit = Math.round(_t);

    if (_digit > 0) {
        if (_digit < 10)
            return `0${_digit}`;
        else
            return _digit.toString();
    }
    return '00';
  }
  /* Utility Function that converts a timestamp string into a time of day */
  convertTimeStamp(t) {
    let _date;
    let _offSet = (new Date()).getTimezoneOffset() / 60; //offsets for daylight savings

    if (_offSet < 10) {
      _offSet = '0' + _offSet;
    }

    _date = new Date(t.replace(' ', 'T') + '-' + _offSet + ':00');

    let hh = _date.getHours(),
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
}