define('node', ['aabb'], function (aabb) {

  // Wraps an object to be stored in an Octree.
  function Node (options) {

    // Safely initialize the options object.
    options = options || {};

    // Leaf subtrees with which this node is associated.
    this.leaves = [];

    // Signifies whether or not an update is required.
    this.dirty = false;

    // 3 vector denoting the position of this node in space.
    this.position = [0, 0, 0];

    // Closes root subtree with which this node is associated.
    // For optimizations in moving the node around the tree.
    this.rootTree = null;

    // Callback for when this node has arrived at its destination leaf.
    this._insertedCallback = options.inserted || function(){};

    this.type = options.type;
    this.object = options.object; 

    // AABB used to give bounds and position to this node.
    this.aabb = options.aabb || [[0,0,0], [0,0,0]];

    // Derive position from AABB immediately.
    this.updatePosition();
  }

  Node.prototype.updatePosition = function() {
    // Cache this.aabb for fast lookup 
    var bb = this.aabb;

    // x = minimum x bound plus half the size of the bb on x axis
    this.position[0] = bb[0][0] + (bb[1][0] - bb[0][0]) / 2;

    // y = minimum y bound plus half the size of the bb on y axis
    this.position[1] = bb[0][1] + (bb[1][0] - bb[0][1]) / 2;

    // z = minimum z bound plus half the size of the bb on z axis
    this.position[2] = bb[0][2] + (bb[1][0] - bb[0][2]) / 2;
  };

  Node.prototype.setAABB = function (newAABB) {
    // Store new AABB, or fall back to previously stored one. If newAABB is undefined,
    // setAABB trivially updates the position vector.
    this.aabb = newAABB || this.aabb;

    // Going to need updating...
    this.dirty = true;

    // Make sure the position vector matches the new BB.
    updatePosition();
  };

  Node.prototype.linkInsertion = function (rootTree, leaf) {
    // A subtree needs to be associated with this node at the end of insertion so that `adjust`
    // can run efficiently.

    // Potential index of leaf in `leaves` reference array.
    var leafIdx;

    // Store a reference to the subtree.
    this.rootTree = rootTree;

    // If a leaf subtree was provided, store it for further `adjust` optimization.
    if (leaf) {

      // See if this node already has a reference to the leaf.
      leafIdx = this.leaves.indexOf(leaf);

      // If the leave isn't already stored...
      if (leafIdx === -1) {

        // Store a reference to the leaf.
        this.leaves.push(leaf);

        aabb.engulf(this.position, leaf.aabb[0]);
        aabb.engulf(this.position, leaf.aabb[1]);
      }
    }

    // Notify listeners after insertion has occurred.
    this._insertedCallback(rootTree, leaf);
  };

  Node.prototype.removeLeaf = function (tree) {
    var idx = this.leaves.indexOf(tree);
    if (idx > -1) {
      this.leaves.splice(idx, 1);
    }
  };

  Node.prototype.destroy = function(){
    this.leaves = [];
    this.rootTree = null;
  };

  Node.prototype.adjust = function(){
    if (!dirty) return;

    var rootTree = this.rootTree;

    var taabb = rootTree.aabb,
        pMin = _aabb[ 0 ], pMax = _aabb[ 1 ],
        tMin = taabb[ 0 ], tMax = taabb[ 1 ];

    if (  _leaves.length > 0 && 
          ( pMin[ 0 ] < tMin[ 0 ] || pMin[ 1 ] < tMin[ 1 ] || pMin[ 2 ] < tMin[ 2 ] ||
            pMax[ 0 ] > tMax[ 0 ] || pMax[ 1 ] > tMax[ 1 ] || pMax[ 2 ] > tMax[ 2 ] ) ) {

      for (var i = 0, l = _leaves.length; i < l; ++i) {
        _leaves[i].remove(_this);
      }

      _leaves = [];

      var oldRootTree = rootTree;
      rootTree = this.rootTree = undefined;
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
        aabb.reset(this.position, position);
        oldRootTree.insert(_this);
      }
    }

    this.dirty = false;
  };

});