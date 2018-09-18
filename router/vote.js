const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')
const SDT = require('silly-datetime')
const comm = require('../utils/common.js')
const uuid = require('node-uuid')
const sha256 = require('js-sha256')

router.post('/vote',(req,res) => {
    const vote = async () => {
        const data = req.body
        var ip = req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
        if(ip.split(':').length>0){
            ip = ip.split(':')[3]
        }
        
        let sessionType
        let resMsg = {}
        if(data.session){//验证session
            sessionType = await querys(`select ip,sha,update_time from IP where sha='${data.session}'`)
            if(sessionType.length){
                //验证投票时间
                let vTime = sessionType[0].update_time.substring(0,10)
                let nTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss').substring(0,10)
                if(vTime == nTime){
                    await mysql.query(`select vote from VOTE where book_id=${data.id}`,(data,err) => {
                        var num = data[0].vote
                        resMsg = comm.reMsg(true,'投票失败,今天已经投过票了',{vote:num})
                        res.send(resMsg)
                    })
                }else{
                    mysql.query(`update VOTE set vote=vote+1,click=click+1 where book_id='${id}'`,(data,err) => {
                        if(err){
                            resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                            res.send(resMsg)
                        }else{
                            const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                            var up = querys(`insert into IP (ip,sha,create_time,update_time) values ('${ip}','${ipUUID}','${time}','${time}')`)
                            if(up){
                                var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                resMsg = comm.reMsg(true,'投票成功',{vote:voteDate})
                                res.send(resMsg)
                            }
                        }
                    })
                }
            }else{
                resMsg = comm.reMsg(false,'投票失败,请联系墙君 code:010',null)
                res.send(resMsg)
            }
        }else{
            var ipType = await querys(`select ip,sha,update_time from IP where ip='${ip}'`)
                if(ipType.length){
                    let vTime = ipType[0].update_time.toString()
                    let nTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss').substring(0,10)
                    let vTime2 = SDT.format(new Date(vTime),'YYYY-MM-DD HH:mm:ss').substring(0,10)
                    let ipUUID = ipType[0].sha
                    if(vTime2 == nTime){
                        mysql.query(`select vote from VOTE where book_id=${data.id}`,(data,err) => {
                            var num = data[0].vote
                            resMsg = comm.reMsg(true,'投票失败,今天已经投过票了',{vote:num})
                            res.send(resMsg)
                        })
                    }else{
                        await mysql.query(`update VOTE set vote=vote+1,click=click+1 where book_id=${data.id}`,(data,err) => {
                            if(err){
                                resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                                res.send(resMsg)
                            }else{
                                const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                                var up = querys(`insert into IP (ip,sha,create_time,update_time) values ('${ip}','${ipUUID}','${time}','${time}')`)
                                if(up){
                                    var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                    resMsg = comm.reMsg(true,'投票成功',{vote:voteDate})
                                    res.send(resMsg)
                                }
                            }
                        })
                    }
                }else{//第一次投票
                    await mysql.query(`update VOTE set vote=vote+1,click=click+1 where book_id=${data.id}`,(data,err) => {
                        if(err){
                            resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                            res.send(resMsg)
                        }else{
                            const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                            const uuids = uuid.v4()
                            const sUUID = sha256.sha256(uuids)
                            const ipUUID = sha256.sha256(sUUID+ip)
                            var up = querys(`insert into IP (ip,sha,create_time,update_time) values ('${ip}','${ipUUID}','${time}','${time}')`)
                            if(up){
                                var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                resMsg = comm.reMsg(true,'投票成功',{vote:voteDate,session:ipUUID})
                                res.send(resMsg)
                            }
                        }
                    })
                }
        }
        
    }
    vote();
})
router.get('/click/:id', (req,res) => {
    const id = req.params.id
    mysql.query(`update VOTE set click=click+1 where book_id=${id}`,(data,err) => {
        let resMsg = {}
        if(err){
            resMsg = comm.reMsg(false,'增加点击量失败',null)
        }else{
            resMsg = comm.reMsg(true,'增加点击量成功',null)
        }
        res.send(resMsg)
    })
})

router.get('/query/:id', (req,res) => {
    const id = req.params.id
    mysql.query(`select vote,click from VOTE where book_id=${id}`,data => {
        let resMsg = {}
        if(err){
            resMsg = comm.reMsg(false,'查询失败',null)
        }else{
            resMsg = comm.reMsg(true,'查询成功',null)
        }
        res.send(resMsg)
    })
})
router.get('/getRank/:type',(req,res) => {
    const type = req.params.type
    const rank = async () => {
        const click = await querys(`select a.click,a.vote,b.id,b.name,b.id,b.author,b.img_url from VOTE as a, BOOK as b where b.type='${type}' and b.state=0 and b.id=a.book_id ORDER BY a.click desc limit 0, 5`)
        const vote = await querys(`select a.vote,b.name,b.id,b.author,b.img_url from VOTE as a, BOOK as b where b.type='${type}' and b.id=a.book_id and b.state=0 ORDER BY a.vote desc limit 0, 12`)
        let resMsg = {}
        if(!click && !Vote){
            resMsg = comm.reMsg(false,'查询失败',null)
        }else{
            resMsg = comm.reMsg(true,'查询成功',{click:click,vote:vote})
        }
        res.send(resMsg)
    }
    rank()
})
const querys = function(str){
    return new Promise((resolve ,reject) => {
        mysql.query(str,(rows,err) => {
            if(err){
                resolve(false)
            }else{
                console.log(rows);
                var datas = rows != null ? rows : false;
                resolve(datas)
            }
        })
    })
}
module.exports = router
