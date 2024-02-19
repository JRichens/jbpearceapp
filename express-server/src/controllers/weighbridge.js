const net = require("net")

const getWeight = (req, res) => {
  console.log("weigh scale GET")
  try {
    const client = new net.Socket()
    const dataPromise = new Promise((resolve, reject) => {
      client.connect(3002, "192.168.0.46", function () {
        console.log("Connected")
        client.write("\x07")
      })

      client.on("data", function (data) {
        console.log("Received: " + data)
        //  ☻     00     00     000S99000041♥E
        let weight = data.toString().substring(3, 8)
        let stableMoving = data.toString().substring(23, 24)

        client.destroy() // kill client after server's response
        resolve({ weight, stableMoving })
      })

      client.on("error", function (err) {
        console.log("Connection error", err)
        reject(err)
      })

      client.on("close", function () {
        console.log("Connection closed")
      })
    })

    dataPromise
      .then((result) => {
        res.status(200).json(result)
      })
      .catch((err) => {
        res.status(500).send(err)
      })
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

module.exports = { getWeight }
