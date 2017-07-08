var express = require('express');
var router = express.Router();
var moment = require('moment');
var multer = require('multer');
var myroom = require('../models/myroom_model');
var user = require('../models/user_model');
var async = require('async');
var result = {
    result: String
};
var myroom_url_path = '/images/myroom';
//////////////////////////////////////////////////////////////////////////////////////잘라서 보내주기
router.post('/list/:page', (req, res, next)=> {       // GET 마이룸 LIST
    var page = req.params.page;
    var usrid = req.body.usrid;
    var rank = req.body.rank;

    if (rank == null) {
        sort = [['mr_id', 'descending']]
    } else {
        sort = [['mr_hit', 'descending']]
    }

    var result = {
        result: String,
        myroom_list: []
    }
    var data = {
        _id: false,
        "mr_id": true,
        mr_usrid: true,
        "mr_date": true,
        "mr_hit": true,
        "mr_scrap": true,
        "reply": true,
        mr_title: true,
        "mr_pic1": true,
        mr_tag: true
    }


    myroom.find({mr_delete: null} && {mr_delete: false}, data).populate({
            path: 'mr_usrid',
            model: user,
            select: '-_id usr_id usr_name'
        })
        .populate({
            path: 'mr_scrap.usrid',
            model: user,
            select: '-_id usr_id'
        }).sort(sort).lean().skip(10 * (page - 1)).limit(10).exec((err, docs)=> {

        if (err) {
            next(err);
        }

        async.eachSeries(docs, function iteratee(item, callback) {

                item.mr_date = moment(item.mr_date).format('YYYY. MM. DD.');
                item.mr_scrapcount = item.mr_scrap.length;
                item.mr_replycount = item.reply.length;
                item.mr_usrname = item.mr_usrid.usr_name;
                item.mr_pic = Array(myroom_url_path + item.mr_pic1);

                item.mr_check = false;
                for (var j = 0; j < item.mr_scrap.length; j++) {

                    if (item.mr_scrap[j].usrid.usr_id == usrid) {
                        item.mr_check = true;
                        break;
                    }
                }
                delete item.mr_usrid;
                delete item.mr_scrap;
                delete item.reply;
                delete item.mr_pic1; //추후 삭제할듯
                callback();

            }, function done() {

                result.result = "SUCCESS";
                result.myroom_list = docs;
                return res.json(result);


            }
        );

    });


});


//////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/list', (req, res, next)=> {       // GET 마이룸 LIST

    var usrid = req.body.usrid;
    var rank = req.body.rank;

    if (rank == null) {
        sort = [['mr_id', 'descending']]
    } else {
        sort = [['mr_hit', 'descending']]
    }

    var result = {
        result: String,
        myroom_list: []
    }

    //user.findOne({usr_id: usrid}, {_id: 1}, (err, doc)=> {
    //    if (err) {
    //        result.result = "FAIL";
    //        result.result_msg = err;
    //        return res.json(result);
    //    }
    //    if (!doc) {
    //        result.result = "EMPTY_USER";
    //        return res.json(result);
    //    }
    //    var usr_objid = doc._id;

    var data = {
        _id: false,
        "mr_id": true,
        mr_usrid: true,
        "mr_date": true,
        "mr_hit": true,
        "mr_scrap": true,
        "reply": true,
        mr_title: true,
        "mr_pic1": true,
        mr_tag: true
    }


    myroom.find({mr_delete: null} && {mr_delete: false}, data).populate({
            path: 'mr_usrid',
            model: user,
            select: '-_id usr_id usr_name'
        })
        .populate({path: 'mr_scrap.usrid', model: user, select: '-_id usr_id'}).sort(sort).lean().exec((err, docs)=> {

        if (err) {
            next(err);
        }

        async.eachSeries(docs, function iteratee(item, callback) {

                item.mr_date = moment(item.mr_date).format('YYYY. MM. DD.');
                item.mr_scrapcount = item.mr_scrap.length;
                item.mr_replycount = item.reply.length;
                item.mr_usrname = item.mr_usrid.usr_name;
                item.mr_pic = Array(myroom_url_path + item.mr_pic1);

                item.mr_check = false;
                for (var j = 0; j < item.mr_scrap.length; j++) {

                    if (item.mr_scrap[j].usrid.usr_id == usrid) {
                        item.mr_check = true;
                        break;
                    }
                }
                delete item.mr_usrid;
                delete item.mr_scrap;
                delete item.reply;
                delete item.mr_pic1; //추후 삭제할듯
                callback();

            }, function done() {

                result.result = "SUCCESS";
                result.myroom_list = docs;
                return res.json(result);


            }
        );

    });


});
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var fs = require('fs');
var storage_path = './public/images/myroom/';

