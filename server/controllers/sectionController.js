const Section = require('../models/Section');



/**

 * GET ALL SECTIONS

 */

const getAllSections = async (req, res) => {

  try {

    const sections = await Section.find()

      .populate('department', 'name code')

      .sort({ department: 1, year: 1, name: 1 });



    console.log(`✅ Retrieved ${sections.length} sections`);



    return res.status(200).json({

      success: true,

      data: sections

    });

  } catch (error) {

    console.error('❌ Error fetching sections:', error);

    return res.status(500).json({

      success: false,

      message: 'Server error',

      error: error.message

    });

  }

};



/**

 * GET SECTIONS BY DEPARTMENT

 */

const getSectionsByDepartment = async (req, res) => {

  try {

    const { departmentId } = req.query;



    if (!departmentId) {

      return res.status(400).json({

        success: false,

        message: 'Department ID is required'

      });

    }



    // MODIFIED: Filter out 1st year sections (year > 1)

    const sections = await Section.find({ department: departmentId, year: { $gt: 1 } })

      .populate('department', 'name code')

      .sort({ year: 1, cycle: 1, name: 1 });



    console.log(`✅ Retrieved ${sections.length} sections for department ${departmentId}`);



    // Group sections by year and cycle for better frontend handling

    const grouped = {};

    sections.forEach(section => {

      const yearKey = `Year ${section.year}`;

      if (!grouped[yearKey]) {

        grouped[yearKey] = {

          physics: [],

          chemistry: [],

          regular: []

        };

      }



      if (section.cycle === 'Physics') {

        grouped[yearKey].physics.push(section);

      } else if (section.cycle === 'Chemistry') {

        grouped[yearKey].chemistry.push(section);

      } else {

        grouped[yearKey].regular.push(section);

      }

    });



    return res.status(200).json({

      success: true,

      data: sections,

      grouped: grouped

    });

  } catch (error) {

    console.error('❌ Error fetching sections by department:', error);

    return res.status(500).json({

      success: false,

      message: 'Server error',

      error: error.message

    });

  }

};



/**

 * CREATE SECTION

 */

const createSection = async (req, res) => {

  try {

    const { name, department, year, cycle, capacity } = req.body;



    if (!name || !department || !year) {

      return res.status(400).json({

        success: false,

        message: 'Name, department, and year are required'

      });

    }



    // Check if section already exists

    const existingSection = await Section.findOne({ name, department });

    if (existingSection) {

      return res.status(400).json({

        success: false,

        message: 'Section with this name already exists in this department'

      });

    }



    const section = await Section.create({

      name,

      department,

      year,

      cycle: cycle || null,

      capacity: capacity || 60

    });



    console.log(`✅ Created section: ${name}`);



    return res.status(201).json({

      success: true,

      data: section,

      message: 'Section created successfully'

    });

  } catch (error) {

    console.error('❌ Error creating section:', error);

    return res.status(500).json({

      success: false,

      message: 'Server error',

      error: error.message

    });

  }

};



/**

 * UPDATE SECTION

 */

const updateSection = async (req, res) => {

  try {

    const { id } = req.params;

    const { name, year, cycle, capacity } = req.body;



    const section = await Section.findByIdAndUpdate(

      id,

      { name, year, cycle, capacity },

      { new: true, runValidators: true }

    );



    if (!section) {

      return res.status(404).json({

        success: false,

        message: 'Section not found'

      });

    }



    console.log(`✅ Updated section: ${section.name}`);



    return res.status(200).json({

      success: true,

      data: section,

      message: 'Section updated successfully'

    });

  } catch (error) {

    console.error('❌ Error updating section:', error);

    return res.status(500).json({

      success: false,

      message: 'Server error',

      error: error.message

    });

  }

};



/**

 * DELETE SECTION

 */

const deleteSection = async (req, res) => {

  try {

    const { id } = req.params;



    const section = await Section.findByIdAndDelete(id);



    if (!section) {

      return res.status(404).json({

        success: false,

        message: 'Section not found'

      });

    }



    console.log(`✅ Deleted section: ${section.name}`);



    return res.status(200).json({

      success: true,

      message: 'Section deleted successfully'

    });

  } catch (error) {

    console.error('❌ Error deleting section:', error);

    return res.status(500).json({

      success: false,

      message: 'Server error',

      error: error.message

    });

  }

};



module.exports = {

  getAllSections,

  getSectionsByDepartment,

  createSection,

  updateSection,

  deleteSection

};