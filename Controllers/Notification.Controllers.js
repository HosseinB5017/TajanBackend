const ShopNotification = require("../models/ShopNotification");

// Get notifications for current logged in user
const getNotifications = async (req, res) => {
    try {
        const { isRead, limit = 50 } = req.query;
        let filter = { recipient: req.user.id };

        if (isRead !== undefined) {
            filter.isRead = isRead === "true" || isRead === true;
        }

        const notifications = await ShopNotification.find(filter)
            .populate("shop", "name shopType")
            .populate("order", "orderId serviceType status")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        const unreadCount = await ShopNotification.countDocuments({
            recipient: req.user.id,
            isRead: false
        });

        return res.status(200).json({
            notifications,
            unreadCount
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await ShopNotification.findOne({
            _id: id,
            recipient: req.user.id
        });

        if (!notification) {
            return res.status(404).json({ error: "اعلان یافت نشد" });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        return res.status(200).json(notification);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Mark all as read
const markAllAsRead = async (req, res) => {
    try {
        await ShopNotification.updateMany(
            { recipient: req.user.id, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        return res.status(200).json({ message: "تمام اعلان‌ها به عنوان خوانده شده علامت‌گذاری شدند" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
