// jshint ignore: start

/*
 * Copyright (c) 2012 Brandon Jones, Colin MacKenzie IV
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not
 *    be misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

// Modification to plain glMatrix
//	- Always use Array for MatrixType
//	- Remove export management
//	- Remove vec2, mat2, mat3, vec4
//	- Comments some not needed functions
//	- Add mat4.project and mat4.rotateVec3

// Tweak to your liking
var FLOAT_EPSILON = 0.000001;

/**
 * @class System-specific optimal array type
 * @name MatrixArray
 */
var MatrixArray = Array;

/**
 * @class 3 Dimensional Vector
 * @name vec3
 */
var vec3 = {};

/**
 * Creates a new instance of a vec3 using the default array type
 * Any javascript array-like objects containing at least 3 numeric elements can serve as a vec3
 *
 * @param {vec3} [vec] vec3 containing values to initialize with
 *
 * @returns {vec3} New vec3
 */
vec3.create = function (vec) {
  var dest = new MatrixArray(3);

  if (vec) {
    dest[0] = vec[0];
    dest[1] = vec[1];
    dest[2] = vec[2];
  } else {
    dest[0] = dest[1] = dest[2] = 0;
  }

  return dest;
};

/**
 * Creates a new instance of a vec3, initializing it with the given arguments
 *
 * @param {number} x X value
 * @param {number} y Y value
 * @param {number} z Z value

 * @returns {vec3} New vec3
 */
vec3.createFrom = function (x, y, z) {
  var dest = new MatrixArray(3);

  dest[0] = x;
  dest[1] = y;
  dest[2] = z;

  return dest;
};

/**
 * Copies the values of one vec3 to another
 *
 * @param {vec3} vec vec3 containing values to copy
 * @param {vec3} dest vec3 receiving copied values
 *
 * @returns {vec3} dest
 */
vec3.set = function (vec, dest) {
  dest[0] = vec[0];
  dest[1] = vec[1];
  dest[2] = vec[2];

  return dest;
};

/**
 * Compares two vectors for equality within a certain margin of error
 *
 * @param {vec3} a First vector
 * @param {vec3} b Second vector
 *
 * @returns {Boolean} true if a is equivalent to b
 */
vec3.equal = function (a, b) {
  return (
    a === b ||
    (Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
      Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
      Math.abs(a[2] - b[2]) < FLOAT_EPSILON)
  );
};

/**
 * Performs a vector addition
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.add = function (vec, vec2, dest) {
  if (!dest || vec === dest) {
    vec[0] += vec2[0];
    vec[1] += vec2[1];
    vec[2] += vec2[2];
    return vec;
  }

  dest[0] = vec[0] + vec2[0];
  dest[1] = vec[1] + vec2[1];
  dest[2] = vec[2] + vec2[2];
  return dest;
};

/**
 * Performs a vector subtraction
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.subtract = function (vec, vec2, dest) {
  if (!dest || vec === dest) {
    vec[0] -= vec2[0];
    vec[1] -= vec2[1];
    vec[2] -= vec2[2];
    return vec;
  }

  dest[0] = vec[0] - vec2[0];
  dest[1] = vec[1] - vec2[1];
  dest[2] = vec[2] - vec2[2];
  return dest;
};

/**
 * Performs a vector multiplication
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.multiply = function (vec, vec2, dest) {
  if (!dest || vec === dest) {
    vec[0] *= vec2[0];
    vec[1] *= vec2[1];
    vec[2] *= vec2[2];
    return vec;
  }

  dest[0] = vec[0] * vec2[0];
  dest[1] = vec[1] * vec2[1];
  dest[2] = vec[2] * vec2[2];
  return dest;
};

/**
 * Negates the components of a vec3
 *
 * @param {vec3} vec vec3 to negate
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.negate = function (vec, dest) {
  if (!dest) {
    dest = vec;
  }

  dest[0] = -vec[0];
  dest[1] = -vec[1];
  dest[2] = -vec[2];
  return dest;
};

/**
 * Multiplies the components of a vec3 by a scalar value
 *
 * @param {vec3} vec vec3 to scale
 * @param {number} val Value to scale by
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.scale = function (vec, val, dest) {
  if (!dest || vec === dest) {
    vec[0] *= val;
    vec[1] *= val;
    vec[2] *= val;
    return vec;
  }

  dest[0] = vec[0] * val;
  dest[1] = vec[1] * val;
  dest[2] = vec[2] * val;
  return dest;
};

/**
 * Generates a unit vector of the same direction as the provided vec3
 * If vector length is 0, returns [0, 0, 0]
 *
 * @param {vec3} vec vec3 to normalize
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.normalize = function (vec, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2],
    len = Math.sqrt(x * x + y * y + z * z);

  if (!len) {
    dest[0] = 0;
    dest[1] = 0;
    dest[2] = 0;
    return dest;
  } else if (len === 1) {
    dest[0] = x;
    dest[1] = y;
    dest[2] = z;
    return dest;
  }

  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  return dest;
};

/**
 * Generates the cross product of two vec3s
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.cross = function (vec, vec2, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2],
    x2 = vec2[0],
    y2 = vec2[1],
    z2 = vec2[2];

  dest[0] = y * z2 - z * y2;
  dest[1] = z * x2 - x * z2;
  dest[2] = x * y2 - y * x2;
  return dest;
};

/**
 * Caclulates the length of a vec3
 *
 * @param {vec3} vec vec3 to calculate length of
 *
 * @returns {number} Length of vec
 */
vec3.length = function (vec) {
  var x = vec[0],
    y = vec[1],
    z = vec[2];
  return Math.sqrt(x * x + y * y + z * z);
};

/**
 * Caclulates the squared length of a vec3
 *
 * @param {vec3} vec vec3 to calculate squared length of
 *
 * @returns {number} Squared Length of vec
 */
vec3.squaredLength = function (vec) {
  var x = vec[0],
    y = vec[1],
    z = vec[2];
  return x * x + y * y + z * z;
};

/**
 * Caclulates the dot product of two vec3s
 *
 * @param {vec3} vec First operand
 * @param {vec3} vec2 Second operand
 *
 * @returns {number} Dot product of vec and vec2
 */
vec3.dot = function (vec, vec2) {
  return vec[0] * vec2[0] + vec[1] * vec2[1] + vec[2] * vec2[2];
};

/**
 * Generates a unit vector pointing from one vector to another
 *
 * @param {vec3} vec Origin vec3
 * @param {vec3} vec2 vec3 to point to
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
/*   vec3.direction = function (vec, vec2, dest) {
 if (!dest) { dest = vec; }

 var x = vec[0] - vec2[0],
 y = vec[1] - vec2[1],
 z = vec[2] - vec2[2],
 len = Math.sqrt(x * x + y * y + z * z);

 if (!len) {
 dest[0] = 0;
 dest[1] = 0;
 dest[2] = 0;
 return dest;
 }

 len = 1 / len;
 dest[0] = x * len;
 dest[1] = y * len;
 dest[2] = z * len;
 return dest;
 };*/

/**
 * Performs a linear interpolation between two vec3
 *
 * @param {vec3} vec First vector
 * @param {vec3} vec2 Second vector
 * @param {number} t Interpolation amount between the two inputs
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
vec3.lerp = function (vec, vec2, t, dest) {
  if (!dest) {
    dest = vec;
  }

  const oneMinusT = 1 - t;

  dest[0] = oneMinusT * vec[0] + t * vec2[0];
  dest[1] = oneMinusT * vec[1] + t * vec2[1];
  dest[2] = oneMinusT * vec[2] + t * vec2[2];

  return dest;
};

/**
 * Calculates the euclidian distance between two vec3
 *
 * Params:
 * @param {vec3} vec First vector
 * @param {vec3} vec2 Second vector
 *
 * @returns {number} Distance between vec and vec2
 */
