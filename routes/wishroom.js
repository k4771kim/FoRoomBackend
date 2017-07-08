var express = require('express');
var router = express.Router();
var mongoose = require('../models/db_connection');
var moment = require('moment');
var goods = require('../models/goods_model');
var multer = require('multer');
user = require('../models/user_model');
wishroom = require('../models/wishroom_model');
var wishroom_url_path = '/images/wishroom';
var goods_url_path = '/images/goods'
var async = require('async');
var result = {
    result: String
};
//////////////////////////////////////////////////////////////////////////////////////페이징

router.post('/list/:page', (req, res)=> {         // GET 위시룸 LIST

    var usrid = req.body.usrid;
    var page = req.params.page;
    var rank = req.body.rank;

    var sort;
    if (rank == null) {
        sort = [['wr_id', 'descending']]
    } else {
        sort = [['wr_hit', 'descending']]
    }
    var result = {
        result: String,
        wishroom_list: [Object]
    }


    var data = {


        _id: false,
        "wr_id": true,
        wr_usrid: true,
        "wr_date": true,
        "wr_hit": true,
        "wr_scrap": true,
        "reply": true,
        wr_title: true,
        wr_sticker: true,
        wr_tag: true,
        wr_date: true
    }

    wishroom.find({wr_delete: null} && {wr_delete: false}, data).populate({
            path: 'wr_usrid',
            model: user,
            select: '-_id usr_id usr_name'
        })
        .populate({path: 'wr_scrap.usrid', model: user, select: '-_id usr_id'}).sort(sort).lean().skip(10*(page-1)).limit(10).exec((err, docs)=> {

        if (err) {
            next(err);
        }

        async.eachSeries(docs, function iteratee(item, callback) {

                item.wr_sticker = wishroom_url_path + item.wr_sticker;
                item.wr_date = moment(item.wr_date).format('YYYY. MM. DD.');
                item.wr_scrap_count = item.wr_scrap.length;
                item.wr_reply_count = item.reply.length;
                item.wr_usrname = item.wr_usrid.usr_name;


                item.wr_check = false;
                for (var j = 0; j < item.wr_scrap.length; j++) {


                    if (item.wr_scrap[j].usrid.usr_id == usrid) {
                        item.wr_check = true;
                        break;
                    }
                }
                delete item.wr_usrid;
                delete item.wr_scrap;
                delete item.reply;
                callback();

            }, function done() {

                result.result = "SUCCESS";
                result.wishroom_list = docs;
                return res.json(result);


            }
        );

    });


});

//////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/list', (req, res)=> {         // GET 위시룸 LIST

    var usrid = req.body.usrid;

    var rank = req.body.rank;

    var sort;
    if (rank == null) {
        sort = [['wr_id', 'descending']]
    } else {
        sort = [['wr_hit', 'descending']]
    }
    var result = {
        result: String,
        wishroom_list: [Object]
    }


    var data = {


        _id: false,
        "wr_id": true,
        wr_usrid: true,
        "wr_date": true,
        "wr_hit": true,
        "wr_scrap": true,
        "reply": true,
        wr_title: true,
        wr_sticker: true,
        wr_tag: true,
        wr_date: true
    }

    wishroom.find({wr_delete: null} && {wr_delete: false}, data).populate({
            path: 'wr_usrid',
            model: user,
            select: '-_id usr_id usr_name'
        })
        .populate({path: 'wr_scrap.usrid', model: user, select: '-_id usr_id'}).sort(sort).lean().exec((err, docs)=> {

        if (err) {
            next(err);
        }

        async.eachSeries(docs, function iteratee(item, callback) {

                item.wr_sticker = wishroom_url_path + item.wr_sticker;
                item.wr_date = moment(item.wr_date).format('YYYY. MM. DD.');
                item.wr_scrap_count = item.wr_scrap.length;
                item.wr_reply_count = item.reply.length;
                item.wr_usrname = item.wr_usrid.usr_name;


                item.wr_check = false;
                for (var j = 0; j < item.wr_scrap.length; j++) {


                    if (item.wr_scrap[j].usrid.usr_id == usrid) {
                        item.wr_check = true;
                        break;
                    }
                }
                delete item.wr_usrid;
                delete item.wr_scrap;
                delete item.reply;
                callback();

            }, function done() {

                result.result = "SUCCESS";
                result.wishroom_list = docs;
                return res.json(result);


            }
        );

    });


});

//////////////////////////////////////////////////////////////////////////////////////////////////


var pic = {};
var fs = require('fs');
var storage_path = './public/images/wishroom/';


