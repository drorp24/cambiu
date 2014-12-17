// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: 'www/js',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    files: ['www/js/**/*.js', 'spec/**/*.js']
  });
};
