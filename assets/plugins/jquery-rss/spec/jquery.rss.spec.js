/*global $, buster, it, describe, before, after */

'use strict';

var expect = buster.expect;

buster.spec.expose();

describe('jquery.rss', function () {
  before(function () {
    var self = this;

    this.element = $('<div>').appendTo($('body'));
    this.timeout = 10000;
    this.feedUrl = 'http://xml-rss.de/xml/site-atom.xml';
    this.fakeGetJSON = function (content) {
      self.originalGetJSON = $.getJSON;

      $.getJSON = function (url, callback) {
        callback({
          responseData: {
            feed: {
              entries: [{
                content: content,
                contentSnippet: content
              }]
            }
          }
        });
      };
    };
  });

  after(function () {
    if (typeof this.originalGetJSON === 'function') {
      $.getJSON = this.originalGetJSON;
      this.originalGetJSON = null;
    }
  });

  it('renders an unordered list by default', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {}, function () {
      var renderedContent = $container.html().replace(/\n/g, '');

      expect(renderedContent).toMatch(/<ul>.*<\/ul>/);
      done();
    });
  });

  it('renders 2 list entries if limit is set to 2', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {
      limit: 2
    }, function () {
      expect($('li', $container).length).toEqual(2);
      done();
    });
  });

  it('renders the defined entry template', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {
      limit: 1,
      entryTemplate: '<li>foo</li>'
    }, function () {
      var renderedContent = $container.html().split('\n').map(function (s) {
        return s.trim();
      }).join('').trim();

      expect(renderedContent).toMatch(/<ul><li>foo<\/li><\/ul>/);
      done();
    });
  });

  it('renders the defined layout template', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {
      limit: 1,
      layoutTemplate: 'foo<ul>{entries}</ul>bar'
    }, function () {
      var renderedContent = $container.html().replace(/\n/g, '');

      expect(renderedContent).toMatch(/foo<ul>.*<\/ul>/);
      done();
    });
  });

  it('supports custom tokens', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {
      limit: 1,
      entryTemplate: '<li>{myCustomStaticToken} {myCustomDynamicToken}</li>',
      tokens: {
        myCustomStaticToken: 'static',
        myCustomDynamicToken: function () {
          return 'dynamic';
        }
      }
    }, function () {
      var renderedContent = $container.html().split('\n').map(function (s) {
        return s.trim();
      }).join('').trim();

      expect(renderedContent).toMatch(new RegExp('<ul><li>static dynamic</li></ul>'));
      done();
    });
  });

  it('removes p-tags but not the content', function (done) {
    var $container = this.element;

    this.fakeGetJSON('<p>May the fourth be with you!</p>');

    $container.rss(this.feedUrl, {
      limit: 1,
      entryTemplate: '<li>{bodyPlain}</li>'
    }, function () {
      var renderedContent = $container.html().split('\n').map(function (s) {
        return s.trim();
      }).join('').trim();

      expect(renderedContent).toMatch(/<ul><li>May the fourth be with you!<\/li><\/ul>/);
      done();
    });
  });

  it('calls the error callback if something went wrong', function (done) {
    this.element.rss('https://google.com', {
      error: function () {
        expect(1).toEqual(1);
        done();
      }
    });
  });

  it('calls the success callback', function (done) {
    this.element.rss(this.feedUrl, {
      limit: 1,
      layoutTemplate: 'fnord',
      success: function () {
        expect(1).toEqual(1);
        done();
      }
    });
  });

  it('renders the defined entry template in the layout template', function (done) {
    var $container = this.element;

    $container.rss(this.feedUrl, {
      limit: 1,
      entryTemplate: '<li>bazinga</li>',
      layoutTemplate: '<ul><li>topic</li>{entries}</ul>'
    }, function () {
      var renderedContent = $container.html().replace(/\n/g, '');

      expect(renderedContent).toEqual('<ul><li>topic</li><li>bazinga</li></ul>');
      done();
    });
  });

  describe('ssl', function () {
    it('rewrites the host to herokuapp.com if not specified differently', function (done) {
      this.ajaxStub = this.stub($, 'getJSON', function (apiUrl) {
        expect(apiUrl).toMatch(/https:\/\/feedrapp\.herokuapp\.com/);
        done();
      });

      this.element.rss(this.feedUrl, { ssl: true });
    });

    it('uses feedrapp.info if ssl is turned off', function (done) {
      this.ajaxStub = this.stub($, 'getJSON', function (apiUrl) {
        expect(apiUrl).toMatch(/http:\/\/www\.feedrapp\.info/);
        done();
      });

      this.element.rss(this.feedUrl, { ssl: false });
    });

    it('does not overwrite the host if it was specified manually', function (done) {
      this.ajaxStub = this.stub($, 'getJSON', function (apiUrl) {
        expect(apiUrl).toMatch(/https:\/\/foo\.com/);
        done();
      });

      this.element.rss(this.feedUrl, { ssl: true, host: 'foo.com' });
    });
  });

  describe('tokens', function () {
    describe('> feed', function () {
      it('returns all feed tokens but entries', function (done) {
        var $container = this.element;

        $container.rss(this.feedUrl, {
          limit: 1,
          entryTemplate: '<li>{something}</li>',
          layoutTemplate: '<ul>{entries}</ul>',
          tokens: {
            something: function (entry, tokens) {
              expect(tokens.feed.entries).not.toBeDefined();
              return tokens.feed.title;
            }
          }
        }, function () {
          var renderedContent = $container.html().replace(/\n/g, '');

          expect(renderedContent).toEqual('<ul><li>XML-RSS.de Website-Feed</li></ul>');
          done();
        });
      });
    });

    describe('> bodyPlain', function () {
      describe('> XSS >', function () {
        after(function (done) {
          var $container = this.element;

          $container.rss(this.feedUrl, {
            limit: 1,
            entryTemplate: '<li>{bodyPlain}</li>'
          }, function () {
            var renderedContent = $container.html().split('\n').map(function (s) {
              return s.trim();
            }).join('').trim();

            expect(renderedContent).toMatch(/<ul><li><\/li><\/ul>/);

            done();
          });
        });

        it('removes script tags if they are plain', function () {
          this.fakeGetJSON('<script>alert(1)</script>');
        });

        it('removes script tags with attributes', function () {
          this.fakeGetJSON('<script type="text/javascript">alert(1)</script>');
        });

        it('removes script tags with capital letters', function () {
          this.fakeGetJSON('<SCRIPT SRC=http://ha.ckers.org/xss.js>hallo</SCRIPT>');
        });

        it('strips unsecure image tags with embedded linebreak', function () {
          this.fakeGetJSON('<IMG SRC="jav&#x09;ascript:alert(\'XSS\');">');
        });

        it('strips unsecure image tags with embedded carriage return', function () {
          this.fakeGetJSON('<IMG SRC="jav&#x0D;ascript:alert(\'XSS\');">');
        });

        it('strips unsecure image tags with real carriage return', function () {
          /* jshint ignore:start */
          /* jscs:disable */
          this.fakeGetJSON('<IMG\nSRC\n=\n"\nj\na\nv\na\ns\nc\nr\ni\np\nt\n:\na\nl\ne\nr\nt\n(\n\'\nX\nS\nS\n\'\n)\n"\n>\n');
          /* jscs:enable */
          /* jshint ignore:end */
        });

        it('strips unsecure image tags with \0 in \'javascript\'', function () {
          this.fakeGetJSON('<IMG SRC=java\0script:alert("XSS")>');
        });

        it('strips unsecure image tags with meta char before javascript tag', function () {
          this.fakeGetJSON('<IMG SRC=" &#14;  javascript:alert(\'XSS\');">');
        });

        it('strips script/xss tags', function () {
          this.fakeGetJSON('<SCRIPT/XSS SRC="http://ha.ckers.org/xss.js"></SCRIPT>');
        });

        it('strips script/src tags', function () {
          this.fakeGetJSON('<SCRIPT/SRC="http://ha.ckers.org/xss.js"></SCRIPT>');
        });

        it('strips unsecure body tag', function () {
          this.fakeGetJSON('<BODY onload!#$%&()*~+-_.,:;?@[/|\]^`=alert("XSS")>');
        });

        it('strips the unclosed script tag', function () {
          this.fakeGetJSON('<SCRIPT SRC=http://ha.ckers.org/xss.js?<B>');
        });

        it('strips unclosed script tags without protocol in src', function () {
          this.fakeGetJSON('<SCRIPT SRC=//ha.ckers.org/.j>');
        });

        it('strips script tags with line breaks in between', function () {
          this.fakeGetJSON('<SCRIPT>a=/XSS/\nalert(a.source)</SCRIPT>');
        });

        it('strips script tags when the come after a closing title tag', function () {
          this.fakeGetJSON('</TITLE><SCRIPT>alert("XSS");</SCRIPT>');
        });

        it('strips input tags with javascript in src attribute', function () {
          this.fakeGetJSON('<INPUT TYPE="IMAGE" SRC="javascript:alert(\'XSS\');">');
        });

        it('strips body tag with background attribute', function () {
          this.fakeGetJSON('<BODY BACKGROUND="javascript:alert(\'XSS\')">');
        });

        it('strips body tag with onload attribute', function () {
          this.fakeGetJSON('<BODY ONLOAD=alert(\'XSS\')>');
        });

        it('strips tags with html quotation', function () {
          this.fakeGetJSON('<SCRIPT a=">" SRC="http://ha.ckers.org/xss.js"></SCRIPT>');
        });
      });

      describe('> XSS 2 >', function () {
        var tests = [{
          name: 'strips unsecure image tags with \0 in \'script\'',
          test: '<SCR\0IPT>alert("XSS")</SCR\0IPT>',
          result: 'alert("XSS")'
        }, {
          name: 'strips script tags with extraneous open brackets',
          test: '<<SCRIPT>alert("XSS");//<</SCRIPT>',
          result: '&lt;'
        }, {
          name: 'strips half open html/javascript xss vector',
          test: '<IMG SRC="javascript:alert(\'XSS\')"',
          result: ' SRC="javascript:alert(\'XSS\')"'
        }, {
          name: 'strips half open iframe tags',
          test: '<iFraMe SRC="javascript:alert(\'XSS\')"',
          result: ' SRC="javascript:alert(\'XSS\')"'
        }, {
          name: 'strips half open iframe tag with double open bracket',
          test: '<iframe src=http://ha.ckers.org/scriptlet.html <',
          result: ' src=http://ha.ckers.org/scriptlet.html &lt;'
        }, {
          name: 'strips meta tags with content',
          test: '<META HTTP-EQUIV="Link" Content="<http://ha.ckers.org/xss.css>; REL=stylesheet">',
          result: '; REL=stylesheet"&gt;'
        }];

        tests.forEach(function (test) {
          it(test.name, function (done) {
            var $container = this.element;
            var self       = this;

            this.fakeGetJSON(test.test);

            $container.rss(this.feedUrl, {
              limit: 1,
              entryTemplate: '<li>{bodyPlain}</li>'
            }, function () {
              $.getJSON = self.originalGetJSON;

              var renderedContent = $container.html().split('\n').map(function (s) {
                return s.trim();
              }).join('').trim();

              expect(renderedContent).toEqual('<ul><li>' + test.result + '</li><\/ul>');

              done();
            });
          });
        });
      });
    });

    describe('> date', function () {
      it('renders english dates by default', function (done) {
        var $container = this.element;

        $container.rss(this.feedUrl, {}, function () {
          var renderedContent = $container.html().replace(/\n/g, '');

          expect(renderedContent).toMatch(/<a href=".*">\[.*Saturday May 22nd\] RSS<\/a>/);
          done();
        });
      });

      it('renders german dates if enabled', function (done) {
        var $container = this.element;

        $container.rss(this.feedUrl, { dateLocale: 'de' }, function () {
          var renderedContent = $container.html().replace(/\n/g, '');

          expect(renderedContent).toMatch(/<a href=".*">\[.*Samstag Mai 22\.\] RSS<\/a>/);
          done();
        });
      });
    });
  });
});
