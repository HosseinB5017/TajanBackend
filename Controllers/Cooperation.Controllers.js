const Cooperation = require("../models/Cooperation");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Optional user extractor helper
const getOptionalUserId = async (req) => {
    try {
        const authHeader = req.headers.token || req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : (authHeader.includes(" ") ? authHeader.split(" ")[1] : authHeader);
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                if (decoded && decoded.id) {
                    const dbUser = await User.findById(decoded.id).select("_id isBlocked active");
                    if (dbUser && !dbUser.isBlocked && dbUser.active !== false) {
                        return dbUser._id;
                    }
                }
            }
        }
    } catch (e) {
        // Token invalid or expired, continue as guest
    }
    return null;
};

// 1) Create Cooperation Request
const createCooperation = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            cooperationType,
            shopNameOrSpecialty,
            cityOrRegion,
            experience,
            description
        } = req.body;

        if (!fullName || !phoneNumber || !cooperationType || !shopNameOrSpecialty) {
            return res.status(400).json({
                success: false,
                message: "فیلدهای fullName, phoneNumber, cooperationType و shopNameOrSpecialty الزامی هستند"
            });
        }

        const validTypes = ["shop", "driver", "technical", "other"];
        if (!validTypes.includes(cooperationType)) {
            return res.status(400).json({
                success: false,
                message: "مقدار cooperationType نامعتبر است. مقادیر مجاز: shop, driver, technical, other"
            });
        }

        let userId = req.user ? req.user.id : null;
        if (!userId) {
            userId = await getOptionalUserId(req);
        }

        const newCooperation = new Cooperation({
            user: userId || undefined,
            fullName,
            phoneNumber,
            cooperationType,
            shopNameOrSpecialty,
            cityOrRegion: cityOrRegion || "",
            experience: experience || "",
            description: description || "",
            status: "pending",
            adminNote: ""
        });

        const saved = await newCooperation.save();

        return res.status(201).json({
            success: true,
            message: "درخواست همکاری شما با موفقیت ثبت شد",
            data: saved
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "خطا در ثبت درخواست همکاری",
            error: error.message
        });
    }
};

// 2) Get Cooperation List (Admin)
const getCooperations = async (req, res) => {
    try {
        const {
            page = 1,
            perpage,
            limit,
            status,
            cooperationType,
            search
        } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(perpage || limit) || 20;
        const skip = (pageNum - 1) * limitNum;

        const filter = {};

        if (status && status !== "all") {
            filter.status = status;
        }

        if (cooperationType && cooperationType !== "all") {
            filter.cooperationType = cooperationType;
        }

        if (search && search.trim() !== "") {
            const regex = new RegExp(search.trim(), "i");
            filter.$or = [
                { fullName: regex },
                { phoneNumber: regex },
                { shopNameOrSpecialty: regex },
                { cityOrRegion: regex }
            ];
        }

        const total = await Cooperation.countDocuments(filter);
        const data = await Cooperation.find(filter)
            .populate("user", "fullName phoneNumber username avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const totalPages = Math.ceil(total / limitNum) || 1;

        return res.status(200).json({
            success: true,
            CountOfData: total,
            total,
            CountOfPage: totalPages,
            totalPages,
            currentPage: pageNum,
            page: pageNum,
            data
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت لیست درخواست‌های همکاری",
            error: error.message
        });
    }
};

// 3) Get Single Cooperation by ID (Admin)
const getCooperationById = async (req, res) => {
    try {
        const id = req.params.id || req.query.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "شناسه درخواست الزامی است"
            });
        }

        const cooperation = await Cooperation.findById(id).populate("user", "fullName phoneNumber username avatar");
        if (!cooperation) {
            return res.status(404).json({
                success: false,
                message: "درخواست همکاری یافت نشد"
            });
        }

        return res.status(200).json({
            success: true,
            data: cooperation
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "خطا در دریافت اطلاعات درخواست همکاری",
            error: error.message
        });
    }
};

// 4) Update Status and Note (Admin)
const updateCooperationStatus = async (req, res) => {
    try {
        const id = req.params.id || req.body.id;
        const { status, adminNote } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "شناسه درخواست الزامی است"
            });
        }

        const validStatuses = ["pending", "reviewed", "accepted", "rejected"];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "وضعیت نامعتبر است. مقادیر مجاز: pending, reviewed, accepted, rejected"
            });
        }

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (adminNote !== undefined) updateData.adminNote = adminNote;

        const updated = await Cooperation.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: "درخواست همکاری یافت نشد"
            });
        }

        return res.status(200).json({
            success: true,
            message: "وضعیت درخواست با موفقیت تغییر کرد",
            data: updated
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "خطا در ویرایش وضعیت درخواست",
            error: error.message
        });
    }
};

// 5) Delete Cooperation (Admin)
const deleteCooperation = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.query.id;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "شناسه درخواست الزامی است"
            });
        }

        const deleted = await Cooperation.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "درخواست همکاری یافت نشد"
            });
        }

        return res.status(200).json({
            success: true,
            message: "درخواست با موفقیت حذف شد"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "خطا در حذف درخواست",
            error: error.message
        });
    }
};

module.exports = {
    createCooperation,
    getCooperations,
    getCooperationById,
    updateCooperationStatus,
    deleteCooperation
};
