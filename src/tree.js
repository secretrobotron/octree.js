define(function(){
  var T_NW = 0, T_NE = 1, T_SE = 2, T_SW = 3,
      B_NW = 4, B_NE = 5, B_SE = 6, B_SW = 7;

  function Tree (options) {

    options = options || {};

    var _dirty = false;

    var _nodes = [];
    var _root = options.root;

    var _position = options.position || [ 0, 0, 0 ];
    var _size = options.size || 0;

    var hSize = _size / 2;

    var _aabb = [ 
      [ _position[ 0 ] - hSize, _position[ 1 ] - hSize, _position[ 2 ] - hSize ], 
      [ _position[ 0 ] + hSize, _position[ 1 ] + hSize, _position[ 2 ] + hSize ], 
    ];

    var _depth = options.depth || 0;
    var _sphere = _position.slice().concat(Math.sqrt( 3 * _size / 2 * _size / 2 ));
    var _children = [];
    var _numChildren = 0;

    var _this = this;

    Object.defineProperties(this, {
      position: { value: _position },
      aabb: { value: _aabb },
      numChildren: {
        get: function(){
          return _numChildren;
        }
      },
      children: { value: _children },
      size: { value: _size },
      nodes: { value: _nodes },
      root: { value: _root }
    });

    function insertNode (node, root) {
      _nodes.push(node);
      node.addLeaf(_this);
      node.rootTree = root;
      node.inserted(root);
    };

    this.remove = function (node) {
      var idx = _nodes.indexOf( node );
      if ( idx > -1 ) {
        _nodes.splice( idx, 1 );
      }
    };

    this.insert = function (node) {
      if (_depth === 0) {
        insertNode(node, _this);
        return;
      }

      var aabb = node.aabb;
      var min = aabb[ 0 ];
      var max = aabb[ 1 ];
      var tNW = min[ 0 ] < _position[ 0 ] && min[ 1 ] < _position[ 1 ] && min[ 2 ] < _position[ 2 ];
      var tNE = max[ 0 ] > _position[ 0 ] && min[ 1 ] < _position[ 1 ] && min[ 2 ] < _position[ 2 ];
      var bNW = min[ 0 ] < _position[ 0 ] && max[ 1 ] > _position[ 1 ] && min[ 2 ] < _position[ 2 ];
      var bNE = max[ 0 ] > _position[ 0 ] && max[ 1 ] > _position[ 1 ] && min[ 2 ] < _position[ 2 ];
      var tSW = min[ 0 ] < _position[ 0 ] && min[ 1 ] < _position[ 1 ] && max[ 2 ] > _position[ 2 ];
      var tSE = max[ 0 ] > _position[ 0 ] && min[ 1 ] < _position[ 1 ] && max[ 2 ] > _position[ 2 ];
      var bSW = min[ 0 ] < _position[ 0 ] && max[ 1 ] > _position[ 1 ] && max[ 2 ] > _position[ 2 ];
      var bSE = max[ 0 ] > _position[ 0 ] && max[ 1 ] > _position[ 1 ] && max[ 2 ] > _position[ 2 ];
      var numInserted = 0;

      if (tNW && tNE && bNW && bNE && tSW && tSE && bSW && bSE) {
        insertNode(node, _this);
      }
      else {
        var newSize = _size/2,
            offset = _size/4,
            x = _position[ 0 ], y = _position[ 1 ], z = _position[ 2 ];

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

        for (var i=0; i<8; ++i) {
          if (news[ i ][ 0 ]) {
            if (!_children[ news[ i ][ 1 ] ]) {
              _children[ news[ i ][ 1 ] ] = new Tree({
                size: newSize,
                depth: _depth - 1,
                root: _this,
                position: news[ i ][ 2 ]
              });
            }
            _children[ news[ i ][ 1 ] ].insert( node );
            ++numInserted;
          }
        }

        if (numInserted > 1 || !node.rootTree) {
          node.rootTree = _this;
        }

        _numChildren += numInserted;
      }

    };

    this.clean = function() {
      var importantChildren = 0;

      for (var i=0; i<8; ++i) {
        if (_children[ i ]) {
          var isClean = _children[ i ].clean();
          if ( isClean ) {
            _children[ i ] = undefined;
          }
          else {
            ++importantChildren;
          }
        }
      }
      
      _numChildren = importantChildren;

      if ( _nodes.length === 0 && importantChildren === 0 ) {
        return true;
      }

      return false;
    };
  }

  return {
    Tree: Tree,
    octants: {
      T_NW: T_NW,
      T_NE: T_NE,
      T_SE: T_SE,
      T_SW: T_SW,
      B_NW: B_NW,
      B_NE: B_NE,
      B_SE: B_SE,
      B_SW: B_SW
    }
  };
});