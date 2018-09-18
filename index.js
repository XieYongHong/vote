const express = require('express')
const app = express()

const PORT = 8083 //端口号
const book = require('./router/index')
const vote = require('./router/vote')
const bodyParser = require('body-parser')

app.disable('x-powered-by')

//拦截器
app.use((req,res,next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("Content-Type", "application/json;charset=utf8");
    if(req.method=="OPTIONS"){
        res.send(200);/*让options请求快速返回*/
    } 
    else{
        next();
        // getAuthorization(req,res,next)
    }  
})
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
//配置路由
app.use('/book',book)
app.use('/vote',vote)

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
})
