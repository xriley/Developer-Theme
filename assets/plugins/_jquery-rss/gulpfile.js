'use strict';

// 3rd-party modules
var buster      = require('gulp-busterjs');
var gulp        = require('gulp');
var jscs        = require('gulp-jscs');
var jshint      = require('gulp-jshint');
var mdBlock     = require('gulp-markdown-code-blocks');
var runSequence = require('run-sequence');

gulp.task('default', function (done) {
  runSequence('lint', 'test', done);
});

gulp.task('test', function (done) {
  runSequence('test-integration', done);
});

gulp.task('lint', function (done) {
  runSequence('lint-code', 'lint-readme', done);
});

gulp.task('lint-code', function () {
  return gulp
    .src([
      './gulpfile.js',
      './spec/**/*.js',
      './src/**/*.js'
    ])
    .pipe(jscs())
    .pipe(jscs.reporter('fail'))
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('lint-readme', function () {
  return gulp
    .src('./README.md')
    .pipe(mdBlock());
});

gulp.task('test-integration', function () {
  return gulp
    .src('./spec/**/*.spec.js')
    .pipe(buster({
      name: 'integration',
      environment: 'browser',
      libs: ['lib/*.js', 'node_modules/moment/min/moment-with-locales.min.js'],
      sources: ['dist/jquery.rss.min.js'],
      useHeadlessBrowser: true
    }));
});
