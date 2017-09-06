'use strict';

const createResponse = (intent, data) => {
  
    switch(intent) {
      case 'chuyenkhoan' : {
        let str = 'Chuyen toi trang xac nhan thong tin chuyen khoan...';
        return {
          text: str,
          image: null
        }
      }  
      case 'truyvantaikhoan' : {
        let str = 'Tai khoan 1010xxxxx3485 cua ban hien co so du kha dung 23,300,000 VND, trang thai tai khoan Active';
        return {
          text: str,
          image: null
        }
      }

      default: {
        return {
          text: "Always at your service :)",
          image: null
        }
      }
    }
  
}

module.exports = createResponse;
