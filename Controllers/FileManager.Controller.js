const erorrs = require("../Erorrs.js");
const FileObject = require("../models/FileManager/Files");
const path = require("path");
const  prepend = require("../Utils/UtilsController.js");
const FileSection = require("../Utils/Collections.js").FileSection;
const UploadFile = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({error : erorrs.er400 });

        console.log(req.file.mimetype + "dd")
        const newFile = new FileObject({
            name: req.file.filename,
            mimeType: req.file.mimetype,
            fileSize : req.file.size,
            path:  process.env.filePath,
            title : req.body.title,
            reference : getValidFileSection(req.body.fileSection)
        });

        const saved = await newFile.save();
        var docObject = prepend.prependBaseUrlToDoc(saved);


        res.status(200).json(saved);

    } catch (error) {
        if (error.code === 11000 ) {

            res.status(422).json({error : erorrs.repetitive_422 });
            console.error(error.stack);
        } else {
            res.status(400).json({error: erorrs.er400});
        }
    }
};

function getValidFileSection(section) {
    const values = Object.values(FileSection);

    if (values.includes(section)) {
        return section;
    } else {
        console.error("Invalid file section:", section);
        return null;
    }
}

const UploadFiles = async (req, res, next) => {
    try {
        if (!req.files["files"] || req.files["files"].length === 0) {
            return res.status(400).json({ error: erorrs.er400 });
        }

        const savedFiles = [];
        const titles = JSON.parse(req.body.title);
        for (let i = 0; i < req.files["files"].length; i++) {
            const file = req.files["files"][i];
            const newFile = new FileObject({
                name: file.originalname,
                mimeType: file.mimetype,
                fileSize : req.file.size,
                path: process.env.filePath,
                title: titles[i],
                reference: getValidFileSection(req.body.fileSection)
            });

            // save or push newFile somewhere if needed


        const saved = await newFile.save();
            savedFiles.push(saved);
        }

        const filesWithUrl = prepend.prependBaseUrlToDocs(savedFiles);
        res.status(200).json(filesWithUrl);

    } catch (error) {
        if (error.code === 11000) {
            res.status(422).json({ error: erorrs.repetitive_422 });
            console.error(error.stack);
        } else {
            res.status(400).json({ error: erorrs.er400 });
        }
    }
};



const GetAllFiles = async (req, res) => {
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

        count = await FileObject.countDocuments({});

        const files = await FileObject.find();
        result = prepend.prependBaseUrlToDocs(files)

        res.status(200).json({"CountOfPage": Math.ceil(count / perpage), "CountOfData": result.length, "data": result});

    } catch (err) {
        res.status(400).json({error : erorrs.er400});
    }
};



const DeleteFileFromDb = async (req, res, next) => {
    try {
        const result = await FileObject.findByIdAndRemove(req.params.id);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: erorrs.er400});
    }
};


const DeleteFile = async (req, res, next) => {
    try {
        const result = await FileObject.findOneAndUpdate( {_id : req.params.id , $Set : {active : false}});
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: erorrs.er400});
    }
};


const FindAFiles = async (req, res, next) => {
    try {
        var result ={};
        if (req.query.id) {
            result = await FileObject.findById(req.query.id);
            var resultObj = prepend.prependBaseUrlToDoc(result);
            res.status(200).json(resultObj);
        }

        if (!result) {
            return res.status(404).json( erorrs.notFound_404);
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: erorrs.er400});
    }
};




module.exports = {UploadFiles , UploadFile , DeleteFile , FindAFiles , GetAllFiles ,  DeleteFileFromDb}