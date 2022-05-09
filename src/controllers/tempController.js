const temp = (req, res) => {
  res.send({msg: req.tempData})
}

module.exports = {temp};