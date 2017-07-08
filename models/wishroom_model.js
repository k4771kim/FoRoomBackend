/**
 * Created by ccei on 2016-01-29.
 */

var autoIncrement = require('mongoose-auto-increment');
mongoose = require('./db_connection');
var db = mongoose.connection;
var wishroomSchema = new mongoose.Schema({
    wr_usrid: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},

    wr_usrname: String,
    wr_usrpic: String,
    wr_sticker: String,
    goods_id: [{type: mongoose.Schema.Types.ObjectId, ref: 'good'}],
    wr_text: String,
    wr_title: String,
    reply: [{
        _id: false,
        rep_usrid: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
        rep_text: String,
        rep_time: {type: Date, default: Date.now}
    }],
    wr_tag: [String],
    wr_scrap: [{usrid : {type :mongoose.Schema.Types.ObjectId , ref : 'user'}}],          //usrid
    wr_hit: {type: Number, default: 0},
    wr_date: {type: Date, default: Date.now},
    wr_delete : {type : Boolean , default : false}
});
wishroomSchema.plugin(autoIncrement.plugin, {
    model: 'wishroom',
    field: 'wr_id',
    startAt: 1,
    incrementBy: 1
});
autoIncrement.initialize(db);
var wishroom = mongoose.model('wishroom', wishroomSchema);

module.exports = wishroom;