'use strict';

// glorious streaming json parser, built specifically for the twitter streaming api
// assumptions:
//   1) ninjas are mammals
//   2) tweets come in chunks of text, surrounded by {}'s, separated by line breaks
//   3) only one tweet per chunk
//
//   p = new parser.instance()
//   p.addListener('object', function...)
//   p.receive(data)
//   p.receive(data)
//   ...

var EventEmitter = require('events').EventEmitter;

var Parser = module.exports = function Parser() {
  // Make sure we call our parents constructor
  EventEmitter.call(this);
  this.buffer = '';
  return this;
};

// The parser emits events!
Parser.prototype = Object.create(EventEmitter.prototype);

Parser.END        = '\r\n';
Parser.END_LENGTH = 2;

Parser.prototype.receive = function receive(buffer) {

  function processEvent(text, parserSelf){
    var json = null;
    try {
      json = JSON.parse(text);
      // Event message
      if (json.event !== undefined) {
        // First emit specific event
        parserSelf.emit(json.event, json);
        // Now emit catch-all event
        parserSelf.emit('event', json);
      }
      // Delete message
      else if (json.delete !== undefined) {
        parserSelf.emit('delete', json);
      }
      // Friends message (beginning of stream)
      else if (json.friends !== undefined || json.friends_str !== undefined) {
        parserSelf.emit('friends', json);
      }
      // Any other message
      else {
        parserSelf.emit('data', json);
      }
    }
    catch (error) {
      error.source = json;
      parserSelf.emit('error', error);
    }
  }

  this.buffer += buffer.toString('utf8');
  var index, text;

  // We have END?
  while ((index = this.buffer.indexOf(Parser.END)) > -1) {
    text = this.buffer.slice(0, index);
    this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
    if( text.length === 0){
      //twitter can send a simple END to keep connection alive
      //application can need this info
      this.emit('ping');
    }
    else{
      processEvent(text, this);
    }
  }

};
