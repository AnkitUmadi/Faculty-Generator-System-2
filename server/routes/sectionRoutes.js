const express = require('express');
const router = express.Router();
const {
  getAllSections,
  getSectionsByDepartment,
  createSection,
  updateSection,
  deleteSection
} = require('../controllers/sectionController');

// GET /api/sections?departmentId=xxx (with optional query param)
router.get('/', (req, res) => {
  if (req.query.departmentId) {
    return getSectionsByDepartment(req, res);
  }
  return getAllSections(req, res);
});

// POST /api/sections
router.post('/', createSection);

// PUT /api/sections/:id
router.put('/:id', updateSection);

// DELETE /api/sections/:id
router.delete('/:id', deleteSection);

module.exports = router;