vec3.dist = function (vec, vec2) {
  var x = vec2[0] - vec[0],
    y = vec2[1] - vec[1],
    z = vec2[2] - vec[2];

  return Math.sqrt(x * x + y * y + z * z);
};

/** Vector cross product.
 @param v1 vector
 @param v2 another vector
 @return number vector cross product between this vector and {@code v}
 */
vec3.angle = function (v1, v2) {
  return Math.atan2(vec3.length(vec3.cross(v1, v2)), vec3.dot(v1, v2));
};

// Pre-allocated to prevent unecessary garbage collection
//var unprojectMat = null;
//var unprojectVec = new MatrixArray(4);
/**
 * Projects the specified vec3 from screen space into object space
 * Based on the <a href="http://webcvs.freedesktop.org/mesa/Mesa/src/glu/mesa/project.c?revision=1.4&view=markup">Mesa gluUnProject implementation</a>
 *
 * @param {vec3} vec Screen-space vector to project
 * @param {mat4} view View matrix
 * @param {mat4} proj Projection matrix
 * @param {vec4} viewport Viewport as given to gl.viewport [x, y, width, height]
 * @param {vec3} [dest] vec3 receiving unprojected result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
/*   vec3.unproject = function (vec, view, proj, viewport, dest) {
 if (!dest) { dest = vec; }

 if(!unprojectMat) {
 unprojectMat = mat4.create();
 }

 var m = unprojectMat;
 var v = unprojectVec;

 v[0] = (vec[0] - viewport[0]) * 2.0 / viewport[2] - 1.0;
 v[1] = (vec[1] - viewport[1]) * 2.0 / viewport[3] - 1.0;
 v[2] = 2.0 * vec[2] - 1.0;
 v[3] = 1.0;

 mat4.multiply(proj, view, m);
 if(!mat4.inverse(m)) { return null; }

 mat4.multiplyVec4(m, v);
 if(v[3] === 0.0) { return null; }

 dest[0] = v[0] / v[3];
 dest[1] = v[1] / v[3];
 dest[2] = v[2] / v[3];

 return dest;
 };*/

/*    var xUnitVec3 = vec3.createFrom(1,0,0);
 var yUnitVec3 = vec3.createFrom(0,1,0);
 var zUnitVec3 = vec3.createFrom(0,0,1);

 var tmpvec3 = vec3.create();*/
/**
 * Generates a quaternion of rotation between two given normalized vectors
 *
 * @param {vec3} a Normalized source vector
 * @param {vec3} b Normalized target vector
 * @param {quat4} [dest] quat4 receiving operation result.
 *
 * @returns {quat4} dest if specified, a new quat4 otherwise
 */
/*    vec3.rotationTo = function (a, b, dest) {
 if (!dest) { dest = quat4.create(); }

 var d = vec3.dot(a, b);
 var axis = tmpvec3;
 if (d >= 1.0) {
 quat4.set(identityQuat4, dest);
 } else if (d < (0.000001 - 1.0)) {
 vec3.cross(xUnitVec3, a, axis);
 if (vec3.length(axis) < 0.000001)
 vec3.cross(yUnitVec3, a, axis);
 if (vec3.length(axis) < 0.000001)
 vec3.cross(zUnitVec3, a, axis);
 vec3.normalize(axis);
 quat4.fromAngleAxis(Math.PI, axis, dest);
 } else {
 var s = Math.sqrt((1.0 + d) * 2.0);
 var sInv = 1.0 / s;
 vec3.cross(a, b, axis);
 dest[0] = axis[0] * sInv;
 dest[1] = axis[1] * sInv;
 dest[2] = axis[2] * sInv;
 dest[3] = s * 0.5;
 quat4.normalize(dest);
 }
 if (dest[3] > 1.0) dest[3] = 1.0;
 else if (dest[3] < -1.0) dest[3] = -1.0;
 return dest;
 };*/

/**
 * Returns a string representation of a vector
 *
 * @param {vec3} vec Vector to represent as a string
 *
 * @returns {string} String representation of vec
 */
vec3.str = function (vec) {
  return "[" + vec[0] + ", " + vec[1] + ", " + vec[2] + "]";
};

// Vec3 lib used for Astro Math lib

vec3.createZPhi = function (z, phi) {
  var sth = Math.sqrt((1.0 - z) * (1.0 + z));
  var x = sth * Math.cos(phi);
  var y = sth * Math.sin(phi);
  return vec3.createFrom(x, y, z);
};

vec3.createPhiTheta = function (phi, theta) {
  var sth = Math.sin(theta);
  var x = sth * Math.cos(phi);
  var y = sth * Math.sin(phi);
  var z = sth * Math.cos(theta);
  return vec3.createFrom(x, y, z);
};

vec3.add2 = function (vec, vec2) {
  var x1 = vec[0];
  var y1 = vec[1];
  var z1 = vec[2];
  var x2 = vec2[0];
  var y2 = vec2[1];
  var z2 = vec2[2];

  return [x1 + x2, y1 + y2, z1 + z2];
};

vec3.subtract2 = function (vec, vec2) {
  var x1 = vec[0];
  var y1 = vec[1];
  var z1 = vec[2];
  var x2 = vec2[0];
  var y2 = vec2[1];
  var z2 = vec2[2];

  return [x1 - x2, y1 - y2, z1 - z2];
};

vec3.flip = function (vec) {
  var x = vec[0];
  var y = vec[1];
  var z = vec[2];

  return [(x = -x), (y = -y), (z = -z)];
};

vec3.scale2 = function (vec, val) {
  var x = vec.x;
  var y = vec.y;
  var z = vec.z;

  return {
    x: x * val,
    y: (y *= val),
    z: (z *= val)
  };
};

vec3.normalize2 = function (vec) {
  var x = vec[0];
  var y = vec[1];
  var z = vec[2];
  var d = 1.0 / Math.sqrt(x * x + y * y + z * z);

  return [(x *= d), (y *= d), (z *= d)];
};

vec3.cross2 = function (vec, vec2) {
  return {
    x: vec[1] * vec2[2] - vec2[1] * vec[2],
    y: vec[2] * vec2[0] - vec2[2] * vec[0],
    z: vec[0] * vec2[1] - vec2[0] * vec[1]
  };
};

vec3.length2 = function (vec) {
  var x = vec.x,
    y = vec.y,
    z = vec.z;
  return Math.sqrt(x * x + y * y + z * z);
};

vec3.dot2 = function (vec, vec2) {
  var x1 = vec.x !== undefined ? vec.x : vec[0];
  var y1 = vec.y !== undefined ? vec.y : vec[1];
  var z1 = vec.z !== undefined ? vec.z : vec[2];
  var x2 = vec2.x !== undefined ? vec2.x : vec2[0];
  var y2 = vec2.y !== undefined ? vec2.y : vec2[1];
  var z2 = vec2.z !== undefined ? vec2.z : vec2[2];

  return x1 * x2 + y1 * y2 + z1 * z2;
};

vec3.angle2 = function (v1, v2) {
  return Math.atan2(vec3.length2(vec3.cross2(v1, v2)), vec3.dot2(v1, v2));
};
//

/**
 * @class 3x3 Matrix
 * @name mat3
 */
var mat3 = {};

/**
 * Creates a new isntance of mat3
 *
 * @param {mat3} [mat] mat3 containing values to initialize with
 *
 * @returns {mat3} a new 3x3 matrix
 */
mat3.create = function (mat) {
  var dest = new MatrixArray(9);

  if (mat) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
  }

  return dest;
};

