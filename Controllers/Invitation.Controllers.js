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
            userBase: userBase._id,
            friend: req.user.id
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


module.exports = {CheckInvitation , GetInvitationFriends , DeleteInvitationFriend};