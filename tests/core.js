/*global text,expect,ok,module,notEqual,Paladin,test,window,start,stop,console,asyncTest*/
(function () {

  module( "core", {
    setup: function () {
    },
    teardown: function () {
    }
  });

  test( "Octree Creation", function() {
    expect( 1 );
    var octree = new Octree();
    ok( octree, "Octree exists" );
  });

  test( "OctreeNode Creation", function() {
    expect( 1 );
    var node = new OctreeNode();
    ok( node, "OctreeNode exists" );
  });

  test( "Static Functionality", function() {
    var testObj = {
      foo: 'bar'
    };

    var octree = new Octree({
      size: 1000,
      depth: 4
    });

    var node = new OctreeNode({
      object: testObj,
      inserted: function( subtree ) {
      }
    });
  });

})();
