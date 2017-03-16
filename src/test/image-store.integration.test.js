'use strict';

const imageStore = require('../images/image-store');

require('dotenv-safe').load({
    path: '.env.test',
    allowEmptyValues: true
});
const chai = require('chai');
chai.use(require('chai-string'));
chai.should();

const IMAGE_URL = "http://s4.evcdn.com/images/large/I0-001/010/680/043-5.jpeg_/coldplay-43.jpeg";
const IMAGE_URL_INVALID = "";

describe('When storing a valid image', function(){
    it('a https url should be returned', function() {
        this.timeout(10000);

        return imageStore.proxyImage(IMAGE_URL)
            .then(url => {
                url.should.be.a('string');
                url.should.endWith('.jpeg');
                url.should.startWith('https://')
            });
    })
});

describe('When storing an invalid image', function() {
   it('should throw an error', function() {
       return imageStore.proxyImage(IMAGE_URL_INVALID)
           .catch(err => {
               err.should.be.an('Error');
               err.message.should.be.a('string');
           })
   })
});
