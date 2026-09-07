const jwt = require("jsonwebtoken");
const erorrs = require("../Erorrs.js");
const User = require("../models/User.js");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.token || req.headers.authorization;
    if(authHeader) {
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : (authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader);
        jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, user) => {
            if(err) return res.status(403).json("Token is not valid");
            req.user = user;

            try {
                // بررسی وضعیت بلاک بودن یا فعال بودن کاربر از دیتابیس
                const dbUser = await User.findById(user.id).select("isBlocked active role");
                if (!dbUser) {
                    return res.status(404).json(erorrs.userFound_404 || "کاربر یافت نشد");
                }
                if (dbUser.isBlocked || dbUser.active === false) {
                    return res.status(403).json({
                        error: erorrs.notActiveUser,
                        message: "حساب کاربری شما توسط ادمین مسدود شده است",
                        isBlocked: true
                    });
                }
                next();
            } catch (dbErr) {
                return res.status(500).json({ error: dbErr.message });
            }
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