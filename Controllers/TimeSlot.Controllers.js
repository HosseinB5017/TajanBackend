const erorrs = require("../Erorrs.js");
const ObjectModel = require("../models/TimeSlot"); // مدل TimeSlot
const collection = require("../Utils/Collections");

const CreateTimeSlot = async (req, res, next) => {
    try {
        const result = new ObjectModel(req.body);
        const newObject = await result.save();
        const resultObj = await ObjectModel.findById(newObject._id);
        res.status(200).json(resultObj);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

const UpdateTimeSlot = async (req, res, next) => {
    try {
        const updatedSlot = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSlot)
            return res.status(200).json({ error: erorrs.notFound_404 });

        const resultObj = await ObjectModel.findById(updatedSlot._id);
        res.status(200).json(resultObj);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};
const GetTimeSlots = async (req, res, next) => {
    try {
        const now = new Date();
        const currentDayIndex = now.getDay(); // 0=یکشنبه ... 6=شنبه
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        // تبدیل روز هفته به فارسی

        const todayName = collection.dayMap[currentDayIndex];

        // همه تایم‌اسلات‌های فعال و دارای ظرفیت
        const slots = await ObjectModel.find({
            active: true,
            remaining: { $gt: 0 }
        }).sort({ dayOfWeek: 1, startTime: 1 });

        // فیلتر براساس زمان فعلی
        const validSlots = slots.filter(slot => {
            // اگر روز بعد از امروز باشه → اوکی
            if (slot.dayOfWeek !== todayName) return true;

            // روز امروز → باید ساعت بررسی بشه
            const [startHour, startMinute] = slot.startTime.split(":").map(Number);
            const [endHour, endMinute] = slot.endTime.split(":").map(Number);

            // زمان پایان اسلات
            const endDate = new Date();
            endDate.setHours(endHour, endMinute, 0, 0);

            // زمان فعلی + 1 ساعت
            const nowPlusOneHour = new Date();
            nowPlusOneHour.setHours(currentHour, currentMinute + 60, 0, 0);

            // شرط: هنوز تموم نشده باشه و حداقل 1 ساعت وقت داشته باشه
            return endDate > nowPlusOneHour;
        });

        res.status(200).json(validSlots);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const GetAllTimeSlots = async (req, res, next) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let perpage = req.query.perpage ? parseInt(req.query.perpage) : 10;

        const options = {
            skip: (page - 1) * perpage,
            limit: perpage
        };

        const result = await ObjectModel.find({}, {}, options).sort({ dayOfWeek: 1, startTime: 1 });
        const count = await ObjectModel.countDocuments();

        res.status(200).json({
            CountOfPage: Math.ceil(count / perpage),
            CountOfData: result.length,
            data: result
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const GetTimeSlotById = async (req, res, next) => {
    try {
        const slot = await ObjectModel.findById(req.query.id);
        if (!slot) return res.status(200).json({ error: erorrs.notFound_404 });

        res.status(200).json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const DeleteTimeSlot = async (req, res, next) => {
    try {
        const deleted = await ObjectModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(200).json({ error: erorrs.notFound_404 });

        res.status(200).json({ message: "باموفقیت حذف شد" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const DeleteSlotTimesFromDB = async (req, res, next) => {
    try {
        const result = await ObjectModel.findOneAndUpdate(
            {_id : req.params.id} ,
            { $set : {active : false}},
            {new : true}
        );
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

module.exports = {
    CreateTimeSlot,
    UpdateTimeSlot,
    GetTimeSlots,
    GetTimeSlotById,
    DeleteTimeSlot,
    GetAllTimeSlots,
    DeleteSlotTimesFromDB
};


