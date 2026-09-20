const erorrs = require("../Erorrs");
const objectModel = require("../models/Withdrawal");
const UserInfo = require("../models/User");
const Transaction = require("../models/Transaction");
const smsController = require("../Utils/SmSController");


const RequestWithdrawal = async (req, res) => {
    try {
        const { amount, method, description , name } = req.body;
        const numericAmount = Number(amount);
        const withdrawalUser = await UserInfo.findById(req.user.id);
        if (!withdrawalUser)
            return res.status(400).json({ error: erorrs.userFound_404 });

        if (!numericAmount || numericAmount <= 0) {
            return res.status(400).json({ error: erorrs.costIsLessThanThreshold || "مبلغ نامعتبر است" });
        }

        if (withdrawalUser.finance < numericAmount)
            return res.status(400).json({ error: erorrs.notEnoughCash });

        // چک کردن برای حداقل مبلغ برداشت
        if (numericAmount < (Number(process.env.withdraThreshold) || 0)) {
            return res.status(400).json({ error: erorrs.costIsLessThanThreshold });
        }

        // کسر موجودی از کیف پول کاربر هنگام ثبت درخواست برداشت
        withdrawalUser.finance -= numericAmount;
        await withdrawalUser.save();

        const withdrawal = new objectModel({
            user: req.user.id,
            amount: numericAmount,
            method,
            description,
            name
        });

        await withdrawal.save();

        // ثبت تراکنش کسر از کیف پول برای برداشت
        await new Transaction({
            user: req.user.id,
            type: "withdrawal",
            direction: "out",
            amount: numericAmount,
            title: `درخواست برداشت وجه #${withdrawal.id !== undefined ? withdrawal.id : withdrawal._id}`,
            description: description || "ثبت درخواست برداشت وجه از کیف پول",
            referenceId: String(withdrawal.id !== undefined ? withdrawal.id : withdrawal._id),
            orderId: String(withdrawal.id !== undefined ? withdrawal.id : withdrawal._id),
            status: "successful",
            balanceAfter: withdrawalUser.finance
        }).save();

        //RegisterWithdrawalForUser
        const amountText = Intl.NumberFormat('fa-IR', {
            maximumFractionDigits: 0
        }).format(numericAmount || 0) + " هزار";
    /// تومان داخل پیامک هس در ملی پیامک
        console.log(amountText)

        smsController.WithdrawalForUser(withdrawalUser.username , amountText).then((data) => {
            console.log('SMS sent successfully: WithdrawalForUser', data);
        }).catch((error) => {
            console.error('Failed to send SMS: WithdrawalForUser', error.message);
        });


        //RecciveWithdrawl
        smsController.RecciveWithdrawalForAdmin(numericAmount).then((data) => {
            console.log('SMS sent successfully: RecciveWithdrawalForAdmin', data);
        }).catch((error) => {
            console.error('Failed to send SMS: RecciveWithdrawalForAdmin', error.message);
        });


        res.status(200).json({
            message: "درخواست برداشت ثبت شد",
            data: withdrawal
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const UpdateWithdrawal = async (req, res, next) => {
    try {
        const updatedOrder = await objectModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedOrder)
            return res.status(200).json({ error: erorrs.notFound_404 });

        const resultObj = await objectModel.findById(updatedOrder._id);

        res.status(200).json(resultObj);
    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

// 2) تایید یا رد برداشت توسط ادمین
const ApproveWithdrawal = async (req, res) => {
    try {
        const { status, description } = req.body; // status = "approved" یا "rejected"

        const withdrawal = await objectModel.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        if (withdrawal.status !== "pending") {
            return res.status(400).json({ error: "این درخواست قبلاً تعیین وضعیت شده است" });
        }

        const withdrawalUser = await UserInfo.findById(withdrawal.user);
        if (!withdrawalUser) {
            return res.status(404).json({ error: erorrs.userFound_404 });
        }

        // اگر رد شد، مبلغ به کیف پول کاربر عودت داده شود
        if (status === "rejected") {
            withdrawalUser.finance = (withdrawalUser.finance || 0) + withdrawal.amount;
            await withdrawalUser.save();

            // ثبت تراکنش بازگشت وجه در تاریخچه تراکنش‌ها
            await new Transaction({
                user: withdrawalUser._id,
                type: "deposit",
                direction: "in",
                amount: withdrawal.amount,
                title: `برگشت وجه برداشت #${withdrawal.id !== undefined ? withdrawal.id : withdrawal._id}`,
                description: description || "برگشت وجه به دلیل رد درخواست برداشت",
                referenceId: String(withdrawal.id !== undefined ? withdrawal.id : withdrawal._id),
                orderId: String(withdrawal.id !== undefined ? withdrawal.id : withdrawal._id),
                status: "successful",
                balanceAfter: withdrawalUser.finance
            }).save();
        }

        withdrawal.status = status;
        withdrawal.adminDescription = description || "";
        withdrawal.processTime = new Date();

        await withdrawal.save();

        if (status === "approved") {
            //ApproveForUser
            smsController.WithdrawalConfirmationForUser(withdrawalUser.username , withdrawal.amount).then((data) => {
                console.log('SMS sent successfully: WithdrawalConfirmationForUser', data);
            }).catch((error) => {
                console.error('Failed to send SMS: WithdrawalConfirmationForUser', error.message);
            });
        }
        res.status(200).json({
            message: `درخواست برداشت ${status === "approved" ? "تایید" : "رد"} شد`,
            data: withdrawal
        });

   

        res.status(200).json({
            message: `درخواست برداشت ${status === "approved" ? "تایید" : "رد"} شد`,
            data: withdrawal
        });

    }catch (error) {
        res.status(400).json({ error: error.message });
    }
};



/////update role just by admin
//DELETE
const DeleteWithdrawalFromDb = async (req, res) => {
    try {
        const thisObject  = await objectModel.findByIdAndDelete(req.params.id);
        if (thisObject)
            res.status(200).json(thisObject);
        else
            res.status(404).json("object not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const DeleteWithdrawal = async (req, res, next) => {
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

const GetWithdrawalById = async (req, res, next) => {
    try {
        const idParam = req.params.id || req.query.id;
        if (!idParam) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        let query = {};
        if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idParam };
        } else if (!isNaN(Number(idParam))) {
            query = { id: Number(idParam) };
        } else {
            query = { _id: null };
        }

        const withdrawal = await objectModel.findOne(query).populate("user");
        if (!withdrawal) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        const doc = withdrawal.toObject();
        const userObj = doc.user ? {
            _id: doc.user._id,
            name: doc.user.name || "",
            lastName: doc.user.lastName || "",
            phoneNumber: doc.user.phoneNumber || doc.user.username || ""
        } : null;

        const shabaVal = doc.shaba || doc.iban || doc.user?.shaba || "";
        const ibanVal = doc.iban || doc.shaba || doc.user?.shaba || "";

        const formattedData = {
            _id: doc._id,
            id: doc.id !== undefined ? doc.id : doc._id,
            name: doc.name || (userObj ? `${userObj.name} ${userObj.lastName}`.trim() : ""),
            amount: doc.amount,
            shaba: shabaVal,
            iban: ibanVal,
            status: doc.status,
            description: doc.description || "",
            adminDescription: doc.adminDescription || "",
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            user: userObj
        };

        return res.status(200).json({
            data: formattedData
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const FoundWithdrawal = async (req, res, next) => {
    try {
        const idParam = req.query.id || req.params.id;
        if (!idParam) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        let query = {};
        if (idParam.match(/^[0-9a-fA-F]{24}$/)) {
            query = { _id: idParam };
        } else if (!isNaN(Number(idParam))) {
            query = { id: Number(idParam) };
        } else {
            query = { _id: null };
        }

        const withdrawal = await objectModel.findOne(query).populate("user");
        if (!withdrawal) {
            return res.status(404).json({ error: erorrs.notFound_404 });
        }

        const doc = withdrawal.toObject();
        const userObj = doc.user ? {
            _id: doc.user._id,
            name: doc.user.name || "",
            lastName: doc.user.lastName || "",
            phoneNumber: doc.user.phoneNumber || doc.user.username || ""
        } : null;

        const shabaVal = doc.shaba || doc.iban || doc.user?.shaba || "";
        const ibanVal = doc.iban || doc.shaba || doc.user?.shaba || "";

        const formattedData = {
            _id: doc._id,
            id: doc.id !== undefined ? doc.id : doc._id,
            name: doc.name || (userObj ? `${userObj.name} ${userObj.lastName}`.trim() : ""),
            amount: doc.amount,
            shaba: shabaVal,
            iban: ibanVal,
            status: doc.status,
            description: doc.description || "",
            adminDescription: doc.adminDescription || "",
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            user: userObj
        };

        return res.status(200).json({
            data: formattedData
        });
    } catch (err) {
        return res.status(500).json(err);
    }
};



const GetWithdrawalOfUser = async (req, res, next) => {
    try {
        let filter = {};
        if (req.query.status) filter.status = req.query.status;

        filter.user = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;

        let sort = { id: -1, _id: -1 };
        if (req.query.id !== undefined) {
            const idOrder = parseInt(req.query.id) === 1 ? 1 : -1;
            sort = { id: idOrder, _id: idOrder };
        }

        const skip = (page - 1) * perpage;
        const count = await objectModel.countDocuments(filter);

        const result = await objectModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(perpage);

        res.status(200).json({
            data: result,
            CountOfData: count,
            CountOfPage: Math.ceil(count / perpage),
            page: page,
            perpage: perpage
        });

    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const GetWithdrawals = async (req, res, next) => {
   try {
        let filter = {};

        if (req.query.status) filter.status = req.query.status;

        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;

        let sort = { id: -1, _id: -1 };
        if (req.query.id !== undefined) {
            const idOrder = parseInt(req.query.id) === 1 ? 1 : -1;
            sort = { id: idOrder, _id: idOrder };
        }

        const skip = (page - 1) * perpage;
        const count = await objectModel.countDocuments(filter);

        const result = await objectModel.find(filter)
            .populate("user")
            .sort(sort)
            .skip(skip)
            .limit(perpage);

        res.status(200).json({
            data: result,
            CountOfData: count,
            CountOfPage: Math.ceil(count / perpage),
            page: page,
            perpage: perpage
        });

     } catch (error) {
         res.status(400).json({error: error.message});
     }
};

module.exports = { RequestWithdrawal  ,UpdateWithdrawal, ApproveWithdrawal , DeleteWithdrawal  , DeleteWithdrawalFromDb,FoundWithdrawal , GetWithdrawals , GetWithdrawalOfUser, GetWithdrawalById }
