/**
 * Created by ccei on 2016-02-01.
 */
mongoose = require('./db_connection');
var db = mongoose.connection;
var versionSchema = mongoose.Schema({

    goodsversion: Number,
    appversion : Number

});

var version = mongoose.model('version',versionSchema);

module.exports = version;