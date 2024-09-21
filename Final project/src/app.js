
require('dotenv').config();
const express = require("express");
// import cors from 'cors'
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose'); 
const crypto = require('crypto');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { MaidDataReg , otpModel, Booking, Document  } = require('./model/model');

const otpGenerator = require('otp-generator');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 4000;

app.setMaxListeners(15);

const userController = require('../controllers/userController');


const template_path = path.join(__dirname, "../templete/views"); 

app.set('view engine', 'ejs');
app.set('views', template_path);

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/js', express.static(path.join(__dirname, '../js')));


const publicPath = path.join(__dirname, '../templete/views/public');
app.use(express.static(publicPath));

// Serve static files from the 'uploads' directory
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));


mongoose.connect('mongodb://localhost:27017/maidregistration', {
    
}).then(() => {
    console.log(`Database Connection successful`);
}).catch((error) => {
    console.error(`Connection error:`, error);
});


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = new twilio(accountSid, authToken);

// Define routes
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;

app.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;

    // Parse and validate the phone number
    const phoneNumber = phoneUtil.parseAndKeepRawInput(phone, 'IN');
    if (!phoneUtil.isValidNumber(phoneNumber)) {
      throw new Error('Invalid phone number');
    }

    // Format the phone number in international format
    const formattedPhone = phoneUtil.format(phoneNumber, PNF.E164);

    const otp = otpGenerator.generate(4, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
    const cdate = new Date();

    await otpModel.findOneAndUpdate(
      { phone: formattedPhone },
      { otp, otpExpiration: new Date(cdate.getTime()) },
      { upsert: true, new: true, setDefaultOnInsert: true }
    );

    await twilioClient.messages.create({
      body: `${otp} : तुमचा Maid For You Verification कोड आहे. सुरक्षिततेच्या कारणास्तव, कृपया हे कोणाशीही शेअर करू नका`,
      to: formattedPhone,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    // return res.status(200).json({
    //   success: true,
    //   msg: 'OTP Sent Successfully!'
    // });

    res.render('verify_otp');
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message
    });
  }
});




app.post('/verify', async (req, res) => {
  try {
    const { otp } = req.body;

    // Find the OTP document for the provided OTP
    const otpDoc = await otpModel.findOne({ otp });
    
    // Check if OTP document exists
    if (!otpDoc) {
      res.render('otpverifyfailed');
    }

    // If all checks pass, OTP is verified successfully
    res.render('otpverifysuccess');
    
  } catch (error) {
    res.render('otpverifyfailed');
  }
});

   


app.get('/', (req, res) => {
    res.render('index');
});


app.use('./uploads', express.static(path.join(__dirname, 'uploads')));


//  mongoose.connect('mongodb://localhost:27017/mydb');
const conn = mongoose.connection;

// Init gfs


// Define schema


// Storage engine
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const newFile = new MaidDataReg({
      name: req.body.name,
      service: req.body.service,
      city: req.body.city,
      gender: req.body.gender,
      address: req.body.address,
      phone: req.body.phone,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      image: {
        data: req.file.buffer,
        contentType: req.file.mimetype
      }
    });

    const savedmaid = await newFile.save();
    if (savedmaid) {
      res.render('success');
      
    } else {
      res.render('failed');
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/images', async (req, res) => {
  const images = await Image.find().sort({_id: -1});
  res.render('images', {images:images});
  
})



app.use(session({
  secret: process.env.SECREATE_KEY, 
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 
  }
}));




