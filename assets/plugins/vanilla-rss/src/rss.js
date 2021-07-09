import { HTML_TAGS } from "./tags";
import Ballyhoo from "ballyhoo";

function createElementFromHTML(htmlString) {
  let template = document.createElement("template");

  template.innerHTML = htmlString.trim();

  // Change this to template.childNodes to support multiple top-level nodes
  return template.content.firstElementChild;
}

function elementIs(node, tagName) {
  return node.tagName.toLowerCase() === tagName.toLowerCase();
}

export default class RSS {
  constructor(target, urls, options = {}) {
    this.version = "1.3.0"; // Synced version
    this.target = target;
    this.urls = [].concat(urls);
    this.html = [];
    this.options = {
      ssl: true,
      host: "www.feedrapp.info",
      support: true,
      limit: null,
      key: null,
      layoutTemplate: "<ul>{entries}</ul>",
      entryTemplate:
        '<li><a href="{url}">[{author}@{date}] {title}</a><br/>{shortBodyPlain}</li>',
      tokens: {},
      outputMode: "json",
      dateFormat: "dddd MMM Do",
      dateLocale: "en",
      offsetStart: false,
      offsetEnd: false,
      fetchFeed: null,
      encoding: null,
      ...options
    };
    this.events = new Ballyhoo();
  }

  on(eventName, callback) {
    this.events.on(`vanilla-rss/${eventName}`, callback);
    return this;
  }

  render() {
    return new Promise(async (resolve, reject) => {
      try {
        const feedData = await this._load();

        this.feed = feedData.responseData.feed;
        this.entries = feedData.responseData.feed.entries;
      } catch (e) {
        this.entries = [];
        this.feed = null;

        return reject(e);
      }

      const html = this._generateHTMLForEntries();

      this.target.append(html.layout);

      if (html.entries.length !== 0) {
        this.events.emit("vanilla-rss/data", {
          rss: this,
          feed: this.feed,
          entries: this.entries
        });

        const container = elementIs(html.layout, "entries")
          ? html.layout
          : html.layout.querySelector("entries");

        this._appendEntries(container, html.entries);
      }

      resolve();
    });
  }

  _appendEntries(target, entries) {
    entries.forEach((entry, index) => {
      var $html = this._wrapContent(entry);

      target.insertAdjacentHTML("beforebegin", $html.outerHTML);
    });

    target.remove();
  }

  _wrapContent(content) {
    if (content.trim().indexOf("<") !== 0) {
      // the content has no html => create a surrounding div
      return createElementFromHTML(`<div>${content}</div>`);
    } else {
      // the content has html => don't touch it
      return createElementFromHTML(content);
    }
  }

  _load() {
    const apiProtocol = `http${this.options.ssl ? "s" : ""}`;
    const apiHost = `${apiProtocol}://${this.options.host}`;

    const queryParams = {
      support: this.options.support,
      version: this.version,
      q: this.urls.map(u => encodeURIComponent(u)).join(",")
    };

    // set limit to offsetEnd if offset has been set
    if (this.options.offsetStart && this.options.offsetEnd) {
      this.options.limit = this.options.offsetEnd;
    }

    if (this.options.limit !== null) {
      queryParams.num = this.options.limit;
    }

    if (this.options.key !== null) {
      queryParams.key = this.options.key;
    }

    if (this.options.encoding !== null) {
      queryParams.encoding = this.options.encoding;
    }

    if (this.options.order) {
      queryParams.order = this.options.order;
    }

    const queryString = Object.keys(queryParams)
      .map(key => `${key}=${queryParams[key]}`)
      .join("&");
    const apiUrl = `${apiHost}?${queryString}`;

    return this._fetchFeed(apiUrl);
  }

  async _fetchFeed(apiUrl) {
    if (this.options.fetchFeed) {
      return await this.options.fetchFeed(apiUrl);
    }

    const data = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return await data.json();
  }

