const mongoose = require("mongoose");
const schema = mongoose.Schema;

const TimeSlotSchema = new mongoose.Schema(
    {
            dayOfWeek: {
                    type: String,
                    enum: ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"],
                    required: true,
            },
            startTime: { type: String, required: true }, // "09:00"
            endTime: { type: String, required: true },   // "11:00"
            capacity: { type: Number, required: true },  // ظرفیت کل
            remaining: { type: Number, required: false , default: 10 }, // ظرفیت باقی‌مانده
            active: { type: Boolean, default: true },    // فعال/غیرفعال
    },
    { timestamps: true }
);

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
