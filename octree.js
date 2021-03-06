(function () {

  var enums = {
    frustum: {
      LEFT: 0,
      RIGHT: 1,
      T: 2,
      B: 3,
      NEAR: 4,
      FAR: 5
    },
    octree: {
      T_NW: 0,
      T_NE: 1,
      T_SE: 2,
      T_SW: 3,
      B_NW: 4,
      B_NE: 5,
      B_SE: 6,
      B_SW: 7
    }
  };

  var bases = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  var aabbMath = {
    engulf: function (aabb, point) {
      if (aabb[0][0] > point[0]) {
        aabb[0][0] = point[0];
      }
      if (aabb[0][1] > point[1]) {
        aabb[0][1] = point[1];
      }
      if (aabb[0][2] > point[2]) {
        aabb[0][2] = point[2];
      }
      if (aabb[1][0] < point[0]) {
        aabb[1][0] = point[0];
      }
      if (aabb[1][1] < point[1]) {
        aabb[1][1] = point[1];
      }
      if (aabb[1][2] < point[2]) {
        aabb[1][2] = point[2];
      }
    },
    reset: function (aabb, point) {
      if (point === undefined) {
        point = [0,0,0];
      } //if
      aabb[0][0] = point[0];
      aabb[0][1] = point[1];
      aabb[0][2] = point[2];
      aabb[1][0] = point[0];
      aabb[1][1] = point[1];
      aabb[1][2] = point[2];
    },
    size: function (aabb) {
      var x = aabb[0][0] < aabb[1][0] ? aabb[1][0] - aabb[0][0] : aabb[0][0] - aabb[1][0];
      var y = aabb[0][1] < aabb[1][1] ? aabb[1][1] - aabb[0][1] : aabb[0][1] - aabb[1][1];
      var z = aabb[0][2] < aabb[1][2] ? aabb[1][2] - aabb[0][2] : aabb[0][2] - aabb[1][2];
      return [x,y,z];
    },
  
    containsPoint: function ( aabb, point ) {
      return    point[0] <= aabb[1][0] 
            &&  point[1] <= aabb[1][1]
            &&  point[2] <= aabb[1][2]
            &&  point[0] >= aabb[0][0]
            &&  point[1] >= aabb[0][1]
            &&  point[2] >= aabb[0][2];
    },
    overlaps: function ( aabb1, aabb2 ) {
      // thanks flipcode! http://www.flipcode.com/archives/2D_OBB_Intersection.shtml

      for ( var axis=0; axis<3; ++axis ) {
        var t = dot(aabb1[0], bases[axis]);
        var tmin = 1000000000000000000, tmax = -1000000000000000;

        //unrolled
        t = dot([aabb2[0][0], aabb2[0][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[0][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[1][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[1][1], aabb2[0][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[0][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[0][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[0][0], aabb2[1][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;
        t = dot([aabb2[1][0], aabb2[1][1], aabb2[1][2]], bases[axis]);
        tmin = t < tmin ? t : tmin;
        tmax = t > tmax ? t : tmax;

        var origin1 = dot( aabb1[0], bases[axis] ),
            origin2 = dot( aabb1[1], bases[axis] );
        if ( ( tmin > origin2 ) || tmax < origin1 ) {
          return false;
        }
      } //for
      return true;
    },
    intersectsAABB: function ( aabb1, aabb2 ) {
      if ( aabbMath.containsPoint( aabb1, aabb2[0] ) || aabbMath.containsPoint( aabb1, aabb2[1] ) ) {
        return true;
      }
      return aabbMath.overlaps( aabb1, aabb2 ) || aabbMath.overlaps( aabb2, aabb1 );
    }
  };

  var planeMath = {
    classifyPoint: function (plane, pt) {
      var dist = (plane[0] * pt[0]) + (plane[1] * pt[1]) + (plane[2] * pt[2]) + (plane[3]);
      if (dist < 0) {
        return -1;
      }
      else if (dist > 0) {
        return 1;
      }
      return 0;
    },
    normalize: function (plane) {
      var mag = Math.sqrt(plane[0] * plane[0] + plane[1] * plane[1] + plane[2] * plane[2]);
      plane[0] = plane[0] / mag;
      plane[1] = plane[1] / mag;
      plane[2] = plane[2] / mag;
      plane[3] = plane[3] / mag;
    }
  };

  var sphereMath = {
    intersectsSphere: function ( sphere1, sphere2 ) {
          diff = [ sphere2[0] - sphere1[0], sphere2[1] - sphere1[1], sphere2[2] - sphere1[2] ],
          mag = diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2],
          sqrtRad = sphere2[3] + sphere1[3];
          // no need to sqrt here
      return mag <= sqrtRad*sqrtRad;
    },
    intersectsAABB: function ( sphere, aabb ) {
      var min = aabb[0],
          max = aabb[1];
      max = [ max[0] - dims[0], max[1] - dims[1], max[2] - dims[2] ];
      min = [ min[0] - dims[0], min[1] - dims[1], min[2] - dims[2] ];
      max = max[0]*max[0] + max[1]*max[1] + max[2]*max[2];
      min = min[0]*min[0] + min[1]*min[1] + min[2]*min[2];
      var sqr = sphere[3]*sphere[3];
      return max > sqr && min > sqr;
    }
  };

  var Node = function( options ) {
    options = options || {};

    var leaves = [],
        that = this,
        aabb,
        dirty = true,
        position;

    this.type = options.type;
    this.object = options.object; 
    this.rootTree = undefined;

    this.inserted = function( root ) {
      dirty = false;
      if ( options.inserted ) {
        options.inserted( root );
      } //if
    }; //inserted

    Object.defineProperty( this, "aabb", {
      get: function() {
        return aabb;
      },
      set: function( val ) {
        dirty = true;
        aabb = val;
        position = [
          aabb[ 0 ][ 0 ] + ( aabb[ 1 ][ 0 ] - aabb[ 0 ][ 0 ] ) / 2,
          aabb[ 0 ][ 1 ] + ( aabb[ 1 ][ 0 ] - aabb[ 0 ][ 1 ] ) / 2,
          aabb[ 0 ][ 2 ] + ( aabb[ 1 ][ 0 ] - aabb[ 0 ][ 2 ] ) / 2
        ];
      }
    });

    that.aabb = options.aabb || [ [ 0, 0, 0 ], [ 0, 0, 0 ] ];

    var octreeAABB = position.slice();

    this.addLeaf = function( tree ) {
      var idx = leaves.indexOf( tree );
      if ( idx === -1 ) {
        leaves.push( tree );
        var treeAABB = tree.aabb;
        aabbMath.engulf( octreeAABB, treeAABB[0] );
        aabbMath.engulf( octreeAABB, treeAABB[1] );
      } //if
    }; //addLead

    this.removeLeaf = function( tree ) {
      var idx = leaves.indexOf( tree );
      if ( idx > -1 ) {
        leaves.splice( idx, 1 );
      } //if
    }; //addLeaf

    this.destroy = function () {
      leaves = [];
      that.rootTree = undefined;
    }; //destroy

    this.adjust = function() {
      if ( !dirty ) return;

      var aabb = this.aabb,
          taabb = this.rootTree.aabb,
          pMin = aabb[ 0 ], pMax = aabb[ 1 ],
          tMin = taabb[ 0 ], tMax = taabb[ 1 ];

      if (  leaves.length > 0 && 
            ( pMin[ 0 ] < tMin[ 0 ] || pMin[ 1 ] < tMin[ 1 ] || pMin[ 2 ] < tMin[ 2 ] ||
              pMax[ 0 ] > tMax[ 0 ] || pMax[ 1 ] > tMax[ 1 ] || pMax[ 2 ] > tMax[ 2 ] ) ) {

        for ( var i=0, l=leaves.length; i<l; ++i ) {
          leaves[i].remove( that );
        } //for

        leaves = [];

        var oldRootTree = that.rootTree;
        that.rootTree = undefined;

        if ( oldRootTree ) {

          while ( true ) {
            var oldRootAABB = oldRootTree.aabb;
            if ( !aabbMath.containsPoint( aabb[ 0 ], oldRootAABB ) ||
                 !aabbMath.containsPoint( aabb[ 1 ], oldRootAABB ) ) {
              if ( oldRootTree.root !== undefined ) {
                oldRootTree = oldRootTree.root;
              }
              else {
                break;
              } //if
            }
            else {
              break;
            } //if
          } //while
          aabbMath.reset( octreeAABB, position );
          oldRootTree.insert( that );
        } //if
      } //if

    }; //adjust

  }; //Node

  var Octree = window.Octree = function( options ) {

    var Tree = function( options ) {
      options = options || {};
      var dirty = false,
          children = [],
          nodes = [],
          depth = options.depth || 0,
          size = options.size || 0,
          hSize = size/2,
          position = options.position || [ 0, 0, 0 ],
          sphere = position.slice().concat( Math.sqrt( 3 * size / 2 * size / 2 ) ),
          aabb = [ 
            [ position[ 0 ] - hSize, position[ 1 ] - hSize, position[ 2 ] - hSize ], 
            [ position[ 0 ] + hSize, position[ 1 ] + hSize, position[ 2 ] + hSize ], 
          ],
          root = options.root,

          T_NW = 0,
          T_NE = 1,
          T_SE = 2,
          T_SW = 3,
          B_NW = 4,
          B_NE = 5,
          B_SE = 6,
          B_SW = 7

          that = this;

      Object.defineProperty( this, "position", {
        get: function() { return position; }
      });
      Object.defineProperty( this, "aabb", {
        get: function() { return aabb; }
      });
      Object.defineProperty( this, "numChildren", {
        get: function() {
          var num = 0;
          for ( var i=0; i<8; ++i ) {
            num += children[ i ] ? 1 : 0;
          } //for
          return num;
        }
      });
      Object.defineProperty( this, "children", {
        get: function() { return children; }
      });
      Object.defineProperty( this, "size", {
        get: function() { return size; }
      });
      Object.defineProperty( this, "nodes", {
        get: function() { return nodes; }
      });
      Object.defineProperty( this, "root", {
        get: function() { return root; }
      });

      function $insertNode( node, root ) {
        nodes.push( node );
        node.addLeaf( that );
        node.rootTree = root;
        node.inserted( root );
      }; //$insertNode

      this.remove = function( node ) {
        var idx = nodes.indexOf( node );
        if ( idx > -1 ) {
          nodes.splice( idx, 1 );
        }
      }; //remove

      this.insert = function( node ) {
        if ( depth === 0 ) {
          $insertNode( node, that );
          return;
        } //if

        var p = position,
            aabb = node.aabb,
            min = aabb[ 0 ],
            max = aabb[ 1 ],
            tNW = min[ 0 ] < p[ 0 ] && min[ 1 ] < p[ 1 ] && min[ 2 ] < p[ 2 ],
            tNE = max[ 0 ] > p[ 0 ] && min[ 1 ] < p[ 1 ] && min[ 2 ] < p[ 2 ],
            bNW = min[ 0 ] < p[ 0 ] && max[ 1 ] > p[ 1 ] && min[ 2 ] < p[ 2 ],
            bNE = max[ 0 ] > p[ 0 ] && max[ 1 ] > p[ 1 ] && min[ 2 ] < p[ 2 ],
            tSW = min[ 0 ] < p[ 0 ] && min[ 1 ] < p[ 1 ] && max[ 2 ] > p[ 2 ],
            tSE = max[ 0 ] > p[ 0 ] && min[ 1 ] < p[ 1 ] && max[ 2 ] > p[ 2 ],
            bSW = min[ 0 ] < p[ 0 ] && max[ 1 ] > p[ 1 ] && max[ 2 ] > p[ 2 ],
            bSE = max[ 0 ] > p[ 0 ] && max[ 1 ] > p[ 1 ] && max[ 2 ] > p[ 2 ],
            numInserted = 0;

        if ( tNW && tNE && bNW && bNE && tSW && tSE && bSW && bSE ) {
          $insertNode( node, that );
        }
        else {
          var newSize = size/2,
              offset = size/4,
              x = p[ 0 ], y = p[ 1 ], z = p[ 2 ];

          var news = [
            [ tNW, T_NW, [ x - offset, y - offset, z - offset ] ],
            [ tNE, T_NE, [ x + offset, y - offset, z - offset ] ],
            [ bNW, B_NW, [ x - offset, y + offset, z - offset ] ],
            [ bNE, B_NE, [ x + offset, y + offset, z - offset ] ],
            [ tSW, T_SW, [ x - offset, y - offset, z + offset ] ],
            [ tSE, T_SE, [ x + offset, y - offset, z + offset ] ],
            [ bSW, B_SW, [ x - offset, y + offset, z + offset ] ],
            [ bSE, B_SE, [ x + offset, y + offset, z + offset ] ]
          ];

          for ( var i=0; i<8; ++i ) {
            if ( news[ i ][ 0 ] ) {
              if ( !children[ news[ i ][ 1 ] ] ) {
                children[ news[ i ][ 1 ] ] = new Tree({
                  size: newSize,
                  depth: depth - 1,
                  root: that,
                  position: news[ i ][ 2 ]
                });
              }
              children[ news[ i ][ 1 ] ].insert( node );
              ++numInserted;
            } //if
          }

          if ( numInserted > 1 || !node.rootTree ) {
            node.rootTree = that;
          }

        } //if

      }; //insert

      this.clean = function() {
        var importantChildren = 0;
        for ( var i=0; i<8; ++i ) {
          if ( children [ i ] ) {
            var isClean = children[ i ].clean();
            if ( isClean ) {
              children[ i ] = undefined;
            }
            else {
              ++importantChildren;
            }
          }
        } //for
        if ( nodes.length === 0 && importantChildren === 0 ) {
          return true;
        } //if
        return false;
      }; //clean

    }; //Tree

    options = options || {};
    var size = options.size || 0,
        depth = options.depth || 0;

    if ( size <= 0 ) {
      throw new Error( "Octree needs a size > 0" );
    } //if

    if ( depth <= 0 ) {
      throw new Error( "Octree needs a depth > 0" );
    } //if

    var root = new Tree({
      size: size,
      depth: depth,
    });

    this.insert = function( node ) {
      root.insert( node );
    }; //insert

    this.clean = function() {
      root.clean();
    }; //clean

    Object.defineProperty( this, "root", {
      get: function() { return root; }
    });

    Object.defineProperty( this, "size", {
      get: function() { return size; }
    });

  }; //Octree

  Octree.Node = Node;
  Octree.enums = enums;

})();
