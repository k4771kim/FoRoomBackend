/**
 * Created by ccei on 2016-02-01.
 */


var autoIncrement = require('mongoose-auto-increment');
mongoose = require('./db_connection');
var db = mongoose.connection;
var categorySchema = mongoose.Schema({category: String , category_cnt : Number});

categorySchema.plugin(autoIncrement.plugin, {
    model: 'goods_category',
    field: 'category_id',
    startAt: 1,
    incrementBy: 1
})

var category = mongoose.model('goods_category',categorySchema);

module.exports = category;