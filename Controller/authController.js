const systemModel = require('../Model/authModel');
// Token Declaration: 
const TokenModel = require("../Model/tokenModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host:'smtp',
    port:465,
    secure:false,
    requireTLS: true,
    service:'gmail',
    auth:{
        user:'rohanslife1202@gmail.com',
        pass: 'ifyq bscp rxrh xdsv'
    }
})

const getSignupForm = (req,res)=>{
    let errEmail = req.flash('error1');
    console.log("Error sms for email Collected from SignUp Form: ",errEmail);
    let mailSms = (errEmail.length>0 ? errEmail[0] : null);

    let errPassword = req.flash("error2");
    console.log("Error sms for Password collected from Signup Form: ",errPassword);
    let passwordSms = (errPassword.length>0 ? errPassword[0] : null);
    res.render("Authentication/Signup",{
        title:'Registration Page',
        mailData : mailSms,
        passwordData : passwordSms
    })
}

const signupPost = async(req,res)=>{
    try{
        let emailId = req.body.email;
        console.log("The Email Id got from the Form: ",emailId,req.body.Gender);

        let existMail = await systemModel.findOne({mail_Id:emailId});
        if(existMail){
            console.log("Someone has already registered before with this mail Id");
            req.flash("error1","Some one has already registered before with this mail Id"); 
            res.redirect("/Signup");
        }else if(req.body.password !== req.body.repeatPass){
            console.log("Your Password and Confirm Password does't match");
            req.flash("error2","Your Password and Confirm Password does't match");
            res.redirect("/Signup");
        }
        else{

            let hashPassword = await bcrypt.hash(req.body.password,12);
            console.log("The Generated Hash password is: ",hashPassword);

            let registrationData = new systemModel({
                fullName:req.body.Fullname,
                mail_Id: req.body.email,
                contact_number:req.body.contact_No,
                password:hashPassword,
                gender:req.body.Gender
            })

            let saved = await registrationData.save();
            if(saved){
                console.log("The data is Saved Successfully into the Database");
                
                 const token_jwt = jwt.sign(
                    {email:req.body.email},
                    "secretkey12345@secretkey1234589641",
                     {expiresIn: "1h"} // It is user given
                 );
                 const Token_data = new TokenModel({
                    token: token_jwt,
                    _userId:saved._id
                 });
                 let token_saved = await Token_data.save();
                 if(token_saved){

                    let mailOptions ={
                        from:'rohanslife1202@gmail.com',
                        to: req.body.email,
                        subject:'Email Verification',
                        text: 'Welcome '+saved.fullName+'\n\n'
                        +'You have Successfully Submitted your Data, Please verify your account by clicking the link Below'+ '\n\n'
                        +"http://"+
                        req.headers.host+
                        "/mail_confirmation/"+
                        req.body.email+"/"+
                        token_jwt+
                        "\n\nThank You"
                    }
    
                    transporter.sendMail(mailOptions,function(error,info){
                        if(error){
                            console.log("Error in Sending Mail ",error);
                            res.redirect("/Signup");
                        }else{
                            console.log("Your Mail has been send to your mail id Successfully : ",info.response);
                            res.redirect("/Login");
                        }
                    })

                 }else{
                    console.log("Error to save Token");
                 }    
            }

        }
    }catch(error){
        console.log("Failed to save data into the database ",error);
    }
}

const getLogin = (req,res)=>{
    let errEmail = req.flash('error1');
    console.log("Error sms Collected for Wrong email for Login: ",errEmail);
    let emailSms = (errEmail.length>0 ? errEmail[0] : null);

    let errPassword = req.flash("error2");
    console.log("Error sms collected for Wrong Password for Login: ",errPassword);
    let passwordSms = (errPassword.length>0 ? errPassword[0] : null);

    let verification = req.flash("verification_Err");
    console.log("User Verification Check sms: ",verification);
    let verificationSms = (verification.length>0 ? verification[0] : null);
    res.render("Authentication/Login",{
        title:'Login Page',
        mailData : emailSms,
        passwordData : passwordSms,
        userVerification: verificationSms
    })
}

const getDashboard = async(req,res)=>{
    let id = req.session.user._id;
    console.log("Session Id: ",id);
    let loginUserDetails = await systemModel.findOne({_id:id});
    console.log("Login user Details From Session: ",loginUserDetails);
    res.render("Authentication/dashBoard",{
        title:'DashBoard',
        data: loginUserDetails
    })
}