/**
 * @class 4x4 Matrix
 * @name mat4
 */
var mat4 = {};

/**
 * Creates a new instance of a mat4 using the default array type
 * Any javascript array-like object containing at least 16 numeric elements can serve as a mat4
 *
 * @param {mat4} [mat] mat4 containing values to initialize with
 *
 * @returns {mat4} New mat4
 */
mat4.create = function (mat) {
  var dest = new MatrixArray(16);

  if (mat) {
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  }

  return dest;
};

/**
 * Creates a new instance of a mat4, initializing it with the given arguments
 *
 * @param {number} m00
 * @param {number} m01
 * @param {number} m02
 * @param {number} m03
 * @param {number} m10
 * @param {number} m11
 * @param {number} m12
 * @param {number} m13
 * @param {number} m20
 * @param {number} m21
 * @param {number} m22
 * @param {number} m23
 * @param {number} m30
 * @param {number} m31
 * @param {number} m32
 * @param {number} m33

 * @returns {mat4} New mat4
 */
/*   mat4.createFrom = function (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) {
 var dest = new MatrixArray(16);

 dest[0] = m00;
 dest[1] = m01;
 dest[2] = m02;
 dest[3] = m03;
 dest[4] = m10;
 dest[5] = m11;
 dest[6] = m12;
 dest[7] = m13;
 dest[8] = m20;
 dest[9] = m21;
 dest[10] = m22;
 dest[11] = m23;
 dest[12] = m30;
 dest[13] = m31;
 dest[14] = m32;
 dest[15] = m33;

 return dest;
 };*/

/**
 * Copies the values of one mat4 to another
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat4} dest mat4 receiving copied values
 *
 * @returns {mat4} dest
 */
mat4.set = function (mat, dest) {
  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
};

/**
 * Compares two matrices for equality within a certain margin of error
 *
 * @param {mat4} a First matrix
 * @param {mat4} b Second matrix
 *
 * @returns {Boolean} true if a is equivalent to b
 */
mat4.equal = function (a, b) {
  return (
    a === b ||
    (Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
      Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
      Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
      Math.abs(a[3] - b[3]) < FLOAT_EPSILON &&
      Math.abs(a[4] - b[4]) < FLOAT_EPSILON &&
      Math.abs(a[5] - b[5]) < FLOAT_EPSILON &&
      Math.abs(a[6] - b[6]) < FLOAT_EPSILON &&
      Math.abs(a[7] - b[7]) < FLOAT_EPSILON &&
      Math.abs(a[8] - b[8]) < FLOAT_EPSILON &&
      Math.abs(a[9] - b[9]) < FLOAT_EPSILON &&
      Math.abs(a[10] - b[10]) < FLOAT_EPSILON &&
      Math.abs(a[11] - b[11]) < FLOAT_EPSILON &&
      Math.abs(a[12] - b[12]) < FLOAT_EPSILON &&
      Math.abs(a[13] - b[13]) < FLOAT_EPSILON &&
      Math.abs(a[14] - b[14]) < FLOAT_EPSILON &&
      Math.abs(a[15] - b[15]) < FLOAT_EPSILON)
  );
};

/**
 * Sets a mat4 to an identity matrix
 *
 * @param {mat4} dest mat4 to set
 *
 * @returns {mat4} dest
 */
mat4.identity = function (dest) {
  if (!dest) {
    dest = mat4.create();
  }
  dest[0] = 1;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 1;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = 1;
  dest[11] = 0;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;
  return dest;
};

/**
 * Transposes a mat4 (flips the values over the diagonal)
 *
 * @param {mat4} mat mat4 to transpose
 * @param {mat4} [dest] mat4 receiving transposed values. If not specified result is written to mat
 *
 * @param {mat4} dest is specified, mat otherwise
 */
mat4.transpose = function (mat, dest) {
  // If we are transposing ourselves we can skip a few steps but have to cache some values
  if (!dest || mat === dest) {
    var a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a12 = mat[6],
      a13 = mat[7],
      a23 = mat[11];

    mat[1] = mat[4];
    mat[2] = mat[8];
    mat[3] = mat[12];
    mat[4] = a01;
    mat[6] = mat[9];
    mat[7] = mat[13];
    mat[8] = a02;
    mat[9] = a12;
    mat[11] = mat[14];
    mat[12] = a03;
    mat[13] = a13;
    mat[14] = a23;
    return mat;
  }

  dest[0] = mat[0];
  dest[1] = mat[4];
  dest[2] = mat[8];
  dest[3] = mat[12];
  dest[4] = mat[1];
  dest[5] = mat[5];
  dest[6] = mat[9];
  dest[7] = mat[13];
  dest[8] = mat[2];
  dest[9] = mat[6];
  dest[10] = mat[10];
  dest[11] = mat[14];
  dest[12] = mat[3];
  dest[13] = mat[7];
  dest[14] = mat[11];
  dest[15] = mat[15];
  return dest;
};

/**
 * Calculates the determinant of a mat4
 *
 * @param {mat4} mat mat4 to calculate determinant of
 *
 * @returns {number} determinant of mat
 */
mat4.determinant = function (mat) {
  // Cache the matrix values (makes for huge speed increases!)
  var a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3],
    a10 = mat[4],
    a11 = mat[5],
    a12 = mat[6],
    a13 = mat[7],
    a20 = mat[8],
    a21 = mat[9],
    a22 = mat[10],
    a23 = mat[11],
    a30 = mat[12],
    a31 = mat[13],
    a32 = mat[14],
    a33 = mat[15];

  return (
    a30 * a21 * a12 * a03 -
    a20 * a31 * a12 * a03 -
    a30 * a11 * a22 * a03 +
    a10 * a31 * a22 * a03 +
    a20 * a11 * a32 * a03 -
    a10 * a21 * a32 * a03 -
    a30 * a21 * a02 * a13 +
    a20 * a31 * a02 * a13 +
    a30 * a01 * a22 * a13 -
    a00 * a31 * a22 * a13 -
    a20 * a01 * a32 * a13 +
    a00 * a21 * a32 * a13 +
    a30 * a11 * a02 * a23 -
    a10 * a31 * a02 * a23 -
    a30 * a01 * a12 * a23 +
    a00 * a31 * a12 * a23 +
    a10 * a01 * a32 * a23 -
    a00 * a11 * a32 * a23 -
    a20 * a11 * a02 * a33 +
    a10 * a21 * a02 * a33 +
    a20 * a01 * a12 * a33 -
    a00 * a21 * a12 * a33 -
    a10 * a01 * a22 * a33 +
    a00 * a11 * a22 * a33
  );
};

/**
 * Calculates the inverse matrix of a mat4
 *
 * @param {mat4} mat mat4 to calculate inverse of
 * @param {mat4} [dest] mat4 receiving inverse matrix. If not specified result is written to mat
 *
 * @param {mat4} dest is specified, mat otherwise, null if matrix cannot be inverted
 */
