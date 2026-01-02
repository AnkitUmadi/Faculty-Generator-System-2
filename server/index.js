const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const facultyRoutes = require("./routes/facultyRoutes");
const timetableRoutes = require("./routes/timetableRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const sectionRoutes = require('./routes/sectionRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

connectDB();
app.use("/api/faculty", facultyRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/departments", require("./routes/departmentRoutes"));
app.use('/api/settings', settingsRoutes);
app.use('/api/sections', sectionRoutes);
app.get("/", (req, res) => {
  res.send("Faculty Timetable Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
