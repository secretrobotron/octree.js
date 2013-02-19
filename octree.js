(function (global, require) {
  var initCallback;

  window.Octree = {
    init: function (callback) {
      initCallback = callback;
    }
  };

  require.config({
    context: 'octree',
    baseUrl: '/src'
  })(['octree'], function() {
    if(initCallback){
      initCallback();
    }
  });
})(window, window.require);
