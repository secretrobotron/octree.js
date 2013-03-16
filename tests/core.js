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

  octree.ready(function () {
    module("core");

    test('Octree Creation', function () {
      expect(1);
      var t = new octree.Octree({size: 1, depth: 1});
      ok(t, 'Octree exists');
    });

    test('OctreeNode Creation', function () {
      expect(1);
      var node = new octree.Node();
      ok(node, 'OctreeNode exists');
    });

    test('At intersection points', function () {
      expect(4);

      var inserted = [];
      var tree = new octree.Octree({size: 10, depth: 4});
      var node;

      node = new octree.Node({
        position: [0, 0, 0],
        size: [.1, .1, .1],
        inserted: function (subtree) {
          inserted.push(subtree);
        }
      });

      tree.insert(node);

      equal(inserted.length, 1, 'Node attached to a single subtree.');
      equal(inserted[0], tree.root, 'Node inserted at root.');

      inserted = [];

      node = new octree.Node({
        // tree.root.size/4 === bottom-most, south-most, east-most quadrant of root subtree
        position: [tree.root.size/4, tree.root.size/4, tree.root.size/4],
        size: [.1, .1, .1],
        inserted: function (subtree) {
          inserted.push(subtree);
        }
      });

      tree.insert(node);

      equal(inserted.length, 1, 'Node attached to a single subtree.');
      equal(inserted[0], tree.root.children[octree.octants.B_SE], 'Node inserted at root.');

      drawTree(tree.root);
    });

    test('Inside boundaries', function () {
      expect(2);

      var inserted = [];
      var tree = new octree.Octree({size: 10, depth: 3});

      var node = new octree.Node({
        position: [1, 1, 1],
        size: [.01, .01, .01],
        inserted: function (subtree) {
          inserted.push(subtree);
        }
      });

      tree.insert(node);

      equal(inserted.length, 1, 'Node attached to a single subtree.');
      equal(tree.root.children[octree.octants.B_SE]
              .children[octree.octants.T_NW]
              .children[octree.octants.T_NW],
        inserted[0], 'Node nestled in correct subtree.');

      drawTree(tree.root);
    });

    test('Across boundaries', function () {
      expect(3);

      var inserted = [];
      var tree = new octree.Octree({size: 8, depth: 2});

      var node = new octree.Node({
        position: [3, 3.5, 3.5],
        size: [3, .1, .1],
        inserted: function (subtree) {
          inserted.push(subtree);
        }
      });

      tree.insert(node);

      console.log(inserted);

      equal(inserted.length, 2, 'Node attatched to two subtrees.');
      equal(inserted[0], tree.root.children[octree.octants.B_SE].children[octree.octants.B_SE], 'First subtree is correct.');
      equal(inserted[1], tree.root.children[octree.octants.B_SE].children[octree.octants.B_SW], 'Second subtree is correct.');

      drawTree( tree.root );

    });

    test( "Adjusting AABB", function(a) {
      expect( 3 );

      var testObj = {
        foo: 'bar'
      };

      var inserted = [];

      var tree = new octree.Octree({
        size: 1000,
        depth: 4
      });

      var node = new octree.Node({
        object: testObj,
        aabb: [
          [ -82.5, -62.5, -62.5 ],
          [ -42.5, -42.5, -42.5 ]
        ],
        inserted: function (subtree) {
          inserted.push( subtree.position );
        }
      });

      tree.insert(node);

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

      drawTree( tree.root );

    });

    test( "Cleaning", function(a) {
      expect( 2 );

      var testObj = {
        foo: 'bar'
      };

      var tree = new octree.Octree({
        size: 1000,
        depth: 4
      });

      var insertedSubTree;

      var node = new octree.Node({
        object: testObj,
        aabb: [
          [ 1, 1, 1 ],
          [ 2, 2, 2 ]
        ],
        inserted: function (subtree) {
          insertedSubTree = subtree;
        }
      });

      tree.insert(node);
      node.adjust();
      tree.clean();

      ok( tree.root.numChildren === 1 &&
          tree.root.children[ Octree.octants.B_SE ].numChildren === 1 &&
          tree.root.children[ Octree.octants.B_SE ].children[ Octree.octants.T_NW ].numChildren === 1 &&
          tree.root.children[ Octree.octants.B_SE ].children[ Octree.octants.T_NW ].children[ Octree.octants.T_NW ].numChildren === 1,
           "Node cleaned" );

      node.aabb = [
        [ -2, -2, -2 ], [ -1, -1, -1 ]
      ];
      node.adjust();
      tree.clean();

      ok( tree.root.numChildren === 1 &&
          tree.root.children[ Octree.octants.T_NW ].numChildren === 1 &&
          tree.root.children[ Octree.octants.T_NW ].children[ Octree.octants.B_SE ].numChildren === 1 &&
          tree.root.children[ Octree.octants.T_NW ].children[ Octree.octants.B_SE ].children[ Octree.octants.B_SE ].numChildren === 1,
           "Node cleaned" );

      drawTree(tree.root);

    });

  });

})();
