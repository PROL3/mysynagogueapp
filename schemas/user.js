const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, optional: true, sparse: true }, // Sparse מאפשר ערכים ריקים
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "gabai", "admin"], default: "user" },
  donations: [
    { 
      amount: { type: Number }, 
      date: { type: Date, default: Date.now }, 
      status: { type: String, enum: ["שולם", "לא שולם"], default: "לא שולם" } 
    }
  ],
  totalDonated: { type: Number, default: 0.0 },
  totalOwed: { type: Number, default: 0.0 },   
  monthlyDonations: { 
    ינואר: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" }
 
    },
    פברואר: { 
      amount: { type: Number, default: 0.0 }, 
      owed: { type: Number, default: 0.0 },  
 
      status: { type: String, default: "לא שולם" } 
    },
    מרץ: { 
      amount: { type: Number, default: 0.0 }, 
      owed: { type: Number, default: 0.0 },  
 
      status: { type: String, default: "לא שולם" } 
    },
    אפריל: { 
      owed: { type: Number, default: 0.0 },  

      amount: { type: Number, default: 0.0 },  
      status: { type: String, default: "לא שולם" } 
    },
    מאי: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    יוני: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    יולי: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    אוגוסט: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    ספטמבר: { 
      amount: { type: Number, default: 0.0 },   
           owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    אוקטובר: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    נובמבר: { 
      amount: { type: Number, default: 0.0 },   
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    },
    דצמבר: { 
      amount: { type: Number, default: 0.0 },  
      owed: { type: Number, default: 0.0 },  

      status: { type: String, default: "לא שולם" } 
    }
  },
  deviceToken: { type: String, required: false, optional: true }
}, { timestamps: true });

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
