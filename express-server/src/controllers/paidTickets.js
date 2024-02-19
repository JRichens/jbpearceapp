const { connectDB } = require(`../../db`)

const getPaidTickets = async (req, res) => {
  console.log("paidTickets GET statement working")
  try {
    const connection = await connectDB()
    console.log("From: ", req.query.from)
    console.log("To: ", req.query.to)
    if (req.query.from > 40000 && req.query.to > 40000) {
      const data = await connection?.query(
        `SELECT TOP 100 number17,ticket2,string9,string8,string7,string4,number16,number6,logical27 
        FROM move 
        WHERE state = 2 
        AND number17 >= ${req.query.from}
        AND number17 <= ${req.query.to}
        AND logical22 = 1 
        AND logical27 = 0
        AND string4 NOT LIKE 'CHEQUE'
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

const updatePaidTicket = async (req, res) => {
  console.log(
    "paidTickets PUT statement",
    req.query.ticketNo,
    req.query.reconcile
  )

  if (!req.query.ticketNo) {
    return
  } else {
    try {
      const connection = await connectDB()
      const data = await connection?.query(
        `UPDATE move SET logical27 = ${req.query.reconcile} WHERE ticket2 = ${req.query.ticketNo}`
      )

      res.status(200).json(data)
    } catch (err) {
      res.status(500).send(err)
      console.log(err, "Request failed")
    }
  }
}

module.exports = {
  getPaidTickets,
  updatePaidTicket,
}
