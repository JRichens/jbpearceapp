const { PrismaClient } = require("@prisma/client")
const net = require("net")

const prisma = new PrismaClient()

async function fetchAndSaveWeightData() {
  while (true) {
    // Run indefinitely
    const startTime = Date.now()

    const client = new net.Socket()
    client.connect(3002, "192.168.0.46", function () {
      // console.log("Connected")
      client.write("\x07")
    })

    try {
      const data = await new Promise((resolve, reject) => {
        client.on("data", (data) => {
          resolve(data.toString())
        })

        client.on("error", (err) => {
          reject(err)
        })

        client.on("close", () => {
          // console.log("Connection closed")
        })
      })

      const weight = data.substring(3, 8)

      const stableMoving = data.substring(23, 24)
      // if stable moving = S, then weight is stable
      const stable = stableMoving === "S"

      // First delete what ever is in the database
      await prisma.saveweight.deleteMany({})

      // Save to the database
      await prisma.saveweight.create({
        data: {
          weight,
          stable,
        },
      })

      // console.log(`Weight data saved at: ${new Date().toISOString()}`)
    } catch (error) {
      console.error("Failed to fetch and save weight data:", error)
    } finally {
      client.destroy()

      const endTime = Date.now()
      const processingTime = endTime - startTime
      if (processingTime < 500) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 - processingTime)
        ) // Wait so that total time is ~1 second
      }
    }
  }
}

fetchAndSaveWeightData()

module.exports = { fetchAndSaveWeightData }
