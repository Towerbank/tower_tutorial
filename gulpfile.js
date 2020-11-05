'use strict';

var gulp = require('gulp');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var nunjucks = require('gulp-nunjucks');
var sass = require('gulp-sass');
var browsersync = require('browser-sync');
var del = require('del');
var reload = browsersync.reload;
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminOptipng = require('imagemin-optipng');

var path = {
    src: {
        html: 'src/*.html',
        styles: 'src/styles/*.scss',
        img: 'src/img/**/*.{jpg,jpeg,png}'
    },
    build: {
        html: 'build/',
        styles: 'build/css/',
        img: 'build/img/'
    },
    watch: {
        html: 'src/**/*.html',
        styles: 'src/styles/**/*.scss',
        img: 'src/img/**/*.{jpg,jpeg,png}'
    },
    base: './build'
};

function browserSync(done) {
    browsersync.init ({
        server: {
            baseDir: path.base
        },
        port: 3000
    });
    done();
};

function clean() {
    return del(path.base);
};

function html() {
    return gulp
    .src(path.src.html)
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({stream: true}));
};

function styles() {
    return gulp
    .src(path.src.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.build.styles))
    .pipe(reload({stream: true}));
};

function img() {
    return gulp
    .src(path.src.img)
    .pipe(changed(path.build.img))
    .pipe(imagemin([
        imageminMozjpeg({quality: 80, progressive: true}),
        imageminOptipng({optimizationLevel: 5})
    ]))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
};

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.styles], styles);
    gulp.watch([path.watch.img], img);
};

gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('img', img);

gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, img)));
gulp.task('watch', gulp.parallel(watchFiles, browserSync));