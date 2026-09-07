const Transaction = require("../models/Transaction");
const erorrs = require("../Erorrs");

// Get current user's transactions
const getMyTransactions = async (req, res) => {
    try {
        const { page = 1, perpage = 20, limit, type, direction, status } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(perpage) || parseInt(limit) || 20;

        const filter = { user: req.user.id };

        if (type) {
            filter.type = type;
        }

        if (direction) {
            filter.direction = direction;
        }

        if (status) {
            filter.status = status;
        }

        const skip = (pageNum - 1) * limitNum;
        const total = await Transaction.countDocuments(filter);
        const transactions = await Transaction.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json({
            success: true,
            data: transactions,
            total,
            CountOfData: total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Admin: Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const { page = 1, perpage = 20, limit, type, direction, userId } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(perpage) || parseInt(limit) || 20;

        const filter = {};
        if (userId) filter.user = userId;
        if (type) filter.type = type;
        if (direction) filter.direction = direction;

        const skip = (pageNum - 1) * limitNum;
        const total = await Transaction.countDocuments(filter);
        const transactions = await Transaction.find(filter)
            .populate("user", "username name lastName")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        return res.status(200).json({
            success: true,
            data: transactions,
            total,
            CountOfData: total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getMyTransactions,
    getAllTransactions
};
