const ObjectModel = require('../models/Waste');
const erorrs = require("../Erorrs.js");

const CreateWaste = async (req, res, next) => {

    try {
        const result = new ObjectModel(req.body);
        const newObject = await result.save();
        var resultObj = await ObjectModel.findById(newObject._id);

        res.status(200).json(resultObj);

    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({error: erorrs.repetitive_422});
            console.error(error.stack);
        } else {
            res.status(400).json({error: error.message});
        }
    }
};


const UpdateWaste = async (req, res, next) => {
    try {
        const updatedService = await ObjectModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedService)
            return res.status(200).json({error: erorrs.notFound_404});

        var resultObj = await ObjectModel.findById(updatedService._id).populate("img");

        res.status(200).json(resultObj);

    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({error: erorrs.repetitive_422});
            console.error(error.stack);
        } else {
            res.status(400).json({error: error.message});
        }
    }

};

const GetWastes = async (req, res, next) => {
    try {

        let page;
        req.query.page ? page = req.query.page : page = 1;
        let perpage;
        req.query.perpage ? perpage = req.query.perpage : perpage = 10;

        const options = {
            skip: ((page - 1) * perpage),
            limit: perpage
        }
        var result = [];
        let count = 0;
        result = await ObjectModel.find({active : true}, {}, options).populate("img");
        count = await ObjectModel.countDocuments({active : true});
        res.status(200).json({"CountOfPage": Math.ceil(count / perpage), "CountOfData": result.length, "data": result});

    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const DeleteWaste = async (req, res, next) => {
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

const DeleteWasteFromDB = async (req, res, next) => {
    try {
        const result = await ObjectModel.findByIdAndRemove(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};


const FindAWaste = async (req, res, next) => {
    try {
        var result = {};
        result = await ObjectModel.findById(req.query.id).populate("img");

        if (!result) {
            return res.status(404).json(erorrs.notFound_404);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};


module.exports = {CreateWaste, DeleteWaste  , UpdateWaste, DeleteWasteFromDB, FindAWaste, GetWastes}