app.get('/profile', async (req, res) => {
  try {
      // Check if user is logged in
      if (!req.session.userId) {
          return res.status(401).send('Unauthorized');
      }

      // Fetch the data from MongoDB based on the logged-in user's ID
      const maidData = await MaidDataReg.findOne({ _id: req.session.userId });
      

      // Render the profile page and pass the fetched data to it
      // res.render('profile', { maidData });
      res.render('profile', { maidData: maidData})
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});


// Add a route to handle profile updates
app.post('/updateprofile', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }

    // Get the updated profile data from the request body
    const updatedProfileData = {
      name: req.body.name,
      service: req.body.service,
      city: req.body.city,
      phone: req.body.phone,
      // Add more fields as needed
    };

    // Update the profile data in MongoDB based on the logged-in user's ID
    const updatedProfile = await MaidDataReg.findByIdAndUpdate(req.session.userId, updatedProfileData, { new: true });

    // Check if the profile was successfully updated
    if (!updatedProfile) {
      return res.status(404).send('Profile not found.');
    }

    // Redirect to the profile page after successful update
    res.redirect('/profile');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a route to handle password updates
app.post('/updatepassword', async (req, res) => {
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).send('Unauthorized');
    }

    const { newPassword, confirmNewPassword } = req.body;

    // Check if newPassword and confirmNewPassword match
    if (newPassword !== confirmNewPassword) {
      return res.status(400).send('Passwords do not match.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in MongoDB based on the logged-in user's ID
    const updatedUser = await MaidDataReg.findByIdAndUpdate(req.session.userId, { password: hashedPassword }, { new: true });

    // Check if the user was found and the password was successfully updated
    if (!updatedUser) {
      return res.status(404).send('User not found.');
    }

    // Redirect to the profile page after successful password update
    res.redirect('/profile');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get('/project', async (req, res) => {
  try {
      // Fetch maid data from the database
      const maidData = await MaidDataReg.find();
      // Render the 'project' view and pass maidData to it
      res.render('project', { maidData });
  } catch (err) {
      // Handle errors
      res.status(500).json({ error: err.message });
  }
});


app.get('/maiddetail/:id', async (req, res) => {
  try {
    // Fetch maid data from the database based on the provided ID
    const maidData = await MaidDataReg.findById(req.params.id);
    // Render the 'maiddetail' view and pass maidData to it
    res.render('maiddetail', { maidData });
  } catch (err) {
    // Handle errors
    res.status(500).json({ error: err.message });
  }
});









app.get('/login', (req, res) => {
    res.render('login');
});




app.post('/loginpage', async (req, res) => {
  try {
      const phone = req.body.phone;
      const password = req.body.password;

      const user = await MaidDataReg.findOne({ phone: phone });
      if (!user) {
          return res.status(404).send('User not found.');
      }

      const passmatch = await bcrypt.compare(password, user.password);
      if (!passmatch) {
        res.render('loginerror');
      }

      // Store user ID in session
      req.session.userId = user._id;

       if (passmatch) {
                   res.render('home');
        
                } else {
                  //  res.status(400).send('Passwords do not match.');
                  res.render('loginerror');
               }
  } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while processing your request.");
  }
});


app.post('/booking', async (req, res) => {
  try {
    const newBooking = new Booking({
      fname: req.body.fname,
      phonenumber: req.body.phonenumber,
      date: req.body.date,
      time: req.body.time,
      message: req.body.message
    });

    const bookingData = await newBooking.save();
    if (bookingData) {
      res.render('bookingmessage');
      
    } else {
      res.render('bookingerror');
    }
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.phonenumber) {
      return res.status(400).send('Phone number already exists');
    }
    res.status(500).json({ error: err.message });
  }
});



// Add a route to fetch booking data
app.get('/bookings', async (req, res) => {
  try {
    // Fetch all booking data from the database
    const bookings = await Booking.find();
    res.render('bookings', { bookings });
  } catch (err) {
    res.render('bookingerror');
  }
});



const storages = multer.memoryStorage();
const uploads = multer({ storage: storage });



app.post('/uploaddocuments', upload.fields([
  { name: 'aadhar', maxCount: 1 },
  { name: 'noc', maxCount: 1 },
  { name: 'certificate', maxCount: 1 }
]), async (req, res) => {
  try {
    // Save uploaded documents to MongoDB
    const aadhar = req.files['aadhar'][0];
    const noc = req.files['noc'][0];
    const certificate = req.files['certificate'][0];

    const aadharDocument = new Document({
      name: aadhar.originalname,
      data: aadhar.buffer,
      contentType: aadhar.mimetype,
    });

    const nocDocument = new Document({
      name: noc.originalname,
      data: noc.buffer,
      contentType: noc.mimetype,
    });

    const certificateDocument = new Document({
      name: certificate.originalname,
      data: certificate.buffer,
      contentType: certificate.mimetype,
    });

    await Promise.all([
      aadharDocument.save(),
      nocDocument.save(),
      certificateDocument.save(),
    ]);

    res.render('index');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading documents.');
  }
});

app.get('/documents', async (req, res) => {
  try {
    const documents = await Document.find(); // Fetch all documents from MongoDB
    res.render('documents', { documents }); // Pass documents array to the template
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching documents.');
  }
});


app.get('/images', (req, res) => {
  res.render('images');
});


app.get('/index', (req, res) => {
    res.render('index'); 
});

app.get('/send_otp', (req, res) => {
    res.render('send_otp'); 
});

app.get('/verify_otp', (req, res) => {
    res.render('verify_otp'); 
});

app.get('/update', (req, res) => {
    res.render('update'); 
});

app.get('/contact', (req, res) => {
  res.render('contact'); 
});

app.get('/about', (req, res) => {
  res.render('about'); 
});

app.get('/profile', (req, res) => {
  res.render('profile'); 
});

app.get('/project', (req, res) => {
  res.render('project'); 
});

app.get('/service', (req, res) => {
  res.render('service'); 
});

app.get('/signup', (req, res) => {
  res.render('signup'); 
});
app.get('/updatepro', (req, res) => {
  res.render('updatepro'); 
});
app.get('/home', (req, res) => {
  res.render('home'); 
});

app.get('/thanks', (req, res) => {
  res.render('thanks'); 
});

app.get('/success', (req, res) => {
  res.render('success'); 
});

app.get('/failed', (req, res) => {
  res.render('failed'); 
});

app.get('/imagestore', (req, res) => {
  res.render('imagestore'); 
});

app.get('/maiddetail', (req, res) => {
  res.render('maiddetail'); 
});

app.get('/loginerror', (req, res) => {
  res.render('loginerror'); 
});

app.get('/about2', (req, res) => {
  res.render('about2'); 
});

app.get('/service2', (req, res) => {
  res.render('service2'); 
});

app.get('/project2', (req, res) => {
  res.render('project2'); 
});

app.get('/contact2', (req, res) => {
  res.render('contact2'); 
});

app.get('/booked', (req, res) => {
  res.render('booked'); 
});

app.get('/bookingdata', (req, res) => {
  res.render('bookingdata'); 
});

app.get('/xyz', (req, res) => {
  res.render('xyz'); 
});

app.get('/uploaddocument', (req, res) => {
  res.render('uploaddocument'); 
});

app.get('/document', (req, res) => {
  res.render('document'); 
});

app.get('/otpverifysuccess', (req, res) => {
  res.render('otpverifysuccess'); 
});

app.get('/otpverifyfailed', (req, res) => {
  res.render('otpverifyfailed'); 
});

app.get('/bookingmessage', (req, res) => {
  res.render('bookingmessage'); 
});

app.get('/bookingerror', (req, res) => {
  res.render('bookingerror'); 
});

app.get('/accept', (req, res) => {
  res.render('accept'); 

});

app.get('/reject', (req, res) => {
  res.render('reject'); 

});



const staticPath = path.join(__dirname, '../templete/views/public/css')

 app.use(express.static(staticPath));
 app.use(express.static(path.join(__dirname, '../templete/views/public/img')));
 app.use(express.static(path.join(__dirname, '../templete/views/public/js')));





app.listen(port, () => {
    console.log(`Server running at port no ${port}`);
});



