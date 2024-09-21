

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Schema = mongoose.Schema;

// Employee Schema
const empSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        required: true,
        
    },
    city: {
        type: String,
        required: true,
        
    },

    gender: {
        type: String,
        required: true,
        
    },

    address: {
        type: String,
        required: true,
        
    },

    phone: {
        type: Number,
        required: true,
    },

    image: {
        data: Buffer,
        contentType: String
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: true,
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    
    filename: String,
    contentType: String,
    uploadDate: Date


});




const otpSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    otpExpiration: {
        type: Date,
        required: true,
    }
});




const bookingSchema = new Schema ({
    fname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: Number,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
});

const documentSchema = new mongoose.Schema({
    name: String,
    data: Buffer,
    contentType: String,
  }); 



// Methods and Hooks for Employee Schema
empSchema.methods.createtoken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id }, 'qwertyuiopasdfghjklzxcvbnmmnbvcxzlkjhgfdsapoiuytrewq');
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

empSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Clear confirmPassword field only if it's present and password is modified
    if (this.isModified('password') && this.confirmPassword) {
        this.confirmPassword = undefined;
    }

    next();
});

// Create and export the Employee model
const MaidDataReg = mongoose.model('maiddatareg', empSchema);
// module.exports.MaidDataReg = MaidDataReg;

// Create and export the OTP model
const otpModel = mongoose.model('otp', otpSchema);

// const Image = mongoose.model('Image', imageSchema);

const Booking = mongoose.model('booking', bookingSchema);

const Document = mongoose.model('Document', documentSchema);

module.exports = { MaidDataReg, otpModel, Booking, Document };


