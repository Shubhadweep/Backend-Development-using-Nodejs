const express = require('express');
const route = express.Router();
const {getSignupForm,getLogin,logout,getDashboard,
      forgotPassword,signupPost,postLogin,postforgotPassword,mail_confirmation,
      emilForForgotPass,postemilForForgotPass,passWordCreationPage} = require('../Controller/authController');

route.get("/Signup",getSignupForm);
route.get("/Login",getLogin);
route.get("/Logout",logout);
route.get("/DashBoard",getDashboard);

route.get("/emailForForgetPass",emilForForgotPass);
route.post("/postEmailForgotPass",postemilForForgotPass);

route.get("/fogetPassword",forgotPassword);
route.post("/PostforgotPass",postforgotPassword);

route.get("/mail_confirmation/:email/:token",mail_confirmation);
route.get("/reset_Password/:email",passWordCreationPage);


route.post("/PostSignup",signupPost);
route.post("/PostLogin",postLogin);







module.exports = route;