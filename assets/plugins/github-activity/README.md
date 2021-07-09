# GitHub Activity Stream Widget

This is a small Javascript plugin that creates a stream of your recent GitHub activity. It displays the user's name, username, photo, and a list of each individual activity type. Click [here](https://caseyscarborough.github.io/github-activity) for a demo.

### Light Theme

![](https://raw.githubusercontent.com/caseyscarborough/github-activity/gh-pages/images/light.png)

### Dark Theme

![](https://raw.githubusercontent.com/caseyscarborough/github-activity/gh-pages/images/dark.png)

## Dependencies

The two dependencies for the plugin are the [Mustache](https://github.com/janl/mustache.js/) templating library and [Octicons](https://octicons.github.com/) (if you want the icons to show). You can include these along with the scripts for the plugin in the head of your page with the following HTML:

### Using CDN

```html
<link rel="stylesheet" href="https://unpkg.com/octicons@4.4.0/build/font/octicons.css">
<link rel="stylesheet" href="https://unpkg.com/github-activity-feed@latest/dist/github-activity.min.css">

<script type="text/javascript" src="https://unpkg.com/mustache@4.2.0/mustache.min.js"></script>
<script type="text/javascript" src="https://unpkg.com/github-activity-feed@latest/dist/github-activity.min.js"></script>

<!-- if using dark theme add this in addition to the main CSS file -->
<link rel="stylesheet" href="https://unpkg.com/github-activity-feed@latest/dist/github-activity.dark.min.css">
```

### Using npm

Install the library:

```bash
npm install --save github-activity-feed
```

Add the files to your webpage:

```html
<link rel="stylesheet" href="node_modules/octicons/build/font/octicons.css">
<link rel="stylesheet" href="node_modules/github-activity-feed/dist/github-activity.min.css">

<script type="text/javascript" src="node_modules/mustache/mustache.min.js"></script>
<script type="text/javascript" src="node_modules/github-activity-feed/dist/github-activity.min.js"></script>

<!-- if using dark theme add this in addition to the main CSS file -->
<link rel="stylesheet" href="node_modules/github-activity-feed/dist/github-activity.dark.min.css">
```

## Building

If you'd like to build the files yourself:

```bash
# Install dependencies
npm install

# Build dist
npx grunt
```

## Usage

To use the library, begin by creating a new div with an id in the body of your page:

```html
<div id="feed"></div>
```

Then call the feed method via Javascript:

```js
GitHubActivity.feed({
  username: "your-username",
  repository: "your-repo", // optional
  selector: "#feed",
  limit: 20, // optional
});
```

## Credits

* [MD5 Methods](http://www.myersdaily.org/joseph/javascript/md5-text.html)

## Fork and Enjoy

Please feel free to contribute to the application by following the steps below:

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
