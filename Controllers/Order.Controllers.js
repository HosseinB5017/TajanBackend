const erorrs = require("../Erorrs.js");
const ObjectModel = require("../models/Order"); // مدل TimeSlot
const collection = require("../Utils/Collections");
const UserModel = require("../models/User");
const WasteModel = require("../models/Waste")
const Address = require("../models/UserAdress");
const TimeSlot = require("../models/TimeSlot");
const smsController = require("../Utils/SmSController");

const CreateOrder = async (req, res, next) => {
        try {
            // 1️⃣ چک کردن یوزر
            const user = await UserModel.findById(req.user.id);
            if (!user) return res.status(400).json({error: erorrs.userFound_404});

            // 2️⃣ چک کردن آدرس
            const addrs = await Address.findById(req.body.address);
            if (!addrs) return res.status(400).json({error: erorrs.AddressIsWrong});

            // 3️⃣ پیدا کردن تایم‌اسلات و اسلات خاص
            const timeSlot = await TimeSlot.findOne(
                {"slots._id": req.body.slot, "slots.remaining": {$gt: 0}},
                {"slots.$": 1} // فقط همون اسلات
            );

            if (!timeSlot || timeSlot.slots.length === 0) {
                return res.status(400).json({error: "این بازه معتبر نیست یا ظرفیت پر شده است"});
            }

            // 4️⃣ کم کردن ظرفیت از اسلات انتخاب‌شده
            await TimeSlot.updateOne(
                {"slots._id": req.body.slot},
                {$inc: {"slots.$.remaining": -1}}
            );

            // 5️⃣ ساخت سفارش با نگه‌داری هر دو ID
            const requestObj = {
                address: req.body.address,
                timeSlot: timeSlot._id, // شناسه روز
                slot: req.body.slot,    // شناسه بازه ساعتی
                user: req.user.id
            };

            const newOrder = await new ObjectModel(requestObj).save();

            //RegisterOrderforUser
            smsController.sendCreateOrderForUser(user.username, newOrder.orderId).then((data) => {
                console.log('SMS sent successfully: sendCreateOrderForUser', data);
            }).catch((error) => {
                console.error('Failed to send SMS: sendCreateOrderForUser', error.message);
            });

            /// RecciveOrderForDriver
            smsController.RecciveOrderForDriver( newOrder.orderId).then((data) => {
                console.log('SMS sent successfully: RecciveOrderForDriver', data);
            }).catch((error) => {
                console.error('Failed to send SMS: RecciveOrderForDriver', error.message);
            });


            //RegisterOrderForAdmin
            smsController.RecciveOrderForAdmin( newOrder.orderId).then((data) => {
                console.log('SMS sent successfully: RecciveOrderForAdmin', data);
            }).catch((error) => {
                console.error('Failed to send SMS: RecciveOrderForAdmin', error.message);
            });




            // 6️⃣ برگرداندن سفارش با populate
            const resultObj = await ObjectModel.findById(newOrder._id)
                .populate("user")
                .populate("address")
                .populate("timeSlot");

            res.status(200).json(resultObj);

        } catch (error) {
            if (error.code === 11000) {
                res.status(422).json({error: erorrs.repetitive_422});
            } else {
                res.status(400).json({error: error.message});
            }
        }
};



const UpdateOrder = async (req, res, next) => {
    try {
        const updateData = { ...req.body };

        // اگر wastes ارسال شده، قیمت لحظه‌ای هر آیتم رو snapshot بگیر
        if (updateData.wastes && Array.isArray(updateData.wastes)) {
            let total = 0;
            const enrichedWastes = [];
            for (let w of updateData.wastes) {
                const wasteItem = await WasteModel.findById(w.item);
                const snapshotPrice = wasteItem ? (wasteItem.price || 0) : 0;
                const snapshotTitle = wasteItem ? (wasteItem.title || '') : '';
                total += snapshotPrice * (w.count || 0);
                enrichedWastes.push({
                    item: w.item,
                    count: w.count || 0,
                    price: snapshotPrice,
                    title: snapshotTitle
                });
            }
            updateData.wastes = enrichedWastes;
            updateData.totalPrice = Math.round(total);
        }

        const updatedOrder = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!updatedOrder)
            return res.status(200).json({ error: erorrs.notFound_404 });

        const resultObj = await ObjectModel.findById(updatedOrder._id)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item");

        res.status(200).json(resultObj);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};


