var glob = require('glob')
var fs = require('fs')
var gulp = require('gulp')
var del = require('del')
var minimist = require('minimist')
var jspm = require('jspm')
var pConfig = require('./package.json')
var replace = require('gulp-replace')

var imports = {
  exec: require('child_process').exec,
  karma: require('karma').server,
  webServer: require('gulp-webserver')
}

var config = {
  appProtocol: 'http',
  appHostname: 'localhost',
  appPort: 9000,
  proxyProtocol: 'http',
  proxyHostname: 'localhost',
  proxyPort: 8080,
  depBundles: './build',
  nonStandardBundles: {
    'angular2/angular2': 'angular2',
    'rtts_assert/rtts_assert': 'rtts_assert'
  },
  noBundle: ['css', 'text'],
  /**
   *  WARNING! These directories are deleted by the 'reset-workspace' task.
   *   Do not add any directory that is present after a fresh 'clone' operation.
   */
  transientDirectories: [
    './node_modules',
    './jspm_packages',
    './build',
    './dist'
  ]
}
config.appHost = config.appProtocol + '://' + config.appHostname + ':' + config.appPort
config.proxyHost = config.proxyProtocol + '://' + config.proxyHostname + ':' + config.proxyPort


var minimistCliOpts = {
  boolean: ['open'],
  alias: {
    'open': ['o']
  },
  default: {
    open: false,
    env: process.env.NODE_ENV || 'production'
  }
};
config.args = minimist(process.argv.slice(2), minimistCliOpts)

gulp.task('bundleDist', ['unbundle'], function (done) {

  var bundleSfx = function () {
    var sfxPath = config.depBundles + '/core-web.sfx.js'
    console.info("Bundling self-executing build to " + sfxPath)

    jspm.bundleSFX('./index',
        sfxPath,
        {
          inject: false,
          minify: true,
          sourceMaps: false
        }).then(done)
  };

  var bundleDev = function () {
    var devPath = config.depBundles + '/core-web.js'
    console.info("Bundling unminified build to " + devPath)
    jspm.bundle('./index',
        devPath,
        {
          inject: false,
          minify: false,
          sourceMaps: true
        }).then(bundleSfx)
  }
  var minifiedPath = config.depBundles + '/core-web.min.js'
  console.info("Bundling minified build to " + minifiedPath)
  jspm.bundle('./index',
      minifiedPath,
      {
        inject: false,
        minify: true,
        sourceMaps: false
      }).then(bundleDev)

})


gulp.task('bundleDeps', ['unbundle'], function (done) {
  var deps = pConfig.jspm.dependencies || {}
  var promises = []
  for (var nm in deps) {
    if (config.noBundle.indexOf(nm) < 0) {
      promises.push(jspm.bundle(nm,
          config.depBundles +
          '/' +
          nm +
          '.bundle.js',
          {
            inject: true,
            minify: true,
            sourceMaps: false
          }))
    }
  }
  deps = config.nonStandardBundles || {}
  for (nm in deps) {
    promises.push(jspm.bundle(nm,
        config.depBundles +
        '/' +
        deps[nm] +
        '.bundle.js',
        {
          inject: true,
          minify: true,
          sourceMaps: false
        }))
  }
  Promise.all(promises).then(function (results) {
    done()
  })
})

gulp.task('unbundle', ['default'], function (done) {
  imports.exec('jspm unbundle', function (error, stdout, stderr) {
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.warn(stderr)
    }
    done();
  })
})

gulp.task('karma', [], function (done) {
  imports.karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    usePolling: false
  }, done);
})

gulp.task('i-test', function (done) {

  imports.karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    usePolling: false,
    proxies: {
      '/api': config.proxyHost + '/api'
    },
    jspm: {
      useBundles: true,
      loadFiles: ['src/**/*.it.es6'],
      serveFiles: ['src/**/*.ts', 'src/*/{*.es6,!(it|spec)/**/*.es6}',
        'build/**/*.js',
        'thirdparty/**/*.{es6,ts}']
    }
  }, done)


})

gulp.task('start-server', function (done) {

  var http = require('http');
  var proxy = require('proxy-middleware');
  var connect = require('connect');
  var serveStatic = require('serve-static');
  var serveIndex = require('serve-index');
  var open = require('open');
  var url = require('url');

  var proxyBasePaths = [
    'admin',
    'html',
    'api',
    'c',
    'dwr',
    'DotAjaxDirector'
  ]

  var app = connect();

  // proxy API requests to the node server
  proxyBasePaths.forEach(function (pathSegment) {
    var target = config.proxyHost + '/' + pathSegment;
    var proxyOptions = url.parse(target)
    proxyOptions.route = '/' + pathSegment
    proxyOptions.preserveHost = true
    app.use(function (req, res, next) {
      if (req.url.indexOf('/' + pathSegment + '/') === 0) {
        console.log("Forwarding request: ", req.url)
        proxy(proxyOptions)(req, res, next)
      } else {
        next()
      }
    })
  })
  app.use(serveStatic('./'))
  app.use(serveIndex('./'))

  http.createServer(app)
      .listen(config.appPort)
      .on('listening', function () {
        console.log('Started connect web server on ' + config.appHost)
        if (config.args.open) {
          open(config.appHost)
        }
        else {
          console.log("add the '-o' flag to automatically open the default browser")
        }
      })

  done()
})
gulp.task('copyBootstrap', function(){
  return gulp.src(['./jspm_packages/github/twbs/**/fonts/*']).pipe(gulp.dest('./dist/jspm_packages/github/twbs/'))
})
gulp.task('copyMain', function(){
  return gulp.src(['./*.html', 'index.js']).pipe(replace("./dist/core-web.sfx.js", './core-web.sfx.js')).pipe(gulp.dest('./dist/'))
})
gulp.task('copyAll', ['bundleDist', 'copyMain', 'copyBootstrap'], function () {
  return gulp.src(['./build/*.js', './build/*.map']).pipe(replace("./dist/core-web.sfx.js", './core-web.sfx.js')).pipe(gulp.dest('./dist/'))
})


