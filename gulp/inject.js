'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('inject', ['scripts', 'styles'], function () {
//gulp.task('inject', ['scripts', 'styles'], function () {
  var injectStyles = gulp.src([
    path.join(conf.paths.tmp, '/serve/app/**/*.css'),
    path.join('!' + conf.paths.tmp, '/serve/app/vendor.css')
  ], { read: false });

  var injectScripts = gulp.src([
    path.join(conf.paths.tmp, '/serve/app/**/*.module.js'),
    path.join(conf.paths.tmp, '/serve/app/**/*.js'),
    path.join('!' + conf.paths.src, '/app/**/*.spec.js'),
    path.join('!' + conf.paths.src, '/app/**/*.mock.js')
  ], { read: false });

  var injectOptions = {
    ignorePath: [conf.paths.src, path.join(conf.paths.tmp, '/serve')],
    addRootSlash: false
  };

  var injectPolyfills = gulp.src(['node_modules/babel-core/browser-polyfill.js'], { read: false });
  //var injectPolyfills = gulp.src([
  //  path.join(conf.paths.tmp, '/polyfills/**/*.js')
  //], { read: false });

  var polyfillInjectOptions = {
    starttag: '<!-- inject:polyfills -->',
    //ignorePath: path.join(conf.paths.tmp, '/polyfills'),
    relative: true,
    addRootSlash: false
  };

  return gulp.src(path.join(conf.paths.src, '/*.html'))
    .pipe($.inject(injectPolyfills, polyfillInjectOptions))	//DAVID: polyfills
    .pipe($.inject(injectStyles, injectOptions))	//DAVID: inject css file(s) in index.html
    .pipe($.inject(injectScripts, injectOptions))	//DAVID: inject JS files
    .pipe(wiredep(_.extend({}, conf.wiredep)))		//DAVID: inject BOWER dependencies
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve')));	//DAVID: now move index.html to /serve dir
});
