const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let authSchema = new Schema({
    fullName:{
        type: String,
        required:true
    },
    mail_Id:{
        type: String,
        required:true
    },
    contact_number:{
        type: Number,
        require: true
    },
    password:{
        type: String,
        required:true
    },
    gender:{
        type: String,
        required: true
    },
    isVerified:{
        type:Boolean,
        default:false
    }
    
},
{
    timestamps:true,
    versionKey:false
})

const signupLoginModel = new mongoose.model("SignUpLoginSystem",authSchema);
module.exports = signupLoginModel;