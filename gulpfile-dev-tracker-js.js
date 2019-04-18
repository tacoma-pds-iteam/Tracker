// gulp file converts all js files into single js file into static folder
// MUST HAVE GULP.JS INSTALLED TO WORK

module.exports = function (gulp, plugins) {
    return function () {
  gulp.src('node-apps/node_modules/dev-tracker/client/js/dev/*.js')
    .pipe(plugins.concat('./app.js'))
    .pipe(plugins.babel({
      presets: ['es2015', 'es2017', 'react']
    }))
    // .pipe(uglify().on('error', err => {
    //   util.log(util.colors.red('[Error]'), err.toString());
    // }))
    .pipe(plugins.plumber())
    .pipe(gulp.dest('node-apps/node_modules/dev-tracker/client/static/'));
  }
}
