const TicketsModel = require("../models/Ticket.js");
const UserModel = require("../models/User");
const erorrs = require("../Erorrs.js");

const TelegramBot = require('node-telegram-bot-api');
const TOKEN = '';
const CHANNEL_ID = '@نام_کاربری_کانال_شما'; // مثلا: '@mychannel'
const rp = require('request-promise');

//UPDATE
const CreateTicketsModel = async (req, res, next) => {
    try {
        const { typeTicket, title, desc } = req.body;
        let files = [];
        let fileCount =0;

        if (req.files["files"] && req.files["files"].length > 0) {
            fileCount = req.files["files"].length;
            files = req.files["files"].map(file => process.env.baseUrl + process.env.ticketFiles + file.filename);
            console.log("Uploaded filenames:", files);
        } else {
            console.log("No files were uploaded.");
        }

        const newTicket = new TicketsModel({
            user : req.user.id,
            typeTicket,
            title,
            desc,
            files,
        });
        const savedTicket = await newTicket.save();


        let hasAttachment = false;  // یا false

        if (fileCount >0 ){
            hasAttachment = true;
        }

        const attachmentUrl = "";  // لینک پیوست
        const attachmentText = hasAttachment
            ? `\n\n[پیوست دارد](${attachmentUrl})`
            : "";
        const message = `📌 ${title}\n\n${desc}\n\n${attachmentText}\n\n${typeTicket}\n\n👇👇👇👇👇👇 مشاهده و پاسخ در سایت\n\n${attachmentUrl}`;



/*
        const options = {
            uri: 'https://api.telegram.org/bot'+TOKEN+'/sendMessage',
            method: 'POST',
            json: true,
            body: {
                chat_id: -1002499252506,
                text: message,
                parse_mode: 'Markdown'
            }
        };
        console.log(options);
        rp(options)
            .then(response => {
                console.log('پیام ارسال شد', response);
            })
            .catch(err => {
                console.error('خطا:', err.message);
            });*/
        res.status(200).json(savedTicket); // Use 201 for successful creation

    } catch (err) {
        console.error("Error creating ticket:", err);
        res.status(500).json(err);
    }
};



//DELETE
const DeleteTicketsModel = async (req, res) => {
    try {
        const Ticket  = await TicketsModel.findByIdAndDelete(req.params.id);

        if (Ticket)
            res.status(200).json(Ticket);
        else
            res.status(404).json("Ticket not Found");

    } catch (err) {
        res.status(500).json(err);
    }
}


//DELETE
const EditTicketsModel = async (req, res) => {
    try {
        const Ticket  = await TicketsModel.findByIdAndUpdate(req.params.id , {$set : {status :req.body.status }},   { new: true });

        if (Ticket)
            res.status(200).json(Ticket);
        else
            res.status(404).json("Ticket not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}

const FoundTicketsModel  = async (req, res, next) => {
    try {
        if (req.query.id) {
            const Banners = await TicketsModel.findOne({_id : req.query.id ,user : req.user.id }  );
            if (Banners) {
                res.status(200).json(Banners);
            }
            else
                res.status(404).json("Ticket not Found");
        }
        else
        {
            res.status(402).json("you should send a id ");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}


const FoundAdminTicketsModel  = async (req, res, next) => {
    try {
        if (req.query.id) {
            const Banners = await TicketsModel.findOne({_id : req.query.id  }  );
            if (Banners) {
                res.status(200).json(Banners);
            }
            else
                res.status(404).json("Ticket not Found");
        }
        else
        {
            res.status(402).json("you should send a id ");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}

//Get ALL Users
const GetAllTicketsModel  = async (req, res, next) => {
    try {
        let new_q = req.query.new;
        let page ;
        req.query.page ? page = req.query.page : page = 1;
        let perpage ;
        req.query.perpage ? perpage = req.query.perpage : perpage = 10;
        let status  = req.query.status;


        const options = {
            skip: ((page - 1) * perpage),
            limit: perpage
        }
        let filter = { };
        if (status) {
            filter.status = status;
        }


        let count = await TicketsModel.countDocuments(filter);

        let Tickets;

        if (new_q) {
            Tickets = await TicketsModel.find(filter , {} , {}).sort({_id: -1}).limit(new_q);
            count = Tickets.length;
        } else {
            Tickets = await TicketsModel.find(filter, {}, options).sort({_id: -1});
        }

        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfTickets": count, "data": Tickets});
    } catch (err) {
        res.status(500).json(err);
    }
//});
}

const GetMyAllTicketsModel = async (req, res, next) => {
    try {
        let new_q = req.query.new;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let perpage = req.query.perpage ? parseInt(req.query.perpage) : 10;
        let status = req.query.status;

        const options = {
            skip: ((page - 1) * perpage),
            limit: perpage
        };

        // ساخت فیلتر
        let filter = { user: req.user.id };
        if (status) {
            filter.status = status;
        }

        let count = await TicketsModel.countDocuments(filter);
        let Tickets;

        if (new_q) {
            Tickets = await TicketsModel.find(filter).sort({ _id: -1 }).sort({_id: -1}).limit(parseInt(new_q));
            count = Tickets.length;
        } else {
            Tickets = await TicketsModel.find(filter, {}, options).sort({_id: -1});
        }

        res.status(200).json({
            countOfPage: Math.ceil(count / perpage),
            CountOfTickets: count,
            data: Tickets
        });
    } catch (err) {
        res.status(500).json(err);
    }
};

const AddSupportResponse = async (req, res) => {
    try {
        var  ticket = await TicketsModel.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد' });

        if (ticket.status === "closed" )
        {
           return res.status(400).json({ message: 'تیکت متاسفانه بسته است.' });
        }
        // تعیین id بعدی
        let nextId = 1;
        if (ticket.Response.length > 0) {
            const ids = ticket.Response.map(r => r.id);
            nextId = Math.max(...ids) + 1;
        }
        ticket.status = "open";
        await ticket.save();
        // اضافه کردن پاسخ
        ticket.Response.push({
            id: nextId,
            role: 'admin',
            author: 'پشتیبانی',
            text: req.body.text
        });

        await ticket.save();
        res.status(200).json({ message: 'پاسخ پشتیبانی اضافه شد', ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


const AddUserResponse = async (req, res) => {
    try {
        var ticket = await TicketsModel.findById(req.params.id);
        const user = await UserModel.findById(req.user.id);
        if (!ticket) return res.status(404).json({ message: 'تیکت پیدا نشد!' });

        if (ticket.status === "closed" )
        {
            return res.status(400).json({ message: 'تیکت متاسفانه بسته است.' });
        }

        // تعیین id بعدی
        let nextId = 1;
        if (ticket.Response.length > 0) {
            const ids = ticket.Response.map(r => r.id);
            nextId = Math.max(...ids) + 1;
        }

        ticket.status = "pending";
        await ticket.save();

        // اضافه کردن پاسخ
        ticket.Response.push({
            id: nextId,
            role:'user',
            author: user.name +" "+ user.lastName,
            text: req.body.text
        });

        await ticket.save();
        res.status(200).json({ message: 'پاسخ کاربر اضافه شد', ticket });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



module.exports = {AddUserResponse ,FoundAdminTicketsModel,AddSupportResponse , CreateTicketsModel, EditTicketsModel , DeleteTicketsModel ,FoundTicketsModel , GetAllTicketsModel , GetMyAllTicketsModel}
