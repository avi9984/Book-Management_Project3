const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const {
  checkData,
  validTitle,
  validString,
  validMobileNum,
  validEmail,
  validPwd,
} = require("../utils/validation");
const userModel = require("../models/userModel");

const createUser = async (req, res) => {
  try {
    let data = req.body;
    if (checkData(data))
      return res
        .status(400)
        .send({ status: false, message: "Enter user details" });

    if (!data.title)
      return res
        .status(400)
        .send({ status: false, message: "Title is required" });
    if (!data.name)
      return res
        .status(400)
        .send({ status: false, message: "Name is required" });
    if (!data.phone)
      return res
        .status(400)
        .send({ status: false, message: "Mobile number is required" });
    if (!data.email)
      return res
        .status(400)
        .send({ status: false, message: "Email ID is required" });
    if (!data.password)
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });

    if (validTitle(data.title))
      return res.status(400).send({
        status: false,
        message: "Title should be one of Mr, Mrs or Miss",
      });
    if (validString(data.name))
      return res.status(400).send({
        status: false,
        message: "Name should be valid and should not contains any numbers",
      });
    if (validMobileNum(data.phone))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid phone number" });
    if (validEmail(data.email))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid email-id" });
    if (validPwd(data.password))
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid password" });

    let checkUniqueValues = await User.findOne({
      $or: [{ phone: data.phone }, { email: data.email }],
    });
    if (checkUniqueValues)
      return res.status(400).send({
        status: false,
        message: "E-Mail or phone number already exist",
      });

    data.password = await bcrypt.hash(data.password, 10);

    let userData = await User.create(data);
    res.status(201).send({
      status: true,
      message: "User created succssfully",
      data: userData,
    });
  } catch (err) {
    res.status(500).send({ status: false, error: err.message });
  }
};

const userLogin = async function (req, res) {
  try {
    let email = req.body.email;
    let password = req.body.password;
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Email ID is required" });
    }
    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required" });
    }

    const checkValidUser = await User.findOne({
      email: email,
      password: password,
    });

    if (!checkValidUser) {
      return res
        .status(400)
        .send({ status: false, msg: "email or password is not correct" });
    } else {
      const token = jwt.sign(
        { userId: checkValidUser._id.toString() },
        "Books-Management",
        { expiresIn: "1d" }
      );
      return res
        .status(200)
        .send({ status: true, msg: "Successfully Login", data: token });
    }
  } catch (err) {
    return res.status(500).send({ msg: err.message });
  }
};

module.exports = { createUser, userLogin };
