const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/maidregistration', {
    
}).then(() => {
    console.log(`Connection successful`);
}).catch((error) => {
    console.error(`Connection error:`, error);
});
