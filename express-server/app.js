const express = require("express")
const app = express()
const { fetchAndSaveWeightData } = require("./weight")
const axios = require("axios")
const cron = require("node-cron")
const cors = require("cors")
const PORT = process.env.PORT || 4000

// Middleware to log the origin of requests
app.use((req, res, next) => {
  const origin = req.get("Origin")
  if (origin) {
    console.log("Request Origin:", origin)
  } else {
    console.log("Request Origin: Origin header is not present")
  }
  next()
})

// Cross Origin Resource Sharing
app.use(
  cors({
    origin: ["http://192.168.0.122:3001", "https://www.jbpearce.app"],
    methods: ["GET", "PUT"],
  })
)

// build-in middleware for json
app.use(express.json())

// build-in middleware to handle url encoded data
// in other words, form data:
// 'content-type: application/x-www-fHow orm-urlencoded'
app.use(express.urlencoded({ extended: false }))

// routes
app.use("/materials", require("./src/routes/api/materials"))
app.use("/paidTickets", require("./src/routes/api/paidTickets"))
app.use("/unPaidTickets", require("./src/routes/api/unPaidTickets"))
app.use("/weighbridge", require("./src/routes/api/weighbridge"))

app.get("/", (req, res) => {
  res.send("Hello World")
})

// Schedule task function
const callDailyChecksAPI = async () => {
  try {
    const response = await axios.get("https://www.jbpearce.app/api/dailychecks")
    console.log("Successfully called daily checks API", response.data)
  } catch (error) {
    console.error("Error calling daily checks API", error)
  }
}

cron.schedule(" */15 * * * *", () => {
  callDailyChecksAPI()
})

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`)
  // now run the weight capture
  fetchAndSaveWeightData()
})
