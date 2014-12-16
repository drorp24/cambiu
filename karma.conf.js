// karma.conf.js
module.exports = function(config) {
  config.set({
    basePath: 'www/js',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS']
  });
};
