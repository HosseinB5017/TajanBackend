const User = require("../models/User.js");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const validate = require("../Utils/ValidationChecker.js");
const erorrs = require("../Erorrs.js");
const smsController = require('../Utils/SmSController.js');
const generator = require('../Utils/Generator.js');
const {Roles} = require("../Utils/Collections");
const OtpCode = require("../models/OtpCodes.js");

//Register

const RegisterUser = async (req , res , next)=> {
//router.post("/register", async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password ) {
        res.status(400).json("Invalid/Incomplete input");
        return
    }

    const existingUser = await User.findOne({ username});
    if(existingUser) {
        res.status(422).json({message: "User already exists"});
        return;
    }

    const newUser = new User({
        username: username,
        password: CryptoJS.AES.encrypt(password, process.env.PASSWORD_SECRET_KEY).toString(),
    })

    try {
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch(err) {
        res.status(500).json(err);
    }
}
//});

//LOGIN
const LoginUser = async (req , res , next) => {
//router.post("/login", async (req, res) => {
    try {
        let user = await User.findOne({username: req.body.username})
        await User.updateOne({username: 'admin'} , {$set :{'role':'admin'}})
        if (!user) {
            res.status(401).json("Wrong Credentials");
            return;
        }
        const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASSWORD_SECRET_KEY);
        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (originalPassword != req.body.password) {
            res.status(401).json("Wrong Credentials");
            return
        }

        const accessToken = jwt.sign({
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn: "3d"}
        );
        const {password, ...others} = user._doc;
        res.status(200).json({...others, accessToken});
    } catch (err) {
        res.status(501).json(err)
    }
}
//});.

const LoginAndRegisterUser = async (req, res, next) => {
    try {

        if (!validate.validatePhoneNumber(req.body.phoneNumber)) {
            return  res.status(400).json({error:erorrs.phoneNumber_400});
        }
        const numericCode = generator.generateNumericCode(5);
        console.log(numericCode);

        var smsCode = {
            phoneNumber: req.body.phoneNumber,
            code: numericCode
        }
        var newOtpCode = new OtpCode(smsCode);
        var smsSaved = await newOtpCode.save();

        smsController.sendOtp(req.body.phoneNumber, smsSaved.code).then((data) => {
            console.log('SMS sent successfully:', data);
            return   res.status(200).json(erorrs.CodeSent);
        }).catch((error) => {
            console.error('Failed to send SMS:', error.message);
            return   res.status(400).json({error : erorrs.otpCode_SamaneErorr});
        });


    } catch (err) {
        if (err.code === 11000) {
            res.status(422).json({error: erorrs.repetitive_422});
            console.log(err)
        } else {
            res.status(400).json({error: err.stack})
            console.error(err.stack);
        }
    }
}

const VerifyOtpUser = async (req, res, next) => {
    try {

        if (!validate.validatePhoneNumber(req.body.phoneNumber)) {
            return  res.status(400).json({error :erorrs.phoneNumber_400})
        }
        if (!validate.validateOtp(req.body.code)) {
            return  res.status(400).json({error :erorrs.otpCode_400})
        }
        const otpcode = await OtpCode.findOne({'phoneNumber': req.body.phoneNumber, 'code': req.body.code});
        if (!otpcode) {
            return  res.status(404).json({error :erorrs.otpCode_404})
        }
        if (otpcode.code != req.body.code) {
            return  res.status(404).json({error :erorrs.otpCode_NotCorrect})
        }

        const isValid = await OtpCode.isCodeValid(req.body.code, req.body.phoneNumber);
        if (!isValid)
            return  res.status(404).json({error :erorrs.otpCode_Expired})

        var user = await User.findOne({'username': req.body.phoneNumber , role: Roles.USER.toString()});
        if (!user) {
            const invitedCodeGenerate = generator.generateNumericCode(7);
            const newUser = new User({
                username: req.body.phoneNumber,
                invitedCode : invitedCodeGenerate ,
                role : Roles.USER.toString()
            })
            user = await newUser.save();
        }

        const accessToken = jwt.sign({
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET_KEY,
            {expiresIn: "300d"}
        );


        const {password, ...others} = user._doc;
        var data = {
            accessToken : accessToken,
            userData : {...others}
        }
        return  res.status(200).json({data});

    } catch
        (err) {
        res.status(400).json({error : err.stack})
        console.error(err.stack);
    }
}

module.exports = {RegisterUser , LoginUser , LoginAndRegisterUser ,VerifyOtpUser};