var Twitter = require('../lib/twitter');

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

/**
 * Get Favorites
 **/
// client.getFavorites(function(payload){
//   console.log(payload);
// });

/**
 * Create Favorite
 **/
// client.createFavorite({id: 'XXXXX'}, function(payload){
//   console.log(payload);
// });

/**
 * Destroy Favorite
 **/
// client.destroyFavorite({id: 'XXXXX'}, function(payload){
//   console.log(payload);
// });
