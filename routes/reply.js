/**
 * Created by ccei on 2016-02-01.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('../models/db_connection');
var moment = require('moment');
var magazin = require('../models/magazin_model');
var wishroom = require('../models/wishroom_model');
var myroom = require('../models/myroom_model');
var user = require('../models/user_model');

module.exports = router;



router.get('/:type/:id', (req, res) => {
    var result = {};
    var type = req.params.type;        //mgz , mr , wr

    var id = req.params.id;
    var search, data;
    if (type == 'mgz') {
        search = magazin;
        data = {mgz_id: id}
    }

    else if (type == 'wr') {
        search = wishroom;
        data = {wr_id: id}
    }

    else if (type == 'mr') {
        search = myroom;
        data = {mr_id: id}
    } else {
        return res.json({result: "BAD REQUEST"});
    }

    search.findOne(data, {_id: 0, reply: 1}).populate('reply.rep_usrid',{_id : 0 , usr_pic : 1, usr_name : 1}).sort([['reply.rep_time','ascending']]).lean().exec((err, doc)=> {

        if (err) {
            result.result = "FAIL";
            result.result_msg = err;
            return res.json(result);
        }
        if (doc == null) {
            result.result = "EMPTY_DOC";
            return res.json(result);
        }
        result.result = "SUCCESS";


        for(var i = 0 ; i < doc.reply.length ; i++){
            doc.reply[i].rep_time = moment(doc.reply[i].rep_time).format('h시 m분');
        }


        result.reply = doc.reply;
        res.json(result);

    })

});


router.post('/insert/:type', (req, res) => {
    var result = {};
    var usrid = req.body.usrid;
    var docid = req.body.docid;
    var text = req.body.text;
    var type = req.params.type;
    var search, data;
    if (type == 'mgz') {
        search = magazin;
        data = {mgz_id: docid}
    }

    else if (type == 'wr') {
        search = wishroom;
        data = {wr_id: docid}
    }

    else if (type == 'mr') {
        search = myroom;
        data = {mr_id: docid}
    } else {
        return res.json({result: "BAD REQUEST"});
    }

    user.findOne({usr_id: usrid}, {_id: 1}, (err, doc)=> {
        if (!doc) {
            result.result = "EMPTY_ID";
            return res.json(result);
        }

        search.findOneAndUpdate(data, { $push: {reply: { rep_usrid: doc._id , rep_text: text}}},{new : true}, (err,doc)=> {

            if (err) {
                result.result = "FAIL";
                result.result_msg = err;
                return res.json(result);
            }

            if (!doc) {
                result.result = "EMPTY_DOC";
                return res.json(result);
            }

            return res.json({result: "SUCCESS"});

        })
    })

});


module.exports = router;
