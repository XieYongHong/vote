const express = require('express')
const router = express.Router()
const mysql = require('../utils/mysql.js')

router.post('/add',(req ,res) => {
    mysql.query('select * from BOOK', data => {
        console.log(data);
    })
    res.send('增加短文')
})

router.delete('/delete',(req ,res) => {
    res.send('删除短文')
})

router.post('/edit',(req ,res) => {
    res.send('编辑短文')
})

router.post('list',(req,res) => {
    res.send('查询短文')
})

router.get('/info/:id',(req,res) => {
    mysql.query('select * from BOOK', data => {
        console.log(data);
    })
    res.send('查询短文')
})

module.exports = router