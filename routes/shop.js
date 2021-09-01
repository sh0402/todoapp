var router = require('express').Router();

router.get('/shirts', function (req, res) {
    res.render('./shop/shirts.ejs');
    // res.send('셔츠파는페이지입니다.')
});

router.get('/pants', function (req, res) {
    res.render('./shop/pants.ejs');
    // res.send('바지파는페이지입니다.')
});

module.exports = router;  