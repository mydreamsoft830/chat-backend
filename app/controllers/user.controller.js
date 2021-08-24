const models = require('../models');
var { Op } = require('sequelize')
const moment = require('moment');
const { randomBytes } = require('crypto');
const securePassword = require('secure-password');
const jwt  = require('jsonwebtoken');
const constants = require('../config/constant');
var _log = constants._log;

const formidable = require('formidable');
const fileHandler = require('./file.controller');

const mail = require('../services/mail.service');
const errorE = require ('../services/error.service');

const {User,Profile,Subscribe} = models;
const passT = securePassword();


const opts = {};
opts.secretOrKey = constants.secretOrKey;

const getUserByEmail = async (email) => {
  const myUser = await User.findOne(
    {
      where: {
        email,
      },
    }
  );
  return myUser;
};

const getUserById = async (id) => {
  const myUser = await User.findOne(
    {
      where: {
        id,
      },
      include: [{
        model: Profile
      }]
    }
  );
  return myUser;
};

const getBetaUserById = async (id) => {
  const myUser = await UserBeta.findOne(
    {
      where: {
        id,
      },
    }
  );
  return myUser;
};

const getUserByUsername = async (username) => {
  const myUser = await User.findOne(
    {
      where: {
        username,
      }
    }
  );
  return myUser;
};

function randomInt() {
  return Math.floor(Math.random() * (9999 - 1000) + 1000)
}

/*-- Main Code --*/


const login = async (req, res) => {  
  _log && console.log('---user login request---')
  _log && console.log(req.body.values)
  
  const { email, password } = req.body.values;
  const existingUser = await getUserByEmail(email);
  let error ='Your email or password is incorrect. Please check and try again.';
  if (existingUser === null) {
    res.json({ success : false, error: error});
  }else{    
    const passwordBuf = Buffer.from(password);
    const hashBuf = Buffer.from(existingUser.password, 'base64');
    const pwdResponse = passT.verifySync(passwordBuf, hashBuf);
    if (pwdResponse === securePassword.VALID && existingUser.new_user === false) {
      const userProfile = await existingUser.getProfile();
      const user = {
        userId: existingUser.id,
        username: existingUser.username,
        email: existingUser.email,
        new_user: existingUser.new_user,
        profile: userProfile,
      };
      const payload = {
        id: existingUser.id,
        //type: existingUser.role
      };

      const token = jwt.sign(payload, opts.secretOrKey);
      res.json({ success : true, message: 'success', token : token, user : user,status : 200});
    }else if(existingUser.new_user === true){
      res.json({ success : false, error: 'Please verify your account!'});
    }else{
      res.json({ success : false, error: error});
    }
  } 
};

const register = async (req, res) => {  
  _log && console.log('---user register request---')
  _log && console.log(req.body.values)

  const { email, password, username, phone_number, country_id } = req.body.values;

  const existingUserEmail = await getUserByEmail(email);

  if (existingUserEmail !== null) {
    let message ='We’re sorry, this email address has already been used. ';
    res.json({ success : false, error: message, status : 200});
  }else{
    const token = randomBytes(32).toString('hex');
    const hashedPw = passT.hashSync(Buffer.from(password)).toString('base64');
    const pw_token = randomInt().toString();
    let currentDate = new Date();
    let pw_token_expire_at = moment(currentDate).add(1, 'days');    

    const newUser = await User.create({
      email : email,
      username :  username,
      token : token,
      pw_token : pw_token,
      pw_token_expire_at : pw_token_expire_at,
      //role,
      password : hashedPw,
      token_created_at: new Date(),
      Profile: {
        display_name: username,
        country_id : country_id,
        phone_number : phone_number
      }
    }, {
      include: [Profile]
    });    
    _log && console.log(newUser.dataValues);
    mail.sendMessageUser(newUser.dataValues.id,0);
    res.json({ success : true, message: 'success', token : token, user : newUser.dataValues,status : 200});
  } 
};

const verify = async (req, res) => {  
  _log && console.log('---user verify request---')
  _log && console.log(req.query)

  const { email, pw_token } = req.query;

  const verifyUser = await User.findOne({
    where: {
      email : email,
      pw_token : pw_token,
      pw_token_expire_at: {
        [Op.gte]: moment().toDate()
      }
    }
  })
  
  if (verifyUser !== undefined && verifyUser !== null) {
    _log && console.log('-------',verifyUser.dataValues && verifyUser.dataValues)
    _log && console.log('verifyUser',verifyUser)

    verifyUser.new_user = false;
    
    verifyUser.pw_token = '0000';
    await verifyUser.save();
    mail.sendMessageUser(verifyUser.dataValues.id,1);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<script>alert("Yay, your account is verified");window.location="https://wispri.com";</script>');
    res.end();
    // return res.json({
    //   message : 'Verify succeses!'
    // })
  }else{
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('We\'re sorry, this token has already been used.');
  } 
};

