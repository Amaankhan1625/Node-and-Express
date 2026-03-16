function errorhandler(err,req,res,next){
    if(err.name === 'UnauthorizedError'){
         res.status(401).json({message:"the user is not authorized"})
    }
}

module.exports = errorhandler;