'use strict';

let inquiryBalance = (msgText, type = 'current') => {
	return new Promise((resolve, reject) => {
		let query = 'OK';
		if(query === 'OK') {
			  resolve('So tai khoan cua ban la xxx type: ' + type + ' , msgText: ' + msgText) ;
			} else {
				reject('Bi loi trong qua trinh van tin tai khoan type: ' + type + ' , msgText: ' + msgText);
			}
	});
}

module.exports = inquiryBalance;