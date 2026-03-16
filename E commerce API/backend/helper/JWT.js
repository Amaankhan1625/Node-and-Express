const { expressjwt } = require('express-jwt');
require('dotenv/config');

function authJwt() {
    const secret = process.env.SECRET_KEY;

    return expressjwt({
        secret: secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            "/api/v1/customers/login",
            "/api/v1/customers/register"
        ]
    });
}

module.exports = authJwt;