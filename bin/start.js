'use stritc';

var charp = require('charp');
var path = require('path');
var gulp = require('gulp');
var concat = require('gulp-concat');
var fs = require('fs');
var reload = require('require-reload')(require);
var del = require('del');
var prog = require('commander');
var watch = require('gulp-watch');
var log = require('util').log;

var rootDir = path.join(__dirname, '../');
var srcDir = path.join(__dirname, '../src');
var wwwDir = path.join(__dirname, '../www');
var buildDir = path.join(__dirname, '../build');

var now = function() {
  return new Date().toLocaleString();
};

prog.option('-p, --port <port>', '指定静态服务的端口')
  .parse(process.argv);

//初始化配置
gulp.task('initHarpConfig', function(cb) {
  var harpConfFile = path.join(__dirname, '../src/_harp.json');
  var harpConfSampleFile = path.join(__dirname, '../src/harp_sample.json');
  try {
    fs.statSync(harpConfFile);
    log('_harp.json 找到');
  } catch (e) {
    log('cp harp_sample.json to _harp.json');
    fs.createReadStream(harpConfSampleFile).pipe(fs.createWriteStream(harpConfFile));
  }
  console.log('');
  cb();
});

//清除www
gulp.task('clean', function(cb) {
  log('清除 www/ ...');
  try {
    process.chdir(wwwDir);
  } catch (e) {
    log('未找到www，请创建它...');
    fs.mkdirSync(wwwDir);
    log('创建www');
    process.chdir(wwwDir);
  }
  del.sync(['./*']);
  log('清除完成');
  cb();
});

//复制
gulp.task('copy', function(cb) {
  log('复制src到www ...');
  process.chdir(srcDir);
  var list = [
    '**/*',
    '!.DS_Store',
    '!_*.js',
    '!**/_*.js',
    '!**/_*/*.js',
    '!_*/**/*.js',
    '!_*/**/**/*.js',
    '!_vendor'
  ];

  gulp.src(list)
    .pipe(gulp.dest(wwwDir));
  log('复制完成');
  cb();
});

//压缩js
gulp.task('concatjs', function(cb) {
  log('压缩js ...');
  var jsSrcDir = path.join(srcDir, '/js/');
  var jsWwwDir = path.join(wwwDir, '/js/');

  process.chdir(jsSrcDir);

  var files = fs.readdirSync(jsSrcDir);
  files.forEach(function(f) {
    if (/^_\S+\.js$/i.test(f)) {
      var jses = reload(path.join(jsSrcDir, f));
      var target = f.replace(/^_/, '');
      log(jses);
      console.log(' ===> ' + path.join(jsWwwDir, target));
      console.log('');
      gulp.src(jses)
        .pipe(concat(target))
        .pipe(gulp.dest(jsWwwDir));
    }
  });
  cb();
});

//监听
gulp.task('wacth', function(cb) {
  var globa = path.join(srcDir, '**/*');
  log('监听改变的' + globa + '文件 ...');
  watch([globa, '!.DS_Store'], function(vinyl) {
    var evt = vinyl.event,
      files = vinyl.history;
    if (evt == 'unlink') {
      return;
    }
    log(files, evt);
    var hasJs = false;
    files.some(function(f) {
      if (/\S+.js$/i.test(f)) {
        hasJs = true;
      }
      return hasJs;
    });
    if (hasJs) {
      gulp.start('concatjs');
    } else {
      process.chdir(rootDir);
      files.forEach(function(f) {
        var nf = f.replace(srcDir, '');
        var form = path.join('src/', nf);
        var to = path.join('www/', path.parse(nf).dir);
        log('复制', form, '到', to, ' ...');
        gulp.src(form).pipe(gulp.dest(to));
      });
      console.log('');
    }
  });
  cb();
});

var port = prog.port || 9966;

gulp.task('server', ['clean', 'initHarpConfig', 'copy', 'concatjs', 'wacth'], function() {
  charp.server(wwwDir, {
    pro: port,
    accessControlAllowOrigin: '*'
  }, function() {
    log('charp服务运行成功，端口 *:' + port + ' ...');
    console.log('');
  });
});

gulp.task('preBuild', ['clean', 'initHarpConfig', 'copy', 'concatjs']);

if (!module.parent) {
  gulp.start('server');
}

module.exports.preBuild = function(cb) {
  gulp.start('preBuild', cb);
};