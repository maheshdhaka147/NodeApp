const jwt=require("jsonwebtoken")

function isAuthenticated(token,email){
    jwt.verify(token,"somesecret",(err,decoded)=>{
        if(!err){
            if(decoded.email===email){
                console.log("User is authenticated")
                res.status(200).send("User is authenticated successfully")
            }else{
                console.log("Authentication failed")
                res.status(401).send("Authentication failed")
            }
        }else{
            console.log(err)
            res.status(401).send(err)
        }
    })
}

module.exports=isAuthenticated
