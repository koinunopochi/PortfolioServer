const express = require('express');
const ValidationError = require('./CustomError').ValidationError;
const { logger } = require('../lib/logger');
const cookieParser = require('cookie-parser');
// 認証回り
const ValidationEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email === undefined) {
    throw new ValidationError('email is not defined');
  } else if (emailRegex.test(email)) {
    return true;
  } else {
    throw new ValidationError('email is not correct');
  }
};
exports.ValidationEmail = ValidationEmail;

const ValidationPassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!-\/:-@\[-`{-~])[!-~]{8,128}$/;

  if (password === undefined) {
    throw new ValidationError('password is not defined');
  } else if (passwordRegex.test(password)) {
    return true;
  } else {
    throw new ValidationError('password is not correct');
  }
};
exports.ValidationPassword = ValidationPassword;

// parseJsonを呼び，ラップしてエラーハンドリングができるようにしている
const parseJSON = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      express.json()(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    logger.info('parse is success');
    next();
  } catch (err) {
    if (err instanceof SyntaxError && err.status === 400) {
      next(new ValidationError('JSON Parse Error'));
    } else {
      next(err);
    }
  }
};
exports.parseJSON = parseJSON;

const ParseCookie = async (req, res, next) => {
  try {
    await new Promise((resolve, reject) => {
      cookieParser()(req, res, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    logger.info('parse cookie is success');
    next();
  } catch (err) {
    if (err instanceof SyntaxError && err.status === 400) {
      next(new ValidationError('Cookie Parse Error'));
    } else {
      next(err);
    }
  }
};
exports.ParseCookie = ParseCookie;

/**
 * @function
 * @param {Object} params - チェックすべきパラメータが含まれるオブジェクト
 * @param {Array<string>} allowedParams - 許可されるパラメータの配列
 *
 * @returns {boolean} - パラメータが有効な場合はtrueを返し、無効な場合はValidationErrorをスローします。
 *
 * @throws {ValidationError} - 無効なパラメータが存在する場合にスローされます。
 *
 * @description
 * この関数は、指定されたオブジェクト内のパラメータが許可されたパラメータリストに準拠しているかどうかをチェックします。
 * もし許可されていないパラメータがあれば、ValidationErrorをスローします。それ以外の場合は、trueを返します。
 */
const ValidationParams = (params, allowedParams) => {
  // const allowedParams = ['model', 'prompt'];
  const receivedParams = Object.keys(params);
  const invalidParams = receivedParams.filter(
    (param) => !allowedParams.includes(param)
  );
  if (invalidParams.length > 0) {
    throw new ValidationError(`Invalid params: ${invalidParams.join(', ')}`);
  } else {
    return true;
  }
};
exports.ValidationParams = ValidationParams;

// モデル名のチェック
const ValidationModel = (model) => {
  const models = [
    'gpt-4',
    'gpt-4-0613',
    'gpt-4-32k',
    'gpt-4-32k-0613',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0613',
    'gpt-3.5-turbo-16k',
    'gpt-3.5-turbo-16k-0613',
  ];
  if (model === undefined) {
    throw new ValidationError('model is not defined');
  } else if (models.includes(model)) {
    return true;
  } else {
    throw new ValidationError('model is not correct');
  }
};
exports.ValidationModel = ValidationModel;

// プロンプトのチェック
const ValidationPrompt = (prompt) => {
  if (prompt === undefined) {
    throw new ValidationError('prompt is not defined');
  } else if (prompt == '') {
    throw new ValidationError('prompt is empty');
  } else {
    return true;
  }
};
exports.ValidationPrompt = ValidationPrompt;

const ValidationNumber = (num) => {
  if (num === undefined) {
    throw new ValidationError('この項目は定義必須です');
  } else if (num == '') {
    throw new ValidationError('この項目は入力必須です');
  } else if (isNaN(num)) {
    throw new ValidationError('この項目は数字のみ入力可能です');
  } else {
    return true;
  }
};
exports.ValidationNumber = ValidationNumber;
