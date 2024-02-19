const { connectDB } = require(`../../db`)

const getUnPaidTickets = async (req, res) => {
  console.log("tradingAccPay GET")
  try {
    const connection = await connectDB()
    if (req.query.from > 40000 && req.query.to > 40000) {
      const data = await connection?.query(
        `SELECT number17,ticket2,string9,string8,string7,string4,number16,number6,logical22,string5,number1 
        FROM move 
        WHERE state = 2 
        AND number17 >= ${req.query.from}
        AND number17 <= ${req.query.to}
        AND logical22 = 0 
        AND logical13 = 0
        AND string4 = 'BACS'
        ORDER BY ticket2 DESC`
      )
      // total the payable number6
      const total = data.reduce((a, b) => a + b.number6, 0)
      if (req.query.total) {
        res.status(200).json(total)
      } else {
        res.status(200).json(data)
      }
    } else {
      res.status(200).json([])
    }
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

const updateUnPaidTicket = async (req, res) => {
  console.log(
    "paidTickets PUT statement",
    req.query.ticketNo,
    req.query.paid,
    req.query.initials,
    req.query.date
  )

  if (!req.query.ticketNo) {
    return
  } else {
    try {
      const connection = await connectDB()
      const data = await connection?.query(
        `UPDATE move SET logical22 = '${req.query.paid}', string5 = '${req.query.initials}', number1 = '${req.query.date}', string4 = 'TRADING ACCOUNT BANK SCO' WHERE ticket2 = ${req.query.ticketNo}`
      )

      res.status(200).json(data)
    } catch (err) {
      res.status(500).send(err)
      console.log(err, "Request failed")
    }
  }
}

module.exports = {
  getUnPaidTickets,
  updateUnPaidTicket,
}
