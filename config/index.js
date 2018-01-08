'use strict';

if(process.env.NODE_ENV === 'production') {
	module.exports = {
		WIT_ACCESS_TOKEN: process.env.WIT_ACCESS_TOKEN,
		FB: {
			PAGE_ACCESS_TOKEN: process.env.PAGE_ACCESS_TOKEN,
			VERIFY_TOKEN: process.env.VERIFY_TOKEN,
			APP_SECRET: process.env.APP_SECRET
		},
		MONGO_URI: process.env.MONGO_URI,
		SOAP_WSDL_URL: process.env.SOAP_WSDL_URL,
		QnA_URI:process.env.QnA_URI,
		QnA_KEY:process.env.QnA_KEY,
		QnA_ADMIN_MAIL:process.env.QnA_ADMIN_MAIL,
		SMTP_SERVER:process.env.SMTP_SERVER,
		SMTP_USER:process.env.SMTP_USER,
		SMTP_PASS:process.env.SMTP_PASS
	}
} else {
	module.exports = require('./development.json');
}