const EventsModel = require("../models/Events.js");

//UPDATE
const CreateEvents = async (req, res, next) => {
    try {
        var Events;
        console.log(req.files[0].filename)
        var EventsImgs=[] ;
        for (let i = 0 ; i < req.files.length ; i++)
        {
            const newPath =process.env.baseUrl + process.env.EventsPath + req.files[i].filename;
            EventsImgs.push(newPath);
        }

        const bannerImage = process.env.baseUrl +  process.env.EventsPath + req.files[0].filename ;

        Events  = {
            title :JSON.parse(req.body.title),
            desc : JSON.parse(req.body.desc),
            imgBanner : bannerImage,
            otherImg: EventsImgs,
            tag : JSON.parse(req.body.tags),
            otherInfo: JSON.parse(req.body.otherInfo),
            releaseDate :JSON.parse(req.body.releaseDate)
        };
        const newEvents = new EventsModel(Events);
        const resEvents = await newEvents.save();

        res.status(200).json(resEvents);

    } catch (err) {
        res.status(500).json(err);
    }
}

/////update role just by admin
const UpdateEvents = async (req, res) => {
    try {
        // const newPath = process.env.productDownPath + item.filename;
        const Events = await  EventsModel.findById(req.body.id);
        if (Events) {
            if (req.files.length>0)
            {
                var EventsImgs = [];
                for (let i = 0 ; i < req.files.length ; i++)
                {
                    const newPath = process.env.baseUrl + process.env.EventsPath + req.files[i].filename;
                    EventsImgs.push(newPath);
                    Events.otherImg.push(newPath);
                }
                if (req.body.NewBanner === "true")
                {
                    console.log(EventsImgs[0])
                    Events.imgBanner = EventsImgs[0];
                }
            }
            if (req.body.title) {
                var title = JSON.parse(req.body.title);
                Events.title = title;
                console.log(title);
            }
            if (req.body.desc) {
                var desc = JSON.parse(req.body.desc);
                Events.desc = desc;
            }
            if (req.body.tag){
                var tag = JSON.parse(req.body.tag);
                Events.tag = tag;
            }
            if (req.body.releaseDate){
                var releaseDate = JSON.parse(req.body.releaseDate);
                Events.releaseDate = releaseDate;
            }
            if (req.body.RemoveImgs){
                var RemoveImgs = JSON.parse(req.body.RemoveImgs);
                await Promise.all(RemoveImgs.map(async (removeImg) => {
                    //console.log(removeImgs);

                    console.log(Events.otherImg);
                    const index = Events.otherImg.indexOf(removeImg);
                    if (index > -1) {
                        Events.otherImg.splice(index, 1);
                    }
                    console.log(Events.otherImg);

                }));
            }
            Events.save();
            res.status(200).json(Events);
        }
        else
        {
            res.status(404).json("Events can not Found");
        }
    } catch (err) {
        res.status(505).json(err);
    }
}
//DELETE
const DeleteEvents = async (req, res) => {
    try {
        const Events  = await EventsModel.findByIdAndDelete(req.params.id);

        if (Events)
            res.status(200).json(Events);
        else
            res.status(404).json("Events not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const FoundEvents = async (req, res, next) => {
    try {
        console.log(req.query.title)
        if (req.query.id) {
            const Events = await EventsModel.findById(req.query.id);
            if (Events) {
                res.status(200).json(Events);
            }
            else
                res.status(404).json("Events not Found");

        }
        else if(req.query.title) {

            const query = { [`title`]: { $regex: new RegExp(req.query.title)} };
            const founded = await EventsModel.find(query);
            if (founded) {
                res.status(200).json(founded);
            }
            else
                res.status(404).json("Events not Found");
        }
        else if (req.query.tag){
            let page ;
            req.query.page ? page = req.body.page : page = 1;
            let perpage ;
            req.query.perpage ? perpage = req.query.perpage : perpage = 10;


            const options = {
                skip: ((page - 1) * perpage),
                limit: perpage
            }

            const  founded = await EventsModel.find({ tag: { $elemMatch: { $regex: req.query.tag, $options: "i" } } }, {}, options);

            if (founded) {
                res.status(200).json(founded);
            }
            else
                res.status(404).json("Events not Found");
        }
        else
        {
            res.status(402).json("you should send id or title");
        }
    } catch (err) {
        res.status(500).json(err);
    }
}


//Get ALL Users
const GetAllEvents = async (req, res, next) => {

    try {
    let new_q = req.query.new;
    let page ;
    req.query.page ? page = req.query.page : page = 1;
    let perpage ;
    req.query.perpage ? perpage = req.query.perpage : perpage = 10;

    const options = {
        skip: ((page - 1) * perpage),
        limit: perpage
    }
    let count = await EventsModel.countDocuments({});


        let Events;
        if (new_q) {
            Events = await EventsModel.find().sort({_id: -1}).limit(new_q);
            count = Events.length;
        } else {
            Events = await EventsModel.find({}, {}, options).sort({_id: -1});
        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfEvents": count, "data": Events});
    } catch (err) {
        res.status(500).json(err);
    }
//});
}


module.exports = { CreateEvents ,UpdateEvents, DeleteEvents , FoundEvents , GetAllEvents}
