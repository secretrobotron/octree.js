define(['aabb'], function (aabb) {

  // Wraps an object to be stored in an Octree.
  function Node (options) {

    // Safely initialize the options object.
    options = options || {};

    // Leaf subtrees with which this node is associated.
    this.leaves = [];

    // Signifies whether or not an update is required.
    this.dirty = false;

    // 3 vector representing the position of this node in space.
    this.position = options.position || [0, 0, 0];

    // 3 vector representing the size of this node.
    this.size = options.size || [0, 0, 0];

    // AABB used to give bounds and position to this node.
    this.bb = options.bb || [[0,0,0], [0,0,0]];

    // Closes root subtree with which this node is associated.
    // For optimizations in moving the node around the tree.
    this.rootTree = null;

    // Callback for when this node has arrived at its destination leaf.
    this._insertedCallback = options.inserted || function(){};

    this.type = options.type;
    this.object = options.object; 

    if (options.position || options.size) {
      if (options.bb) {
        throw "Must supply AABB *or* position & size to construct a Node, not both.";
      }
      this.constructAndSetBB(this.size, this.position);  
    }
    else {
      // Derive position from AABB.
      this.updatePosition();
    }
    
  }

  Node.prototype.constructAndSetBB = function(size, position) {
    var bb = this.bb;

    bb[0][0] = position[0] - size[0] / 2;
    bb[1][0] = position[0] + size[0] / 2;

    bb[0][1] = position[1] - size[1] / 2;
    bb[1][1] = position[1] + size[1] / 2;

    bb[0][2] = position[2] - size[2] / 2;
    bb[1][2] = position[2] + size[2] / 2;

    this.size = size;
    this.position = position;

    this.dirty = true;
  };

  Node.prototype.setSize = function(sizeVector) {
    this.constructAndSetBB(sizeVector, this.position);
    this.size = sizeVector;
  };

  Node.prototype.setPosition = function(positionVector) {
    this.constructAndSetBB(this.size, positionVector);
    this.position = positionVector;
  };

  Node.prototype.updatePosition = function() {
    // Cache this.aabb for fast lookup 
    var bb = this.bb;

    // x = minimum x bound plus half the size of the bb on x axis
    this.position[0] = bb[0][0] + (bb[1][0] - bb[0][0]) / 2;

    // y = minimum y bound plus half the size of the bb on y axis
    this.position[1] = bb[0][1] + (bb[1][0] - bb[0][1]) / 2;

    // z = minimum z bound plus half the size of the bb on z axis
    this.position[2] = bb[0][2] + (bb[1][0] - bb[0][2]) / 2;
  };

  Node.prototype.setBB = function (newBB) {
    // Store new AABB, or fall back to previously stored one. If newBB is undefined,
    // setAABB trivially updates the position vector.
    this.bb = newBB || this.bb;

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

        aabb.engulf(this.position, leaf.bb[0]);
        aabb.engulf(this.position, leaf.bb[1]);
      }
    }

    this.dirty = false;

    // Notify listeners after insertion has occurred.
    this._insertedCallback(rootTree, leaf);
  };

  Node.prototype.removeLeaf = function (tree) {
    var idx = this.leaves.indexOf(tree);
    if (idx > -1) {
      this.leaves.splice(idx, 1);
    }
  };

  Node.prototype.destroy = function () {
    while (this.leaves.length) {
      this.leaves.pop();
    }
    this.leaves = null;
    this.rootTree = null;
  };

  Node.prototype.adjust = function () {
    if (!this.dirty) return;

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
      if (oldRootTree) {

        while (true) {
          var oldRootBB = oldRootTree.aabb;
          if (!aabb.containsPoint(oldRootBB, _aabb[ 0 ]) ||
              !aabb.containsPoint(oldRootBB, _aabb[ 1 ])) {
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

  return {
    Node: Node
  };

});