var wishroom_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        fs.mkdir(storage_path + moment(Date.now()).format('YYMMDD'), (err)=> {
            cb(null, storage_path + moment(Date.now()).format('YYMMDD'));
        });
    }
    ,
    filename: function (req, file, cb) {
        var date = moment(Date.now()).format('YYMMDD'); //오늘..
        var cutoff = new Date(Date.now());

        //var uploadedName = docs.length + 1 + "_" + file.fieldname;
        //uploadedName += "." + file.originalname.split('.')[1];
        var uploadedName = moment(Date.now()).format('YYMMDDHHmmss') + "_" + req.body.usrid;
        uploadedName += "." + file.originalname.split('.')[1];

        if (file.fieldname == 'sticker')
            pic.sticker = '/' + date + '/' + uploadedName;
        cb(null, uploadedName);

    },

    limits: {fileSize: 10 * 1024 * 1024}  //단위가 바이트.
});


var wishroom_upload = multer({storage: wishroom_storage}).single('sticker');

var async = require('async');
router.post('/insert', wishroom_upload, (req, res) => {    // POST 위시룸 작성

    var wr_usrid = req.body.usrid;
    var wr_title = req.body.title;
    var wr_taging = req.body.tag;
    var gd_id = req.body.goods;
    var goods_id = [];
    var wr_tag = [];

    if (!gd_id) {
    } else if (typeof gd_id != "object") {
        goods_id.push(gd_id);
    } else {
        goods_id = gd_id;
    }

    if (!wr_taging) {

    } else if (typeof wr_taging != "object") {
        wr_tag.push(wr_taging);
    } else {
        wr_tag = wr_taging;
    }

    if (!req.file) {
        return res.json({result: "파일이 없졍"});
    }

    user.findOne({usr_id: wr_usrid}, {_id: 1}, (err, doc) => {

        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
        }


        if (doc == null) {
            result.result = "NONE_USER";
            return res.json(result);
        }

        var data = new wishroom({
            wr_sticker: pic.sticker,
            wr_title: wr_title,
            wr_tag: wr_tag,
            sr_scrap: []
        });
        data.wr_usrid = doc._id;

        async.eachSeries(goods_id, function iteratee(item, callback) {
            console.log(item);

            goods.findOne({gd_id: item}, {_id: 1}, (err, doc)=> {
                if (err) {
                    result.result = "FAIL";
                    result.result_msg = err;
                    return res.json(result);
                }
                if (!doc) {
                    console.log("NODOC", "none_doc");
                } else {
                    console.log("YESDOC", doc);
                    data.goods_id.push(doc._id);
                }
                callback();
            });
        }, function done() {

            //console.log("호출");
            data.save((err, doc) => {

                if (err) {
                    result.result = "FAIL";
                    result.result_msg = err;
                    return res.json(result);
                }

                console.log('Create Data!');

                console.log(doc);
                user.update({usr_id: wr_usrid}, {$addToSet: {usr_wrwrite: {doc: doc._id}}}, (err, update)=> {
                    if (err) {
                        result.result = "FAIL";
                        result.result_msg = err;
                        return res.json(result);
                    }

                    if (update.n == 1 && update.nModified == 1) {
                        result.result = "SUCCESS";


                    }
                    else if (update.n == 0 && update.nModified == 0) {
                        result.result = "EMPTY_USER"

                    }

                    return res.json(result);

                })


            });

        })

    })


});

router.get('/read/:id/', (req, res) => {    // GET 위시룸 읽기.


    var wr_id = req.params.id;
    //var r = req.params.r;
    wishroom.findOne({wr_id: wr_id}).populate('wr_usrid').populate('goods_id').exec((err, doc)=> {
        var result = {
            result: String,
            wishroom_body: Object
        };
        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
        }
        if (doc == null) {
            result.result = "EMPTY";
        } else {

            result.result = "SUCCESS";
            //
            result.wishroom_body = {
                wr_usrid: doc.wr_usrid.usr_id,
                wr_usrname: doc.wr_usrid.usr_name,
                wr_usrpic: doc.wr_usrid.usr_pic,
                wr_sticker: wishroom_url_path + doc.wr_sticker,
                goods_id: [],
                wr_text: doc.wr_text,
                wr_title: doc.wr_title,
                wr_reply_count: doc.reply.length,
                wr_tag: doc.wr_tag,
                wr_scrap_count: doc.wr_scrap.length,          //usrid
                wr_date: moment(doc.wr_date).format('YYYY-MM-DD hh:mm:ss'),
                wr_hit: doc.wr_hit,
            }
            for (var i = 0; i < doc.goods_id.length; i++) {

                result.wishroom_body.goods_id.push({
                    gd_id: doc.goods_id[i].gd_id,
                    gd_name: doc.goods_id[i].gd_name,
                    gd_series: doc.goods_id[i].gd_series,
                    "gd_link": doc.goods_id[i].gd_link,
                    "gd_price": doc.goods_id[i].gd_price,
                    "gd_desc": doc.goods_id[i].gd_desc,
                    gd_sticker: goods_url_path + doc.goods_id[i].gd_sticker,
                    gd_scarp_count: doc.goods_id[i].gd_scrap.length
                    //gd_pic: [
                    //    goods_url_path + doc.goods_id[i].gd_pic1,
                    //    goods_url_path + doc.goods_id[i].gd_pic2,
                    //    goods_url_path + doc.goods_id[i].gd_pic3,
                    //    goods_url_path + doc.goods_id[i].gd_pic4,
                    //    goods_url_path + doc.goods_id[i].gd_pic5]

                });

            }


            wishroom.update({wr_id: doc.wr_id}, {$inc: {wr_hit: 1}}, (err, update)=> {
                if (err) return res.json(err);

                console.log(update);
            })


        }
        return res.json(result);
    });

});

