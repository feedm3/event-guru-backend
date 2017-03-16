'use strict';

const s3 = require('../api/aws-s3');

// the request and request-promise library both dont support correct data pipelining
// to pass the data to s3 so we have to use the native http library
const http = require('http');

const FOLDER_PREFIX = 'images/';

const proxyImage = (imageUrl) => {
    const imageUrlWithoutParamters = imageUrl.split('?')[0];
    const imageUrlWithoutSpecialCharacters = imageUrlWithoutParamters.replace(/[/:]/g, '.');
    const fileName = FOLDER_PREFIX + imageUrlWithoutSpecialCharacters;

    return s3.fileExists(fileName)
        .then(exists => {
            if (exists) {
                return s3.getFileUrl(fileName);
            }
            return new Promise((resolve, reject) => {
                http.get(imageUrl, (response) => {
                        if (response.statusCode === 200) {
                            s3.uploadData(response, fileName)
                                .then(url => {
                                    resolve(url)
                                });
                        } else {
                            reject('Could not upload image ' + imageUrl);
                        }
                    })
                    .on('error', (err) => {
                        reject(err);
                    });
            });
        });
};

module.exports = {
    proxyImage
};
