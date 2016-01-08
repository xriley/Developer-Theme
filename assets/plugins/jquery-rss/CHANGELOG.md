## Change Log
All notable changes to this project will be documented in this file.

## v3.2.0
### Added
- Possibility to specify the date locale via moment.js

## v3.1.0
### Changed
- Re-added support for SSL

## v3.0.1
### Changed
- Use www.feedrapp.info instead of feedrapp.info

## v3.0.0
### Changed
- Replace Google Feed API with [feedr](https://github.com/sdepold/feedr)

## v2.0.0
### Changed
- moment.js is now optional
- Please note that the format of dates might change when moment.js is available and no `dateFormat` option is specified. In that scenario all dates will be transformed to the format `dddd MMM Do`.

## v1.5.1
### Fixed
- moment.js deprecation warning

## v1.5.0
### Added
- `onData` callback which gets triggered after receiving the data but before the rendering.

## v1.4.0
### Added
- Pass the feeds meta data to the tokens object.

## v1.3.0
### Added
- Error and success callback. (thanks to eliten00b)

### Fixed
- forEach loop. (thanks to aegisrunestone)

## v1.2.0
### Added
- Possibility to define effects for the appearance of entries

## v1.1.0
### Added
- XSS protection

### Changed
- Switched to busterjs for tests
- Implemented tests for XSS protection

## v1.0.0
### Changed
- Complete test coverage with mocha

## v0.4.0
### Added
- Possibility to define the output method of google request

### Changed
- Separate layout template from entry template (thanks to ChaosSteffen)

## v0.3.0
### Added
- Callback, which is triggered after rendering of all entries (thanks to cm0s)

### Changed
- Evaluate token map before passing it to custom token functions
- Moved minified version into `dist` folder (thanks to markrambow)

## v0.2.2
### Fixed
- Array#indexOf IE bug

## v0.2.1
### Fixed
- Catch failures while extracting images

## v0.2.0
### Added
- The tokens `index` and `totalEntries`
- Preparation for jasmine tests

## v0.1.1
### Added
- Entry filtering
