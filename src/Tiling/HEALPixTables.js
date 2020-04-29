/*******************************************************************************
 * Copyright 2017, 2018 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of MIZAR.
 *
 * MIZAR is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * MIZAR is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MIZAR. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/

/**
 *    Module with constants
 */
/**************************************************************************************************************/

var HealPixTables = {
  ctab: [
    0,
    1,
    256,
    257,
    2,
    3,
    258,
    259,
    512,
    513,
    768,
    769,
    514,
    515,
    770,
    771,
    4,
    5,
    260,
    261,
    6,
    7,
    262,
    263,
    516,
    517,
    772,
    773,
    518,
    519,
    774,
    775,
    1024,
    1025,
    1280,
    1281,
    1026,
    1027,
    1282,
    1283,
    1536,
    1537,
    1792,
    1793,
    1538,
    1539,
    1794,
    1795,
    1028,
    1029,
    1284,
    1285,
    1030,
    1031,
    1286,
    1287,
    1540,
    1541,
    1796,
    1797,
    1542,
    1543,
    1798,
    1799,
    8,
    9,
    264,
    265,
    10,
    11,
    266,
    267,
    520,
    521,
    776,
    777,
    522,
    523,
    778,
    779,
    12,
    13,
    268,
    269,
    14,
    15,
    270,
    271,
    524,
    525,
    780,
    781,
    526,
    527,
    782,
    783,
    1032,
    1033,
    1288,
    1289,
    1034,
    1035,
    1290,
    1291,
    1544,
    1545,
    1800,
    1801,
    1546,
    1547,
    1802,
    1803,
    1036,
    1037,
    1292,
    1293,
    1038,
    1039,
    1294,
    1295,
    1548,
    1549,
    1804,
    1805,
    1550,
    1551,
    1806,
    1807,
    2048,
    2049,
    2304,
    2305,
    2050,
    2051,
    2306,
    2307,
    2560,
    2561,
    2816,
    2817,
    2562,
    2563,
    2818,
    2819,
    2052,
    2053,
    2308,
    2309,
    2054,
    2055,
    2310,
    2311,
    2564,
    2565,
    2820,
    2821,
    2566,
    2567,
    2822,
    2823,
    3072,
    3073,
    3328,
    3329,
    3074,
    3075,
    3330,
    3331,
    3584,
    3585,
    3840,
    3841,
    3586,
    3587,
    3842,
    3843,
    3076,
    3077,
    3332,
    3333,
    3078,
    3079,
    3334,
    3335,
    3588,
    3589,
    3844,
    3845,
    3590,
    3591,
    3846,
    3847,
    2056,
    2057,
    2312,
    2313,
    2058,
    2059,
    2314,
    2315,
    2568,
    2569,
    2824,
    2825,
    2570,
    2571,
    2826,
    2827,
    2060,
    2061,
    2316,
    2317,
    2062,
    2063,
    2318,
    2319,
    2572,
    2573,
    2828,
    2829,
    2574,
    2575,
    2830,
    2831,
    3080,
    3081,
    3336,
    3337,
    3082,
    3083,
    3338,
    3339,
    3592,
    3593,
    3848,
    3849,
    3594,
    3595,
    3850,
    3851,
    3084,
    3085,
    3340,
    3341,
    3086,
    3087,
    3342,
    3343,
    3596,
    3597,
    3852,
    3853,
    3598,
    3599,
    3854,
    3855
  ],
  utab: [
    0,
    1,
    4,
    5,
    16,
    17,
    20,
    21,
    64,
    65,
    68,
    69,
    80,
    81,
    84,
    85,
    256,
    257,
    260,
    261,
    272,
    273,
    276,
    277,
    320,
    321,
    324,
    325,
    336,
    337,
    340,
    341,
    1024,
    1025,
    1028,
    1029,
    1040,
    1041,
    1044,
    1045,
    1088,
    1089,
    1092,
    1093,
    1104,
    1105,
    1108,
    1109,
    1280,
    1281,
    1284,
    1285,
    1296,
    1297,
    1300,
    1301,
    1344,
    1345,
    1348,
    1349,
    1360,
    1361,
    1364,
    1365,
    4096,
    4097,
    4100,
    4101,
    4112,
    4113,
    4116,
    4117,
    4160,
    4161,
    4164,
    4165,
    4176,
    4177,
    4180,
    4181,
    4352,
    4353,
    4356,
    4357,
    4368,
    4369,
    4372,
    4373,
    4416,
    4417,
    4420,
    4421,
    4432,
    4433,
    4436,
    4437,
    5120,
    5121,
    5124,
    5125,
    5136,
    5137,
    5140,
    5141,
    5184,
    5185,
    5188,
    5189,
    5200,
    5201,
    5204,
    5205,
    5376,
    5377,
    5380,
    5381,
    5392,
    5393,
    5396,
    5397,
    5440,
    5441,
    5444,
    5445,
    5456,
    5457,
    5460,
    5461,
    16384,
    16385,
    16388,
    16389,
    16400,
    16401,
    16404,
    16405,
    16448,
    16449,
    16452,
    16453,
    16464,
    16465,
    16468,
    16469,
    16640,
    16641,
    16644,
    16645,
    16656,
    16657,
    16660,
    16661,
    16704,
    16705,
    16708,
    16709,
    16720,
    16721,
    16724,
    16725,
    17408,
    17409,
    17412,
    17413,
    17424,
    17425,
    17428,
    17429,
    17472,
    17473,
    17476,
    17477,
    17488,
    17489,
    17492,
    17493,
    17664,
    17665,
    17668,
    17669,
    17680,
    17681,
    17684,
    17685,
    17728,
    17729,
    17732,
    17733,
    17744,
    17745,
    17748,
    17749,
    20480,
    20481,
    20484,
    20485,
    20496,
    20497,
    20500,
    20501,
    20544,
    20545,
    20548,
    20549,
    20560,
    20561,
    20564,
    20565,
    20736,
    20737,
    20740,
    20741,
    20752,
    20753,
    20756,
    20757,
    20800,
    20801,
    20804,
    20805,
    20816,
    20817,
    20820,
    20821,
    21504,
    21505,
    21508,
    21509,
    21520,
    21521,
    21524,
    21525,
    21568,
    21569,
    21572,
    21573,
    21584,
    21585,
    21588,
    21589,
    21760,
    21761,
    21764,
    21765,
    21776,
    21777,
    21780,
    21781,
    21824,
    21825,
    21828,
    21829,
    21840,
    21841,
    21844,
    21845
  ],

  // coordinate of the lowest corner of each face
  jrll: [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
  jpll: [1, 3, 5, 7, 0, 2, 4, 6, 1, 3, 5, 7],

  xoffset: [-1, -1, 0, 1, 1, 1, 0, -1],
  yoffset: [0, 1, 1, 1, 0, -1, -1, -1],
  facearray: [
    [8, 9, 10, 11, -1, -1, -1, -1, 10, 11, 8, 9], // S
    [5, 6, 7, 4, 8, 9, 10, 11, 9, 10, 11, 8], // SE
    [-1, -1, -1, -1, 5, 6, 7, 4, -1, -1, -1, -1], // E
    [4, 5, 6, 7, 11, 8, 9, 10, 11, 8, 9, 10], // SW
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // center
    [1, 2, 3, 0, 0, 1, 2, 3, 5, 6, 7, 4], // NE
    [-1, -1, -1, -1, 7, 4, 5, 6, -1, -1, -1, -1], // W
    [3, 0, 1, 2, 3, 0, 1, 2, 4, 5, 6, 7], // NW
    [2, 3, 0, 1, -1, -1, -1, -1, 0, 1, 2, 3]
  ], // N
  swaparray: [
    [0, 0, 3], // S
    [0, 0, 6], // SE
    [0, 0, 0], // E
    [0, 0, 5], // SW
    [0, 0, 0], // center
    [5, 0, 0], // NE
    [0, 0, 0], // W
    [6, 0, 0], // NW
    [3, 0, 0]
  ], // N

  swap_cycle: [
    [],
    [0, 1, 8, 12, 16, 21, 40],
    [0, 1, 2, 40, 114],
    [0, 4, 160, 263],
    [0, 4, 30, 49, 51, 87, 526, 1027, 1105, 1387, 1807, 2637],
    [0, 8, 10, 18, 39, 74, 146, 307, 452, 4737],
    [0, 1, 2, 7, 9, 17, 80, 410, 1526, 1921, 32859, 33566, 38931],
    [0, 5, 6, 10, 12, 24, 27, 95, 372, 494, 924, 1409, 3492, 4248, 9137, 66043, 103369, 156899],
    [0, 1, 2, 3, 4, 45, 125, 351, 697, 24337, 102940, 266194, 341855, 419857],
    [0, 1, 2, 3, 9, 16, 1705, 2082, 2126, 8177, 12753, 15410, 52642, 80493, 83235, 88387, 99444, 1675361, 2495125],
    [0, 2, 6, 8, 9, 11, 20, 50, 93, 152, 183, 2137, 13671, 44794, 486954, 741908, 4803258, 5692573],
    [0, 1, 5, 6, 44, 53, 470, 2847, 3433, 4906, 13654, 14710, 400447, 1797382, 2744492, 18775974, 23541521],
    [
      0,
      4,
      9,
      10,
      16,
      33,
      83,
      117,
      318,
      451,
      5759,
      10015,
      128975,
      171834,
      211256,
      347608,
      1278690,
      2154097,
      2590798,
      3427694,
      5581717,
      21012301,
      27023976,
      72522811,
      95032729,
      139166747,
      171822389
    ],
    [
      0,
      5,
      10,
      267,
      344,
      363,
      2968,
      3159,
      9083,
      18437,
      76602,
      147614,
      1246902,
      1593138,
      2035574,
      6529391,
      9511830,
      11340287,
      29565945,
      281666026,
      677946848
    ]
  ]
};

export default HealPixTables;
