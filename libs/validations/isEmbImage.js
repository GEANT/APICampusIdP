const validator = require('validator');
const isEmbeddedImage = function (str) {

    return /data:image\/([a-zA-Z]*);base64,([^\"]*)/i.test(str);
};



const isEmbeddedImageOrUrl = function (str){

    let emb = isEmbeddedImage(str);

    console.log(emb);
    if(!emb){
        emb = validator.isURL(str);
        console.log(emb);
    }
    return emb;
};

module.exports = isEmbeddedImageOrUrl;