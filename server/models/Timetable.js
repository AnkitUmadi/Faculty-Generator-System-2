const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    },
    timetable: {
      type: Object,
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique timetable per department-section combination
timetableSchema.index({ department: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);