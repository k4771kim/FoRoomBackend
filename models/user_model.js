/**
 * Created by ccei on 2016-01-27.
 */
var bcrypt = require('bcrypt-nodejs');
mongoose = require('./db_connection');
var autoIncrement = require('mongoose-auto-increment');
var db = mongoose.connection;

var userSchema = mongoose.Schema({
    usr_auth : String,  //OAuth ID
    usr_id: String, // AutoIncrement UserID
    usr_name: String,
    usr_pic: String,
    usr_thumb : {type : String, default : "null" },
    usr_password : String,
    usr_mgzscrap: {type : [{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'magazin'}}],default :[]},
    usr_wrscrap: {type :[{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'wishroom'}}],default :[]},
    usr_mrscrap : {type :[{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'myroom'}}],default :[]},
    usr_gdscrap : {type :[{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'good'}}],default :[]},
    usr_wrwrite: {type :[{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'wishroom'}}],default :[]},
    usr_mrwrite :{type : [{_id : false,doc : {type :mongoose.Schema.Types.ObjectId , ref : 'myroom'}}],default :[]},
    usr_likecnt: Number,
    usr_writecnt: Number,
    usr_way : String,
    usr_desc : String,
    usr_registrationid : {type : String , default : "null"}
});
var reasons = userSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};
userSchema.plugin(autoIncrement.plugin, {
    model: 'user',
    field: 'usr_id',
    startAt: 1,
    incrementBy: 1
});
autoIncrement.initialize(db);
//var user = mongoose.model('user', userSchema); //kim + s: Collection 명

userSchema.pre('save', function(next) {
    var user = this;

    if (!user.isModified('usr_password')) return next();

        bcrypt.hash(user.usr_password,null, null, function(err, hash) {
            if (err) return next(err);
            console.log(hash);
            // override the cleartext password with the hashed one
            user.usr_password = hash;
            next();
        });

});


//module.exports = user;
module.exports = mongoose.model('user', userSchema)