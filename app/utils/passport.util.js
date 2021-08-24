const constants = require('../config/constant');
var _log = constants._log;

var passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

module.exports = function(passport) {
	var jwtOptions = {}
	jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
	jwtOptions.secretOrKey = constants.secretOrKey;

	var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
        _log && console.log('---user check request---')
        _log && console.log(jwt_payload)
		// usually this would be a database call:
		var user = jwt_payload;
		if(user)
			next(null, user);
		else
			next(null,null);
	});
		
	passport.use(strategy);
};
