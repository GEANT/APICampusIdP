const errPrefix= "325";
module.exports = function (req, res, next) {
    const apiToken = req.app.get('appConfig').get('x-api-token');
    if(req.get('x-api-token') !== apiToken){
        return res.status(401).send({
            "error": true,
            "message": "Authorization (x-api-token) failed.",
            "id": errPrefix+"002"
        });
    }
    next();
};