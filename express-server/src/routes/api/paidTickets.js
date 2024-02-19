const express = require("express")
const router = express.Router()
const paidTicketsController = require("../../controllers/paidTickets")

router
  .route("/")
  .get(paidTicketsController.getPaidTickets)
  .put(paidTicketsController.updatePaidTicket)

module.exports = router
