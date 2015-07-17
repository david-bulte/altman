'use strict';

var path = require('path');
var gulp = require('gulp');
var conf = require('./conf');

var browserSync = require('browser-sync');

var $ = require('gulp-load-plugins')();

var wiredep = require('wiredep').stream;
var _ = require('lodash');

gulp.task('styles', function () {
  var sassOptions = {
    style: 'expanded'
  };

  //DAVID: all scss files in the project(NOT index.scss)
  var injectFiles = gulp.src([
    path.join(conf.paths.src, '/app/**/*.scss'),
    path.join('!' + conf.paths.src, '/app/index.scss')
  ], { read: false });

  var injectOptions = {
    transform: function(filePath) {
      filePath = filePath.replace(conf.paths.src + '/app/', '');
      return '@import "' + filePath + '";';
    },
    starttag: '// injector',
    endtag: '// endinjector',
    addRootSlash: false
  };


  return gulp.src([
    path.join(conf.paths.src, '/app/index.scss')	//DAVID: following actions all on index.scss?
  ])
    .pipe($.inject(injectFiles, injectOptions))		//DAVID: inject all other scss files into main one. NOTE we don't touch the original index.scss file - this is a VINYL file?
    .pipe(wiredep(_.extend({}, conf.wiredep)))		//DAVID: inject bower scss dependencies (index.scss is marked with 'bower:scss'
    .pipe($.sourcemaps.init())						//DAVID: sourcemaps is initalized, 
													//	next sass transformation + autoprefixer, 
													//	finally: the original file (index.scss) will be written inline as sourcemap
    .pipe($.sass(sassOptions)).on('error', conf.errorHandler('Sass'))
    .pipe($.autoprefixer()).on('error', conf.errorHandler('Autoprefixer'))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(path.join(conf.paths.tmp, '/serve/app/')))	//DAVID: move index.scss file to /serve dir
    .pipe(browserSync.reload({ stream: true }));
});
