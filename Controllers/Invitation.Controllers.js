const User = require("../models/User");
const validate = require("../Utils/ValidationChecker.js");
const erorrs = require("../Erorrs.js");
const Invitation = require("../models/InvitedFriends.js");

const GetInvitationFriends = async (req, res, next) => {
    try {
        var friends = await Invitation.find({userBase : req.user.id});
        res.status(200).json({data:friends});

    } catch (err) {
        res.status(400).json({error: err.stack})
        console.error(err.stack);
    }
}

const GetInvitationFriendsAUser = async (req, res, next) => {
    try {
        var friends = await Invitation.find({userBase : req.query.id});
        res.status(200).json({data:friends});

    } catch (err) {
        res.status(400).json({error: err.stack})
        console.error(err.stack);
    }
}

const DeleteInvitationFriend = async (req, res, next) => {
    try {

        var friend = await Invitation.findOneAndDelete({userBase: req.user.id  , _id :req.params.id});
        res.status(200).json({data:friend});

    } catch (err) {
        res.status(400).json({error: err.stack})
        console.error(err.stack);
    }
}
const CheckInvitation = async (req, res, next) => {
    try {

        if (!validate.validateInviteCode(req.body.invitedCode)) {
          return   res.status(400).json({error:erorrs.phoneNumber_400});
        }
        var userBase = await User.findOne({invitedCode : req.body.invitedCode});
        if (!userBase || userBase.id === req.user.id)
        {
            return  res.status(400).json({error:erorrs.inviteCode_404});
        }
        var inviteCode = {
            userBase: userBase._id, /// کسی که دعوت کرده
            friend: req.user.id // کسی که دعوت شده
        }
        var newInviteCode = new Invitation(inviteCode);
        var invitedCodeSaved = await newInviteCode.save();
        res.status(200).json(invitedCodeSaved);

    } catch (err) {
        if (err.code === 11000) {
            res.status(422).json({error : erorrs.repetitive_422});
            console.error(err.stack);
        } else {
            res.status(400).json({error: err.stack})
            console.error(err.stack);
        }
    }
}

const checkInvitationCode = async ({ invitedCode, currentUserId }) => {
    // اعتبارسنجی فرمت کد دعوت
    if (!validate.validateInviteCode(invitedCode)) {
        return {
            success: false,
            error: erorrs.phoneNumber_400
        };
    }

    // پیدا کردن کاربر دعوت‌کننده
    const userBase = await User.findOne({ invitedCode });

    if (!userBase || userBase.id === currentUserId) {
        return {
            success: false,
            error: erorrs.inviteCode_404
        };
    }

    // ساخت دعوت‌نامه
    try {
        const inviteCodeObj = {
            userBase: userBase._id, // دعوت‌کننده
            friend: currentUserId   // دعوت‌شونده
        };

        const newInvite = new Invitation(inviteCodeObj);
        const savedInvite = await newInvite.save();
        userBase.finance += 20000 ;
        await userBase.save();

        return {
            success: true,
            data: savedInvite
        };

    } catch (err) {
        if (err.code === 11000) {
            return {
                success: false,
                error: erorrs.repetitive_422
            };
        }

        throw err; // خطای غیرمنتظره
    }
};


module.exports = {checkInvitationCode,GetInvitationFriendsAUser , CheckInvitation , GetInvitationFriends , DeleteInvitationFriend};