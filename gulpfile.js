var $ = require('gulp-load-plugins')();

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	rimraf = require('rimraf'),
	sequence = require('gulp-sequence').use(gulp),
	minifyCss = require('gulp-minify-css'),
	minifyHtml = require('gulp-minify-html'),
	ngfix = require('gulp-ng-annotate'),
	plumber = require('gulp-plumber'),
	templates = require('gulp-ng-html2js')
	;

var paths = {
  lumX_min_JS: [
  'bower_components/jquery/dist/jquery.min.js',
  'bower_components/fastclick/lib/fastclick.js',  
  'bower_components/velocity/velocity.min.js',
  'bower_components/moment/min/moment-with-locales.min.js',
  'bower_components/angular/angular.min.js',
  'bower_components/api-check/dist/api-check.min.js',
  'bower_components/angular-ui-router/release/angular-ui-router.min.js',
  'bower_components/angular-resource/angular-resource.min.js',
  'bower_components/angular-formly/dist/formly.min.js',
  'bower_components/angular-messages/angular-messages.min.js',
  'bower_components/angular-aria/angular-aria.min.js',
  'bower_components/ngstorage/ngStorage.min.js',
  'bower_components/ng-file-upload/ng-file-upload.min.js',
  'bower_components/lumx/dist/lumx.min.js',
  'bower_components/angular-formly-templates-lumx/dist/formlyLumx.js',
  'bower_components/angular-websocket/dist/angular-websocket.min.js',
  ],
  lumX_JS: [
 	'bower_components/jquery/dist/jquery.js',
  'bower_components/fastclick/lib/fastclick.js',	
	'bower_components/velocity/velocity.js',
	'bower_components/moment/min/moment-with-locales.js',
  'bower_components/angular/angular.js',
	'bower_components/api-check/dist/api-check.js',
  'bower_components/angular-ui-router/release/angular-ui-router.js',
  'bower_components/angular-resource/angular-resource.js',
  'bower_components/angular-formly/dist/formly.js',
  'bower_components/angular-messages/angular-messages.js',
  'bower_components/angular-aria/angular-aria.js',
  'bower_components/ngstorage/ngStorage.js',
  'bower_components/ng-file-upload/ng-file-upload.js',
  'bower_components/lumx/dist/lumx.js',
  'bower_components/angular-formly-templates-lumx/dist/formlyLumx.js',
//  'bower_components/ng-ckeditor/libs/ckeditor/ckeditor.js',
  'bower_components/angular-websocket/dist/angular-websocket.js',
  'bower_components/ngWig/dist/ng-wig.js',
  ],
  // These files are for your app's JavaScript
  appJS: [
  	'app/app.js',
    'app/code/**/*.*',
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
	return gulp.src([
      'bower_components/lumx/dist/lumx.css',
      'bower_components/angular-formly-templates-lumx/dist/formlyLumx.css'])
    .pipe($.concat('lumx.css'))
	//	.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./build/css'))
		;
});

gulp.task('lumx:js', function() {
	return gulp.src(paths.lumX_JS)
//      .pipe(ngfix())
      .pipe($.concat('libs.js'))
//	    .pipe($.uglify())
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
	return gulp.src([
      './bower_components/mdi/fonts/**/*',
      './app/fonts/**/*'])
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

gulp.task('ckeditor', function() {
  return gulp.src('bower_components/ng-ckeditor/libs/ckeditor/**/*.*')
    .pipe(gulp.dest('./build/ckeditor'))
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
  return gulp.src([
      'bower_components/lumx/dist/lumx.css',
      'bower_components/angular-formly-templates-lumx/dist/formlyLumx.css'])
		.pipe(minifyCss({compatibility: 'ie8'}))
		.pipe(gulp.dest('./build/css'))
		;
});

gulp.task('dx:lumx:js', function() {
	return gulp.src(paths.lumX_JS)
      .pipe(ngfix())
	    .pipe($.concat('libs.js'))
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

gulp.task('dx:copy:html:index', function() {
  return gulp.src('./app/index.html')
  	.pipe(minifyHtml({
  		empty: true,
  		spare: true,
  		quotes: true
  	}))
    .pipe(gulp.dest('./build'))
  ;
});

gulp.task('dx:copy:html:templates', function() {
  return gulp.src('./app/html/**/*.html')
  	.pipe(minifyHtml({
  		empty: true,
  		spare: true,
  		quotes: true
  	}))
  	.pipe(templates({
  		moduleName: 'templates',
  		prefix: ''
  	}))
  	.pipe($.concat('templates.js'))
  	//.pipe($.uglify())
    .pipe(gulp.dest('./build/js'))
  ;
});

gulp.task('dx:copy:html:min', function() {
  return gulp.src('./app/**/*.html')
  	.pipe(minifyHtml({
  		empty: true,
  		spare: true,
  		quotes: true
  	}))
    .pipe(gulp.dest('./build'))
  ;
});

gulp.task('dx:copy:html', function() {
	sequence('dx:copy:html:templates','dx:copy:html:index')
})

gulp.task('dx:app:js', function() {
	return gulp.src(paths.appJS)
		.pipe(ngfix())
		.pipe($.concat('app.js'))
    .pipe($.uglify())       // Works well with ng-annotate !!
		.pipe(gulp.dest('./build/js'))
		;
});

gulp.task('dist', 
	sequence('clean',['dx:sass','dx:lumx','dx:copy:img','dx:copy:html:min','dx:copy:fonts','dx:app:js'])
);

gulp.task('watch', function () {
  gulp.watch('./app/scss/**/*.scss', ['sass']);
  gulp.watch('./app/scss/app.scss', ['sass']);
  gulp.watch('./app/**/*.html', ['copy:html']);
  gulp.watch(paths.appJS, ['app:js']);
  gulp.watch('./app/img/*', ['copy:img']);
});

gulp.task('distwatch', function () {
  gulp.watch('./app/scss/**/*.scss', ['dx:sass']);
  gulp.watch('./app/scss/app.scss', ['dx:sass']);
  gulp.watch('./app/**/*.html', ['dx:copy:html:min']);
  gulp.watch(paths.appJS, ['dx:app:js']);
  gulp.watch('./app/img/*', ['dx:copy:img']);
});

gulp.task('run', sequence('build','watch'));
gulp.task('distrun', sequence('dist','distwatch'));

gulp.task('default', sequence('distrun'))