///////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/filter', (req, res) => {

    var usrid = req.body.usrid;
    var tag1 = req.body.tag1;
    var tag2 = req.body.tag2;
    var tag3 = req.body.tag3;
    var tag4 = req.body.tag4;
    var tag5 = req.body.tag5;
    var data1 = [];
    var data2 = [];

    if (tag1 != null)
        data1.push(tag1);
    if (tag2 != null)
        data1.push(tag2);
    if (tag3 != null)
        data1.push(tag3);
    if (tag4 != null)
        data2.push(tag4);
    if (tag5 != null)
        data2.push(tag5);


    var query;
    if (data1.length != 0 && data2.length != 0) { //둘다있음
        console.log('둘다검색');
        query = {"wr_tag": {$all: data1}, "wr_tag": {$all: data2}};
    }
    else if (data1.length != 0 && data2.length == 0) { //위만있음
        console.log('위만검색');
        query = {"wr_tag": {$all: data1}};
    }
    else if (data1.length == 0 && data2.length != 0) { //아래만있음
        console.log('아래만검색');
        query = {"wr_tag": {$all: data2}};
    }
    else if (data1.length == 0 && data2.length == 0) { //둘다없음
        console.log('필터없음');
        query = {};
    }

    var result = {
        result: String,
        wishroom_list: []
    }

    user.findOne({usr_id: usrid}, {_id: 1}, (err, doc)=> {
        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }
        if (!doc) {
            result.result = "EMPTY_USER";
            return res.json(result);
        }
        var usr_objid = doc._id;
        wishroom.find(query).populate('wr_usrid').sort([['wr_id', 'descending']]).exec((err, docs)=> {


            if (err) {
                result.result = "FAIL";
                result.result_msg = err;
                return res.json(result);
            }

            for (var i = 0; i < docs.length; i++) {
                result.wishroom_list[i] = {
                    wr_id: docs[i].wr_id,
                    //wr_usrid : docs[i].wr_usrid,
                    wr_usrname: docs[i].wr_usrid.usr_name,
                    //wr_usrpic: docs[i].wr_usrid.usr_pic,
                    wr_sticker: wishroom_url_path + docs[i].wr_sticker,
                    //goods_id: docs[i].goods_id,
                    wr_title: docs[i].wr_title,
                    wr_reply_count: docs[i].reply.length,
                    wr_tag: docs[i].wr_tag,
                    wr_scrap_count: docs[i].wr_scrap.length,      //usrid
                    wr_hit: docs[i].wr_hit,
                    wr_date: moment(docs[i].wr_date).format('YYYY-MM-DD hh:mm:ss'),
                    wr_check: false
                }


                for (var j = 0; j < docs[i].wr_scrap.length; j++) {

                    console.log(docs[i].wr_scrap);
                    console.log(usr_objid);
                    if (docs[i].wr_scrap.usrid == usr_objid.usrid) {
                        console.log('있음')
                        result.wishroom_list[i].wr_check = true;
                        break;
                    }
                }
            }
            result.result = "SUCCESS";
            return res.json(result);

        });
    })


});


router.post('/modify', (req, res) => { //삭제하기 기능도 여기에 포함하기.
    var deleteCheck = req.body.deleteCheck || 'off';
    var wr_id = req.body.wr_id;
    var web = req.body.web;

    var del;

    if (deleteCheck == "on")
        del = true;
    else if (deleteCheck == "off")
        del = false;

    wishroom.update({wr_id: wr_id}, {$set: {wr_delete: del}}, (err, update)=> {

        if (web)
            wishroom.find({}).populate('wr_usrid').sort([['wr_id', 'ascending']]).exec((err, docs)=> {
                res.render('admin/wishroom/main', {wishroom: docs});
            })
        else
            res.json({result: "SUCCESS"});
    })

});


module.exports = router;