const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    academicYear: {
      type: String,
      required: true,
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year']
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4
    },
    cycle: {
      type: String,
      enum: ['Physics', 'Chemistry', null],
      default: null
    },
    capacity: {
      type: Number,
      default: 60
    }
  },
  { 
    timestamps: true 
  }
);

// Compound index to ensure unique sections per department
sectionSchema.index({ code: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);