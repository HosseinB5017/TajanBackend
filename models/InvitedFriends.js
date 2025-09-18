const mongoose = require("mongoose");
const schema = mongoose.Schema;

const InvitedFriends = new mongoose.Schema(
    {
            userBase : {type: schema.Types.ObjectId , ref : 'User' , require: true},
            friend : {type: schema.Types.ObjectId , ref : 'User' , unique : true , require : true}
    });

module.exports = mongoose.model("InvitedFriends", InvitedFriends);
