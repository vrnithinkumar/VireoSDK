var _connection;
var _cases;
var waitingMessages;
//initialize connection, onopen, onmessage, onclose, send, close
var WebSocketClient =
{
    jsWebSocketClientConnect: function (url, urlLength, protocol, protocolLength, errorMessage) {
        //return NationalInstruments.Vireo.addWebSocketUser('url', 'protocol', errorMessage);
        console.log('made it to the js lib');
        
        _connection = new WebSocket(Pointer_stringify(url, urlLength));
        _cases = { _default: 'default' };
        waitingMessages = [];
        
        _connection.onopen = function(evt){
            console.log('connect');
            for(var index = 0; index < waitingMessages.length; index++) {
                _connection.send(waitingMessages[index]);
            }
        }
        
        _connection.onmessage = function(evt){
            console.log("Message recieved: " + evt.data);
            console.log(_cases[ evt.data ] ? _cases[ evt.data ] : _cases._default);
        }
        
        _connection.onclose = function(evt){
            console.log("Closing");
        }
        
        _connection.onerror = function(evt){
            console.log(evt);
        }
        
        return 0;
        
    },
    jsWebSocketClientEventListener: function (event, eventLength, response, responseLength) {
        console.log("Setting message listener!");
        _cases[Pointer_stringify(event, eventLength)] = Pointer_stringify(response, responseLength);
        return 0;
    },
    jsWebSocketClientSend: function (event, eventLength, message, messageLength) {
        console.log('Sending');
        // If connection is established, sends message normally
        // If readyState is still in CONNECTING phase, attaches send to onopen event
        if(_connection.readyState == 1) {
            console.log('no wait');
            _connection.send(Pointer_stringify(event,eventLength));
        } else if(_connection.readyState == 0) {
            waitingMessages.push(Pointer_stringify(event,eventLength));
        }
        return 0;
    }

    /*
    jsWebSocketClientClose: function (userHandle, errorMessage) {
        return NationalInstruments.Vireo.removeWebSocketUser(userHandle, errorMessage);
    },

    jsWebSocketClientAddHeader: function (userHandle, header, headerLength, value, valueLength, errorMessage) {
        return NationalInstruments.Vireo.addHeader(userHandle, Pointer_stringify(header, headerLength), Pointer_stringify(value, valueLength), errorMessage);
    },

    jsWebSocketClientRemoveHeader: function (userHandle, header, headerLength, errorMessage) {
        return NationalInstruments.Vireo.removeHeader(userHandle, Pointer_stringify(header, headerLength), errorMessage);
    },

    jsWebSocketClientGetHeader: function (userHandle, header, headerLength, value, errorMessage) {
        return NationalInstruments.Vireo.getHeaderValue(userHandle, Pointer_stringify(header, headerLength), value, errorMessage);
    },

    jsWebSocketClientHeaderExist: function (userHandle, header, headerLength, headerExistPointer, errorMessage) {
        return NationalInstruments.Vireo.headerExist(userHandle, Pointer_stringify(header, headerLength), headerExistPointer, errorMessage);
    },

    jsWebSocketClientListHeaders: function (userHandle, list, errorMessage) {
        return NationalInstruments.Vireo.listHeaders(userHandle, list, errorMessage);
    },

    jsWebSocketClientMethod: function (methodId, userHandle, url, urlLength, outputFile, outputFileLength, buffer, bufferLength, timeOut, headers, body, errorCodePointer, errorMessage, occurrenceRef) {
        var methodNames = ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'];
        var methodName = methodNames[methodId];

        // Setup parameters
        var urlString = Pointer_stringify(url, urlLength);
        var outputFile = Pointer_stringify(outputFile, outputFileLength);
        var bufferString = undefined;
        if (buffer) {
            bufferString = Pointer_stringify(buffer, bufferLength);
        }

        var occurrenceHasBeenSet = false;
        function setErrorAndOccurrence(errorCode, operation, additionalErrorText) {
            var fullErrorText = '';
            if (errorCode !== 0) {
                fullErrorText = 'Unable to complete ' + operation + ' operation. Look at your browser console log for more details : ' + additionalErrorText;
                //console.log(fullErrorText);
            }
            NationalInstruments.Vireo.dataWriteInt32(errorCodePointer, errorCode);
            NationalInstruments.Vireo.dataWriteString(errorMessage, fullErrorText, fullErrorText.length);
            NationalInstruments.Vireo.setOccurence(occurrenceRef);
            if (!occurrenceHasBeenSet) {
                occurrenceHasBeenSet = true;
                NationalInstruments.Vireo.setOccurence(occurrenceRef);
            }
        };

        try {
            //NationalInstruments.Vireo.makeRequest(userHandle, methodName, urlString, timeOut, bufferString, successCallback, errorCallback, timeOutCallback);
            var WebSocketUser = NationalInstruments.Vireo.getWebSocketUser(userHandle);

            var request = new XMLHttpRequest();
            request.open(methodName, urlString);
            request.timeout = timeOut;

            // Set the headers
            if (WebSocketUser instanceof WebSocketUser) {
                var allHeaders = WebSocketUser.getHeaders();
                for (var key in allHeaders) {
                    if (allHeaders.hasOwnProperty(key)) {
                        request.setRequestHeader(key, allHeaders[key]);
                    }
                }
            }

            request.onreadystatechange = function (event) {
                if (request.readyState === 4) {
                    if (request.status == 200) {
                        // Success!
                        var errorString = '';
                        var headersText = request.getAllResponseHeaders();
                        var bodyText = request.responseText;

                        NationalInstruments.Vireo.dataWriteString(headers, headersText, headersText.length);
                        if (body) {
                            NationalInstruments.Vireo.dataWriteString(body, bodyText, bodyText.length);
                        }
                        setErrorAndOccurrence(0, '');
                    } else {
                        setErrorAndOccurrence(-1, methodName, request.statusText + '(' + request.status + ').');
                    }
                }
            };

            request.onerror = function (event) {
                setErrorAndOccurrence(-1, methodName, event.target.statusText + '(' + event.target.status + ').');
            };

            request.ontimeout = function (event) {
                setErrorAndOccurrence(-1, methodName, 'The time out value of ' + timeOut + ' was exceeded.');
            }

            if (bufferString === undefined) {
                request.send();
            } else {
                request.send(bufferString);
            }
        }
        catch (error) {
            setErrorAndOccurrence(-1, methodName, error.message);
        }
    }*/
};

mergeInto(LibraryManager.library, WebSocketClient);
