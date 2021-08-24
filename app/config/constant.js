var developmode = false;
var _log = true;

var apiUrl = '';

var serverUrl1 = ''; 
var serverUrl2 = 'http://localhost:830';

var mail_api_key = '';
var mail_domain = '';

var sms_api_id = '';
var sms_api_token = '';

var support_number = '';

var scheduleTime = developmode? '1' : '6';
var sizes = developmode ? 2 : 5;
var defaultstimeout = 20000;

var jwtSecret = 'Hello Wispri';
var secretOrKey = 'mysooperdoopersecretthatyoucantknow';

module.exports = {
    developmode : developmode,
    _log : _log,
    secretOrKey : secretOrKey,
    apiUrl: apiUrl,
    serverUrl: developmode? serverUrl2 : serverUrl1,
    mail_api_key: mail_api_key,
    mail_domain: mail_domain,
    sms_api_id: sms_api_id,
    sms_api_token: sms_api_token,
    support_number: support_number,
    scheduleTime : scheduleTime,
    sizes : sizes,
    defaultstimeout : defaultstimeout
};