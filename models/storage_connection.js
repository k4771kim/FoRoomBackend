/**
 * Created by ccei on 2016-01-30.
 */
var multer = require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
        filename: function (req, file, cb) {
            var uploadedName = file.originalname;
            cb(null, uploadedName);
        }
});

var upload = multer({ storage: storage });

module.exports = storage;