const models = require('../models');
const constants = require('../config/constant');
var _log = constants._log;
const mail = require('../services/mail.service');
const sms = require('../services/sms.service');

var cron = require('node-cron');
var delay = require('delay');
var axios = require('axios');
var moment = require('moment');
var { Op } = require('sequelize')

var scheduleTime = constants.scheduleTime;
var sizes = constants.sizes;
const {User,Profile,Url} = models;
var apiUrl = constants.apiUrl;

axios.defaults.timeout = constants.defaultstimeout;

var taskFlag = true;

var task = cron.schedule('* */'+scheduleTime+' * * *', () => {
	if(taskFlag){
		taskFlag=false;
		var currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
		_log && console.log(currentDate)
		const taskUrls = Url.findAll({
			where: {
				expire_at: {
					[Op.gte]: moment().toDate()
				},
				bell: true,
				UserId : {
					[Op.gte]: 0
				}
			},
			order: [
				['created_at', 'ASC'],
				['id', 'ASC'],
			]
		}).then(res=>{
			var urls= res ;
			var lengths = urls.length;
			var aLength = Math.floor(lengths/sizes);
			var d = lengths % sizes;
			if(d>0)++aLength;
		
			var mainArray = [];
			var subArray = [];
			var _stopI=0;
			for(i=0;i<lengths;i++){
				subArray.push(urls[i].dataValues)
				++_stopI;			
				if(i === lengths-1){
					mainArray.push(subArray)
					subArray = [];
					_stopI = 0;
					break;
				}
				if(_stopI === sizes){
					mainArray.push(subArray)
					subArray = [];
					_stopI = 0;
				}
			}
			//_log && console.log(mainArray);
			
			(async () => {
				for(i=0;i<mainArray.length;i++){	
					const promises = mainArray[i].map(url =>axios.get(apiUrl+url.url).catch(e => 'error'));
					var startTime = new Date();
					//_log && console.log('---start---',i,startTime)
					const results = await Promise.all(promises);
					var emdTime = new Date();
					var _n=0;
					const _promises = results.map(result => {
						//_log && console.log('-----------------------------------------------------------',
						//	i,_n,result.data)
						//_log && console.log(mainArray[i][_n].url)
						//_log && console.log(result.config.url)
						try{
							if(result.data.current_price === undefined){}	
								//_log && console.log('-error')
							else				
								compareData(mainArray[i],result.data,i,_n);		
						}catch(e){}		
						++_n;
					});
				}
				taskFlag = true;
			})();			
		}); 			
	} else {
		taskFlag = true;
	}
});


const compareData = async (array,data,m,n) => {
	//_log && console.log('--------------,',n)
	//_log && console.log(data,array.length,m,n);
	//_log && console.log(mainArray)
	var previousData = array[n];
	//_log && console.log(previousData);
	var data_id= previousData.id;
	var owner_id= previousData.UserId;
	var current_price = data.current_price;
	var previous_price = previousData.current_price;
	var desired_price = previousData.desired_price;
	_log && console.log(previousData.id,current_price,previous_price)
	if(Number(current_price) !== Number(previous_price)){
		saveData(data_id, current_price);			
		if(Number(current_price) <= Number(desired_price)){
			mail.sendMessageData(owner_id,data,0,previous_price,desired_price);
			sms.sendSmsData(owner_id,data,0,previous_price,desired_price);
		}else{
			mail.sendMessageData(owner_id,data,1,previous_price,desired_price);	
			sms.sendSmsData(owner_id,data,1,previous_price,desired_price);
		}
	}else{
		updateDate(data_id);		
	}
};
const updateDate = async (data_id) => {
	_log && console.log('data_id',data_id)
	try{
		await Url.update(
			{ 
				last_at : new Date()
			},{ 
				where: { id : data_id } 
			}
		);
	}catch (e){
		_log && console.log(e);
	}finally{

	}	
};

const saveData = async (data_id, current_price) => {
	_log && console.log('data_id',data_id)
	try{
		await Url.update(
			{ 
				last_at : new Date(),
				current_price: current_price 
			},{ 
				where: { id : data_id } 
			}
		);
	}catch (e){
		_log && console.log(e);
	}finally{

	}	
};

const start = async() => {
	task.start(); 
	//task()
	                     
}

module.exports = {
	start
}