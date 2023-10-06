// https://news.mynavi.jp/techplus/article/zerojavascript-20/

const nodemailer = require('nodemailer');
require('dotenv').config();

const MAIL_SENDER_ADDRESS = process.env.MAIL_SENDER_ADDRESS;
const MAIL_SENDER_PASSWORD = process.env.MAIL_SENDER_PASSWORD;

// 認証情報などを設定してNodemailerオブジェクトを生成 --- (*2)
const porter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  secure: true,
  auth: {
    user: MAIL_SENDER_ADDRESS, // Gmailアカウント --- (*3)
    pass: MAIL_SENDER_PASSWORD, // アプリパスワード --- (*4)
  },
});

/**
 * @function SendMail
 * @param {string} getter - 受信者のメールアドレス
 * @param {string} url - 認証用のURL
 * @description
 * この関数は認証用のURLを含むメールをユーザーに送信します。メールの送信に失敗した場合は、コンソールにエラーメッセージが表示されます。送信に成功した場合は、コンソールに成功メッセージが表示されます。
 *
 * @example
 * SendMail('example@example.com', 'http://example.com/auth');
 */
const SendMail = (getter, subject, content) => {
  return new Promise((resolve, reject) => {
    porter.sendMail(
      {
        from: '"No Reply" <' + MAIL_SENDER_ADDRESS + '>',
        to: getter,
        subject: subject,
        text: content,
      },
      function (err, info) {
        if (err) {
          reject(err); // エラーの場合、Promiseをreject
        } else {
          resolve(info); // 正常終了の場合、Promiseをresolve
        }
      }
    );
  });
};

exports.SendMail = SendMail;