router.post('/insert', (req, res, next) => {    // POST 마이룸 작성
    var pic = {};
    var myroom_storage = multer.diskStorage({
        destination: function (req, file, cb) {

            fs.mkdir(storage_path + moment(Date.now()).format('YYMMDD'), (err)=> {
                cb(null, storage_path + moment(Date.now()).format('YYMMDD'));
            });


        }
        ,
        filename: function (req, file, cb) {
            var date = moment(Date.now()).format('YYMMDD'); //오늘..

            var time = moment(Date.now()).format('hhmmss'); //오늘..

            //var cutoff = new Date();
            if (req.files.pic1 == null) {
                cb(null, "null");
            } else {
                //cutoff.setDate(cutoff.getDate());
                //myroom.find({mr_date: {$gte: cutoff.getDay()}}, function (err, docs) {

                //var uploadedName = docs.length + 1 + "_" + file.fieldname;
                var uploadedName = req.body.usrid + "_" + time + "_" + file.fieldname;
                uploadedName += "." + file.originalname.split('.')[1];

                if (file.fieldname == 'pic1') {

                    pic.pic1 = '/' + date + '/' + uploadedName;
                }
                else if (file.fieldname == 'pic2')
                    pic.pic2 = '/' + date + '/' + uploadedName;
                else if (file.fieldname == 'pic3')
                    pic.pic3 = '/' + date + '/' + uploadedName;
                else if (file.fieldname == 'pic4')
                    pic.pic4 = '/' + date + '/' + uploadedName;
                else if (file.fieldname == 'pic5')
                    pic.pic5 = '/' + date + '/' + uploadedName;


                cb(null, uploadedName);


                //});
            }
        },
        limits: {fileSize: 10 * 1024 * 1024}  //단위가 바이트.
    });
    var myroom_upload = multer({storage: myroom_storage}).fields([
        {name: 'pic1', maxCount: 1},
        {name: 'pic2', maxCount: 1},
        {name: 'pic3', maxCount: 1},
        {name: 'pic4', maxCount: 1},
        {name: 'pic5', maxCount: 1}
    ]);


    myroom_upload(req, res, (err)=> {

        if (err) return next(err);

        var usrid = req.body.usrid;
        var text1 = req.body.text1;
        var text2 = req.body.text2;
        var text3 = req.body.text3;
        var text4 = req.body.text4;
        var text5 = req.body.text5;
        var tag = req.body.tag;
        var mr_tag = [];
        var dataX = [], dataY = [], dataColor = [], dataText = [];
        if (!tag) {
        } else if (typeof tag != "object") {
            mr_tag.push(tag);
        } else {
            mr_tag = tag;
        }


        var title = req.body.title;

        if (req.files.pic1 == null) {
            return res.json({result: "none_pic1 File"});
        }

        user.findOne({usr_id: usrid}, {_id: 1}, (err, doc)=> {

            if (doc == null) {
                result.result = "NONE_USER";
                return res.json(result);
            }

            var data = new myroom({
                mr_usrid: doc._id,
                mr_tag: mr_tag,
                mr_title: title,
                mr_pic1: pic.pic1,
                mr_pic2: pic.pic2,
                mr_pic3: pic.pic3,
                mr_pic4: pic.pic4,
                mr_pic5: pic.pic5,
                mr_text1: text1,
                mr_text2: text2,
                mr_text3: text3,
                mr_text4: text4,
                mr_text5: text5
            });
            if (pic.pic1 != null) {
                //mr_pic1tag;
                data.mr_pic1tag = [];
                if (req.body.pic1x != null) {

                    if (typeof req.body.pic1x != "object") {
                        dataX.push(req.body.pic1x);
                        dataY.push(req.body.pic1y);
                        dataColor.push(req.body.pic1color);
                        dataText.push(req.body.pic1txt);
                    } else {
                        dataX = req.body.pic1x;
                        dataY = req.body.pic1y;
                        dataColor = req.body.pic1color;
                        dataText = req.body.pic1txt;
                    }
                    for (var i = 0; i < dataX.length; i++) {
                        var mr_pic1tag = {
                            dataX: dataX[i],
                            dataY: dataY[i],
                            Text: dataText[i],
                            Color: dataColor[i]
                        }
                        data.mr_pic1tag.push(mr_pic1tag);
                    }
                }
            }
            if (pic.pic2 != null) {
                data.mr_pic2tag = [];

                if (req.body.pic2x != null) {
                    if (typeof req.body.pic2x != "object") {
                        dataX.push(req.body.pic2x);
                        dataY.push(req.body.pic2y);
                        dataColor.push(req.body.pic2color);
                        dataText.push(req.body.pic2txt);
                    } else {
                        dataX = req.body.pic2x;
                        dataY = req.body.pic2y;
                        dataColor = req.body.pic2color;
                        dataText = req.body.pic2txt;
                    }
                    for (var i = 0; i < dataX.length; i++) {
                        var mr_pic2tag = {
                            dataX: dataX[i],
                            dataY: dataY[i],
                            Text: dataText[i],
                            Color: dataColor[i]
                        }
                        data.mr_pic2tag.push(mr_pic2tag);
                    }
                }
            }
            if (pic.pic3 != null) {
                data.mr_pic3tag = [];
                if (req.body.pic3x != null) {
                    if (typeof req.body.pic3x != "object") {
                        dataX.push(req.body.pic3x);
                        dataY.push(req.body.pic3y);
                        dataColor.push(req.body.pic3color);
                        dataText.push(req.body.pic3txt);
                    } else {
                        dataX = req.body.pic3x;
                        dataY = req.body.pic3y;
                        dataColor = req.body.pic3color;
                        dataText = req.body.pic3txt;
                    }
                    for (var i = 0; i < dataX.length; i++) {
                        var mr_pic3tag = {
                            dataX: dataX[i],
                            dataY: dataY[i],
                            Text: dataText[i],
                            Color: dataColor[i]
                        }
                        data.mr_pic3tag.push(mr_pic3tag);
                    }
                }
            }
            if (pic.pic4 != null) {
                data.mr_pic4tag = [];
                if (req.body.pic4x != null) {
                    if (typeof req.body.pic4x != "object") {
                        dataX.push(req.body.pic4x);
                        dataY.push(req.body.pic4y);
                        dataColor.push(req.body.pic4color);
                        dataText.push(req.body.pic4txt);
                    } else {
                        dataX = req.body.pic4x;
                        dataY = req.body.pic4y;
                        dataColor = req.body.pic4color;
                        dataText = req.body.pic4txt;
                    }
                    for (var i = 0; i < dataX.length; i++) {
                        var mr_pic4tag = {
                            dataX: dataX[i],
                            dataY: dataY[i],
                            Text: dataText[i],
                            Color: dataColor[i]
                        }
                        data.mr_pic4tag.push(mr_pic4tag);
                    }
                }
            }
            if (pic.pic5 != null) {
                data.mr_pic5tag = [];
                if (req.body.pic5x != null) {
                    if (typeof req.body.pic5x != "object") {
                        dataX.push(req.body.pic5x);
                        dataY.push(req.body.pic5y);
                        dataColor.push(req.body.pic5color);
                        dataText.push(req.body.pic5txt);
                    } else {
                        dataX = req.body.pic5x;
                        dataY = req.body.pic5y;
                        dataColor = req.body.pic5color;
                        dataText = req.body.pic5txt;
                    }
                    for (var i = 0; i < dataX.length; i++) {
                        var mr_pic5tag = {
                            dataX: dataX[i],
                            dataY: dataY[i],
                            Text: dataText[i],
                            Color: dataColor[i]
                        }
                        data.mr_pic5tag.push(mr_pic5tag);
                    }
                }
            }
            data.save((err, doc) => {

                if (err) {
                    result.result = "FAIL";
                    result.result_msg = err;
                    return res.json(result);
                }

                console.log('Create Data!');


                //console.log(doc);

                user.update({usr_id: usrid}, {$addToSet: {usr_mrwrite: {doc: doc._id}}}, (err, update)=> {

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
//////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/read/:id', (req, res) => {    // GET 마이룸 읽기.


    var mr_id = req.params.id;

    myroom.findOne({mr_id: mr_id}).populate('mr_usrid').exec((err, doc)=> {
        var result = {
            result: String,
            myroom_body: Object
        };
        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }
        if (doc == null) {
            result.result = "EMPTY";
            return res.json(result);
        } else {

            result.result = "SUCCESS";

            result.myroom_body = {
                mr_usrname: doc.mr_usrid.usr_name,
                mr_usrpic: doc.mr_usrid.usr_pic,
                mr_title: doc.mr_title,
                mr_pic: [],
                mr_reply_count: doc.reply.length,
                mr_tag: doc.mr_tag,
                mr_scrap_count: doc.mr_scrap.length,          //usrid
                mr_hit: doc.mr_hit,
                mr_date: moment(doc.mr_date).format('YYYY. MM. DD.'), //hh:mm:ss //YYYY년
                mr_usrid: doc.mr_usrid.usr_id
            }

            //var data = [];
            //for(var i = 0 ; i < doc.mr_pic1tag.length ; i++){
            //
            //}
            if (doc.mr_pic1 != null)
                result.myroom_body.mr_pic.push({
                    picurl: myroom_url_path + doc.mr_pic1,
                    pictxt: doc.mr_text1,
                    pictag: doc.mr_pic1tag
                });
            if (doc.mr_pic2 != null)
                result.myroom_body.mr_pic.push({
                    picurl: myroom_url_path + doc.mr_pic2,
                    pictxt: doc.mr_text2,
                    pictag: doc.mr_pic2tag
                });
            //result.myroom_body.mr_pic.push(myroom_url_path + doc.mr_pic2);
            if (doc.mr_pic3 != null)
                result.myroom_body.mr_pic.push({
                    picurl: myroom_url_path + doc.mr_pic3,
                    pictxt: doc.mr_text3,
                    pictag: doc.mr_pic3tag
                });
            //result.myroom_body.mr_pic.push(myroom_url_path + doc.mr_pic3);
            if (doc.mr_pic4 != null)
                result.myroom_body.mr_pic.push({
                    picurl: myroom_url_path + doc.mr_pic4,
                    pictxt: doc.mr_text4,
                    pictag: doc.mr_pic4tag
                });
            //result.myroom_body.mr_pic.push(myroom_url_path + doc.mr_pic4);
            if (doc.mr_pic5 != null)
                result.myroom_body.mr_pic.push({
                    picurl: myroom_url_path + doc.mr_pic5,
                    pictxt: doc.mr_text5,
                    pictag: doc.mr_pic5tag
                });
            //result.myroom_body.mr_pic.push(myroom_url_path + doc.mr_pic5);
            //if (doc.mr_text1 != null)
            //result.myroom_body.mr_text.push(doc.mr_text1);
            //if (doc.mr_text2 != null)
            //result.myroom_body.mr_text.push(doc.mr_text2);
            //if (doc.mr_text3 != null)
            //result.myroom_body.mr_text.push(doc.mr_text3);
            //if (doc.mr_text4 != null)
            //result.myroom_body.mr_text.push(doc.mr_text4);
            //if (doc.mr_text5 != null)
            //result.myroom_body.mr_text.push(doc.mr_text5);


            myroom.update({mr_id: doc.mr_id}, {$inc: {mr_hit: 1}}, (err, update)=> {
                if (err) return res.json(err);

                console.log(update);
                return res.json(result);
            })
        }

    })

});
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
        query = {"mr_tag": {$all: data1}, "mr_tag": {$all: data2}};
    }
    else if (data1.length != 0 && data2.length == 0) { //위만있음
        console.log('위만검색');
        query = {"mr_tag": {$all: data1}};
    }
    else if (data1.length == 0 && data2.length != 0) { //아래만있음
        console.log('아래만검색');
        query = {"mr_tag": {$all: data2}};
    }
    else if (data1.length == 0 && data2.length == 0) { //둘다없음
        console.log('필터없음');
        query = {};
    }

    var result = {
        result: String,
        myroom_list: []
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
        myroom.find(query).populate('mr_usrid').sort([['mr_id', 'descending']]).exec((err, docs)=> {


            if (err) {
                result.result = "FAIL";
                result.result_msg = err;
                return res.json(result);
            }

            for (var i = 0; i < docs.length; i++) {

                //console.log(docs[i].mr_id);
                //var mr__id = docs[i]._id
                //console.log(mr__id);

                result.myroom_list[i] = {
                    "mr_id": docs[i].mr_id,
                    mr_usrname: docs[i].mr_usrid.usr_name,
                    //mr_usrpic: docs[i].mr_usrid.usr_pic,
                    "mr_date": moment(docs[i].mr_date).format('YYYY. MM. DD.'),
                    "mr_hit": docs[i].mr_hit,
                    "mr_scrapcount": docs[i].mr_scrap.length,
                    "mr_replycount": docs[i].reply.length,
                    mr_title: docs[i].mr_title,
                    "mr_pic": [],
                    mr_tag: docs[i].mr_tag,
                    mr_check: false
                }

                if (docs[i].mr_pic1 != null)
                    result.myroom_list[i].mr_pic.push(myroom_url_path + docs[i].mr_pic1);
                if (docs[i].mr_pic2 != null)
                    result.myroom_list[i].mr_pic.push(myroom_url_path + docs[i].mr_pic2);
                if (docs[i].mr_pic3 != null)
                    result.myroom_list[i].mr_pic.push(myroom_url_path + docs[i].mr_pic3);
                if (docs[i].mr_pic4 != null)
                    result.myroom_list[i].mr_pic.push(myroom_url_path + docs[i].mr_pic4);
                if (docs[i].mr_pic5 != null)
                    result.myroom_list[i].mr_pic.push(myroom_url_path + docs[i].mr_pic5);

                for (var j = 0; j < docs[i].mr_scrap.length; j++) {
                    console.log(docs[i].mr_scrap);
                    console.log(usr_objid);
                    if (docs[i].mr_scrap.usrid == usr_objid.usrid) {
                        console.log('있음')
                        result.myroom_list[i].mr_check = true;
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
    var mr_id = req.body.mr_id;
    var web = req.body.web;

    var del;
    console.log(mr_id);
    if (deleteCheck == "on")
        del = true;
    else if (deleteCheck == "off")
        del = false;

    myroom.update({mr_id: mr_id}, {$set: {mr_delete: del}}, (err, update)=> {

        if (web)
            myroom.find({}).populate('mr_usrid').sort([['mr_id', 'ascending']]).exec((err, docs)=> {
                res.render('admin/myroom/main', {myroom: docs});
            })
        else
            res.json({result: "SUCCESS"});
    })

});


module.exports = router;