const forge = require("node-forge");
const pki = forge.pki;
const keyLenght = 3072;
const min = 1;
const max = Number.MAX_SAFE_INTEGER;
const years = 5;

const generateX509 = (attrs) => {
    let keys = pki.rsa.generateKeyPair(keyLenght);
    let cert = pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = Math.floor(Math.random() * (max - min)) + min;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + years);
    cert.setSubject(attrs);
    // selfsigned
    cert.setIssuer(attrs);
    // @todo extentions
    cert.sign(keys.privateKey, forge.md.sha256.create());
    let pem = pki.certificateToPem(cert);
    return {
        privateKey: pki.privateKeyToPem(keys.privateKey),
        certificate: pki.certificateToPem(cert)
    };
};


module.exports.generatex509 = generateX509;