const jwt = require("jsonwebtoken");
const erorrs = require("../Erorrs.js");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token;
    if(authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
            if(err) return res.status(403).json("Token is not valid");
            req.user = user;
           // console.log(req.user);
            next();
        });

    } else {
        return res.status(402).json(erorrs.TokenNotAuthorized);
    }
};



const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
         if(req.user.role === "admin") {
            next();
        } else {
            res.status(405).json(erorrs.TokenNotAuthorized);
        }
    })
};



const verifyTokenAndDriver = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.role === "driver") {
            next();
        } else {
            res.status(405).json(erorrs.TokenNotAuthorized);
        }
    })
};

module.exports = { verifyToken, verifyTokenAndAdmin ,verifyTokenAndDriver };