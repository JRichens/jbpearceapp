const express = require("express")
const router = express.Router()
const weighbridgeController = require("../../controllers/weighbridge")

router.route("/").get(weighbridgeController.getWeight)

module.exports = router
