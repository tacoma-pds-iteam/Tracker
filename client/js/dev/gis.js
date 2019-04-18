/***************************************************************************
Filename: gis.js
Description: This file handles all of the communications between the client
and the local GIS server.
****************************************************************************/
require(["dojo/dom", "dojo/on", "esri/tasks/query", "esri/tasks/QueryTask", "dojo/domReady!"], function(dom, on, Query, QueryTask) {
  let $scope,
      loader = `<div class="loader" style="display:inherit"><i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i> <i class="fa fa-circle" aria-hidden="true"></i></div>`,
      queryTask = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_XAPO/MapServer/2"), //Addresses
      queryTask2 = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_XAPO/MapServer/1"), //Parcels - owner
      queryTask3 = new QueryTask("https://arcgisprod02/arcgis/rest/services/PDS/Accela_AGIS/MapServer/26"), //Code Enforcement
      query = new Query(),
      query2 = new Query(),
      query3 = new Query();// initialize gis queries

  query.returnGeometry = false;
  query2.returnGeometry = false; // we just want data, not geo

  query.outFields = ['ADDRESSNUMBER', 'STREETPREFIX', 'STREETNAME', 'STREETSUFFIX', 'STREETTYPE', 'UNIT', 'ZIPCITY', 'STATE', 'ZIPCODE', 'PARCELNUMBER']; // fields we want to retrieve from first query
  query2.outFields = ['Tax_Payer_Name', 'Delivery_Address', 'Taxpayer_TAXPAYERCITY', 'Taxpayer_TAXPAYERSTATE', 'Zipcode']; // fields we want to retrieve from second query
  query3.outFields = ['PARCEL', 'CODETEXT', 'NOTIFICATION', 'NOTIFDATETEXT']; // fields we want to retrieve from third query

  $(document).on('keydown', '.add-num, .add-street, .par-num', function(e) { // handler that fires on enter key when entering address number, street, or parcel
    if(e.keyCode == 13) {
      e.preventDefault(); //dont submit form

      $scope = $(this).parents('.address-drop-area'); // grab address form data
      executeAddress(); //execute query
    }
  });

  $(document).on('click', '.search-address', function() { // handler that fires when you click search address instead of enter
    $scope = $(this).parents('.address-drop-area');
    if($scope.find('.add-num').val() || $scope.find('.add-street').val() || $scope.find('.par-num').val()) { // check if you have a value to search with first
      executeAddress(); //execute query
    } else { // show error
      $scope.find('input').addClass('err');
      setTimeout(function(){
        $scope.find('input').removeClass('err')
      }, 1000);
    }
  });

  $(document).on('click', '.address-choice', function() { // handler fires when an address is selected
    $(this).siblings('.address-choice').removeClass('active'); // remove selection from other choices
    $(this).addClass('active'); //add to current choice
    executeParcelOwnerCodeEnforcement($(this).children('.address-array').text()); // generate queries for query2 and query3
  });

  /* Function generates query for searching addresses in GIS server */
  function executeAddress() {
    let queryString = "",
        addNumber = $scope.find('.add-num').val(),
        addStreet = $scope.find('.add-street').val().toUpperCase(),
        parcel = $scope.find('.par-num').val().toUpperCase();

    $scope.find('.address-results-row').html(loader); // set to loader while we wait for query

    if(addNumber) { // add number to query search
      queryString += `ADDRESSNUMBER = ${addNumber}`;
    }
    if(addStreet) { //add street to query search
      if(queryString) queryString += ` AND `; // if already has query param, append
      queryString += `STREETNAME like '%${addStreet}%'`;      
    }
    if(parcel) { //add parcel num to query search
      if(queryString) queryString += ` AND `; // append if needed
      queryString += `PARCELNUMBER like '%${parcel}%'`;    
    }

    query.where = queryString; // set where statement in query object
    queryTask.execute(query, queryCallback1); //execute query and perform callback
  }
  /* Function callback from the initial address search query */
  function queryCallback1(results) {
    let addressChoices = [],
        choiceText = '',
        fullStringPiped = '',
        allitems = "",
        resultLength = results.features.length,
        resultHeader = "<span>Choose Address:</span>";

    if(!resultLength) { // no addresses found
      $scope.find('.address-results-row').html('<span>Choose Address:</span><div class="btn"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> No address found... Search again.</div>');
    } else {
      if(resultLength > 5) resultLength = 5; // only show the top 5 results
    
      for(let i = 0; i < resultLength; i++) { //generate address choice buttons html
        let featureAttributes = results.features[i].attributes; // result values object
        choiceText = '';
        fullStringPiped = '';

        for(let attr in featureAttributes) {
            if (attr != "ZIPCITY" && attr != "STATE" && attr != "ZIPCODE") choiceText += firstCapString(featureAttributes[attr]) + " "; // skip city state zip
            fullStringPiped += featureAttributes[attr] != null ? featureAttributes[attr] + "|": "|"; // generate piped values
        }
        addressChoices.push(`
          <div class="address-choice btn" id="add${i}">
          ${choiceText} <span id="val${i}" class="address-array">${fullStringPiped}</span> 
          </div>`); // generate html array for later
      }

      $scope.find('.address-results-row').html(resultHeader + addressChoices.join("")); //set html 
    }
  }
  /* Function generates queries and executes query to get owner and code enforcement data */
  function executeParcelOwnerCodeEnforcement(text) {
      text = text.replace(/\s+$/, ''); //remove trailing whitespace if any
      let addressArray = text.split("|"), //split data on pipes
          parcelNumber = addressArray[9]; // grab parcel from piped string array of address data

      if(parcelNumber == null || parcelNumber == ""){ // if no parcel number, cant do the other queries. quit
        $scope.find('.code-enforcement').html('<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count"> WARNING: No parcel or owner found for address</span></div></article>');
        return; //were done looking
      }

      query2.where = `TaxParcelNumber like '%${parcelNumber}%';`; // generate query
      queryTask2.execute(query2, queryCallback2); //execute

      query3.where = `PARCEL like '%${parcelNumber}%'`; //generate query
      queryTask3.execute(query3, queryCallback3); // execute
  }
  /* Callback Function sets the results of owner query to card */
  function queryCallback2(results) {
    let ownerObject = results.features[0].attributes, // we only care about the first owner if theres multiple values returned
        ownerString = '';
    for(let i in ownerObject){
      ownerString += ownerObject[i] + "|";
    }
    $scope.find('.owner-array').text(ownerString);
  }
  /* Callback Function gets any code enforcement cases from a parcel and sets it on the card */
  function queryCallback3(results) {
    let buttonText = '<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count">',
      codeCases = '',
      resultLength = results.features.length;

    if(resultLength) { // populate code section if any code cases 
      for(let i in results.features) {
        let att = results.features[i].attributes;
        codeCases += `<li>${att["NOTIFDATETEXT"]} - ${att["CODETEXT"]} (${att["NOTIFICATION"]})</li>`; // generate li tags
      }
      $scope.find('.code-enforcement').html(`<article class="code-area"><div class="code-area-header"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><span class="viol-count"> ${resultLength} Code Case(s) on this parcel</span><i class="fa fa-chevron-down" aria-hidden="true"></i></div><div class="code-data">Parcel: ${results.features[0].attributes["PARCEL"]}<ul>${codeCases}</ul></div></article>`);
    } else {
      $scope.find('.code-enforcement').html(""); // nothing
    }
  }
  /* Utility Function to capitalize the first character of every word in a given string */
  function firstCapString (s) {
    let retString = '';

    if (typeof s != 'undefined' && s != null) {
      let stringArray = s.toString().split(' '); // split on space to get each word

      for(let i = 0, l = stringArray.length; i < l; i++) {
        retString += stringArray[i].charAt(0).toUpperCase() + stringArray[i].slice(1).toLowerCase() + " ";
      }      
    } 
    return retString.trim();
  }
});
