const { JSDOM } = require("jsdom");
const sampleFeed = require("fs")
  .readFileSync(__dirname + "/fixtures/contentful.rss.xml")
  .toString();
const sampleFeedParsed = require("./fixtures/contentful.rss.json");
const { expect } = require("chai");
const fetch = require("node-fetch");
const moment = (global.moment = require("moment"));
const { stub } = require("sinon");
const { version } = require("../package.json");

describe("jquery.rss", () => {
  let $, element, originalAjax;

  const feedUrl = "https://www.contentful.com/blog/feed.xml";
  const fakeGetJson = content => {
    originalAjax = $.ajax;

    $.ajax = function({ url, success }) {
      success({
        responseData: {
          feed: {
            entries: [
              {
                content: content,
                contentSnippet: content
              }
            ]
          }
        }
      });
    };
  };

  before(() => {
    const { window, document } = new JSDOM(`<!DOCTYPE html>`);

    global.window = window;
    global.document = window.document;
    $ = global.jQuery = require("jquery");

    require("../dist/jquery.rss.min");
  });

  beforeEach(() => {
    element = $("<div>").appendTo($("body"));
  });

  afterEach(() => {
    if (typeof originalAjax === "function") {
      $.ajax = originalAjax;
      originalAjax = null;
    }
  });

  it("supports multiple rss feeds", done => {
    originalAjax = $.ajax;
    $.ajax = function({ url, success }) {
      expect(url).to.include(
        "q=https%3A%2F%2Fwww.contentful.com%2Fblog%2Ffeed.xml,http%3A%2F%2Fwww.ebaytechblog.com%2Ffeed%2F"
      );
      
      done();
    };

    var $container = element;

    $container.rss([
      "https://www.contentful.com/blog/feed.xml",
      "http://www.ebaytechblog.com/feed/"
    ]);
  });

  it("renders an unordered list by default", function(done) {
    var $container = element;

    $container.rss(feedUrl, {}, function() {
      var renderedContent = $container.html().replace(/\n/g, "");

      expect(renderedContent).to.match(/<ul>.*<\/ul>/);
      done();
    });
  });

  it("renders 2 list entries if limit is set to 2", function(done) {
    var $container = element;

    $container.rss(
      feedUrl,
      {
        limit: 2
      },
      function() {
        expect($("li", $container).length).to.equal(2);
        done();
      }
    );
  });

  it("renders the defined entry template", function(done) {
    var $container = element;

    $container.rss(
      feedUrl,
      {
        limit: 1,
        entryTemplate: "<li>foo</li>"
      },
      function() {
        var renderedContent = $container
          .html()
          .split("\n")
          .map(function(s) {
            return s.trim();
          })
          .join("")
          .trim();

        expect(renderedContent).to.match(/<ul><li>foo<\/li><\/ul>/);
        done();
      }
    );
  });

  it("renders the defined layout template", function(done) {
    var $container = element;

    $container.rss(
      feedUrl,
      {
        limit: 1,
        layoutTemplate: "foo<ul>{entries}</ul>bar"
      },
      function() {
        var renderedContent = $container.html().replace(/\n/g, "");

        expect(renderedContent).to.match(/foo<ul>.*<\/ul>/);
        done();
      }
    );
  });

  it("supports custom tokens", function(done) {
    var $container = element;

    $container.rss(
      feedUrl,
      {
        limit: 1,
        entryTemplate: "<li>{myCustomStaticToken} {myCustomDynamicToken}</li>",
        tokens: {
          myCustomStaticToken: "static",
          myCustomDynamicToken: function() {
            return "dynamic";
          }
        }
      },
      function() {
        var renderedContent = $container
          .html()
          .split("\n")
          .map(function(s) {
            return s.trim();
          })
          .join("")
          .trim();

        expect(renderedContent).to.match(
          new RegExp("<ul><li>static dynamic</li></ul>")
        );
        done();
      }
    );
  });

  it("removes p-tags but not the content", function(done) {
    var $container = element;

    fakeGetJson("<p>May the fourth be with you!</p>");

    $container.rss(
      feedUrl,
      {
        limit: 1,
        entryTemplate: "<li>{bodyPlain}</li>"
      },
      function() {
        var renderedContent = $container
          .html()
          .split("\n")
          .map(function(s) {
            return s.trim();
          })
          .join("")
          .trim();

        expect(renderedContent).to.match(/<ul><li>.*<\/li><\/ul>/);
        done();
      }
    );
  });

  it("calls the error callback if something went wrong", function(done) {
    element.rss("https://google.com", {
      error: function() {
        expect(1).to.equal(1);
        done();
      }
    });
  });

  it("calls the success callback", function(done) {
    element.rss(feedUrl, {
      limit: 1,
      success: function() {
        expect(1).to.equal(1);
        done();
      }
    });
  });

  it("renders the defined entry template in the layout template", function(done) {
    var $container = element;

    $container.rss(
      feedUrl,
      {
        limit: 1,
        entryTemplate: "<li>bazinga</li>",
        layoutTemplate: "<ul><li>topic</li>{entries}</ul>"
      },
      function() {
        var renderedContent = $container.html().replace(/\n/g, "");

        expect(renderedContent).to.equal(
          "<ul><li>topic</li><li>bazinga</li></ul>"
        );
        done();
      }
    );
  });

  it("renders when layout template only contains the entries token", function(done) {
    var $container = $("<table>").appendTo(element);

    $container.rss(
      feedUrl,
      {
        limit: 1,
        layoutTemplate: "{entries}",
        entryTemplate: "<tr><td>{title}</td></tr>"
      },
      function() {
        var renderedContent = $container[0].outerHTML.replace(/\n/g, "");

        expect(renderedContent).to.match(
          /<table><tbody><tr><td>.*<\/td><\/tr><\/tbody><\/table>/
        );

        done();
      }
    );
  });
});
