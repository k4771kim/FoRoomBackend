var express = require('express'),
    app = express(), path = require('path'), logger = require('morgan'), fs = require('fs'), bodyParser = require('body-parser'), cookieParser = require('cookie-parser'),
    server = require('http').createServer(app).listen(80);

var favicon = require('serve-favicon');
///////////////로깅/////////////////////
var winston = require('winston');

//var Logger = new (winston.Logger)({
//    transports:[
//        new (winston.transports.Console)(),
//        new (winston.transports.File)({filename : 'somefile.log'})
//    ]
//});
//Logger.log('info', 'Hello distributed log files!');
//Logger.info('Hello');
//winston.level = 'debug';
//winston.log('debog', 'Now my debug');

var Logger = require('./models/logger');

//Logger.debug('debug1');
//Logger.info('info');
//Logger.warn('warn');
//Logger.error('error');


///////////////로깅/////////////////////


//var express = require('express');
//var app = express();
//var port = process.env.PORT || 3000;

//경로 설정
var admin = require('./routes/admin');
var user = require('./routes/user');
var magazin = require('./routes/magazin');
var myroom = require('./routes/myroom');
var wishroom = require('./routes/wishroom');
var goods = require('./routes/goods');
var reply = require('./routes/reply');
var share = require('./routes/share');


//기본설정
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use('/admin', admin);
app.use('/user', user);
app.use('/mgz', magazin);
app.use('/myroom', myroom);
app.use('/wishroom', wishroom);
app.use('/goods', goods);
app.use('/reply', reply);
app.use('/foroom', share); //댓글


//app.use(function (err, req, res, next) {
//    res.status(err.status || 500);
//    //res.render('error', {
//    //    message: err.message,
//    //    error: {}
//    //});
//    return res.json({
//        result: "FAIL",
//        err: err.message
//    })
//});

//에러 핸들러
app.use(require('./routes/error'));


process.on('uncaughtException', function (err,res) {
    //console.log('Caught exception: ' + err);

        Logger.error(err);
});

module.exports = app;