/***************************************************************************
Filename: zhandlers.js
Description: This file is intended to hold all of the client event listeners
that the user interacts with on the DOM. All handlers should invoke a controller
method.
****************************************************************************/
(_ => {
  const main = new Main(); //instantiate controller, view, cookies and socket   

  /* Page element handlers */
  $(document).on('touchstart click', '.modal .close', function () { // handler to close modal windows
    main.controller.modalHandler('.modal');
  });
  $(document).on('click', '.info-modal .accordion', function () { // toggles accordion menus in info modal
    main.controller.toggleAccordion($(this));
  });  
  $(document).on('click', '.new-drop-btn', function (e) { // creates new card form 
    e.preventDefault();
    main.controller.createNewCardElement();
  });
  $(document).on('mouseleave', '.standard-comment-list-wrap', function (e) { // removes standard comment from view once you navigate away from it
    $('.standard-comment-list-wrap').removeClass('open');
  });
  $(document).on('click', '.error-message', function (e) { // reloads the page if you click the error message
    window.location.reload();
  });
  $(document).on('click', '.code-enforcement', function () { // opens the code enforcement button to view details
    main.controller.openElement($(this));
  });
  $(document).on('click', '.login-modal-opener', function () { // opens login modal, or logs out
    main.controller.loginButtonClick();
  });
  $(document).on('click', '.calendar-modal-opener', function () { // opens calendar modal **Removed from current version
    main.controller.modalHandler('.calendar-modal');
  });
  $(document).on('click', '.department-icon', function () { // opens the department switch modal
    main.controller.modalHandler('.department-modal');
  });
  $(document).on('click', '.info-modal-opener', function () { // opens the info modal
    main.controller.modalHandler('.info-modal');
  });
  $(document).on('click', '.email-icon', function () { // opens the email modal
    main.controller.emailIconClicked($(this));    
  });
  $(document).on('click', '.mobile-menu-open', function () { // opens menu options when viewing on mobile
    main.controller.openElement($('.menu ul'));
  });
  $(document).on('click', '.login-submit-btn', function (e) { // submits login data to server
    e.preventDefault();
    main.controller.validateLogin($('#un').val());
  });
  $(document).on('keypress', '#un', function (e) { // submits login data to server on 'enter' key
    if (e.which == 13) {
      e.preventDefault();
      main.controller.validateLogin($('#un').val());
    }
  });
  $(document).on('click', '.chat-submit-btn', function (e) { //sends new chat to chat box
    e.preventDefault();
    main.controller.sendNewMessage($('#chat-message-box').val());
  });
  $(document).on('keypress', '#chat-message-box', function (e) { // sends new chat to chat box on 'enter' key
    if (e.which == 13) {
      e.preventDefault();
      main.controller.sendNewMessage($('#chat-message-box').val());
    }
  });
  $(document).on('click', '.department-modal .submit-btn', function () { // submits department change to server
    main.controller.departmentChange();
  });
  $(document).on('click', '.email-modal .submit-btn', function () { //sends email from server
    main.controller.sendEmail($(this));
  });
  $(document).on('click', '.email-modal .clear-btn', function () { // clears email fields 
    main.controller.clearEmailModal($('.email-modal'));
  });
  $(document).on('click', '.drop .record-number', function () { // opens/collapses  card
    main.controller.openElement($(this).parents('.drop'));
  });
  $(document).on('click', '.chat-drop-header, .stat-drop-header', function () { // opens/collapses chat box
    main.controller.openElement($(this).parents('.drop'));
  });
  $(document).on('click', '.drop .submit-btn', function () { // submits new card to server
    main.controller.validateAndCreateNewCard($(this));
  });
  $(document).on('click', '.drop .clear-btn', function () { // clears chats from chatbox or deletes new card form
    if($(this).parents('.chat-drop-area').length)
      main.controller.clearChatMessages();
    else 
      main.controller.deleteNewCardElement($(this));
  });
  $(document).on('click', '.drop .department-select-row .btn, .activate-department-btn', function () { // activates selected department for routing
    main.controller.selectRoutingDepartment($(this));
  });
  $(document).on('click', '.add-department', function () { // submits add departments mid cycle
    main.controller.activateDepartmentInCycle($(this));
  });
  $(document).on('click', '.drop .clear-address', function () { // clears address form
    main.controller.clearAddressSelection($(this).parents('.address-drop-area'));
  });
  
  $(document).on('click', '.drop .check-in-btn', function () { // begins update workflow process when check in button is clicked
    main.controller.initializeUpdateWF($(this));
  });
  $(document).on('click', '.drop .standard-comments', function (e) { // hide/show standard comments by department
    main.controller.toggleStandardComments($(this), e);
  });
  $(document).on('click', '.standard-comment-list-item', function () { // sends chosen standard comment to comment field
    main.controller.chooseStandardComment($(this));
  });
  $(document).on('focus', '.time-entry', function () { // hide show time entry icon
    main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('blur', '.time-entry', function () { //hide show time entry icon
    if ($(this).val() != "")
      main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');
    else
      main.controller.removeClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('keyup', '.time-entry', function (e) {  //hide show time entry icon
    if ($(this).val() != "")
       main.controller.addClass($(this).parents('.time-entry-wrap'), 'hide-icon');
  });
  $(document).on('click', '.departed-toggle', function () { // hide or show the departed column instead of the chat box
    main.controller.toggleDepartedColumn();
  });
  $(document).on('click', ".multi-address-btn", function () { // adds new address form for multiple addresses
    main.controller.addNewCardAddressForm($(this));
  });
  $(document).on('click', ".add-dep-btn", function () { // Show/Hide additional departments for mid cycle activation
    main.controller.showAdditionalDepartments($(this));
  });
  $(document).on('click', ".logo", function () { // sends reset command to server
    main.controller.restartServer();
  });
  $(document).on('click', ".address-choice", function () { // selects address choice
    main.controller.toggleNewCardAddress($(this));
  });
  $(document).on('click', '.drop .clear-selected-address', function () { // reset address form
    main.controller.resetNewCardAddress($(this).parents('.address-drop-area'));
  });
  $(document).on('click', '.iteam-feedback', function (e) { // easter egg! shake the buckets
    e.preventDefault();
    main.controller.sendIteamFeedback();
  });
  $(document).on('click', '.hidden-clicker', function (e) { // easter egg! shake the buckets
    e.preventDefault();
    main.controller.shakeBuckets();
  });
  $(document).on('keyup', '#email-search-input', function (e) { // searches user database for user emails with given search criteria
      main.controller.searchEmail($(this).val());
  });
  $(document).on('change', '.email-search-result input', function (e) { // searches user database for user emails with given search criteria
      main.controller.addEmailToRecipientList($(this));
  });
  $(document).on('click', '.email-close', function (e) { // searches user database for user emails with given search criteria
      main.controller.removeEmailFromRecipientList($(this).parent('li'));
  });
})();
