const { encrypt, compare } = require('../services/crypto');
const { sendMail ,forgotPassword } = require('../services/MAIL');
const User = require('../models/User');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const from = "+12055574079"



const sendSMS= async(to, from,otp)=>{
  await client.messages
    .create({
       body: otp,
       from: from,
       to: to
     })
    .then(message => {console.log(message.sid);
    return message});
}

  module.exports.sendsms= async(req,res) =>{
      const message= await sendSMS(to, from,otp)
      console.log(message);
      res.send(message)
  }



module.exports.signUpUser = async (req, res) => {
  const { Userdata, password } = req.body;
  let Existing 
  if(Userdata.includes("@")){
    Existing = await User.findOne({Userdata:Userdata})
  }else{
    Existing = await User.findOne({mobile_Number:Userdata})
  }

  // Check if user already exist
  
  // if (Existing) {
  //   return res.send('Already existing');
  // }

  // create new user
  const newUser = await createUser(Userdata, password);
  if (!newUser[0]) {
    return res.status(400).send({
      message: 'Unable to create new user',
    });
  }
  res.send(newUser);
};




const createUser = async ( Userdata, password) => {
  
  const hashedPassword = await encrypt(password);
  const otpGenerated = Math.floor(100000 + Math.random() * 900000)
  let newUser
  if(Userdata.includes("@")){
     newUser = await User.create({
      Email:Userdata,
      password: hashedPassword,
      otp: otpGenerated,
    });
    if (!newUser) {
      return [false, 'Unable to sign you up'];
    }
    try {
      let mail= await sendMail({
        to: Userdata,
        OTP: otpGenerated,
      });
      console.log(mail);
      return [true, newUser];
    } catch (error) {
      return [false, 'Unable to sign up, Please try again later', error];
    }
  }else{
     newUser = await User.create({
      mobile_Number:Userdata,
      password: hashedPassword,
      otp: otpGenerated,
    });
    if (!newUser) {
      return [false, 'Unable to sign you up'];
    }
    try {
     sendSMS(`+91${Userdata}`,from,otpGenerated)
      return [true, newUser];
    } catch (error) {
      return [false, 'Unable to sign up, Please try again later', error];
    }
    
  }
 
};


// Verify
module.exports.verify_OTP = async (req, res) => {
  const { Userdata, otp } = req.body;

  let Existing
  if(Userdata.includes("@")){
    Existing = await User.findOne({Email:Userdata})
  }else{
    Existing = await User.findOne({mobile_Number:Userdata})
  }

  if (!Existing) {
    res.send('User not found');
  }
  if (Existing && Existing.otp !== otp) {
    res.send('Invalid OTP');
  }
  const updatedUser = await User.findByIdAndUpdate(Existing._id, {
    $set: { active: true },
  });

  res.send(updatedUser);
};


module.exports.signUpUserData = async (req, res) => {
  const { first_Name, last_Name, Email , mobile_Number,password,country} = req.body;
  
  const Users = await User.findOne({$or: [{Email},{mobile_Number}]})
  // Check if user already exist

  if (!Users) return res.send('No user');

  // create new user
  const updatedUser = await User.findByIdAndUpdate(Users._id, {
    $set: { first_Name, last_Name, Email , mobile_Number,password,country},
  });

  res.send(updatedUser);
};






//Reset Password

module.exports.RestPasswordOTP= async (req, res) => {
  const { Userdata } = req.body;

  // Check if user already exist
  let Existing
  if(Userdata.includes("@")){
    Existing = await User.findOne({Email:Userdata})
  }else{
    Existing = await User.findOne({mobile_Number:Userdata})
  }

  if (!Existing) {
    res.send('User not found');
  }
  const otpGenerated = Math.floor(100000 + Math.random() * 900000)
  const updatedUser = await User.findByIdAndUpdate(Existing._id, {
    $set: { otp: otpGenerated },
  });
  if (!updatedUser) {
    return res.send('Unable to Generate otp')
  }
  try {
    if(Userdata.includes("@")){
      let mail= await sendMail({
        to: Userdata,
        OTP: otpGenerated,
      });
      console.log(mail);
      return res.send("Mail Send");
    }else{
      sendSMS(`+91${Userdata}`,from,otpGenerated)
      return res.send("SMSS Send");
    }
    
     
   } catch (error) {
     return  res.send( 'Unable to Send OTP, Please try again later'+ error);
   }

};



//.RestPasswordOtp

module.exports.RestPasswordOtp = async (req, res) => {
  const { otp,Userdata} = req.body;
  
  let Existing
  if(Userdata.includes("@")){
    Existing = await User.findOne({Email:Userdata})
  }else{
    Existing = await User.findOne({mobile_Number:Userdata})
  }
  if (Existing.otp==otp) {
    return res.send('Correct OTP');
  }else{
    return res.send('No User existing');
  }
};



//RestPasswordLink ---

module.exports.RestPassword = async (req, res) => {
  const { password,Userdata} = req.body;
 
  let Existing
  if(Userdata.includes("@")){
    Existing = await User.findOne({Email:Userdata})
  }else{
    Existing = await User.findOne({mobile_Number:Userdata})
  }
  if (!Existing) {
    return res.send('No User existing');
  }
  const hashedPassword = await encrypt(password);
  const updatedUser = await User.findByIdAndUpdate(Existing._id, {
    $set: { password: hashedPassword },
  });
  if (!updatedUser) {
    return res.send('Password not Updated');
  }else{
    return res.send('Password Updated');
  }
};









//login ------

module.exports.login = async (req, res) => {

  try {
    const {Userdata, password } = req.body;

    if (!(Userdata && password)) {
      res.status(400).send("All input is required");
    }
 
    let Existing
    if(Userdata.includes("@")){
      Existing = await User.findOne({Email:Userdata})
    }else{
      Existing = await User.findOne({mobile_Number:Userdata})
    }
    if (!Existing) {
      return res.send('No User existing');
    }

    if (Existing && (await compare(password, Existing.password))) {

      res.status(200).json(Existing);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }

};





