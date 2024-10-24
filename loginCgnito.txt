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
      status: { type: String, enum: ["שולם", "לא שולם"], default: "לא שולם" } 
    }
  ],
  totalDonated: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  totalOwed: { type: mongoose.Schema.Types.Decimal128, default: 0.0 }, // Change to Decimal128
  monthlyDonations: { 
    ינואר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } // "לא שולם" or "שולם"
    },
    פבואר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    מרץ: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    אפריל: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    מאי: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    יוני: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    יולי: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    אוגוסט: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    ספטמבר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    אוקטובר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    נובמבר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    },
    דצמבר: { 
      amount: { type: mongoose.Schema.Types.Decimal128, default: () => mongoose.Types.Decimal128.fromString('0.0') },
      status: { type: String, default: "לא שולם" } 
    }
  },
  deviceToken: { type: String, optional: true, unique: true } 
}, { timestamps: true });

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
