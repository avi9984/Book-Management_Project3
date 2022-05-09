const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, enum: ['Mr', 'Mrs', 'Miss'] },
    name: { type:  String, required: true },
    phone: { type:  String, required: true, unique: true },
    email: { type:  String, required: true, unique: true, validate:{
      validator:function(email){
          return /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)
      }, msg: "Please fill a valid email address", isAsync: false 
      } },
    password: { type: String, required: true, validator:function(password){
      return /"^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,10}$/.test(password)
  }, msg: "Please fill a valid password", isAsync: false   
  },
    address: { street: { type:  String }, city: { type:  String }, pincode: { type:  String } }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);