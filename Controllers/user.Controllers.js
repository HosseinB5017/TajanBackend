const UserControllers = require("../models/User.js");
var CryptoJS = require("crypto-js");
const erorrs = require("../Erorrs.js");
const City = require("../models/City");
const inviteController = require("./Invitation.Controllers");

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


        const result = await inviteController.checkInvitationCode({
            invitedCode: req.body.invitedCode,
            currentUserId: req.user.id
        });
        if (result.success)


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

const FindUser = async (req, res, next) => {
    try {
        var users ;
        if (req.query.id)
            users = await UserControllers.findById(req.query.id);
        else if (req.query.username)
            users = await UserControllers.find({ username: { $regex: req.query.username, $options: "i"}});
        else if (req.query.role)
            users = await UserControllers.find({role : req.query.role});

        res.status(200).json(
            users.map(user => {
                const { password, ...others } = user._doc;
                return others;
            })
        );

    } catch (err) {
        res.status(507).json(err);
    }
}

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
    const page = req.query.page;
    const perpage = req.query.perpage;
    const options = {
        skip: ((page - 1) * perpage), limit: perpage
    }
    let count = await UserControllers.countDocuments({});

    try {
        let users;
        if (query) {
            users = await UserControllers.find().sort({_id: -1}).limit(query);
            count = users.length;
        } else {
            users = await UserControllers.find({}, {}, options);
        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfProduct": count, "data": users});
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

const GetTimeServer = async (req, res) => {
    try {
        const currentTime = new Date();
        res.json({time: currentTime});
    } catch (err) {
        res.status(507).json(err);
    }
}

module.exports = {UpdateUser, updateUserInfoByAdmin, UserInfo, DeleteUser, FindUser, GetAllUsers, GetUserState, UpdateProfile, GetTimeServer}
