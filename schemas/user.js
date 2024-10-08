const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true,  unique: true, },
  phoneNumber: { type: String, optional: true ,unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "gabai", "admin"], default: "user" },
  donations: [{ amount: { type: Number, required: true }, date: { type: Date, default: Date.now }, status: { type: String, enum: ["שולם", "טרם שולם"], default: "טרם שולם" } }],
  totalDonated: { type: Number, default: 0 }, // Total amount donated
  totalOwed: { type: Number, default: 0 }, // Total amount owed
  
},{ timestamps: true });

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
