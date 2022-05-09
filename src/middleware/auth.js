const jwt = require('jsonwebtoken');


const authentication = (req, res, next) => {
  try{
    let token = req.headers["x-Api-key"]; //getting token from header
    if (!token) {//if token is not present
      token = req.headers["x-api-key"];//getting token from header
    }

    if (!token) {
      return res.status(401).send({ status: false, msg: "Token must be present" });
    }

    let decodedToken = jwt.verify(token, "Books-Management"); //verifying token with secret key
    console.log(decodedToken);
    if (!decodedToken) return res.status(401).send({ status: false, msg: "Token is incorrect" });

    req.tempData = decodedToken;
    next(); 
  }
  catch (err){
    res.status(500).send({status: false, msg: err.message});
  }
}
module.exports = { authentication }