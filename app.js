const express=require('express');
const mysql = require('mysql');
const format = require('date-format');
const moment = require('moment');
const { resourceLimits } = require('worker_threads');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");
//기본 모듈 설치

const app = express();
app.use(express.urlencoded({extended:true}));
//post방식 받아오기 선언

//ejs로 셋팅해주기
app.set('view engine','ejs');
app.set('views','./views');

//날짜 포맷 지정해주기
const dateFor = moment().format('YYYY-MM-DD HH:mm:ss');

//1. mysql 연동
const conn = mysql.createConnection({
    host:'localhost',
    user:'test',
    password:'1111',
    database:'testdb'
})

conn.connect();

//쿼리를 객체로 생성하기
const sql = {
   select : 'select * from mem order by id desc',
   insert : 'insert into mem(user_name,pw,email,reg_date) values (?,?,?,?)',
   read : 'select * from mem where user_name=? and pw=?',
   update: 'update mem set user_name=?, pw=?,email=? where id=?',
   delete :'delete from mem where user_name=? and pw=?'
}

app.get('/',(req,res)=>{
    res.render('index');
})

app.get('/login',(req,res)=>{
    res.render('login_form');
})

app.post('/login',(req,res)=>{
    const _name = req.body.uname;
    const _pw = req.body.upw;

    conn.query(sql.read,[_name,_pw],(err,result)=>{
        if(err){console.log(err);}
        else{
            if(result.length > 0){
               // res.render('welcome',{})
            }
        }
    })

})

app.get('/join',(req,res)=>{
    res.render('join_form');
})

app.post('/join',(req,res)=>{
    const _name = req.body.uname;
    const _pw = req.body.pw;
    const _email = req.body.uemail;
    const joinDate = dateFor;
    
    conn.query(sql.insert,[_name,_pw,_email,joinDate],(err)=>{
        if(err){console.log(err);}
        else{
            console.log('insert!!');
            res.redirect('/');
        }
    })
})

//리스트보기
app.get('/showlist',(req,res)=>{
    conn.query(sql.select,(err,datas)=>{
        if(err){console.log(err);}
        else{ 
            res.render('list',{lists:datas})
        }
    })
})

//비밀번호 체크폼
app.get('/check/:username/:option',(req,res)=>{
    const op = req.params.option;
    const name = req.params.username;
    res.render('check_form',{uname:name,option:op});
})

//비밀번호 체크 동작
app.post('/check/:option',(req,res)=>{
    const option = req.params.option;
    const name=req.body.uname;
    const pw = req.body.pw;
    
    conn.query(sql.read,[name,pw],(err,result)=>{
        if(err){console.log(err);}
        else{
            if(result.length > 0){
                //res.send('비밀번호가 맞습니다.');
                //비밀번호가 맞으면 edit가 가능하게 해야하므로 edit창으로 넘어가기
                //console.log(option);
                //if(option === 1){
                res.render('edit_form',{list:result[0]});
              //  }

            }else{
                res.send('<script type="text/javascript"> alert("비밀번호가 다릅니다."); history.go(-1);</script>');  
                //alert로 바꿔주기 res.send('비밀번호가 다릅니다.');
            }
        }
    })
})


//수정
app.post('/edit',(req,res)=>{
    const uid=req.body.id;
    const uname=req.body.uname;
    const upw=req.body.upw;
    const uemail=req.body.uemail;

    conn.query(sql.update,[uname,upw,uemail,uid],(err)=>{
        if(err){console.log(err);}
        else{
            console.log(uid,uname,upw,uemail);
            res.send('<script type="text/javascript">alert("수정되었습니다."); document.location.href="/showlist"; </script>'); 
        }
    })
})

//삭제
app.get('/del/:username',(req,res)=>{
    const name = req.params.username;
    res.render('check_form2',{uname:name});
})

app.post('/delete',(req,res)=>{
    const uname = req.body.uname;
    const pw = req.body.pw;

    console.log(uname,pw);

    conn.query(sql.delete,[uname,pw],(err)=>{
        if(err){console.log(err);}
        else{
            res.send('<script type="text/javascript">alert("삭제되었습니다."); document.location.href="/showlist"; </script>'); 
        }
    })
})

app.listen(3002,()=>{
    console.log('Running Server at 3002 Port...');
})