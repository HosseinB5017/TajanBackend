const erorrs = require("../Erorrs.js");
const ObjectModel = require("../models/Order"); // مدل TimeSlot
const collection = require("../Utils/Collections");
const UserModel = require("../models/User");
const WasteModel = require("../models/Waste")
const CreateOrder = async (req, res, next) => {
    try {
        var user =  await UserModel.findById(req.user.id);
        if (!user)
            return res.status(400).json({ error: erorrs.userFound_404 });

        var requestObj = {
            address : req.body.address,
            timeSlot : req.body.timeSlot,
            user : req.user.id
        }

        const result = new ObjectModel(requestObj);
        const newObject = await result.save();

        const resultObj = await ObjectModel.findById(newObject._id)
            .populate("user")
            .populate("address")
            .populate("timeSlot")

        res.status(200).json(resultObj);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

const UpdateOrder = async (req, res, next) => {
    try {
        const updatedOrder = await ObjectModel.findByIdAndUpdate(
            req.params.id,
            req.body,
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

const ReceiveOrder = async (req, res, next) => {
    try {
        const orderId = req.params.id;
        const { wastes } = req.body; // [{ item: 'id', count: n }, ...]

        const order = await ObjectModel.findById(orderId).populate("wastes.item");
        if (!order) return res.status(404).json({ error: erorrs.OrderNotExist });
        var user =  await UserModel.findById(order.user);
        if (!user)
            return res.status(400).json({ error: erorrs.userFound_404 });

        // 1. بروزرسانی لیست زباله‌ها
        order.wastes = wastes;
        order.desc = req.body.desc;
        // 2. محاسبه totalPrice
        let total = 0;
        for (let w of wastes) {
            const wasteItem = await WasteModel.findById(w.item);
            if (wasteItem) {
                total += (wasteItem.price || 0) * (w.count || 0);
            }
        }
        order.totalPrice = total;
        user.finance +=total;
        user.score +=5;/// امتیاز

        await user.save();

        // 3. تغییر وضعیت
        order.status = "collected";

        // 4. ثبت زمان دریافت توسط سفیر
        order.receiveTime = new Date();

        await order.save();

        const updatedOrder = await ObjectModel.findById(orderId)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item");

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

        const result = await ObjectModel.find(filter)
            .populate("user")
            .populate("address")
            .populate("timeSlot")
            .populate("wastes.item")
            .sort({ createdAt: -1 })
            .skip((page - 1) * perpage)
            .limit(perpage);

        // شمارش کل داده‌ها برای صفحه‌بندی
        const count = await ObjectModel.countDocuments(filter);

        // اگر خواستی می‌تونی فقط سفارش‌هایی که user.activeAddress داره فیلتر کنی:
        const filtered = result.filter(order => order.user && order.user.activeAddress);

        res.status(200).json({
            CountOfPage: Math.ceil(count / perpage),
            CountOfData: filtered.length,
            data: filtered
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
            .populate("wastes.item");

        if (!order) return res.status(200).json({ error: erorrs.notFound_404 });

        res.status(200).json(order);
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
    ReceiveOrder
};

