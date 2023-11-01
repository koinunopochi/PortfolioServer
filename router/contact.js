const express = require('express');
const router = express.Router();

const { logger } = require('../lib/logger');
const { SendMail } = require('../lib/mail');
const AUTH_USER_EMAIL = process.env.AUTH_USER_EMAIL;


/**
 * 管理者へのお問い合わせメール内容を生成する関数
 * 
 * @param {Object} param0 - メールの内容
 * @param {string} param0.email - 送信者のメールアドレス
 * @param {string} param0.company - 送信者の会社名
 * @param {string} param0.content - お問い合わせ内容
 * @param {string} param0.person - 送信者の名前
 * @returns {Object} メールの件名と内容
 */
const createAdminMailContents = ({ email, company, content, person }) => {
  const subject = `【自動送信【至急対応】dev-okayama.blogのお問い合わせがありました。`;
  const contents = `
    お問い合わせ内容は以下の通りです。

    会社名：${company}
    ご担当者様：${person}様
    メールアドレス：${email}

    お問い合わせ内容：
    ${content}

    至急対応をお願いします。
  `;
  return { subject, contents };
};

/**
 * ユーザーへのお問い合わせ完了メール内容を生成する関数
 * 
 * @param {Object} param0 - メールの内容
 * @param {string} param0.email - 送信者のメールアドレス
 * @param {string} param0.company - 送信者の会社名
 * @param {string} param0.content - お問い合わせ内容
 * @param {string} param0.person - 送信者の名前
 * @returns {Object} メールの件名と内容
 */
const createUserMailContents = ({ email, company, content, person }) => {
  const subject = `【自動送信】お問い合わせありがとうございます。`;
  const contents = `
    お問い合わせ内容は以下の通りです。

    会社名：${company}
    ご担当者様：${person}様
    メールアドレス：${email}

    お問い合わせ内容：
    ${content}

    お問い合わせいただきありがとうございます。
    ご入力いただいたメールアドレスに、確認次第ご連絡いたします。
    ご迷惑をおかけして申し訳ございませんが、今しばらくお待ちください。
  `;
  return { subject, contents };
};

/**
 * メール送信をラップする関数
 * 
 * @param {string} to - 送信先のメールアドレス
 * @param {Object} mailContents - メールの内容
 * @param {string} mailContents.subject - メールの件名
 * @param {string} mailContents.contents - メールの本文
 * @returns {Promise<Object>} メール送信の結果
 */
const sendMailWrapper = async (to, mailContents) => {
  const result = await SendMail(
    to,
    mailContents.subject,
    mailContents.contents
  );
  logger.info(result);
  return result;
};

/**
 * お問い合わせ内容を受け取り、管理者とユーザーにメールを送信するエンドポイント
 */
// TODO: バリデーション
router.post('/', async (req, res, next) => {
  try {
    const { email, company, content, person } = req.body;
    const prams = { email, company, content, person };

    // 管理者へのメール送信
    const adminMail = createAdminMailContents(prams);
    await sendMailWrapper(AUTH_USER_EMAIL, adminMail);

    // ユーザーへのメール送信
    const userMail = createUserMailContents(prams);
    await sendMailWrapper(email, userMail);

    res.status(200).json({ message: 'success' });
  } catch (error) {
    next(error);
  }
});

exports.router = router;
