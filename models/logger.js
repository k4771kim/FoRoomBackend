/**
 * Created by ccei on 2016-02-03.
 */

var winston = require('winston');
var moment = require('moment');

var daily_opts = {
    level: 'debug', //debug - > info - > warn - > error순서
    filename: 'app-debug',
    maxsize: 10 * 1024 * 1024,
    datePattern: '.yyyy-MM-dd.log',
    timestamp: function () {
        return moment().format("YYYY-MM-DD HH:mm:ss");
    }
}

var options = {
    level: 'info',
    transports: [
        new (winston.transports.Console)({colorize: 'all'}),
        new (winston.transports.File)({level: 'warn', filename: './logfile/'+ moment().format("YYYY-MM-DD") +'.log'}),
        new (require('winston-daily-rotate-file'))(daily_opts)
    ]
}

var logger = new winston.Logger(options);

module.exports = logger;