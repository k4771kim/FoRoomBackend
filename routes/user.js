var express = require('express');
var router = express.Router();
//var app = express();
//var fs = require('fs');
var mongoose = require('../models/db_connection');
var version = require('../models/version_model');
var user = require('../models/user_model');
var multer = require('multer');
var gm = require('gm');
var userimg_storage_path = './public/images/profile_img/';
var userthumb_storage_path = './public/images/profile_thumb/';
var userimg_url_path = '/images/profile_img/';
var userthumb_url_path = '/images/profile_thumb/';
var mgz_urlpath = '/images/magazin';
var mr_urlpath = '/images/myroom';
var wr_urlpath = '/images/wishroom';
var bcrypt = require('bcrypt-nodejs');
var profile_storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, userimg_storage_path);
    },
    filename: function (req, file, cb) {
        var uploadedName = req.body.usrid + "." + file.originalname.split('.')[1];
        cb(null, uploadedName);
    }
});

var profile_upload = multer({storage: profile_storage});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/info', (req, res,next)=> {
    var result = {
        result: String
    }

    var id = req.body.id;

    var userinfo = {
        _id: false,   // User 고유 ID
        usr_id: true,
        usr_way: true,
        usr_name: true,
        usr_pic: true,
        usr_thumb: true,
        usr_gdscrap: true,
        usr_mgzscrap: true,
        usr_wrscrap: true,
        usr_mrscrap: true,
        usr_wrwrite: true,
        usr_mrwrite: true,
        //usr_likecnt: true,
        //usr_writecnt: true,
        usr_desc: true
    };

    user.findOne({usr_id: id}, userinfo).lean().exec((err, doc)=> {
        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return next(err);
        }

        if (doc == null) {
            result.result = "EMPTY";
        } else {
            result.result = "SUCCESS";

            doc.usr_likecnt = doc.usr_mgzscrap.length + doc.usr_wrscrap.length + doc.usr_mrscrap.length;
            doc.usr_writecnt = doc.usr_wrwrite.length + doc.usr_mrwrite.length;

            doc.gdlikecnt = doc.usr_gdscrap.length;
            delete doc.usr_mgzscrap;
            delete doc.usr_wrscrap;
            delete doc.usr_mrscrap;
            delete doc.usr_wrwrite;
            delete doc.usr_mrwrite;

            delete doc.usr_gdscrap;
            result.userinfo = doc;
        }
        res.json(result);
    })
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/login', function (req, res,next) {      //회원가입 및 로그인
    var result = {
        result: String
    }

    var id = req.body.id;
    var way = req.body.way;
    var pw = req.body.password;
    var registrationId = req.body.registration;
    //var userinfo = {
    //    _id: false,
    //    usr_auth: true,
    //    usr_way: true,
    //    usr_id: true,
    //    usr_name: true,
    //    usr_pic: true,
    //    usr_thumb: true,
    //    //usr_mgzscrap: false,
    //    //usr_wrscrap: false,
    //    //usr_mrscrap : false,
    //    //usr_wrwrite: false,
    //    //usr_mrwrite : false,
    //    usr_password: true,
    //    usr_likecnt: true,
    //    usr_writecnt: true,
    //    usr_desc: true
    //};
    version.findOne((err, doc)=> {

        if (err) {
            return next(err);
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
        }
        result.goods_version = doc.goodsversion;
        result.app_version = doc.appversion;

        user.findOneAndUpdate({usr_auth: id, usr_way: way}, {$set : {usr_registrationid :registrationId }}).lean().exec((err, doc)=> {
            if (err) {
                return next(err);
                //result.result = "FAIL";
                //result.result_msg = err;
                //return res.json(result);
            }


            if (doc != null) { // 회원정보 있음.

                if (way == 'E') {

                    bcrypt.compare(pw, doc.usr_password, function (err, pass) {
                        if (pass) { // 비밀번호 일치
                            delete  doc.usr_password;
                            result.result = "LOGIN";
                            //result.userinfo = doc;

                            result.userinfo = {
                                usr_id: doc.usr_id,
                                usr_auth: doc.usr_auth,
                                usr_way: doc.usr_way,
                                usr_name: doc.usr_name,
                                usr_likecnt: doc.usr_likecnt,
                                usr_writecnt: doc.usr_writecnt,
                                usr_pic: doc.usr_pic,
                                usr_thumb: doc.usr_thumb,
                                usr_mgzscrap: doc.usr_mgzscrap,
                                usr_wrscrap: doc.usr_wrscrap,
                                usr_mrscrap: doc.usr_mrscrap,
                                usr_wrwrite: doc.usr_wrwrite,
                                usr_mrwrite: doc.usr_mrwrite,
                                usr_desc: doc.usr_desc
                            }
                            return res.json(result);
                        }
                        else {//비밀번호 불일치
                            result.result = "Password_Error";
                            return res.json(result);
                        }
                    });
                } else {
                    result.result = "LOGIN";
                    //result.userinfo = doc;
                    result.userinfo = {
                        usr_id: doc.usr_id,
                        usr_auth: doc.usr_auth,
                        usr_way: doc.usr_way,
                        usr_name: doc.usr_name,
                        usr_likecnt: doc.usr_likecnt,
                        usr_writecnt: doc.usr_writecnt,
                        usr_pic: doc.usr_pic,
                        usr_thumb: doc.usr_thumb,
                        usr_mgzscrap: doc.usr_mgzscrap,
                        usr_wrscrap: doc.usr_wrscrap,
                        usr_mrscrap: doc.usr_mrscrap,
                        usr_wrwrite: doc.usr_wrwrite,
                        usr_mrwrite: doc.usr_mrwrite,
                        usr_desc: doc.usr_desc
                    }
                    return res.json(result);
                }
            }

            else { //회원가입
                if (way == 'E') {
                    return next("NONE_USER");
                    //result.result = "NONE_USER";
                    //return res.json(result)

                } else {
                    var name = req.body.name;
                    if (name == null || name == "") {
                        return next("FAIL");
                        //result.result = "FAIL";
                        //result.result_msg = "name is null";
                        //return res.json(result);
                    }


                    var data = new user({
                        usr_auth: id,
                        usr_way: way,
                        usr_name: name,
                        usr_likecnt: 0,
                        usr_writecnt: 0,
                        usr_pic: 'null',
                        usr_mgzscrap: [],
                        usr_wrscrap: [],
                        usr_mrscrap: [],
                        usr_wrwrite: [],
                        usr_mrwrite: [],
                        usr_desc: "",
                        usr_registrationid : registrationId
                    });

                    data.save((err, doc) => {
                        if (err) {
                            return next(err);
                            //result.result = "FAIL";
                            //result.result_msg = err;
                            //return res.json(result);
                        }
                        console.log('User Join!!');
                        result.result = "JOIN"
                        result.userinfo = {
                            usr_id: doc.usr_id,
                            usr_auth: doc.usr_auth,
                            usr_way: doc.usr_way,
                            usr_name: doc.usr_name,
                            usr_likecnt: doc.usr_likecnt,
                            usr_writecnt: doc.usr_writecnt,
                            usr_pic: doc.usr_pic,
                            usr_thumb: doc.usr_thumb,
                            usr_mgzscrap: doc.usr_mgzscrap,
                            usr_wrscrap: doc.usr_wrscrap,
                            usr_mrscrap: doc.usr_mrscrap,
                            usr_wrwrite: doc.usr_wrwrite,
                            usr_mrwrite: doc.usr_mrwrite,
                            usr_desc: doc.usr_desc
                        }

                        return res.json(result);
                    });
                }
            }
        });
    })

});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/join', function (req, res,next) {      //이메일 회원가입
    var result = {
        result: String
    }
    var id = req.body.id;
    var name = req.body.name;
    var pw = req.body.password;
    var registrationId = req.body.registration;
    version.findOne((err, doc)=> {
        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return next(err);
        }
        result.goods_version = doc.goodsversion;
        result.app_version = doc.appversion;
        user.findOne({usr_auth: id}, (err, doc)=> {
            if (err) {
                //result.result = "FAIL";
                //result.result_msg = err;
                //return res.json(result);
                return next(err);
            }

            if (doc != null) {
                //result.result = "DUPLICATE";
                //return res.json(result);
                return next("DUPLICATE");
            }
            else {

                var data = new user({
                    usr_auth: id,
                    usr_way: "E",
                    usr_name: name,
                    usr_likecnt: 0,
                    usr_writecnt: 0,
                    usr_pic: 'null',
                    usr_thumb: 'null',
                    usr_mgzscrap: [],
                    usr_wrscrap: [],
                    usr_mrscrap: [],
                    usr_wrwrite: [],
                    usr_mrwrite: [],
                    usr_desc: "",
                    usr_password: pw,
                    usr_registrationid: registrationId
                });
                console.log(data);
                data.save((err, doc) => {
                    if (err) {
                        return next(err);
                        //result.result = "FAIL";
                        //result.result_msg = err;
                        //return res.json(result);
                    }
                    console.log('User Join!!');
                    result.result = "JOIN"

                    result.userinfo = {
                        usr_id: doc.usr_id,
                        usr_auth: doc.usr_auth,
                        usr_way: doc.usr_way,
                        usr_name: doc.usr_name,
                        usr_likecnt: doc.usr_likecnt,
                        usr_writecnt: doc.usr_writecnt,
                        usr_pic: doc.usr_pic,
                        //usr_mgzscrap: doc.usr_mgzscrap,
                        //usr_wrscrap: doc.usr_wrscrap,
                        //usr_mrscrap: doc.usr_mrscrap,
                        //usr_wrwrite: doc.usr_wrwrite,
                        //usr_mrwrite: doc.usr_mrwrite,
                        usr_desc: doc.usr_desc

                    }

                    return res.json(result);
                });


            }

        });
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/nick', (req, res,next)=> {
    var result = {
        result: String
    }
    var id = req.body.id;
    var nick = req.body.nick;


    user.update({usr_id: id}, {$set: {usr_name: nick}}, (err, update)=> {
        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return next(err);
        }
        if (!update.nModified) {
            result.result = "EMPTY";
        } else {
            result.result = "SUCCESS";
        }
        res.json(result);
    })
})
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/description', (req, res,next)=> {
    var result = {
        result: String
    }
    var id = req.body.id;
    var desc = req.body.desc;


    user.update({usr_id: id}, {$set: {usr_desc: desc}}, (err, update)=> {
        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return next(err);
        }
        if (!update.nModified) {
            result.result = "EMPTY";
        } else {
            result.result = "SUCCESS";
        }

        res.json(result);
    })
})
//////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/profileimg', profile_upload.single('picture'), (req, res,next)=> {

    //console.log(req);
    var usr_id = req.body.usrid;

    var result = {
        result: String
    }

    if (req.file == null) {
        return res.json({result: "EMPTY_FILE"});
    }
