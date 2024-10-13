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
      amount: { type: Number }, 
      date: { type: Date, default: Date.now }, 
      status: { type: String, enum: ["שולם", "טרם שולם"], default: "טרם שולם" } 
    }
  ],
  totalDonated: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  totalOwed: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  monthlyDonations: { // שדה חדש עבור תרומות לפי חודשים
    ינואר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    פבואר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    מרץ: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    אפריל: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    מאי: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    יוני: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    יולי: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    אוגוסט: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    ספטמבר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    אוקטובר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    נובמבר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
    דצמבר: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
  }
}, { timestamps: true });

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