const forgot = async (req, res) => {
  const { email } = req.body.values;
  var pw_token = randomInt().toString();
  var currentDate = new Date();
  var pw_token_expire_at = moment(currentDate).add(1, 'days');  
  const forgotUser = await User.findOne({
    where: {
      email : email,
    }
  })  
  if (forgotUser !== undefined && forgotUser !== null) {
    forgotUser.pw_token = pw_token;
    forgotUser.pw_token_expire_at = pw_token_expire_at;
    await forgotUser.save();
    mail.sendMessageForgot(forgotUser.id,0);
    res.json({ success : true, 
      message: 'Check your mail, we have sent you instructions for a password reset.', status : 200}
    );
  }else{
    res.json({ success : false, error: 'We\'re sorry, something\'s gone wrong. Please try again later'});
  } 
}

const reset = async (req, res) => {
  const { email,pw_token,password } = req.body.values ;
  _log && console.log(req.body.values)
  const resetUser = await User.findOne({
    where: {
      email : email,
      pw_token : pw_token,
      pw_token_expire_at: {
        [Op.gte]: moment().toDate()
      }
    }
  })
  _log && console.log(resetUser)
  if (resetUser !== undefined && resetUser !== null && pw_token!=='0000') {
    let salt = Math.round((new Date().valueOf() * Math.random())) + '';
    const hashedPw = passT.hashSync(Buffer.from(password)).toString('base64');
    resetUser.password = hashedPw ;
    resetUser.pw_token = '0000' ;
    await resetUser.save();
    mail.sendMessageReset(resetUser.id,0);
    res.json({ success : true , message: 'Successes!', status : 200});
  }else{
    let message ='The data is invalid!';
    res.json({ success : false, error: message, status : 200});
  }  
}

const getUserProfile = async (userId) => {
  const myUser = await Profile.findOne(
    {
      where: {
        user_id: userId,
      }
    }
  );
  return myUser;
};

const getProfileByUsername = async (username) => {
  const user = await getUserByUsername(username);
  return getUserProfile(user.id);
};

const getProfileByEmail = async (email) => {
  const user = await getUserByEmail(email);
  return getUserProfile(user.id);
};

const getProfileById = async (id) => {
  const user = await getUserById(id);
  return getUserProfile(user.id);
};


const profile = async (req, res) => {  
  _log && console.log('---user profile change request---')
  _log && console.log(req.body.values)
  _log && console.log(req.user.id)

  const { email, password, username, phone_number, country_id, avatar_link } = req.body.values;  
  const existingUser = await getUserById(req.user.id);
  existingUser.email = email;
  if( password !== undefined ){
    const hashedPw = passT.hashSync(Buffer.from(password)).toString('base64');
    existingUser.password = hashedPw;
  }

  await existingUser.save();
  const existingProfile = await getProfileById(req.user.id);
  if (existingProfile === null) {
    const newProfile = await Profile.create({
      display_name: username,
      avatar_link: avatar_link,
      country_id: country_id,
      phone_number: phone_number
    });
    res.json({ success : true, message: 'success', profile : newProfile.dataValues,status : 200});
  } else {
    existingProfile.display_name = username;
    existingProfile.avatar_link = avatar_link;
    existingProfile.country_id = country_id;
    existingProfile.phone_number = phone_number;
    await existingProfile.save();
    res.json({ success : true, message: 'success', profile : existingProfile.dataValues,status : 200});
  }  
};

const avatar = async (req, res) => {  
  let form = new formidable.IncomingForm()
  form.keepExtensions = true;
  _log && console.log(req.body)

  form.parse(req, (err, fields, files) => {
		if (err) {
			return res.json({
				error: 'Image could not be uploaded'
      })
		}else{
      if (files.file) {
        fileHandler.uploadFileToS3(files);
        setTimeout(function () {
          let avatarPath = fileHandler.getS3FilePath();
          res.json({ success : true, message: 'success', avatarPath : avatarPath, status : 200});
        }, 1000);
      }
    }
	});
};

const getSubscribeByEmail = async (email) => {
  const subscribe = await Subscribe.findOne(
    {
      where: {
        email : email,
      },
    }
  );
  return subscribe;
};

const subscribe = async (req, res) => {
  _log && console.log('---user subscribe request---')
  _log && console.log(req.body)
  const existingSubscribeEmail = await getSubscribeByEmail(req.body.values);

  if (existingSubscribeEmail !== null) {
    let message ='We’re sorry, this email address has already been used. ';
    res.json({ success : false, error: message, status : 200});
  }else{
    const newSubscribe = await Subscribe.create({
      email : req.body.values
    });    
    _log && console.log(newSubscribe.dataValues);
    res.json({ success : true, message: 'success', subscribe : newSubscribe.dataValues,status : 200});
  }
};

module.exports = {
  login,
  register,
  profile,
  verify,
  forgot,
  reset,
  avatar,
  subscribe
}