const postLogin = async(req,res)=>{
    try{
        console.log("The email and Password collected from the Login form: ",req.body.email,req.body.password);
        let existMail = await systemModel.findOne({mail_Id:req.body.email});
        if(!existMail){
            console.log("Invalid mailId for Login");
            req.flash("error1","Invalid Mail-Id");
            res.redirect("/Login");
        }else if(existMail.isVerified == false){
            req.flash("verification_Err","You are Not a Verified User,You Need to verify Your Account,Your account Verification Link has already Send to your Registered Email Id");
            console.log("The User is Not a verified User");
            res.redirect("/Login");
        } 
        else{
            console.log("The existing User details: ",existMail.password);
            console.log("Password collected from the login Page: ",req.body.password);
            let comparePassword = await bcrypt.compare(req.body.password,existMail.password);
            if(comparePassword){
                req.session.userIsLogin = true;
                req.session.user = existMail;
                await req.session.save((error)=>{
                    if(error){
                        console.log("Session data Saving error: ",error);
                    }else{
                        console.log("Session data is saved Successfully");
                        console.log("Login Successfull");
                        res.redirect("/DashBoard");
                    }
                })
                      
            }else{
                console.log("Wrong Password");
                req.flash("error2","Incorrect or Wrong Password");
                res.redirect("/Login");
            }
        }

    }catch(error){
      console.log("Failed to Log in",error);
    }
}

const logout = async(req,res)=>{
    await req.session.destroy();
    res.redirect("/Login");
}
const emilForForgotPass = (req,res)=>{
    let emailLink = req.flash('PassWordLink');
    console.log("The link for the mail to get the create new Password Page: ",emailLink);
    let emailSms = (emailLink.length > 0 ? emailLink[0] : null);
    res.render("Authentication/emailForForgotPass",{
        title:'Email For Forgot Password',
        emailMessage : emailSms
    })
}

const postemilForForgotPass = async(req,res)=>{
    try{
        console.log("The email got for the Generate new Password: ",req.body.email);
        let existMail = await systemModel.findOne({mail_Id:req.body.email});
        if(existMail){

            let mailOptions ={
                from:'rohanslife1202@gmail.com',
                to: req.body.email,
                subject:'Fogot Password',
                text: 'Hellow '+ existMail.fullName +'\n\n'
                +'You can reset Your Password by clicking the link Below'+ '\n\n'
                +"http://"+
                req.headers.host+
                "/reset_Password/"+
                req.body.email+
                "\n\nThank You"
            }
    
            transporter.sendMail(mailOptions,function(error,info){
                if(error){
                    console.log("Error in Sending Mail ",error);
                    res.redirect("/Signup");
                }else{
                    console.log("Your Forgot password Mail has been send to your mail id Successfully : ",info.response);
                    req.flash("PassWordLink","Check Your Registered Mail Id To get the Link for Create New Password");
                    res.redirect("/emailForForgetPass");
                }
            })

        }else{
            console.log("Invalid Email");
            res.send("Invalid email ID");

        }

        

    }catch(error){
        console.log("Fail to send Forget password mail ",error);
    }
}

const forgotPassword = (req,res)=>{
    console.log("Email Collected from Page: ",req.params.email);
    res.render("Authentication/ForgotPass",{
        title:'Forget Password',
        data: req.params.email
    })
}

const mail_confirmation = async(req,res)=>{
    try{
        console.log("Received mail from Confirmation mail: ",req.params.email);
        console.log("Received token from params: ", req.params.token);
        let userToken = await TokenModel.findOne({token: req.params.token});

        if(userToken){
        let user_data = await systemModel.findOne({mail_Id:req.params.email});
        console.log("Details of the user whose mail verification is Conducting: ",user_data);
        if(user_data.isVerified){
            console.log("User already Verified");
            res.send("Your Mail is Already Verifiled");
        }else{
            user_data.isVerified = true;
            let save_res = await user_data.save();
            if(save_res){
                console.log("Your Account Successfully Verified");
                res.send("Your Email Verification Process Completed Successfully");

            }
        }
    }else{
        console.log("Token link Expires");
    }
        
    }catch(error){
        console.log("Error in Email Verification Process ",error);
    }
}

const passWordCreationPage = (req,res)=>{
    res.render("Authentication/ForgetPass",{
        title:'Foget Password',
        data:req.params.email
    })

}

const postforgotPassword = async(req,res)=>{
    try{
        console.log("The details collected from forgot Password Page: ",req.body.email, req.body.password, req.body.retypePass);
         
        if(req.body.password !==req.body.retypePass){
            res.send("Your New Password and retype new Password Does't Match")
        }else{

            let hashPassword = await bcrypt.hash(req.body.password,12);
             console.log("The Generated Hash password for forget password is: ",hashPassword);

              let newPassword_Data = await systemModel.findOne({mail_Id:req.body.email});
              //console.log("The User Details Collcted for set new Password: ",newPassword);
              newPassword_Data.password = hashPassword;
              let saveNewPass = await newPassword_Data.save();
              if(saveNewPass){
                console.log("Your New password has been saved");
                res.redirect("/Login")
            
              }

        }
        
    }catch(error){
        console.log("Error in new password creation",error);

    }
}

module.exports = {getSignupForm,getLogin,logout,getDashboard,forgotPassword,signupPost,postLogin
    ,postforgotPassword,
    mail_confirmation,
    emilForForgotPass,
    postemilForForgotPass,
    passWordCreationPage};