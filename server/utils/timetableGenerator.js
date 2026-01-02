const Faculty = require('../models/Faculty');
const Settings = require('../models/Settings');
const mongoose = require('mongoose');

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

/**
 * Generate timetable for a specific department and section
 */
const generateTimetable = async (departmentId, sectionId) => {
  try {
    // ✅ CRITICAL FIX: Ensure departmentId is a valid ObjectId
    let deptId;
    
    if (typeof departmentId === 'object') {
      console.log('⚠️ Received object instead of ID, extracting _id');
      deptId = departmentId._id || departmentId;
    } else {
      deptId = departmentId;
    }
    
    // Convert to string if it's an ObjectId
    if (deptId && deptId.toString) {
      deptId = deptId.toString();
    }

    console.log(`\n🎯 Generating timetable for department ID: ${deptId}, section ID: ${sectionId}`);

    // Fetch settings to get number of periods
    const settings = await Settings.findOne({ singleton: true });
    const numberOfPeriods = settings?.numberOfPeriods || 5;
    const PERIODS = Array.from({ length: numberOfPeriods }, (_, i) => i + 1);

    console.log(`📊 Number of periods: ${numberOfPeriods}`);
    console.log(`⏰ Working hours: ${settings?.workingHours?.startTime} - ${settings?.workingHours?.endTime}`);
    console.log(`⏱️ Period duration: ${settings?.periodDuration} minutes`);

    // ✅ CRITICAL FIX: Fetch faculty using the correct department ID
    const facultyList = await Faculty.find({ 
      department: deptId  // Just use the string ID directly
    })
      .populate('subject')
      .populate('department');

    console.log(`👥 Found ${facultyList.length} faculty members`);
    
    if (facultyList.length > 0) {
      console.log('Faculty list:');
      facultyList.forEach(f => {
        console.log(`  - ${f.name} (${f.subject?.name}) - Dept: ${f.department?.name}`);
      });
    }

    if (facultyList.length === 0) {
      console.log('❌ No faculty found for this department');
      return null;
    }

    // Initialize empty timetable
    const timetable = {};
    DAYS.forEach(day => {
      timetable[day] = {};
      PERIODS.forEach(period => {
        timetable[day][period] = null;
      });
    });

    // Track faculty usage to distribute evenly
    const facultyUsage = {};
    facultyList.forEach(f => {
      facultyUsage[f._id.toString()] = 0;
    });

    // Fill timetable
    DAYS.forEach(day => {
      PERIODS.forEach(period => {
        // Get available faculty for this day and period
        const availableFaculty = facultyList.filter(f => {
          const dayAvailability = f.availability.find(a => a.day === day);
          return dayAvailability && dayAvailability.periods.includes(period);
        });

        if (availableFaculty.length > 0) {
          // Sort by usage (least used first)
          availableFaculty.sort((a, b) => 
            facultyUsage[a._id.toString()] - facultyUsage[b._id.toString()]
          );

          // Pick the least used faculty
          const selectedFaculty = availableFaculty[0];
          
          timetable[day][period] = {
            facultyId: selectedFaculty._id,
            facultyName: selectedFaculty.name,
            subjectId: selectedFaculty.subject._id,
            subjectName: selectedFaculty.subject.name,
            subjectCode: selectedFaculty.subject.code
          };

          // Increment usage
          facultyUsage[selectedFaculty._id.toString()]++;
        }
      });
    });

    console.log('✅ Timetable generated successfully');
    console.log('📊 Faculty usage:', facultyUsage);
    
    // Log filled slots
    let filledSlots = 0;
    DAYS.forEach(day => {
      PERIODS.forEach(period => {
        if (timetable[day][period]) filledSlots++;
      });
    });

    console.log(`📈 Filled ${filledSlots} out of ${DAYS.length * numberOfPeriods} slots`);

    return timetable;

  } catch (error) {
    console.error('❌ Error generating timetable:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
};

module.exports = { generateTimetable };