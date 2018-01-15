'use strict';
var utils = require('../utils');
var config = require('../config');
var superagent = require("superagent");
//var agenda = require('../agenda');
const nodemailer = require('nodemailer');

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
/*
const Model = require('../model');
const model = new Model();
*/
const Services = require('../services');
const services = new Services();

var make_text_message = (texts) => {
  var txt = texts.map((text) => {
    return {
      text: text
    }
  })
  return {
    messages: txt
  }
};

class Scenario {
  constructor(f) {
    console.log('Scenario starting...');
    //model.findAll('1');
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
                  name,
                  id
                } = profile;
                f.txt(sender, 'Xin chào ' + name + ' ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
              })
              .catch(error => {
                console.log('getProfile err: ' + error);
                f.txt(sender, 'Xin chào bạn ❤️ \nChúc bạn một ngày tốt lành! \nHãy lựa chọn các tính năng trên Menu hoặc gõ Xem so du, Chuyen khoan, Gui tiet kiem. ');
              });

            register.showRegisterFinbot(sender, f);
            break;
          case 'menu:REG_PAYLOAD':
            register.showRegister(sender, f);
            break;
          case 'menu:NEWS_PAYLOAD':
            news.news(sender, f);
            break;
          case 'menu:LOCATION_PAYLOAD':
            loca.showLocation(sender, f);
            break;
          case 'menu:XRATE_PAYLOAD':
            news.exchangeRate(sender, f);
            break;
          case 'menu:IRATE_PAYLOAD':
            news.interestRate(sender, f);
            break;
          case 'NEWS_BOT':
            news.showRegisterNews(sender, f);
            break;
          default:
            f.txt(sender, 'Chúng tôi có thể trợ giúp được gì cho bạn? Vui lòng tham khảo menu bên dưới hoặc gõ nội dung bạn cần hỗ trợ');
            news.menu(sender, f);
            break;
        }
      }

    });
  }

  queryQnAMaker(sender, senderName, messageTxt, f) {
    superagent
      .post(config.QnA_URI)
      .send({
        question: messageTxt,
        top: 3
      })
      .set('Ocp-Apim-Subscription-Key', config.QnA_KEY)
      .set('Content-Type', 'application/json; charset=UTF-8')
      .end(function(err, res) {
        if (err || !res.ok) {
          f.txt(sender, "Oh no! error = " + err + ", " + JSON.stringify(res));
        } else {
          let score = res.body.answers[0].score;
          let answer = utils.htmlDecode(res.body.answers[0].answer);
          console.log('Answer: ', answer);
          console.log('Score: ' + score);

          // matching score
          if (score > 85) {
            f.txt(sender, answer);
            return;
          } else if (score <= 85 && score > 75) {
            f.txt(sender, answer);
            f.txt(sender, 'Câu trả lời có đúng ý hỏi của anh/chị không 😊 ');
            return;
          } else if (score <= 75 && score > 30) {
            let question1 = utils.htmlDecode(res.body.answers[0].questions[0]);
            let question2 = utils.htmlDecode(res.body.answers[1].questions[0]);
            let buttons = '';

            let text = 'Ý của anh/chị là: \n';
            text = text + 'Câu 1: ' + question1 + ' \n';
            text = text + 'Câu 2: ' + question2 + ' \n';
            text = text + 'Nếu chưa đúng ý anh/chị, vui lòng đặt câu hỏi khác';

            try {
              buttons = [{
                  content_type: "text",
                  title: "Câu 1",
                  image_url: "http://www.freeiconspng.com/uploads/question-icon-23.png",
                  payload: 'QnA_re: ' + question1
                },
                {
                  content_type: "text",
                  title: "Câu 2",
                  image_url: "http://www.freeiconspng.com/uploads/question-icon-23.png",
                  payload: 'QnA_re: ' + question2
                },
                {
                  content_type: "text",
                  title: "Không đúng",
                  image_url: "http://www.freeiconspng.com/uploads/question-icon-23.png",
                  payload: 'QnA_cusQ: ' + messageTxt
                }

              ];
              f.quick(sender, {
                text,
                buttons
              });
            } catch (e) {
              console.log(JSON.stringify(e));
            }
            return;
          } else {
            f.txt(sender, 'Xin lỗi em chưa hiểu yêu cầu. Em sẽ ghi nhận và trả lời sau ạ. Vui lòng tham khảo menu bên dưới hoặc gõ nội dung cần hỗ trợ rõ ràng hơn');
            news.menu(sender, f);

            // sent mail to remind train bot
            nodemailer.createTestAccount((err, account) => {
              // create reusable transporter object using the default SMTP transport
              let transporter = nodemailer.createTransport({
                host: config.SMTP_SERVER,
                port: 465,
                secure: true, // true for 465, false for other ports
                requireTLS: true,
                auth: {
                  user: config.SMTP_USER, // generated ethereal user
                  pass: config.SMTP_PASS // generated ethereal password
                }
              });

              let mailSubject = 'VietinBank ChatBot: ' + messageTxt;

              let plaintTextContent = senderName + ' said: ' + messageTxt + '\n';
              plaintTextContent = plaintTextContent + 'Bot reply: ' + answer + ' \n';
              plaintTextContent = plaintTextContent + 'Score: ' + score + ' \n';
              plaintTextContent = plaintTextContent + 'Please retrain the bot to make higher score \n';

              let htmlContent = '';
              htmlContent = htmlContent + '<table rules="all" style="border-color: #666;" cellpadding="10">';
              htmlContent = htmlContent + '<tr style=\'background: #ffa73c;\'><td> </td><td></td></tr>';
              htmlContent = htmlContent + '<tr><td><strong>' + senderName + ' said:</strong> </td><td>' + messageTxt + '</td></tr>';
              htmlContent = htmlContent + '<tr><td><strong>Bot reply:</strong> </td><td>' + answer + '</td></tr>';
              htmlContent = htmlContent + '<tr><td><strong>Score:</strong> </td><td>' + score + '</td></tr>';
              htmlContent = htmlContent + '<tr><td><strong>Note:</strong> </td><td>Please retrain the bot to make higher score </td></tr>';
              htmlContent = htmlContent + '</table>';

              // setup email data with unicode symbols
              let mailOptions = {
                from: '"VietinBank FaQ ChatBot" <vietinbankchatbot@gmail.com>', // sender address
                to: config.QnA_ADMIN_MAIL, // list of receivers
                subject: mailSubject, // Subject line
                text: plaintTextContent, // plain text body
                html: htmlContent // html body
              };

              console.log('Start sent from: %s', mailOptions.from);
              // send mail with defined transport object
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return console.log(error);
                }
                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

              });
            });
            return;
          }
        }
      });
  }

  /*
  sendNotifyMail(senderName, messageTxt, answer, score) {
    try {
      // sent mail to remind train bot
      nodemailer.createTestAccount((err, account) => {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: config.SMTP_SERVER,
          port: 465,
          secure: true, // true for 465, false for other ports
          requireTLS: true,
          auth: {
            user: config.SMTP_USER, // generated ethereal user
            pass: config.SMTP_PASS // generated ethereal password
          }
        });

        let mailSubject = 'VietinBank ChatBot: ' + messageTxt;

        let plaintTextContent = senderName + ' said: ' + messageTxt + '\n';
        plaintTextContent = plaintTextContent + 'Bot reply: ' + answer + ' \n';
        plaintTextContent = plaintTextContent + 'Score: ' + score + ' \n';
        plaintTextContent = plaintTextContent + 'Please retrain the bot to make higher score \n';

        let htmlContent = '';
        htmlContent = htmlContent + '<table rules="all" style="border-color: #666;" cellpadding="10">';
        htmlContent = htmlContent + '<tr style=\'background: #ffa73c;\'><td> </td><td></td></tr>';
        htmlContent = htmlContent + '<tr><td><strong>' + senderName + ' said:</strong> </td><td>' + messageTxt + '</td></tr>';
        htmlContent = htmlContent + '<tr><td><strong>Bot reply:</strong> </td><td>' + answer + '</td></tr>';
        htmlContent = htmlContent + '<tr><td><strong>Score:</strong> </td><td>' + score + '</td></tr>';
        htmlContent = htmlContent + '<tr><td><strong>Note:</strong> </td><td>Please retrain the bot to make higher score </td></tr>';
        htmlContent = htmlContent + '</table>';

        // setup email data with unicode symbols
        let mailOptions = {
          from: '"VietinBank FaQ ChatBot" <vietinbankchatbot@gmail.com>', // sender address
          to: config.QnA_ADMIN_MAIL, // list of receivers
          subject: mailSubject, // Subject line
          text: plaintTextContent, // plain text body
          html: htmlContent // html body
        };

        console.log('Start sent from: %s', mailOptions.from);
        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        });
      });
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }
  */

  processMessage(sender, message, f, wit) {
    return new Promise((resolve, reject) => {
      let buttons = '';
      let text = '';
      let data = '';

      if (message && message.text && !message.quick_reply) {
        let messageTxt = message.text;

        console.log('messageTxt:' + messageTxt);
        var senderName = '';
        f.getProfile(sender)
          .then(profile => {
            const {
              name,
              id
            } = profile;
            console.log('getProfile: ' + name);
            senderName = name;
          })
          .catch(error => {
            console.log('getProfile err: ' + error);
            senderName = ' anh/chị';
          });

        wit.message(messageTxt)
          .then(({
            entities
          }) => {
            console.log('WIT resp:' + JSON.stringify(entities));
            let intent = utils.firstEntity(entities, 'intent');
            if (typeof intent === "undefined") {
              this.queryQnAMaker(sender, senderName, messageTxt, f);
              // use app data, or a previous context to decide how to 
              /*
              console.log('Not found intent');
              f.txt(sender, 'Xin lỗi em chưa hiểu yêu cầu. Em sẽ ghi nhận và trả lời sau ạ. Vui lòng tham khảo menu bên dưới hoặc gõ nội dung cần hỗ trợ rõ ràng hơn');
              news.menu(sender, f);
              */
              return;
            }

            switch (intent.value) {
              case 'goodbye':
                f.txt(sender, 'Cảm ơn anh chị, chúc anh chị một ngày tốt lành :) ');
                break;
              case 'welcome':
                /*
                let who = utils.firstEntity(entities, 'who');
                let greetings = utils.firstEntity(entities, 'greetings');
                let bye = utils.firstEntity(entities, 'bye');

                if (greetings) {
                  //f.txt(sender, 'Xin chào ' + senderName + '! Em có thể giúp gì được ạ?');
                  //news.menu(sender, f);
                  news.menuQuick(sender, senderName, f);
                } else if (bye) {
                  f.txt(sender, bye.value + ' ' + senderName + ' :) ');
                } else if (who) {
                  f.txt(sender, 'Em là Chi, rất vui được phục vụ ' + ' ' + senderName + ' ❤️ ');
                } else {
                  f.txt(sender, ' ^_^ ');
                }
                */
                news.menuQuick(sender, senderName, f);
                break;
              case 'camthan':
                let emoTerm = entities.emoTerm ? entities.emoTerm[0].metadata : 'undefined';

                if (emoTerm == 'undefined') {
                  f.txt(sender, 'Xin lỗi em chưa hiểu yêu cầu. Em sẽ ghi nhận và trả lời sau ạ. Vui lòng tham khảo menu bên dưới hoặc gõ nội dung cần hỗ trợ rõ ràng hơn');
                  news.menu(sender, f);
                } else {
                  switch (emoTerm) {
                    case 'xinh':
                      f.txt(sender, 'Thật vậy ạ, hihi. Cảm ơn ạ 😝');
                      break;
                    case 'thongminh':
                      f.txt(sender, 'Dạ quá khen rùi ạ 😊 ');
                      break;
                    case 'gioioi':
                      f.txt(sender, 'Xin lỗi vì đã làm anh chị không vui 😇 ');
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
              case 'thank':
                f.txt(sender, 'Cảm ơn anh/chị đã sử dụng dịch vụ của VietinBank ^_^ ');
                break;
              case 'atm_location':
                let locationText = utils.firstEntity(entities, 'location').value;
                console.log('locationText: ' + locationText);

                if (locationText !== 'undefined') {
                  if (messageTxt.includes('gần nhất') || messageTxt.includes('gần đây') || messageTxt.includes('gần tôi')) {
                    loca.showLocation(sender, f);
                  } else {
                    let buttons = '';

                    let text = 'Ý của anh/chị là tìm ATM ở địa điểm: \n';
                    text = text + '[' + locationText + '] \n';
                    text = text + 'Nếu chưa đúng ý anh/chị, vui lòng đặt câu hỏi khác. VD: atm ở 187 nguyễn lương bằng, ATM gần tôi, ATM ở thành phố đà nẵng... ';

                    try {
                      buttons = [{
                          content_type: "text",
                          title: "Tìm thôi",
                          image_url: "http://www.freeiconspng.com/uploads/question-icon-23.png",
                          payload: 'ATM_LOC: ' + locationText
                        },
                        {
                          content_type: "text",
                          title: "Thử lại",
                          image_url: "http://www.freeiconspng.com/uploads/question-icon-23.png",
                          payload: 'ATM_LOC: RETRY'
                        }
                      ];
                      f.quick(sender, {
                        text,
                        buttons
                      });
                    } catch (e) {
                      console.log(JSON.stringify(e));
                    }


                  }
                } else {
                  loca.showLocation(sender, f);
                }
                //f.txt(sender, 'Cảm ơn anh chị, chúc anh chị một ngày tốt lành :) ');
                break;
              default:
                this.queryQnAMaker(sender, senderName, messageTxt, f);
                /*
                f.txt(sender, 'Xin lỗi em chưa hiểu yêu cầu. Em sẽ ghi nhận và trả lời sau ạ ^_^');
                console.log(`?  ${intent.value}`);
                */
                //f.txt(sender, 'Okey! intent matching: ' + intent.value);
                //f.txt(sender, 'Data collected: ' + JSON.stringify(entities));
                break;
            }
          })
          .catch(error => {
            console.log(error);
            f.txt(sender, "Hệ thống phản hồi chậm, xin anh/chị chờ trong giây lát.");
          });
      }
    });
  }

  processQuickreply(sender, message, f, agenda) {
    //console.log('processQuickreply WIT resp :');
    let buttons = '';
    let text = '';
    let data = '';

    if (message && message.quick_reply) {
      let quickReply = message.quick_reply;
      if (quickReply.payload.includes('ATM_LOC: ') ) {
        if (quickReply.payload.includes('ATM_LOC: RETRY')) {
          return;
        }else {
          let locationText = quickReply.payload.replace('ATM_LOC: ', '');
          let locationTextQuery = utils.khongdau(locationText);//utils.htmlEncode(locationText);
          loca.getAtmLocationByText(sender, locationTextQuery, f);
        }
        return;
      }
      else if (quickReply.payload.includes('QnA_re: ') || quickReply.payload.includes('QnA_cusQ: ')) {
        if (quickReply.payload.includes('QnA_re: ')) {
          let messageTxt = quickReply.payload.replace('QnA_re: ', '');
          superagent
            .post(config.QnA_URI)
            .send({
              question: messageTxt
            })
            .set('Ocp-Apim-Subscription-Key', config.QnA_KEY)
            .set('Content-Type', 'application/json; charset=UTF-8')
            .end(function(err, res) {
              if (err || !res.ok) {
                f.txt(sender, "Oh no! error = " + err + ", " + JSON.stringify(res));
              } else {
                f.txt(sender, utils.htmlDecode(res.body.answers[0].answer));
              }
            });
        } else {
          let messageTxt = quickReply.payload.replace('QnA_cusQ: ', '');
          f.txt(sender, 'Câu hỏi: " ' + messageTxt + ' " đã được ghi nhận và xin phép trả lời anh/chị sau ạ :) ');

          // sent mail to remind train bot
          nodemailer.createTestAccount((err, account) => {
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
              host: config.SMTP_SERVER,
              port: 465,
              secure: true, // true for 465, false for other ports
              requireTLS: true,
              auth: {
                user: config.SMTP_USER, // generated ethereal user
                pass: config.SMTP_PASS // generated ethereal password
              }
            });

            let mailSubject = 'VietinBank ChatBot: Question need answer >>> ' + messageTxt;
            let plaintTextContent = 'Human said: ' + messageTxt + '\n';
            plaintTextContent = plaintTextContent + 'Bot reply:  \n';
            plaintTextContent = plaintTextContent + 'Score: 0 \n';
            plaintTextContent = plaintTextContent + 'Please update QnA database to train bot \n';

            let htmlContent = '';
            htmlContent = htmlContent + '<table rules="all" style="border-color: #666;" cellpadding="10">';
            htmlContent = htmlContent + '<tr style=\'background: #ffa73c;\'><td> </td><td></td></tr>';
            htmlContent = htmlContent + '<tr><td><strong>Human said:</strong> </td><td>' + messageTxt + '</td></tr>';
            htmlContent = htmlContent + '<tr><td><strong>Bot recommend other questions but:</strong> </td><td>No question on QnA database matching with their choice</td></tr>';
            htmlContent = htmlContent + '<tr><td><strong>Note:</strong> </td><td>Please update QnA database to train bot</td></tr>';
            htmlContent = htmlContent + '</table>';

            // setup email data with unicode symbols
            let mailOptions = {
              from: '"VietinBank FaQ ChatBot" <vietinbankchatbot@gmail.com>', // sender address
              to: config.QnA_ADMIN_MAIL, // list of receivers
              subject: mailSubject, // Subject line
              text: plaintTextContent, // plain text body
              html: htmlContent // html body
            };

            console.log('Start sent from: %s', mailOptions.from);
            // send mail with defined transport object
            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                return console.log(error);
              }
              console.log('Message sent: %s', info.messageId);
              // Preview only available when sending through an Ethereal account
              console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            });
          });
          return;

        }
      } else {
        switch (quickReply.payload) {
          case 'MQ_HOT_NEWS':
            news.news(sender, f);
            break;
          case 'MQ_ATM_LOCATION':
            loca.showLocation(sender, f);
            break;
          case 'MQ_XRATE':
            news.exchangeRate(sender, f);
            break;
          case 'MQ_IRATE':
            news.interestRate(sender, f);
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
          case 'NEWS_7h30':
            f.txt(sender, 'Bạn đã đăng ký nhận tin thành công. Tin tức mới nhất sẽ được gửi đến bạn lúc 7h30 hàng ngày.');
            break;
          default:
            f.txt(sender, 'Data collected: ' + JSON.stringify(quickReply));
            break;
        }
      }
    }
  }

  processAttachment(sender, message, f) {
    //console.log('processAttachment ');
    let buttons = '';
    let text = '';
    let data = '';
    let locType = 'ATM';

    if (message && message.attachments) {
      console.log('message.attachments: ' + JSON.stringify(message.attachments));
      let locTitle = message.attachments[0].title;
      let coord = message.attachments[0].payload.coordinates;
      let locLat = coord.lat;
      let locLong = coord.long;
      loca.getAtmLocation(sender, locLat, locLong, f);
      //loca.getAtmLocationByText(sender, '108 Tran Hung Dao, Ha Noi', f);

    }
  }
}

module.exports = Scenario;