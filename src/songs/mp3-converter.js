'use strict';

const fs = require('fs');
const execFile = require('child_process').execFile;
const randomString = require('randomstring');

// the path must be relative to the root project src path for aws lambda. on local you
// need the relative path from the executing js script
const RESULT_DIR = '/tmp';

/**
 * Convert a mp3 to 48k and 16khz
 *
 * @param mp3ToConvertUri uri to the file to convert
 * @returns {Promise} with converted file uri
 */
const convert = (mp3ToConvertUri) => {
    return convertMp3(mp3ToConvertUri)
        .catch(error => console.error('File could not be converted', error));
};

module.exports = {
    convert
};

const convertMp3 = (mp3Link) => {
    if (!mp3Link) {
        return Promise.reject(new Error('URL to download mp3 must not be null!'));
    }

    return new Promise((resolve, reject) => {
        console.log('Converting ' + mp3Link);

        const resultFileName = randomString.generate({ length:10, charset: 'alphabetic'}) + '.mp3';
        const resultFileUri = RESULT_DIR + '/' + resultFileName;

        // note: if you upload the binary from a windows machine it can result in conflicts and errors!
        execFile(process.env.PATH_FFMPEG_BIN, [
            '-i', mp3Link,
            '-b:a', '48k',
            '-ac', '2',
            '-codec:a', 'libmp3lame',
            '-y',
            '-ar', '16000',
            resultFileUri
        ], (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(resultFileUri);
        })
    })
};

const logFileStats = (fileUri) => {
    return new Promise((resolve, reject) => {
        fs.stat(fileUri, (err, stats) => {
            if (err || !stats) {
                reject('No file stats for ' + fileUri, err);
                return;
            }
            const fileSizeInBytes = stats["size"];
            const fileSizeInMegabytes = parseFloat(fileSizeInBytes / 1000000).toFixed(3);
            console.log(`File stats for ${fileUri}: size: ${fileSizeInMegabytes}mb`);
            resolve(fileUri);
        });
    });
};
