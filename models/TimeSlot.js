// models/TimeSlot.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SlotSchema = new Schema({
    startTime: { type: String, required: true }, // فرمت '08:00'
    endTime: { type: String, required: true },   // فرمت '09:00'
    capacity: { type: Number, required: true },
    remaining: { type: Number }
 }); // بدون _id جدا برای هر تایم


const TimeSlotSchema = new Schema({
    day: { type: Date, required: true },        // روز تایم اسلات‌ها
    slots: { type: [SlotSchema], default: [] }, // آرایه تایم اسلات‌های روز
    active: { type: Boolean, default: true },
    sourceTemplateId: { type: Schema.Types.ObjectId, default: null },
}, { timestamps: true });

// مقداردهی remaining برابر capacity هنگام save
TimeSlotSchema.pre("save", function (next) {
    this.slots.forEach(slot => {
        if (slot.remaining === undefined || slot.remaining === null) {
            slot.remaining = slot.capacity;
        }
    });
    next();
});

// ایندکس روی روز و فعال بودن
TimeSlotSchema.index({ day: 1, active: 1 });

module.exports = mongoose.model("TimeSlot", TimeSlotSchema);
