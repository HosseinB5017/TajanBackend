const UserControllers = require("../models/User.js");
var CryptoJS = require("crypto-js");
const erorrs = require("../Erorrs.js");
const City = require("../models/City");
const inviteController = require("./Invitation.Controllers");

const CreateUser = async (req, res) => {
    const { email, lastName, name, nationalId, password, phoneNumber, role, username } = req.body;
    const allowedRoles = ["user", "driver", "shop_owner", "admin"];

    if (typeof username !== "string" || !username.trim() ||
        typeof password !== "string" || !password ||
        !allowedRoles.includes(role)) {
        return res.status(400).json({
            error: "نام کاربری، رمز عبور و نقش معتبر الزامی است"
        });
    }

    try {
        const existingUser = await UserControllers.findOne({ username: username.trim() });
        if (existingUser) {
            return res.status(422).json({ error: "نام کاربری قبلاً استفاده شده است" });
        }

        const user = await UserControllers.create({
            email,
            lastName,
            name,
            nationalId,
            username: username.trim(),
            password: CryptoJS.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY).toString(),
            phoneNumber,
            role
        });

        const { password: savedPassword, ...safeUser } = user.toObject();
        return res.status(201).json(safeUser);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(422).json({ error: erorrs.repetitive_422 });
        }
        return res.status(500).json({ error: error.message });
    }
};

//UPDATE
const UpdateUser = async (req, res, next) => {

    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, process.env.PASSWORD_SECRET_KEY).toString();
    }
    const updates = {...req.body};

    // Remove password and role from the updates object if they exist
    delete updates.password;
    delete updates.role;
    delete updates.score;
    delete updates.finance;
    delete updates.isBlocked;
    delete updates.blockReason;

    console.log(req.body);
        if (req.body.referralCode) {
            const result = await inviteController.checkInvitationCode({
                invitedCode: req.body.referralCode,
                currentUserId: req.user.id
            });
        }
        try {
        const updatedUser = await UserControllers.findByIdAndUpdate(req.user.id, {
            $set: updates
        }, {new: true});

        res.status(200).json(updatedUser);

    } catch (err) {
        if (err.code === 11000) {
            res.status(422).json({error: erorrs.repetitive_422});
            console.error(err.stack);
        } else {
            res.status(400).json({error: err.stack})
            console.error(err.stack);
        }
    }
}
//DELETE


const updateUserInfoByAdmin = async (req, res, next) => {
    try {
        const updatedUser = await UserControllers.findByIdAndUpdate(req.query.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ error: 'user not found' });
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const DeleteUser = async (req, res, next) => {
    try {
        await UserControllers.findByIdAndDelete(req.params.id);
        res.status(200).json("UserControllers has been deleted");

    } catch (err) {
        res.status(506).json(err);
    }
//})
}

//Get UserControllers

const UpdateProfile = async (req, res, next) => {
    try {
        const user = await UserControllers.findById(req.user.id);
        console.log(req.file.filename);
        user.profileImg = process.env.UserDownPath + req.file.filename;
        user.save();
        const {password, ...others} = user._doc;

        res.status(200).json(others);
    } catch (err) {
        res.status(507).json(err);
    }
}

const FindUser = async (req, res) => {
    try {
        let users = [];

        if (req.query.id) {
            const user = await UserControllers.findById(req.query.id);
            users = user ? [user] : [];
        } else if (req.query.username) {
            users = await UserControllers.find({
                username: { $regex: req.query.username, $options: "i" }
            });
        } else if (req.query.role) {
            users = await UserControllers.find({ role: req.query.role });
        } else {
            return res.status(400).json({ error: "id یا username یا role الزامی است" });
        }

        const safeUsers = users.map(u => {
            const obj = u?.toObject ? u.toObject() : u;
            const { password, ...others } = obj;
            return others;
        });

        return res.status(200).json(safeUsers);
    } catch (err) {
        return res.status(507).json(err);
    }
};


const UserInfo = async (req, res, next) => {
    try {
        const user = await UserControllers.findById(req.user.id);
        const {password, ...others} = user._doc;
        res.status(200).json(others);

    } catch (err) {
        console.log(err);
        res.status(400).json(erorrs.er400);
    }
}


//Get ALL Users
const GetAllUsers = async (req, res, next) => {

    const query = req.query.new;
    const page = Number(req.query.page) || 1;
    const perpage = Number(req.query.perpage) || 10;
    const filter = {};
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";

    if (search) {
        const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [
            { username: { $regex: escapedSearch, $options: "i" } },
            { name: { $regex: escapedSearch, $options: "i" } },
            { lastName: { $regex: escapedSearch, $options: "i" } },
            { email: { $regex: escapedSearch, $options: "i" } },
            { phoneNumber: { $regex: escapedSearch, $options: "i" } }
        ];
    }

    if (req.query.role) {
        filter.role = req.query.role;
    }

    const options = {
        skip: ((page - 1) * perpage), limit: perpage
    }
    let count = await UserControllers.countDocuments(filter);

    try {
        let users;
        if (query) {
            users = await UserControllers.find(filter).sort({_id: -1}).limit(Number(query));
            count = users.length;
        } else {
            users = await UserControllers.find(filter, {}, options).sort({_id: -1});
        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfUser": count, "data": users});
    } catch (err) {
        res.status(507).json(err);
    }
//});
}

//GET USER STATS
const GetUserState = async (req, res, next) => {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

    try {

        const data = await UserControllers.aggregate([{$match: {createdAt: {$gte: lastYear}}}, {
            $project: {
                month: {$month: "$createdAt"},
            },
        }, {
            $group: {
                _id: "$month", total: {$sum: 1},
            }
        }])
        res.status(200).json(data);

    } catch (err) {
        res.status(508).json(err);
    }
//})
}

const BlockOrUnblockUser = async (req, res, next) => {
    try {
        const { id, isBlocked, blockReason } = req.body;
        const userId = id || req.query.id;

        if (!userId) {
            return res.status(400).json({ error: "شناسه کاربر (id) الزامی است" });
        }

        const user = await UserControllers.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "کاربر پیدا نشد" });
        }

        user.isBlocked = isBlocked !== undefined ? Boolean(isBlocked) : !user.isBlocked;
        if (blockReason !== undefined) {
            user.blockReason = blockReason;
        }

        await user.save();

        const { password, ...others } = user._doc;
        return res.status(200).json({
            message: user.isBlocked ? "کاربر با موفقیت مسدود شد" : "کاربر با موفقیت رفع مسدودیت شد",
            user: others
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const GetTimeServer = async (req, res) => {
    try {
        const currentTime = new Date();
        res.json({time: currentTime});
    } catch (err) {
        res.status(507).json(err);
    }
}

module.exports = {CreateUser, UpdateUser, updateUserInfoByAdmin, BlockOrUnblockUser, UserInfo, DeleteUser, FindUser, GetAllUsers, GetUserState, UpdateProfile, GetTimeServer}