//리사이징 , 썸네일 만들기

    var srcFile = userimg_storage_path + req.body.usrid + "." + req.file.originalname.split('.')[1];
    var destFile = userthumb_storage_path + req.body.usrid + "." + req.file.originalname.split('.')[1];

    gm(srcFile).resize(150, 150).autoOrient().write(destFile, (err)=> {
        if (!err) {
            console.log('썸네일 생성');
            //return res.json({result: "iMG_ERROR"});
        }

        imgpath = userimg_url_path + req.body.usrid + "." + req.file.originalname.split('.')[1];
        thumbpath = userthumb_url_path + req.body.usrid + "." + req.file.originalname.split('.')[1];

        user.update({usr_id: usr_id}, {$set: {usr_pic: imgpath, usr_thumb: thumbpath}}, (err, update)=> {
            if (err) {
                return next(err);
                //result.result = "FAIL";
                //result.result_msg = err;
                //return res.json(result);
            }

            if (update.n == 0) {
                result.result = "EMPTY_USER";
            }
            else {
                result.result = "SUCCESS";

                result.usr_thumb = userthumb_url_path + req.file.filename;
                result.usr_pic = userimg_url_path + req.file.filename;

            }
            res.json(result);
        })

    })
});
////////////////////////////////////////////////////////////////////////////////////////////////////////
var magazin = require('../models/magazin_model');
var wishroom = require('../models/wishroom_model');
var myroom = require('../models/myroom_model');
var goods = require('../models/goods_model');
////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/scrap/:type/', (req, res,next)=> {
    var type = req.params.type;
    var docid = req.body.docid;
    var usrid = req.body.usrid;
    var data, data1;
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
    }

    else if (type == 'gd') {
        search = goods;
        data = {gd_id: docid}
    }


    else {
        return next("BAD REQUEST");
        //return res.json({result: "BAD REQUEST"});
    }


    search.findOne(data, {_id: 1}, (err, doc)=> {

        if (err) {
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
            return next(err);
        }

        if (!doc) {
            return res.json({result: "EMPTY_DOC"});
        }

        var docid = doc._id;
        var data2 = {_id: docid};
        var data3;

        user.findOne({usr_id: usrid}, {_id: 1}, (err, userdoc)=> {
            var result = {};
            if (err) {
                return next(err);
                //result.result = "FAIL";
                //result.result_msg = err;
                //return res.json(result);
            }
            if (!userdoc) {
                result.result = "EMPTY_USER";
                return res.json(result);
            }
            if (type == 'mgz') {
                data1 = {$addToSet: {usr_mgzscrap: {doc: doc._id}}};
                data3 = {$addToSet: {mgz_scrap: {usrid: userdoc._id}}};

            }
            else if (type == 'wr') {
                data1 = {$addToSet: {usr_wrscrap: {doc: doc._id}}};
                data3 = {$addToSet: {wr_scrap: {usrid: userdoc._id}}};
            }
            else if (type == 'mr') {
                data1 = {$addToSet: {usr_mrscrap: {doc: doc._id}}};
                data3 = {$addToSet: {mr_scrap: {usrid: userdoc._id}}};
            }
            else if (type == 'gd') {
                data1 = {$addToSet: {usr_gdscrap: {doc: doc._id}}};
                data3 = {$addToSet: {gd_scrap: {usrid: userdoc._id}}};
            }
            else {
                //return res.json({result: "BAD REQUEST"});
                return next("BAD REQUEST");
            }

            search.update(data2, data3, (err, update1)=> {
                if (err) {
                    //var result = {};
                    //result.result = "FAIL";
                    //result.result_msg = err;
                    //return res.json(result);
                    return next(err);
                }
                /*

                 if (update1.n == 1 && update1.nModified == 1) {

                 console.log('INSERT_SCRAP')

                 }
                 else if (update1.n == 0 && update1.nModified == 0) {

                 console.log('EMPTY_USER')

                 }
                 else if (update1.n == 1 && update1.nModified == 0) {

                 console.log('DELETE_SCRAP')

                 }
                 */


                user.update({usr_id: usrid}, data1, {new: true}, (err, update)=> {
                    var result = {};
                    if (err) {
                        return next(err);
                        //result.result = "FAIL";
                        //result.result_msg = err;
                        //return res.json(result);
                    }
                    //console.l     og(update);
                    if (update.n == 1 && update.nModified == 1) {
                        result.result = "INSERT_SCRAP"
                        return res.json(result);

                    }
                    else if (update.n == 0 && update.nModified == 0) {
                        result.result = "EMPTY_USER"
                        return res.json(result);

                    }
                    else if (update.n == 1 && update.nModified == 0) {

                        var data4, data5;

                        if (type == 'mgz') {
                            data4 = {$pull: {usr_mgzscrap: {doc: doc._id}}};
                            data5 = {$pull: {mgz_scrap: {usrid: userdoc._id}}};

                        }
                        else if (type == 'wr') {
                            data4 = {$pull: {usr_wrscrap: {doc: doc._id}}};
                            data5 = {$pull: {wr_scrap: {usrid: userdoc._id}}};
                        }
                        else if (type == 'mr') {
                            data4 = {$pull: {usr_mrscrap: {doc: doc._id}}};
                            data5 = {$pull: {mr_scrap: {usrid: userdoc._id}}};
                        }
                        else if (type == 'gd') {
                            data4 = {$pull: {usr_gdscrap: {doc: doc._id}}};
                            data5 = {$pull: {gd_scrap: {usrid: userdoc._id}}};
                        }

                        search.update(data2, data5, (err, update3)=> {
                            if (err) {
                                return next(err);
                                //var result = {};
                                //result.result = "FAIL";
                                //result.result_msg = err;
                                //return res.json(result);
                            }

                            user.update({usr_id: usrid}, data4, {new: true}, (err, update4)=> {
                                var result = {};
                                result.result = "DELETE_SCRAP"  //지울것인가 명령어 받음.
                                if (err) {
                                    return next(err);
                                    //var result = {};
                                    //result.result = "FAIL";
                                    //result.result_msg = err;
                                    //return res.json(result);
                                }


                                return res.json(result);

                            });
                        });


                    }


                });

            })


        })


    })


});
////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/scraplist/:type/', (req, res,next)=> {
    var type = req.params.type;
    var usrid = req.body.usrid;
    var path, data1, data2, search;
    if (type == 'mgz') {

        data1 = {usr_mgzscrap: 1, _id: 0};
        data2 = {path: 'usr_mgzscrap.doc', select: '-_id mgz_series mgz_title mgz_titlepic mgz_date mgz_id'}

        //data2 = '-_id mgz_series mgz_title mgz_titlepic mgz_date mgz_id';
        //path = 'usr_mgzscrap.doc'
    }

    else if (type == 'wr') {

        data1 = {usr_wrscrap: 1, _id: 0};
        data2 = {
            path: 'usr_wrscrap.doc',
            select: '-_id wr_usrname wr_sticker wr_title wr_id , wr_tag wr_usrid',
            populate: {path: 'wr_usrid', model: user, select: '-_id usr_name'}
        }

        //data2 = '-_id wr_usrname wr_sticker wr_title wr_id';
        //path = 'usr_wrscrap.doc'
    }

    else if (type == 'mr') {

        data1 = {usr_mrscrap: 1, _id: 0};
        data2 = {
            path: 'usr_mrscrap.doc',
            select: '-_id mr_title mr_title mr_pic1 mr_id mr_tag mr_usrid',
            populate: {path: 'mr_usrid', model: user, select: '-_id usr_name'}
        }
        //data2 = '-_id mr_title mr_title mr_pic1 mr_id mr_tag mr_usrid';
        //path = 'usr_mrscrap.doc';
    }
    else if (type == 'gd') {

        data1 = {usr_gdscrap: 1, _id: 0};

        data2 = {path: 'usr_gdscrap.doc', select: '-_id gd_id gd_sticker gd_price gd_name gd_series'}

        //
        //data2 = '-_id gd_id gd_sticker gd_price gd_name gd_series';
        //path = 'usr_gdscrap.doc'
    }
    else {
        return res.json({result: "BAD REQUEST"});
    }


    user.findOne({usr_id: usrid}, data1).populate(data2).lean().exec((err, doc)=> {
        console.log(doc);
        var result = {
            result: String,
            scraplist: []
        };
        if (err) {
            return next(err);
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
        }
        if (!doc) {
            return res.json({result: "NONE_USER"});
        }


        result.result = "SUCCESS";

        if (type == 'mgz') {

            for (var i = 0; i < doc.usr_mgzscrap.length; i++) {
                doc.usr_mgzscrap[i].doc.mgz_titlepic = mgz_urlpath + doc.usr_mgzscrap[i].doc.mgz_titlepic;
                result.scraplist.push(doc.usr_mgzscrap[i].doc);

            }
        }

        else if (type == 'wr') {

            for (var i = 0; i < doc.usr_wrscrap.length; i++) {
                doc.usr_wrscrap[i].doc.wr_sticker = wr_urlpath + doc.usr_wrscrap[i].doc.wr_sticker;
                result.scraplist.push(doc.usr_wrscrap[i].doc);

            }
        }

        else if (type == 'mr') {

            for (var i = 0; i < doc.usr_mrscrap.length; i++) {
                doc.usr_mrscrap[i].doc.mr_pic1 = mr_urlpath + doc.usr_mrscrap[i].doc.mr_pic1;
                result.scraplist.push(doc.usr_mrscrap[i].doc);

            }
        }

        else if (type == 'gd') {
            console.log(doc);
            for (var i = 0; i < doc.usr_gdscrap.length; i++) {
                doc.usr_gdscrap[i].doc.gd_sticker = "/images/goods" + doc.usr_gdscrap[i].doc.gd_sticker;
                result.scraplist.push(doc.usr_gdscrap[i].doc);

            }
        }

        res.json(result);
    })


});
/////////////////////////////////////////////////////////////////////////////////////////////////////////
router.post('/writelist/:type/', (req, res,next)=> {
    var type = req.params.type;
    var usrid = req.body.usrid;
    var result = {};
    var search, data, path, data2;

    if (type == 'mr') {
        data = {usr_mrwrite: 1};
        data2 = {path: 'mr_usrid', model: user, select: '-_id usr_name'}
        search = '-_id mr_id mr_tag mr_title mr_pic1 mr_usrid'
        path = 'usr_mrwrite.doc'

        //data2 = '-_id mgz_series mgz_title mgz_titlepic mgz_date mgz_id';
    } else if (type == 'wr') {
        data = {usr_wrwrite: 1};
        data2 = {path: 'wr_usrid', model: user, select: '-_id usr_name'}
        search = '-_id wr_id wr_tag wr_title wr_sticker wr_usrid'
        path = 'usr_wrwrite.doc'

    }


    user.findOne({usr_id: usrid}, data).populate({
        path: path,
        select: search,
        populate: data2
    }).lean().exec((err, doc)=> {
        if (err) {
            return next(err);
            //result.result = "FAIL";
            //result.result_msg = err;
            //return res.json(result);
        }
        if (doc == null) {
            //result.reulst = "NONE_USER";
            //return res.json(result);
            return next("NONE_USER");
        }

        result.result = "SUCCESS";
        result.docs = [];

        if (type == 'mr') {
            if (doc.usr_mrwrite.length == 0) {
                result.reulst = "WRITE_EMPTY";
                return res.json(result);
            }
            for (var i = 0; i < doc.usr_mrwrite.length; i++) {
                doc.usr_mrwrite[i].doc.mr_pic1 = mr_urlpath + doc.usr_mrwrite[i].doc.mr_pic1;
                result.docs.push(doc.usr_mrwrite[i].doc);

            }
        } else if (type == 'wr') {
            if (doc.usr_wrwrite.length == 0) {
                result.reulst = "WRITE_EMPTY";
                return res.json(result);
            }
            for (var i = 0; i < doc.usr_wrwrite.length; i++) {
                doc.usr_wrwrite[i].doc.wr_sticker = wr_urlpath + doc.usr_wrwrite[i].doc.wr_sticker;
                result.docs.push(doc.usr_wrwrite[i].doc);
            }
        }


        res.json(result);
    })

});

module.exports = router;
