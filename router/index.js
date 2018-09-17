const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')
const SDT = require('silly-datetime')
const comm = require('../utils/common.js')

router.post('/add',(req ,res) => {//增加短文
    const data = req.body;
    const nowTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
    mysql.query(`insert into BOOK (name,author,state,create_time,submission_time,content,img_url,type,text) 
            values ('${data.name}','${data.author}',0,'${nowTime}','${data.time}','${data.content}','${data.img}',${data.type},${text})`, (row,err) => {
                let resMsg = {}
                if(err){
                    resMsg = comm.reMsg(false,'保存失败',null)
                }else{
                    resMsg = comm.reMsg(true,'保存成功',null)
                }
                res.send(resMsg)
    })
})

router.delete('/delete/:id',(req ,res) => { //删除
    const nowTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
    mysql.query(`update book set state=1,update_time='${nowTime}' where id='${req.params.id}'`,(data,err) => {
        let resMsg = {}
            if(err){
                resMsg = comm.reMsg(false,'删除失败',null)
            }else{
                resMsg = comm.reMsg(true,'删除成功',null)
            }
            res.send(resMsg)
    })
})

router.post('/edit',(req ,res) => { //编辑
    const data = req.body;
    const nowTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
    mysql.query(`update BOOK set name='${data.name}',author='${data.author}',update_time='${nowTime}'
                ,submission_time='${data.time}',img_url='${data.img}',type=${data.type},content='${data.content}',text='${data.text}' where id='${data.id}'`,(data,err) => {
                let resMsg = {}
                if(err){
                    resMsg = comm.reMsg(false,'修改失败',null)
                }else{
                    resMsg = comm.reMsg(true,'修改成功',null)
                }
                res.send(resMsg)
            })
})

router.get('/list/:type',(req,res) => {
    const type = req.params.type
    mysql.query(`select a.id,a.name,a.author,a.create_time,a.img_url,a.content,b.click,b.vote from BOOK as a,VOTE as b where state=0 and type=${type} and a.id=b.book_id`,(data,err) => {
        let resMsg = {}
        if(err){
            resMsg = comm.reMsg(false,'查询失败',null)
        }else{
            resMsg = comm.reMsg(true,'查询成功',data)
        }
        res.send(resMsg)
    })
})

router.get('/info/:id',(req,res) => {
    const id = req.params.id
    mysql.query(`select a.name,a.author,a.submission_time,a.img_url,a.content,b.click,b.vote from BOOK as a, VOTE as b where a.id='${id}' and b.book_id='${id}'`, (data,err) => {
        let resMsg = {}
        if(err){
            resMsg = comm.reMsg(false,'查询失败',null)
        }else{
            resMsg = comm.reMsg(true,'查询成功',data)
        }
        res.send(resMsg)
    })
})

router.get('/getAll', (req,res) => {
    mysql.query('select id,name,author,submission_time,img_url,content,type from BOOK',(data,err) => {
        let resMsg = {}
        if(err){
            resMsg = comm.reMsg(false,'查询失败',null)
        }else{
            resMsg = comm.reMsg(true,'查询成功',data)
        }
        res.send(resMsg)
    })
})
module.exports = router