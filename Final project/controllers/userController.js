
const { otpModel } = require('../src/model/model');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const accountSid = "ACc3b103f1085609aaa2997128f657142a";
const authToken = "379615b398a1426bf5827fbc948bba69";

const twilioClient = new twilio(accountSid, authToken);

const sendOtp = async(req, res) =>{
    try{

        const { phone } = req.body;

        const otp = otpGenerator.generate(4,{upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false});

        const cdate = new Date();

        await otpModel.findOneAndUpdate(
            { phone : phone },
            { otp,  otpExpiration: new Date(cdate.getTime()) },
            { upsert: true, new: true, setDefaultOnInsert: true }
        );


        await  twilioClient.messages.create({

            body: `${otp} : is your MFU verification code. For security reasons, please do not share this with anyone.`,
            to: phone,
            from: "+12605777483"
        });

        return res.status(200).json({
            success:true,
            msg: 'OTP Sent Successfully!' // Corrected message
        })
    }
    catch(error){
        return res.status(400).json({
            success:false,
            msg: error.message
        })
    }
}

const verifyOtp = async(req, res) => {
    try {
        const { phone, otp } = req.body;

        // Find the OTP document for the provided phone number
        const otpDoc = await otpModel.findOne({ phone });

        if (!otpDoc) {
            return res.status(404).json({
                success: false,
                msg: 'OTP not found. Please request a new OTP.'
            });
        }

        // Check if OTP is expired
        const now = new Date();
        if (otpDoc.otpExpiration < now) {
            return res.status(400).json({
                success: false,
                msg: 'OTP has expired. Please request a new OTP.'
            });
        }

        // Check if OTP matches
        if (otpDoc.otp !== otp) {
            return res.status(400).json({
                success: false,
                msg: 'Invalid OTP. Please enter the correct OTP.'
            });
        }

        // If all checks pass, OTP is verified
        return res.status(200).json({
            success: true,
            msg: 'OTP Verified Successfully!'
        });
    } catch(error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

module.exports = {
    sendOtp, verifyOtp
}
