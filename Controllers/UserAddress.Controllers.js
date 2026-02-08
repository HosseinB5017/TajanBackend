const ObjectModel = require('../models/UserAdress');
const erorrs = require("../Erorrs.js");
const userInfo = require("../models/User");
const CreateUserAddress = async (req, res, next) => {

    try {
        const result = new ObjectModel({
            ...req.body,
            user: req.user.id
        });

        const newObject = await result.save();
        const thisUser = await userInfo.findById(req.user.id);
        thisUser.userAddress.push(newObject._id);
        thisUser.activeAddress = newObject._id;

        await thisUser.save();
        res.status(200).json(newObject);

    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({error: erorrs.repetitive_422});
            console.error(error.stack);
        } else {
            res.status(400).json({error: error.message});
        }
    }

};


const UpdateUserAddress = async (req, res, next) => {
    try {
        const updatedService = await ObjectModel.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if (!updatedService)
            return res.status(200).json({error: erorrs.notFound_404});

        var resultObj = await ObjectModel.findById(updatedService._id);

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


const GetAddressesOfUser = async (req, res, next) => {
    try {
        console.log("sss");
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
        let filter = {};
        filter.active = true;
        filter.user = req.user.id;

        console.log(req.user.id);

        result = await ObjectModel.find(filter, {}, options);
        count = await ObjectModel.countDocuments(filter);
        res.status(200).json({"CountOfPage": Math.ceil(count / perpage), "CountOfData": result.length, "data": result});

    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const GetUserAddress = async (req, res, next) => {
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


        result = await ObjectModel.find({}, {}, options);
        count = await ObjectModel.countDocuments();
        res.status(200).json({"CountOfPage": Math.ceil(count / perpage), "CountOfData": result.length, "data": result});

    } catch (error) {
        res.status(400).json({error: error.message});
    }
};

const DeleteUserAddress = async (req, res, next) => {
    try {
        const result = await ObjectModel.findOneAndUpdate(
            {_id: req.params.id},
            {active: false},   // نیازی به $set هم نیست
            {new: true}
        );
        const thisUser = await userInfo.findById(req.user.id);
        thisUser.userAddress.pull(result._id);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};


const SetActiveUserAddress = async (req, res, next) => {
    try {
        const result = await userInfo.findById(req.body.id);
        result.activeAddress = req.body.id;
        const activeAdd = await result.save();

        res.status(200).json(activeAdd);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};


const DeleteUserAddressFromDB = async (req, res, next) => {
    try {
        const result = await ObjectModel.findByIdAndRemove(req.params.id);
        const thisUser = await userInfo.findById(req.user.id);
        thisUser.userAddress.pull(result._id);

        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
};


const FindAUserAddress = async (req, res, next) => {
    try {
        var result = {};
        result = await ObjectModel.findById(req.query.id);

        if (!result) {
            return res.status(404).json(erorrs.notFound_404);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};


module.exports = {
    CreateUserAddress,
    SetActiveUserAddress,
    DeleteUserAddress,
    UpdateUserAddress,
    DeleteUserAddressFromDB,
    FindAUserAddress,
    GetAddressesOfUser,
    GetUserAddress
}