  _generateHTMLForEntries() {
    const result = { entries: [], layout: null };

    this.entries.forEach((entry, index) => {
      const offsetStart = this.options.offsetStart;
      const offsetEnd = this.options.offsetEnd;
      let evaluatedString;

      // offset required
      if (offsetStart && offsetEnd) {
        if (index >= offsetStart && index <= offsetEnd) {
          if (this._isRelevant(entry, result.entries)) {
            evaluatedString = this._evaluateStringForEntry(
              this.options.entryTemplate,
              entry
            );

            result.entries.push(evaluatedString);
          }
        }
      } else {
        // no offset
        if (this._isRelevant(entry, result.entries)) {
          evaluatedString = this._evaluateStringForEntry(
            this.options.entryTemplate,
            entry
          );

          result.entries.push(evaluatedString);
        }
      }
    });

    if (!!this.options.entryTemplate) {
      // we have an entryTemplate
      result.layout = this._wrapContent(
        this.options.layoutTemplate.replace("{entries}", "<entries></entries>")
      );
    } else {
      // no entryTemplate available
      result.layout = this._wrapContent("<div><entries></entries></div>");
    }

    return result;
  }

  _isRelevant(entry, entries) {
    const tokenMap = this._getTokenMap(entry);

    if (this.options.filter) {
      if (
        this.options.filterLimit &&
        this.options.filterLimit === entries.length
      ) {
        return false;
      } else {
        return this.options.filter(entry, tokenMap);
      }
    } else {
      return true;
    }
  }

  _evaluateStringForEntry(string, entry) {
    var result = string;

    (string.match(/(\{.*?\})/g) || []).forEach(token => {
      result = result.replace(token, this._getValueForToken(token, entry));
    });

    return result;
  }

  _getFormattedDate(dateString) {
    // If a custom formatting function is provided, use that.
    if (this.options.dateFormatFunction) {
      return this.options.dateFormatFunction(dateString);
    } else if (typeof moment !== "undefined") {
      // If moment.js is available and dateFormatFunction is not overriding it,
      // use it to format the date.
      var date = moment(new Date(dateString));

      if (date.locale) {
        date = date.locale(this.options.dateLocale);
      } else {
        date = date.lang(this.options.dateLocale);
      }

      return date.format(this.options.dateFormat);
    } else {
      // If all else fails, just use the date as-is.
      return dateString;
    }
  }

  _getTokenMap(entry) {
    if (!this.feedTokens) {
      var feed = JSON.parse(JSON.stringify(this.feed));

      delete feed.entries;
      this.feedTokens = feed;
    }

    return {
      feed: this.feedTokens,
      url: entry.link,
      author: entry.author,
      date: this._getFormattedDate(entry.publishedDate),
      title: entry.title,
      body: entry.content,
      shortBody: entry.contentSnippet,

      bodyPlain: (function(entry) {
        var result = entry.content
          .replace(/<script[\\r\\\s\S]*<\/script>/gim, "")
          .replace(/<\/?[^>]+>/gi, "");

        for (var i = 0; i < HTML_TAGS.length; i++) {
          result = result.replace(new RegExp("<" + HTML_TAGS[i], "gi"), "");
        }

        return result;
      })(entry),

      shortBodyPlain: entry.contentSnippet.replace(/<\/?[^>]+>/gi, ""),
      index: this.entries.indexOf(entry),
      totalEntries: this.entries.length,

      teaserImage: (function(entry) {
        try {
          return entry.content.match(/(<img.*?>)/gi)[0];
        } catch (e) {
          return "";
        }
      })(entry),

      teaserImageUrl: (function(entry) {
        try {
          return entry.content
            .match(/(<img.*?>)/gi)[0]
            .match(/src=["'](.*?)["']/)[1];
        } catch (e) {
          return "";
        }
      })(entry),
      ...this.options.tokens
    };
  }

  _getValueForToken(_token, entry) {
    var tokenMap = this._getTokenMap(entry);
    var token = _token.replace(/[\{\}]/g, "");
    var result = tokenMap[token];

    if (typeof result !== "undefined") {
      return typeof result === "function" ? result(entry, tokenMap) : result;
    } else {
      throw new Error("Unknown token: " + _token + ", url:" + this.url);
    }
  }
}
