define({
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
});