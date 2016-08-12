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

  function manageText(jsonText, parser){
    var twitterObj = null;
    try {
      twitterObj = JSON.parse(jsonText);
      switch(twitterObj.event){
        case 'follow':
          parser.emit('follow', twitterObj);
          break;
        case 'unfollow':
          parser.emit('unfollow', twitterObj);
          break;
        case 'favorite':
          parser.emit('favorite', twitterObj);
          break;
        case 'unfavorite':
          parser.emit('unfavorite', twitterObj);
          break;
        case 'block':
          parser.emit('block', twitterObj);
          break;
        case 'unblock':
          parser.emit('unblock', twitterObj);
          break;
        case 'list_created':
          parser.emit('list_created', twitterObj);
          break;
        case 'list_destroyed':
          parser.emit('list_destroyed', twitterObj);
          break;
        case 'list_updated':
          parser.emit('list_updated', twitterObj);
          break;
        case 'list_member_added':
          parser.emit('list_member_added', twitterObj);
          break;
        case 'list_member_removed':
          parser.emit('list_member_removed', twitterObj);
          break;
        case 'list_user_subscribed':
          parser.emit('list_user_subscribed', twitterObj);
          break;
        case 'list_user_unsubscribed':
          parser.emit('list_user_unsubscribed', twitterObj);
          break;
        case 'quoted_tweet':
          parser.emit('quoted_tweet', twitterObj);
          break;
        case 'user_update':
          parser.emit('user_update', twitterObj);
          break;
        default:
          parser.emit('data', twitterObj);
          break;
      }
    }
    catch (error) {
      error.source = twitterObj;
      parser.emit('error', error);
    }
  }

  this.buffer += buffer.toString('utf8');
  var index, text;

  // We have END?
  while ((index = this.buffer.indexOf(Parser.END)) > -1) {
    text = this.buffer.slice(0, index);
    this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
    if (text.length === 0) {
      this.emit('ping');
    }
    if (text.length > 0) {
      manageText(text, this);
    }
  }

};

