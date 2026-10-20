const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    salary: {
      type: Number,
      required: true,
      min: 0
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    date_of_joining: {
      type: Date,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      immutable: true,
      index: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);