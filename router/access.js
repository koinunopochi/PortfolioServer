const express = require('express');
const router = express.Router();

const { logger } = require('../utils/logger');

const { MyCustomError } = require('../utils/custom_error');
const { getAccessLogs } = require('../controller/access_log');
const { admin_route } = require('../utils/admin_route');

router.get('/', admin_route, async (req, res, next) => {
  try {
    const { start } = req.query;
    let { end } = req.query;
    logger.info(req.query);
    if (!start) {
      throw new MyCustomError('InvalidStartTime', 'startの値は必須です。', 400);
    }
    if (!end) {
      end = new Date();
    }
    const result = await getAccessLogs(start, end);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

exports.router = router;
