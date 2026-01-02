const Timetable = require('../models/Timetable');
const { generateTimetable } = require('../utils/timetableGenerator');

/**
 * GENERATE TIMETABLE
 */
const generateTimetableForDepartment = async (req, res) => {
  try {
    const { departmentId, sectionId } = req.query;

    console.log('\n🎯 Generate Timetable Request');
    console.log('Received departmentId:', departmentId);
    console.log('Received sectionId:', sectionId);

    if (!departmentId) {
      console.log('❌ No department ID provided');
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }

    if (!sectionId) {
      console.log('❌ No section ID provided');
      return res.status(400).json({
        success: false,
        message: 'Section ID is required'
      });
    }

    console.log('✅ Using department ID:', departmentId);
    console.log('✅ Using section ID:', sectionId);

    // Generate timetable using the utility function
    console.log('📊 Calling timetable generator...');
    const generatedTimetable = await generateTimetable(departmentId, sectionId);

    if (!generatedTimetable) {
      console.log('❌ No timetable generated (no faculty found)');
      return res.status(404).json({
        success: false,
        message: 'No faculty found for this department. Please add faculty members first.'
      });
    }

    console.log('✅ Timetable generated successfully');

    // Save or update timetable in database
    let timetableDoc = await Timetable.findOne({ 
      department: departmentId,
      section: sectionId 
    });

    if (timetableDoc) {
      console.log('📝 Updating existing timetable document');
      timetableDoc.timetable = generatedTimetable;
      await timetableDoc.save();
    } else {
      console.log('📝 Creating new timetable document');
      timetableDoc = await Timetable.create({
        department: departmentId,
        section: sectionId,
        timetable: generatedTimetable
      });
    }

    console.log('✅ Timetable saved to database');

    return res.status(200).json({
      success: true,
      data: timetableDoc,
      message: 'Timetable generated successfully'
    });

  } catch (error) {
    console.error('❌ Error in generateTimetableForDepartment:', error);
    console.error('Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET TIMETABLE FOR DEPARTMENT
 */
const getTimetableByDepartment = async (req, res) => {
  try {
    const { departmentId, sectionId } = req.query;

    console.log('\n📖 Get Timetable Request');
    console.log('Department ID:', departmentId);
    console.log('Section ID:', sectionId);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }

    if (!sectionId) {
      return res.status(400).json({
        success: false,
        message: 'Section ID is required'
      });
    }

    const timetable = await Timetable.findOne({ 
      department: departmentId,
      section: sectionId
    })
      .populate('department')
      .populate('section');

    if (!timetable) {
      console.log('❌ No timetable found for this department-section combination');
      return res.status(404).json({
        success: false,
        message: 'No timetable found for this section. Please generate one first.'
      });
    }

    console.log('✅ Timetable retrieved');

    return res.status(200).json({
      success: true,
      data: timetable
    });

  } catch (error) {
    console.error('❌ Error in getTimetableByDepartment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * DELETE TIMETABLE
 */
const deleteTimetable = async (req, res) => {
  try {
    const { departmentId } = req.query;

    console.log('\n🗑️ Delete Timetable Request');
    console.log('Department ID:', departmentId);

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Department ID is required'
      });
    }

    const result = await Timetable.deleteOne({ department: departmentId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No timetable found to delete'
      });
    }

    console.log('✅ Timetable deleted');

    return res.status(200).json({
      success: true,
      message: 'Timetable deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error in deleteTimetable:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  generateTimetableForDepartment,
  getTimetableByDepartment,
  deleteTimetable
};