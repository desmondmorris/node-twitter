fs = require 'fs'
Twitter = require './lib/twitter'

twitter = new Twitter
    consumer_key: process.env['CONSUMER_KEY']
    consumer_secret:  process.env['CONSUMER_SECRET']
    access_token_key:  process.env['ACCESS_TOKEN']
    access_token_secret:  process.env['ACCESS_TOKEN_SECRET']

twitter.uploadAndUpdate 'test',
        buffer: fs.readFileSync '<your JPEG file>.jpg'
        filename: 'test.jpg'
        contentDisposition: 'file'
        contentType: 'image/' + 'jpeg'
    , (data) ->
        console.log data
