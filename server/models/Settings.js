const mongoose = require('mongoose');

/**
 * Break Time Schema
 */
const breakTimeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  }
});

/**
 * Settings Schema (Singleton)
 */
const settingsSchema = new mongoose.Schema(
  {
    workingHours: {
      startTime: {
        type: String,
        required: true,
        default: '9:00 AM'
      },
      endTime: {
        type: String,
        required: true,
        default: '5:00 PM'
      }
    },

    periodDuration: {
      type: Number,
      required: true,
      default: 60,
      min: 30,
      max: 120
    },

    numberOfPeriods: {
      type: Number,
      required: true,
      default: 5,
      min: 1,
      max: 9
    },

    breakTimes: {
      type: [breakTimeSchema],
      default: [
        {
          name: 'Lunch Break',
          startTime: '1:00 PM',
          endTime: '2:00 PM',
          enabled: true
        },
        {
          name: 'Short Break',
          startTime: '11:00 AM',
          endTime: '11:15 AM',
          enabled: false
        }
      ]
    },

    // Singleton enforcement
    singleton: {
      type: Boolean,
      default: true,
      unique: true
    }
  },
  { timestamps: true }
);

/**
 * ✅ Singleton Guard (FIXED)
 * - async → NO next()
 * - throw Error to abort save
 */
settingsSchema.pre('save', async function () {
  if (!this.isNew) return;

  const existing = await mongoose.model('Settings').countDocuments();
  if (existing > 0) {
    throw new Error('Settings document already exists');
  }
});

module.exports = mongoose.model('Settings', settingsSchema);
