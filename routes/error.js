/**
 * Created by user on 16. 3. 1.
 */



module.exports = function (err, req, res, next) {

    if (typeof err == "string") {
        return res.json({result: err});

    }
    else {
        res.status(err.status || 500);
        return res.json({
            result: "FAIL",
            err: err.message
        })
    }
};