/**
 *  Deploy Tasks
 */
gulp.task('packageRelease', ['copyAll'], function (done) {
  var outDir = __dirname + '/dist'
  var outPath = outDir + '/core-web.zip'
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  var output = fs.createWriteStream(outPath)
  var archiver = require('archiver')
  var archive = archiver.create('zip', {})

  output.on('close', function () {
    console.log("Archive Created: " + outPath + ". Size: " + archive.pointer() / 1000000 + 'MB')
    done()
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.append(fs.createReadStream('./dist/core-web.min.js'), {name: 'core-web.min.js'})
      .append(fs.createReadStream('./dist/core-web.js'), {name: 'core-web.js'})
      .append(fs.createReadStream('./dist/core-web.js.map'), {name: 'core-web.js.map'})
      .append(fs.createReadStream('./dist/index.html'), {name: 'index.html'})
      .finalize()

});

gulp.task('publishSnapshot', ['packageRelease'], function (done) {
  /* warning: Untested! Waiting on naming discussion - and artifactory credentials. */
  var getRev = require('git-rev')
  var config = require('./deploy-config.js').artifactory.snapshot
  var version = require('./package.json').version
  var artifactoryUpload = require('gulp-artifactory-upload');

  getRev.short(function (rev) {
    var dateStr = new Date().toISOString().replace(/T.+/, '').replace(/-/g, '')
    var versionStr = dateStr + 'R' + rev + '-SNAPSHOT';
    var deployName = 'core-web-' + versionStr + ".zip"
    config.url = config.url + '/com/dotcms/core-web/' + versionStr

    console.log("Deploying artifact: PUT ", config.url + '/' + deployName)
    console.log("Name: ", deployName)
    console.log("Date: ", dateStr)
    console.log("Rev: ", rev)
    console.log("Version: ", versionStr)

    return gulp.src('./dist/core-web.zip')
        .pipe(artifactoryUpload({
          url: config.url,
          username: config.username,
          password: config.password,
          rename: function (filename) {
            return deployName
          }
        }))
        .on('error', function(err){throw err})
  })
});

gulp.task('ghPages-clone', ['packageRelease'], function(done){
  var exec = require('child_process').exec;

  var options = {
    cwd: __dirname,
    timeout: 60000
  }
  if (fs.existsSync(__dirname + '/gh_pages')) {
    del.sync('./gh_pages')
  }
  exec('git clone -b gh-pages git@github.com:dotCMS/core-web.git gh_pages', options, function (err, stdout, stderr) {
    console.log(stdout);
    if (err) {
      console.log(stderr);
      throw err;
    }
    del.sync(['./gh_pages/*.js', './gh_pages/*.map', './gh_pages/*.html', './gh_pages/*.zip'])
    gulp.src('./dist/**/*').pipe(gulp.dest('./gh_pages')).on('finish', function(){
      done()
    })
  })


})

gulp.task('publishGithubPages', ['ghPages-clone'], function (done) {
  var exec = require('child_process').exec;

  var options = {
    cwd: __dirname + '/gh_pages',
    timeout: 60000
  }

  var gitAdd = function(opts){
    console.log('adding files to git.')
    exec('git add .', opts, function (err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        console.log(stderr);
        done(err);
      } else {
        gitCommit(opts)
      }

    })
  }

  var gitCommit = function(opts){
    exec('git commit -m "Autobuild gh-pages..."', opts, function (err, stdout, stderr) {
      console.log(stdout);
      if (err) {
        console.log(stderr);
        done(err);
      } else {
        gitPush(opts)
      }
    })
  }

  var gitPush = function(opts){
    exec('git push -u  origin gh-pages', opts, function (err, stdout, stderr) {
      if (err) {
        console.log(stderr);
        done(err);
      } else {
        done()
      }
    })
  }
  gitAdd(options)
})

//noinspection JSUnusedLocalSymbols
gulp.task('play', ['start-server'], function (done) {
  // if 'done' is not passed in this task will not block.
})


gulp.task('clean', ['unbundle'], function (done) {
  del.sync(['./dist', './build', './gh_pages'])
  done()
})

gulp.task('reset-workspace', function (done) {
  del(config.transientDirectories, done)
})

gulp.task('default', function (done) {
  done()
});
