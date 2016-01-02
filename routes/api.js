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

// GET messages by id
router.get('/messages/:id', function (req, res, next) {
    var id = req.params.id;
    db.messages.getByQuery({user: id}, function (err, data) {
        if (err)
            res.send(err);
        else
            res.json(data);
    });
});

router.get('/users', function (req, res, next) {
    db.users.getAll(function (err, data) {
        if (err)
            res.send(err);
        else
            res.json(data);
    })

});

// GET User by name
router.get('/users/:id', function (req, res, next) {
    var id = req.params.id;
    db.users.getByQuery({_id: id}, function (err, data) {
        if (err)
            res.send(err);
        else {
            res.json(data);
        }
    });
});


module.exports = router;