mat4.inverse = function (mat, dest) {
  if (!dest) {
    dest = mat;
  }

  // Cache the matrix values (makes for huge speed increases!)
  var a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3],
    a10 = mat[4],
    a11 = mat[5],
    a12 = mat[6],
    a13 = mat[7],
    a20 = mat[8],
    a21 = mat[9],
    a22 = mat[10],
    a23 = mat[11],
    a30 = mat[12],
    a31 = mat[13],
    a32 = mat[14],
    a33 = mat[15],
    b00 = a00 * a11 - a01 * a10,
    b01 = a00 * a12 - a02 * a10,
    b02 = a00 * a13 - a03 * a10,
    b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11,
    b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30,
    b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30,
    b09 = a21 * a32 - a22 * a31,
    b10 = a21 * a33 - a23 * a31,
    b11 = a22 * a33 - a23 * a32,
    d = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06,
    invDet;

  // Calculate the determinant
  if (!d) {
    return null;
  }
  invDet = 1 / d;

  dest[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  dest[1] = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
  dest[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  dest[3] = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
  dest[4] = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
  dest[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  dest[6] = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
  dest[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  dest[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  dest[9] = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
  dest[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  dest[11] = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
  dest[12] = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
  dest[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  dest[14] = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
  dest[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

  return dest;
};

/**
 * Copies the upper 3x3 elements of a mat4 into another mat4
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat4} [dest] mat4 receiving copied values
 *
 * @returns {mat4} dest is specified, a new mat4 otherwise
 */
mat4.toRotationMat = function (mat, dest) {
  if (!dest) {
    dest = mat4.create();
  }

  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[3];
  dest[4] = mat[4];
  dest[5] = mat[5];
  dest[6] = mat[6];
  dest[7] = mat[7];
  dest[8] = mat[8];
  dest[9] = mat[9];
  dest[10] = mat[10];
  dest[11] = mat[11];
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;

  return dest;
};

/**
 * Copies the upper 3x3 elements of a mat4 into a mat3
 *
 * @param {mat4} mat mat4 containing values to copy
 * @param {mat3} [dest] mat3 receiving copied values
 *
 * @returns {mat3} dest is specified, a new mat3 otherwise
 */
mat4.toMat3 = function (mat, dest) {
  if (!dest) {
    dest = mat3.create();
  }

  dest[0] = mat[0];
  dest[1] = mat[1];
  dest[2] = mat[2];
  dest[3] = mat[4];
  dest[4] = mat[5];
  dest[5] = mat[6];
  dest[6] = mat[8];
  dest[7] = mat[9];
  dest[8] = mat[10];

  return dest;
};

/**
 * Calculates the inverse of the upper 3x3 elements of a mat4 and copies the result into a mat3
 * The resulting matrix is useful for calculating transformed normals
 *
 * Params:
 * @param {mat4} mat mat4 containing values to invert and copy
 * @param {mat3} [dest] mat3 receiving values
 *
 * @returns {mat3} dest is specified, a new mat3 otherwise, null if the matrix cannot be inverted
 */
/*   mat4.toInverseMat3 = function (mat, dest) {
 // Cache the matrix values (makes for huge speed increases!)
 var a00 = mat[0], a01 = mat[1], a02 = mat[2],
 a10 = mat[4], a11 = mat[5], a12 = mat[6],
 a20 = mat[8], a21 = mat[9], a22 = mat[10],

 b01 = a22 * a11 - a12 * a21,
 b11 = -a22 * a10 + a12 * a20,
 b21 = a21 * a10 - a11 * a20,

 d = a00 * b01 + a01 * b11 + a02 * b21,
 id;

 if (!d) { return null; }
 id = 1 / d;

 if (!dest) { dest = mat3.create(); }

 dest[0] = b01 * id;
 dest[1] = (-a22 * a01 + a02 * a21) * id;
 dest[2] = (a12 * a01 - a02 * a11) * id;
 dest[3] = b11 * id;
 dest[4] = (a22 * a00 - a02 * a20) * id;
 dest[5] = (-a12 * a00 + a02 * a10) * id;
 dest[6] = b21 * id;
 dest[7] = (-a21 * a00 + a01 * a20) * id;
 dest[8] = (a11 * a00 - a01 * a10) * id;

 return dest;
 };*/

/**
 * Performs a matrix multiplication
 *
 * @param {mat4} mat First operand
 * @param {mat4} mat2 Second operand
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.multiply = function (mat, mat2, dest) {
  if (!dest) {
    dest = mat;
  }

  // Cache the matrix values (makes for huge speed increases!)
  var a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3];
  var a10 = mat[4],
    a11 = mat[5],
    a12 = mat[6],
    a13 = mat[7];
  var a20 = mat[8],
    a21 = mat[9],
    a22 = mat[10],
    a23 = mat[11];
  var a30 = mat[12],
    a31 = mat[13],
    a32 = mat[14],
    a33 = mat[15];

  // Cache only the current line of the second matrix
  var b0 = mat2[0],
    b1 = mat2[1],
    b2 = mat2[2],
    b3 = mat2[3];
  dest[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dest[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dest[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dest[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = mat2[4];
  b1 = mat2[5];
  b2 = mat2[6];
  b3 = mat2[7];
  dest[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dest[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dest[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dest[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = mat2[8];
  b1 = mat2[9];
  b2 = mat2[10];
  b3 = mat2[11];
  dest[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dest[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dest[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dest[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  b0 = mat2[12];
  b1 = mat2[13];
  b2 = mat2[14];
  b3 = mat2[15];
  dest[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
  dest[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
  dest[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
  dest[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

  return dest;
};

/**
 * Transforms a vec3 with the given matrix
 * 4th vector component is implicitly '1'
 *
 * @param {mat4} mat mat4 to transform the vector with
 * @param {vec3} vec vec3 to transform
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec3} dest if specified, vec otherwise
 */
mat4.multiplyVec3 = function (mat, vec, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2];

  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];

  return dest;
};

/**
 * Transforms a vec4 with the given matrix
 *
 * @param {mat4} mat mat4 to transform the vector with
 * @param {vec4} vec vec4 to transform
 * @param {vec4} [dest] vec4 receiving operation result. If not specified result is written to vec
 *
 * @returns {vec4} dest if specified, vec otherwise
 */
mat4.multiplyVec4 = function (mat, vec, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2],
    w = vec[3];

  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12] * w;
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13] * w;
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14] * w;
  dest[3] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15] * w;

  return dest;
};

/**
 Project a vec3
 */
mat4.project = function (mat, vec, dest) {
  if (!dest) {
    dest = vec;
  }
  mat4.multiplyVec4(mat, vec, dest);
  var iw = 1.0 / dest[3];
  dest[0] *= iw;
  dest[1] *= iw;
  dest[2] *= iw;
  return dest;
};

/**
 * mat4.rotateVec3
 * Rotate a vec3 with the given matrix
 *
 * Params:
 * mat - mat4 to transform the vector with
 * vec - vec3 to transform
 * dest - Optional, vec3 receiving operation result. If not specified result is written to vec
 *
 * Returns:
 * dest if specified, vec otherwise
 */
mat4.rotateVec3 = function (mat, vec, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2];

  dest[0] = mat[0] * x + mat[4] * y + mat[8] * z;
  dest[1] = mat[1] * x + mat[5] * y + mat[9] * z;
  dest[2] = mat[2] * x + mat[6] * y + mat[10] * z;

  return dest;
};

/**
 * Translates a matrix by the given vector
 *
 * @param {mat4} mat mat4 to translate
 * @param {vec3} vec vec3 specifying the translation
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.translate = function (mat, vec, dest) {
  var x = vec[0],
    y = vec[1],
    z = vec[2],
    a00,
    a01,
    a02,
    a03,
    a10,
    a11,
    a12,
    a13,
    a20,
    a21,
    a22,
    a23;

  if (!dest || mat === dest) {
    mat[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12];
    mat[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13];
    mat[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14];
    mat[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15];
    return mat;
  }

  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];

  dest[0] = a00;
  dest[1] = a01;
  dest[2] = a02;
  dest[3] = a03;
  dest[4] = a10;
  dest[5] = a11;
  dest[6] = a12;
  dest[7] = a13;
  dest[8] = a20;
  dest[9] = a21;
  dest[10] = a22;
  dest[11] = a23;

  dest[12] = a00 * x + a10 * y + a20 * z + mat[12];
  dest[13] = a01 * x + a11 * y + a21 * z + mat[13];
  dest[14] = a02 * x + a12 * y + a22 * z + mat[14];
  dest[15] = a03 * x + a13 * y + a23 * z + mat[15];
  return dest;
};

/**
 * Scales a matrix by the given vector
 *
 * @param {mat4} mat mat4 to scale
 * @param {vec3} vec vec3 specifying the scale for each axis
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @param {mat4} dest if specified, mat otherwise
 */
