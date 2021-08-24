const models = require('../models');
const constants = require('../config/constant');
var _log = constants._log;
var moment = require('moment');
var { Op } = require('sequelize');

const {User,Profile,Url} = models;

var sms_api_id = constants.sms_api_id;
var sms_api_token = constants.sms_api_token;
const twilio = require('twilio')(sms_api_id, sms_api_token);

const sendSmsData = async (user_id, _data, message_type,previous_price,desired_price) => {
	_log && console.log('_data',_data);
	var _user = await User.findOne(
		{ 
			where: { id : user_id }  ,
			include: [{
				model: Profile
			}]
		}
	);

	var user = _user.dataValues;_log && console.log('re',user);
	var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
	var percents = Math.round((_data.current_price-desired_price)/_data.current_price*100,1);
	var body;
	if(message_type === 0){
		body = 'The price has been changed to the amount you want. Current Price : ' + _data.current_price + '  Product link is ' + _data.short_url;
	}else{
		body = 'The price has been changed. Current Price : ' + _data.current_price + '  Product link is ' + _data.short_url;
	}
	if(user.Profile.country_id && user.Profile.phone_number)
		twilio.messages.create({
			body: body,
			from: constants.support_number,
			to: '+' + user.Profile.country_id + user.Profile.phone_number
		}).then(
			message => {
				console.log('sms send','+' + user.Profile.country_id + user.Profile.phone_number + ' =>  ' + message.sid);
			}
		).catch(error => console.log(error));;
};

module.exports = {
	sendSmsData
}