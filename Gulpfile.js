var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

gulp.task('build', function() {
    gulp.src('./build/index.html', { hmr: false, cache: false, watch: true})
        .pipe(parcel({outDir: 'dist', publicUrl'./' }, {source: 'build'}))
        .pipe(gulp.dest('dist'));
});

gulp.task('styles', function() {
      gulp.src('sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('./css/'))
        .pipe(reload({stream:true}));
});

// reload server
gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: "./"
        }
    });
});

// Reload all Browsers
gulp.task('bs-reload', function () {
    browserSync.reload();
});

//Watch task
gulp.task('watch',function() {
    gulp.watch('sass/**/*.scss',['styles']);
    gulp.watch("*.html", ['bs-reload']);
});

// deploys
gulp.task('default',  ['styles','browser-sync','watch']);
