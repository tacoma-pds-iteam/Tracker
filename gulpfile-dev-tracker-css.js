// gulp file compiles all scss files in client folder to single css file
// into client/static folder
// MUST HAVE GULP.JS INSTALLED TO WORK

module.exports = function (gulp, plugins) {
    return function () {
  gulp.src('node-apps/node_modules/dev-tracker/client/scss/*.scss')
    .pipe(plugins.compass({
      sass: 'node-apps/node_modules/dev-tracker/client/scss',
      css: 'node-apps/node_modules/dev-tracker/client/css'
    }))
    .pipe(plugins.autoprefixer({
      browsers: ['last 5 versions', 'ie >= 11', '> 5%'],
      cascade: false,
      grid: true
    }))
    .pipe(plugins.plumber())
    // .pipe(plugins.cleanCSS())
    .pipe(gulp.dest('./node-apps/node_modules/dev-tracker/client/static'));
  }
}
