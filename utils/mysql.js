const mysql = require('mysql')
const pool = mysql.createPool({
    host:'139.159.146.159',
    user:'root',
    password:'1357988',
    database:'article'//数据库名
})

// 接收一个sql语句 以及所需的values
// 这里接收第二参数values的原因是可以使用mysql的占位符 '?'
// 比如 query(`select * from my_database where id = ?`, [1])

let query = (sql,callback) =>{
    // return new Promise((resolve,reject) => {
    //     pool.getConnection((err,connection) =>{
    //         if(err){
    //             reject(err)
    //         }else{
    //             connection.query(sql,values,(err,rows) => {
    //                 if(err){
    //                     reject(err)
    //                 }else{ 
    //                     resolve(values)
    //                 }
    //                 //结束会话
    //                 connection.release()
    //             })
    //         }
    //     })
    // })
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
