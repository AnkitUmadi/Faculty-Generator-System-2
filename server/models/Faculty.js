const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  periods: {
    type: [Number],
    required: true
  }
}, { _id: true });

const facultySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    sections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      required: true
    }],
    availability: {
      type: [availabilitySchema],
      required: true,
      validate: {
        validator: function(arr) {
          return arr && arr.length > 0;
        },
        message: 'At least one availability slot is required'
      }
    }
  },
  { 
    timestamps: true 
  }
);

// Index for efficient queries
facultySchema.index({ department: 1 });
facultySchema.index({ subject: 1 });
facultySchema.index({ sections: 1 });

module.exports = mongoose.model('Faculty', facultySchema);