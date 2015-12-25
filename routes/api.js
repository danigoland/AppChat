var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var db = require('../db');


// GET messages.
router.get('/messages', function (req, res, next) {
    db.messages.getByQuery({}, function (err, data) {
        if (err)
            res.send(err);
        else
            res.json(data);
    });
});

// GET chats.
router.get('/messages', function (req, res, next) {
    db.messages.getByQuery({}, function (err, data) {
        if (err)
            res.send(err);
        else
            res.json(data);
    });
});

// GET messages by name
router.get('/messages/user/:name', function (req, res, next) {
    var name = req.params.name;
    db.messages.getHistoryByName(name, function (err, data) {
        if (err)
            res.send(err);
        else
            res.json(data);
    });
});

module.exports = router;
