const BannersModel = require("../models/Banners.js");

//UPDATE
const CreateBanners = async (req, res, next) => {
    try {
        var Banners;
        console.log(req.files[0].filename)

        const bannerImage = process.env.baseUrl +  process.env.BannersPath + req.files[0].filename ;

        Banners  = {
            title :JSON.parse(req.body.title),
            desc : JSON.parse(req.body.desc),
            imgBanner : bannerImage,
            otherInfo: JSON.parse(req.body.otherInfo),
        };
        const newBanners = new BannersModel(Banners);
        const resBanner = await newBanners.save();

        res.status(200).json(resBanner);

    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}

/////update role just by admin
//DELETE
const DeleteEvents = async (req, res) => {
    try {
        const Banner  = await BannersModel.findByIdAndDelete(req.params.id);

        if (Banner)
            res.status(200).json(Banner);
        else
            res.status(404).json("Banners not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const FoundBanners = async (req, res, next) => {
    try {
        console.log(req.query.title)
        if (req.query.id) {
            const Banners = await BannersModel.findById(req.query.id);
            if (Banners) {
                res.status(200).json(Banners);
            }
            else
                res.status(404).json("Banners not Found");
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
const GetAllBanners = async (req, res, next) => {
    try {
        var  Banners = await BannersModel.find().sort({_id:-1});
        res.status(200).json(Banners);
    } catch (err) {
        res.status(500).json(err);
    }
//});
}


module.exports = { CreateBanners , DeleteEvents ,FoundBanners , GetAllBanners}
