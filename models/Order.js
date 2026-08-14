const mongoose = require("mongoose");
const schema = mongoose.Schema;
const autoIncrement = require('mongoose-sequence')(mongoose); // Add this line to import the plugin

const OrderSchema = new mongoose.Schema(
    {
        orderId : {type : Number , required : false , default : 0},
        wastes : [{
                item: {type: schema.Types.ObjectId, ref: 'Waste'},
                count: {type:  Number, default: 0},
                price: {type: Number, default: 0},       // قیمت واحد لحظه ثبت سفارش (snapshot)
                title: {type: String, default: ''}        // نام پسماند لحظه ثبت سفارش (snapshot)
        }],
        address : {type : schema.Types.ObjectId , ref : "Address"},
        user : {type : schema.Types.ObjectId , ref : "User"},
        totalPrice : {type : Number , default :0},
        timeSlot: { type: schema.Types.ObjectId, ref: "TimeSlot", required: true },
        slot: { type: schema.Types.ObjectId, ref: "SlotSchema", required: true },
        active: { type: Boolean, default: true },    // فعال/غیرفعال
        status : {
                    type: String,
                    enum: ["pending", "collected", "cancelled"],
                    default: "pending",
            },
        recciveTime : {type : Date , required : false},
        desc : {type : String , default:''}
    },
    {timestamps: true},
);

OrderSchema.plugin(autoIncrement, { inc_field: 'orderId' });
module.exports = mongoose.model("Order", OrderSchema);