var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');


/* GET messages. */
router.get('/messages', function (req, res, next) {
    mongoose.model('messages').find({}, function (err, data) {
        res.json(data);
    });
});

router.get('/messages/user/:name', function (req, res, next) {
    var name = req.params.name;
    mongoose.model('messages').find({$or: [{from: name}, {to: name}]}, null,
        {sort: {date: -1}}, function (err, data) {
            res.json(data);
        });
});

router.get('/messages/to/:name', function (req, res, next) {
    mongoose.model('messages').find({from: req.params.name}, function (err, data) {
        res.json(data);
    });
});

module.exports = router;
