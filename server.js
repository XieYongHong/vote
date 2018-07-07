var express = require('express')
var app = express()
var fs = require('fs')
var path = require('path')
var qs = require('querystring')
var sd = require('node-schedule')

app.use(express.static(path.join(__dirname,'public')))//设置静态文件访问路径

app.set('port',8081)

let _obj = {
    status:'200',
    msg:'',
    success:true,
    data:[]
}

const ip_url = './data/ip.json'
const book_url = './data/book.json'

app.post('/getTicketNumbers',function(req,res){//查询票数
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    req.on('end',() => {
        let data = qs.parse(body);
        const gen = async function(){
            let b_data = await queryBook(data.id);
            if(b_data){
                _obj = restData('200','查询成功',true,b_data);
            }else{
                _obj = restData('203','查询失败',false);
            }
            console.log(_obj);
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(_obj));
        }
        gen()
    })
})
app.get('/getTicketNumbersAll',function(req,res){//查询所有文章
        const gen = async function(){
            let b_data = await queryBook();
            if(b_data){
                _obj = restData('200','查询成功',true,b_data);
            }else{
                _obj = restData('203','查询失败',false,b_data);
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(_obj));
        }
        gen()
})

app.post('/addArticle',(req,res) => {//添加文章
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    req.on('end',() => {
        let data = qs.parse(body);
        const gen = async function(){
            let type = await addArticle(data);
            if(type){
                _obj = restData('200','添加成功',true);
            }else{
                _obj = restData('203','添加失败',false);
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(_obj));
        }
        gen()
    })
})

app.post('/editArticle',(req,res) => {//编辑文章
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })
    req.on('end',() => {
        let data = qs.parse(body);
        const gen = async function(){
            let type = await editArticle(data);
            if(type){
                _obj = restData('200','编辑成功',true);
            }else{
                _obj = restData('203','编辑失败',false);
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(_obj));
        }
        gen()
    })
})

app.post('/vote', (req,res)=>{//投票
    var body = ''
    req.on('data', chunk => {
        body += chunk;
    })

    req.on('end',() => {
        let data = qs.parse(body);
        const gen = async function(){
            let type = await hasMac(data.mac)//判断mac地址是否重复
            var _obj
            if(type){
                var wayType = await addVote(data.id,data.type)//进行投票
                if(wayType){
                    _obj = restData('200','投票成功',true);
                }else{
                    _obj = restData('203','投票失败',false);
                }
            }else{
                _obj = restData('200','该设备今天已投过票，无法再投',false);
            }
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
            res.end(JSON.stringify(_obj));
        }
        gen();
    })
})

app.get('/rankList', (req,res) => {
    const gen = async function(){
        let data = await readBookFile();
        var _obj;
        if(data){
            _obj = restData('200','查询成功',true,data);
        }else{
            _obj = restData('200','查询成功',true,data);
        }
        
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
        res.end(JSON.stringify(_obj));
    }
    gen()
})

function hasMac(mac){//判断是否mac重复
    return new Promise((resolve,reject) => {
        fs.readFile(ip_url,(err,data) => {
            if(err){
    
            }else{
                let ipData = JSON.parse(data);
                if(ipData.data.length == 0) {     
                    addMac(mac);
                    resolve(true) 
                    return;
                };
                for(let i=0;i<ipData.data.length;i++){
                    if(ipData.data[i] == mac){
                        resolve(false);
                        return;
                    } 
                }
                addMac(mac);
                resolve(true);
            }
        })
    })
}

function addMac(mac){//添加mac地址
    
    fs.readFile(ip_url , (err,data) => {
        if(!err){
            let _datas = JSON.parse(data);
            let _data = _datas.data;
            _data.push(mac);
            let str = '{ "data":'+JSON.stringify(_data)+'}'
            fs.writeFile(ip_url,str, (err) => {

            })
        }
    })
}

function addVote(id,type){//投票
    return new Promise((resolve,reject) => {
        fs.readFile(book_url, (err,data) => {
            if(!err){
                let datas = JSON.parse(data);
                let _data = datas.data;
                for(let i=0;i<_data.length;i++){
                    if(_data[i].id == id){
                        if('writing' == type){
                            _data[i].writing += 1
                        }
                        if('gut' == type){
                            _data[i].gut += 1
                        }
                        if('feelings' == type){
                            _data[i].feelings += 1
                        }
                    }
                }
                let str = '{ "data":'+JSON.stringify(_data)+'}'
                fs.writeFile(book_url,str, (err) => {
                    if(err){
                        resolve(false)
                    }else{
                        resolve(true)
                    }
                })  
            }
        })
    })
}

