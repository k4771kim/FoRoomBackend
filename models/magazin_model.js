/**
 * Created by ccei on 2016-01-29.
 */

mongoose = require('./db_connection');
var db = mongoose.connection;


var magazinSchema = new mongoose.Schema({
    mgz_id: Number,
    mgz_series: Number,
    mgz_date: {type: Date, default: Date.now},
    mgz_title: String,
    mgz_titlepic: String,
    mgz_pic1: String,
    mgz_pic2: String,
    mgz_pic3: String,
    mgz_pic4: String,
    mgz_pic5: String,
    mgz_text1: String,
    mgz_text2: String,
    mgz_text3: String,
    mgz_text4: String,
    mgz_text5: String,
    mgz_usevr: {TYPE : Boolean, default : false},
    mgz_vrpic: String,
    reply: [{_id : false,rep_usrid: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}, rep_text: String , rep_time : {type: Date, default: Date.now}}],
    mgz_scrap : [{_id : false,usrid: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}}],
    mgz_hit: {type: Number, default: 0} //예시로 작성함..
});

var magazin = db.model('magazin', magazinSchema);


module.exports = magazin;