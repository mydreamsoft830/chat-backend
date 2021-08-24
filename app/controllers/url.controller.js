const models = require('../models');
var { Op } = require('sequelize')
const { randomBytes } = require('crypto');
const securePassword = require('secure-password');
const jwt  = require('jsonwebtoken');
const constants = require('../config/constant');
var _log = constants._log;


const formidable = require('formidable');
const fileHandler = require('./file.controller');

const errorE = require ('../services/error.service');

const {User,Profile,Url} = models;
const passT = securePassword();
const moment = require('moment');

const opts = {};
opts.secretOrKey = 'mysooperdoopersecretthatyoucantknow';

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

/*-- Main Code --*/

const save = async (req, res) => {  
  _log && console.log('---url save request---')
  _log && console.log(req.body.values)
  try{
    const { userid, url, urlinfo, desired_price} = req.body.values;
    let currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
    let futureMonth = moment(currentDate).add(1, 'M');    
    const existUrls = await Url.findAll({
      where :{
        UserId: userid,
        url: url
      }
    });
    _log && console.log('existUrls',existUrls,existUrls.length)
    if(existUrls.length === 0){
      const newUrl = await Url.create({
        url: url,
        desired_price: desired_price,
        UserId : userid,
        //url info
        country: urlinfo.country,
        currency: urlinfo.currency,
        current_price: urlinfo.current_price,
        description: urlinfo.description,
        domain: urlinfo.domain,
        image: urlinfo.image,
        name: urlinfo.name,
        short_url: urlinfo.short_url,
        title: urlinfo.title,
        other_url: urlinfo.url,
        expire_at : futureMonth,
        bell : true,
        last_at : new Date()
      });
      res.json({ success : true, message: 'success', url : newUrl.dataValues,status : 200});
    } else {
      throw new Error('The URL already exists.');
    } 
  }catch(e){
    res.json({ success : false, error : e.message, status : 200});
  } 
};

const load = async (req, res) => { 
  _log && console.log('---url load request---') 
  _log && console.log(req.user,req.body);
  var userid = req.user.id;
  var searchstr = req.body.searchstr;
  if(searchstr==null) searchstr='';
  const userUrls = await Url.findAll({
    where :{
      UserId: userid ,
      [Op.or]: [
        {
          name : {
            [Op.like]: '%'+searchstr+'%'
          }
        },{
          domain : {
            [Op.like]: '%'+searchstr+'%'
          }
        }  
      ]      
    }
  });
  //_log && console.log(userUrls)
  res.json({ success : true, message: 'success', userUrls : userUrls, status : 200});
};

const update = async (req, res) => {  
  _log && console.log('---url update request---')
  _log && console.log(req.body)

  const {urlid,desired_price} = req.body;
  const userUrls = await Url.findOne({
    where :{
      id: urlid
    }
  });
  _log && console.log(userUrls)
  if(userUrls !== null){
    userUrls.desired_price = desired_price;
    await userUrls.save();
    res.json({ success : true, message: 'success', userUrls : userUrls, status : 200});
  }else{
    res.json({ success : false, error: 'That url not exists!', status : 200});
  }
};

const bell = async (req, res) => {  
  _log && console.log('---url bell request---')
  _log && console.log(req.body)

  const {urlid} = req.body;
  const userUrls = await Url.findOne({
    where :{
      id: urlid
    }
  });
  _log && console.log(userUrls)
  if(userUrls !== null){
    userUrls.bell = !userUrls.bell;
    await userUrls.save();
    res.json({ success : true, message: 'success', userUrls : userUrls, status : 200});
  }else{
    res.json({ success : false, error: 'That url not exists!', status : 200});
  }
};

const remove = async (req, res) => {  
  _log && console.log('---url remove request---')
  _log && console.log(req.body)

  const {urlid} = req.body;
  const userUrls = await Url.findOne({
    where :{
      id: urlid
    }
  });
  _log && console.log(userUrls)
  if(userUrls !== null){
    await userUrls.destroy();
    res.json({ success : true, message: 'success', userUrls : userUrls, status : 200});
  }else{
    res.json({ success : false, error: 'That url not exists!', status : 200});
  }
};


var apiUrl = constants.apiUrl;
var axios = require('axios');
axios.defaults.timeout = constants.defaultstimeout;

const fetch = async (req, res) => {  
  _log && console.log('---url fetch request---')
  _log && console.log(req.body)

  const {url} = req.body;
  let data = await axios.get(apiUrl+url).catch(e => 'error');
  console.log('fetch data',data.data);
  res.json(data.data);
};

module.exports = {
  save,
  load,
  update,
  bell,
  remove,
  fetch
}

