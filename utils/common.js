const reMsg = (success = true,msg = '',data = {}) => {
    const obj = {
        success:success,
        message:msg,
        data:data
    }
    return obj
}

module.exports = {
    reMsg
} 