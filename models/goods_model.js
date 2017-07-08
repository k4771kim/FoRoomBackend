/**
 * Created by ccei on 2016-01-27.
 */
mongoose = require('./db_connection');
var autoIncrement = require('mongoose-auto-increment');
var db = mongoose.connection;

var goodsSchema = mongoose.Schema({
    gd_id : String,
    gd_desc: String,
    gd_name: String,
    gd_price: {type : Number, default : 0},
    gd_link: String,
    gd_series: String,
    gd_sticker: String,
    gd_pic1: String,
    gd_pic2: String,
    gd_pic3: String,
    gd_pic4: String,
    gd_pic5: String,
    gd_scrap : [{_id : false,usrid: {type : mongoose.Schema.Types.ObjectId, ref : 'user'}}]
});

//goodsSchema.plugin(autoIncrement.plugin, {
//    model: 'good',
//    field: 'gd_id',
//    startAt: 1,
//    incrementBy: 1
//});
autoIncrement.initialize(db);
var goods = mongoose.model('good', goodsSchema); //kim + s: Collection 명


module.exports = goods;