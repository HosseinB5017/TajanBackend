const mayorInfoModel = require("../models/MayorInfo.js");

//UPDATE
const CreateMayorInfo = async (req, res, next) => {
    try {
        var  mayorInfoControllers = await mayorInfoModel.find();
          if (mayorInfoControllers.length > 0)
          {
              await mayorInfoModel.findByIdAndDelete(mayorInfoControllers[0]._id);
          }

        var Mayor;
        console.log(req.file.filename)

        const Image = process.env.baseUrl +  process.env.mayorPath + req.file.filename ;

        Mayor  = {
            title :JSON.parse(req.body.title),
            name :JSON.parse(req.body.name),
            desc :JSON.parse(req.body.desc),
            img : Image,
            otherInfo: JSON.parse(req.body.otherInfo),
        };
        const newMayor = new mayorInfoModel(Mayor);
        const resMayor = await newMayor.save();

        res.status(200).json(resMayor);

    } catch (err) {
        res.status(500).json(err.stack);
    }
}

/////update role just by admin
//DELETE
const DeleteMayor = async (req, res) => {
    try {
        const mayor  = await mayorInfoModel.findByIdAndDelete(req.params.id);

        if (mayor)
            res.status(200).json(mayor);
        else
            res.status(404).json("mayor not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}

//Get ALL Users
const GetAllMayor = async (req, res, next) => {
    try {
        var  mayorInfoControllers = await mayorInfoModel.find();
        res.status(200).json(mayorInfoControllers[0]);
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { CreateMayorInfo , DeleteMayor  , GetAllMayor }
