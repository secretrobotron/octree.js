/*global text,expect,ok,module,notEqual,Paladin,test,window,start,stop,console,asyncTest*/
(function () {

  var canvas;

  function drawTree( tree ) {
    var canvas = document.createElement( "canvas" );
        canvas.width = 400;
        canvas.height = 400;
        document.getElementById( "canvas-container" ).appendChild( canvas );

    var ctx = canvas.getContext( "2d" ),
        width = canvas.width,
        height = canvas.height,
        size = tree.size;

    ctx.fillStyle = "#000";
    ctx.fillRect( 0, 0, width, height );
    ctx.save();
    ctx.translate( width / 2, height / 2 );
    ctx.scale( width/size, height/size );

    function draw( tree ) {
      var pos = tree.position,
          size = tree.size,
          hSize = size / 2;

      var children = tree.children;
      for ( var i=0, l=children.length; i<l; ++i ) {
        if ( children[ i ] ) {
          draw( children[ i ] );
        } //if
      } //for

      ctx.strokeStyle = "#fff";
      ctx.beginPath();
      ctx.rect( pos[ 0 ] - hSize, pos[ 2 ] - hSize, size, size ); 
      if ( tree.nodes.length > 0 ) {
        ctx.fillStyle = "rgba( 255, 0, 0, 0.5 )";
        ctx.fill();
      } //if
      ctx.stroke();
    } //draw

    draw( tree );
    ctx.restore();

  } //drawTree

  module( "core", {
    setup: function () {
    },
    teardown: function () {
    }
  });

  test( "Octree Creation", function() {
    expect( 1 );
    var octree = new Octree({ size: 1, depth: 1 });
    ok( octree, "Octree exists" );
  });

  test( "OctreeNode Creation", function() {
    expect( 1 );
    var node = new Octree.Node();
    ok( node, "OctreeNode exists" );
  });

  test( "Inside boundaries", function() {
    expect( 1 );

    var testObj = {
      foo: 'bar'
    };

    var inserted = false;

    var octree = new Octree({
      size: 1000,
      depth: 4
    });

    var node = new Octree.Node({
      object: testObj,
      aabb: [
        [ 5, 5, 5 ],
        [ 10, 10, 10 ]
      ],
      inserted: function( subtree ) {
        inserted = subtree.position;
      }
    });

    octree.insert( node );

    ok( inserted[ 0 ] === inserted[ 1 ] && 
        inserted[ 1 ] === inserted[ 2 ] &&
        inserted[ 2 ] === 31.25, "Node inserted correctly" );

    drawTree( octree.root );

  });

  test( "Across boundaries", function(a) {
    expect( 1 );

    var testObj = {
      foo: 'bar'
    };

    var inserted = [];

    var octree = new Octree({
      size: 1000,
      depth: 4
    });

    var node = new Octree.Node({
      object: testObj,
      aabb: [
        [ -82.5, -62.5, -62.5 ],
        [ -42.5, -42.5, -42.5 ]
      ],
      inserted: function( subtree ) {
        inserted.push( subtree.position );
      }
    });

    octree.insert( node );

    ok( inserted.length === 2 &&
        inserted[ 0 ][ 0 ] === -93.75 && 
        inserted[ 0 ][ 1 ] === -31.25 &&
        inserted[ 0 ][ 2 ] === -31.25 &&
        inserted[ 1 ][ 0 ] === -31.25 &&
        inserted[ 1 ][ 1 ] === -31.25 &&
        inserted[ 1 ][ 2 ] === -31.25,
         "Node inserted correctly" );

    drawTree( octree.root );

  });

  test( "Adjusting AABB", function(a) {
    expect( 3 );

    var testObj = {
      foo: 'bar'
    };

    var inserted = [];

    var octree = new Octree({
      size: 1000,
      depth: 4
    });

    var node = new Octree.Node({
      object: testObj,
      aabb: [
        [ -82.5, -62.5, -62.5 ],
        [ -42.5, -42.5, -42.5 ]
      ],
      inserted: function( subtree ) {
        inserted.push( subtree.position );
      }
    });

    octree.insert( node );

    ok( inserted.length === 2 &&
        inserted[ 0 ][ 0 ] === -93.75 && 
        inserted[ 0 ][ 1 ] === -31.25 &&
        inserted[ 0 ][ 2 ] === -31.25 &&
        inserted[ 1 ][ 0 ] === -31.25 &&
        inserted[ 1 ][ 1 ] === -31.25 &&
        inserted[ 1 ][ 2 ] === -31.25,
         "Node inserted correctly" );

    node.adjust();

    ok( inserted.length === 2 &&
        inserted[ 0 ][ 0 ] === -93.75 && 
        inserted[ 0 ][ 1 ] === -31.25 &&
        inserted[ 0 ][ 2 ] === -31.25 &&
        inserted[ 1 ][ 0 ] === -31.25 &&
        inserted[ 1 ][ 1 ] === -31.25 &&
        inserted[ 1 ][ 2 ] === -31.25,
         "Node re-inserted correctly without moving" );

    inserted = [];

    node.aabb = [
      [ 42.5, 42.5, 42.5 ],
      [ 82.5, 62.5, 62.5 ]
    ];
    node.adjust();

    ok( inserted.length === 2 &&
        inserted[ 1 ][ 0 ] === 93.75 && 
        inserted[ 1 ][ 1 ] === 31.25 &&
        inserted[ 1 ][ 2 ] === 31.25 &&
        inserted[ 0 ][ 0 ] === 31.25 &&
        inserted[ 0 ][ 1 ] === 31.25 &&
        inserted[ 0 ][ 2 ] === 31.25,
         "Node re-inserted correctly after moving" );

    drawTree( octree.root );

  });

  test( "Cleaning", function(a) {
    expect( 2 );

    var testObj = {
      foo: 'bar'
    };

    var octree = new Octree({
      size: 1000,
      depth: 4
    });

    var node = new Octree.Node({
      object: testObj,
      aabb: [
        [ 1, 1, 1 ],
        [ 2, 2, 2 ]
      ],
      inserted: function( subtree ) {
      }
    });

    octree.insert( node );
    node.adjust();
    octree.clean();

    ok( octree.root.numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.B_SE ].numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.B_SE ].children[ Octree.enums.octree.T_NW ].numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.B_SE ].children[ Octree.enums.octree.T_NW ].children[ Octree.enums.octree.T_NW ].numChildren === 1,
         "Node re-inserted correctly without moving" );

    node.aabb = [
      [ -2, -2, -2 ], [ -1, -1, -1 ]
    ];
    node.adjust();
    octree.clean();

    ok( octree.root.numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.T_NW ].numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.T_NW ].children[ Octree.enums.octree.B_SE ].numChildren === 1 &&
        octree.root.children[ Octree.enums.octree.T_NW ].children[ Octree.enums.octree.B_SE ].children[ Octree.enums.octree.B_SE ].numChildren === 1,
         "Node re-inserted correctly without moving" );

    drawTree( octree.root );

  });


})();
