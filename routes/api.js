var express = require('express');
var router = express.Router();

router.get('/ping', function(req, res, next) {
    res.json({
        message: 'pong'
    })
});

module.exports = router;
