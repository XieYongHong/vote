const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')

const tip1 = '投票成功'
const tip2 = '投票失败，请联系墙君 T T '
router.get('/vote/:id', (req,res) => {
    mysql.query(`update VOTE set click=click+1 wehere book_id=${id}`)
    res.send('投票')
})
router.get('/query/:id', (req,res) => {
    mysql.query(`select vote,click from VOTE where book_id=${id}`)
    res.send('查询投票')
})
router.post('/rank',(req,res) => {
    mysql.query(`select a.vote,a.click,b.name,b.aucher,b.img_url from VOTE as a, book as b ORDER BY a.clik desc limit 0, 5`)
    mysql.query(`select a.vote,a.click,b.name,b.aucher,b.img_url from VOTE as a, book as b ORDER BY a.vote desc limit 0, 5`)
    res.send('查询排行')
})
module.exports = router