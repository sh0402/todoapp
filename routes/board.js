var router = require('express').Router();

function login(req, res, next){
    if(req.user) {
        next()
    }else{
        res.send('로그인이 필요합니다.')
    }
}

router.use(login);

router.get('/sports', function (req, res) {
    // res.render('./borad/shirts.ejs');
    res.send('스포츠 게시판')
});

router.get('/game', function (req, res) {
    // res.render('./borad/pants.ejs');
    res.send('게임 게시판')
});

module.exports = router;  