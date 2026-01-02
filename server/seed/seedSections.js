const mongoose = require('mongoose');
require('dotenv').config();

const Department = require('../models/Department');
const Section = require('../models/Section');

const seedSections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing sections
    await Section.deleteMany({});
    console.log('🗑️  Cleared existing sections');

    // Get all departments
    const departments = await Department.find();
    console.log(`📊 Found ${departments.length} departments`);

    const allSections = [];

    for (const department of departments) {
      console.log(`\n🏫 Creating sections for ${department.name}...`);

      // ============================================
      // 1ST YEAR: 12 SECTIONS (6 Physics + 6 Chemistry)
      // ============================================
      
      // Physics Cycle Sections (P1-P6)
      const physicsSections = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'];
      for (const sectionCode of physicsSections) {
        const section = {
          code: sectionCode,
          name: `${sectionCode} - 1st Year - Physics Cycle`,
          department: department._id,
          academicYear: '1st Year',
          year: 1,
          cycle: 'Physics',
          capacity: 60
        };
        allSections.push(section);
        console.log(`   ✅ Created: ${sectionCode} - 1st Year - Physics Cycle`);
      }

      // Chemistry Cycle Sections (C1-C6)
      const chemistrySections = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
      for (const sectionCode of chemistrySections) {
        const section = {
          code: sectionCode,
          name: `${sectionCode} - 1st Year - Chemistry Cycle`,
          department: department._id,
          academicYear: '1st Year',
          year: 1,
          cycle: 'Chemistry',
          capacity: 60
        };
        allSections.push(section);
        console.log(`   ✅ Created: ${sectionCode} - 1st Year - Chemistry Cycle`);
      }

      // ============================================
      // 2ND YEAR: 12 SECTIONS (2A-2L)
      // Using prefix "2" to avoid conflict with C2
      // ============================================
      const secondYearSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (const letter of secondYearSections) {
        const sectionCode = `2${letter}`; // Changed from A2 to 2A
        const section = {
          code: sectionCode,
          name: `${sectionCode} - 2nd Year`,
          department: department._id,
          academicYear: '2nd Year',
          year: 2,
          cycle: null,
          capacity: 60
        };
        allSections.push(section);
        console.log(`   ✅ Created: ${sectionCode} - 2nd Year`);
      }

      // ============================================
      // 3RD YEAR: 12 SECTIONS (3A-3L)
      // ============================================
      const thirdYearSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (const letter of thirdYearSections) {
        const sectionCode = `3${letter}`; // Changed from A3 to 3A
        const section = {
          code: sectionCode,
          name: `${sectionCode} - 3rd Year`,
          department: department._id,
          academicYear: '3rd Year',
          year: 3,
          cycle: null,
          capacity: 60
        };
        allSections.push(section);
        console.log(`   ✅ Created: ${sectionCode} - 3rd Year`);
      }

      // ============================================
      // 4TH YEAR: 12 SECTIONS (4A-4L)
      // ============================================
      const fourthYearSections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      for (const letter of fourthYearSections) {
        const sectionCode = `4${letter}`; // Changed from A4 to 4A
        const section = {
          code: sectionCode,
          name: `${sectionCode} - 4th Year`,
          department: department._id,
          academicYear: '4th Year',
          year: 4,
          cycle: null,
          capacity: 60
        };
        allSections.push(section);
        console.log(`   ✅ Created: ${sectionCode} - 4th Year`);
      }
    }

    // Insert all sections
    await Section.insertMany(allSections);
    
    console.log(`\n🎉 Successfully created ${allSections.length} sections!`);
    console.log(`\n📊 Breakdown per department:`);
    console.log(`   • 1st Year: 12 sections (P1-P6 Physics, C1-C6 Chemistry)`);
    console.log(`   • 2nd Year: 12 sections (2A-2L)`);
    console.log(`   • 3rd Year: 12 sections (3A-3L)`);
    console.log(`   • 4th Year: 12 sections (4A-4L)`);
    console.log(`   • Total: 48 sections per department`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error seeding sections:', error);
    process.exit(1);
  }
};

seedSections();