mat4.scale = function (mat, vec, dest) {
  var x = vec[0],
    y = vec[1],
    z = vec[2];

  if (!dest || mat === dest) {
    mat[0] *= x;
    mat[1] *= x;
    mat[2] *= x;
    mat[3] *= x;
    mat[4] *= y;
    mat[5] *= y;
    mat[6] *= y;
    mat[7] *= y;
    mat[8] *= z;
    mat[9] *= z;
    mat[10] *= z;
    mat[11] *= z;
    return mat;
  }

  dest[0] = mat[0] * x;
  dest[1] = mat[1] * x;
  dest[2] = mat[2] * x;
  dest[3] = mat[3] * x;
  dest[4] = mat[4] * y;
  dest[5] = mat[5] * y;
  dest[6] = mat[6] * y;
  dest[7] = mat[7] * y;
  dest[8] = mat[8] * z;
  dest[9] = mat[9] * z;
  dest[10] = mat[10] * z;
  dest[11] = mat[11] * z;
  dest[12] = mat[12];
  dest[13] = mat[13];
  dest[14] = mat[14];
  dest[15] = mat[15];
  return dest;
};

/**
 * Rotates a matrix by the given angle around the specified axis
 * If rotating around a primary axis (X,Y,Z) one of the specialized rotation functions should be used instead for performance
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {vec3} axis vec3 representing the axis to rotate around
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotate = function (mat, angle, axis, dest) {
  var x = axis[0],
    y = axis[1],
    z = axis[2],
    len = Math.sqrt(x * x + y * y + z * z),
    s,
    c,
    t,
    a00,
    a01,
    a02,
    a03,
    a10,
    a11,
    a12,
    a13,
    a20,
    a21,
    a22,
    a23,
    b00,
    b01,
    b02,
    b10,
    b11,
    b12,
    b20,
    b21,
    b22;

  if (!len) {
    return null;
  }
  if (len !== 1) {
    len = 1 / len;
    x *= len;
    y *= len;
    z *= len;
  }

  s = Math.sin(angle);
  c = Math.cos(angle);
  t = 1 - c;

  a00 = mat[0];
  a01 = mat[1];
  a02 = mat[2];
  a03 = mat[3];
  a10 = mat[4];
  a11 = mat[5];
  a12 = mat[6];
  a13 = mat[7];
  a20 = mat[8];
  a21 = mat[9];
  a22 = mat[10];
  a23 = mat[11];

  // Construct the elements of the rotation matrix
  b00 = x * x * t + c;
  b01 = y * x * t + z * s;
  b02 = z * x * t - y * s;
  b10 = x * y * t - z * s;
  b11 = y * y * t + c;
  b12 = z * y * t + x * s;
  b20 = x * z * t + y * s;
  b21 = y * z * t - x * s;
  b22 = z * z * t + c;

  if (!dest) {
    dest = mat;
  } else if (mat !== dest) {
    // If the source and destination differ, copy the unchanged last row
    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  }

  // Perform rotation-specific matrix multiplication
  dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
  dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
  dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
  dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

  dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
  dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
  dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
  dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

  dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
  dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
  dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
  dest[11] = a03 * b20 + a13 * b21 + a23 * b22;
  return dest;
};

/**
 * Rotates a matrix by the given angle around the X axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateX = function (mat, angle, dest) {
  var s = Math.sin(angle),
    c = Math.cos(angle),
    a10 = mat[4],
    a11 = mat[5],
    a12 = mat[6],
    a13 = mat[7],
    a20 = mat[8],
    a21 = mat[9],
    a22 = mat[10],
    a23 = mat[11];

  if (!dest) {
    dest = mat;
  } else if (mat !== dest) {
    // If the source and destination differ, copy the unchanged rows
    dest[0] = mat[0];
    dest[1] = mat[1];
    dest[2] = mat[2];
    dest[3] = mat[3];

    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  }

  // Perform axis-specific matrix multiplication
  dest[4] = a10 * c + a20 * s;
  dest[5] = a11 * c + a21 * s;
  dest[6] = a12 * c + a22 * s;
  dest[7] = a13 * c + a23 * s;

  dest[8] = a10 * -s + a20 * c;
  dest[9] = a11 * -s + a21 * c;
  dest[10] = a12 * -s + a22 * c;
  dest[11] = a13 * -s + a23 * c;
  return dest;
};

/**
 * Rotates a matrix by the given angle around the Y axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateY = function (mat, angle, dest) {
  var s = Math.sin(angle),
    c = Math.cos(angle),
    a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3],
    a20 = mat[8],
    a21 = mat[9],
    a22 = mat[10],
    a23 = mat[11];

  if (!dest) {
    dest = mat;
  } else if (mat !== dest) {
    // If the source and destination differ, copy the unchanged rows
    dest[4] = mat[4];
    dest[5] = mat[5];
    dest[6] = mat[6];
    dest[7] = mat[7];

    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  }

  // Perform axis-specific matrix multiplication
  dest[0] = a00 * c + a20 * -s;
  dest[1] = a01 * c + a21 * -s;
  dest[2] = a02 * c + a22 * -s;
  dest[3] = a03 * c + a23 * -s;

  dest[8] = a00 * s + a20 * c;
  dest[9] = a01 * s + a21 * c;
  dest[10] = a02 * s + a22 * c;
  dest[11] = a03 * s + a23 * c;
  return dest;
};

/**
 * Rotates a matrix by the given angle around the Z axis
 *
 * @param {mat4} mat mat4 to rotate
 * @param {number} angle Angle (in radians) to rotate
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to mat
 *
 * @returns {mat4} dest if specified, mat otherwise
 */
mat4.rotateZ = function (mat, angle, dest) {
  var s = Math.sin(angle),
    c = Math.cos(angle),
    a00 = mat[0],
    a01 = mat[1],
    a02 = mat[2],
    a03 = mat[3],
    a10 = mat[4],
    a11 = mat[5],
    a12 = mat[6],
    a13 = mat[7];

  if (!dest) {
    dest = mat;
  } else if (mat !== dest) {
    // If the source and destination differ, copy the unchanged last row
    dest[8] = mat[8];
    dest[9] = mat[9];
    dest[10] = mat[10];
    dest[11] = mat[11];

    dest[12] = mat[12];
    dest[13] = mat[13];
    dest[14] = mat[14];
    dest[15] = mat[15];
  }

  // Perform axis-specific matrix multiplication
  dest[0] = a00 * c + a10 * s;
  dest[1] = a01 * c + a11 * s;
  dest[2] = a02 * c + a12 * s;
  dest[3] = a03 * c + a13 * s;

  dest[4] = a00 * -s + a10 * c;
  dest[5] = a01 * -s + a11 * c;
  dest[6] = a02 * -s + a12 * c;
  dest[7] = a03 * -s + a13 * c;

  return dest;
};

