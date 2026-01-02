const express = require('express');
const router = express.Router();
const {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty
} = require('../controllers/facultyController');

// GET all faculty
router.get('/', getAllFaculty);

// GET faculty by ID
router.get('/:id', getFacultyById);

// POST create new faculty
router.post('/', createFaculty);

// PUT update faculty
router.put('/:id', updateFaculty);

// DELETE faculty
router.delete('/:id', deleteFaculty);

module.exports = router;