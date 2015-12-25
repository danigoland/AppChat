var express = require('express');
var router = express.Router();
var path = require('path');


var views = function (view) {
    path.join(__dirname, '../views/', view);
};

/* GET Home page. */
router.get('/', function (req, res, next) {
    res.redirect('/angular');
});

/* GET Angular App page. */
router.get('/angular', function (req, res, next) {
    res.sendFile(path.join(__dirname, '../views', 'angularApp.html'));

});

/* GET Client page. */
router.get('/client', function (req, res, next) {
    res.render('index', {title: 'AppChat Client'});
});



module.exports = router;
