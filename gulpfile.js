var $ = require('gulp-load-plugins')();

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	rimraf = require('rimraf'),
	sequence = require('gulp-sequence').use(gulp)
	;

var paths = {
  lumX_JS: [
 	'bower_components/jquery/dist/jquery.js',
	'bower_components/velocity/velocity.js',
	'bower_components/moment/min/moment-with-locales.js',
	'bower_components/angular/angular.js',
	'bower_components/lumx/dist/lumx.js',
  ],
  // These files are for your app's JavaScript
  appJS: [
    'app/js/**/*.*'
  ]
}

gulp.task('clean', function(cb){
	rimraf('./build', cb);
});

gulp.task('sass', function () {
  gulp.src('./app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'))
   ;
});

gulp.task('lumx:css', function() {
	return gulp.src('bower_components/lumx/dist/lumx.css')
		.pipe(gulp.dest('./build/css'))
		;
});

gulp.task('lumx:js', function() {
	return gulp.src(paths.lumX_JS)
	    .pipe($.concat('lumx.js'))
	    .pipe(gulp.dest('./build/js/'))
	    ;
});

gulp.task('lumx',  
	sequence(['lumx:css','lumx:js'])
);

gulp.task('copy:img', function() {
	return gulp.src('./app/img/**/*')
		.pipe(gulp.dest('./build/img'))
		;
});

gulp.task('copy:html', function() {
  return gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./build'))
  ;
});

gulp.task('copy:js', function() {
	return gulp.src('./app/**/*.js')
		.pipe(gulp.dest('./build'))
		;
});

gulp.task('build', 
	sequence('clean',['sass','copy:lumx','copy:img','copy:html','copy:js'])
);

gulp.task('watch', function () {
  gulp.watch('./app/scss/**/*.scss', ['sass']);
  gulp.watch('./app/**/*.html', ['copy:html']);
  gulp.watch('./app/**/*.js', ['copy:js']);
  gulp.watch('./app/img/*', ['copy:img']);
});