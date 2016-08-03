'use strict';

/**
 * Module dependencies
 */

var url = require('url');
var Streamparser = require('./parser');
var request = require('request');
var extend = require('deep-extend');

// Package version
var VERSION = require('../package.json').version;

function Twitter(options) {
  if (!(this instanceof Twitter)) { return new Twitter(options) }

  this.VERSION = VERSION;

  // Merge the default options with the client submitted options
  this.options = extend({
    consumer_key: null,
    consumer_secret: null,
    access_token_key: null,
    access_token_secret: null,
    bearer_token: null,
    rest_base: 'https://api.twitter.com/1.1',
    stream_base: 'https://stream.twitter.com/1.1',
    user_stream_base: 'https://userstream.twitter.com/1.1',
    site_stream_base: 'https://sitestream.twitter.com/1.1',
    media_base: 'https://upload.twitter.com/1.1',
    request_options: {
      headers: {
        Accept: '*/*',
        Connection: 'close',
        'User-Agent': 'node-twitter/' + VERSION
      }
    }
  }, options);

  // Default to user authentication
  var authentication_options = {
    oauth: {
      consumer_key: this.options.consumer_key,
      consumer_secret: this.options.consumer_secret,
      token: this.options.access_token_key,
      token_secret: this.options.access_token_secret
    }
  };

  // Check to see if we are going to use User Authentication or Application Authetication
  if (this.options.bearer_token) {
    authentication_options = {
      headers: {
        Authorization: 'Bearer ' + this.options.bearer_token
      }
    };
  }

  // Configure default request options
  this.request = request.defaults(
    extend(
      this.options.request_options,
      authentication_options
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

  if (url.parse(path).protocol) {
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
  endpoint = endpoint.replace(/\/$/, '');

  // Add json extension if not provided in call
  endpoint += (path.split('.').pop() !== 'json') ? '.json' : '';

  return endpoint;
};

Twitter.prototype.__request = function(method, path, params, callback) {
  var base = 'rest';

  // Set the callback if no params are passed
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  // Set API base
  if (typeof params.base !== 'undefined') {
    base = params.base;
    delete params.base;
  }

  // Build the options to pass to our custom request object
  var options = {
    method: method.toLowerCase(),  // Request method - get || post
    url: this.__buildEndpoint(path, base) // Generate url
  };

  // Pass url parameters if get
  if (method === 'get') {
    options.qs = params;
  }

  // Pass form data if post
  if (method === 'post') {
    var formKey = 'form';

    if (typeof params.media !== 'undefined') {
      formKey = 'formData';
    }
    options[formKey] = params;
  }

  this.request(options, function(error, response, data) {
    // request error
    if (error) {
      return callback(error, data, response);
    }

    // JSON parse error or empty strings
    try {
      // An empty string is a valid response
      if (data === '') {
        data = {};
      }
      else {
        data = JSON.parse(data);
      }
    }
    catch(parseError) {
      return callback(
        new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
        data,
        response
      );
    }


    // response object errors
    // This should return an error object not an array of errors
    if (data.errors !== undefined) {
      return callback(data.errors, data, response);
    }

    // status code errors
    if(response.statusCode < 200 || response.statusCode > 299) {
      return callback(
        new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage),
        data,
        response
      );
    }
    // no errors
    callback(null, data, response);
  });

};

/**
 * GET
 */
Twitter.prototype.get = function(url, params, callback) {
  return this.__request('get', url, params, callback);
};

/**
 * POST
 */
Twitter.prototype.post = function(url, params, callback) {
  return this.__request('post', url, params, callback);
};

/**
 * STREAM
 */
Twitter.prototype.stream = function(method, params, callback) {
  if (typeof params === 'function') {
    callback = params;
    params = {};
  }

  var base = 'stream';

  if (method === 'user' || method === 'site') {
    base = method + '_' + base;
  }

  var url = this.__buildEndpoint(method, base);
  var request = this.request({url: url, qs: params});
  var stream = new Streamparser();

  stream.destroy = function() {
    // FIXME: should we emit end/close on explicit destroy?
    if ( typeof request.abort === 'function' ) {
      request.abort(); // node v0.4.0
    }
    else {
      request.socket.destroy();
    }
  };

  request.on('response', function(response) {
    if(response.statusCode !== 200) {
      stream.emit('error', new Error('Status Code: ' + response.statusCode));
    }
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

  if (typeof callback === 'function') {
    callback(stream);
  }
  else {
    return stream;
  }
};


module.exports = Twitter;
