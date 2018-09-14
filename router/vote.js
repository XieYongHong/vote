const express = require('express')
const router = express.Router()

router.post('/vote', (req,res) => {
    res.send('投票')
})

module.exports = router