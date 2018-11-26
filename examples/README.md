# Examples

* [Tweet](#tweet)
* [Retweet](#retweet)
* [Search](#search)
* [Streams](#streams)
* [Proxy](#proxy)
* [Media](#media)
* [Chunked Media](#chunked-media)

## Tweet

```javascript
client.post('statuses/update', {status: 'I am a tweet'}, function(error, tweet, response) {
  if (!error) {
    console.log(tweet);
  }
});
```

## Retweet

```javascript
var tweetId = 'XXXXX';
client.post('statuses/retweet/' + tweetId, function(error, tweet, response) {
  if (!error) {
    console.log(tweet);
  }
});
```

## Search

```javascript
client.get('search/tweets', {q: 'node.js'}, function(error, tweets, response) {
   console.log(tweets);
});
```

## Streams

```javascript
var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

/**
 * Stream statuses filtered by keyword
 * number of tweets per second depends on topic popularity
 **/
client.stream('statuses/filter', {track: 'twitter'},  function(stream) {
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
var Twitter = require('twitter');

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
client.get('favorites/list', function(error, tweets, response) {
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
client.post('media/upload', {media: data}, function(error, media, response) {

  if (!error) {

    // If successful, a media object will be returned.
    console.log(media);

    // Lets tweet it
    var status = {
      status: 'I am a tweet',
      media_ids: media.media_id_string // Pass the media id string
    }

    client.post('statuses/update', status, function(error, tweet, response) {
      if (!error) {
        console.log(tweet);
      }
    });

  }
});
```

## Chunked Media

The [single-step media upload process using `media/upload`](#media) has a restricted feature set and doesn't support the uploading of movies or animated GIFs. You can use the multi-step chunked upload process outlined here for still images, but you _can't_ use the single-step process for movies or animated GIFs—you'll need to use this multi-step flow. [Twitter recommends that you use the chunked-upload approach](https://dev.twitter.com/rest/reference/post/media/upload) for all media.

The steps for uploading media this way all use the `media/upload` endpoint, but invoke it with different commands:

1. `INIT`: In which you declare what kind of media you're going to upload and how big it is (in bytes). The API responds with a `mediaId` that you'll use in subsequent calls to identify the media you're referring to.
2. `APPEND`: Called one or more times with a chunk of your media's data. You can use the `segment_index` property to identify different chunks, sequentially.
3. `FINALIZE`: Declares that you are finished uploading chunks of data for your media.

The following example uses synchronous I/O for readability and brevity, and sends the media in a single chunk (step 2, `appendUpload`). For performance optimization, you may wish to use asynchronous I/O and split your media upload into multiple chunks.

_Note_: Media IDs from Twitter are 64-bit numbers that are larger than JavaScript's `Number.MAX_SAFE_INTEGER` value. Hence we'll use the String `media_id_string` representation instead.

```javascript
const Twitter     = require('twitter');
const client      = new Twitter({ /** ... **/ });

const pathToMovie = '/path/to/your/video/animated-gif.gif';
const mediaType   = 'image/gif'; // `'video/mp4'` is also supported
const mediaData   = require('fs').readFileSync(pathToMovie);
const mediaSize    = require('fs').statSync(pathToMovie).size;

initUpload() // Declare that you wish to upload some media
  .then(appendUpload) // Send the data for the media
  .then(finalizeUpload) // Declare that you are done uploading chunks
  .then(mediaId => {
    // You now have an uploaded movie/animated gif
    // that you can reference in Tweets, e.g. `update/statuses`
    // will take a `mediaIds` param.
  });

  /**
   * Step 1 of 3: Initialize a media upload
   * @return Promise resolving to String mediaId
   */
  function initUpload () {
    return makePost('media/upload', {
      command    : 'INIT',
      total_bytes: mediaSize,
      media_type : mediaType,
    }).then(data => data.media_id_string);
  }

  /**
   * Step 2 of 3: Append file chunk
   * @param String mediaId    Reference to media object being uploaded
   * @return Promise resolving to String mediaId (for chaining)
   */
  function appendUpload (mediaId) {
    return makePost('media/upload', {
      command      : 'APPEND',
      media_id     : mediaId,
      media        : mediaData,
      segment_index: 0
    }).then(data => mediaId);
  }

  /**
   * Step 3 of 3: Finalize upload
   * @param String mediaId   Reference to media
   * @return Promise resolving to mediaId (for chaining)
   */
  function finalizeUpload (mediaId) {
    return makePost('media/upload', {
      command : 'FINALIZE',
      media_id: mediaId
    }).then(data => mediaId);
  }

  /**
   * (Utility function) Send a POST request to the Twitter API
   * @param String endpoint  e.g. 'statuses/upload'
   * @param Object params    Params object to send
   * @return Promise         Rejects if response is error
   */
  function makePost (endpoint, params) {
    return new Promise((resolve, reject) => {
      client.post(endpoint, params, (error, data, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    });
  }
```
