/***********************************
Filename: deadFunctions.js
Description: This file serves as a
graveyard for old, duplicate code
that may or may not be useful later.
**********************************/
class dead {
  constructor () {}
  _makeInitials(_name) {
    if (typeof(_name) !== undefined) {
      let _words = _name.toString().split(' ');
      let _initials = '';
      for (let i = 0, l = _words.length; i < l; i++) {
        _initials += _words[i].charAt(0).toUpperCase();
      }
      return _initials;
    }
    return false
  }

  _autoRefreshIntervalTime() {
    let _ideal = 30000 - this._currentAvgLoadTime;
    if (_ideal > 1000) return _ideal;
    return 1000;
  }

  getRecords(_dateToRun = this._today) {}

  _calculateAvgLoadTime(_newTime) {
    this._timesLoaded++;
    return ((this._currentAvgLoadTime * this._timesLoaded) + _newTime) / (this._timesLoaded);
  }

  // Gets all record data based off card info
  getRecordObj (rec) {
    this.socket.emit('get-data', (rec))
  }

  fixTSI (d) {
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
  changeQueryDate(_el) {
    let _now = new Date();
    let _inputDateArray = _el.val().split('-');
    let _targetDate = new Date(`${_inputDateArray[1]}/${_inputDateArray[2]}/${_inputDateArray[0]}`);
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
  getDateInMilliseconds(date){
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setUTCMilliseconds(0);
    return date.getTime();
  }

  /* Gets workflow history from server*/
  getWorkflowHistory(_el){
    // if(_el.parents('.drop').hasClass('open')) this.socket.emit('get-workflow-history', _el.text()); 
  }


  compareArrays(array1,array2){
    console.log('comparing arrays:');
    console.log('a1:', array1);
    console.log('a2:', array2);
    if(array2.length - array1.length != 0) return false;
    for(let i=0;i<array1.length;i++){
      if(array1[i] != array2[i]) return false;
    }
    return true;
  }

  drawChart(){
    var ctx = document.getElementById("stat-chart").getContext('2d');
    var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ["8/1", "8/2", "8/3", "8/4", "8/5", "8/6"],
        datasets: [{
            label: 'Goal',
            data: [10,10,10,10,10,10],
            // backgroundColor: [
            //     'rgba(255, 99, 132, 0.2)',
            //     'rgba(54, 162, 235, 0.2)',
            //     'rgba(255, 206, 86, 0.2)',
            //     'rgba(75, 192, 192, 0.2)',
            //     'rgba(153, 102, 255, 0.2)',
            //     'rgba(255, 159, 64, 0.2)'
            // ],
            borderColor: [
                'rgba(255, 159, 64, 1)'
            ],
            fill: false,
            borderWidth: 1
        },
        {
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
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            fill: false,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
    });
  }

addLoader(_el){
      _el.addClass('loader').html('<i class="fa fa-circle" aria-hidden="true"></i>');
      setTimeout(() => {
        _el.removeClass('loader').html('<i class="fa fa-check" aria-hidden="true"></i>');
      }, 500)
  }

  removeStandardComments(){
    $('.standard-comment-list-wrap').removeClass('open');
    setTimeout(_ => {
      $('.standard-comment-list-wrap').offset({
        top: -1000,
        left: 0
      });
    }, 500);
  }

  swapViewType(){
    $('body').toggleClass('history-view');
    $('.depart-drop-area').toggleClass('grid-bucket');
    $('main').toggleClass('one-bucket').toggleClass('three-buckets');
  }


  updateShortnotes(data){
    console.log('checking shortnotes for', data.recordId);
    // console.log(data);
    let _id = '#' + data.recordId;

    
  }


  stdTimezoneOffset(_t = new Date()) {
    let _jan = new Date(_t.getFullYear(), 0, 1);
    let _jul = new Date(_t.getFullYear(), 6, 1);
    return Math.max(_jan.getTimezoneOffset(), _jul.getTimezoneOffset());
  }

  setOffset(_t = new Date()) {
    if (_t.getTimezoneOffset() < this.stdTimezoneOffset()) _t.setTime(_t.getTime() + (1 * 60 * 60 * 1000));
    _t = _t.toISOString();
    _t = new Date(_t).getTime();
    return _t;
  }

  // Updates card based on new data from server
  updateCard (cardData) {
    // Set function variables based on card data
    console.log('into update card...');
    console.log(cardData);
    // FUNCTION VARIABLES
    // User variables
    let _currentDepartment = $('.department-modal .department-select').val();
    let _user = cardData.user

    // Local variables from object
    let _sn = cardData.shortNotes;
    let _wfHistory = cardData.workflowHistory;
    let _id = '#' + cardData.recordNumber;

    // Generate shortnote variables
    let _wait = _sn.waiting, _with = _sn.with, time = _sn.time;

    // Generation Icons
    let _departmentIcons = '';
    let _curReception = false, _curDeparted = false, _curWait = false, _curWith = false;
    let _hasWait = false, _hasWith = false;
    let _checkBtn = '';

    if(_sn.type == 'departed'){ //remove timer and move to departed column
      $(_id).find('.current-wait-time').text("");
      $(_id).appendTo('.departed-bucket .depart-drop-area');
      $(_id).find('.drop-sub-header input').val("");
      $(_id).find('.drop-sub-header textarea').val("");
      $(_id).find('.drop-sub-header').hide();
      $(_id).find('.drop-sub-header2').hide();
      $(_id).find('.icons').html("");
      return;
    }

    if(_sn.time != $(_id).find('.timeStamp').text()){ //if different sn time, update
      // Generate last action time
      let _time = this.getWaitTime(_sn.time);
      $(_id).find('.current-wait-time time').text(_time);
    }


    if (_wait.length > 0 && _wait[0] != '') { //if card is waiting for department(s)
      _hasWait = true;
      _departmentIcons += `<span class='wait'>${icons['wait']}`;
      for (let i = 0; i < _wait.length; i++) {
        if (_wait[i] != '') {
          _departmentIcons += `${icons[_wait[i]]}`; //get icons by dep name
        }
        if (_wait[i] == _currentDepartment) { //if waiting for current selected department, add check in btn
          _curWait = true;
          _checkBtn = 'Check In';
          if(_currentDepartment == "Reception") _checkBtn = 'Reroute';
        }
      }
      _departmentIcons += `</span>`;

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
      _departmentIcons += `<span class='with'>${icons['with']}`;
      for (let i = 0; i < _with.length; i++) {
        if (_with[i] != '') {
          _departmentIcons += `${icons[_with[i]]}`;
        }
        if (_with[i] == _currentDepartment) { // add checkout button if current selected dept
          _curWith = true;
          _checkBtn = 'Check Out'; 
        }
      }
      _departmentIcons += `</span>`;
    }

    // Check if card/customer has been departed
    if (_wait.length <= 1 && _with.length <= 1) {
      _curDeparted = true;
      $(_id).find('.department-select-row').hide();
    }

    // Checkin/out button generation
    if (_curWith || _curWait || _curReception) {
      $(_id).find('.department-select-row').hide();
      _departmentIcons += `
        <button class='btn check-in-btn'>
          <i class='fa fa-check' aria-hidden='true'></i> ${_checkBtn}
        </button>`;
      // Change classes based on if dept is currently with/wait for customer
      if (_curWith) {
        $(_id).removeClass('waiting-for-me');
        $(_id).addClass('with-me');
      } else if (_curWait) {
        $(_id).addClass('waiting-for-me');
      } else if (_curReception){
        $(_id).addClass('waiting-for-reception');
      $(_id).find('.department-select-row').show();
      }
    }

    if(!_curWith && !_curWait){
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
      $(_id).find('.check-in-btn').html(`<i class='fa fa-check' aria-hidden='true'></i> Reroute`);
      if(_currentDepartment == 'Reception'){
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

  toggleSearch () {
      $('.site-header .menu .search-box').toggleClass('open');
      $('.site-header .menu').toggleClass('search-box-open');
      if ($('.site-header .menu .search-box').hasClass('open')) {
        $('.site-header .menu .search-box input').focus();
      } else {
        $('.site-header .menu .search-box input').blur();
      }
   }  

  search () {
    $('.drop').unmark();
    $('.drop').mark($('.search-box input').val(), {
        "separateWordSearch": "true",
        "exclude": [".status-choices ul li div", "time", ".count-icon"]
      });
    if ($('.search-box input').val()) {
      $('.drop').each(function () {
        if ($(this).find('mark').length)
          $(this).removeClass('hide');
        else
          $(this).addClass('hide');
      });
    } else
      $('.drop').removeClass('hide');
  }
  toggleStandardComments (_el, _e) {
    let _w  = $(window).width();
    let _xOff = _e.pageX + 616 > _w ? _w - 616 : _e.pageX;
    let standardCommentBox = $('.standard-comment-list-wrap');
    let _currentDepartment = $('.department-modal .department-select').val();
    standardCommentBox.toggleClass('open');
    if (standardCommentBox.hasClass('open')) {
      standardCommentBox.offset({
          top: _e.pageY,
          left: _xOff
        });
      standardCommentBox.find('.associated-record-number').text(_el.parents('.drop').find('.record-number').text());
      $('.standard-comment-list').html('');
      for (let i = 0, l = standardComments[_currentDepartment].length; i < l; i++) {
        $('.standard-comment-list').append(`<li class="standard-comment-list-item">${standardComments[_currentDepartment][i]}</li>`);
      }
    } else {
      setTimeout(_ => {
        standardCommentBox.offset({
            top: -1000,
            left: 0
          });
      }, 500);
    }
  }
  chooseStandardComment (_el) {
    let _recordNumber = $('.standard-comment-list-wrap .associated-record-number').text();
    $(`#${_recordNumber} .drop-sub-header textarea`).val(_el.text());
  }

  _recordsInProgress () {
    if ($('.drop .department-select-row .department.active').length > 0 ||
        ( typeof($('.drop .drop-sub-header textarea').val()) != "undefined" && $('.drop .drop-sub-header textarea').val().trim().length > 0) ||
        $('.drop .drop-sub-header textarea').is(':focus'))
      return true;
    return false;
  }

}

class WorkflowEntry {
  constructor(data) {
    this.task = data.task;
    this.status = data.status;
    this.user = data.user;
    this.time = data.time;
    this.comment = data.comment;
  }
  /* Function that updates shortNotes in Accela */
  updateShortNotes (sn, rec) {
    let id = this.getAccelaID(rec);
    // console.log('Updating Short Notes...');

    request ({
      "crossDomain": true,
      "url": `https://apis.accela.com/v4/records/${id}`,
      "method": "PUT",
      "headers": {
        "x-accela-appid":this.appid,
        "authorization":this._TOKEN4
      },
      "data": JSON.stringify({
        shortNotes: sn
      })
    }, (err, resp, result) => {
      if (!err &&resp.statusCode == 200) {
        // console.log("Short Notes Updated Correctly");
      } else {
        console.log("Error: ");
        console.log(result);
      }
    });
  }

}

/* function sends SQL command to get a specific user by a given ip address. This is used for sign ins by cookies */
function getUserByIP(con, client, ip, sockets) {
      con.query(`SELECT * FROM users where user_ip = "${ip}"`, (err, rows) => {
        if(err || !rows.length) sendAllLoggedIn(sockets,con); //user not found, send user list
        else {
          setLoggedInFlag(rows[0].username,"Y",ip,con,sockets);          
          client.emit('user-auto-login',rows);
        }
      });
}

  $(document).on('change', '.calendar-modal .date-select', function () { //
    main.controller.changeQueryDate($(this));
  });

  class Modal {
  constructor (_el, _openElement) {
    this._el = _el;
    this._openElement = _openElement;
  }
}