const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')
const SDT = require('silly-datetime')
const comm = require('../utils/common.js')
const END_TIME = Date.parse( new Date('2018-10-13 22:00:00' ));//结束时间
router.post('/vote',async (req,res) => {
        const data = req.body
        var ip = req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
        if(ip.split(':').length>0){
            ip = ip.split(':')[3]
        }
        let resMsg = {}
        const nTime = SDT.format(new Date(),'YYYY-MM-DD')
        const nTime2 = SDT.format(new Date(),'YYYY-MM-DD HH:mm:ss')
        if(Date.parse( new Date()) >= END_TIME){
            resMsg = comm.reMsg(false,'活动已结束，请期待下次活动。',null)
            res.send(resMsg)
        }
        const ipData = await querys(`select * from IP where book_id='${data.id}' and update_time like '${nTime}%' and ip='${ip}'`)
        if(ipData.length){//今天已经投过票
            const voteData = await querys(`select vote from VOTE where book_id=${data.id}`)
            var num = voteData[0].vote
            resMsg = comm.reMsg(true,'今天您为此篇文章已投过票，是否返回首页，查看更多精彩文章。',{vote:num,code:203})
            res.send(resMsg)
        }else{  
            const vote = await querys(`update VOTE set vote=vote+1,click=click+1 where book_id=${data.id}`)
            if(vote){
                await querys(`insert into IP (ip,update_time,book_id) values ('${ip}','${nTime2}','${data.id}')`)
                const voteData = await querys(`select vote from VOTE where book_id=${data.id}`)
                var num = voteData[0].vote
                resMsg = comm.reMsg(true,'投票成功，想看更多精彩文章，请返回首页。',{vote:num,code:200})
                res.send(resMsg)
            }else{
                resMsg = comm.reMsg(false,'投票失败,请联系墙君！',null)
                res.send(resMsg)
            }
        }
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
