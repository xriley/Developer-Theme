# jquery.rss [![Build Status](https://travis-ci.org/sdepold/jquery-rss.svg?branch=master)](https://travis-ci.org/sdepold/jquery-rss)

This plugin can be used to read a RSS feed and transform it into a custom piece of HTML.

## Alternatives

A vanilla JavaScript version of this library can be found here: [Vanilla RSS](https://github.com/sdepold/vanilla-rss).
This plugin uses [Feedr](https://github.com/sdepold/feedr), a backend server that parses and converts RSS feeds into its JSON representation. The server was built as a drop-in replacement for Google's former Feed API.

## Support

Since version 3.4.0 of jquery.rss, users have the chance to support funding future developments and
covering the costs for the hosting of jquery.rss' respective server side companion app [feedr](https://github.com/sdepold/feedr).

Every once in a while supporters will get affiliate links instead of one of the feed's entries.

If you are not interested in supporting the authors of the plugin, then you can easily opt-out of it by setting the respective
`support` option. See below for further details.

Thanks in advance!

## Installation

Through npm:

```
$ npm install jquery
$ npm install jquery-rss

const $ = require('jquery');
require('jquery-rss); // This will add the plugin to the jQuery namespace
```

Through cdnjs:

```
<script src="http://code.jquery.com/jquery-1.11.0.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-rss/3.3.0/jquery.rss.min.js"></script>
```

## Setup

```html
<!DOCTYPE html>
<html>
  <head>
    <title>jquery.rss example</title>
    <script src="lib/jquery-1.6.4.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.8.4/moment.min.js"></script>
    <script src="dist/jquery.rss.min.js"></script>
    <script>
      jQuery(function($) {
        $("#rss-feeds").rss("http://feeds.feedburner.com/premiumpixels");
      });
    </script>
  </head>
  <body>
    <div id="rss-feeds"></div>
  </body>
</html>
```

Demo link for above code: http://embed.plnkr.co/WQRoCYLld162uplnz1rc/preview

Note: Moment.js is _optional_. If you include it, jquery.rss will use it to format dates.
If you do not want to include Moment.js, you may opt for providing your own date formatting function, or for not formatting dates at all.

## Options

```javascript
$("#rss-feeds").rss(
  // You can either provide a single feed URL or a list of URLs (via an array)
  "http://feeds.feedburner.com/premiumpixels",
  {
    // how many entries do you want?
    // default: 4
    // valid values: any integer
    limit: 10,

    // want to offset results being displayed?
    // default: false
    // valid values: any integer
    offsetStart: false, // offset start point
    offsetEnd: false, // offset end point

    // will request the API via https
    // default: false
    // valid values: false, true
    ssl: true,

    // which server should be requested for feed parsing
    // the server implementation is here: https://github.com/sdepold/feedr
    // default: feedrapp.info
    // valid values: any string
    host: "my-own-feedr-instance.com",

    // option to seldomly render ads
    // ads help covering the costs for the feedrapp server hosting and future improvements
    // default: true
    // valid values: false, true
    support: false,

    // outer template for the html transformation
    // default: "<ul>{entries}</ul>"
    // valid values: any string
    layoutTemplate: "<div class='feed-container'>{entries}</div>",

    // inner template for each entry
    // default: '<li><a href="{url}">[{author}@{date}] {title}</a><br/>{shortBodyPlain}</li>'
    // valid values: any string
    entryTemplate: "<p>{title}</p>",

    // additional token definition for in-template-usage
    // default: {}
    // valid values: any object/hash
    tokens: {
      foo: "bar",
      bar: function(entry, tokens) {
        return entry.title;
      }
    },

    // formats the date with moment.js (optional)
    // default: 'dddd MMM Do'
    // valid values: see http://momentjs.com/docs/#/displaying/
    dateFormat: "MMMM Do, YYYY",

    // localizes the date with moment.js (optional)
    // default: 'en'
    dateLocale: "de",

    // Defines the format which is used for the feed.
    // Default: null (utf8)
    // valid values: https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings
    encoding: "ISO-8859-1",

    // Defined the order of the feed's entries.
    // Default: undefined (keeps the order of the original feed)
    // valid values: All entry properties; title, link, content, contentSnippet, publishedDate, categories, author, thumbnail
    // Order can be reversed by prefixing a dash (-)
    order: "-publishedDate",

    // formats the date in whatever manner you choose. (optional)
    // this function should return your formatted date.
    // this is useful if you want to format dates without moment.js.
    // if you don't use moment.js and don't define a dateFormatFunction, the dates will
    // not be formatted; they will appear exactly as the RSS feed gives them to you.
    dateFormatFunction: function(date) {},

    // a callback, which gets triggered when an error occurs
    // default: function() { throw new Error("jQuery RSS: url don't link to RSS-Feed") }
    error: function() {},

    // a callback, which gets triggered when everything was loaded successfully
    // this is an alternative to the next parameter (callback function)
    // default: function(){}
    success: function() {},

    // a callback, which gets triggered once data was received but before the rendering.
    // this can be useful when you need to remove a spinner or something similar
    onData: function() {}
  },

  // callback function
  // called after feeds are successfully loaded and after animations are done
  function callback() {}
);
```

### Note about the host option

Since version 3.0.0 the plugin is no longer using the Google Feed API but a drop-in replacement called [feedr](https://feedrapp.info). That server is currently running on Heroku and might have some downtimes, interruptions or unexpected issues. While I will try to keep those problems as rare as possible, it can totally happen from time to time. I might move the service to some other provide or even improve the infrastructure.

If you don't want to rely on the [provided server](http://feedrapp.info) and instead run your own version, you can just download feedr, install the dependencies and run it. As written above, you can specify the host which is used to parse the feeds with the `host` option.

## Templating

As seen in the options, you can specify a template in order to transform the json objects into HTML. In order to that, you can either define the outer template (which describes the html around the entries) or the entry template (which describes the html of an entry).

The basic format of those templates are:

```html
<!-- layoutTemplate: -->
"<outer-html>{entries}</outer-html>"

<!-- entryTemplate: -->
"<any-html>{token1}{token2}</any-html>"
```

So, let's say you have specified a limit of 2, using the upper pseudo html. This will result in the following:

```html
<outer-html>
  <any-html>{token1}{token2}</any-html>
  <any-html>{token1}{token2}</any-html>
</outer-html>
```

There are some predefined tokens:

- url: the url to the post
- author: the author of the post
- date: the publishing date
- title: the title of the post
- body: the complete content of the post
- shortBody: the shortened content of the post
- bodyPlain: the complete content of the post without html
- shortBodyPlain: the shortened content of the post without html
- teaserImage: the first image in the post's body
- teaserImageUrl: the url of the first image in the post's body
- index: the index of the current entry
- totalEntries: the total count of the entries
- feed: contains high level information of the feed (e.g. title of the website)

You can also define custom tokens using the `tokens` option:

```javascript
$("#foo").rss(url, {
  entryTemplate: "{dynamic}, {static}, {re-use}",
  tokens: {
    dynamic: function(entry, tokens) {
      return "dynamic-stuff: " + entry.title;
    },
    "re-use": function(entry, tokens) {
      return encodeURIComponent(tokens.teaserImageUrl);
    },
    static: "static"
  }
});
```

Please make sure to NOT define infinite loops. The following example is really BAD:

```javascript
$('#foo').rss(url, {
  entryTemplate: "{loop}",
  tokens: {
    whoops: function(entry, tokens) { return tokens.loop() }
    loop: function(entry, tokens) { return tokens.whoops() }
  }
})
```

Here is a real-world example:

```javascript
$("#foo").rss(url, {
  layoutTemplate: "<table><tr><th>Title</th></tr>{entries}</table>",
  entryTemplate: "<tr><td>{title}</td></tr>"
});
```

## Filtering

The plugin also allows you to filter specific entries in order to only print them:

```javascript
$("#foo").rss(url, {
  limit: 100,
  filterLimit: 10,
  filter: function(entry, tokens) {
    return tokens.title.indexOf("my filter") > -1;
  }
});
```

This will request 100 entries via the Feed API and renders the first 10 matching entries.

## Testing

The test suite is using BusterJS. In order to successfully run the tests you will need [phantomjs](http://phantomjs.org/).
If that is installed you only have to run `npm test`.

## Authors/Contributors

- Sascha Depold ([Twitter](http://twitter.com/sdepold) | [Github](http://github.com/sdepold) | [Website](http://depold.com))
- Steffen Schröder ([Twitter](http://twitter.com/ChaosSteffen) | [Github](http://github.com/ChaosSteffen) | [Website](http://schroeder-blog.de))
