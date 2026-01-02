const Subject = require("../models/Subject");
const Department = require("../models/Department");

// GET /api/subjects
const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().populate("department");

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllSubjects,
};
