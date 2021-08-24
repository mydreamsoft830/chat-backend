const AWS = require('aws-sdk')
const async = require('async')
const path = require('path')
const fs = require('fs')
const constants = require('../config/constant');
var _log = constants._log;

let pathParams, image, imageName;
//configuring the AWS environment
AWS.config.update({
    accessKeyId: '',
    secretAccessKey: ''
});
const awsRegion = 'ap-northeast-1';
const s3 = new AWS.S3({ region: awsRegion});
const bucketName = 'wispri-yelena';
const createMainBucket = (callback) => {
	// Create the parameters for calling createBucket
	const bucketParams = {
	   Bucket : bucketName
	};                    
	s3.headBucket(bucketParams, function(err, data) {
	   if (err) {
	      	s3.createBucket(bucketParams, function(err, data) {
			   if (err) {
			   		callback(err, null)
			   } else {
			      callback(null, data)
			   }
			});
	   } else {
	      callback(null, data)
	   }
	})                             
}

const createItemObject = (callback) => {
  const params = { 
		Bucket: bucketName, 
        Key: `${imageName}`, 
        ACL: 'public-read',
        Body: image
    };
	s3.putObject(params, function (err, data) {
		if (err) {
	    	_log && console.log("Error uploading image: ", err);
	    	callback(err, null)
	    } else {
	    	_log && console.log("Successfully uploaded image on S3", data);
	    	callback(null, data)
	    }
	})  
}

const getSignedUrl = () => {
	var params = {Bucket:  bucketName, Key: imageName};
	return s3.getSignedUrl('putObject', params, function (err, url) {
		return url;
	});
}

const getS3FilePath = () => {
	return `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${imageName}`;
}

const uploadFileToS3 = (req, res, next) => {
	const files = req;
	var tmp_path = files.file.path;
	image = fs.createReadStream(tmp_path);
	let date_ob = new Date();
	let times=new Date().toISOString()
						.replace(/T/, ' ')
						.replace(/\..+/, '')
						.replace(' ', '-')
						.replace(':', '_')
						.replace(':', '_');
	imageName ='avatar/avatar-'+times+'-'+files.file.name;
	_log && console.log(imageName)
    return async.series([
		createMainBucket,
		createItemObject
	], (err, result) => {
		_log && console.log(result, 'result');
		if(err) {
			_log && console.log(err, ">>errr");
			return res.send(err);
		} else {
			return { success: true, message: "Successfully uploaded", s3ObjectUrl: getS3FilePath() }; 
		}
    });
}

module.exports = {
	uploadFileToS3,
	getS3FilePath,
	getSignedUrl
};


