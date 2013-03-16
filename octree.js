(function (global, require) {
  var initCallbacks = [];

  window.octree = {
    ready: function (callback) {
      initCallbacks.push(callback);
    }
  };

  require.config({
    context: 'octree',
    baseUrl: '/src'
  })(['octree'], function(octree) {
    while(initCallbacks.length){
      initCallbacks.pop()();
    }
  });
})(window, window.require);
