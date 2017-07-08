  /**
 * Created by ccei on 2016-01-14.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('../models/db_connection');
var moment = require('moment');
var multer = require('multer');
var magazin = require('../models/magazin_model');
//var magazin_upload = multer({dest: './public/images/magazin'});

var storage_path = '/images/magazin';

var subtitle = ['Style Magazine', 'Brand Magazine', 'Street Magazine', 'Color Magazine', 'Know-how Magazine'];

//////////////////////////////////////////////////////////////////////////////////////////////////
router.get('/list/:series', (req, res)=> {         // GET 매거진 LIST

    var series = req.params.series;
    var result = {
        result: String
    }

    var magazinlist = {
        _id: false,
        mgz_id: true,
        mgz_series: true,
        mgz_title: true,
        mgz_titlepic: true,
        //mgz_titlepic : 'public/'+this.mgz_id,
        mgz_date: true
    };

    magazin.find({mgz_series: series}, magazinlist).sort({"mgz_id": "ascending"}).exec((err, docs)=> {
        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }
        result.result = "SUCCESS";

        result.magazin_list = docs;

        for (var i = 0; i < docs.length; i++) {
            docs[i].mgz_titlepic = "/images/magazin" + docs[i].mgz_titlepic;
        }

        return res.json(result);
    })
});
/////////////////////////////////////////////////////////////////////////////
router.get('/recentlist', (req, res)=> {         // GET 최신 매거진 LIST

    var result = {
        result: String,
        mgz_list: []
    }

    var magazinlist = {
        _id: false,
        mgz_subtitle: true,
        mgz_id: true,
        mgz_series: true,
        mgz_title: true,
        mgz_titlepic: true,
        //mgz_titlepic : 'public/'+this.mgz_id,
        mgz_date: true
    };

    magazin.findOne({mgz_series: 1}, magazinlist).sort([['mgz_date', 'descending']]).lean().exec((err, doc)=> {
        doc.mgz_titlepic = storage_path + doc.mgz_titlepic;
        doc.mgz_subtitle = subtitle[0];
        result.mgz_list.push(doc);
        magazin.findOne({mgz_series: 2}, magazinlist).sort([['mgz_date', 'descending']]).lean().exec((err, doc)=> {
            doc.mgz_titlepic = storage_path + doc.mgz_titlepic;
            doc.mgz_subtitle = subtitle[1];
            result.mgz_list.push(doc);
            magazin.findOne({mgz_series: 3}, magazinlist).sort([['mgz_date', 'descending']]).lean().exec((err, doc)=> {
                doc.mgz_titlepic = storage_path + doc.mgz_titlepic;
                doc.mgz_subtitle = subtitle[2];
                result.mgz_list.push(doc);
                magazin.findOne({mgz_series: 4}, magazinlist).sort([['mgz_date', 'descending']]).lean().exec((err, doc)=> {
                    doc.mgz_titlepic = storage_path + doc.mgz_titlepic;
                    doc.mgz_subtitle = subtitle[3];
                    result.mgz_list.push(doc);
                    magazin.findOne({mgz_series: 5}, magazinlist).sort([['mgz_date', 'descending']]).lean().exec((err, doc)=> {
                        doc.mgz_titlepic = storage_path + doc.mgz_titlepic;
                        doc.mgz_subtitle = subtitle[4];
                        result.mgz_list.push(doc);
                        res.json(result);
                    });
                });
            })
        });
    })
});

//////////////////////////////////////////////////////////////////////////////////////////////////

var pic = {};
var magazin_storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var fs = require('fs');
        fs.mkdir('./public/images/magazin/' + req.body.series, (err)=> {
            cb(null, './public/images/magazin/' + req.body.series);
        });


    }
    ,
    filename: function (req, file, cb) {
        var series = req.body.series;

        // magazin.find({mgz_series: series}, (err, docs)=> {
            magazin.find({}, (err, docs)=> {
         // var uploadedName = ((series * 1000) + docs.length + 1) + "_" + file.fieldname;
         var uploadedName = "mgz_"+(docs.length + 1) + "_" + file.fieldname;

            uploadedName += "." + file.originalname.split('.')[1];

            if (file.fieldname == 'pic1') {
                pic = {};
                pic.pic1 = '/' + series + '/' + uploadedName;
            }
            else if (file.fieldname == 'pic2')
                pic.pic2 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic3')
                pic.pic3 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic4')
                pic.pic4 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic5')
                pic.pic5 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'titlepic')
                pic.titlepic = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'vrpic')
                pic.vrpic = '/' + series + '/' + uploadedName;

            cb(null, uploadedName);

        });
    },
    limits: {fileSize: 10 * 1024 * 1024}  //단위가 바이트.
});


var magazin_upload = multer({storage: magazin_storage}).fields([
    {name: 'vrpic', maxCount: 1},
    {name: 'titlepic', maxCount: 1},
    {name: 'pic1', maxCount: 1},
    {name: 'pic2', maxCount: 1},
    {name: 'pic3', maxCount: 1},
    {name: 'pic4', maxCount: 1},
    {name: 'pic5', maxCount: 1},

]);


router.post('/insert', magazin_upload, function (req, res, next) {

    var series = req.body.series;

    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;
    var text4 = req.body.text4;
    var text5 = req.body.text5;
    var title = req.body.title;

    var mgz_usevr = req.body.usevr;

    magazin.find({mgz_series: series}, (err, docs)=> {

        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }

        mgz_id = (series * 100000) + docs.length + 1;

        var data = new magazin({        // 더미입니다.
            mgz_id: mgz_id,
            mgz_series: series,
            mgz_date: Date.now,
            mgz_title: title,
            mgz_titlepic: pic.titlepic,
            mgz_pic1: pic.pic1,
            mgz_text1: text1,
            mgz_scrap: [],
            reply: []
        });
        if (mgz_usevr == "No") {
            data.mgz_usevr = false;
        } else {
            data.mgz_usevr = true;
            data.mgz_vrpic = pic.vrpic;
        }
        if (text2 != "") {
            data.mgz_text2 = text2;
            data.mgz_pic2 = pic.pic2;
        }
        if (text3 != "") {
            data.mgz_text3 = text3;
            data.mgz_pic3 = pic.pic3;
        }
        if (text4 != "") {
            data.mgz_text4 = text4;
            data.mgz_pic4 = pic.pic4;
        }
        if (text5 != "") {
            data.mgz_text5 = text5;
            data.mgz_pic5 = pic.pic5;
        }
        magazin.create(data, (err, doc) => {
            var result = {
                result: String
            };

            if (err) {
                result.result = "FAIL";
                result.result_msg = err;
                return res.json(result);
            }

            console.log('Create Data!');

            result.result = "SUCCESS";
            return res.send('<script>alert("매거진 등록이 완료되었습니다!! ");location.href="/admin/main";</script>')
        });

    });


});

/////////////////////////////////////////////////////////////////////////

var update_magazin_storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, './public/images/magazin/' + req.body.series);

    }
    ,
    filename: function (req, file, cb) {
        var series = req.body.series;

        magazin.find({mgz_series: series}, (err, docs)=> {

            var uploadedName = req.body.mgz_id + "_" + file.fieldname;

            uploadedName += "." + file.originalname.split('.')[1];

            if (file.fieldname == 'pic1') {
                pic = {};
                pic.pic1 = '/' + series + '/' + uploadedName;
            }
            else if (file.fieldname == 'pic2')
                pic.pic2 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic3')
                pic.pic3 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic4')
                pic.pic4 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'pic5')
                pic.pic5 = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'titlepic')
                pic.titlepic = '/' + series + '/' + uploadedName;
            else if (file.fieldname == 'vrpic')
                pic.vrpic = '/' + series + '/' + uploadedName;

            cb(null, uploadedName);

        });
    },
    limits: {fileSize: 10 * 1024 * 1024}  //단위가 바이트.
});


var magazin_update = multer({storage: update_magazin_storage}).fields([
    {name: 'vrpic', maxCount: 1},
    {name: 'titlepic', maxCount: 1},
    {name: 'pic1', maxCount: 1},
    {name: 'pic2', maxCount: 1},
    {name: 'pic3', maxCount: 1},
    {name: 'pic4', maxCount: 1},
    {name: 'pic5', maxCount: 1},

]);
router.post('/update', magazin_update, function (req, res, next) {
    var series = req.body.series;
    var text1 = req.body.text1;
    var text2 = req.body.text2;
    var text3 = req.body.text3;
    var text4 = req.body.text4;
    var text5 = req.body.text5;
    var title = req.body.title;


    var mgz_usevr = req.body.usevr;
    var mgz_id = req.body.mgz_id;
    var set = {};

    console.log(mgz_usevr);
    if (mgz_usevr == "true") {
        set.mgz_usevr = true;
        if (pic.vrpic)
            set.mgz_vrpic = pic.vrpic
    }
    else if (mgz_usevr == "false") {
        set.mgz_usevr = false;
        set.mgz_vrpic    = null;

    }

    set.mgz_series = series;
    set.mgz_title = title;
    if (text1)
        set.mgz_text1 = text1;
    if (text2)
        set.mgz_text2 = text2;
    if (text3)
        set.mgz_text3 = text3;
    if (text4)
        set.mgz_text4 = text4;
    if (text5)
        set.mgz_text5 = text5;

    if (pic.pic1)
        set.mgz_pic1 = pic.pic1;
    if (pic.pic2)
        set.mgz_pic2 = pic.pic2;
    if (pic.pic3)
        set.mgz_pic3 = pic.pic3;
    if (pic.pic4)
        set.mgz_pic4 = pic.pic4;
    if (pic.pic5)
        set.mgz_pic5 = pic.pic5;
    if (pic.vrpic)
        set.mgz_vrpic = pic.vrpic;
    if (pic.titlepic)
        set.mgz_titlepic = pic.titlepic;


    magazin.update({mgz_id: mgz_id}, {
        $set: set
    }, (err, update)=> {

        res.send('<script>alert("업데이트 되었습니다");location.href="/admin/main";</script>')
    });

});


//////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/read/:id', (req, res)=> {         // GET 매거진 Body
    var id = req.params.id;   //mgz_id
    var usrid = req.body.usrid;  // usrid

    var body = {
        _id: false,
        mgz_id: true,
        mgz_series: true,
        mgz_date: true,
        mgz_title: true,
        mgz_titlepic: true,
        mgz_pic1: true,
        mgz_pic2: true,
        mgz_pic3: true,
        mgz_pic4: true,
        mgz_pic5: true,
        mgz_text1: true,
        mgz_text2: true,
        mgz_text3: true,
        mgz_text4: true,
        mgz_text5: true,
        mgz_usevr: true,
        mgz_vrpic: true,
        mgz_hit: true //예시로 작성함..,
        , reply: true,
        mgz_scrap: true
    }


    magazin.findOne({mgz_id: id}, body).populate({
        path: 'mgz_scrap.usrid',
        model: 'user',
        select: '-_id usr_id'
    }).exec((err, docs)=> {

        var result = {
            result: String,
            magazin_body: Object
        };
        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            //return res.json(result);
        }
        if (docs == null) {
            result.result = "EMPTY";
            //return res.json(result);
        } else {

            result.result = "SUCCESS";
            result.magazin_body = {
                mgz_usevr: docs.mgz_usevr,
                mgz_titlepic: storage_path + docs.mgz_titlepic,
                mgz_title: docs.mgz_title,
                mgz_series: docs.mgz_series,
                mgz_id: docs.mgz_id,
                mgz_hit: docs.mgz_hit,
                mgz_pic: [],
                mgz_text: [],
                mgz_reply_count: docs.reply.length,
                mgz_scrap_count: docs.mgz_scrap.length,
                mgz_date: moment(docs.mgz_date).format('YYYY. MM. DD.'),
                mgz_scrap_check: false
            }
            for (var i = 0; i < docs.mgz_scrap.length; i++) {
                if (docs.mgz_scrap[i].usrid.usr_id == usrid) {
                    result.magazin_body.mgz_scrap_check = true;
                    break;
                }
            }

            if (docs.mgz_usevr == "true") {
                result.magazin_body.mgz_vrpic = storage_path + docs.mgz_vrpic;
            }

            if (docs.mgz_pic1 != null) {
                result.magazin_body.mgz_pic.push(storage_path + docs.mgz_pic1);
                result.magazin_body.mgz_text.push(docs.mgz_text1);
            }
            if (docs.mgz_pic2 != null) {
                result.magazin_body.mgz_pic.push(storage_path + docs.mgz_pic2);
                result.magazin_body.mgz_text.push(docs.mgz_text2);
            }
            if (docs.mgz_pic3 != null) {
                result.magazin_body.mgz_pic.push(storage_path + docs.mgz_pic3);
                result.magazin_body.mgz_text.push(docs.mgz_text3);
            }
            if (docs.mgz_pic4 != null) {
                result.magazin_body.mgz_pic.push(storage_path + docs.mgz_pic4);
                result.magazin_body.mgz_text.push(docs.mgz_text4);
            }

            if (docs.mgz_pic5 != null) {
                result.magazin_body.mgz_pic.push(storage_path + docs.mgz_pic5);
                result.magazin_body.mgz_text.push(docs.mgz_text5);

            }


        }
        return res.json(result);
    })
});


module.exports = router;
