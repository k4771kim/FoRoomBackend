/**
 * Created by ccei on 2016-01-31.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('../models/db_connection');
var multer = require('multer');
var goods = require('../models/goods_model');
var storage_path = '/images/goods';
var fs = require('fs');
var category = require('../models/goodscategory_model');

/////////////////////////////////////////////////////////////////////////////////////////////////////

var pic = {};
var goods_path = './public/images/goods/';
var category_id;
var goods_storage = multer.diskStorage({

    destination: function (req, file, cb) {

        category.findOne({category: req.body.series}, {_id: 0, category_id: 1}, (err, doc)=> {

            if (!doc) {
                cb(null, goods_path + 'errortemp');
            } else {
                category_id = doc.category_id;
                cb(null, goods_path + doc.category_id);
            }

        })
    },
    filename: function (req, file, cb) {
        var series = req.body.series;    //종류

        // goods.find({gd_series: series}, (err, docs)=> {


    category.findOneAndUpdate({category: req.body.series}, {$inc : {category_cnt: 1}} ,{new : true}, (err, doc)=> {

            console.log(doc);
            var uploadedName = doc.category_cnt + "_" + file.fieldname;

            uploadedName += "." + file.originalname.split('.')[1];

            if (file.fieldname == 'sticker')
                pic.sticker = '/' + category_id + '/' + uploadedName;
            else if (file.fieldname == 'pic1')
                pic.pic1 = '/' + category_id + '/' + uploadedName;
            else if (file.fieldname == 'pic2')
                pic.pic2 = '/' + category_id + '/' + uploadedName;
            else if (file.fieldname == 'pic3')
                pic.pic3 = '/' + category_id + '/' + uploadedName;
            else if (file.fieldname == 'pic4')
                pic.pic4 = '/' + category_id + '/' + uploadedName;
            else if (file.fieldname == 'pic5')
                pic.pic5 = '/' + category_id + '/' + uploadedName;



            cb(null, uploadedName);
        })
    }
});


var goods_upload = multer({storage: goods_storage}).fields([
    {name: 'sticker', maxCount: 1},
    {name: 'pic1', maxCount: 1},
    {name: 'pic2', maxCount: 1},
    {name: 'pic3', maxCount: 1},
    {name: 'pic4', maxCount: 1},
    {name: 'pic5', maxCount: 1},

]);
//////////////////////////////////////////////////////////////////////////////////
router.post('/addctg', function (req, res) {

    var categoryname = req.body.category;
    //  return res.send('<script>alert("매거진 등록이 완료되었습니다!! ");location.href="/admin/main";</script>')
    if (!categoryname) {
        //return res.json({result: "BAD_REQUEST"});
        return res.send('<script>alert("잘못된 요청!! ");location.href="/admin/insertctg";</script>')
    }
    result = {};

    category.findOne({category: categoryname}, {_id: 0, category_id: 1}, (err, doc)=> {
        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return res.send('<script>alert("잘못된 요청!! ");location.href="/admin/insertctg";</script>')
        }

        if (doc) {
            //result.reuslt = "DUPLICATE";
            //return res.json(result);
            return res.send('<script>alert("중복 카테고리입니다!! ");location.href="/admin/insertctg";</script>')
        }
        else {

            category.create({category: categoryname}, (err, category)=> {
                if (err) {
                    //result.result = "FAIL";
                    //result.result_msg = err;
                    //return res.json(result);
                    return res.send('<script>alert("잘못된 요청!! ");location.href="/admin/insertctg";</script>')
                }
                console.log(category);
                fs.mkdir(goods_path + category.category_id, (err)=> {
                    //result.result = "Create";
                    //res.json(result);
                    return res.send('<script>alert("카테고리가 생성되었습니다!!!!! ");location.href="/admin/insertctg";</script>')
                });
            })


        }
    });


});


///////////////////////////////////////////////////////////////////////////////
router.post('/insert', goods_upload, function (req, res, next) {

    var series = req.body.series;
    var desc = req.body.desc;
    var price = req.body.price;
    var link = req.body.link;
    var name = req.body.name;

    category.findOne({category: series}, {_id: 0, category_id: 1,category_cnt:1}, (err, doc)=> {


        if (!doc) {
            return res.send('<script>alert("카테고리가 없습니다!!!!! ");location.href="/admin/insertgoods";</script>')
        }
        var category_id = doc.category_id;
        // goods.find({gd_series: series}, (err, docs)=> {


            if (err) {
                return res.send('<script>alert("잘못된 요청!! ");location.href="/admin/insertgoods";</script>')
            }


            gd_id = category_id + '_' + doc.category_cnt;

            var data = new goods({        // 더미입니다.
                gd_id: gd_id,
                gd_series: series,
                gd_name: name,
                gd_sticker: pic.sticker,
                gd_pic1: pic.pic1,
                gd_pic2: pic.pic2,
                gd_pic3: pic.pic3,
                gd_pic4: pic.pic4,
                gd_pic5: pic.pic5,
                gd_desc: desc,
                gd_price: price,
                gd_link: link,
                gd_scrap: []
            });

            goods.create(data, (err, doc) => {

                var result = {
                    result: String
                };

                if (err) {
                    return res.send('<script>alert("잘못된 요청!! ");location.href="/admin/insertgoods";</script>')
                }

                console.log('Create Data!');

                return res.send('<script>alert("제품이 등록되었습니다!!!!!!!!!! ");location.href="/admin/main";</script>')
                return res.json(result);
            });


        // });

    });
});


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/update', function (req, res) {

    var series = req.params.series;

    result = {};
    var updategoods = {

        _id: false,
        gd_series: true,
        gd_id: true,
        gd_sticker: true,
        gd_name: true
    };
    goods.find({}, updategoods).sort([['gd_id', 'ascending']]).lean().exec((err, docs)=> {


        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }

        result.result = "SUCCESS";


        for (var i = 0; i < docs.length; i++) {
            docs[i].gd_sticker = "/images/goods" + docs[i].gd_sticker;
        }
        result.goodslist = docs;

        res.json(result);

    });
});
////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/info', function (req, res) {
    var id = req.body.docid;
    var usrid = req.body.usrid
    var result = {};


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

        var goodsinfo = {
            _id: false,
            gd_id: true,
            "gd_price": true,
            "gd_desc": true,
            "gd_pic3": true,
            "gd_pic2": true,
            "gd_pic1": true,
            "gd_sticker": true,
            "gd_name": true,
            "gd_series": true,
            gd_scrap: true
        };


        goods.findOne({gd_id: id}, goodsinfo).populate('user').lean().exec((err, doc)=> {


            if (err) {
                result.result = "FAIL";
                result.result_msg = err;
                return res.json(result);
            }

            if (!doc) {
                result.result = "EMPTY_ID";
                return res.json(result);
            }

            result.result = "SUCCESS";

            doc.gd_scrap_check = false;
            if (doc.gd_pic1 != null)doc.gd_pic1 = storage_path + doc.gd_pic1;
            if (doc.gd_pic2 != null)doc.gd_pic2 = storage_path + doc.gd_pic2;
            if (doc.gd_pic3 != null)doc.gd_pic3 = storage_path + doc.gd_pic3;
            if (doc.gd_pic4 != null)doc.gd_pic4 = storage_path + doc.gd_pic4;
            if (doc.gd_pic5 != null)doc.gd_pic5 = storage_path + doc.gd_pic5;
            if (doc.gd_sticker != null)doc.gd_sticker = storage_path + doc.gd_sticker;


            doc.gd_scrap_count = doc.gd_scrap.length;


            for (var j = 0; j < doc.gd_scrap.length; j++) {
                if (doc.gd_scrap[j].usrid + "" == usr_objid + "") {
                    console.log('있음')
                    doc.gd_scrap_check = true;
                    break;
                }
            }

            delete doc.gd_scrap;

            result.goods_info = doc;
            //doc.del('gd_scrap');
            return res.json(result);
        })

    });
});
///////////////////////////////////////////////////////////////////////

var modify_goods_storage = multer.diskStorage({

    destination: function (req, file, cb) {

        category.findOne({category: req.body.series}, {_id: 0, category_id: 1}, (err, doc)=> {

            if (!doc) {
                cb(null, goods_path + 'errortemp');
            } else {
                category_id = doc.category_id;
                cb(null, goods_path + doc.category_id);
            }

        })
    },
    filename: function (req, file, cb) {
        var series = req.body.series;    //종류

        var uploadedName = req.body.gd_id.split('_')[1] + "_" + file.fieldname;

        uploadedName += "." + file.originalname.split('.')[1];

        if (file.fieldname == 'sticker')
            pic.sticker = '/' + category_id + '/' + uploadedName;
        else if (file.fieldname == 'pic1')
            pic.pic1 = '/' + category_id + '/' + uploadedName;
        else if (file.fieldname == 'pic2')
            pic.pic2 = '/' + category_id + '/' + uploadedName;
        else if (file.fieldname == 'pic3')
            pic.pic3 = '/' + category_id + '/' + uploadedName;
        else if (file.fieldname == 'pic4')
            pic.pic4 = '/' + category_id + '/' + uploadedName;
        else if (file.fieldname == 'pic5')
            pic.pic5 = '/' + category_id + '/' + uploadedName;


        cb(null, uploadedName);

    }
});


var modify_goods_upload = multer({storage: modify_goods_storage}).fields([
    {name: 'sticker', maxCount: 1},
    {name: 'pic1', maxCount: 1},
    {name: 'pic2', maxCount: 1},
    {name: 'pic3', maxCount: 1},
    {name: 'pic4', maxCount: 1},
    {name: 'pic5', maxCount: 1},

]);


router.post('/modify', modify_goods_upload, function (req, res, next) {

    var gd_id = req.body.gd_id;
    var gd_desc = req.body.desc;
    var gd_price = req.body.price
    var gd_name = req.body.name;
    var gd_link = req.body.link;
    set = {

        gd_desc: gd_desc,
        gd_price: gd_price,
        gd_name: gd_name,
        gd_link: gd_link

    };

    if (pic.pic1 != null) {
        set.gd_pic1 = pic.pic1;
    }
    if (pic.pic2 != null) {
        set.gd_pic2 = pic.pic2;
    }
    if (pic.pic3 != null) {
        set.gd_pic3 = pic.pic3;
    }
    if (pic.pic4 != null) {
        set.gd_pic4 = pic.pic4;
    }
    if (pic.pic5 != null) {
        set.gd_pic5 = pic.pic5;
    }

    goods.update({gd_id: gd_id}, {$set: set}, (err, update)=> {
        if (update.nModified == 0 && update.n == 1) {
            res.send('<script>alert("업데이트 항목이 없습니다");location.href="/admin/main";</script>')
        }
        else if (update.nModified == 1 && update.n == 1) {

            res.send('<script>alert("업데이트 되었습니다");location.href="/admin/main";</script>')
        }
    })

});

module.exports = router;
