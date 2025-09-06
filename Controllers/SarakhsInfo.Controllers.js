const SarakhsInfoModel = require("../models/sarakhsInfo.js");

//UPDATE
const CreateSarakhsInfo = async (req, res, next) => {
    try {

    const sarakhsInfo  = await SarakhsInfoModel.find();
    if (sarakhsInfo.length > 0) {
        await SarakhsInfoModel.findByIdAndDelete(sarakhsInfo[0]._id);
    }
    var SarakhsInfo;
        console.log(req.body)
        console.log(req.body.title);

        SarakhsInfo  = {
            title : req.body.title,
            desc: req.body.desc,
        };
        const newSarakhs = new SarakhsInfoModel(SarakhsInfo);
        const resSarakhs = await newSarakhs.save();

        res.status(200).json(resSarakhs);
    } catch (err) {
        res.status(500).json(err.stack);
    }
}

/////update role just by admin
//DELETE
const DeleteSarakhsInfo = async (req, res) => {
    try {
        const sarakhsInfo  = await SarakhsInfoModel.findByIdAndDelete(req.params.id);

        if (sarakhsInfo)
            res.status(200).json(sarakhsInfo);
        else
            res.status(404).json("sarakhsInfo not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}

//Get ALL Users
const GetAllSarakhsInfo = async (req, res, next) => {
    try {
        var  sarakhsControllers = await SarakhsInfoModel.find();
        res.status(200).json(sarakhsControllers[0]);
    } catch (err) {
        res.status(500).json(err);
    }
}


module.exports = { CreateSarakhsInfo , DeleteSarakhsInfo  , GetAllSarakhsInfo }
