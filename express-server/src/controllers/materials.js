const { connectDB } = require(`../../db`)

const getAllMaterials = async (req, res) => {
  try {
    const connection = await connectDB()
    const data = await connection?.query(
      "SELECT code,string24,number4,number5 FROM base WHERE file = 4 AND number4 > 0"
    )

    res.status(200).json(data)
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

const createNewMaterial = async (req, res) => {
  try {
    const connection = await connectDB()
    const data = await connection?.query("statement required")
    res.status(200).json(data)
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

const updateMaterial = async (req, res) => {
  try {
    const connection = await connectDB()
    const data = await connection?.query(`statement ${req.body.id}`)
    res.status(200).json(data)
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

const deleteMaterial = async (req, res) => {
  try {
    const connection = await connectDB()
    const data = await connection?.query(`statement ${req.body.id}`)
    res.status(200).json(data)
  } catch (err) {
    res.status(500).send(err)
    console.log(err, "Request failed")
  }
}

module.exports = {
  getAllMaterials,
  createNewMaterial,
  updateMaterial,
  deleteMaterial,
}
