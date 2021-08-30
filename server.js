const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));


var db;
MongoClient.connect('mongodb+srv://dg0402:1q2w3e@cluster0.vaark.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', function(err, client) {
    if (err) {return console.log(err);}    

    db = client.db('todoapp');

    app.listen(8080, function () {
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
            console.log('저장완료');
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
        res.render('list.ejs', { posts : result });
    });
});


app.delete('/delete', function(req, res) {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, function(err, result) {
        console.log('삭제되었습니다');
        res.status(200).send({message : '성공했습니다.'});
    });
});

// /detail 로 접속하면 detail.ejs 보여줌

app.get('/detail/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) {
        console.log(result);
        res.render('detail.ejs', { data : result });
    });
});

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result) {
        console.log(result);
        res.render('edit.ejs', { post: result });
    });
});