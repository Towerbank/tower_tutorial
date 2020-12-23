'use strict';

var gulp = require('gulp');
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var nunjucks = require('gulp-nunjucks');
var sass = require('gulp-sass');
var webp = require('gulp-webp');
var clone = require('gulp-clone');
var browsersync = require('browser-sync');
var svgSprite = require('gulp-svg-sprite');
var svgmin = require('gulp-svgmin');
var cheerio = require('gulp-cheerio');
var replace = require('gulp-replace');
var del = require('del');
var reload = browsersync.reload;
var imgClone = clone.sink();
var imageminMozjpeg = require('imagemin-mozjpeg');
var imageminOptipng = require('imagemin-optipng');
//последние две возможно не нужны

var path = {
    src: {
        html: 'src/*.html',
        styles: 'src/styles/*.scss',
        img: 'src/img/**/*.{jpg,jpeg,png}',
        svg: "src/img/**/*.svg"
    },
    build: {
        html: 'build/',
        styles: 'build/css/',
        img: 'build/img/',
        svg: "build/img/"
    },
    watch: {
        html: 'src/**/*.html',
        styles: 'src/styles/**/*.scss',
        img: 'src/img/**/*.{jpg,jpeg,png}',
        svg: "src/img/**/*.svg"
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
        imageminMozjpeg({quality: 75, progressive: true}),
        imageminOptipng({optimizationLevel: 5})
    ]))

    .pipe(imgClone)
    .pipe(webp())
    .pipe(imgClone.tap())
    
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({stream: true}));
};

function svg() {
    return gulp
    .src(path.src.svg)
    .pipe(svgmin({
        js2svg: {
            pretty: true
        }
    }))  
    .pipe(cheerio({
        run: function($) {
 $('[fill]').removeAttr('fill');
$('[stroke]').removeAttr('stroke');
$('[style]').removeAttr('style');
        },
    parserOptions: { xmlMode: true }
}))
    .pipe(replace('&gt;', '>'))
    .pipe(svgSprite({
        mode: {
            symbol: {
              dest: '.',
              example: true,
              sprite: 'main.svg'
            },
          }
        }))

  .pipe(gulp.dest(path.build.svg))
  .pipe(reload({stream: true}));
}

function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.styles], styles);
    gulp.watch([path.watch.img], img);
    gulp.watch([path.watch.svg], svg);
};

gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('img', img);
gulp.task('svg', svg);

gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, img, svg)));
gulp.task('watch', gulp.parallel(watchFiles, browserSync));