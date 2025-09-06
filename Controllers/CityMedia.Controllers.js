const CityMediaModel = require("../models/CityMedia.js");

//UPDATE
const CreateCityMedia = async (req, res, next) => {
    try {
        var CityMedia;
        console.log(req.files[0].filename)
        const media = process.env.baseUrl +  process.env.CityMediaPath + req.files[0].filename ;

        CityMedia  = {
            title :JSON.parse(req.body.title),
            desc : JSON.parse(req.body.desc),
            video : media,
            otherInfo: JSON.parse(req.body.otherInfo),
            releaseDate :JSON.parse(req.body.releaseDate)
        };
        const newMedia = new CityMediaModel(CityMedia);
        const resMedia = await newMedia.save();

        res.status(200).json(resMedia);

    } catch (err) {
        res.status(500).json(err);
    }
}

//DELETE
const DeleteCityMedia = async (req, res) => {
    try {
        const cityMedia  = await CityMediaModel.findByIdAndDelete(req.params.id);

        if (cityMedia)
            res.status(200).json(cityMedia);
        else
            res.status(404).json("cityMedia not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const FoundCityMedia = async (req, res, next) => {
    try {
        console.log(req.query.title)
        if (req.query.id) {
            const CityMedia = await CityMediaModel.findById(req.query.id);
            if (CityMedia) {
                res.status(200).json(CityMedia);
            }
            else
                res.status(404).json("CityMedia not Found");

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
const GetAllCityMedia = async (req, res, next) => {

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
    let count = await CityMediaModel.countDocuments({});


        let cityMedia;
        if (new_q) {
            cityMedia = await CityMediaModel.find().sort({_id: -1}).limit(new_q);
            count = cityMedia.length;
        } else {
            cityMedia = await CityMediaModel.find({}, {}, options);
        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfCityMedia": count, "data": cityMedia});
    } catch (err) {
        res.status(500).json(err);
    }
//});
}


module.exports = { CreateCityMedia , DeleteCityMedia , FoundCityMedia , GetAllCityMedia }
