// 
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, optional: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "gabai", "admin"], default: "user" },
  donations: [
    { 
      amount: { type: Number, required: true }, 
      date: { type: Date, default: Date.now }, 
      status: { type: String, enum: ["שולם", "טרם שולם"], default: "טרם שולם" } 
    }
  ],
  totalDonated: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  totalOwed: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  monthlyDonations: { // שדה חדש עבור תרומות לפי חודשים
    ינואר: { type: Number, default: 0 },
    פבואר: { type: Number, default: 0 },
    מרץ: { type: Number, default: 0 },
    אפריל: { type: Number, default: 0 },
    מאי: { type: Number, default: 0 },
    יוני: { type: Number, default: 0 },
    יולי: { type: Number, default: 0 },
    אוגוסט: { type: Number, default: 0 },
    ספטמבר: { type: Number, default: 0 },
    אוקטובר: { type: Number, default: 0 },
    נובמבר: { type: Number, default: 0 },
    דצמבר: { type: Number, default: 0 },
  }
}, { timestamps: true });

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
