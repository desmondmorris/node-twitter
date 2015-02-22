'use strict';

/**
 * Module dependencies
 */

var url = require('url');
var streamparser = require('./parser');
var request = require('request');
var extend = require('deep-extend');

// Package version
var VERSION = require('../package.json').version;

function Twitter (options) {
  if (!(this instanceof Twitter)) return new Twitter(options);

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,
    rest_base: 'https://api.twitter.com/1.1',
    stream_base: 'https://stream.twitter.com/1.1',
    user_stream_base: 'https://userstream.twitter.com/1.1',
    site_stream_base: 'https://sitestream.twitter.com/1.1',
    media_base: 'https://upload.twitter.com/1.1',
    request_options: {
      headers: {
        'Accept': '*/*',
        'Connection': 'close',
        'User-Agent': 'node-twitter/' + VERSION
      }
    }
  }, options);

  // Build a request object
  this.request = request.defaults(
    extend(
      // Pass the client submitted request options
      this.options.request_options,
      {
        oauth: {
          consumer_key: this.options.consumer_key,
          consumer_secret: this.options.consumer_secret,
          token: this.options.access_token_key,
          token_secret: this.options.access_token_secret
        }
      }
    )
  );
}

Twitter.prototype.__buildEndpoint = function(path, base) {

  var bases = {
    'rest': this.options.rest_base,
    'stream': this.options.stream_base,
    'user_stream': this.options.user_stream_base,
    'site_stream': this.options.site_stream_base,
    'media': this.options.media_base
  };
  var endpoint = (bases.hasOwnProperty(base)) ? bases[base] : bases.rest;

  if (url.parse(path).protocol !== null) {
    endpoint = path;
  }
  else {
    // If the path begins with media or /media
    if (path.match(/^(\/)?media/)) {
      endpoint = bases.media;
    }
    endpoint += (path.charAt(0) === '/') ? path : '/' + path;
  }

  // Remove trailing slash
  endpoint = endpoint.replace(/\/$/, "");

  // Add json extension if not provided in call
  endpoint += (path.split('.').pop() !== 'json') ? '.json' : '';

  return endpoint;
};

Twitter.prototype.__request = function(method, path, params, callback) {
  // Set the callback if no params are passed
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  // Build the options to pass to our custom request object
  var options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path), // Generate url
    qs: (method === 'get') ? params : {}, // Pass url parameters if get
    form: (method === 'post') ? params : {} // Pass form data if post
  };

  this.request(options, function(error, response, data){
    if (error) {
      callback(error, data, response);
    }
    else {
      try {
        data = JSON.parse(data);
      }
      catch(parseError) {
        callback(
          new Error('Status Code: ' + response.statusCode),
          data,
          response
        );

      }
      if (typeof data.errors !== 'undefined') {
        callback(data.errors, data, response);
      }
      else if(response.statusCode !== 200) {
        callback(
          new Error('Status Code: ' + response.statusCode),
          data,
          response
        );
      }
      else {
        callback(null, data, response);
      }
    }
  });
};

/**
 * GET
 */
Twitter.prototype.get = function(url, params, callback) {
  return this.__request('get', url, params, callback);
};

/**
>>>>>>> mainstream/master
 * POST
 */
Twitter.prototype.post = function(url, params, callback) {
  return this.__request('post', url, params, callback);
};

/**
 * STREAM
 */
Twitter.prototype.stream = function (method, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var base = 'stream';

  // Stream type customisations
  if (method === 'user') {
    base = 'user_stream';
    // Workaround for node-oauth vs. twitter commas-in-params bug
    if ( params && params.track && Array.isArray(params.track) ) {
      params.track = params.track.join(',');
    }

  } else if (method === 'site') {
    base = 'site_stream';
    // Workaround for node-oauth vs. twitter double-encode-commas bug
    if ( params && params.follow && Array.isArray(params.follow) ) {
      params.follow = params.follow.join(',');
    }
  } else if (method === 'filter') {
    base = 'stream';
    // Workaround for node-oauth vs. twitter commas-in-params bug
    if ( params && params.track && Array.isArray(params.track) ) {
      params.track = params.track.join(',');
    }
  }

  var url = this.__buildEndpoint(method, base);

  var request = this.request({ url: url, qs: params});

  var stream = new streamparser();
  stream.destroy = function() {
    // FIXME: should we emit end/close on explicit destroy?
    if ( typeof request.abort === 'function' )
    request.abort(); // node v0.4.0
    else
    request.socket.destroy();
  };

  request.on('response', function(response) {
    // FIXME: Somehow provide chunks of the response when the stream is connected
    // Pass HTTP response data to the parser, which raises events on the stream

    if(response.statusCode !== 200)  {
        stream.emit('error', response);
    }

    response.on('follow', function(chunk){
      stream.receive(chunk);
    });

    response.on('favorite', function(chunk){
      stream.receive(chunk);
    });

    response.on('unfavorite', function(chunk){
      stream.receive(chunk);
    });

    response.on('block', function(chunk){
      stream.receive(chunk);
    });

    response.on('unblock', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_created', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_destroyed', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_updated', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_member_added', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_member_removed', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_user_subscribed', function(chunk){
      stream.receive(chunk);
    });

    response.on('list_user_unsubscribed', function(chunk){
      stream.receive(chunk);
    });

    response.on('user_update', function(chunk){
      stream.receive(chunk);
    });

    response.on('data', function(chunk) {
      stream.receive(chunk);
    });

    response.on('error', function(error) {
      stream.emit('error', error);
    });

    response.on('end', function() {
      stream.emit('end', response);
    });
  });

  request.on('error', function(error) {
    stream.emit('error', error);
  });
  request.end();

  if ( typeof callback === 'function' ) {
    callback(stream);
  }
};


module.exports = Twitter;
