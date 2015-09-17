// generated on 2015-06-27 using generator-gulp-webapp 1.0.2
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import browserify from 'browserify';
import reactify from 'reactify';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';

const webServerPort = 9000;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () =>
{
	return gulp.src(['app/styles/*.scss', 'app/styles/component/*.scss', 'app/styles/vendors/*.css'])
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync
		({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['ie >= 9', 'firefox >= 24', 'chrome >= 33', 'safari >= 5', 'ios_saf 5'] }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({ stream: true }));
});

gulp.task('styles:dist', () =>
{
	return gulp.src(['app/styles/component/*.scss', 'app/styles/vendors/*.css'])
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync
		({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['ie >= 9', 'firefox >= 24', 'chrome >= 33', 'safari >= 5', 'ios_saf 5'] }))
		.pipe($.sourcemaps.write())
		.pipe($.concat("react-timings-picker.css"))
		.pipe(gulp.dest('dist/styles'))
		.pipe($.minifyCss({ compatibility: '*' }))
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/styles'));
});


function lint(files)
{
	return () =>
	{
		return gulp.src(files)
			.pipe(reload({ stream: true, once: true }))
			.pipe($.eslint({ config: 'eslint.config.json' }))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}

gulp.task('lint', lint(['app/scripts/**/*.js', 'app/scripts/**/*.jsx']));

gulp.task('html', ['styles'], () =>
{
	const assets = $.useref.assets({ searchPath: ['.tmp', 'app', '.'] });

	return gulp.src('app/*.html')
		.pipe(assets)
		.pipe($.if('*.js', $.uglify()))
		.pipe($.if('*.css', $.minifyCss({ compatibility: '*' })))
		.pipe(assets.restore())
		.pipe($.useref())
		.pipe($.if('*.html', $.minifyHtml({ conditionals: true, loose: true })))
		.pipe(gulp.dest('.tmp'));
});

gulp.task('images', () =>
{
	return gulp.src('app/images/**/*')
		.pipe($.if($.if.isFile, $.cache($.imagemin({
			progressive: true,
			interlaced: true,
			// don't remove IDs from SVGs, they are often used
			// as hooks for embedding and styling
			svgoPlugins: [{ cleanupIDs: false }]
		})).on('error', function (err)
		{
			console.log(err);
			this.end();
		})))
		.pipe(gulp.dest('dist/images'));
});

gulp.task('fonts', () =>
{
	return gulp.src(require('main-bower-files')({ filter: '**/*.{eot,svg,ttf,woff,woff2}' }).concat('app/fonts/**/*'))
		.pipe(gulp.dest('.tmp/fonts'))
		.pipe(gulp.dest('dist/fonts'));
});

gulp.task('react', () => {
	return browserify("app/scripts/main.jsx", { debug: true })
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('.tmp/scripts'));
});

gulp.task('react:dist', () => {
	return browserify("app/scripts/components/timings-picker.jsx")
		.transform(reactify)
		.transform('browserify-shim')
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('react-timings-picker.js'))
		.pipe(buffer())
		.pipe(gulp.dest('dist/scripts'))
		.pipe($.uglify())
		.pipe($.rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist/scripts'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'fonts', 'react'], () =>
{
	browserSync({
		notify: false,
		port: 9000,
		server: {
			baseDir: ['.tmp', 'app'],
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch
	([
		'app/*.html',
		'app/scripts/**/*.js',
		'app/images/**/*',
		'.tmp/fonts/**/*',
		'app/scripts/**/*.jsx'
	]).on('change', reload);

	gulp.watch('app/styles/**/*.scss', ['styles']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('app/scripts/**/*.jsx', ['react']);
	gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', () =>
{
	browserSync
	({
		notify: false,
		port: webServerPort,
		server: {
			baseDir: ['dist']
		}
	});
});

gulp.task('serve:test', () =>
{
	browserSync
	({
		notify: false,
		port: webServerPort,
		ui: false,
		server: {
			baseDir: 'test',
			routes: {
				'/bower_components': 'bower_components'
			}
		}
	});

	gulp.watch('test/spec/**/*.js').on('change', reload);
	gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', () =>
{
	gulp.src('app/styles/*.scss')
		.pipe(wiredep({ ignorePath: /^(\.\.\/)+/ }))
		.pipe(gulp.dest('app/styles'));

	gulp.src('app/*.html')
		.pipe(wiredep({ ignorePath: /^(\.\.\/)*\.\./ }))
		.pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'styles', 'react'], () =>
{
	return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('build:dist', ['lint', 'html', 'images', 'fonts', 'styles:dist', 'react:dist'], () =>
{
	return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('default', ['clean'], () =>
{
	gulp.start('build');
});