/**
 * Generates a frustum matrix with the given bounds
 *
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.frustum = function (left, right, bottom, top, near, far, dest) {
  if (!dest) {
    dest = mat4.create();
  }
  var rl = right - left,
    tb = top - bottom,
    fn = far - near;
  dest[0] = (near * 2) / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = (near * 2) / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = (right + left) / rl;
  dest[9] = (top + bottom) / tb;
  dest[10] = -(far + near) / fn;
  dest[11] = -1;
  dest[12] = 0;
  dest[13] = 0;
  dest[14] = -(far * near * 2) / fn;
  dest[15] = 0;
  return dest;
};

/**
 * Generates a perspective projection matrix with the given bounds
 *
 * @param {number} fovy Vertical field of view
 * @param {number} aspect Aspect ratio. typically viewport width/height
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.perspective = function (fovy, aspect, near, far, dest) {
  var top = near * Math.tan((fovy * Math.PI) / 360.0),
    right = top * aspect;
  return mat4.frustum(-right, right, -top, top, near, far, dest);
};

/**
 * Generates a orthogonal projection matrix with the given bounds
 *
 * @param {number} left Left bound of the frustum
 * @param {number} right Right bound of the frustum
 * @param {number} bottom Bottom bound of the frustum
 * @param {number} top Top bound of the frustum
 * @param {number} near Near bound of the frustum
 * @param {number} far Far bound of the frustum
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.ortho = function (left, right, bottom, top, near, far, dest) {
  if (!dest) {
    dest = mat4.create();
  }
  var rl = right - left,
    tb = top - bottom,
    fn = far - near;
  dest[0] = 2 / rl;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 0;
  dest[4] = 0;
  dest[5] = 2 / tb;
  dest[6] = 0;
  dest[7] = 0;
  dest[8] = 0;
  dest[9] = 0;
  dest[10] = -2 / fn;
  dest[11] = 0;
  dest[12] = -(left + right) / rl;
  dest[13] = -(top + bottom) / tb;
  dest[14] = -(far + near) / fn;
  dest[15] = 1;
  return dest;
};

/**
 * Generates a look-at matrix with the given eye position, focal point, and up axis
 *
 * @param {vec3} eye Position of the viewer
 * @param {vec3} center Point the viewer is looking at
 * @param {vec3} up vec3 pointing "up"
 * @param {mat4} [dest] mat4 frustum matrix will be written into
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
mat4.lookAt = function (eye, center, up, dest) {
  if (!dest) {
    dest = mat4.create();
  }

  var x0,
    x1,
    x2,
    y0,
    y1,
    y2,
    z0,
    z1,
    z2,
    len,
    eyex = eye[0],
    eyey = eye[1],
    eyez = eye[2],
    upx = up[0],
    upy = up[1],
    upz = up[2],
    centerx = center[0],
    centery = center[1],
    centerz = center[2];

  if (eyex === centerx && eyey === centery && eyez === centerz) {
    return mat4.identity(dest);
  }

  //vec3.direction(eye, center, z);
  z0 = eyex - centerx;
  z1 = eyey - centery;
  z2 = eyez - centerz;

  // normalize (no check needed for 0 because of early return)
  len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
  z0 *= len;
  z1 *= len;
  z2 *= len;

  //vec3.normalize(vec3.cross(up, z, x));
  x0 = upy * z2 - upz * z1;
  x1 = upz * z0 - upx * z2;
  x2 = upx * z1 - upy * z0;
  len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
  if (!len) {
    x0 = 0;
    x1 = 0;
    x2 = 0;
  } else {
    len = 1 / len;
    x0 *= len;
    x1 *= len;
    x2 *= len;
  }

  //vec3.normalize(vec3.cross(z, x, y));
  y0 = z1 * x2 - z2 * x1;
  y1 = z2 * x0 - z0 * x2;
  y2 = z0 * x1 - z1 * x0;

  len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
  if (!len) {
    y0 = 0;
    y1 = 0;
    y2 = 0;
  } else {
    len = 1 / len;
    y0 *= len;
    y1 *= len;
    y2 *= len;
  }

  dest[0] = x0;
  dest[1] = y0;
  dest[2] = z0;
  dest[3] = 0;
  dest[4] = x1;
  dest[5] = y1;
  dest[6] = z1;
  dest[7] = 0;
  dest[8] = x2;
  dest[9] = y2;
  dest[10] = z2;
  dest[11] = 0;
  dest[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
  dest[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
  dest[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
  dest[15] = 1;

  return dest;
};

/**
 * Creates a matrix from a quaternion rotation and vector translation
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest);
 *     mat4.translate(dest, vec);
 *     var quatMat = mat4.create();
 *     quat4.toMat4(quat, quatMat);
 *     mat4.multiply(dest, quatMat);
 *
 * @param {quat4} quat Rotation quaternion
 * @param {vec3} vec Translation vector
 * @param {mat4} [dest] mat4 receiving operation result. If not specified result is written to a new mat4
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
/*    mat4.fromRotationTranslation = function (quat, vec, dest) {
 if (!dest) { dest = mat4.create(); }

 // Quaternion math
 var x = quat[0], y = quat[1], z = quat[2], w = quat[3],
 x2 = x + x,
 y2 = y + y,
 z2 = z + z,

 xx = x * x2,
 xy = x * y2,
 xz = x * z2,
 yy = y * y2,
 yz = y * z2,
 zz = z * z2,
 wx = w * x2,
 wy = w * y2,
 wz = w * z2;

 dest[0] = 1 - (yy + zz);
 dest[1] = xy + wz;
 dest[2] = xz - wy;
 dest[3] = 0;
 dest[4] = xy - wz;
 dest[5] = 1 - (xx + zz);
 dest[6] = yz + wx;
 dest[7] = 0;
 dest[8] = xz + wy;
 dest[9] = yz - wx;
 dest[10] = 1 - (xx + yy);
 dest[11] = 0;
 dest[12] = vec[0];
 dest[13] = vec[1];
 dest[14] = vec[2];
 dest[15] = 1;

 return dest;
 };*/

/**
 * Returns a string representation of a mat4
 *
 * @param {mat4} mat mat4 to represent as a string
 *
 * @returns {string} String representation of mat
 */
mat4.str = function (mat) {
  return (
    "[" +
    mat[0] +
    ", " +
    mat[1] +
    ", " +
    mat[2] +
    ", " +
    mat[3] +
    ", " +
    mat[4] +
    ", " +
    mat[5] +
    ", " +
    mat[6] +
    ", " +
    mat[7] +
    ", " +
    mat[8] +
    ", " +
    mat[9] +
    ", " +
    mat[10] +
    ", " +
    mat[11] +
    ", " +
    mat[12] +
    ", " +
    mat[13] +
    ", " +
    mat[14] +
    ", " +
    mat[15] +
    "]"
  );
};

/**
 * @class Quaternion
 * @name quat4
 */
var quat4 = {};

/**
 * Creates a new instance of a quat4 using the default array type
 * Any javascript array containing at least 4 numeric elements can serve as a quat4
 *
 * @param {quat4} [quat] quat4 containing values to initialize with
 *
 * @returns {quat4} New quat4
 */
quat4.create = function (quat) {
  var dest = new MatrixArray(4);

  if (quat) {
    dest[0] = quat[0];
    dest[1] = quat[1];
    dest[2] = quat[2];
    dest[3] = quat[3];
  } else {
    dest[0] = dest[1] = dest[2] = dest[3] = 0;
  }

  return dest;
};

/**
 * Creates a new instance of a quat4, initializing it with the given arguments
 *
 * @param {number} x X value
 * @param {number} y Y value
 * @param {number} z Z value
 * @param {number} w W value

 * @returns {quat4} New quat4
 */
quat4.createFrom = function (x, y, z, w) {
  var dest = new MatrixArray(4);

  dest[0] = x;
  dest[1] = y;
  dest[2] = z;
  dest[3] = w;

  return dest;
};

