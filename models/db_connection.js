var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/local'); // 포트번호 생략.

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log('MongoDB Connected!!');
});

module.exports = mongoose;