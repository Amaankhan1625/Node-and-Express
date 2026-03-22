const { expressjwt } = require('express-jwt');

function authJwt() {
    const secret = process.env.SECRET_KEY;
    const api = process.env.API_URL;
    return expressjwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked 
    }).unless({
        path: [
            { url: /\/api\/v1\/products(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/customers/login`,
            `${api}/customers/register`,
        ]
    });
}


async function isRevoked(req, token) {
    // In newer versions, the second argument is the decoded token object
    // The payload is accessed via token.payload
    if (!token.payload.isAdmin) {
        return true; // true means the token IS revoked (access denied)
    }

    return false; // false means the token is NOT revoked (access granted)
}



module.exports = authJwt