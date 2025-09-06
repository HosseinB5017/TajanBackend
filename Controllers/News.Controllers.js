const NewsModel = require("../models/News.js");

//UPDATE
const CreateNews = async (req, res, next) => {
    try {
    var ANew;
    console.log(req.files[0].filename)
    var newsImgs=[] ;
    for (let i = 0 ; i < req.files.length ; i++)
    {
        const newPath = process.env.baseUrl + process.env.NewsPath + req.files[i].filename;
        newsImgs.push(newPath);
    }

    const bannerImage = process.env.baseUrl + process.env.NewsPath + req.files[0].filename ;

    ANew = {

        title :JSON.parse(req.body.title),
        desc : JSON.parse(req.body.desc),
        imgBanner : bannerImage,
        otherImg: newsImgs,
        tag : JSON.parse(req.body.tags),
        otherInfo: JSON.parse(req.body.otherInfo),
        releaseDate : JSON.parse(req.body.releaseDate),
    };
    const newNews = new NewsModel(ANew);
    const resNews = await newNews.save();

    res.status(200).json(resNews);

       } catch (err) {
           res.status(500).json(err.stack);
    }
}

/////update role just by admin
const UpdateNews = async (req, res) => {
    try {
        // const newPath = process.env.productDownPath + item.filename;
        const News = await  NewsModel.findById(req.body.id);
        if (News) {
            if (req.files.length>0)
            {
                var newsImgs = [];
                for (let i = 0 ; i < req.files.length ; i++)
                {
                    const newPath =process.env.baseUrl + process.env.NewsPath + req.files[i].filename;
                    newsImgs.push(newPath);
                    News.otherImg.push(newPath);
                }
                if (req.body.NewBanner === "true")
                {
                    console.log(newsImgs[0])
                    News.imgBanner = newsImgs[0];
                }
            }
            if (req.body.title) {
                var title = JSON.parse(req.body.title);
                News.title = title;
                console.log(title);
            }
            if (req.body.desc) {
                var desc = JSON.parse(req.body.desc);
                News.desc = desc;
            }
            if (req.body.tag){
                var tag = JSON.parse(req.body.tag);
                News.tag = tag;
            }
            if (req.body.releaseDate){
                var releaseDate = JSON.parse(req.body.releaseDate);
                News.releaseDate = releaseDate;
            }
            if (req.body.RemoveImgs){
                var RemoveImgs = JSON.parse(req.body.RemoveImgs);
                await Promise.all(RemoveImgs.map(async (removeImg) => {
                    //console.log(removeImgs);

                    console.log(News.otherImg);
                    const index = News.otherImg.indexOf(removeImg);
                    if (index > -1) {
                        News.otherImg.splice(index, 1);
                    }
                    console.log(News.otherImg);

                }));
            }
            News.save();
            res.status(200).json(News);
        }
        else
        {
            res.status(404).json("Articles can not Found");
        }
    } catch (err) {
        res.status(505).json(err);
    }
}
//DELETE
const DeleteNews = async (req, res) => {
    try {
        const News  = await NewsModel.findByIdAndDelete(req.params.id);

        if (News)
            res.status(200).json(News);
        else
            res.status(404).json("News not Found");

    } catch (err) {
        res.status(500).json(err);

    }
}


const FoundNews = async (req, res, next) => {
    try {

        if (req.query.id) {
            const News = await NewsModel.findById(req.query.id);
            if (News) {
                res.status(200).json(News);
            }
            else
                res.status(404).json("user not Found");

        }
        else if(req.query.title) {

            const query = { [`title`]: { $regex: new RegExp(req.query.title)} };
            const founded = await NewsModel.find(query);
            if (founded) {
                res.status(200).json(founded);
            }
            else
                res.status(404).json("Articles not Found");
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

            const  founded = await NewsModel.find({ tag: { $elemMatch: { $regex: req.query.tag, $options: "i" } } }, {}, options);

            if (founded) {
                res.status(200).json(founded);
            }
            else
                res.status(404).json("Articles not Found");
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
const GetAllNews = async (req, res, next) => {
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
    let count = await NewsModel.countDocuments({});

        let News;
        if (new_q) {
            News = await NewsModel.find().sort({_id: -1}).limit(new_q);
            count = News.length;
        } else {
            News = await NewsModel.find({}, {}, options).sort({_id: -1});
        }
        res.status(200).json({"countOfPage": Math.ceil(count / perpage), "CountOfNews": count, "data": News});
    } catch (err) {
        res.status(500).json(err);
    }
//});
}


module.exports = { CreateNews ,UpdateNews, DeleteNews , FoundNews , GetAllNews}
