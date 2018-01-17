'use strict';

var nodemailer = require('nodemailer');
var http = require('http'); //importing http
var config = require('./config');

var options = {
  host: 'vtbbankbot.herokuapp.com/',
  port: 80,
  path: '/wakeup'
};

console.log("======WAKUP DYNO START");
http.get(options, function(res) {
  // sent mail to remind wakeup bot
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

    let mailSubject = 'VietinBank ChatBot wakeup ';

    let plaintTextContent = '';
    plaintTextContent = plaintTextContent + 'Wake up my dynos \n';

    let htmlContent = '';
    htmlContent = htmlContent + '<table rules="all" style="border-color: #666;" cellpadding="10">';
    htmlContent = htmlContent + '<tr style=\'background: #ffa73c;\'><td> </td><td></td></tr>';
    htmlContent = htmlContent + '<tr><td><strong>Note:</strong> </td><td>Wake up my dynos </td></tr>';
    htmlContent = htmlContent + '</table>';

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"VietinBank FaQ ChatBot" <vietinbankchatbot@gmail.com>', // sender address
      to: 'phantranhung@gmail.com', // list of receivers
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

  res.on('data', function(chunk) {
    try {
      // optional logging... disable after it's working
      console.log("======WAKUP DYNO: HEROKU RESPONSE: " + chunk);
    } catch (err) {
      console.log(err.message);
    }
  });
}).on('error', function(err) {
  console.log("Error: " + err.message);
});