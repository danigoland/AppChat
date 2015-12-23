var express = require('express');
var router = express.Router();
var path = require('path');


var views = function (view) {
    path.join(__dirname, '../views/', view);
};

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'AppChat'});
});

/* GET Angular App. */
router.get('/angular', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'angularApp.html'));

});

module.exports = router;