/**
 * Copies the values of one quat4 to another
 *
 * @param {quat4} quat quat4 containing values to copy
 * @param {quat4} dest quat4 receiving copied values
 *
 * @returns {quat4} dest
 */
quat4.set = function (quat, dest) {
  dest[0] = quat[0];
  dest[1] = quat[1];
  dest[2] = quat[2];
  dest[3] = quat[3];

  return dest;
};

/**
 * Compares two quaternions for equality within a certain margin of error
 *
 * @param {quat4} a First vector
 * @param {quat4} b Second vector
 *
 * @returns {Boolean} true if a is equivalent to b
 */
quat4.equal = function (a, b) {
  return (
    a === b ||
    (Math.abs(a[0] - b[0]) < FLOAT_EPSILON &&
      Math.abs(a[1] - b[1]) < FLOAT_EPSILON &&
      Math.abs(a[2] - b[2]) < FLOAT_EPSILON &&
      Math.abs(a[3] - b[3]) < FLOAT_EPSILON)
  );
};

/**
 * Creates a new identity Quat4
 *
 * @param {quat4} [dest] quat4 receiving copied values
 *
 * @returns {quat4} dest is specified, new quat4 otherwise
 */
quat4.identity = function (dest) {
  if (!dest) {
    dest = quat4.create();
  }
  dest[0] = 0;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 1;
  return dest;
};

//var identityQuat4 = quat4.identity();

/**
 * Calculates the W component of a quat4 from the X, Y, and Z components.
 * Assumes that quaternion is 1 unit in length.
 * Any existing W component will be ignored.
 *
 * @param {quat4} quat quat4 to calculate W component of
 * @param {quat4} [dest] quat4 receiving calculated values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.calculateW = function (quat, dest) {
  var x = quat[0],
    y = quat[1],
    z = quat[2];

  if (!dest || quat === dest) {
    quat[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
    return quat;
  }
  dest[0] = x;
  dest[1] = y;
  dest[2] = z;
  dest[3] = -Math.sqrt(Math.abs(1.0 - x * x - y * y - z * z));
  return dest;
};

/**
 * Calculates the dot product of two quaternions
 *
 * @param {quat4} quat First operand
 * @param {quat4} quat2 Second operand
 *
 * @return {number} Dot product of quat and quat2
 */
quat4.dot = function (quat, quat2) {
  return quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3];
};

/**
 * Calculates the inverse of a quat4
 *
 * @param {quat4} quat quat4 to calculate inverse of
 * @param {quat4} [dest] quat4 receiving inverse values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.inverse = function (quat, dest) {
  var q0 = quat[0],
    q1 = quat[1],
    q2 = quat[2],
    q3 = quat[3],
    dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3,
    invDot = dot ? 1.0 / dot : 0;

  // TODO: Would be faster to return [0,0,0,0] immediately if dot == 0

  if (!dest || quat === dest) {
    quat[0] *= -invDot;
    quat[1] *= -invDot;
    quat[2] *= -invDot;
    quat[3] *= invDot;
    return quat;
  }
  dest[0] = -quat[0] * invDot;
  dest[1] = -quat[1] * invDot;
  dest[2] = -quat[2] * invDot;
  dest[3] = quat[3] * invDot;
  return dest;
};

/**
 * Calculates the conjugate of a quat4
 * If the quaternion is normalized, this function is faster than quat4.inverse and produces the same result.
 *
 * @param {quat4} quat quat4 to calculate conjugate of
 * @param {quat4} [dest] quat4 receiving conjugate values. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.conjugate = function (quat, dest) {
  if (!dest || quat === dest) {
    quat[0] *= -1;
    quat[1] *= -1;
    quat[2] *= -1;
    return quat;
  }
  dest[0] = -quat[0];
  dest[1] = -quat[1];
  dest[2] = -quat[2];
  dest[3] = quat[3];
  return dest;
};

/**
 * Calculates the length of a quat4
 *
 * Params:
 * @param {quat4} quat quat4 to calculate length of
 *
 * @returns Length of quat
 */
quat4.length = function (quat) {
  var x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3];
  return Math.sqrt(x * x + y * y + z * z + w * w);
};

/**
 * Generates a unit quaternion of the same direction as the provided quat4
 * If quaternion length is 0, returns [0, 0, 0, 0]
 *
 * @param {quat4} quat quat4 to normalize
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.normalize = function (quat, dest) {
  if (!dest) {
    dest = quat;
  }

  var x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3],
    len = Math.sqrt(x * x + y * y + z * z + w * w);
  if (len === 0) {
    dest[0] = 0;
    dest[1] = 0;
    dest[2] = 0;
    dest[3] = 0;
    return dest;
  }
  len = 1 / len;
  dest[0] = x * len;
  dest[1] = y * len;
  dest[2] = z * len;
  dest[3] = w * len;

  return dest;
};

/**
 * Performs quaternion addition
 *
 * @param {quat4} quat First operand
 * @param {quat4} quat2 Second operand
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.add = function (quat, quat2, dest) {
  if (!dest || quat === dest) {
    quat[0] += quat2[0];
    quat[1] += quat2[1];
    quat[2] += quat2[2];
    quat[3] += quat2[3];
    return quat;
  }
  dest[0] = quat[0] + quat2[0];
  dest[1] = quat[1] + quat2[1];
  dest[2] = quat[2] + quat2[2];
  dest[3] = quat[3] + quat2[3];
  return dest;
};

/**
 * Performs a quaternion multiplication
 *
 * @param {quat4} quat First operand
 * @param {quat4} quat2 Second operand
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.multiply = function (quat, quat2, dest) {
  if (!dest) {
    dest = quat;
  }

  var qax = quat[0],
    qay = quat[1],
    qaz = quat[2],
    qaw = quat[3],
    qbx = quat2[0],
    qby = quat2[1],
    qbz = quat2[2],
    qbw = quat2[3];

  dest[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
  dest[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
  dest[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
  dest[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

  return dest;
};

/**
 * Transforms a vec3 with the given quaternion
 *
 * @param {quat4} quat quat4 to transform the vector with
 * @param {vec3} vec vec3 to transform
 * @param {vec3} [dest] vec3 receiving operation result. If not specified result is written to vec
 *
 * @returns dest if specified, vec otherwise
 */
