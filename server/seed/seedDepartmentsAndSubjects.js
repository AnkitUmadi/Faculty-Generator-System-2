const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const Subject = require('../models/Subject');

// ✅ THIS MUST MATCH YOUR constants/subjects.js EXACTLY
const DEPARTMENTS_AND_SUBJECTS = [
  {
    departmentName: 'Computer Science Engineering (CSE)',
    departmentCode: 'CSE',
    subjects: [
      { code: 'DSA', name: 'Data Structures & Algorithms' },
      { code: 'OS', name: 'Operating Systems' },
      { code: 'DBMS', name: 'Database Management Systems' },
      { code: 'CN', name: 'Computer Networks' },
      { code: 'SE', name: 'Software Engineering' },
      { code: 'AI', name: 'Artificial Intelligence' },
      { code: 'ML', name: 'Machine Learning' },
      { code: 'COA', name: 'Computer Organization & Architecture' },
      { code: 'CD', name: 'Compiler Design' },
      { code: 'DS', name: 'Distributed Systems' },
    ]
  },
  {
    departmentName: 'Electronics & Communication Engineering (ECE)',
    departmentCode: 'ECE',
    subjects: [
      { code: 'DE', name: 'Digital Electronics' },
      { code: 'AE', name: 'Analog Electronics' },
      { code: 'VLSI', name: 'VLSI Design' },
      { code: 'DSP', name: 'Digital Signal Processing' },
      { code: 'EMFT', name: 'Electromagnetic Field Theory' },
      { code: 'CS-ECE', name: 'Control Systems' },
      { code: 'MIC', name: 'Microcontrollers & Microprocessors' },
    ]
  },
  {
    departmentName: 'Electrical Engineering (EE)',
    departmentCode: 'EE',
    subjects: [
      { code: 'NA', name: 'Network Analysis' },
      { code: 'PS', name: 'Power Systems' },
      { code: 'PE', name: 'Power Electronics' },
      { code: 'EM', name: 'Electrical Machines' },
      { code: 'CS-EE', name: 'Control Systems' },
      { code: 'HVE', name: 'High Voltage Engineering' },
    ]
  },
  {
    departmentName: 'Mechanical Engineering (ME)',
    departmentCode: 'ME',
    subjects: [
      { code: 'TOM', name: 'Theory of Machines' },
      { code: 'SOM', name: 'Strength of Materials' },
      { code: 'FM', name: 'Fluid Mechanics' },
      { code: 'HT', name: 'Heat Transfer' },
      { code: 'IC', name: 'Internal Combustion Engines' },
      { code: 'MD', name: 'Machine Design' },
      { code: 'CAM', name: 'Computer Aided Manufacturing' },
    ]
  }
];

async function seedDepartmentsAndSubjects() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Department.deleteMany({});
    await Subject.deleteMany({});
    console.log('🗑️  Cleared existing departments and subjects');

    // Seed departments and subjects
    for (const deptData of DEPARTMENTS_AND_SUBJECTS) {
      // Create department
      const department = await Department.create({
        name: deptData.departmentName,
        code: deptData.departmentCode
      });

      console.log(`✅ Created department: ${department.name}`);

      // Create subjects for this department
      for (const subjectData of deptData.subjects) {
        await Subject.create({
          code: subjectData.code,
          name: subjectData.name,
          department: department._id
        });

        console.log(`   ✅ Created subject: ${subjectData.code} - ${subjectData.name}`);
      }
    }

    console.log('\n🎉 Successfully seeded all departments and subjects!');
    console.log('\n📊 Summary:');
    console.log(`   Departments: ${DEPARTMENTS_AND_SUBJECTS.length}`);
    console.log(`   Total Subjects: ${DEPARTMENTS_AND_SUBJECTS.reduce((acc, d) => acc + d.subjects.length, 0)}`);

    // Verify by counting
    const deptCount = await Department.countDocuments();
    const subjectCount = await Subject.countDocuments();
    console.log(`\n✅ Verification:`);
    console.log(`   Departments in DB: ${deptCount}`);
    console.log(`   Subjects in DB: ${subjectCount}`);

    // List all subject codes
    const allSubjects = await Subject.find().select('code name');
    console.log(`\n📋 All Subject Codes in Database:`);
    allSubjects.forEach(s => console.log(`   - ${s.code}: ${s.name}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDepartmentsAndSubjects();