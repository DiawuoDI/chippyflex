const User = require('../models/userModel');
const asyncErrorHandler = require('../utils/asyncErrorHandler');
const jwt = require('jsonwebtoken');
const CustomError = require('../utils/CustomError');
// const util = require('util');
// const sendEmail = require('../utils/email');
// const crypto = require('crypto');

exports.getAllUsers = async(req, res, next) => {
    const users = await users.find();
    
    res.status(200).json({
        status: 'success',
        result: users.length,
        data: {
            users
        }
    })
}

const filterReqObj = (Obj, ...allowFilds) => {
    const newObj = {};
    Object.keys(Obj).forEach(prop => {
        if(allowFilds.includes(prop))
        newObj[prop] = Obj[prop];
    }) 
    return newObj; 
}


exports.updatePassword = async(req, res, next) => {
    //GET CURRENT USER DATA FROM DATABASE
    const user = await User.findById(req.user._id).select('+password');

    //CHECK IF THE SUPPLIED CURRENT PASSWORD IS CORRECT
    if(!(await user.comparepasswordInDb(req.body.currentPassword, user.password))){
        return next(new CustomError('The current password you provided is wrong', 401));
    }

    //IF SUPPLIED PASSWORD IS CORRECT, UPDATE USER PASSWORD WITH NEW VALUE
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();

    //LOGIN USER & SEND JWT
    //createSendResponse(user, 201, res);
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
}

exports.updateMe = async(req, res, next) => {
    //CHECK IF REQUEST DATA CONTAIN PASSWORD | CONFIRMPASSWORD 
    if(req.body.password || req.body.confirmPassword){
        return next(new CustomError('You cant update your password using this endpoint', 401));
    }

    //UPDATE USER DETAIL
    const filterObj = filterObj(req.body, 'name, email')
    const updatedUser = await User.findByIdAndUpdate(req.User.id, filterObj, {runValidators: true, new: true})

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    })
    // await user.save();
}

exports.deleteMe = async(req, res, next) => {
    const user = await user.findByIdAndUpdate(req.user.id, {active: false});

    res.status(204).json({
        status: 'success',
        data: null
    })
}