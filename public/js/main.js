var op = op || { };

cookie = function(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2) return parts.pop().split(";").shift();
};

window.onbeforeunload = function (evt) {
  if (typeof cookie('sessionId') !== 'undefined'){
    var message = "Вы не закончили работу!";

    if (typeof evt == "undefined") {
      evt = window.event;
    }

    if (evt){
      evt.returnValue = message;
    }
    return message;
  }
}

$(function () {
  op.TreeElement = function() {
    var self = this;
    self.queueid = ko.observable();
    self.parentid = ko.observable();
    self.workname = ko.observable();
    self.children = ko.observableArray();
    self.hasChildren = ko.computed(function() {
      var count = self.children().length;
      return count === 0 ? false : true;
    });
  };

  var currentDate = new Date();
  var day = currentDate.getDate() + 1;
  if(day<10){
    day = "0"+day
  }
  var month = currentDate.getMonth();
  if(month<10){
    month = "0"+month
  }
  var year = currentDate.getFullYear();
  var date_for = year+"-"+month+"-"+day;
  op.vm = function() {
    var
        metadata = {
          pageTitle: 'Nomad SOAP Operator',
          personal: {
            author: 'Kanat Kunikeyev',
            vendorlibs: [
              'Knockout JS',
              'JQuery',
              'Bootstrap'
            ]
          }
        },
        errorObj = ko.observable({
          wrongWin: ko.observable(),
          wrongTicket: ko.observable(),
          wrongTicketText: ko.observable(),
          noClients: ko.observable(),
          completeEvent: ko.observable(),
          missedEvent: ko.observable()
        }),
        currentTicket = ko.observable(),
        redirectTicketQueue = ko.observable(),
        redirectTicketOperator = ko.observable(),
        redirectTicketPriority = ko.observable(),
        redirectTicketReason = ko.observable(),
        redirectTicketDate = ko.observable(date_for),
        redirectTicketTime = ko.observable("10:00"),
        redirectTicketNext = ko.observable(false),
        redirectTicketReturnBack = ko.observable(false),
        redirectTicketComment = ko.observable(''),
        rewindTicketQueue = ko.observable(),
        rewindTicketComment = ko.observable(''),
        windowList = ko.observableArray(),
        sessionTicketList = ko.observableArray(),
        queueList = ko.observableArray(),
        operatorList = ko.observableArray(),
        sessionTicketCount = ko.observable(),
        delayTicketCount = ko.observable(),
        operatorLogin = ko.observable(false),
        operatorPassword = ko.observable(false),
        ticketCountInterval = undefined,
        delayTicketCountInterval = undefined,
        getCookie = function(name) {
          var value = "; " + document.cookie;
          var parts = value.split("; " + name + "=");
          if (parts.length == 2) return parts.pop().split(";").shift();
        },
        sessionId = ko.observable(getCookie('sessionId') ? decodeURIComponent(getCookie('sessionId')) : getCookie('sessionId')),
        opWorkName = ko.observable(getCookie('opName') ? decodeURIComponent(getCookie('opName')) : getCookie('opName')),
        branchId = ko.observable(getCookie('branchId') ? decodeURIComponent(getCookie('branchId')) : getCookie('branchId')),
        getWindows = function() {
          $.ajax({
            type: 'POST',
            dataType: "json",
            url: '/getwindows',
            data: {},
            success: function(data) {
              windowList(data);
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        onStartSession = function() {
          if (sessionId() && !ticketCountInterval) {
            ticketCountInterval = window.setInterval(getTicketsCount, 2000);
            if (!delayTicketCountInterval)
              delayTicketCountInterval = window.setInterval(getDelayTicketsCount, 2000);
          }
          $('#operator-login').submit(function(event) {
            event.preventDefault();
            var obj = {};
            obj.login = $('#inputLogin').val();
            obj.password = $('#inputPassword').val();
            obj.winNum = $('#inputWindow option:selected').text();
            obj.winId = $('#inputWindow option:selected').val();

            if (true){//obj.winId !== $('#default-option').val()) { //hotfix
              errorObj().wrongWin(false);
              $.ajax({
                type: 'POST',
                dataType: 'json',
                url: '/login',
                data: obj,
                success: function(data) {
                  sessionId(decodeURIComponent(getCookie('sessionId')));
                  opWorkName(decodeURIComponent(getCookie('opName')));
                  branchId(decodeURIComponent(getCookie('branchId')));
                  $('#loginModal').modal('hide');
                  ticketCountInterval = window.setInterval(getTicketsCount, 2000);
                  delayTicketCountInterval = window.setInterval(getDelayTicketsCount, 2000);

                },
                timeout: 5000
              }).fail( function( xhr, status ) {
                if( status == "timeout" ) {
                  console.log('timeout');
                }
                else {
                  console.log(xhr);
                  if(status) console.log(status);
                  console.log('another error');
                }
              });
            }
            else {
              errorObj().wrongWin(true);
            }
          });
        },
        resetLoginWindow = function(){
          $('#inputLogin').val('');
          $('#inputPassword').val('');
          windowList([]);
          $('#default-option').attr( 'selected','selected');
          return false;
        },
        getLoginWindows = function(data, event) {
          console.log(data);
          console.log(event);
          event.preventDefault();
          var obj = {};
          obj.login = $('#inputLogin').val();
          obj.password = $('#inputPassword').val();

          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/login1',
            data: obj,
            success: function(data) {
              windowList(data);
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        onCompleteSession = function() {
          
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/logout',
            data: {
              couse: $('input[name=cause]:checked', '#operator-logout').val()
            },
            success: function(data) {
              sessionId(undefined);
              opWorkName(undefined);
              branchId(undefined);
              window.clearInterval(ticketCountInterval);
              window.clearInterval(delayTicketCountInterval);
              sessionTicketList(undefined);
              sessionTicketCount(undefined);
              windowList([]);
              operatorLogin(false);
              operatorPassword(false);
              $('#logoutModal').modal('hide');
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        getTicketsCount = function() {
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/sessionticketscount',
            data: {},
            success: function(data) {
              // console.log(data);
              if(typeof data.count !== "undefined") {
                sessionTicketCount(data.count);
              }
              else {
                console.log("received ticketcount is not a number");
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        getDelayTicketsCount = function() {
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/delayticketscount',
            data: {},
            success: function(data) {
              if(typeof data.count === "number") {
                delayTicketCount(data.count);
              }
              else {
                console.log("received ticketcount is not a number");
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        getSessionTickets = function() {
          sessionTicketList(undefined);
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/sessiontickets',
            data: {},
            success: function(data) {
              if (data.length > 0) {
                sessionTicketList(data);
                initTicketTable();
              }
              else {
                errorObj().noClients(true);
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        getDelayList = function() {
          sessionTicketList(undefined);
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/delaylist',
            data: {},
            success: function(data) {
              if (data.length > 0) {
                sessionTicketList(data);
                initTicketTable();
                $('#chooseClient').modal('show');//??
              }
              else {
                errorObj().noClients(true);
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        findById = function(source, id) {
          for (var i = 0; i < source().length; i++) {
            if (source()[i].num === id) {
              return source()[i];
            }
          }
          return -1;
        },
        getChosenClient = function(obj) {
          if (obj.eventid) {
            errorObj().wrongTicket(false);
            errorObj().wrongTicketText(undefined);
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/selectedclient',
              data: obj,
              success: function(data) {
                //console.log(data);
                if(data.eventid === obj.eventid) {
                  var date = new Date( obj.starttime*1 );

                  var hours = date.getHours();
                  var minutes = "0" + date.getMinutes();
                  var seconds = "0" + date.getSeconds();
                  var day = "0" + date.getDay();
                  var month = "0" + date.getMonth();
                  var year = date.getFullYear();

                  //data.starttime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                  obj.starttime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ', ' + day.substr(-2) + "." + month.substr(-2) + "." + year;

                  console.log('obj',obj);
                  currentTicket(obj);
                  $('#chooseClient').modal('hide');
                }
                else {
                  errorObj().wrongTicket(true);
                  if (data.eventid.indexOf("Another event served") > -1) {
                    data.eventid = data.eventid.replace("Another event served", "Вы уже вызвали билет №") + ". Завершите его обслуживание, вызвав его повторно кнопкой Следующий";
                  }
                  errorObj().wrongTicketText(data.eventid);
                }
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });
          }
          else {
            errorObj().wrongTicket(true);
            errorObj().wrongTicketText("Произошла ошибка при выборе билета, попробуйте потворить процедуру сначала.");
          }
        },
        ticketToChoose = function() {
          var chosenNum = $('input[name=TicketNumber]:checked', '#ticketSelect').val()*1;
          var obj = findById(sessionTicketList, chosenNum);
          getChosenClient(obj);
        },
        getNextClient = function() {
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/next',
            data: {},
            success: function(data) {
              if (data !== 'No clients') {
                var date = new Date( data.starttime*1 );

                var hours = date.getHours();
                var minutes = "0" + date.getMinutes();
                var seconds = "0" + date.getSeconds();
                var day = "0" + date.getDay();
                var month = "0" + date.getMonth();
                var year = date.getFullYear();
                var delay = 1000;

                //data.starttime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                data.starttime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2) + ', ' + day.substr(-2) + "." + month.substr(-2) + "." + year;
                currentTicket(data);
               
               
              }
              else {
                errorObj().noClients(true);
              }
            },
            timeout: 500
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        completeClient = function() {
          var obj = {};
          if (currentTicket().eventid) {
            obj.eventId = currentTicket().eventid;
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/complete',
              data: obj,
              success: function(data) {
                if (data.result === 'OK') {
                  currentTicket(undefined);
                  errorObj().wrongTicket(false);
                  errorObj().wrongTicketText(undefined);
                  sessionTicketList(undefined);
                }
                else {
                  errorObj().completeEvent(true);
                }
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });

          }
          else {
            console.log('No tickets left');
          }
        },
        delayClient = function() {
          var obj = {};
          if (currentTicket().eventid) {
            obj.eventId = currentTicket().eventid;
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/delay',
              data: obj,
              success: function(data) {
                if (data.result === 'OK') {
                  currentTicket(undefined);
                  errorObj().wrongTicket(false);
                  errorObj().wrongTicketText(undefined);
                  sessionTicketList(undefined);
                }
                else {
                  errorObj().completeEvent(true);
                }
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });
          }
          else {
            console.log('No tickets left');
          }
        },
        callTicket = function() {
          var obj = {};
          if (currentTicket().eventid) {
            obj.eventId = currentTicket().eventid;
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/callticket',
              data: obj,
              success: function(data) {
                if (data.result !== 'OK') {
                  errorObj().completeEvent(true);
                }
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });
          }
          else {
            console.log('No ticket');
          }
        },
        sendToMissed = function() {
          var obj = {};
          if (currentTicket().eventid) {
            obj.eventId = currentTicket().eventid;
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/missed',
              data: obj,
              success: function(data) {
                if (data.result === 'OK') {
                  currentTicket(undefined);
                  errorObj().wrongTicket(false);
                  errorObj().wrongTicketText(undefined);
                  sessionTicketList(undefined);
                }
                else {
                  errorObj().missedEvent(true);
                }
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });
          }
          else {
            console.log('No tickets left');
          }
        },
        displayConnectionStatus = ko.pureComputed(function() {
          return (typeof sessionId() !== 'undefined') ? 'Статус: в сети' : 'Статус: не авторизован';
        }),
        displayConnectionLabel = ko.pureComputed(function() {
          return (typeof sessionId() !== 'undefined') ? 'label label-success' : 'label label-default';
        }),
        displayWorkButtons = ko.pureComputed(function() {
          return (typeof sessionId() !== 'undefined') ? true : false;
        }),
        formatDate = function(date, dir) {
          switch(dir) {
            case 1:
              return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
              break;
            case 2:
              return date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds() + ', ' + date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear();
              break;
            default:
              return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear() + ', ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
              break;
          }
        },
        createStructure = function(nodes) {
          var objects = [];

          for (var i = 0; i < nodes.length; i++) {
            objects.push(new op.TreeElement()
                .queueid(nodes[i].queueid)
                .parentid(nodes[i].parentid)
                .workname(nodes[i].workname)
                .children([]));
          }

          return objects;
        },
        getParent = function(child, nodes) {
          var parent = null;

          for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].queueid() === child.parentid()) {
              return nodes[i];
            }
          }
          return parent;
        },
        convertToHierarchy = function(array) {
          var nodeObjects = createStructure(array);
          for (var i = nodeObjects.length - 1; i >= 0; i--) {
            var currentNode = nodeObjects[i];
            if (currentNode.parentid() === null) {
              continue;
            }
            var parent = getParent(currentNode, nodeObjects);
            if (parent === null) {
              continue;
            }

            parent.children.push(currentNode);
            nodeObjects.splice(i, 1);
          }

          return nodeObjects;
        },
        getQueueList = function() {
          $('#tree1 input').iCheck('update');
          if (queueList().length <= 0) {
            $.ajax({
              type: 'POST',
              dataType: 'json',
              url: '/getqueues',
              data: {},
              success: function(data) {
                var temp = convertToHierarchy(data);
                queueList(temp);
                buildQueueTree(1);
                $('#tree1').children('.branch').each(function(){

                  var icon = $(this).children('i:first');

                  icon.toggleClass('glyphicon-folder-open glyphicon-folder-close');

                  $(this).children().children().toggle();

                });
              },
              timeout: 5000
            }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                console.log('timeout');
              }
              else {
                console.log(xhr);
                if(status) console.log(status);
                console.log('another error');
              }
            });
          }
          else {
            console.log("Queue list has already been populated");
          }
        },
        getQueueOperatorsList = function(queueId) {

          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/getqueueoperators',
            data: {
              queueId: queueId,
              branchId: branchId()
            },
            success: function(data) {
              data.unshift( {operatorId: '', workName: 'Все операторы'} );
              operatorList(data);
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        chooseRedirectOperator = function() {
          operatorList(undefined);
          getQueueOperatorsList(redirectTicketQueue().chosenQueue);
          nextWizardTab();
        },
        rewindClient = function() {
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/rewind',
            data: {
              queueId: rewindTicketQueue().chosenQueue,
              comment: rewindTicketComment()
            } ,
            success: function(data) {
              if (data.error) {
                console.log(data.error);
              }
              else {
                console.log(data.data)
                currentTicket(undefined);
                rewindTicketQueue(undefined);
                rewindTicketComment();
                console.log(data.data)
                if(data.data.indexOf(str)>0){
                  console.log(1)
                  $('#rewindClient').modal('hide');
                }else{
                  console.log(2)
                  $('#rewindClient').modal('hide');
                  $('#TicketNumber').modal('show');
                }
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        redirectClient = function() {
          var dates = '?';
          var str  = "-";
          if(redirectTicketNext() == true){
            dates = redirectTicketDate()+"/"+redirectTicketTime()
          }
          $.ajax({
            type: 'POST',
            dataType: 'json',
            url: '/redirect',
            data: {
              queueId: redirectTicketQueue().chosenQueue,
              operatorId: redirectTicketOperator().operatorId,
              returnBack: redirectTicketReturnBack(),
              priority: redirectTicketPriority(),
              dates: dates,
              comment: redirectTicketComment()
            } ,
            success: function(data) {
              if (data.error) {
                console.log(data.error);
              }
              else {
                console.log(data.data)
                currentTicket(undefined);
                redirectTicketQueue(undefined);
                redirectTicketOperator(undefined);
                redirectTicketReturnBack(undefined);
                redirectTicketPriority(undefined);
                redirectTicketDate(undefined);
                redirectTicketTime(undefined);
                redirectTicketComment('');
                console.log(data.data)
                if(data.data.indexOf(str)>0){
                  console.log(1)
                  $('#redirectClient').modal('hide');
                }else{
                  console.log(2)
                  $('#redirectClient').modal('hide');
                  $('#TicketNumber').modal('show');
                  $('#writeTicketNumber').html( "<h1> <b>"+data.data+"</b></h1>" );
                }
              }
            },
            timeout: 5000
          }).fail( function( xhr, status ) {
            if( status == "timeout" ) {
              console.log('timeout');
            }
            else {
              console.log(xhr);
              if(status) console.log(status);
              console.log('another error');
            }
          });
        },
        initUI = function() {
          $(".btn").mouseup(function(){
            $(this).blur();
          });
          $('#signIn').click(function() {
            $('#inputLogin').val('');
            $('#inputPassword').val('');
            windowList([]);
            $('#default-option').attr( 'selected','selected');
          });
          $("#loginModal, #chooseClient, #rewindClient, #redirectClient, #redirectClientNext").on('hidden.bs.modal', function () {
            setTimeout(function() {
              document.activeElement.blur();
            }, 1);
          });
          initWizard();
          onStartSession();
        },
        initTicketTable = function() {
          $('#ticketSelect input').iCheck({
            handle: 'radio',
            checkboxClass: 'icheckbox_minimal-grey',
            radioClass: 'iradio_minimal-grey'
          });
          $('#ticketSelect tr').click(function() {
            $(this).find('th input[type=radio]').iCheck('check');
          });
        },
        initWizard = function() {
          //Initialize tooltips
          $('.nav-tabs > li a[title]').tooltip();

          //Wizard
          $('a[data-toggle="tab"]').on('show.bs.tab', function (e) {

            var target = $(e.target);

            if (target.parent().hasClass('disabled')) {
              return false;
            }
          });
        },
        buildQueueTree = function(type) {
          switch (type) {
            case 1:
              var openedClass = 'glyphicon-folder-open';
              var closedClass = 'glyphicon-folder-close';
              break;
            case 2:
              var openedClass = 'glyphicon-minus-sign';
              var closedClass = 'glyphicon-plus-sign';
              break;
            default:
              var openedClass = 'glyphicon-chevron-right';
              var closedClass = 'glyphicon-chevron-down';
              break;
          }

          //initialize each of the top levels
          var tree = $("#tree1");
          tree.addClass("tree");
          tree.find('li').has("ul").each(function () {
            var branch = $(this);
            //li with children ul
            branch.prepend("<i class='indicator glyphicon " + closedClass + "'></i>");
            branch.addClass('branch');
            branch.on('click', function (e) {
              if (this == e.target) {
                var icon = $(this).children('i:first');
                icon.toggleClass(openedClass + " " + closedClass);
                $(this).children().children().toggle();
              }
            });
            branch.children().children().toggle();
          });

          tree.find('li').not(":has(ul)").each(function() {
            var leave = $(this);
            leave.addClass('leave');
          });
          tree.find('input').each(function(){
            $(this).iCheck({
              handle: 'radio',
              checkboxClass: 'icheckbox_minimal-grey',
              radioClass: 'iradio_minimal-grey'
            });
          });
          //fire event from the dynamically added icon
          tree.find('.branch .indicator').each(function(){
            $(this).on('click', function () {
              $(this).closest('li').click();
            });
          });
          //fire event to open branch if the li contains an anchor instead of text
          tree.find('.branch>a').each(function () {
            $(this).on('click', function (e) {
              $(this).closest('li').click();
              e.preventDefault();
            });
          });

          tree.find('.leave .row').each(function () {
            $(this).on('click', function (e) {
              $(this).find('input[type=radio]').iCheck('check');
              $(this).find('a').focus();

              var chosenQueue = $('input[name=QueueId]:checked', '#tree1').val();
              var chosenQueueName = $('#a-' + chosenQueue, '#tree1').text();
              redirectTicketQueue({
                chosenQueue: chosenQueue,
                chosenQueueName: chosenQueueName
              });
              rewindTicketQueue({
                chosenQueue: chosenQueue,
                chosenQueueName: chosenQueueName
              });

            });
          });

          tree.find('.leave ins').each(function () {
            $(this).on('click', function (e) {
              $(this).parent().siblings("a").focus();
              var chosenQueue = $('input[name=QueueId]:checked', '#tree1').val();
              var chosenQueueName = $('#a-' + chosenQueue, '#tree1').text();
              redirectTicketQueue({
                chosenQueue: chosenQueue,
                chosenQueueName: chosenQueueName
              });
              rewindTicketQueue({
                chosenQueue: chosenQueue,
                chosenQueueName: chosenQueueName
              });

            });
          });
        },
        nextWizardTab = function() {
          var active = $('.wizard .nav-tabs li.active');
          active.next().removeClass('disabled');
          active.next().find('a[data-toggle="tab"]').click();
          active.addClass('disabled');
        },
        prevWizardTab = function() {
          var active = $('.wizard .nav-tabs li.active');
          active.prev().removeClass('disabled');
          active.prev().find('a[data-toggle="tab"]').click();
          active.addClass('disabled');
        },
        initRewindWin = function() {
          $('input[name=QueueId]:checked', '#tree2').prop('checked', false);
          rewindTicketQueue(undefined);
          getQueueList();
          $(".wizard .nav-tabs li").not(":eq(0)").addClass('disabled');
          $(".wizard .nav-tabs li, .tab-content .tab-pane").removeClass('active');
          $(".wizard .nav-tabs li").first().addClass('active');
          $(".tab-content .tab-pane").first().addClass('active');
        }
        initRedirectWin = function() {
          $('input[name=QueueId]:checked', '#tree1').prop('checked', false);
          redirectTicketQueue(undefined);
          redirectTicketOperator(undefined);
          redirectTicketPriority(0);
          getQueueList();
          $(".wizard .nav-tabs li").not(":eq(0)").addClass('disabled');
          $(".wizard .nav-tabs li, .tab-content .tab-pane").removeClass('active');
          $(".wizard .nav-tabs li").first().addClass('active');
          $(".tab-content .tab-pane").first().addClass('active');
        };
    return {
      windowList: windowList,
      sessionTicketList: sessionTicketList,
      sessionTicketCount: sessionTicketCount,
      sessionId: sessionId,
      opWorkName: opWorkName,
      branchId: branchId,
      displayConnectionStatus: displayConnectionStatus,
      displayConnectionLabel: displayConnectionLabel,
      displayWorkButtons: displayWorkButtons,
      formatDate: formatDate,
      redirectTicketNext:redirectTicketNext,
      currentTicket: currentTicket,
      redirectTicketQueue: redirectTicketQueue,
      redirectTicketOperator: redirectTicketOperator,
      redirectTicketPriority: redirectTicketPriority,
      redirectTicketDate: redirectTicketDate,
      redirectTicketTime: redirectTicketTime,
      redirectTicketReturnBack: redirectTicketReturnBack,
      redirectTicketComment: redirectTicketComment,
      redirectClient: redirectClient,
      rewindTicketQueue: rewindTicketQueue,
      rewindTicketComment: rewindTicketComment,
      rewindClient: rewindClient,
      getWindows: getWindows,
      getLoginWindows: getLoginWindows,
      resetLoginWindow: resetLoginWindow,
      getNextClient: getNextClient,
      completeClient: completeClient,
      delayClient: delayClient,
      sendToMissed: sendToMissed,
      onCompleteSession: onCompleteSession,
      getSessionTickets: getSessionTickets,
      getChosenClient: getChosenClient,
      ticketToChoose: ticketToChoose,
      getQueueList: getQueueList,
      queueList: queueList,
      operatorList: operatorList,
      chooseRedirectOperator: chooseRedirectOperator,
      prevWizardTab: prevWizardTab,
      nextWizardTab: nextWizardTab,
      initUI: initUI,
      initRedirectWin: initRedirectWin,
      initRewindWin: initRewindWin,
      getCookie: getCookie,
      errorObj: errorObj,
      operatorLogin: operatorLogin,
      operatorPassword: operatorPassword,
      getDelayList: getDelayList,
      callTicket: callTicket,
      delayTicketCount: delayTicketCount,
    };
  }();
  op.vm.initUI();
  ko.applyBindings(op.vm);

});
