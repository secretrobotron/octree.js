define(function () {
  var bases = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];

  function dot(a, b) {
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
  }

  return {
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
      }
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

    containsPoint: function (aabb, point) {
      return    point[0] <= aabb[1][0] 
            &&  point[1] <= aabb[1][1]
            &&  point[2] <= aabb[1][2]
            &&  point[0] >= aabb[0][0]
            &&  point[1] >= aabb[0][1]
            &&  point[2] >= aabb[0][2];
    },

    overlaps: function (aabb1, aabb2) {
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

    intersectsAABB: function (aabb1, aabb2) {
      if (aabbMath.containsPoint(aabb1, aabb2[0]) || aabbMath.containsPoint(aabb1, aabb2[1])) {
        return true;
      }
      return aabbMath.overlaps(aabb1, aabb2) || aabbMath.overlaps(aabb2, aabb1);
    }
  };
});