quat4.multiplyVec3 = function (quat, vec, dest) {
  if (!dest) {
    dest = vec;
  }

  var x = vec[0],
    y = vec[1],
    z = vec[2],
    qx = quat[0],
    qy = quat[1],
    qz = quat[2],
    qw = quat[3],
    // calculate quat * vec
    ix = qw * x + qy * z - qz * y,
    iy = qw * y + qz * x - qx * z,
    iz = qw * z + qx * y - qy * x,
    iw = -qx * x - qy * y - qz * z;

  // calculate result * inverse quat
  dest[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
  dest[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
  dest[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;

  return dest;
};

/**
 * Multiplies the components of a quaternion by a scalar value
 *
 * @param {quat4} quat to scale
 * @param {number} val Value to scale by
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.scale = function (quat, val, dest) {
  if (!dest || quat === dest) {
    quat[0] *= val;
    quat[1] *= val;
    quat[2] *= val;
    quat[3] *= val;
    return quat;
  }
  dest[0] = quat[0] * val;
  dest[1] = quat[1] * val;
  dest[2] = quat[2] * val;
  dest[3] = quat[3] * val;
  return dest;
};

/**
 * Calculates a 4x4 matrix from the given quat4
 *
 * @param {quat4} quat quat4 to create matrix from
 * @param {mat4} [dest] mat4 receiving operation result
 *
 * @returns {mat4} dest if specified, a new mat4 otherwise
 */
quat4.toMat4 = function (quat, dest) {
  if (!dest) {
    dest = mat4.create();
  }

  var x = quat[0],
    y = quat[1],
    z = quat[2],
    w = quat[3],
    x2 = x + x,
    y2 = y + y,
    z2 = z + z,
    xx = x * x2,
    xy = x * y2,
    xz = x * z2,
    yy = y * y2,
    yz = y * z2,
    zz = z * z2,
    wx = w * x2,
    wy = w * y2,
    wz = w * z2;

  dest[0] = 1 - (yy + zz);
  dest[1] = xy + wz;
  dest[2] = xz - wy;
  dest[3] = 0;

  dest[4] = xy - wz;
  dest[5] = 1 - (xx + zz);
  dest[6] = yz + wx;
  dest[7] = 0;

  dest[8] = xz + wy;
  dest[9] = yz - wx;
  dest[10] = 1 - (xx + yy);
  dest[11] = 0;

  dest[12] = 0;
  dest[13] = 0;
  dest[14] = 0;
  dest[15] = 1;

  return dest;
};

/**
 * Performs a spherical linear interpolation between two quat4
 *
 * @param {quat4} quat First quaternion
 * @param {quat4} quat2 Second quaternion
 * @param {number} slerp Interpolation amount between the two inputs
 * @param {quat4} [dest] quat4 receiving operation result. If not specified result is written to quat
 *
 * @returns {quat4} dest if specified, quat otherwise
 */
quat4.slerp = function (quat, quat2, slerp, dest) {
  if (!dest) {
    dest = quat;
  }

  var cosHalfTheta = quat[0] * quat2[0] + quat[1] * quat2[1] + quat[2] * quat2[2] + quat[3] * quat2[3],
    halfTheta,
    sinHalfTheta,
    ratioA,
    ratioB;

  if (Math.abs(cosHalfTheta) >= 1.0) {
    if (dest !== quat) {
      dest[0] = quat[0];
      dest[1] = quat[1];
      dest[2] = quat[2];
      dest[3] = quat[3];
    }
    return dest;
  }

  halfTheta = Math.acos(cosHalfTheta);
  sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

  if (Math.abs(sinHalfTheta) < 0.001) {
    dest[0] = quat[0] * 0.5 + quat2[0] * 0.5;
    dest[1] = quat[1] * 0.5 + quat2[1] * 0.5;
    dest[2] = quat[2] * 0.5 + quat2[2] * 0.5;
    dest[3] = quat[3] * 0.5 + quat2[3] * 0.5;
    return dest;
  }

  ratioA = Math.sin((1 - slerp) * halfTheta) / sinHalfTheta;
  ratioB = Math.sin(slerp * halfTheta) / sinHalfTheta;

  dest[0] = quat[0] * ratioA + quat2[0] * ratioB;
  dest[1] = quat[1] * ratioA + quat2[1] * ratioB;
  dest[2] = quat[2] * ratioA + quat2[2] * ratioB;
  dest[3] = quat[3] * ratioA + quat2[3] * ratioB;

  return dest;
};

/**
 * Creates a quaternion from the given 3x3 rotation matrix.
 * If dest is omitted, a new quaternion will be created.
 *
 * @param {mat3}  mat    the rotation matrix
 * @param {quat4} [dest] an optional receiving quaternion
 *
 * @returns {quat4} the quaternion constructed from the rotation matrix
 *
 */
quat4.fromRotationMatrix = function (mat, dest) {
  if (!dest) dest = quat4.create();

  // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
  // article "Quaternion Calculus and Fast Animation".

  var fTrace = mat[0] + mat[4] + mat[8];
  var fRoot;

  if (fTrace > 0.0) {
    // |w| > 1/2, may as well choose w > 1/2
    fRoot = Math.sqrt(fTrace + 1.0); // 2w
    dest[3] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot; // 1/(4w)
    dest[0] = (mat[7] - mat[5]) * fRoot;
    dest[1] = (mat[2] - mat[6]) * fRoot;
    dest[2] = (mat[3] - mat[1]) * fRoot;
  } else {
    // |w| <= 1/2
    var s_iNext = (quat4.fromRotationMatrix.s_iNext = quat4.fromRotationMatrix.s_iNext || [1, 2, 0]);
    var i = 0;
    if (mat[4] > mat[0]) i = 1;
    if (mat[8] > mat[i * 3 + i]) i = 2;
    var j = s_iNext[i];
    var k = s_iNext[j];

    fRoot = Math.sqrt(mat[i * 3 + i] - mat[j * 3 + j] - mat[k * 3 + k] + 1.0);
    dest[i] = 0.5 * fRoot;
    fRoot = 0.5 / fRoot;
    dest[3] = (mat[k * 3 + j] - mat[j * 3 + k]) * fRoot;
    dest[j] = (mat[j * 3 + i] + mat[i * 3 + j]) * fRoot;
    dest[k] = (mat[k * 3 + i] + mat[i * 3 + k]) * fRoot;
  }

  return dest;
};

/**
 * Sets a quat4 to the Identity and returns it.
 *
 * @param {quat4} [dest] quat4 to set. If omitted, a
 * new quat4 will be created.
 *
 * @returns {quat4} dest
 */
quat4.identity = function (dest) {
  if (!dest) dest = quat4.create();
  dest[0] = 0;
  dest[1] = 0;
  dest[2] = 0;
  dest[3] = 1;
  return dest;
};

/**
 * Sets a quat4 from the given angle and rotation axis,
 * then returns it. If dest is not given, a new quat4 is created.
 *
 * @param {Number} angle  the angle in radians
 * @param {vec3}   axis   the axis around which to rotate
 * @param {quat4}  [dest] the optional quat4 to store the result
 *
 * @returns {quat4} dest
 **/
quat4.fromAngleAxis = function (angle, axis, dest) {
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)
  if (!dest) dest = quat4.create();

  var half = angle * 0.5;
  var s = Math.sin(half);
  dest[3] = Math.cos(half);
  dest[0] = s * axis[0];
  dest[1] = s * axis[1];
  dest[2] = s * axis[2];

  return dest;
};

/**
 * Stores the angle and axis in a vec4, where the XYZ components represent
 * the axis and the W (4th) component is the angle in radians.
 *
 * If dest is not given, src will be modified in place and returned, after
 * which it should not be considered not a quaternion (just an axis and angle).
 *
 * @param {quat4} quat   the quaternion whose angle and axis to store
 * @param {vec4}  [dest] the optional vec4 to receive the data
 *
 * @returns {vec4} dest
 */
quat4.toAngleAxis = function (src, dest) {
  if (!dest) dest = src;
  // The quaternion representing the rotation is
  //   q = cos(A/2)+sin(A/2)*(x*i+y*j+z*k)

  var sqrlen = src[0] * src[0] + src[1] * src[1] + src[2] * src[2];
  if (sqrlen > 0) {
    dest[3] = 2 * Math.acos(src[3]);
    var invlen = 1.0 / Math.sqrt(sqrlen);
    dest[0] = src[0] * invlen;
    dest[1] = src[1] * invlen;
    dest[2] = src[2] * invlen;
  } else {
    // angle is 0 (mod 2*pi), so any axis will do
    dest[3] = 0;
    dest[0] = 1;
    dest[1] = 0;
    dest[2] = 0;
  }

  return dest;
};

/**
 * Returns a string representation of a quaternion
 *
 * @param {quat4} quat quat4 to represent as a string
 *
 * @returns {string} String representation of quat
 */
quat4.str = function (quat) {
  return "[" + quat[0] + ", " + quat[1] + ", " + quat[2] + ", " + quat[3] + "]";
};

/*
 * Exports
 */

window.vec3 = vec3;
window.mat4 = mat4;
window.quat4 = quat4;

export default mat4;
