# Examples

* [Tweet](#tweet)
* [Retweet](#retweet)
* [Search](#search)
* [Streams](#streams)
* [Proxy](#proxy)
* [Media](#media)
* Authentication

## Tweet

```javascript
client.post('/statuses/update.json', {status: 'I am a tweet'}, function(error, tweet, response){
  if (!error) {
    console.log(tweet);
  }
});
```

## Retweet

```javascript
var tweetId = 'XXXXX';
client.post('/statuses/retweet/' + tweetId + '.json', function(error, tweet, response){
  if (!error) {
    console.log(tweet);
  }
});
```

## Search

```javascript
client.get('/search/tweets.json', {q: 'node.js'}, function(error, tweets, response){
   console.log(tweets);
});
```

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
client.stream('/statuses/filter', {track: 'twitter'},  function(stream){
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
client.get('/favorites/list.json', function(error, tweets, response){
  if (!error) {
    console.log(tweets);
  }
});
```


## Media

Lets upload a new image and post a tweet including.

```javascript

// Load your image
var data = require('fs').readFileSync('image.jpg');

// Make post request on media endpoint. Pass file data as media parameter
client.post('/media/upload.json', {media: data}, function(error, media, response){

  if (!error) {

    // If successful, a media object will be returned.
    console.log(media);

    // Lets tweet it
    var status = {
      status: 'I am a tweet',
      media_ids: media.media_id_string // Pass the media id string
    }

    client.post('statuses/update', status, function(error, tweet, response){
      if (!error) {
        console.log(tweet);
      }
    });

  }
});
```
