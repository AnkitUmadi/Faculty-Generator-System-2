require("dotenv").config();
const mongoose = require("mongoose");

const Faculty = require("../models/Faculty");
const Subject = require("../models/Subject");
const Department = require("../models/Department");

const MONGO_URI = process.env.MONGO_URI;

const migrate = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    const subjects = await Subject.find().populate("department");
    const subjectMap = {};

    subjects.forEach((s) => {
      subjectMap[s.code] = {
        subjectId: s._id,
        departmentId: s.department._id,
      };
    });

    const facultyList = await Faculty.find();
    console.log(`Found ${facultyList.length} faculty records`);

    for (const faculty of facultyList) {
      // Already migrated
      if (mongoose.isValidObjectId(faculty.subject)) {
        continue;
      }

      const subjectCode = faculty.subject?.toUpperCase();

      if (!subjectMap[subjectCode]) {
        console.warn(
          `Skipping ${faculty.name}: subject "${faculty.subject}" not found`
        );
        continue;
      }

      faculty.subject = subjectMap[subjectCode].subjectId;
      faculty.department = subjectMap[subjectCode].departmentId;

      await faculty.save();
      console.log(`Migrated faculty: ${faculty.name}`);
    }

    console.log("Faculty migration completed");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrate();
