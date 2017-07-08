/**
 * Created by ccei on 2016-02-03.
 */
var express = require('express');
var router = express.Router();

var mongoose = require('../models/db_connection');
var db = mongoose.connection;

var magazin = require('../models/magazin_model');

var myroom = require('../models/myroom_model');
var wishroom = require('../models/wishroom_model');
var myroom_url_path = '/images/myroom';
var wishroom_url_path = '/images/wishroom';
var magazin_url_path = '/images/magazin';


router.get('/myroom/:id', function (req, res, next) {

    var id = req.params.id;
    myroom.findOne({mr_id: id}, (err, doc)=> {

        var pic = [];
        var text = [];


        if (doc != null) {
            if (doc.mr_pic1 != null)
                pic.push(myroom_url_path + doc.mr_pic1);
            if (doc.mr_pic2 != null)
                pic.push(myroom_url_path + doc.mr_pic2);
            if (doc.mr_pic3 != null)
                pic.push(myroom_url_path + doc.mr_pic3);
            if (doc.mr_pic4 != null)
                pic.push(myroom_url_path + doc.mr_pic4);
            if (doc.mr_pic5 != null)
                pic.push(myroom_url_path + doc.mr_pic5);
            if (doc.mr_text1 != null)
                text.push(doc.mr_text1);
            if (doc.mr_text2 != null)
                text.push(doc.mr_text2);
            if (doc.mr_text3 != null)
                text.push(doc.mr_text3);
            if (doc.mr_text4 != null)
                text.push(doc.mr_text4);
            if (doc.mr_text5 != null)
                text.push(doc.mr_text5);


            res.render('page/myroom', {pic: pic, text: text, urlpath: myroom_url_path});
        } else {
            next(err);
        }

    })


});


router.get('/wishroom/:id', function (req, res, next) {

    var id = req.params.id;

    wishroom.findOne({wr_id: id}, (err, doc)=> {
        if (doc != null) {
            console.log(doc);
            res.render('page/wishroom', {title: doc.title, sticker: wishroom_url_path + doc.wr_sticker});
        }
        else {
            next(err);
        }

    })


});

router.get('/magazin/:id', function (req, res, next) {
    var pic = [];
    var text = [];
    var id = req.params.id;

    magazin.findOne({mgz_id: id}, (err, doc)=> {


        if (doc != null) {
            if (doc.mgz_pic1 != null)
                pic.push(magazin_url_path + doc.mgz_pic1);
            if (doc.mgz_pic2 != null)
                pic.push(magazin_url_path + doc.mgz_pic2);
            if (doc.mgz_pic3 != null)
                pic.push(magazin_url_path + doc.mgz_pic3);
            if (doc.mgz_pic4 != null)
                pic.push(magazin_url_path + doc.mgz_pic4);
            if (doc.mgz_pic5 != null)
                pic.push(magazin_url_path + doc.mgz_pic5);
            if (doc.mgz_text1 != null)
                text.push(doc.mgz_text1);
            if (doc.mgz_text2 != null)
                text.push(doc.mgz_text2);
            if (doc.mgz_text3 != null)
                text.push(doc.mgz_text3);
            if (doc.mgz_text4 != null)
                text.push(doc.mgz_text4);
            if (doc.mgz_text5 != null)
                text.push(doc.mgz_text5);


            res.render('page/magazin', {pic: pic, text: text, urlpath: wishroom_url_path});
        }




    })


});


module.exports = router;