var express = require('express');
var util = require('util');
var config = require('../config.js');
var logger = require('../logger.js');
var fs = require('fs');
var router = express.Router();
var NomadSoap = require('../nomadSoap');
var soap = new NomadSoap(config.soap.host, config.soap.port, config.soap.url);

/* GET home page. */
fs.readFile('disable_buttons.txt','utf8', function(err, data){
  if (err){
    console.log(err)
  }else{
   var ticket_selection = 'ticket_selection:true' ;
    var redirect = 'redirect:true' ;
    var set_aside = 'set_aside:true' ;
    var auto_call = 'auto_call:true' ;
    if((data.indexOf(ticket_selection) > -1) == true){
      var hid1 = 'hidden';
    }    if((data.indexOf(redirect) > -1) == true){
      var hid2 = 'hidden';
    }    if((data.indexOf(set_aside) > -1) == true){
      var hid3 = 'hidden';
    }  if((data.indexOf(auto_call) > -1) == true){
      var hid4 = 'hidden';
    }
    router.get('/', function(req, res, next) {
     if(hid4 == 'hidden'){
       res.render('index', {
        title: 'Nomad Operator',
        ticket_selection: hid1,
        redirect: hid2,
        set_aside:hid3
      });
     }else{
       res.render('index1', {
         title: 'Nomad Operator',
         ticket_selection: hid1,
         redirect: hid2,
         set_aside:hid3
       });
     }
     });

  }

});
router.post('/getwindows', function(req, res, next) {
  logger.debug('loading windows list for following ip: ' + req._remoteAddress);//console.log('loading windows list for following ip: ' + req._remoteAddress);
  soap.getWindowList(function(data) {
    res.send(data);
  });
});

router.post('/getqueues', function(req, res, next) {
  soap.getQueueList(function(data) {
    res.send(data);
  });
});

router.post('/getqueueoperators', function(req, res, next) {
  soap.getQueueOperators(req.body.queueId,req.body.branchId, function(data) {
    if(data) {
      res.send(data);
    }
    else {
      res.send([]);
    }
  });
});

router.post('/redirect', function(req, res, next) {
  soap.redirectClient(req.signedCookies.sessionId, req.body.queueId, req.body.operatorId, req.body.returnBack,  req.body.priority, req.body.dates, req.body.comment, function(data) {
    if (data) {
      res.send({data: data});
    }
    else {
      res.send({
        error: 'redirect error'
      });
    }
  });
});

router.post('/rewind', function(req, res, next) {
  soap.rewindClient(req.signedCookies.sessionId, req.body.queueId, req.body.comment, function(data) {
    if (data) {
      res.send({ data: data });
    } else {
      res.send({
        error: 'rewind error'
      });
    }
  });
});

router.post('/login', function(req, res, next) {
  if (req.body){
    logger.debug('Operator ' + req.body.login + ' login attempt, window number: ' + req.body.winNum + ' , windowId: ' + req.body.winId);//console.log('Operator ' + req.body.login + ' login attempt, window number: ' + req.body.winNum + ' , windowId: ' + req.body.winId);
    soap.operatorAuth(req.body.login, req.body.password, req.body.winNum, req.body.winId, function(data) {
      //console.log(data);
      res.cookie('sessionId', data.sessionId, { signed: true, httpOnly: false });
      res.cookie('opName', data.operator);
      res.cookie('branchId', data.branchId);
      console.log(data.branchId)
      data.ip = req._remoteAddress;
      res.send(data);
    });
  }
});

router.post('/login1', function(req, res, next) {
  if (req.body){
    logger.debug('loading windows list for operator: ' + req.body.login);//console.log('loading windows list for operator: ' + req.body.login);
    soap.operatorAuth1(req.body.login, req.body.password, function(data) {
      //console.log(data);
      res.send(data);
    });
  }
});

router.post('/logout', function(req, res, next) {

  logger.debug(req.signedCookies.sessionId);//console.log(req.signedCookies.sessionId);
  soap.operatorLogout(req.signedCookies.sessionId,req.body.couse, function(data) {
    if (data === req.signedCookies.sessionId)
      res.clearCookie('sessionId');
    res.clearCookie('opName');
    var obj = {};
    obj.sessionId = undefined;
    obj.ip = req._remoteAddress;
    res.send(obj);
  });
});

router.post('/next', function(req, res, next) {
  soap.nextClient(req.signedCookies.sessionId, function(data) {
    res.send(data);
  });
});

router.post('/sessiontickets', function(req, res, next) {
  //console.log(req.signedCookies.sessionId);//test
  soap.getSessionTickets(req.signedCookies.sessionId, function(data) {
    res.send(data);
  });
});

router.post('/delaylist', function(req, res, next) {
  //console.log(req.signedCookies.sessionId);//test
  soap.getDelayList(req.signedCookies.sessionId, function(data) {
    res.send(data);
  });
});
var counting = 0;
router.post('/sessionticketscount', function(req, res, next) {
  soap.getSessionTicketsCount(req.signedCookies.sessionId, function(data) {
    var obj = {count:  data.substr(0, data.indexOf(';'))};

    res.send(obj);
  });
});

router.post('/delayticketscount', function(req, res, next) {
  soap.getDelayList(req.signedCookies.sessionId, function(data) {
    var obj = {count: data.length};
    res.send(obj);
  });
});

router.post('/selectedclient', function(req, res, next) {
  soap.chooseClient(req.signedCookies.sessionId, req.body.eventid, function(data) {
    var resultObj = {eventid: data};
    res.send(resultObj);
  });
});

router.post('/complete', function(req, res, next) {
  logger.debug('eventId to complete: ' + req.body.eventId);//console.log('eventId to complete: ' + req.body.eventId);
  soap.completeClient(req.body.eventId, function(data) {
    if (data === req.body.eventId) {
      res.send({result: 'OK'});
    }
    else {
      res.send({result: 'WRONG'});
    }
  });
});

router.post('/missed', function(req, res, next) {
  logger.debug('eventId to be missed: ' + req.body.eventId);//console.log('eventId to be missed: ' + req.body.eventId);
  soap.sendToMissed(req.body.eventId, function(data) {
    if (data === req.body.eventId) {
      res.send({result: 'OK'});
    }
    else {
      res.send({result: 'WRONG'});
    }
  });
});

router.post('/delay', function(req, res, next) {
  logger.debug('eventId to delay: ' + req.body.eventId);
  soap.delayClient(req.body.eventId, function(data) {
    if (data === req.body.eventId) {
      res.send({result: 'OK'});
    }
    else {
      res.send({result: 'WRONG'});
    }
  });
});

router.post('/callticket', function(req, res, next) {
  logger.debug('Call eventId: ' + req.body.eventId);
  soap.callTicket(req.body.eventId, function(data) {
    if (data === req.body.eventId) {
      res.send({result: 'OK'});
    }
    else {
      res.send({result: 'WRONG'});
    }
  });
});

module.exports = router;
