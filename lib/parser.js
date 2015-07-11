'use strict';

var Transform = require('stream').Transform;

var Parser = module.exports = function Parser() {
  Transform.call(this, {
    objectMode: true
  });
  this.buffer = '';
  return this;
};

Parser.prototype = Object.create(Transform.prototype);

Parser.END        = '\r\n';
Parser.END_LENGTH = 2;

Parser.prototype._transform = function(chunk, encoding, callback) {
  this.buffer += chunk.toString('utf8');
  var index, json;

  while ((index = this.buffer.indexOf(Parser.END)) > -1) {
    json = this.buffer.slice(0, index);
    this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
    if (json.length > 0) {
      try {
        json = JSON.parse(json);
        switch(json.event){
          case 'follow':
            this.emit('follow', json);
            break;
          case 'favorite':
            this.emit('favorite', json);
            break;
          case 'unfavorite':
            this.emit('unfavorite', json);
            break;
          case 'block':
            this.emit('block', json);
            break;
          case 'unblock':
            this.emit('unblock', json);
            break;
          case 'list_created':
            this.emit('list_created', json);
            break;
          case 'list_destroyed':
            this.emit('list_destroyed', json);
            break;
          case 'list_updated':
            this.emit('list_updated', json);
            break;
          case 'list_member_added':
            this.emit('list_member_added', json);
            break;
          case 'list_member_removed':
            this.emit('list_member_removed', json);
            break;
          case 'list_user_subscribed':
            this.emit('list_user_subscribed', json);
            break;
          case 'list_user_unsubscribed':
            this.emit('list_user_unsubscribed', json);
            break;
          case 'user_update':
            this.emit('user_update', json);
            break;
          default:
            this.emit('data', json);
            break;
        }
        this.push(json);
      } catch (error) {
        error.source = json;
        this.emit('error', error);
      }
    }
  }
  callback();
};