define(['aabb'], function(aabb){

  return {
    Node: function (options) {
      options = options || {};

      var _leaves = [];
      var _aabb;
      var _dirty = true;
      var _position;
      var _this = this;
      var _rootTree;

      this.type = options.type;
      this.object = options.object; 

      this.inserted = function (root) {
        dirty = false;
        if (options.inserted) {
          options.inserted(root);
        }
      };

      Object.defineProperties(this, {
        rootTree: {
          get: function () { return _rootTree },
          set: function (val) { _rootTree = val; }
        },
        aabb: {
          get: function() {
            return _aabb;
          },
          set: function( val ) {
            dirty = true;
            _aabb = val;
            position = [
              _aabb[ 0 ][ 0 ] + ( _aabb[ 1 ][ 0 ] - _aabb[ 0 ][ 0 ] ) / 2,
              _aabb[ 0 ][ 1 ] + ( _aabb[ 1 ][ 0 ] - _aabb[ 0 ][ 1 ] ) / 2,
              _aabb[ 0 ][ 2 ] + ( _aabb[ 1 ][ 0 ] - _aabb[ 0 ][ 2 ] ) / 2
            ];
          }
        }
      });

      _this.aabb = options.aabb || [ [ 0, 0, 0 ], [ 0, 0, 0 ] ];

      var octreeAABB = position.slice();

      this.addLeaf = function (tree) {
        var idx = _leaves.indexOf(tree);
        if (idx === -1) {
          _leaves.push(tree);
          var treeAABB = tree.aabb;
          aabb.engulf( octreeAABB, treeAABB[0] );
          aabb.engulf( octreeAABB, treeAABB[1] );
        }
      };

      this.removeLeaf = function (tree) {
        var idx = _leaves.indexOf(tree);
        if (idx > -1) {
          _leaves.splice(idx, 1);
        }
      };

      this.destroy = function () {
        _leaves = [];
        _rootTree = undefined;
      };

      this.adjust = function() {
        if (!dirty) return;

        var taabb = _rootTree.aabb,
            pMin = _aabb[ 0 ], pMax = _aabb[ 1 ],
            tMin = taabb[ 0 ], tMax = taabb[ 1 ];

        if (  _leaves.length > 0 && 
              ( pMin[ 0 ] < tMin[ 0 ] || pMin[ 1 ] < tMin[ 1 ] || pMin[ 2 ] < tMin[ 2 ] ||
                pMax[ 0 ] > tMax[ 0 ] || pMax[ 1 ] > tMax[ 1 ] || pMax[ 2 ] > tMax[ 2 ] ) ) {

          for (var i = 0, l = _leaves.length; i < l; ++i) {
            _leaves[i].remove(_this);
          }

          _leaves = [];

          var oldRootTree = _rootTree;
          _rootTree = undefined;
          if ( oldRootTree ) {

            while ( true ) {
              var oldRootAABB = oldRootTree.aabb;
              if (!aabb.containsPoint( oldRootAABB, _aabb[ 0 ]) ||
                  !aabb.containsPoint( oldRootAABB, _aabb[ 1 ])) {
                if (oldRootTree.root !== undefined) {
                  oldRootTree = oldRootTree.root;
                }
                else {
                  break;
                }
              }
              else {
                break;
              }
            }
            aabb.reset(octreeAABB, position);
            oldRootTree.insert(_this);
          }
        }

      };

    }
  };
});