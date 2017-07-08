/**
 * Created by ccei on 2016-02-06.
 */
mongoose = require('./db_connection');
var db = mongoose.connection;

var adminSchema = new mongoose.Schema({

    admin_id : String,
    admin_pw : String


});

var admin = db.model('admin', adminSchema);

module.exports = admin;