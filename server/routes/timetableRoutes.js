const express = require('express');
const router = express.Router();
const {
  generateTimetableForDepartment,
  getTimetableByDepartment,
  deleteTimetable
} = require('../controllers/timetableController');

// POST /api/timetable/generate?departmentId=xxx
router.post('/generate', generateTimetableForDepartment);

// GET /api/timetable?departmentId=xxx
router.get('/', getTimetableByDepartment);

// DELETE /api/timetable?departmentId=xxx
router.delete('/', deleteTimetable);

module.exports = router;