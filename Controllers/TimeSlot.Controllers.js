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

        // 1) normalize from => start of day (00:00:00)
        const fromQ = req.query.from ? new Date(req.query.from) : new Date();
        const from = new Date(fromQ.getFullYear(), fromQ.getMonth(), fromQ.getDate(), 0, 0, 0, 0);

        // 2) normalize to => end of day (23:59:59.999)
        let to;
        if (req.query.to) {
            const toQ = new Date(req.query.to);
            to = new Date(toQ.getFullYear(), toQ.getMonth(), toQ.getDate(), 23, 59, 59, 999);
        } else {
            const tmp = new Date(from);
            tmp.setDate(tmp.getDate() + 7); // 7 روز بعد
            to = new Date(tmp.getFullYear(), tmp.getMonth(), tmp.getDate(), 23, 59, 59, 999);
        }

        // 3) پیدا کردن اسناد روزها بر اساس day (که معمولاً نیمه‌شب ذخیره شده)
        const days = await ObjectModel.find({
            active: true,
            day: { $gte: from, $lte: to }
        }).sort({ day: 1 });

        // 4) فیلتر اسلات‌ها: اگر همون روزه، فقط اسلات‌هایی که endTime > now را نگه دار
        const result = days.map(d => {
            // تضمین اینکه day به صورت Date است
            const dayDate = new Date(d.day);
            const isSameDay = dayDate.getFullYear() === now.getFullYear()
                && dayDate.getMonth() === now.getMonth()
                && dayDate.getDate() === now.getDate();

            const validSlots = d.slots.filter(s => {
                if (!s || s.remaining <= 0) return false;

                // ساخت زمان پایان اسلات بر پایه تاریخِ آن روز (استفاده از local time constructor)
                const [endHour, endMin] = (s.endTime || "00:00").split(':').map(Number);
                const slotEnd = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), endHour, endMin, 0, 0);

                return isSameDay ? (slotEnd > now) : true;
            });

            return {
                _id: d._id,
                day: d.day,
                meta: d.meta,
                slots: validSlots
            };
        }).filter(d => d.slots.length > 0); // حذف روزهایی بدون اسلات معتبر

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
        const slot = await ObjectModel.findById(req.params.id);
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
