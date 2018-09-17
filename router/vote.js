const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')
const SDT = require('silly-datetime')
const comm = require('../utils/common.js')
const uuid = require('node-uuid')
const sha256 = require('js-sha256')

router.post('/vote',(req,res) => {
    const data = req.body
    var ip = req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress || '';
    if(ip.split(':').length>0){
        ip = ip.split(':')[3]
    }
    console.log(ip);
    const vote = async () => {
        let sessionType
        let resMsg = {}
        if(data.session){//验证session
            sessionType = await querys(`select ip,sha,update_time from IP wehere sha='${data.session}'`)
            if(sessionType){
                //验证投票时间
                let vTime = sessionType[0].update_time.substring(0,10)
                let nTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss').substring(0,10)
                if(vTime == nTime){
                    resMsg = comm.reMsg(true,'投票失败,今天已经投过票了',null)
                }else{
                    await mysql.query(`update VOTE set vote=vote+1,click=click+1 wehere book_id='${id}'`,(data,err) => {
                        if(err){
                            resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                        }else{
                            const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                            var up = querys(`update IP set updateTime=${time} where sha=${data.session}`)
                            if(up){
                                var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                resMsg = comm.reMsg(true,'投票成功',voteDate)
                            }
                        }
                    })
                }
            }else{
                resMsg = comm.reMsg(false,'投票失败,请联系墙君 code:010',null)
            }
        }else{
            var ipType = await querys(`select ip,sha,update_time from IP wehere ip='${ip}'`)
                if(ipType){
                    let vTime = ipType[0].update_time.substring(0,10)
                    let nTime = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss').substring(0,10)
                    if(vTime == nTime){
                        resMsg = comm.reMsg(true,'投票失败,今天已经投过票了',null)
                    }else{
                        await mysql.query(`update VOTE set vote=vote+1,click=click+1 wehere book_id=${id}`,(data,err) => {
                            if(err){
                                resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                            }else{
                                const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                                var up = querys(`update IP set updateTime=${time} where ip='${ip}'`)
                                if(up){
                                    var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                    resMsg = comm.reMsg(true,'投票成功',voteDate)
                                }
                            }
                        })
                    }
                }else{//第一次投票
                    await mysql.query(`update VOTE set vote=vote+1,click=click+1 wehere book_id=${id}`,(data,err) => {
                        if(err){
                            resMsg = comm.reMsg(false,'投票失败,请联系墙君',null)
                        }else{
                            const time = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
                            const uuids = uuid.v4()
                            const sUUID = sha256.sha256(uuids)
                            const ipUUID = sha256.sha256(sUUID+ip)
                            var up = querys(`insert into IP (ip,sha,create_time,update_time) values ('${ip}','${ipUUID}','${time}','${time}')`)
                            if(up){
                                var voteDate = querys(`select vote from VOTE where book_id=${data.id}`)
                                resMsg = comm.reMsg(true,'投票成功',voteDate)
                            }
                        }
                    })
                }
        }
        res.send(resMsg)
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
        const click = await querys(`select a.click,a.vote,b.id,b.name,b.id,b.author,b.img_url from VOTE as a, BOOK as b where b.type='${type}' and b.state=0 ORDER BY a.click desc limit 0, 5`)
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
                var datas = rows != null ? rows : false;
                resolve(datas)
            }
        })
    })
}
module.exports = router