const CancelOrder = async (req, res, next) => {
    try {
        const updatedOrder = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            {
                status: "cancelled",
                desc: req.body.desc,
                recciveTime : new Date()
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        const resultObj = await ObjectModel.findById(updatedOrder._id)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item");

        res.status(200).json(resultObj);

    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

const ReceiveOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { wastes, desc } = req.body;

        const order = await ObjectModel.findById(orderId).populate("wastes.item");
        if (!order)
            return res.status(404).json({ error: erorrs.OrderNotExist });

        const user = await UserModel.findById(order.user);
        if (!user)
            return res.status(400).json({ error: erorrs.userFound_404 });

        const wasCollectedBefore = order.status === "collected";

        // اگر قبلاً جمع‌آوری شده بود → برگشت مقادیر قبلی
        if (wasCollectedBefore) {
            user.finance -= order.totalPrice || 0;
            user.score -= 5;
            if (user.score < 0) user.score = 0;
        }

        // آپدیت سفارش
        order.wastes = wastes;
        order.desc = desc;

        // محاسبه مجدد totalPrice و snapshot قیمت لحظه‌ای هر آیتم
        let total = 0;
        const enrichedWastes = [];
        for (let w of wastes) {
            const wasteItem = await WasteModel.findById(w.item);
            const snapshotPrice = wasteItem ? (wasteItem.price || 0) : 0;
            const snapshotTitle = wasteItem ? (wasteItem.title || '') : '';
            total += snapshotPrice * (w.count || 0);
            enrichedWastes.push({
                item: w.item,
                count: w.count || 0,
                price: snapshotPrice,
                title: snapshotTitle
            });
        }
        order.wastes = enrichedWastes;
        order.totalPrice = Math.round(total);

        // اضافه کردن مقادیر جدید
        user.finance += Math.round(total);
        user.score += 5;

        // وضعیت و زمان دریافت
        order.status = "collected";
        order.receiveTime = new Date();

        await user.save();
        await order.save();

        const updatedOrder = await ObjectModel.findById(orderId)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item");


        const amountText = Intl.NumberFormat('fa-IR', {
            maximumFractionDigits: 0
        }).format(order.totalPrice || 0) + " هزار تومان";

        // ارسال SMS فقط بعد از موفقیت
        smsController
            .ChargeWalletForUser(user.username, amountText)
            .then((data) => {
                console.log('SMS sent successfully: ChargeWalletForUser', data);
            })
            .catch((error) => {
                console.error('Failed to send SMS: ChargeWalletForUser', error.message);
            });

        res.status(200).json(updatedOrder);

    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
};

const GetOrders = async (req, res, next) => {
    try {
        let filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.user) filter.user = req.query.user;

        let page = parseInt(req.query.page) || 1;
        let perpage = parseInt(req.query.perpage) || 10;

        // 1️⃣ گرفتن سفارش‌ها
        const result = await ObjectModel.find(filter)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perpage)
            .limit(perpage);

        // 2️⃣ اضافه کردن selectedSlot به هر سفارش
        const enriched = result.map(order => {
            const selectedSlot = order.timeSlot?.slots.id(order.slot) || null;
            return {
                ...order.toObject(),
                selectedSlot
            };
        });

        // 3️⃣ شمارش کل داده‌ها برای صفحه‌بندی
        const count = await ObjectModel.countDocuments(filter);

        // 4️⃣ فیلتر فقط user.activeAddress اگر لازم است
        const filtered = enriched.filter(order => order.user && order.user.activeAddress);

        res.status(200).json({
            CountOfPage: Math.ceil(count / perpage),
            CountOfData: filtered.length,
            data: filtered
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const GetOrdersBySortTime = async (req, res) => {
    try {
        let filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.user) filter.user = new mongoose.Types.ObjectId(req.query.user);

        let page = parseInt(req.query.page) || 1;
        let perpage = parseInt(req.query.perpage) || 10;

        if  (req.query.status != "pending" )
        {
            const result = await ObjectModel.find(filter)
                .populate("user")
                .populate("address")
                .populate("timeSlot")
                .populate("wastes.item")
                .sort({ createdAt: -1 })
                .skip((page - 1) * perpage)
                .limit(perpage);

            // 2️⃣ اضافه کردن selectedSlot به هر سفارش
            const enriched = result.map(order => {
                const selectedSlot = order.timeSlot?.slots.id(order.slot) || null;
                return {
                    ...order.toObject(),
                    selectedSlot
                };
            });

            // 3️⃣ شمارش کل داده‌ها برای صفحه‌بندی
            const count = await ObjectModel.countDocuments(filter);

            // 4️⃣ فیلتر فقط user.activeAddress اگر لازم است
            const filtered = enriched.filter(order => order.user && order.user.activeAddress);

            res.status(200).json({
                CountOfPage: Math.ceil(count / perpage),
                CountOfData: filtered.length,
                data: filtered
            });
        }
        else {
            const data = await ObjectModel.aggregate([
                {$match: filter},

                // join timeSlot
                {
                    $lookup: {
                        from: "timeslots",
                        localField: "timeSlot",
                        foreignField: "_id",
                        as: "timeSlot"
                    }
                },
                {$unwind: "$timeSlot"},

                // 🔥 سورت بر اساس روز
                {$sort: {"timeSlot.day": 1}},

                // pagination
                {$skip: (page - 1) * perpage},
                {$limit: perpage},

                // join user
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {$unwind: "$user"},

                // join address
                {
                    $lookup: {
                        from: "addresses",
                        localField: "address",
                        foreignField: "_id",
                        as: "address"
                    }
                },
                {$unwind: "$address"},
            ]);

            // اضافه کردن selectedSlot
            const enriched = data.map(order => {
                const selectedSlot =
                    order.timeSlot?.slots?.find(s => s._id.toString() === order.slot.toString()) || null;
                return {...order, selectedSlot};
            });

            const count = await ObjectModel.countDocuments(filter);

            res.status(200).json({
                CountOfPage: Math.ceil(count / perpage),
                CountOfData: enriched.length,
                data: enriched
            });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const GetOrdersMe = async (req, res, next) => {
    try {
        let filter = {user : req.user.id};
        if (req.query.status) filter.status = req.query.status;
        let page = parseInt(req.query.page) || 1;
        let perpage = parseInt(req.query.perpage) || 10;

        console.log(req.user.id);

        // 1️⃣ گرفتن سفارش‌ها
        const result = await ObjectModel.find(filter)
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perpage)
            .limit(perpage);

        // 2️⃣ اضافه کردن selectedSlot به هر سفارش
        const enriched = result.map(order => {
            const selectedSlot = order.timeSlot?.slots.id(order.slot) || null;

            return {
                ...order.toObject(),
                selectedSlot
            };
        });

        // 3️⃣ شمارش کل داده‌ها برای صفحه‌بندی
        const count = await ObjectModel.countDocuments(filter);

        // 4️⃣ فیلتر فقط user.activeAddress اگر لازم است

        const cleaned = enriched.map(order => {
            const obj = order.toObject ? order.toObject() : { ...order }; // اگه mongoose doc بود
            if (obj.timeSlot) {
                delete obj.timeSlot.slots;
            }
            return obj;
        });

        res.status(200).json({
            CountOfPage: Math.ceil(count / perpage),
            CountOfData: cleaned.length,
            data: cleaned
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const GetOrderById = async (req, res, next) => {
    try {
        const order = await ObjectModel.findById(req.query.id)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item")

        if (!order) return res.status(404).json({ error: erorrs.notFound_404 });

        // پیدا کردن اسلات انتخاب‌شده
        const selectedSlot = order.timeSlot?.slots.id(order.slot) || null;

        res.status(200).json({
            ...order.toObject(),
            selectedSlot
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const DeleteOrderFromDb = async (req, res, next) => {
    try {
        const deleted = await ObjectModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(200).json({ error: erorrs.notFound_404 });

        res.status(200).json({ message: "سفارش باموفقیت حذف شد" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const DeleteOrder = async (req, res, next) => {
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
    CreateOrder,
    UpdateOrder,
    GetOrders,
    GetOrderById,
    DeleteOrder,
    DeleteOrderFromDb,
    ReceiveOrder,
    GetOrdersMe,
    CancelOrder,
    GetOrdersBySortTime
};

