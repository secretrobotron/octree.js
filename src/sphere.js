define({
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
});