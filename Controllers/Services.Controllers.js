const serviceModel = require("../models/Services.js");

//UPDATE
const CreateService = async (req, res, next) => {
    try {
        var Service = {};
     //   console.log(req.files['image'][0].filename)

        var ServiceImage = "";
        if (req.files['image']) {
             ServiceImage = process.env.baseUrl + process.env.ServicePath + req.files['image'][0].filename;
        }
        var filesPdf = [];
        if (req.files['files'])
        if (req.files['files'].length > 0) {
            await Promise.all(req.files['files'].map(async (img) => {
                console.log(process.env.baseUrl);
                filesPdf.push(process.env.baseUrl + process.env.ServicePath + img.filename);
            }));
        }

        Service  = {
            title :JSON.parse(req.body.title),
            img : ServiceImage,
            otherInfo: JSON.parse(req.body.otherInfo),
            link: JSON.parse(req.body.link),
            files : filesPdf
        };

        const newService = new serviceModel(Service);
        const resService = await newService.save();

        res.status(200).json(resService);

    } catch (err) {
        res.status(500).json(err.stack);
    }
}

/////update role just by admin
//DELETE
const DeleteService = async (req, res) => {
    try {
        const service  = await serviceModel.findByIdAndDelete(req.params.id);

        if (service)
            res.status(200).json(service);
        else
            res.status(404).json("service not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}

//DELETE
const FindService = async (req, res) => {
    try {
        const service  = await serviceModel.findById(req.query.id);
        if (service)
            res.status(200).json(service);
        else
            res.status(404).json("service not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}

//Get ALL Users
const GetAllServices = async (req, res, next) => {
    try {
        var  servicesControllers = await serviceModel.find().sort({_id:-1});
        res.status(200).json(servicesControllers);
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { CreateService , DeleteService , FindService , GetAllServices }
