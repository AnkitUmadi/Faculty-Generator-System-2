const Faculty = require('../models/Faculty');
const Subject = require('../models/Subject');

/**
 * GET ALL FACULTY
 */
const getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find()
      .populate('subject')
      .populate('department')
      .populate('sections');

    console.log(`✅ Retrieved ${faculty.length} faculty members`);

    return res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('❌ Error fetching faculty:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * GET FACULTY BY ID
 */
const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findById(id)
      .populate('subject')
      .populate('department')
      .populate('sections');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    console.error('❌ Error fetching faculty by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * CREATE FACULTY
 */
const createFaculty = async (req, res) => {
  try {
    const { name, subjectCode, sections, availability } = req.body;

    console.log('📥 Received faculty creation request:', { name, subjectCode, sections, availability });

    // Validation
    if (!name || !subjectCode || !sections || !availability) {
      return res.status(400).json({
        success: false,
        message: 'Name, subject, sections, and availability are required'
      });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one section must be selected'
      });
    }

    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one availability slot is required'
      });
    }

    // Find subject by code
    const subject = await Subject.findOne({ code: subjectCode }).populate('department');
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with code "${subjectCode}" not found`
      });
    }

    console.log('✅ Found subject:', subject.name, 'Department:', subject.department.name);

    // Create faculty
    const faculty = await Faculty.create({
      name: name.trim(),
      subject: subject._id,
      department: subject.department._id,
      sections: sections, // Array of section IDs
      availability
    });

    // Populate the created faculty
    const populatedFaculty = await Faculty.findById(faculty._id)
      .populate('subject')
      .populate('department')
      .populate('sections');

    console.log('✅ Faculty created successfully:', populatedFaculty.name);

    return res.status(201).json({
      success: true,
      data: populatedFaculty,
      message: 'Faculty created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating faculty:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * UPDATE FACULTY
 */
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subjectCode, sections, availability } = req.body;

    console.log('📥 Received faculty update request:', { id, name, subjectCode, sections, availability });

    // Validation
    if (!name || !subjectCode || !sections || !availability) {
      return res.status(400).json({
        success: false,
        message: 'Name, subject, sections, and availability are required'
      });
    }

    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one section must be selected'
      });
    }

    // Find subject by code
    const subject = await Subject.findOne({ code: subjectCode }).populate('department');
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: `Subject with code "${subjectCode}" not found`
      });
    }

    // Update faculty
    const faculty = await Faculty.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        subject: subject._id,
        department: subject.department._id,
        sections: sections,
        availability
      },
      { new: true, runValidators: true }
    )
      .populate('subject')
      .populate('department')
      .populate('sections');

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    console.log('✅ Faculty updated successfully:', faculty.name);

    return res.status(200).json({
      success: true,
      data: faculty,
      message: 'Faculty updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating faculty:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * DELETE FACULTY
 */
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;

    const faculty = await Faculty.findByIdAndDelete(id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    console.log('✅ Faculty deleted successfully:', faculty.name);

    return res.status(200).json({
      success: true,
      message: 'Faculty deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting faculty:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
};