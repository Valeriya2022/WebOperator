var winston = require('winston');
winston.emitErrs = true;

var logger = new (winston.Logger)({
  exitOnError: false,
  transports: [
    new (winston.transports.Console)({
      level:'debug',
      handleExceptions: true,
      prettyPrint: true,
      silent:false,
      timestamp: false,
      colorize: true,
      json: false
    })
  ]
});

module.exports = logger;