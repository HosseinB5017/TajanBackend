const ProjectModel = require("../models/Projects.js");

//UPDATE

const CreateProjects = async (req, res, next) => {
    try {
        let ProjectsImgs = [];

        // بررسی وجود فایل‌ها
        if (req.files && req.files.length > 0) {
            for (let i = 0; i < req.files.length; i++) {
                const newPath = process.env.baseUrl + process.env.ProjectsPath + req.files[i].filename;
                ProjectsImgs.push(newPath);
            }
        }

        const bannerImage = (req.files && req.files[0])
            ? process.env.baseUrl + process.env.ProjectsPath + req.files[0].filename
            : '';

        // پارس کردن ورودی‌ها فقط در صورتی که مقدار داشته باشن
        let title = '';
        let desc = '';
        let tags = [];
        let otherInfo = {};

        try {
            if (req.body.title) title = JSON.parse(req.body.title);
            if (req.body.desc) desc = JSON.parse(req.body.desc);
            if (req.body.tags) tags = JSON.parse(req.body.tags);
            if (req.body.otherInfo) otherInfo = JSON.parse(req.body.otherInfo);
        } catch (parseErr) {
            console.error("JSON parse error:", parseErr);
            return res.status(400).json({ message: "Invalid JSON format in body" });
        }

        const Project = {
            title,
            desc,
            imgBanner: bannerImage,
            otherImg: ProjectsImgs,
            tag: tags,
            otherInfo
        };

        const newProject = new ProjectModel(Project);
        const resProject = await newProject.save();

        res.status(200).json(resProject);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error", error: err });
    }
};



/////update role just by admin
const UpdateProjects = async (req, res) => {
    try {
        // const newPath = process.env.productDownPath + item.filename;
        const Project = await  ProjectModel.findById(req.body.id);
        if (Project) {
            if (req.files.length>0)
            {
                var ProjectsImgs = [];
                for (let i = 0 ; i < req.files.length ; i++)
                {
                    const newPath = process.env.baseUrl + process.env.EventsPath + req.files[i].filename;
                    ProjectsImgs.push(newPath);
                    Project.otherImg.push(newPath);
                }
                if (req.body.NewBanner === "true")
                {
                    console.log(ProjectsImgs[0])
                    Project.imgBanner = ProjectsImgs[0];
                }
            }
            if (req.body.title) {
                var title = JSON.parse(req.body.title);
                Project.title = title;
                console.log(title);
            }
            if (req.body.desc) {
                var desc = JSON.parse(req.body.desc);
                Project.desc = desc;
            }
            if (req.body.tag){
                var tag = JSON.parse(req.body.tag);
                Project.tag = tag;
            }

            if (req.body.RemoveImgs){
                var RemoveImgs = JSON.parse(req.body.RemoveImgs);
                await Promise.all(RemoveImgs.map(async (removeImg) => {
                    //console.log(removeImgs);

                    console.log(Project.otherImg);
                    const index = Project.otherImg.indexOf(removeImg);
                    if (index > -1) {
                        Project.otherImg.splice(index, 1);
                    }
                    console.log(Project.otherImg);

                }));
            }
            Project.save();
            res.status(200).json(Project);
        }
        else
        {
            res.status(404).json("Project can not Found");
        }
    } catch (err) {
        res.status(505).json(err);
    }
}
//DELETE
const DeleteProjects = async (req, res) => {
    try {
        const Project  = await ProjectModel.findByIdAndDelete(req.params.id);

        if (Project)
            res.status(200).json(Project);
        else
            res.status(404).json("Project not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const FoundProjects = async (req, res, next) => {
    try {
        console.log(req.query.title)
        if (req.query.id) {
            const Project = await ProjectModel.findById(req.query.id);
            if (Project) {
                res.status(200).json(Project);
            }
            else
                res.status(404).json("Events not Found");
        }
        else if(req.query.title) {
            const query = { [`title`]: { $regex: new RegExp(req.query.title)} };
            const founded = await ProjectModel.find(query);
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

            const  founded = await ProjectModel.find({ tag: { $elemMatch: { $regex: req.query.tag, $options: "i" } } }, {}, options);

            if (founded) {
                res.status(200).json(founded);
            }
            else
                res.status(404).json("Project not Found");
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
const GetAllProjects = async (req, res, next) => {

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
    let count = await ProjectModel.countDocuments({});

        let Project;
        if (new_q) {
            Project = await ProjectModel.find().sort({_id: -1}).limit(new_q);
            count = Project.length;
        } else {
            Project = await ProjectModel.find({}, {}, options).sort({_id: -1});

        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfProjects": count, "data": Project});
    } catch (err) {
        res.status(500).json(err);
    }
//});
}


module.exports = { CreateProjects ,UpdateProjects, DeleteProjects , FoundProjects , GetAllProjects}
