const models = require('../models');
const constants = require('../config/constant');
var _log = constants._log;
var moment = require('moment');
var { Op } = require('sequelize');

const {User,Profile,Url} = models;

var mail_api_key = constants.mail_api_key;
var mail_domain = constants.mail_domain;
var mailgun = require('mailgun-js')({apiKey: mail_api_key, domain: mail_domain});


const sendMessageUser = async (user_id,message_type) => {
	let _user = await User.findOne(
		{ 
			where: { id : user_id } ,
			include: [{
				model: Profile
			}]
		}
	);
	let user = _user.dataValues;_log && console.log('re',user);
	let data ;
	switch (message_type) {
		case 0 :			
			data = {
				from: 'Wispri <me@samples.mailgun.org>',
				to: user.email,
				subject: 'Verify your account',
				template: 'email_confirm',
				'v:userName': user.Profile.display_name,
				'v:userEmail':  user.email,
				'v:verifyLink':  constants.serverUrl+'/api/user/verify?email='+user.email+'&pw_token='+user.pw_token
			};
			break;
		case 1 :
			data = {
				from: 'Wispri <me@samples.mailgun.org>',
				to: user.email,
				subject: 'Welcome to Wispri',
				template: 'welcome',
				'v:userName': user.Profile.display_name
			};
			break;
		case 2 :
			template = '';
			break;
	}
	
	mailgun.messages().send(data, function (error, body) {
		_log && console.log(body);
	});
};

const sendMessageData = async (user_id, _data, message_type,previous_price,desired_price) => {
	_log && console.log('_data',_data);
	let _user = await User.findOne(
		{ 
			where: { id : user_id }  ,
			include: [{
				model: Profile
			}]
		}
	);

	let user = _user.dataValues;_log && console.log('re',user);
	let currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
	var percents = Math.round((_data.current_price-desired_price)/_data.current_price*100,1);
	let data = {
		from: 'Wispri <me@samples.mailgun.org>',
		to: user.email,
		subject:  message_type === 0 ? 'Price success!' : 'The product price had changed.',
		template: message_type === 0 ? 'price_success' : 'price_change',
		'v:userName': user.Profile.display_name,
		'v:image':  _data.image,
		'v:last_at':  currentDate,
		'v:name':  _data.name,
		'v:domain':  _data.domain,
		'v:currency':  _data.currency,
		'v:desired_price':  desired_price,
		'v:current_price':  _data.current_price,
		'v:previous_price':  previous_price,
		'v:short_url':  _data.short_url,
		'v:percents':  percents
	};
	
	mailgun.messages().send(data, function (error, body) {
		_log && console.log(body);
	});
};

const sendMessageForgot = async (user_id, message_type) => {
	let _user = await User.findOne(
		{ 
			where: { id : user_id } ,
			include: [{
				model: Profile
			}]
		}
	);
	let user = _user.dataValues;
	let data = {
		from: 'Wispri <me@samples.mailgun.org>',
		to: user.email,
		subject: 'Forgot your password?',
		template: 'password_reset',
		'v:pw_token': user.pw_token
	};
	
	mailgun.messages().send(data, function (error, body) {
		_log && console.log(body);
	});
};

const sendMessageReset = async (user_id, message_type) => {
	let _user = await User.findOne(
		{ 
			where: { id : user_id } ,
			include: [{
				model: Profile
			}]
		}
	);
	let user = _user.dataValues;
	let data = {
		from: 'Wispri <me@samples.mailgun.org>',
		to: user.email,
		subject: 'Your password has been reset',
		template: 'password_change'
	};
	
	mailgun.messages().send(data, function (error, body) {
		_log && console.log(body);
	});
};

module.exports = {
    sendMessageUser,
	sendMessageData,
	sendMessageForgot,
	sendMessageReset
}