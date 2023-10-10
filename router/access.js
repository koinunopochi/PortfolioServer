const express = require('express');
const router = express.Router();

const { logger } = require('../lib/logger');

const { MyCustomError } = require('../lib/custom_error');
const { getAccessLogs } = require('../controller/access_log');
const { admin_route } = require('../lib/admin_route');

router.get('/',admin_route, async (req, res, next) => {
  try {
    const { start } = req.query;
    let { end } = req.query;
    logger.info(req.query);
    if (!start) {
      throw new MyCustomError('InvalidStartTime', 'invalid start_time', 400);
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
