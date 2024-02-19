const express = require("express")
const router = express.Router()
const unPaidTicketsController = require("../../controllers/unPaidTickets")

router
  .route("/")
  .get(unPaidTicketsController.getUnPaidTickets)
  .put(unPaidTicketsController.updateUnPaidTicket)

module.exports = router
