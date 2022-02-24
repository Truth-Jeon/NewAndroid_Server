const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const { DEC8_BIN } = require('mysql/lib/protocol/constants/charsets');
const port = 3001;
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'1234',
    database:'androidtest'
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/home', (req,res) => {
    console.log("연결");
    const sql = 'SELECT * FROM user';
    connection.query(sql, (err, result) => {
        if(err) console.log(err);
        res.send(result);
    });
});

app.post('/register', function(req, res){
    let name = req.body.name;
    let email = req.body.email;
    let user_id = req.body.user_id;
    let user_pw = req.body.user_pw;
    
    //삽입을 수행하는 sql문.
    let sql = 'INSERT INTO user (name, email, user_id, user_pw) VALUES (?, ?, ?, ?)';
    let params = [name, email, user_id, user_pw];

    //sql문의 ?는 두번째 매개변수로 넘겨진 params의 값으로 치환된다.
    connection.query(sql, params, function(err, result) {
        let resultCode = 400;
        let message = '에러가 발생했습니다.';

        if(err) {
            console.log(err);
        } else {
            resultCode = 200;
            message = '회원가입에 성공했습니다.';
        }

        res.json({
            'code': resultCode,
            'message': message
        });
    });
});

app.post('/login', function(req, res) {
    let user_id = req.body.user_id;
    let user_pw = req.body.user_pw;
    // let sql = 'SELECT * FROM user where user_id = ?;';
    let sql = 'SELECT * FROM user where user_id = ? AND user_pw = ?;';

    // connection.query(sql, [user_id, user_pw], function (err, result) {
    connection.query(sql, [user_id, user_pw] , function (err, result) {
        let resultCode = 404;
        let message = '에러가 발생했습니다';

        if (err) {
            console.log(err);
        } else {
            if(result.length === 0){
                resultCode = 204;
                message = '존재하지 않는 계정입니다!';
                console.log("존재하지 않는 계정입니다!");
            } else if (user_pw !== result[0].user_pw) {
                resultCode = 204;
                message = '비밀번호가 틀렸습니다!';
                console.log("비밀번호가 틀렸습니다!");
            } else {
                resultCode = 200;
                message = '로그인 성공! ' + result[0].name +'님 환영합니다!';
                console.log("로그인 되었습니다.");
            }
        }
        
        res.json({
            'code' : resultCode,
            'message' : message
        });
    })
});

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname);
    },
});

const upload = multer({storage: fileStorageEngine});

app.post("/single", upload.single("image"), (req, res) => {
    console.log(req.file);
    res.send("Single File Upload Success");
});

app.post('/multiple', upload.array('images', 3), (req,res) => {
    console.log(req.files);
    res.send(`Multiple Files Upload Success`)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
});