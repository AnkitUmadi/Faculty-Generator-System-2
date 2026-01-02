const express = require("express");
const router = express.Router();
const Department = require("../models/Department");

router.get("/", async (req, res) => {
  try {
    const departments = await Department.find();
    res.json({
      success: true,
      data: departments,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
