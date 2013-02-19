define(['node', 'tree'], function(node, tree){
  var Octree = window.Octree = function (options) {

    options = options || {};

    var _size = options.size || 0;
    var _depth = options.depth || 0;

    if (_size <= 0) {
      throw new Error("Octree needs a size > 0");
    }

    if (_depth <= 0) {
      throw new Error("Octree needs a depth > 0");
    }

    var _root = new tree.Tree({
      size: _size,
      depth: _depth,
    });

    this.insert = function (node) {
      _root.insert(node);
    };

    this.clean = function () {
      _root.clean();
    };

    Object.defineProperties(this, {
      root: {
        enumerable: true,
        value: _root
      },
      size: {
        enumerable: true,
        value: _size
      }
    });
  };

  Octree.Node = node.Node;
  Octree.octants = tree.octants;
});