function addArticle(a_data){//添加文章
    return new Promise((resolve,reject) => {
        fs.readFile(book_url, (err,data) => {
            if(!err){
                let datas = JSON.parse(data);
                let _data = datas.data;
                let obj = {
                    id:a_data.id,
                    name:a_data.name,
                    author:a_data.author,
                    writing:0,
                    gut:0,
                    feelings:0
                }
                _data.push(obj)
                let str = '{ "data":'+JSON.stringify(_data)+'}'
                fs.writeFile(book_url,str, (err) => {
                    if(err){
                        resolve(false)
                    }else{
                        resolve(true)
                    }
                })  
            }
        })
    })
}
function editArticle(a_data){
    return new Promise((resolve,reject) => {
        fs.readFile(book_url, (err,data) => {
            if(!err){
                let datas = JSON.parse(data);
                let _data = datas.data;
                const id = a_data.id;
                for(let i=0;i<_data.length;i++){
                    if(_data[i].id == id){
                        _data[i].name = a_data.name
                        _data[i].author = a_data.author
                    }
                }
                let str = '{ "data":'+JSON.stringify(_data)+'}'
                fs.writeFile(book_url,str, (err) => {
                    if(err){
                        console.log(err);
                        resolve(false)
                    }else{
                        resolve(true)
                    }
                })  
            }
        })
    })
}

function queryBook(id){//查询投票
    return new Promise((resolve,reject) => {
        fs.readFile(book_url, (err,data) => {
            if(!err){
                let datas = JSON.parse(data);
                let _data = datas.data;
                if(id){
                    for(let i=0;i<_data.length;i++){
                        if(_data[i].id == id){
                            resolve(_data[i])
                        }
                    }
                }else{
                    resolve(_data)
                }
                resolve(false)
            }
        })
    })
}

function readBookFile(){//获取文章投票数量，进行分类排序
    return new Promise((resolve,reject) => {
        fs.readFile(book_url, (err,data) => {
            if(!err){
                let datas = JSON.parse(data);
                let _data = datas.data;
                let data1 = _data.concat();
                let data2 = _data.concat();
                let data3 = _data.concat();
                //writing
                for(let i=0;i<data1.length;i++){
                    for(let j=0;j<data1.length - i - 1;j++){
                        if(data1[j].writing < data1[j + 1].writing){
                            let swap = data1[j];
                            data1[j] = data1[j+1]
                            data1[j+1] = swap
                        }
                    }
                }
                //gut
                for(let i=0;i<data2.length;i++){
                    for(let j=0;j<data2.length - i - 1;j++){
                        if(data2[j].gut < data2[j + 1].gut){
                            let swap = data2[j];
                            data2[j] = data2[j+1]
                            data2[j+1] = swap
                        }
                    }
                }
                //feelings
                for(let i=0;i<data3.length;i++){
                    for(let j=0;j<data3.length - i - 1;j++){
                        if(data3[j].feelings < data3[j + 1].feelings){
                            let swap = data3[j];
                            data3[j] = data3[j+1]
                            data3[j+1] = swap
                        }
                    }
                }
                let obj = {
                    writing:data1,
                    gut:data2,
                    feelings:data3
                }
                resolve(obj)
            }
        })
    })
}

function setTimeOut(){//设置每天0点0分0秒执行
    sd.scheduleJob('0 0 0 * * *',() => {
        cleanMac()
    })
}

function cleanMac(){//清除ip.json的数据
    var str = '{"data":[]}'
    fs.writeFile(ip_url,str, (err) => {
        if(err){
            console.log(err);
        }
    }) 
}

function restData(status,msg,type,data){//返回参数格式
    var obj = {
        status:status,
        msg:msg,
        success:type,
        data: data || []
    }
    return obj
}

app.use((req,res,next) => {
    res.status(404);
    res.send('页面未找到')
})

app.listen( 8081,() => {
    console.log('端口 8081');
    setTimeOut()
})