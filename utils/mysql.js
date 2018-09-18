const mysql = require('mysql')
const pool = mysql.createPool({
    host:'139.159.146.159',
    user:'root',
    password:'1357988',
    database:'article'//数据库名
})

let query = (sql,callback) =>{
    return new Promise((resolve,reject) => {

    })

    pool.getConnection((err,connection) => {
        if(err){
            console.log(err);
        }else{
            console.log(sql);
            connection.query(sql,(err,rows) => {
                callback(rows,err)
                console.log(err);
                connection.release();
            })
        }
    })
}

exports.query = query
