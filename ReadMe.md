# 🎓 Faculty Management & Timetable Generator

A comprehensive full-stack web application designed for educational institutions to manage faculty members and automatically generate optimized department-wise timetables with intelligent conflict resolution.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## ✨ Features

### 🎯 Core Functionality
- **Faculty Management System**
  - Add, edit, and delete faculty members
  - Associate faculty with subjects and departments
  - Track faculty availability by day and period (P1-P9)
  - Support for multiple departments (CSE, ECE, EE, ME)

- **Intelligent Timetable Generation**
  - Automatic timetable generation per department
  - Conflict-free scheduling algorithm
  - Fair distribution of faculty across time slots
  - Respects faculty availability preferences

- **Flexible Configuration**
  - Configurable working hours (e.g., 7:00 AM - 5:00 PM)
  - Adjustable period duration (30-120 minutes)
  - Dynamic number of periods (1-9 per day)
  - Multiple break time configurations (Lunch Break, Short Break)
  - Enable/disable break times as needed

### 📊 Additional Features
- **Real-time Validation**: Prevents scheduling conflicts and validates data integrity
- **PDF Export**: Print-ready timetable generation
- **Responsive Design**: Works seamlessly on desktop and tablet devices
- **Dynamic Period Display**: Faculty availability table adapts to configured period count
- **Department Segregation**: Complete isolation of departmental data

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (v18+) - UI library
- **React Router** (v6) - Client-side routing
- **React Select** - Enhanced dropdown components
- **Vanilla CSS** - Styling with inline styles

### Backend
- **Node.js** (v14+) - JavaScript runtime
- **Express.js** (v4) - Web application framework
- **MongoDB** (v4.4+) - NoSQL database
- **Mongoose** (v6) - MongoDB object modeling

### Development Tools
- **nodemon** - Auto-restart development server
- **dotenv** - Environment variable management
- **CORS** - Cross-origin resource sharing

---

## 📋 Prerequisites

Before running this application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14.0 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.4 or higher)
- npm (comes with Node.js) or yarn
- Git (for cloning the repository)

### System Requirements
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **OS**: Windows 10+, macOS 10.14+, or Linux

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/faculty-timetable-generator.git
cd faculty-timetable-generator
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

**Backend Dependencies:**
- express
- mongoose
- cors
- dotenv
- nodemon (dev dependency)

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

**Frontend Dependencies:**
- react
- react-dom
- react-router-dom
- react-select

### 4. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd ../server
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/faculty_timetable

# CORS Configuration
CLIENT_URL=http://localhost:3000
```

**For MongoDB Atlas (Cloud):**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/faculty_timetable?retryWrites=true&w=majority
```

### 5. Seed the Database

Populate the database with departments and subjects:

```bash
cd server
node seed/seedDepartmentsAndSubjects.js
```

**Expected Output:**
```
✅ Connected to MongoDB
🗑️  Cleared existing departments and subjects
✅ Created department: Computer Science Engineering (CSE)
   ✅ Created subject: DSA - Data Structures & Algorithms
   ✅ Created subject: OS - Operating Systems
   ...
🎉 Successfully seeded all departments and subjects!
```

---

## 🎮 Usage

### Starting the Application

#### Terminal 1 - Backend Server
```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

#### Terminal 2 - Frontend Application
```bash
cd client
npm start
```

Frontend will run on `http://localhost:3000`

### Default Access

Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📖 Configuration

### Application Settings

Navigate to **Settings** page to configure:

1. **Working Hours**
   - Start Time: e.g., `9:00 AM`
   - End Time: e.g., `5:00 PM`

2. **Period Configuration**
   - Minutes per period: `30-120 minutes`
   - Number of periods: `1-9 periods per day`

3. **Break Times**
   - Lunch Break: `1:00 PM - 2:00 PM` (enabled/disabled)
   - Short Break: `11:00 AM - 11:15 AM` (enabled/disabled)

**Note:** Faculty Management availability table automatically adapts to show the configured number of periods.

---

## 📁 Project Structure

