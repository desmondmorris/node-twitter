# Examples

* Tweet
* Search
* [Streams](#streaming)
* [Proxy](#proxy)
* Media
* Authentication

## Streams

```javascript
var Twitter = require('../lib/twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
client.stream('statuses/filter', {track: 'twitter'},  function(stream){
  stream.on('data', function(tweet) {
    console.log(tweet.text);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});
```

## Proxy

To make requests behind a proxy, you must pass the proxy location through to the request object.  This is done by adding a `request_options` object to the configuration object.

```javascript
var Twitter = require('../lib/twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  request_options: {
    proxy: 'http://myproxyserver.com:1234'
  }
});

/**
 * Grab a list of favorited tweets
 **/
client.get('favorites/list', function(error, tweets, response){
  if (!error) {
    console.log(tweets);
  }
});
```
