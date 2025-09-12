const mongoose = require("mongoose");
const schema = mongoose.Schema;

const City = new mongoose.Schema(
    {
            name: {
                fa : {type: String,  default: "" },
                en : {type: String,  default: "" }
            },
            state : {type: schema.Types.ObjectId , ref : 'State'}
    });

module.exports = mongoose.model("City", City);
