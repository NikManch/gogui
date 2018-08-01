(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
exports.__esModule = true;
var header;
(function (header) {
    header[header["connect"] = 0] = "connect";
    header[header["event"] = 1] = "event";
    header[header["ack"] = 2] = "ack";
    header[header["error"] = 3] = "error";
})(header || (header = {}));
var GUI = /** @class */ (function () {
    function GUI() {
        var _this = this;
        this.fon = {};
        this.ackfunc = {};
        this.id = 0;
        this.onConnect = function (f) {
            _this.fconnect = f;
        };
        this.onDisconnect = function (f) {
            _this.fdisconnect = f;
        };
        this.onError = function (f) {
            _this.ferror = f;
        };
        this.on = function (name, f) {
            _this.fon[name] = f;
        };
        this.emit = function (name, dat, f) {
            var msg = {
                type: header.event,
                id: _this.id,
                param: {
                    name: name,
                    param: dat
                }
            };
            _this.ackfunc[_this.id] = f;
            _this.id++;
            _this.conn.send(JSON.stringify(msg));
        };
        this.connect = function () {
            var parent = _this;
            _this.conn = new WebSocket("ws://" + document.location.host + "/ws");
            _this.conn.onopen = function () {
                var msg = {
                    type: header.connect,
                    id: parent.id
                };
                parent.id++;
                parent.conn.send(JSON.stringify(msg));
            };
            _this.conn.onclose = function (ev) {
                if (_this.onError) {
                    _this.ferror(ev.reason);
                }
                if (_this.onDisconnect) {
                    _this.fdisconnect();
                }
            };
            _this.conn.onmessage = function (event) {
                var msg = JSON.parse(event.data);
                switch (msg.type) {
                    case header.connect:
                        if (parent.fconnect) {
                            parent.fconnect();
                        }
                        break;
                    case header.event:
                        {
                            var f = parent.fon[msg.param.name];
                            if (f == null) {
                                break;
                            }
                            var result = f(msg.param.param);
                            var resp = {
                                type: header.ack,
                                id: parent.id,
                                param: result
                            };
                            parent.conn.send(JSON.stringify(resp));
                        }
                        break;
                    case header.ack:
                        {
                            var f = parent.ackfunc[msg.id];
                            if (f == null) {
                                break;
                            }
                            f(msg.param);
                        }
                        break;
                    case header.error:
                        if (parent.onError) {
                            parent.ferror(msg.param);
                        }
                        break;
                }
                ;
            };
        };
    }
    return GUI;
}());
exports["default"] = GUI;

},{}],2:[function(require,module,exports){
"use strict";
/// <reference path="jquery.d.ts" />
exports.__esModule = true;
var GUI_1 = require("./GUI");
$(function () {
    var socket = new GUI_1["default"]();
    socket.on('reply', function (msg) {
        $('#messages').append($('<li>').text(msg));
        return "callback from client " + msg;
    });
    $('form').submit(function () {
        socket.emit('msg', $('#m').val(), function (data) {
            $('#messages').append($('<li>').text('ACK CALLBACK: ' + data));
        });
        $('#m').val('');
        return false;
    });
    socket.connect();
});

},{"./GUI":1}]},{},[2]);
