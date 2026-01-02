const Settings = require('../models/Settings');

/**
 * GET SETTINGS
 */
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singleton: true });

    // Create default settings if none exist
    if (!settings) {
      settings = await Settings.create({
        singleton: true,
        workingHours: {
          startTime: '9:00 AM',
          endTime: '5:00 PM'
        },
        periodDuration: 60,
        numberOfPeriods: 6,
        breakTimes: [
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
      });

      console.log('✅ Created default settings');
    }

    return res.status(200).json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * UPDATE SETTINGS
 */
const updateSettings = async (req, res) => {
  try {
    const {
      workingHours,
      periodDuration,
      numberOfPeriods,
      breakTimes
    } = req.body;

    // Validation
    if (!workingHours?.startTime || !workingHours?.endTime) {
      return res.status(400).json({
        success: false,
        message: 'Working hours (start and end time) are required'
      });
    }

    if (periodDuration < 30 || periodDuration > 120) {
      return res.status(400).json({
        success: false,
        message: 'Period duration must be between 30 and 120 minutes'
      });
    }

    if (numberOfPeriods < 1 || numberOfPeriods > 9) {
      return res.status(400).json({
        success: false,
        message: 'Number of periods must be between 1 and 9'
      });
    }

    if (!Array.isArray(breakTimes)) {
      return res.status(400).json({
        success: false,
        message: 'Break times must be an array'
      });
    }

    let settings = await Settings.findOne({ singleton: true });

    if (!settings) {
      settings = new Settings({ singleton: true });
    }

    settings.workingHours = workingHours;
    settings.periodDuration = periodDuration;
    settings.numberOfPeriods = numberOfPeriods;
    settings.breakTimes = breakTimes;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('❌ Error updating settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * RESET SETTINGS
 */
const resetSettings = async (req, res) => {
  try {
    await Settings.deleteMany({});

    const defaultSettings = await Settings.create({
      singleton: true,
      workingHours: {
        startTime: '9:00 AM',
        endTime: '5:00 PM'
      },
      periodDuration: 60,
      numberOfPeriods: 6,
      breakTimes: [
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
    });

    return res.status(200).json({
      success: true,
      message: 'Settings reset to default',
      data: defaultSettings
    });

  } catch (error) {
    console.error('❌ Error resetting settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
