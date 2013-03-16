define('tree,', function () {
  var T_NW = 0, T_NE = 1, T_SE = 2, T_SW = 3,
      B_NW = 4, B_NE = 5, B_SE = 6, B_SW = 7;

  function Tree(options){
    options = options || {};

    this.nodes = [];
    this.root = options.root;
    
    var position = this.position = options.position || [ 0, 0, 0 ];
    this.size = options.size || 0;

    var hSize = _size / 2;

    this.bb = [ 
      [position[0] - hSize, position[1] - hSize, position[2] - hSize], 
      [position[0] + hSize, position[1] + hSize, position[2] + hSize], 
    ];

    this.depth = options.depth || 0;
    this.sphere = position.slice().concat(Math.sqrt(3 * size / 2 * size / 2));
    this.children = [];

    // Shortcut if this is a leaf. Don't need to consult subtrees (there are none).
    if(this.depth === 0){
      this.insert = this.insertNode;
    }
  }

  Tree.prototype.insertNode = function(node){
    // Remember the node in the nodes array.
    this.nodes.push(node);

    // Finalize the insertion process, which, in turn, lets the node notify appropriate observers.
    // Give the node a reference back to this object for later optimization (if it needs to move around).
    // Trivially, the node's closest root is this leaf's root. A reference is passed For similar optimizations as above leaf reference.
    node.linkInsertion(this.root, this);
  };

  Tree.prototype.remove = function(node){
    // If the referenced node is in this tree, find its index in the nodes array...
    var idx = this.nodes.indexOf(node);
    if(idx > -1){
      // ...and remove it.
      this.nodes.splice(idx, 1);
    }
  };

  Tree.prototype.insert = function(node){
    var position = this.position;
    var size = this.size;
    var children = this.children;

    var bb = node.bb;
    
    var min = bb[ 0 ];
    var max = bb[ 1 ];
    
    // For each octant, decide whether or not the node fits inside it.
    var tNW = min[ 0 ] < position[ 0 ] && min[ 1 ] < position[ 1 ] && min[ 2 ] < position[ 2 ];
    var tNE = max[ 0 ] > position[ 0 ] && min[ 1 ] < position[ 1 ] && min[ 2 ] < position[ 2 ];
    var bNW = min[ 0 ] < position[ 0 ] && max[ 1 ] > position[ 1 ] && min[ 2 ] < position[ 2 ];
    var bNE = max[ 0 ] > position[ 0 ] && max[ 1 ] > position[ 1 ] && min[ 2 ] < position[ 2 ];
    var tSW = min[ 0 ] < position[ 0 ] && min[ 1 ] < position[ 1 ] && max[ 2 ] > position[ 2 ];
    var tSE = max[ 0 ] > position[ 0 ] && min[ 1 ] < position[ 1 ] && max[ 2 ] > position[ 2 ];
    var bSW = min[ 0 ] < position[ 0 ] && max[ 1 ] > position[ 1 ] && max[ 2 ] > position[ 2 ];
    var bSE = max[ 0 ] > position[ 0 ] && max[ 1 ] > position[ 1 ] && max[ 2 ] > position[ 2 ];
    
    var numInserted = 0;

    // If the node is in every octant, there's no need to consult child subtrees; just insert it here.
    if (tNW && tNE && bNW && bNE && tSW && tSE && bSW && bSE) {
      this.insertNode(node);
    }
    else {
      var newSize = size / 2;
      var offset = size / 4;
      var x = position[ 0 ], y = position[ 1 ], z = position[ 2 ];

      // Prepare an array in which only the required children have new subtree position data.
      var newChildren = [];
      tNW && newChildren[T_NW] = [x - offset, y - offset, z - offset];
      tNE && newChildren[T_NE] = [x + offset, y - offset, z - offset];
      bNW && newChildren[B_NW] = [x - offset, y + offset, z - offset];
      bNE && newChildren[B_NE] = [x + offset, y + offset, z - offset];
      tSW && newChildren[T_SW] = [x - offset, y - offset, z + offset];
      tSE && newChildren[T_SE] = [x + offset, y - offset, z + offset];
      bSW && newChildren[B_SW] = [x - offset, y + offset, z + offset];
      bSE && newChildren[B_SE] = [x + offset, y + offset, z + offset];

      // Loop over the octant possibilities.
      for(var i = 0; i < 8; ++i){
        // If the octant is present in the newChildren array...
        if(newChildren[i]){
          // ...and that subtree hasn't already been created...
          if (!children[i]) {
            // ...create a new subtree with the calculated parameters.
            children[i] = new Tree({
              size: newSize,
              depth: _depth - 1,
              root: _this,
              position: newChildren[i]
            });
          }
          children[newChildren[i][1]].insert(node);
          ++numInserted;
        }
      }

      if(numInserted > 1 || !node.rootTree){
        node.linkInsertion(this);
      }
    }
  };

  Tree.prototype.clean = function(){
    // In order to properly judge whether or not this subtree is significant, we need to know if any of its children are
    // significant.
    var importantChildren = false;
    var children = this.children;
    var child;

    for(var i = 0; i < 8; ++i){
      child = children[i];

      // If there's actually a child in the selected octant...
      if(child){

        // ...clean it, and see if it can be forgotten.
        if(child.clean()){
          children[i] = null;
        }
        else {
          // Otherwise, remember that significant children were found.
          importantChildren = true;
        }
      }
    }
    
    // If this subtree has no children and no nodes, it can be discarded. 
    if ( this.nodes.length === 0 && importantChildren === false ) {
      return true;
    }

    // Otherwise, it's still needed.
    return false;
  };

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