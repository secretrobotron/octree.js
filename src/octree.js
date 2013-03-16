define(['node', 'tree'], function (node, tree) {
  function Octree (options) {
    // Safely initialize the options object.
    options = options || {};

    // Initialize size and depth.
    var _size = Number(options.size);
    var _depth = Number(options.depth);

    // We need a real size value.
    if (isNaN(_size) || _size <= 0) {
      throw "Octree needs a size > 0";
    }

    // We need a real depth value.
    if (isNaN(_depth) || _depth <= 0) {
      throw "Octree needs a depth > 0";
    }

    // Create a root subtree for this Octree with the given size and depth.
    this.root = new tree.Tree({
      size: _size,
      depth: _depth,
    });
  }

  Octree.prototype.insert = function (node) {
    // Push a Node into the tree, starting at the root.
    this.root.insert(node);
  };

  Octree.prototype.clean = function () {
    // Clean subtrees starting from the root.
    this.root.clean();
  };

  window.octree = {
    Octree: Octree,
    octants: tree.octants,
    Node: node.Node
  };

  return window.octree;
});