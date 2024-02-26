const User = require('../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
const util = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sing({id}, process.env.SECRET_STR, {
        expiresIn: process.env.LOGIN_EXPIRES
    })
}

const createSendResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    const options =  {
        maxAge: process.env.LOGIN_EXPIRES,
        httpOnly: true
}
if(process.env.NODE_ENV === 'prodection')
options.secure = true

res.cookie('jwt', token,options);

user.password = undefined

    res.status(statusCode).json({
        statu: 'success',
        token,
        data: {
            user
        }
    });
}


exports.signup = async(req,res, next) => {
    try{
      const newUser = await User.create(req.body);
    
    } catch{
        createSendResponse(newUser, 201, res);
        //     const token = signToken(newUser._id);

//     res.status(201).json({
//         statu: 'success',
//         token,
//         data: {
//             user:newUser
//         }
//     }); 
    }
  
};

exports.login = async(req, res,next) => {
    const email = req.body.email;
    const password = req.body.password;

    // const {email, password} = req.body
    //  check if email & password in request body
    if(!email || password){
        const error = new CustomError('Please enter email & password!', 400);
        return next(error);
    } 

    // check if user exists with a given email
    const user = await user.findOne({ email }).select('+password');

    // const isMatch = await user.comparepasswordInDb(password, user.password);

    // check if user exists & password matches
    if(!user || !(await user.comparepasswordInDb(password, user.password))){
         const error =  new CustomError('Incorrect email or password!', 400);
         return next(error); 
    }
    createSendResponse(newUser, 201, res);
//     const token = signToken(user._id);

//     res.status(201).json({
//         statu: 'success',
//         token,
//     });
};

exports.protect = async (req, res, next) =>{
    const testToken = req.headers.authorization;
    
    let token;
    if(testToken && testToken.startsWith('bearer')){
         token = testToken.split(' ')[1];
    }
    if (!token){
        next(new CustomError('You are not logged in!', 401));
    }

   const decodedToken = await util.promisify(jwt.verify)(token, process.env.SECRET_STR)
       
   const user = await User.findById(decodedToken.id);

   if(!user){
    const error =  new CustomError('Incorrect email or password!', 401);
     next(error); 
   }

   const isPasswordChanged = await user.isPasswordChanged(decodedToken.iat)
   if(isPasswordChanged){
    const error = new CustomError('This password has been changed recently. Please login again',401)
    return next(error);
   };
    req.user = user
    next();
}

exports.restrict = (role) => {
    return (req, res, next) => {
        if(req.user.role !== role){
            const error = new CustomError('You are not allow to perform this action', 403);
            next(error);
        }
        next();
    }
}

// exports.restrict = (...role) => {
//     return (req, res, next) => {
//         if(!role.includes(req.user.role)){
//             const error = new CustomError('You are not allow to perform this action', 403);
//             next(error);
//         }
//         next();
//     }
// }

exports.forgotPassword = async (req, res, next) => {
    const user = User.findOne({email: req.body.email});

    if(!user){
        const error = new CustomError('Unable to find user with this emaill', 404);
        next(error);
    }

    const resetToken = user.createResetPasswordToken();

    await user.save({validateBeforeSave: false});
    
    const resetUrl = `${req.protocol}://${req.get ('host')}/api/v1/user/resetPassword/${resetToken}`;

    const message = 'You have recieved a password reset request . Please use the link below to reset your password\n\n${resetUrl}\n\nThis reset password link will be valid only for 10 minutes'
    
    try{
    await sendEmail({
        email: user.email,
        subject: 'Password change request recieve',
        message: message
    });

    res.status(200).json({
        status: 'success',
        message: 'password reset link send to your email'
    })
}catch(err){
    user.PasswordResetToken = undefined;
    user.PasswordResetTokenExpires = undefined;
    user.save({validateBeforeSave: false});

    return next(new CustomError('there was an error sendind passwor reset mail.Please try again', 500));
}    
}

exports.resetPassword = async (req,res,next) => {
    //IF THE USER  EXIST WITH THE GIVEN TOKEN & TOKEN HAS NOT EXPIRED
    const token = crypto.createHash('sha256').update(req.params, token).digest('hex');
    const user = await user.findOne({PasswordResetToken: req.params.token, PasswordResetTokenExpires: {$gt: Date.now()}});

    if(!user){
        const error = new CustomError('Token is invalid or has expired!', 400);
        next(error);
    }
     
    //RESETING THE USER PASSWORD
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.PasswordResetToken = undefined;
    user.PasswordResetTokenExpires = undefined;
    user.PasswordChangedAt = Date.now();

    user.save();

    //LOGIN THE USER
    createSendResponse(user, 201, res);
    // const token = signToken(user._id);

    //     res.status(201).json({
    //         statu: 'success',
    //         token,
    //     });
}