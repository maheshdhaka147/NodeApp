const express=require("express")
const app=express()
const cors=require("cors")
const mongoose=require("mongoose")
const bcrypt=require('bcrypt')
const jwt=require("jsonwebtoken")
const isAuthenticated=require("./Authentication")
// Set some middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded())

mongoose.connect('mongodb+srv://myuser:mypass@cluster0.o5hgl.mongodb.net/mydata?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true})
.then((result)=>{
    console.log("Connection Successful")
}).catch((err)=>{
    console.log(err)
})


const myModel=mongoose.model('userinfo',{
    'fName':String,
    'lName':String,
    'email':String,
    'password':String
})



app.get("/",(req,res)=>{
    res.send(`The is the home page of node js server`)
})

app.post("/api/signup",async(req,res)=>{
    const fName=req.body.fName
    const lName=req.body.lName
    const email=req.body.email
    const password=req.body.password

    const hashedPassword=await bcrypt.hash(password,10)
    const newModel=new myModel(
        {
            'fName':fName,
            'lName':lName,
            'email':email,
            'password':hashedPassword
        })
    newModel.save().then((result)=>{
        console.log(result)
        const responseData={
            'id':result.id,
            'email':result.email
        }
        res.status(200).send(responseData)
    }).catch((err)=>{
        console.log(err)
    })
    console.log(`${fName} ${lName} ${email} ${hashedPassword}`)
})


app.post("/api/login/",async(req,res)=>{
    const email=req.body.email
    const password=req.body.password
    myModel.find({email:email}).then((result)=>{
        console.log(result)
        if(Object.keys(result).length==0){
            res.status(401).send(result)
        }else{
            bcrypt.compare(password,result[0].password,(err,status)=>{
                if(!err){
                    console.log(`The authentication status is ${status}`)
                    console.log(result[0].email)
                    if(status===true){
                        const email=result[0].email
                        const token=jwt.sign({email},"somesecret",{expiresIn:300})
                        console.log("The token is:",token)
                        res.send({'token':token,'email':email})
                        console.log(`the result is ${result}`)
                    }else{
                        res.status(401).send(result)
                    }

                }else{
                    console.log(err)
                }
            })
        }     
    }).catch((err)=>{
        res.status(400).send("Error has occured")
    })
})


app.post("/api/authentication/",(req,res)=>{
const email=req.body.email
const token=req.body.token
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
})

app.get("*",(req,res)=>{
    res.status(404).send(`The resource is not found`)
})
app.listen(8080,(req,res)=>{
    console.log("The server is listening at port 8080")
})