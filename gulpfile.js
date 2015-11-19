var $ = require('gulp-load-plugins')();

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	rimraf = require('rimraf'),
	sequence = require('gulp-sequence').use(gulp),
	minifyCss = require('gulp-minify-css'),
	ngfix = require('gulp-ng-annotate'),
	plumber = require('gulp-plumber')
	;

var paths = {
  lumX_JS: [
 	'bower_components/jquery/dist/jquery.js',
    'bower_components/fastclick/lib/fastclick.js',	
	'bower_components/velocity/velocity.js',
	'bower_components/moment/min/moment-with-locales.js',
	'bower_components/angular/angular.js',
	'bower_components/angular-ui-router/release/angular-ui-router.js',
	'bower_components/lumx/dist/lumx.js',
  ],
  // These files are for your app's JavaScript
  appJS: [
  	'app/app.js',
    'app/code/**/*.*'
  ],
  // Include Paths for Sass
  sassPaths: [
  	"bower_components/lumx/dist/scss",
  	"bower_components/mdi/scss",
  	"bower_components/bourbon/app/assets/stylesheets",
  	"bower_components/neat/app/assets/stylesheets",
  	"bower_components/bitters/app/assets/stylesheets",
  ],
}

gulp.task('clean', function(cb){
	rimraf('./build', cb);
});

gulp.task('sass', function () {
  gulp.src('./app/scss/**/*.scss')
  	.pipe(plumber())
    .pipe(sass({includePaths: paths.sassPaths}))
	//.pipe(minifyCss({compatibility: 'ie8'}))    
    .pipe(gulp.dest('./build/css'))
   ;
});

gulp.task('lumx:css', function() {
	return gulp.src('bower_components/lumx/dist/lumx.css')
	//	.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./build/css'))
		;
});

gulp.task('lumx:js', function() {
	return gulp.src(paths.lumX_JS)
	    .pipe($.concat('lumx.js'))
	    //.pipe($.uglify())
	    .pipe(gulp.dest('./build/js/'))
	    ;
});

gulp.task('lumx',  
	sequence(['lumx:js'])
);

gulp.task('copy:img', function() {
	return gulp.src('./app/img/**/*')
		.pipe(gulp.dest('./build/img'))
		;
});

gulp.task('copy:fonts', function() {
	return gulp.src(['./bower_components/mdi/fonts/**/*','./app/fonts/**/*'])
		.pipe(gulp.dest('./build/fonts'))
		;
});

gulp.task('copy:html', function() {
  return gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./build'))
  ;
});

gulp.task('app:js', function() {
	return gulp.src(paths.appJS)
		.pipe($.concat('app.js'))
		.pipe(gulp.dest('./build/js'))
		;
});

gulp.task('build', 
	sequence('clean',['sass','lumx','copy:img','copy:html','copy:fonts','app:js'])
);

gulp.task('dx:sass', function () {
  gulp.src('./app/scss/**/*.scss')
  	.pipe(plumber())
    .pipe(sass({includePaths: paths.sassPaths}))
		.pipe(minifyCss({compatibility: 'ie8'}))    
    .pipe(gulp.dest('./build/css'))
   ;
});

gulp.task('dx:lumx:css', function() {
	return gulp.src('bower_components/lumx/dist/lumx.css')
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./build/css'))
		;
});

gulp.task('dx:lumx:js', function() {
	return gulp.src(paths.lumX_JS)
	    .pipe($.concat('lumx.js'))
	    .pipe($.uglify())
	    .pipe(gulp.dest('./build/js/'))
	    ;
});

gulp.task('dx:lumx',  
	sequence(['dx:lumx:js'])
);

gulp.task('dx:copy:img', function() {
	return gulp.src('./app/img/**/*')
		.pipe(gulp.dest('./build/img'))
		;
});

gulp.task('dx:copy:fonts', function() {
	return gulp.src(['./bower_components/mdi/fonts/**/*','./app/fonts/**/*'])
		.pipe(gulp.dest('./build/fonts'))
		;
});

gulp.task('dx:copy:html', function() {
  return gulp.src('./app/**/*.html')
    .pipe(gulp.dest('./build'))
  ;
});

gulp.task('dx:app:js', function() {
	return gulp.src(paths.appJS)
		.pipe(ngfix())
		.pipe($.concat('app.js'))
    //.pipe($.uglify())
		.pipe(gulp.dest('./build/js'))
		;
});

gulp.task('dist', 
	sequence('clean',['dx:sass','dx:lumx','dx:copy:img','dx:copy:html','dx:copy:fonts','dx:app:js'])
);

gulp.task('watch', function () {
  gulp.watch('./app/scss/**/*.scss', ['sass']);
  gulp.watch('./app/**/*.html', ['copy:html']);
  gulp.watch('./app/app.js', ['app:js']);
  gulp.watch('./app/code/**/*.js', ['app:js']);
  gulp.watch('./app/img/*', ['copy:img']);
});

gulp.task('distwatch', function () {
  gulp.watch('./app/scss/**/*.scss', ['dx:sass']);
  gulp.watch('./app/**/*.html', ['dx:copy:html']);
  gulp.watch('./app/app.js', ['dx:app:js']);
  gulp.watch('./app/code/**/*.js', ['dx:app:js']);
  gulp.watch('./app/img/*', ['dx:copy:img']);
});

gulp.task('run', sequence('build','watch'));
gulp.task('distrun', sequence('dist','distwatch'));