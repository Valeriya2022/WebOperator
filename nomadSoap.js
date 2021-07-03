var NomadSoap = function(host, port, url) {
  var
    request = require('request'),
    xml2js = require('xml2js'),
    util = require('util'),
    logger = require('./logger.js'),
    parser = new xml2js.Parser({
      trim: true,
      normalizeTags: true,
      normalize: true,
      stripPrefix: true,
      mergeAttrs: true
    }),
    serverUrl = 'http://'+ host + ':' + port + url,
    requests = {
      getWindowList: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadWindowList_Input><cus:WindowList>?</cus:WindowList></cus:NomadWindowList_Input></soapenv:Body></soapenv:Envelope>',
      getAllOperators: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadAllOperatorList_Input><cus:SessionIdAllOperator>?</cus:SessionIdAllOperator></cus:NomadAllOperatorList_Input></soapenv:Body></soapenv:Envelope>',
      getAllTickets: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadAllTicketList_Input><cus:SessionIdAllTicket>?</cus:SessionIdAllTicket></cus:NomadAllTicketList_Input></soapenv:Body></soapenv:Envelope>',
      operatorLogin: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorLogin_Input><cus:Login>$login</cus:Login><cus:Password>$password</cus:Password><cus:WindowNo>$winNum</cus:WindowNo><cus:WindowId>$winId</cus:WindowId></cus:NomadOperatorLogin_Input></soapenv:Body></soapenv:Envelope>',
      operatorLogout: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorCompleteSession_Input><cus:SessionIdStop>$sessionId</cus:SessionIdStop><cus:StopDescription>$couse</cus:StopDescription></cus:NomadOperatorCompleteSession_Input></soapenv:Body></soapenv:Envelope>',
      nextClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorNext_Input><cus:SessionIdNext>$sessionId</cus:SessionIdNext></cus:NomadOperatorNext_Input></soapenv:Body></soapenv:Envelope>',
      chooseClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorNext2_Input><cus:SessionIdNextTarget>$sessionId</cus:SessionIdNextTarget><cus:EventIdTarget>$eventId</cus:EventIdTarget></cus:NomadOperatorNext2_Input></soapenv:Body></soapenv:Envelope>',
      missedClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorMissed_Input><cus:EventIdMissed>$eventId</cus:EventIdMissed></cus:NomadOperatorMissed_Input></soapenv:Body></soapenv:Envelope>',
      completeClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorCompleteTicket_Input><cus:EventId>$eventId</cus:EventId></cus:NomadOperatorCompleteTicket_Input></soapenv:Body></soapenv:Envelope>',
      getSessionTickets: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadTicketList_Input><cus:SessionIdTicket>$sessionId</cus:SessionIdTicket></cus:NomadTicketList_Input></soapenv:Body></soapenv:Envelope>',
      getSessionTicketsCount: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadTicketCount_Input><cus:SessionIdCount>$sessionId</cus:SessionIdCount></cus:NomadTicketCount_Input></soapenv:Body></soapenv:Envelope>',
      delayClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorDelay_Input><cus:EventIdDelay>$eventId</cus:EventIdDelay></cus:NomadOperatorDelay_Input></soapenv:Body></soapenv:Envelope>',
      getDelayedClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorDelayUp_Input><cus:EventIdDelayUp>$eventId</cus:EventIdDelayUp></cus:NomadOperatorDelayUp_Input></soapenv:Body></soapenv:Envelope>',
      getDelayedClientsList: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadDelayList_Input><cus:SessionIdDelay>$sessionId</cus:SessionIdDelay></cus:NomadDelayList_Input></soapenv:Body></soapenv:Envelope>',
      getQueueList: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorQueueList_Input><cus:SessionIdQueueList>?</cus:SessionIdQueueList></cus:NomadOperatorQueueList_Input></soapenv:Body></soapenv:Envelope>',
      getQueueOperators: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorList_Input><cus:OperatorQueueId>$queueId</cus:OperatorQueueId><cus:BranchId>$branchId</cus:BranchId></cus:NomadOperatorList_Input></soapenv:Body></soapenv:Envelope>',
      // getQueueOperators: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorList_Input><cus:OperatorQueueId>$queueId</cus:OperatorQueueId></cus:NomadOperatorList_Input></soapenv:Body></soapenv:Envelope>',
      // redirectClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorRedirect_Input><cus:SessionIdRedirect>$sessionId</cus:SessionIdRedirect><cus:QueueIdTarget>$queueId</cus:QueueIdTarget><cus:OperatorIdTarget>$operatorId</cus:OperatorIdTarget><cus:RedirectBack>$returnBack</cus:RedirectBack><cus:Priority>$priority</cus:Priority><cus:Comment>$comment</cus:Comment></cus:NomadOperatorRedirect_Input></soapenv:Body></soapenv:Envelope>',
      redirectClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorRedirect_Input><cus:SessionIdRedirect>$sessionId</cus:SessionIdRedirect><cus:QueueIdTarget>$queueId</cus:QueueIdTarget><cus:OperatorIdTarget>$operatorId</cus:OperatorIdTarget><cus:RedirectBack>$returnBack</cus:RedirectBack><cus:Priority>$priority</cus:Priority><cus:Comment>$comment</cus:Comment><cus:NextTime>$dates</cus:NextTime></cus:NomadOperatorRedirect_Input></soapenv:Body></soapenv:Envelope>',
      operatorLogin1: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorLogin1_Input><cus:Login1>$login</cus:Login1><cus:Password>$password</cus:Password></cus:NomadOperatorLogin1_Input></soapenv:Body></soapenv:Envelope>',
      callTicket: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorCallTicket_Input><cus:EventCallId>$eventId</cus:EventCallId></cus:NomadOperatorCallTicket_Input></soapenv:Body></soapenv:Envelope>',
      rewindClient: '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cus="http://nomad.org/CustomUI"><soapenv:Header/><soapenv:Body><cus:NomadOperatorRewind_Input><cus:SessionIdRewind>$sessionId</cus:SessionIdRewind><cus:QueueIdTarget>$queueId</cus:QueueIdTarget><cus:Comment>$comment</cus:Comment></cus:NomadOperatorRewind_Input></soapenv:Body></soapenv:Envelope',
    },
    operatorAuth = function(login, password, winNum, winId, callback) {
      var body = requests.operatorLogin;
      body = body.replace('$login', login);
      body = body.replace('$password', password);
      body = body.replace('$winNum', winNum);
      body = body.replace('$winId', winId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var sessionId = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorlogin'][0]['cus:sessionid'][0];
                var opName = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorlogin'][0]['cus:workname'][0];
                var branchId = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorlogin'][0]['cus:branchid'][0];
                var obj = {
                  sessionId: sessionId,
                  operator: opName,
                  branchId: branchId
                };
                return callback(obj);
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
      });
    },
  operatorAuth1 = function(login, password, callback) {
      var body = requests.operatorLogin1;
      body = body.replace('$login', login);
      body = body.replace('$password', password);
      request.post(
        {
          url: serverUrl,
          body: body
        },

        function (error, response, body) {
          console.log(response.statusCode)
        if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200 && response.body == "Wrong login"){
            return callback(response.body)
          }
          else if(response.statusCode == 200) {
            console.log(body);
			parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorlogin1'][0]['xsd:complextype'][1]['xsd:element'];
                var windowList = [];
                var obj = {};
                for (var i = 0; i < temp.length; i++) {
                  obj = {};
                  obj.winId = temp[i].WindowId[0];
                  obj.winNum = temp[i].No[0];
                  windowList.push(obj);
                }
                //console.log(windowList);
                windowList.sort(function(a, b){
                  return a.winNum - b.winNum;
                });
                //console.log(windowList);
                return callback(windowList);
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
      });
    },
    operatorLogout = function(sessionId,couse, callback) {
      var body = requests.operatorLogout;
      body = body.replace('$sessionId', sessionId);
      body = body.replace('$couse', couse);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              parser.parseString(body, function (err, result) {
                if(err) logger.error(err);//console.log('Error: ' + err);
                else {
                  var completedSession = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorcompletesession'][0]
                  ['cus:sessionid'][0];
                  logger.debug(completedSession);//console.log(completedSession);
                  return callback(completedSession);
                }
              });
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('No response from SOAP server');//console.log('error: no response from SOAP server');
          }
      });
    },
    nextClient = function(sessionId, callback) {
      var body = requests.nextClient;
      body = body.replace("\ufeff", "");
      body = body.replace('$sessionId', sessionId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              if (body !== 'No clients') {
                parser.parseString(body, function (err, result) {
                  if(err) logger.error(err);//console.log('Error: ' + err);
                  else {
                    var ticket = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatornext'][0];
                    var obj = {};
                    for (var prop in ticket) {
                      if (ticket.hasOwnProperty(prop))
                        var property =  prop.replace('cus:', '');
                        obj[property] = ticket[prop][0];
                    }
                    return callback(obj);
                  }
                });
              }
              else {
                return callback('No clients');
              }
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('no response from SOAP server');//console.log('error: no response from SOAP server');
          }
        }
      );
    },
    chooseClient = function(sessionId, eventId, callback) {
      var body = requests.chooseClient;
      body = body.replace("\ufeff", "");
      body = body.replace('$sessionId', sessionId);
      body = body.replace('$eventId', eventId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              if (body.indexOf('<soapenv:Body>') !== -1) {
                parser.parseString(body, function (err, result) {
                  if(err) logger.error(err);//console.log('Error: ' + err);
                  else {
                    var ticket = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatornext2'][0]['cus:eventid'][0];
                    return callback(ticket);
                  }
                });
              }
              else {
                return callback(body);
              }
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('no response from SOAP server');//console.log('error: no response from SOAP server');
          }
        }
      );
    },
    completeClient = function(eventId, callback) {
      var body = requests.completeClient;
      body = body.replace('$eventId', eventId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if(response.statusCode == 200) {
            if (body !== '') {
              parser.parseString(body, function (err, result) {
                if(err) logger.error(err);//console.log('Error: ' + err);
                else {
                  var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorcompleteticket'][0]['cus:eventid'][0];
                  return callback(temp);
                }
              });
            }
            else {
              return callback('cannot complete given event');
            }
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        }
      );
    },
    delayClient = function(eventId, callback) {
      var body = requests.delayClient;
      body = body.replace('$eventId', eventId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if(response.statusCode == 200) {
            if (body !== '') {
              parser.parseString(body, function (err, result) {
                if(err) logger.error(err);
                else {
                  var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatordelay'][0]['cus:eventid'][0];
                  return callback(temp);
                }
              });
            }
            else {
              return callback('cannot complete given event');
            }
          }
          else {
            logger.error(response.statusCode);
          }
        }
      );
    },
    callTicket = function(eventId, callback) {
      var body = requests.callTicket;
      body = body.replace('$eventId', eventId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if(response.statusCode == 200) {
            if (body !== '') {
              parser.parseString(body, function (err, result) {
                if(err) logger.error(err);
                else {
                  var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorcallticket'][0]['cus:eventcallid'][0];
                  return callback(temp);
                }
              });
            }
            else {
              return callback('cannot complete given event');
            }
          }
          else {
            logger.error(response.statusCode);
          }
        }
      );
    },
    sendToMissed = function(eventId, callback) {
      var body = requests.missedClient;
      body = body.replace('$eventId', eventId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if(response.statusCode == 200) {
            if (body !== '') {
              parser.parseString(body, function (err, result) {
                if(err) logger.error(err);//console.log('Error: ' + err);
                else {
                  var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatormissed'][0]['cus:eventid'][0];
                  return callback(temp);
                }
              });
            }
            else {
              return callback('cannot complete given event');
            }
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        }
      );
    },
    getSessionTickets = function(sessionId, callback) {
      var body= requests.getSessionTickets;
      body = body.replace('$sessionId', sessionId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp =                              result['soapenv:envelope']['soapenv:body'][0]['cus:nomadticketlist'][0]['xsd:complextype'][1]['xsd:element'];
                if (typeof temp !== 'undefined') {
                  var ticketList = [];
                  var obj = {};
                  for (var i = 0; i < temp.length; i++) {
                    obj = {};
                    for (var prop in temp[i]) {
                      if((temp[i].hasOwnProperty(prop)) && (prop !== 'type'))
                        if (prop.toLowerCase() === 'redirected') {
                          obj[prop.toLowerCase()] = JSON.parse(temp[i][prop][0]);
                        }
                        else {
                          obj[prop.toLowerCase()] = temp[i][prop][0];
                        }
                    }
                    obj.num = i;
                    ticketList.push(obj);
                  }
                  //console.log(temp)
                  return callback(ticketList);
                }
                else {
                  return callback([]);
                }
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        });
    },
    getDelayList = function(sessionId, callback) {
      var body= requests.getDelayedClientsList;
      body = body.replace('$sessionId', sessionId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) { //console.log("Response: " + body);//test
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomaddelaylist'][0]['xsd:complextype'][1]['xsd:element'];
                if (typeof temp !== 'undefined') {
                  var ticketList = [];
                  var obj = {};
                  for (var i = 0; i < temp.length; i++) {
                    obj = {};
                    for (var prop in temp[i]) {
                      if((temp[i].hasOwnProperty(prop)) && (prop !== 'type'))
                        if (prop.toLowerCase() === 'redirected') {
                          obj[prop.toLowerCase()] = JSON.parse(temp[i][prop][0]);
                        }
                        else {
                          obj[prop.toLowerCase()] = temp[i][prop][0];
                        }
                    }
                    obj.num = i;
                    ticketList.push(obj);
                  }
                  //console.log(temp)
                  return callback(ticketList);
                }
                else {
                  return callback([]);
                }
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        });
    },
    getSessionTicketsCount = function(sessionId, callback) {
      var body= requests.getSessionTicketsCount;
      body = body.replace('$sessionId', sessionId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            // console.log('Body => ' + body);
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                if (result) {
                  var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadticketcount'][0]['cus:ticketcount'][0];
                  if (typeof temp !== 'undefined') {
                    return callback(temp);
                  }
                  else {
                    return callback(null);
                  }
                }
                else {
                  return callback(null);
                }
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        });
    },
    getWindowList = function(callback) {
      var body= requests.getWindowList;
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadwindowlist'][0]['xsd:complextype'][1]['xsd:element'];
                var windowList = [];
                var obj = {};
                for (var i = 0; i < temp.length; i++) {
                  obj = {};
                  obj.winId = temp[i].WindowId[0];
                  obj.winNum = temp[i].No[0];
                  windowList.push(obj);
                }
                //console.log(windowList);
                return callback(windowList);
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        });
    },
    getAllOperators = function(callback) {
      var body = requests.getAllOperators;
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadalloperatorlist'][0]['xsd:complextype'][1]['xsd:element'];
                var allOperatorsList = [];
                var obj = {};
                for (var i = 0; i < temp.length; i++) {
                  obj = {};
                  for (var prop in temp[i]) {
                    if((temp[i].hasOwnProperty(prop)) && (prop !== 'type'))
                      obj[prop.toLowerCase()] = temp[i][prop][0];
                  }
                  allOperatorsList.push(obj);
                }
                logger.debug(allOperatorsList);//console.log(allOperatorsList);
                return callback(allOperatorsList);
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
        });
    },
    getAllTickets = function(callback) {
      var body = requests.getAllTickets;
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadallticketlist'][0]['xsd:complextype'][1]['xsd:element'];
                if (temp) {
                  var allTickets = [];
                  var obj = {};
                  for (var i = 0; i < temp.length; i++) {
                    obj = {};
                    for (var prop in temp[i]) {
                      if((temp[i].hasOwnProperty(prop)) && (prop !== 'type'))
                        obj[prop.toLowerCase()] = temp[i][prop][0];
                    }
                    allTickets.push(obj);
                  }
                  return callback(allTickets);
                }
                else {
                  return callback([]);
                }
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
      });
    },
    getQueueList = function(callback) {
      var body = requests.getQueueList;
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (error) logger.error(error);//console.log('Error: ' + error);
          else if(response.statusCode == 200) {
            parser.parseString(body, function (err, result) {
              if(err) logger.error(err);//console.log('Error: ' + err);
              else {
                var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorqueuelist'][0]['xsd:complextype'][1]['xsd:element'];
                if (temp) {
                  var allQueues = [];
                  var obj = {};
                  for (var i = 0; i < temp.length; i++) {
                    obj = {};
                    for (var prop in temp[i]) {
                      if((temp[i].hasOwnProperty(prop)) && (prop !== 'type'))
                        if (prop !== 'workName') {
                          if (isNaN(parseInt(temp[i][prop][0]))) {
                            obj[prop.toLowerCase()] = null;
                          }
                          else {
                            obj[prop.toLowerCase()] = parseInt(temp[i][prop][0]);
                          }
                        }
                        else {
                          obj[prop.toLowerCase()] = temp[i][prop][0];
                        }
                    }
                    allQueues.push(obj);
                  }
                  allQueues.sort(function(a, b) {
                    return parseInt(a.queueid) - parseInt(b.queueid);
                  });
                  return callback(allQueues);
                }
                else {
                  return callback([]);
                }
              }
            });
          }
          else {
            logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
          }
      });
    },
    getQueueOperators = function(queueId,branchId, callback) {
      var body = requests.getQueueOperators;
      body = body.replace("\ufeff", "");
      body = body.replace('$queueId', queueId);
      body = body.replace('$branchId', branchId);
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              if (body.indexOf('<soapenv:Body>') !== -1) {
                parser.parseString(body, function (err, result) {
                  if(err) logger.error(err);//console.log('Error: ' + err);
                  else {
                    var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorlist'][0]['xsd:complextype'][1]['xsd:element'];
                    if (temp) {
                      var operatorsList = [];
                      var obj = {};
                      for (var i = 0; i < temp.length; i++) {
                        obj = {};
                        obj.operatorId = parseInt(temp[i].operatorId[0]);
                        obj.workName = temp[i].workName[0];
                        operatorsList.push(obj);
                      }
                    }
                    return callback(operatorsList);
                  }
                });
              }
              else {
                return callback(body);
              }
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('no response from SOAP server');//console.log('error: no response from SOAP server');
          }
        }
      );
    },
    redirectClient = function(sessionId, queueId, operatorId, returnBack, priority, dates, comment, callback) {

      var body = requests.redirectClient;
      body = body.replace("\ufeff", "");
      body = body.replace('$sessionId', sessionId);
      body = body.replace('$queueId', queueId);
      body = body.replace('$operatorId', operatorId);
      body = body.replace('$returnBack', returnBack);
      body = body.replace('$priority', priority);
      body = body.replace('$dates', dates);
      body = body.replace('$comment', comment);

      console.log(dates)
      console.log(body)
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              if (body.indexOf('<soapenv:Body>') !== -1) {
                parser.parseString(body, function (err, result) {
                  if(err) logger.error(err);//console.log('Error: ' + err);
                  else {
                    var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorredirect'][0]['cus:sessionid'][0];

                    return callback(temp);
                  }
                });
              }
              else {
                return callback(body);
              }
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('no response from SOAP server');//console.log('error: no response from SOAP server');
          }
        }
      );
    },
    rewindClient = function(sessionId, queueId, comment, callback) {

      var body = requests.rewindClient;
      body = body.replace("\ufeff", "");
      body = body.replace('$sessionId', sessionId);
      body = body.replace('$queueId', queueId);
      body = body.replace('$comment', comment);

      console.log(dates)
      console.log(body)
      request.post(
        {
          url: serverUrl,
          body: body
        },
        function (error, response, body) {
          if (response) {
            if(response.statusCode == 200) {
              if (body.indexOf('<soapenv:Body>') !== -1) {
                parser.parseString(body, function (err, result) {
                  if(err) logger.error(err);//console.log('Error: ' + err);
                  else {
                    var temp = result['soapenv:envelope']['soapenv:body'][0]['cus:nomadoperatorredirect'][0]['cus:sessionid'][0];
                    console.log(temp);
                    return callback(temp);
                  }
                });
              }
              else {
                return callback(body);
              }
            }
            else {
              logger.error(response.statusCode);//console.log('error: '+ response.statusCode);
            }
          }
          else {
            logger.error('no response from SOAP server');//console.log('error: no response from SOAP server');
          }
        }
      );
    };



    return {
      getAllTickets: getAllTickets,
      getWindowList: getWindowList,
      getAllOperators: getAllOperators,
      getSessionTickets: getSessionTickets,
      getSessionTicketsCount: getSessionTicketsCount,
      operatorAuth: operatorAuth,
      operatorAuth1: operatorAuth1,
      operatorLogout: operatorLogout,
      nextClient: nextClient,
      chooseClient: chooseClient,
      completeClient: completeClient,
      delayClient: delayClient,
      sendToMissed: sendToMissed,
      getQueueList: getQueueList,
      getQueueOperators: getQueueOperators,
      redirectClient: redirectClient,
      rewindClient: rewindClient,
      // redirectClientNext: redirectClientNext,
      getDelayList: getDelayList,
      callTicket: callTicket
    };
};

module.exports = NomadSoap;
