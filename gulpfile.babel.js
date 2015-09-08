// generated on 2015-06-27 using generator-gulp-webapp 1.0.2
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';
import del from 'del';
import {stream as wiredep} from 'wiredep';
import browserify from 'browserify';
import reactify from 'reactify';
import source from 'vinyl-source-stream';

const webServerPort = 9000;

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () =>
{
	return gulp.src(['app/styles/*.scss', 'app/styles/vendors/*.css'])
		.pipe($.plumber())
		.pipe($.sourcemaps.init())
		.pipe($.sass.sync
		({
			outputStyle: 'expanded',
			precision: 10,
			includePaths: ['.']
		}).on('error', $.sass.logError))
		.pipe($.autoprefixer({ browsers: ['last 1 version'] }))
		.pipe($.sourcemaps.write())
		.pipe(gulp.dest('dist/styles'))
		.pipe(gulp.dest('.tmp/styles'))
		.pipe(reload({ stream: true }));
});

function lint(files, options)
{
	return () =>
	{
		return gulp.src(files)
			.pipe(reload({ stream: true, once: true }))
			.pipe($.eslint(options))
			.pipe($.eslint.format())
			.pipe($.if(!browserSync.active, $.eslint.failAfterError()));
	};
}

const lintOptions =
{
	rules: {
		'eol-last': 0
	}
}

const testLintOptions =
{
	env: {
		jasmine: true
	},
	globals: {
		assert: false,
		expect: false,
		should: false,
		React: false
	}
};

gulp.task('lint', lint('app/scripts/**/*.js', lintOptions));
gulp.task('lint:test', lint('test/spec/**/*.js', testLintOptions));

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
		.pipe(gulp.dest('dist'));
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

gulp.task('extras', () =>
{
	return gulp.src(['app/*.*', '!app/*.html'], { dot: true })
		.pipe(gulp.dest('dist'));
});

gulp.task('react', () => {
	return browserify("app/scripts/main.jsx")
		.transform(reactify)
		.bundle()
		.on('error', console.error.bind(console))
		.pipe(source('bundle.js'))
		.pipe(gulp.dest('dist/scripts'))
		.pipe(gulp.dest('.tmp/scripts'));
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

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras', 'react'], () =>
{
	return gulp.src('dist/**/*').pipe($.size({ title: 'build', gzip: true }));
});

gulp.task('default', ['clean'], () =>
{
	gulp.start('build');
});