const express = require('express');
const router = express.Router();

const { logger } = require('../lib/logger');

const { MyCustomError } = require('../utils/CustomError');
const { SendMail } = require('../lib/mail');

router.post('/', async (req, res, next) => {
  try {
    logger.info(req.body);
    const { email, company, content, person } = req.body;

    let subject = `【自動送信】【至急対応】dev-okayama.blogのお問い合わせがありました。`;
    let contents = `お問い合わせ内容は以下の通りです。\n\n
    会社名：${company}\n
    ご担当者様：${person}様\n
    メールアドレス：${email}\n\n
    お問い合わせ内容：\n
    ${content}\n\n
    至急対応をお願いします。\n\n`;

    const dev_send = await SendMail(
      'okapi771205a@gmail.com',
      subject,
      contents
    );
    logger.info(dev_send);

    subject = `【自動送信】お問い合わせありがとうございます。`;
    contents = `お問い合わせ内容は以下の通りです。\n\n
    会社名：${company}\n
    ご担当者様：${person}様\n
    メールアドレス：${email}\n\n
    お問い合わせ内容：\n
    ${content}\n\n
    お問い合わせいただきありがとうございます。\n
    ご入力いただいたメールアドレスに、確認次第ご連絡いたします。\n
    ご迷惑をおかけして申し訳ございませんが、今しばらくお待ちください。\n\n
    岡山晃大\n`;
    const result = await SendMail(email, subject, contents);
    logger.info(result);

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

exports.router = router;
