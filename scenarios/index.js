'use strict';
var utils = require('../utils');
const Saving = require('./saving');
const saving = new Saving();

const PayBill = require('./payBill');
const pay = new PayBill();

const XFer = require('./xfer');
const xfer = new XFer();

const Account = require('./account');
const account = new Account();

const Register = require('./register');
const register = new Register();

const News = require('./news');
const news = new News();

const Card = require('./card');
const card = new Card();

const Location = require('./location');
const loca = new Location();

class Scenario {
  constructor(f) {
    console.log('Scenario starting...');

  }

  processPostback(sender, postback, f) {
    return new Promise((resolve, reject) => {
      let buttons = '';
      let text = '';
      let data = '';

      //
      if (postback && postback.payload) {
        console.log('postback.payload :' + postback.payload);

        switch (postback.payload) {
          case 'GET_STARTED_PAYLOAD':

            f.getProfile(sender)
              .then(profile => {
                const {
                  first_name,
                  timezone
                } = profile;
                f.txt(sender, 'Xin chào ' + first_name + ' ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
              })
              .catch(error => {
                console.log('getProfile err: ' + error);
                f.txt(sender, 'Xin chào bạn ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
              });


            register.showRegisterFinbot(sender, f);
            break;
          case 'menu:INQ_BALANCE_PAYLOAD':
            account.acctInfo(sender, f);
            break;
          case 'menu:XFER_PAYLOAD':
            f.txt(sender, 'Bạn hãy gõ Lệnh chuyển tiền theo cú pháp: Chuyen <So tien> toi <So tai khoan> tai <Ma ngan hang> \n VD: chuyen 1000000 toi 462879758937 tai VCB');
            break;
          case 'menu:REG_PAYLOAD':
            register.showRegister(sender, f);
            break;
          case 'menu:PAY_ELECTRIC':
            pay.showPayType(sender, f);
            break;
          case 'menu:PAY_WARTER':
            f.txt(sender, 'Chuyển tới trang thông tin tỷ giá lãi suất');
            break;
          case 'menu:NEWS_PAYLOAD':
            news.news(sender, f);
            break;
          case 'menu:MNSTMT_PAYLOAD':
            account.miniStatement(sender, f);
            break;
          case 'menu:SAVING_PAYLOAD':
            saving.showPeriod(sender, f);
            break;
          case 'menu:LOCATION_PAYLOAD':
            loca.showLocation(sender, f);
            break;
          case 'NEWS_BOT':
            news.news(sender, f);
            break;
          case 'REG_EFAST':
            f.txt(sender, 'Chuyển tới trang đăng ký dịch vụ cho KHDN');
            break;

          case 'QA_CARD_EPARTNER_ISSUE':
            f.txt(sender, 'Anh/chị vui lòng mang theo CMTND đến bất kỳ CN/PGD của Vietinbank để được hỗ trợ phát hành thẻ ATM Epartner. Anh/chị sẽ nhận được thẻ sau 05-07 ngày làm việc ạ.');
            card.showQAEpartner(sender, f);
            break;
          case 'QA_CARD_EPARTNER_ISSUE_FEE':
            f.txt(sender, 'Vietinbank có nhiều loại thẻ ATM phù hợp với nhu cầu của anh/chị với những hạn mức khác nhau. Chỉ với 50 000 VND; anh/chị đã có thể phát hành thẻ một chiếc thẻ ATM với thời hạn sử dụng 20 năm với rất nhiều tiện ích');
            card.showQAEpartner(sender, f);
            break;
          case 'QA_CARD_EPARTNER_UTILITY':
            f.txt(sender, 'Sau khi sở hữu thẻ ATM Epartner, anh/chị có thể sử dụng rất nhiều các tiện ích đa dạng như thanh toán trực tuyến; nạp tiền điện thoại vntopup; trích nợ tự động thanh toán hóa đơn, rút tiền không dùng thẻ ạ');
            card.showQAEpartner(sender, f);
            break;
          case 'QA_CARD_CREDIT_ISSUE':
            f.txt(sender, 'Để phát hành thẻ TDQT tại Vietinbank cần đáp ứng được một số điều kiện nhất định của ngân hàng. Anh/chị vui lòng liên hệ trực tiếp với CN Vietinbank gần nhất để được hỗ trợ ? Trước khi đến CN anh/chị có thể liên hệ Contact Center Vietinbank theo số điện thoại 19 00 55 8868 để được tư vấn chuẩn bị trước về hồ sơ và hình thức phát hành.');
            card.showQACreditCard(sender, f);
            break;
          case 'QA_CARD_CREDIT_ISSUE_FEE':
            f.txt(sender, 'Phí phát hành thẻ TDQT của Vietinbank tùy thuộc vào hạng thẻ của anh/chị khi được CN Vietinbank thẩm định và quyết định. Với mức phí thấp nhất chỉ là 50 000 VND với thẻ cứng và 75 000 VND với thẻ chip. Quý khách vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ cụ thể về phí từng loại thẻ');
            card.showQACreditCard(sender, f);
            break;
          case 'QA_CARD_CREDIT_UTILITY':
            f.txt(sender, 'Sau khi phát hành thẻ TDQT của Vietinbank anh/chị có cơ hội trải nghiệm rất nhiều tiện ích đa dạng và hữu ích như SMS TBBDGD; trả góp; thanh toán trực tuyến; chính sách bảo hiểm thẻ. Để có thông tin chi tiết về từng tiện ích, anh/chị vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ thông tin cụ thể');
            card.showQACreditCard(sender, f);
            break;
          default:
            f.txt(sender, 'Ban hay lua chon tinh nang can dung. Choice showing');
            break;
        }
      }

    });
  }

  processMessage(sender, message, f, wit) {
    return new Promise((resolve, reject) => {
      let buttons = '';
      let text = '';
      let data = '';

      if (message && message.text && !message.quick_reply) {
        // Process the message here
        let messageTxt = message.text;

        console.log('messageTxt:' + messageTxt);

        // Wit's Message API
        wit.message(messageTxt)
          .then(({
            entities
          }) => {
            console.log('WIT resp:' + JSON.stringify(entities));
            let intent = utils.firstEntity(entities, 'intent');
            if (!intent) {
              // use app data, or a previous context to decide how to 
              console.log('Not found intent');
              f.txt(sender, 'Xin lỗi chúng tôi chưa hiểu yêu cầu của bạn. Chúng tôi sẽ ghi nhận và trả lời bạn sau.');
              return;
            }

            switch (intent.value) {
              case 'truyvantaikhoan':
                account.acctInfo(sender, f);
                break;
              case 'chuyenkhoan':
                let bankCode = entities.bankCode ? entities.bankCode[0].value : 'VietinBank';
                let sotien = entities.number ? entities.number[0].value : 'undefined';
                let taikhoanthuhuong = entities.number ? entities.number[1].value : 'undefined';
                console.log(' >>>>>> bankCode: ' + bankCode);
                console.log(' >>>>>> sotien: ' + sotien);
                console.log(' >>>>>> taikhoanthuhuong: ' + taikhoanthuhuong);

                if (sotien == 'undefined' || taikhoanthuhuong == 'undefined') {
                  xfer.showHelp(sender, f);
                } else {
                  let confirmMsg = 'Bạn muốn chuyển ' + sotien + '  tới ' + taikhoanthuhuong + ' tại ' + bankCode + '. Nhấn Xác thực để chuyển bạn đến trang xác thực OTP';
                  let confirmUrl = 'http://hungpt.handcraft.com/xfer.html?fbid=' + sender + '&amt=' + sotien + '&benAc=' + taikhoanthuhuong + '&benBank=' + bankCode;
                  xfer.showConfirm(sender, f, confirmMsg, confirmUrl);

                }
                break;
              case 'thanhtoanhoadon':
                pay.showHelp(sender, f);
                break;
              case 'timdiadiem':
                loca.showLocation(sender, f);
                break;
              case 'tintucsukien':
                let newsType = entities.newsType ? entities.newsType[0].value : 'undefined';

                switch (true) {
                  case (newsType.value == 'san pham dich vu' || newsType.value == 'san pham' || newsType.value == 'dich vu'):
                    news.newsSP(sender, f);
                    break;
                  case (newsType.value == 'khuyen mai'):
                    news.newsKM(sender, f);
                    break;
                  default:
                    news.news(sender, f);
                    break;
                }
                break;
              case 'guitietkiem':
                let kyhan = entities.number ? entities.number[0].value : 'undefined';
                let sotientietkiem = entities.number ? entities.number[1].value : 'undefined';
                if (kyhan == 'undefined' || sotientietkiem == 'undefined') {
                  saving.showPeriod(sender, f);
                } else {
                  let confirmMsg = 'Bạn muốn gửi ' + sotientietkiem + '  kỳ hạn ' + kyhan + ' tháng. Nhấn Xác thực để chuyển bạn đến trang xác thực OTP';
                  let confirmUrl = 'http://hungpt.handcraft.com/saving.html?fbid=' + sender + '&amt=' + sotientietkiem + '&period=' + kyhan;
                  saving.showConfirm(sender, f, confirmMsg, confirmUrl);
                }
                break;
              case 'dangkydichvu':
                register.showRegister(sender, f);
                break;
              case 'tracuu':
                f.txt(sender, 'Bạn muốn tra cứu thông tin');
                break;
              case 'vay':
                f.txt(sender, 'Bạn muốn tìm hiểu thông tin để vay vốn ngân hàng');
                break;
              case 'tranovay':
                f.txt(sender, 'Bạn muốn trả nợ khoản vay');
                break;
              case 'xinchao':
                let who = utils.firstEntity(entities, 'who');
                let greetings = utils.firstEntity(entities, 'greetings');
                let bye = utils.firstEntity(entities, 'bye');

                if (greetings) {
                  f.getProfile(sender)
                    .then(profile => {
                      const {
                        first_name,
                        timezone
                      } = profile;
                      console.log('getProfile: ' + first_name);
                      f.txt(sender, greetings.value + ' ' + first_name + '. Tôi có thể giúp gì được cho bạn?');
                    })
                    .catch(error => {
                      console.log('getProfile err: ' + error);
                      f.txt(sender, greetings.value + '. Tôi có thể giúp gì được cho bạn?');
                    });

                } else if (bye) {
                  f.getProfile(sender)
                    .then(profile => {
                      const {
                        first_name,
                        timezone
                      } = profile;
                      f.txt(sender, bye.value + ' ' + first_name + ' :) ');
                    })
                    .catch(error => {
                      console.log('getProfile err: ' + error);
                      f.txt(sender, bye.value + ' ❤️');
                    });

                } else if (who) {
                  f.getProfile(sender)
                    .then(profile => {
                      const {
                        first_name,
                        timezone
                      } = profile;
                      f.txt(sender, 'Em là Chi, rất vui được phục vụ ' + ' ' + first_name + ' ❤️ ');
                      f.img(sender, "https://scontent.fhan2-3.fna.fbcdn.net/v/t1.0-9/21764779_302680266875874_1375365853791689812_n.jpg?oh=20ba2f800f62397aab2b330a49be0600&oe=5A4A3F0C");
                    })
                    .catch(error => {
                      f.txt(sender, 'Em là Chi, rất vui được phục vụ ❤️');
                    });

                } else {
                  f.txt(sender, ' ^_^ ');
                }
                break;
              case 'camthan':
                let emoTerm = entities.emoTerm ? entities.emoTerm[0].metadata : 'undefined';

                if (emoTerm == 'undefined') {
                  f.txt(sender, 'Cảm ơn bạn đã sử dụng dịch vụ của VietinBank ^_^ ');
                } else {
                  switch (emoTerm) {
                    case 'xinh':
                      f.txt(sender, 'Thật vậy ạ, hihi. Cảm ơn ạ 😝');
                      break;
                    case 'thongminh':
                      f.txt(sender, 'Bạn quá khen rùi 😊 ');
                      break;
                    case 'gioioi':
                      f.txt(sender, 'Xin lỗi vì đã làm bạn không vui 😇 ');
                      break;
                    case 'toite':
                      f.txt(sender, '😔');
                      break;
                    default:
                      f.txt(sender, ' ^_^ ');
                      break;
                  }

                }

                break;
              case 'camon':
                f.txt(sender, 'Cảm ơn bạn đã sử dụng dịch vụ của VietinBank ^_^ ');
                break;
              case 'phathanh':
                let issueTerm = entities.issueTerm ? entities.issueTerm[0].value : 'undefined';
                let issueFee = entities.issueFee ? entities.issueFee[0].value : 'undefined';
                let issueType = entities.issueType ? entities.issueType[0].metadata : 'undefined';

                if (issueTerm == 'undefined') {
                  if (issueType == 'undefined') {
                    f.txt(sender, 'Cảm ơn bạn đã sử dụng dịch vụ của VietinBank ^_^ ');
                  } else {
                    if (issueFee == 'undefined') {
                      switch (issueType) {
                        case 'epartner':
                          f.txt(sender, 'Vietinbank có nhiều loại thẻ ATM phù hợp với nhu cầu của anh/chị với những hạn mức khác nhau. Chỉ với 50 000 VND; anh/chị đã có thể phát hành thẻ một chiếc thẻ ATM với thời hạn sử dụng 20 năm với rất nhiều tiện ích');
                          card.showQAEpartner(sender, f);
                          break;
                        case 'jcb':
                          f.txt(sender, 'Phí phát hành thẻ TDQT của Vietinbank tùy thuộc vào hạng thẻ của anh/chị khi được CN Vietinbank thẩm định và quyết định. Với mức phí thấp nhất chỉ là 50 000 VND với thẻ cứng và 75 000 VND với thẻ chip. Quý khách vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ cụ thể về phí từng loại thẻ');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'visa':
                          f.txt(sender, 'Phí phát hành thẻ TDQT của Vietinbank tùy thuộc vào hạng thẻ của anh/chị khi được CN Vietinbank thẩm định và quyết định. Với mức phí thấp nhất chỉ là 50 000 VND với thẻ cứng và 75 000 VND với thẻ chip. Quý khách vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ cụ thể về phí từng loại thẻ');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'master':
                          f.txt(sender, 'Phí phát hành thẻ TDQT của Vietinbank tùy thuộc vào hạng thẻ của anh/chị khi được CN Vietinbank thẩm định và quyết định. Với mức phí thấp nhất chỉ là 50 000 VND với thẻ cứng và 75 000 VND với thẻ chip. Quý khách vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ cụ thể về phí từng loại thẻ');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'tdqt':
                          f.txt(sender, 'Phí phát hành thẻ TDQT của Vietinbank tùy thuộc vào hạng thẻ của anh/chị khi được CN Vietinbank thẩm định và quyết định. Với mức phí thấp nhất chỉ là 50 000 VND với thẻ cứng và 75 000 VND với thẻ chip. Quý khách vui lòng liên hệ Contact Center Vietinbank theo số điện thoại 1900 55 8868 để được hỗ trợ cụ thể về phí từng loại thẻ');
                          card.showQACreditCard(sender, f);
                          break;
                        default:
                          f.txt(sender, ' ^_^ ');
                          break;
                      }
                    } else {
                      switch (issueType) {
                        case 'epartner':
                          f.txt(sender, 'Anh/chị vui lòng mang theo CMTND đến bất kỳ CN/PGD của Vietinbank để được hỗ trợ phát hành thẻ ATM Epartner. Anh/chị sẽ nhận được thẻ sau 05-07 ngày làm việc ạ.');
                          card.showQAEpartner(sender, f);
                          break;
                        case 'jcb':
                          f.txt(sender, 'Để phát hành thẻ TDQT JCB tại Vietinbank cần đáp ứng được một số điều kiện nhất định của ngân hàng. Anh/chị vui lòng liên hệ trực tiếp với CN Vietinbank gần nhất để được hỗ trợ ? Trước khi đến CN anh/chị có thể liên hệ Contact Center Vietinbank theo số điện thoại 19 00 55 8868 để được tư vấn chuẩn bị trước về hồ sơ và hình thức phát hành.');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'visa':
                          f.txt(sender, 'Để phát hành thẻ TDQT Visa tại Vietinbank cần đáp ứng được một số điều kiện nhất định của ngân hàng. Anh/chị vui lòng liên hệ trực tiếp với CN Vietinbank gần nhất để được hỗ trợ ? Trước khi đến CN anh/chị có thể liên hệ Contact Center Vietinbank theo số điện thoại 19 00 55 8868 để được tư vấn chuẩn bị trước về hồ sơ và hình thức phát hành.');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'master':
                          f.txt(sender, 'Để phát hành thẻ TDQT Master Card tại Vietinbank cần đáp ứng được một số điều kiện nhất định của ngân hàng. Anh/chị vui lòng liên hệ trực tiếp với CN Vietinbank gần nhất để được hỗ trợ ? Trước khi đến CN anh/chị có thể liên hệ Contact Center Vietinbank theo số điện thoại 19 00 55 8868 để được tư vấn chuẩn bị trước về hồ sơ và hình thức phát hành.');
                          card.showQACreditCard(sender, f);
                          break;
                        case 'tdqt':
                          f.txt(sender, 'Để phát hành thẻ TDQT tại Vietinbank cần đáp ứng được một số điều kiện nhất định của ngân hàng. Anh/chị vui lòng liên hệ trực tiếp với CN Vietinbank gần nhất để được hỗ trợ ? Trước khi đến CN anh/chị có thể liên hệ Contact Center Vietinbank theo số điện thoại 19 00 55 8868 để được tư vấn chuẩn bị trước về hồ sơ và hình thức phát hành.');
                          card.showQACreditCard(sender, f);
                          break;
                        default:
                          f.txt(sender, ' ^_^ ');
                          break;
                      }
                    }

                  }

                }
                break;
              default:
                console.log(`?  ${intent.value}`);
                f.txt(sender, 'Okey! intent matching: ' + intent.value);
                f.txt(sender, 'Data collected: ' + JSON.stringify(entities));
                break;
            }
          })
          .catch(error => {
            console.log(error);
            f.txt(sender, "Hệ thống phản hồi chậm, xin bạn chờ trong giây lát.");
          });
      }
    });
  }

  processQuickreply(sender, message, f, agenda) {
    console.log('processQuickreply WIT resp :');
    let buttons = '';
    let text = '';
    let data = '';
    if (message && message.quick_reply) {
      let quickReply = message.quick_reply;
      console.log('quickReply: ' + JSON.stringify(message.quick_reply));

      switch (quickReply.payload) {
        case 'PAY_MOBILE':
          f.txt(sender, 'Hiện đang có chương trình KM nạp thẻ Viettel giảm 3%.\nBạn hãy gõ Lệnh Topup Mobileg theo cú pháp: TOPUP <So tien> <So dien thoai> \n VD: topup 1000000 09878788788');
          break;
        case 'PAY_WT':
          f.txt(sender, 'Bạn có thể thanh toán nước cho các nhà cung cấp Nước A, Nước B.\nBạn hãy gõ Lệnh Thanh toán Nước theo cú pháp: PW <So tien> <So HD> <Ma NCC> \n VD: PW 1500000 HD3784384 NCC1');
          break;
        case 'PAY_AT':
          f.txt(sender, 'Bạn có thể thanh toán vé máy bay cho VietJET, VietnamAirline, Jestar.\nBạn hãy gõ Lệnh Thanh toán Vé máy bay theo cú pháp: PA <So tien> <So Vé> <Ma NCC> \n VD: PA 1500000 HD3784384 NCC1');
          break;
        case 'PAY_ELEC':
          f.txt(sender, 'Bạn có thể thanh toán tiền điện cho các nhà cung cấp A, B.\nBạn hãy gõ Lệnh Thanh toán Điện theo cú pháp: PE <So tien> <So HD> <Ma NCC> \n VD: PE 1500000 HD3784384 NCC1');
          break;
        case 'SAVE_3M':
          f.txt(sender, 'Lãi suất gửi tiết kiệm 3 tháng tại VietinBank hiện đang là 4,3%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 3 tháng theo cú pháp: GTK3 <So tien> \n VD: gtk3 1000000');
          break;
        case 'SAVE_6M':
          f.txt(sender, 'Lãi suất gửi tiết kiệm 6 tháng tại VietinBank hiện đang là 5,3%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 6 tháng theo cú pháp: GTK6 <So tien> \n VD: gtk6 1500000');
          break;
        case 'SAVE_12M':
          f.txt(sender, 'Lãi suất gửi tiết kiệm 12 tháng tại VietinBank hiện đang là 6,8%.\nBạn hãy gõ Lệnh Gửi tiết kiệm 12 tháng theo cú pháp: GTK12 <So tien> \n VD: gtk12 1000000');
          break;
        case 'NEWS_16h30':
          f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 16h30 hàng ngày.');
          break;
        case 'NEWS_11h':
          f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 11h hàng ngày.');
          break;
        case 'NEWS_8h30':
          let task = 'NEWS_8h30';
          agenda.now('createReminder', {
            sender,
            datetime: context.datetime,
            task: task
          });

          f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 8h30 hàng ngày.');
          break;
        default:
          f.txt(sender, 'Data collected: ' + JSON.stringify(quickReply));
          break;
      }
    }
  }

  processAttachment(sender, message, f) {
    console.log('processAttachment ');
    let buttons = '';
    let text = '';
    let data = '';

    if (message && message.attachments) {
      console.log('message.attachments: ' + JSON.stringify(message.attachments));
      let locTitle = message.attachments[0].title;
      let coord = message.attachments[0].payload.coordinates;
      let locLat = coord.lat;
      let locLong = coord.long;

      f.txt(sender, 'Bạn đang ở gần địa điểm ' + locTitle + '(lat: ' + locLat + ', long: ' + locLong + '), quanh bạn có các PGD sau của VietinBank: \n 🏦 123 Xã Đàn \n 🏦 15 Nam Đồng \n 🏦 19 Tây Sơn');
    }
  }
}

module.exports = Scenario;