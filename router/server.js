var express = require('express')
var app = express()
var fs = require('fs')
var path = require('path')
var qs = require('querystring')
var ns = require('node-schedule')
var db = require('./routes/mysql.js')
var sd = require('silly-datetime')
var uuid = require('node-uuid')

app.use(express.static(path.join(__dirname,'public')))//设置静态文件访问路径

app.set('port',8081)

const HEADER_JSON = {'Content-Type': 'application/json; charset=utf8'}

function restMsg(state = 200,msg = '',type = true,data = []){
    var obj = {
        state:state,
        msg:msg,
        success:type,
        data:data
    }
    return JSON.stringify(obj);
}
//根据id查询文章投票
app.post('/queryVoteById',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    req.on('end',() => {
        let data = qs.parse(body);
        db.query('select GUT,WRITING,FEELINGS from VOTE where BOOK_id='+data.id,(err,rows) => {
            let obj
            if(err){
                obj = restMsg(203,'查询失败',false)
            }else{
                obj = restMsg(200,'查询成功',true,rows)
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        })
    })

})
//根据id查询文章详情
app.post('/queryArticleById',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    req.on('end',() => {
        let data = qs.parse(body);
        db.query('select NAME,AUTHOR,CONTENT,IMGURL,SUBMISSION_TIME from BOOK where id='+data.id,(err,rows) => {
            let obj
            if(err){
                obj = restMsg(203,'查询失败',false)
            }else{
                obj = restMsg(200,'查询成功',true,rows)
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        })
    })
    
})
//查询所有文章
app.get('/queryAllBook',(req,res) => {
    db.query('select ID,NAME,AUTHOR,CONTENT,IMGURL,SUBMISSION_TIME,TEXT from BOOK where STATE=1 ORDER BY IMGURL DESC',(err,rows) => {
        let obj
        if(err){
            obj = restMsg(203,'查询失败',false)
        }else{
            obj = restMsg(200,'查询成功',true,rows)
        }
        res.writeHead(200, HEADER_JSON);
        res.end(obj);
    })
})
//添加文章
app.post('/addArticle',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })

    req.on('end',() => {
        let data = qs.parse(body);
        var time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
        db.query("insert into BOOK (NAME,AUTHOR,STATE,CREATE_TIME,SUBMISSION_TIME,CONTENT,IMGURL,TEXT) "
                +"VALUES ('"+data.name+"','"+data.author+"',1,'"+time+"','"+data.time+"','"
                +data.content+"','/image/content"+data.imgurl+"','"+data.contentText+"')",(err,rows) => {
            let obj
            console.log(err);
            if(err){
                obj = restMsg(203,'添加失败',false)
            }else{
                obj = restMsg(200,'添加成功',true)
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        })
    })
})
//修改文章
app.post('/updateArticle',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })

    req.on('end',() => {
        let data = qs.parse(body);
        console.log();
        db.query("update BOOK set NAME='"+data.name+"',AUTHOR='"+data.author+"',CONTENT='"
                +data.content+"',SUBMISSION_TIME='"+data.time+"',TEXT='"+data.contentText+"',IMGURL='"+data.imgurl+"' where id="+data.id,(err,rows) => {
            let obj
            if(err){
                obj = restMsg(203,'修改失败',false)
            }else{
                obj = restMsg(200,'修改成功',true)
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        })
    })
})
//删除文章
app.post('/deleteArticle',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })

    req.on('end',() => {
        let data = qs.parse(body);
        db.query('update BOOK set STATE=0 where id='+data.id,(err,rows) => {
            let obj
            if(err){
                obj = restMsg(203,'删除失败',false)
            }else{
                obj = restMsg(200,'删除成功',true)
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        })
    })
})
//投票
app.post('/vote',(req,res) => {
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    //修改为异步操作 1.查询ip 2.有 无法继续投票 return；无 可以投票 => 
    req.on('end',() => {
        let data = qs.parse(body);
        const time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
        const GSQL = 'update VOTE set GUT=GUT+1 where BOOK_ID='+data.id
        const WSQL = 'update VOTE set WRITING=WRITING+1 where BOOK_ID='+data.id
        const FSQL = 'update VOTE set FEELINGS=FEELINGS+1 where BOOK_ID='+data.id
        const SQLIP = 'select VOTE_TIME as time from ip where BOOK_ID='+data.id+' AND IP="'+data.session+'"'
        const VSQL = 'select GUT,WRITING,FEELINGS from VOTE where BOOK_id='+data.id
        let UPSQLIP = ''
        let r_data = null;
        const query = async function(){
            if(data.session && data.session !='undefined'){ // 判断是否第一次投票
                var s_data = await querys(SQLIP)
                let vote_type = true;
                for(let i=0;i<s_data.length;i++){
                    let old_time = sd.format(s_data[i].time, 'YYYY-MM-DD HH:mm:ss');
                    if(time.substr(0,10) == old_time.substr(0,10)){//判断今天是否投票
                        obj = restMsg(203,'投票失败，今天您已经投过票了',false)
                        vote_type = false
                        break;
                    }
                }
                if(vote_type){
                    if(data.type == 'gut'){
                        r_data = await querys(GSQL)
                    }else if(data.type == 'writing'){
                        r_data = await querys(WSQL)
                    }else if(data.type == 'feelings'){
                        r_data = await querys(FSQL)
                    }
                    if(r_data){
                        UPSQLIP = 'insert into ip (BOOK_ID,IP,VOTE_TIME) values ('+data.id+',"'+data.session+'","'+time+'")'
                        querys(UPSQLIP)
                        var v_data = await querys(VSQL)
                        obj = restMsg(200,'投票成功',true,{data:v_data})
                    }else{
                        obj = restMsg(203,'投票失败，请联系墙君T T',false)
                    }
                }
            }else{
                var uid = uuid.v4();
                UPSQLIP = 'insert into ip (BOOK_ID,IP,VOTE_TIME) values ('+data.id+',"'+uid+'","'+time+'")'
                if(data.type == 'gut'){
                    r_data = await querys(GSQL)
                }else if(data.type == 'writing'){
                    r_data = await querys(WSQL)
                }else if(data.type == 'feelings'){
                    r_data = await querys(FSQL)
                }

                if(r_data){
                    querys(UPSQLIP)
                    var v_data = await querys(VSQL)
                    obj = restMsg(200,'投票成功',true,{id:uid,data:v_data})
                }else{
                    obj = restMsg(203,'投票失败，请联系墙俊T T',false)
                }
            }
            res.writeHead(200, HEADER_JSON);
            res.end(obj);
        }
        query()
    })
})
//查询所有投票 并进行排行
app.get('/rankList',(req,res) => {
    let obj;
    var _feelings = null;
    var _gut = null;
    var _writing = null;
    var f_query = 'select a.FEELINGS as vote,b.NAME,b.AUTHOR,b.ID from VOTE AS a,BOOK AS b WHERE b.id=a.BOOK_ID ORDER BY a.FEELINGS desc limit 0, 10'
    var w_query = 'select a.WRITING as vote,b.NAME,b.AUTHOR,b.ID from VOTE AS a,BOOK AS b WHERE b.id=a.BOOK_ID ORDER BY a.WRITING desc limit 0, 10'
    var g_query = 'select a.GUT as vote,b.NAME,b.AUTHOR,b.ID from VOTE AS a,BOOK AS b WHERE b.id=a.BOOK_ID ORDER BY a.GUT desc limit 0, 10'
    //异步排序操作
    const query = async function(){

        _feelings = await querys(f_query)

        _writing = await querys(w_query)

        _gut= await querys(g_query)

        if(_feelings && _gut && _writing){
            obj = restMsg(200,'查询成功',true,{feelings:_feelings,gut:_gut,writing:_writing})
        }else{
            obj = restMsg(203,'查询失败',false)
        }
        res.writeHead(200, HEADER_JSON);
        res.end(obj);
    }
    query();
})

const querys = function(str){
    return new Promise((resolve ,reject) => {
        db.query(str,(err,rows) => {
            if(err){
                resolve(false)
            }else{
                var datas = rows != null ? rows : false;
                resolve(datas)
            }
        })
    })
}
app.use((req,res,next) => {
    res.status(404);
    res.send('页面未找到')
})

function mySql(str){

}
app.listen( 8081,() => {
    console.log('端口 8081');
})

