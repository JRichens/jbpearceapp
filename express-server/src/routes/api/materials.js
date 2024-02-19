const express = require("express")
const router = express.Router()
const employeesController = require("../../controllers/materials")

router
  .route("/")
  .get(employeesController.getAllMaterials)
  .post(employeesController.createNewMaterial)
  .put(employeesController.updateMaterial)
  .delete(employeesController.deleteMaterial)

module.exports = router
