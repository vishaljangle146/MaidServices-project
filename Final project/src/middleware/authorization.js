const authorization = async (req,res,next)  =>{
    const token = req.cookies.userToken;
    console.log('token is ' + token);
}

module.exports = authorization;