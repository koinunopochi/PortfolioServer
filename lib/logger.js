let pino = require('pino');

module.exports.logger = pino({
  level: 'trace',
  transport: {
    targets: [
      {
        level: 'trace',
        target: 'pino/file',
        options: {
          destination: 'logs/out.log',
          mkdir: true,
        },
      },
      {
        level: 'debug',
        target: require.resolve('pino-pretty'),
        options: {
          colorize: true,
          destination: 1, // stdout
        },
      },
      {
        level: 'error',
        target: 'pino/file',
        options: {
          destination: 'logs/error.log',
          mkdir: true,
        },
      },
    ],
  },
});
