const mongoose = require("mongoose");
const schema = mongoose.Schema;

const TicketSchema = new mongoose.Schema(
    {
        user : {type: schema.Types.ObjectId , ref : 'user'},
        typeTicket: {type: String, required: false},
        title: {type: String, required: false},
        desc: {type: String, required: false},
        files:{type: Array , required : false},
        status: {
               type: String,
               required: false,
               enum: ['open', 'pending', 'closed'],
               default: 'pending'
            },
        Response:[
                {
                 id: {type : Number , required : false , default : 0},
                 role: {type : String  , required : true },
                 author: { type: String, required: true }, // 'پشتیبانی' یا 'کاربر'
                 text: { type: String, required: true },
                 createdAt: { type: Date, default: Date.now }
                }]
    },
    {timestamps: true},
);


module.exports = mongoose.model("TicketSchema", TicketSchema);