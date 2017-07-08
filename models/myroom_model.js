/**
 * Created by ccei on 2016-01-29.
 */

var autoIncrement = require('mongoose-auto-increment');
mongoose = require('./db_connection');
var db = mongoose.connection;

var myroomSchema = new mongoose.Schema({
    mr_usrid: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
    mr_title : String,
    mr_pic1: String,
    mr_pic2: String,
    mr_pic3: String,
    mr_pic4: String,
    mr_pic5: String,
    mr_text1: String,
    mr_text2: String,
    mr_text3: String,
    mr_text4: String,
    mr_text5: String,
    reply: [{_id : false, rep_usrid: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}, rep_text: String,rep_time : {type: Date, default: Date.now}}],
    mr_tag: [String],
    mr_scrap:  [{_id : false,usrid: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}}],          //usrid
    mr_hit: {type: Number, default: 0},
    mr_date: {type: Date, default: Date.now},
    mr_pic1tag : [{    _id: false,dataX : Number, dataY : Number, Text : String , Color : Number}],
    mr_pic2tag : [{    _id: false,dataX : Number, dataY : Number, Text : String , Color : Number}],
    mr_pic3tag : [{    _id: false,dataX : Number, dataY : Number, Text : String , Color : Number}],
    mr_pic4tag : [{    _id: false,dataX : Number, dataY : Number, Text : String , Color : Number}],
    mr_pic5tag : [{    _id: false,dataX : Number, dataY : Number, Text : String , Color : Number}],
    mr_delete : {type : Boolean , default : false}

});
myroomSchema.plugin(autoIncrement.plugin, {
    model: 'myroom',
    field: 'mr_id',
    startAt: 1,
    incrementBy: 1
});
autoIncrement.initialize(db);

var myroom = db.model('myroom', myroomSchema);
module.exports = myroom;