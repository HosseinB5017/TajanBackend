const erorrs = require("../Erorrs");
const objectModel = require("../models/Withdrawal");
const UserInfo = require("../models/User");
const smsController = require("../Utils/SmSController");


const RequestWithdrawal = async (req, res) => {
    try {
        const { amount, method, description , name } = req.body;
        const withdrawalUser = await UserInfo.findById(req.user.id);
        if (!withdrawalUser)
            return res.status(400).json({ error: erorrs.userFound_404 });

        if (withdrawalUser.finance < amount)
            return res.status(400).json({ error: erorrs.notEnoughCash });

        // چک کردن برای درخواست فعال برداشت
        if (!amount || amount < process.env.withdraThreshold) {
            return res.status(400).json({ error: erorrs.costIsLessThanThreshold });
        }

        const withdrawal = new objectModel({
            user: req.user.id,   // فرض می‌کنیم از توکن یوزر اومده
            amount,
            method,
            description,
            name
        });

        await withdrawal.save();


        //RegisterWithdrawalForUser
        const amountText = Intl.NumberFormat('fa-IR', {
            maximumFractionDigits: 0
        }).format(amount || 0) + " هزار";
    /// تومان داخل پیامک هس در ملی پیامک
        console.log(amountText)

        smsController.WithdrawalForUser(withdrawalUser.username , amountText).then((data) => {
            console.log('SMS sent successfully: WithdrawalForUser', data);
        }).catch((error) => {
            console.error('Failed to send SMS: WithdrawalForUser', error.message);
        });


        //RecciveWithdrawl
        smsController.RecciveWithdrawalForAdmin( amount).then((data) => {
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

        let withdrawalUser ;
        if (status == "approved" ) {
             withdrawalUser = await UserInfo.findById(withdrawal.user);
            withdrawalUser.finance -= withdrawal.amount;
            await withdrawalUser.save();
        }

        withdrawal.status = status;
        withdrawal.adminDescription = description ;
        withdrawal.processTime = new Date();

        await withdrawal.save();


        if (status == "approved" )
        {
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

    } catch (error) {
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

const FoundWithdrawal = async (req, res, next) => {
    try {
        if (req.query.id) {
            const thisObject = await objectModel.findById(req.query.id);
            if (thisObject) {
                res.status(200).json(thisObject);
            }
            else
                res.status(404).json({error : erorrs.notFound_404});
        }
        else
        {
            res.status(404).json({error : erorrs.notFound_404});
        }
    } catch (err) {
        res.status(500).json(err);
    }
}



const GetWithdrawalOfUser = async (req, res, next) => {
    try {
        let filter = {};
        if (req.query.status) filter.status = req.query.status;

        filter.user = req.user.id;

        const page = parseInt(req.query.page) || 1;
        const perpage = parseInt(req.query.perpage) || 10;

        let sort = { _id: -1 };
        if (req.query.id) {
            sort = { _id: parseInt(req.query.id) === 1 ? 1 : -1 };
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

        let sort = { _id: -1 };
        if (req.query.id) {
            sort = { _id: parseInt(req.query.id) === 1 ? 1 : -1 };
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

module.exports = { RequestWithdrawal  ,UpdateWithdrawal, ApproveWithdrawal , DeleteWithdrawal  , DeleteWithdrawalFromDb,FoundWithdrawal , GetWithdrawals , GetWithdrawalOfUser}
