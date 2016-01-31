/* globals require, process */

'use strict';

var gulp = require('gulp'),
    Server = require('karma').Server,
    gutil = require('gulp-util');

gulp.task('test', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});
