const erorrs = require("../Erorrs.js");
const ObjectModel = require("../models/TimeSlot"); // مدل جدید تاریخ‌محور

// ایجاد اسلات جدید
const CreateTimeSlot = async (req, res) => {
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

// بروزرسانی
const UpdateTimeSlot = async (req, res) => {
    try {
        const updatedSlot = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedSlot)
            return res.status(404).json({ error: erorrs.notFound_404 });

        res.status(200).json(updatedSlot);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

// دریافت اسلات‌های فعال در بازه زمانی (پیش‌فرض: امروز تا 7 روز آینده)
const GetTimeSlots = async (req, res) => {
    try {
        const now = new Date();

        const fromQ = req.query.from ? new Date(req.query.from) : new Date();
        const from = new Date(fromQ.getFullYear(), fromQ.getMonth(), fromQ.getDate(), 0, 0, 0, 0);

        let to;
        if (req.query.to) {
            const toQ = new Date(req.query.to);
            to = new Date(toQ.getFullYear(), toQ.getMonth(), toQ.getDate(), 23, 59, 59, 999);
        } else {
            const tmp = new Date(from);
            tmp.setDate(tmp.getDate() + 7);
            to = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 23, 59, 59, 999);
        }

        const days = await ObjectModel.find(
            { active: true, day: { $gte: from, $lte: to } },
            { day: 1, meta: 1, slots: 1 }
        ).sort({ day: 1 });

        const result = days.reduce((acc, d) => {
            const dbDay = new Date(d.day);
            const dayLocal = new Date(
                dbDay.getUTCFullYear(),
                dbDay.getUTCMonth(),
                dbDay.getUTCDate(),
                0, 0, 0, 0
            );

            const isSameDay =
                dayLocal.getFullYear() === now.getFullYear() &&
                dayLocal.getMonth() === now.getMonth() &&
                dayLocal.getDate() === now.getDate();

            const validSlots = (d.slots || []).filter(s => {
                if (!s || s.remaining <= 0) return false;

                // اگر امروز نیست، همه slotها بازند
                if (!isSameDay) return true;

                // cutoff ساعت 19:00
                const cutoff = new Date(
                    dayLocal.getFullYear(),
                    dayLocal.getMonth(),
                    dayLocal.getDate(),
                    19, 0, 0, 0
                );

                return now < cutoff;
            });

            if (validSlots.length > 0) {
                acc.push({
                    _id: d._id,
                    day: d.day,
                    meta: d.meta,
                    slots: validSlots
                });
            }
            return acc;
        }, []);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


// همه اسلات‌ها با صفحه‌بندی
const GetAllTimeSlots = async (req, res) => {
    try {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let perpage = req.query.perpage ? parseInt(req.query.perpage) : 10;

        const options = {
            skip: (page - 1) * perpage,
            limit: perpage,
        };

        const result = await ObjectModel.find({}, {}, options).sort({ startDate: 1 });
        const count = await ObjectModel.countDocuments();

        res.status(200).json({
            CountOfPage: Math.ceil(count / perpage),
            CountOfData: result.length,
            data: result,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// گرفتن اسلات با id
const GetTimeSlotById = async (req, res) => {
    try {
        const slot = await ObjectModel.findById(req.query.id);
        if (!slot) return res.status(404).json({ error: erorrs.notFound_404 });

        res.status(200).json(slot);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// حذف واقعی
const DeleteTimeSlot = async (req, res) => {
    try {
        const deleted = await ObjectModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: erorrs.notFound_404 });

        res.status(200).json({ message: "باموفقیت حذف شد" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// حذف نرم (غیرفعال‌سازی)
const DeleteSlotTimesFromDB = async (req, res) => {
    try {
        const result = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            { $set: { active: false } },
            { new: true }
        );
        if (!result) return res.status(404).json({ error: erorrs.notFound_404 });

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    CreateTimeSlot,
    UpdateTimeSlot,
    GetTimeSlots,
    GetTimeSlotById,
    DeleteTimeSlot,
    GetAllTimeSlots,
    DeleteSlotTimesFromDB,
};
