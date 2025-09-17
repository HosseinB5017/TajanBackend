const mongoose = require("mongoose");
const schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
    {
        title: {type: String, required: false ,default : 0 },
        index : {type : Number , required : false , default : 0},
        wastes : [{
                item: {type: schema.Types.ObjectId, ref: 'Waste'},
                count: {type:  Number, default: 0}
        }],
        address : {type : schema.Types.ObjectId , ref : "Address"},
        user : {type : schema.Types.ObjectId , ref : "user"},
        totalPrice : {type : Number , default :0},

    },
    {timestamps: true},
);


module.exports = mongoose.model("OrderSchema", OrderSchema);