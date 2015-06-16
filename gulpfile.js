var gulp = require('gulp'),
  //minifycss = require('gulp-minify-css'),
  jshint = require('gulp-jshint'),
  //uglify = require('gulp-uglify'),
  //rename = require('gulp-imagemin'),
  //concat = require('gulp-concat'),
  //notify = require('gulp-notify'),
  //cache = require('gulp-cache'),
  //del = require('del'),
  browserSync = require('browser-sync'),
  nodemon = require('gulp-nodemon');

gulp.task('start', function() {
  nodemon({
    script: 'index.js',
    ext: 'js'
  });
  browserSync.init({
    proxy: 'localhost:3000',
    port: 3001
  });
  gulp.watch(['public/**/*.html', 'public/**/*.css', '!public/bower_components'], browserSync.reload);
});

gulp.task('lint', function() {
  return gulp.src(['routes/**/*.js', 'models/**/*.js', '*.js'])
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'));
});
gulp.task('default', ['start']);
