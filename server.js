const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
require('dotenv').config()


var db;
MongoClient.connect(process.env.DB_URL, function(err, client) {
    if (err) {return console.log(err);}    

    db = client.db('todoapp');

    app.listen(process.env.PORT, function() {
        console.log('listening on 8080');
    });
})

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.get('/write', function (req, res) {
    res.render('write.ejs');
});


app.post('/add', function (req, res) {
    res.send('전송완료');
   
 
    db.collection('counter').findOne({name : 'numberOfPost'}, function (err,result) {
        console.log(result.totalPost);

        // numberOfPost = 총게시물갯수 / 
        var numberOfPost = result.totalPost;

        db.collection('post').insertOne({_id : numberOfPost + 1, 제목 : req.body.title, 날짜 : req.body.date}, function(err, result) {
            console.log('저장완료')
            // couter라는 콜렉션에 있는 totalPost 라는 항목도 1 증가 시켜야함 (수정);

            db.collection('counter').updateOne({name : 'numberOfPost'}, {$inc : {totalPost : 1}}, function(err, result) {
                if (err) {return console.log(err);}
            });
        });

    });
});


app.get('/list', function(req, res) {
    db.collection('post').find().toArray(function(err, result) {
        console.log(result);
        res.render('list.ejs', { posts : result })
    });
});


app.delete('/delete', function(req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id)
    db.collection('post').deleteOne(req.body, function(err, result) {
        console.log('삭제되었습니다')
        res.status(200).send({message : '성공했습니다.'})
    });
});

// /detail 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) {
        console.log(result);
        res.render('detail.ejs', { data : result })
    });
});

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) {
        console.log(result);
        res.render('edit.ejs', { post: result })
    });
});

app.put('/edit', function(req, res){
    // 폼에 담긴 제목데이터, 날짜데이터를 가지고
    // db.collection 에다가 업데이트
    db.collection('post').updateOne({_id : parseInt(req.body.id)}, {$set : {제목 : req.body.title, 날짜 : req.body.date}}, function(err, result){
        console.log('수정완료')
        res.redirect('/list')
    });
});

/*
app.get('/search', (req, res) => {
        console.log(req.query);
    db.collection('post').find({제목 : req.query.value}).toArray((err, result) => {
        console.log(result)
        res.render('search.ejs', {posts : result});
    });
});
*/

app.get('/search', (req, res) => {

    var 검색조건 = [{
        $search: {
            index: 'titleSearch',
            text: {
                query: req.query.value,
                path: '제목' // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
            }
        }
    }]
    db.collection('post').aggregate(검색조건).toArray((err, result) => {
        console.log(result)
        res.render('search.ejs', {posts : result});
    })
})




// app.use(미들웨어) / 요청-응답 중간에 뭔가 실행되는 코드
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());


app.get('/login', function (req, res){
    res.render('login.ejs')
});

app.post('/login', passport.authenticate('local', {
    failureRedirect: '/fail'
}), function (req, res){
    res.redirect('/')
});


app.get('/myPage', login, function (req, res){
    console.log(req.user);
    res.render('myPage.ejs', {user: req.user});
})

function login(req, res, next){
    if(req.user) {
        next()
    }else{
        res.send('로그인이 필요합니다.')
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) { 
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({id: 입력한아이디}, function (에러, 결과) {
        if (에러) return done(에러)
        //done (서버에러, 성공시사용자DB데이터, {message : 메세지})
        if (!결과) return done(null, false, {message: '존재하지않는 아이디요'})

        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, {
                message: '비번틀렸어요'
            })
        }
    })
}));


passport.serializeUser(function (user, done){
    done(null, user.id)
});

passport.deserializeUser(function (id, done){
    db.collection('login').findOne({id : id}, function (err, result){
        done(null, result)
    })
});