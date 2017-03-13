/**
 * @author Fabian Dietenberger
 */

'use strict';

require('dotenv').config();
const randomString = require('randomstring');

console.log(randomString.generate({ length:10, charset: 'alphabetic'}) + '.mp3');

console.log(process.env.PATH_FFMPEG_BIN);
