const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// name, email, password, confirmPassword, photo
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        reuired: [true, 'please enter an Email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please enter a valid Email']
    },
    photo: String,
    role : {
        type: String,
        enum: ['User', 'admin'],
        default: 'User'
    },
    password: {
        type: String,
        required: [true, 'please enter a Password'],
        minlength: 10,
        select: false
    },
    confirmPassword: {
        type: String,
        required: [true, 'Please confirm your paasword'],
        validate:{
            //This validation is only for save() and create()
            validator: function(val){
                return val == this.password;
            },
            message: 'Password & confirm password do not match!'
        }
    },
    active: {
       type: Boolean,
       default: true,
       select: false 
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenEpires: Date
})

userSchema.pre('save',async function(next) {
    if(!this.isModified('password')) return next();

    // enrypt the password before saving it
    this.password = await bcrypt.hash(this.password, 12);

    this.confirmPassword = undefined;
    next();
});

userSchema.pre(/^find/, function(next){
    //this keyword in thefunction will point to current query
    this.find({active: {$ne: false}});
    next();
})

userSchema.methods.comparePasswordInDb = async function(pswd, pswdDB){
    return await bcrypt.compare(pswd, pswdDB)
}

userSchema.methods.isPasswordChanged = async function(JWTTimestamp) {
    if(this.passwordChangedAt){
        const PasswordChangedTimestamp = parseInt(this.passwordChangedAt.getTime() /1000, 10);
        console.log(PasswordChangedTimestamp, JWTTimestamp);

        return JWTTimestamp < PasswordChangedTimestamp;
    }
    return false;

}

userSchema.methods.createResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hax');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hax');
    this.passwordResetTokenEpires = Date.now() + 10 * 60 * 1000;
    
    console.log(resetToken, this.passwordResetToken);

    return resetToken;
}

const User = mongoose.model('User', userSchema);

module.exports = User;