```
faculty-timetable-generator/
│
├── client/                          # Frontend React Application
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/              # Reusable Components
│   │   │   └── Header.jsx           # Navigation header
│   │   │
│   │   ├── constants/               # Application Constants
│   │   │   └── subjects.js          # Subject definitions by department
│   │   │
│   │   ├── pages/                   # Page Components
│   │   │   ├── AdminDashboard.jsx   # Main dashboard
│   │   │   ├── FacultyManagement.jsx # Faculty CRUD operations
│   │   │   ├── TimetableView.jsx    # Timetable generation & display
│   │   │   ├── Reports.jsx          # Reporting module
│   │   │   └── Settings.jsx         # Application configuration
│   │   │
│   │   ├── App.js                   # Main app component
│   │   └── index.js                 # React entry point
│   │
│   └── package.json                 # Frontend dependencies
│
├── server/                          # Backend Node.js Application
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   │
│   ├── controllers/                 # Business Logic
│   │   ├── departmentController.js  # Department operations
│   │   ├── facultyController.js     # Faculty CRUD logic
│   │   ├── subjectController.js     # Subject operations
│   │   ├── timetableController.js   # Timetable generation
│   │   └── settingsController.js    # Settings management
│   │
│   ├── models/                      # Mongoose Schemas
│   │   ├── Department.js            # Department model
│   │   ├── Faculty.js               # Faculty model
│   │   ├── Subject.js               # Subject model
│   │   ├── Timetable.js             # Timetable model
│   │   └── Settings.js              # Settings model
│   │
│   ├── routes/                      # API Routes
│   │   ├── departmentRoutes.js      # /api/departments
│   │   ├── facultyRoutes.js         # /api/faculty
│   │   ├── subjectRoutes.js         # /api/subjects
│   │   ├── timetableRoutes.js       # /api/timetable
│   │   └── settingsRoutes.js        # /api/settings
│   │
│   ├── seed/                        # Database Seeding
│   │   ├── seedDepartmentsAndSubjects.js
│   │   └── migrateFacultySubjectDepartment.js
│   │
│   ├── utils/                       # Utility Functions
│   │   └── timetableGenerator.js    # Timetable generation algorithm
│   │
│   ├── .env.example                 # Environment template
│   ├── index.js                     # Server entry point
│   └── package.json                 # Backend dependencies
│
├── .gitignore                       # Git ignore rules
└── README.md                        # Project documentation
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 📚 Departments
```http
GET    /departments              # Get all departments
GET    /departments/:id          # Get department by ID
POST   /departments              # Create department
PUT    /departments/:id          # Update department
DELETE /departments/:id          # Delete department
```

#### 👨‍🏫 Faculty
```http
GET    /faculty                  # Get all faculty
GET    /faculty?departmentId=:id # Get faculty by department
POST   /faculty                  # Add new faculty
PUT    /faculty/:id              # Update faculty
DELETE /faculty/:id              # Delete faculty
```

**Request Body (POST/PUT):**
```json
{
  "name": "Dr. John Doe",
  "subjectCode": "DSA",
  "availability": [
    {
      "day": "Monday",
      "periods": [1, 2, 3]
    },
    {
      "day": "Tuesday",
      "periods": [4, 5]
    }
  ]
}
```

#### 📖 Subjects
```http
GET    /subjects                 # Get all subjects
GET    /subjects/:id             # Get subject by ID
POST   /subjects                 # Create subject
```

#### 📅 Timetable
```http
POST   /timetable/generate?departmentId=:id  # Generate timetable
GET    /timetable?departmentId=:id           # Get timetable
DELETE /timetable?departmentId=:id           # Delete timetable
```

#### ⚙️ Settings
```http
GET    /settings                 # Get current settings
PUT    /settings                 # Update settings
POST   /settings/reset           # Reset to default
```

**Settings Schema:**
```json
{
  "workingHours": {
    "startTime": "9:00 AM",
    "endTime": "5:00 PM"
  },
  "periodDuration": 60,
  "numberOfPeriods": 5,
  "breakTimes": [
    {
      "name": "Lunch Break",
      "startTime": "1:00 PM",
      "endTime": "2:00 PM",
      "enabled": true
    }
  ]
}
```

---

## 💾 Database Schema

### Faculty Collection
```javascript
{
  _id: ObjectId,
  name: String,
  subject: ObjectId (ref: Subject),
  department: ObjectId (ref: Department),
  availability: [
    {
      day: String,
      periods: [Number]
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### Subject Collection
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  department: ObjectId (ref: Department),
  createdAt: Date,
  updatedAt: Date
}
```

### Department Collection
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Timetable Collection
```javascript
{
  _id: ObjectId,
  department: ObjectId (ref: Department),
  timetable: {
    Monday: {
      1: {
        facultyId: ObjectId,
        facultyName: String,
        subjectId: ObjectId,
        subjectName: String,
        subjectCode: String
      },
      2: { ... },
      // ... up to period 9
    },
    Tuesday: { ... },
    // ... other days
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Settings Collection
```javascript
{
  _id: ObjectId,
  workingHours: {
    startTime: String,
    endTime: String
  },
  periodDuration: Number,
  numberOfPeriods: Number,
  breakTimes: [
    {
      name: String,
      startTime: String,
      endTime: String,
      enabled: Boolean
    }
  ],
  singleton: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 📸 Screenshots

### Admin Dashboard
The central hub for navigating to all modules.

### Faculty Management
- Add/Edit/Delete faculty members
- Set availability per day and period
- Dynamic period display based on settings

### Timetable View
- Select department
- Generate optimized timetable
- View schedule with break times
- Export to PDF

### Settings
- Configure working hours
- Set period duration (30-120 min)
- Configure number of periods (1-9)
- Manage break times

---

## 🎯 Key Features Explained

### Intelligent Timetable Algorithm

The timetable generator uses a **least-used-first** algorithm:

1. **Initialization**: Creates empty timetable grid (Days × Periods)
2. **Availability Check**: For each slot, finds faculty available at that time
3. **Fair Distribution**: Selects the least-used faculty to ensure equal workload
4. **Conflict Prevention**: Ensures no faculty is assigned to multiple periods simultaneously

### Dynamic Period Management

- Settings page allows 1-9 periods per day
- Faculty Management automatically shows correct number of columns
- Timetable adapts to display configured periods
- Break times are intelligently inserted between periods

### Data Relationships

```
Department ─── has many ──→ Subjects
                           └──→ Faculty
                           └──→ Timetable

Subject ─── belongs to ──→ Department
        └── has many ──→ Faculty

Faculty ─── belongs to ──→ Subject
        └── belongs to ──→ Department
        └── has ──→ Availability
```

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Add faculty with different availability patterns
- [ ] Generate timetable for each department
- [ ] Verify no conflicts in generated timetable
- [ ] Test with different period configurations (5, 7, 9 periods)
- [ ] Test with different break time settings
- [ ] Edit faculty and regenerate timetable
- [ ] Export timetable to PDF
- [ ] Test responsiveness on different screen sizes

---

## 🐛 Troubleshooting

### Common Issues

**Issue: MongoDB Connection Error**
```
Solution: Ensure MongoDB is running
- Windows: Check Services → MongoDB Server
- Mac/Linux: Run `sudo systemctl status mongod`
```

**Issue: Port Already in Use**
```
Solution: Change port in .env or kill existing process
- Find process: `lsof -i :5000` (Mac/Linux) or `netstat -ano | findstr :5000` (Windows)
- Kill process: `kill -9 <PID>`
```

**Issue: No Faculty Found for Department**
```
Solution: Ensure faculty members are added with correct department
- Check that subject's department matches the selected department
- Verify faculty has availability set
```

**Issue: Periods Not Showing in Faculty Management**
```
Solution: Check Settings configuration
- Go to Settings page
- Verify "Number of Periods" is set correctly (1-9)
- Refresh Faculty Management page
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Coding Standards

- Use meaningful variable and function names
- Add comments for complex logic
- Follow existing code style
- Test thoroughly before submitting PR

---

## 📝 Future Enhancements

- [ ] User authentication and authorization
- [ ] Multi-semester support
- [ ] Faculty workload analytics
- [ ] Conflict resolution suggestions
- [ ] Email notifications for timetable changes
- [ ] Mobile app version
- [ ] Advanced reporting (Excel export, charts)
- [ ] Room allocation integration
- [ ] Classroom capacity management
- [ ] Teacher preference weightage

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary
- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- React.js community for excellent documentation
- MongoDB for robust NoSQL database
- Express.js for minimal and flexible framework
- All contributors and testers

---

## 📞 Support

Need help? Here's how to get support:

1. **Check Documentation**: Read this README thoroughly
2. **Search Issues**: Check [existing issues](https://github.com/yourusername/faculty-timetable-generator/issues)
3. **Open New Issue**: Create a [new issue](https://github.com/yourusername/faculty-timetable-generator/issues/new) with details
4. **Email**: Contact at your.email@example.com

---

## 🌟 Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

<div align="center">

**Made with ❤️ for Educational Institutions**

[⬆ Back to Top](#-faculty-management--timetable-generator)

</div>