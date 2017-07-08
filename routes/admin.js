var express = require('express');
var router = express.Router();
//var app = express();
var mongoose = require('../models/db_connection');
var admin = require('../models/admin_model');
var db = mongoose.connection;
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(db);
var moment = require('moment');
var magazin = require('../models/magazin_model');
var goods = require('../models/goods_model');
var goodsctg = require('../models/goodscategory_model');
var wishroom = require('../models/wishroom_model');
var myroom = require('../models/myroom_model');
var user = require('../models/user_model');
var async = require('async');
//boardSchema.virtual('regdate2').get(()=> {
//    return moment(this.regdate).format('YYYY-MM-DD hh:mm:ss');
//});

//boardSchema.set('toJSON', {virtuals: true});

router.get('/', (req, res, next)=> {
    res.render('admin/login', {});
})

router.post('/login', (req, res, next)=> {

    id = req.body.id;
    pw = req.body.pw;

    admin.find({admin_id: id, admin_pw: pw}, (err, docs)=> {

        if (err) {
            if (err) return next(err);
        }


        if (docs.length == 0) {
            res.send('<script>alert("아이디가 없거나 비밀번호가 틀렸습니다.");location.href="/admin/";</script>')
        } else {
            res.redirect('/admin/main');
        }


    })
})

router.get('/main', (req, res, next)=> {

    res.render('admin/main');

})

router.get('/pi', (req, res, next)=> {

    res.render('admin/personal_info');

})
router.get('/magazin', (req, res, next)=> {
    magazin.find({}).sort('mgz_series').exec((err, docs)=> {
        res.render('admin/magazinpage', {mgz: docs});
    })


})

router.get('/insertmagazin', (req, res, next)=> {

    res.render('admin/insertmagazin');

})
router.get('/modifymagazin/:mgz_id', (req, res, next)=> {
    var mgz_id = req.params.mgz_id;
    console.log(mgz_id);


    magazin.findOne({mgz_id: mgz_id}, (err, doc)=> {
        res.render('admin/modifymagazin', {mgz: doc});
    })


})
router.get('/goods', (req, res, next)=> {
    goods.find({}).sort([['gd_series', 'ascending']]).exec((err, docs)=> {
        res.render('admin/goods', {goods: docs});
    })
})


//-----------------------------------myRoom Start------------------------------------------
router.get('/myroom', (req, res, next)=> {
    myroom.find({}).populate('mr_usrid').sort([['mr_id', 'ascending']]).exec((err, docs)=> {
        res.render('admin/myroom/main', {myroom: docs});
    })
})


router.get('/modifymyroom/:mr_id', function (req, res, next) {
    var mr_id = req.params.mr_id;
    myroom.findOne({mr_id: mr_id}, (err, mr)=> {
        res.render('admin/myroom/modifymyroom', {myroom: mr});
    });
});

//-----------------------------------myRoom End------------------------------------------


//-----------------------------------wishRoom Start------------------------------------------

router.get('/wishroom', (req, res, next)=> {
    wishroom.find({}).populate('wr_usrid').sort([['wr_id', 'ascending']]).exec((err, docs)=> {
        res.render('admin/wishroom/main', {wishroom: docs});
    })
})


router.get('/modifywishroom/:wr_id', function (req, res, next) {
    var wr_id = req.params.wr_id;
    wishroom.findOne({wr_id: wr_id}, (err, wr)=> {
        res.render('admin/wishroom/modifywishroom', {wishroom: wr});
    });
});

//-----------------------------------wishRoom End------------------------------------------

router.get('/insertgoods', (req, res, next)=> {

    goodsctg.find({}, {_id: 0, category_id: 1, category: 1}, (err, docs)=> {
        res.render('admin/insertgoods', {category: docs});
    });
})

router.get('/insertctg', (req, res, next)=> {

    res.render('admin/insertcategory');

})
router.get('/modifygoods/:gd_id', function (req, res, next) {
    var gd_id = req.params.gd_id;
    goodsctg.find({}, {_id: 0, category_id: 1, category: 1}, (err, ctg)=> {
        goods.findOne({gd_id: gd_id}, (err, gd)=> {
            res.render('admin/modifygoods', {category: ctg, goods: gd});
        })
    });
});


//---------------------------GCM Service Start -------------------------------
router.get('/push', function (req, res, next) {

    user.find({usr_registrationid: {$ne: null}}, (err, user)=> {
        res.render('admin/push/pushpage', {user: user});
    });
});


var gcm = require('node-gcm');
router.post('/sendpush', function (req, res, next) {
    var server_access_key = "YOUR_SERVER_ACCESS_KEY";


    var title = req.body.message1;
    var message = req.body.message2;
    var target = req.body.target;
    //console.log(target);

    var message = new gcm.Message({
        collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
            type: "FoRoom GCM Message",
            title: title,
            message: message
        }
    });

    var sender = new gcm.Sender(server_access_key);
    var registrationIds = [];
    if(target == "ALL"){
        user.find({usr_registrationid: {$ne: null}} , {_id : false , usr_registrationid : true}, (err, user)=> {


            async.eachSeries(user, function iteratee(item, callback) {

                registrationIds.push(item.usr_registrationid);
                callback();

            }, function done() {
                sender.send(message, registrationIds, 4, function (err, result) {
                    //console.log(result);
                });
            });
        });
    }else{
        registrationIds.push(target);
        sender.send(message, registrationIds, 4, function (err, result) {
            //console.log(result);
        });
    }
        res.redirect('/admin/push/');
});

module.exports = router;
