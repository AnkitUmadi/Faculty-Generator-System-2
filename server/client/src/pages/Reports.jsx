import React, { useEffect, useState } from "react";
import Header from "../components/Header";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5];

const Reports = () => {
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [timetableData, setTimetableData] = useState(null);
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* 🔹 Fetch departments once */
  useEffect(() => {
    fetch("http://localhost:5000/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDepartments(data.data);
      })
      .catch(() => setError("Failed to load departments"));
  }, []);

  /* 🔹 Fetch reports when department changes */
  useEffect(() => {
    if (!departmentId) return;
    fetchReportsData();
  }, [departmentId]);

  const fetchReportsData = async () => {
    setLoading(true);
    setError("");
    try {
      const [timetableRes, facultyRes] = await Promise.all([
        fetch(
          `http://localhost:5000/api/timetable/latest?department=${departmentId}`
        ),
        fetch(
          `http://localhost:5000/api/faculty/by-department?departmentId=${departmentId}`
        ),
      ]);

      const timetableJson = await timetableRes.json();
      const facultyJson = await facultyRes.json();

      if (!timetableJson.success) {
        setTimetableData(null);
      } else {
        setTimetableData(timetableJson.data);
      }

      if (facultyJson.success) {
        setFacultyData(facultyJson.data);
      } else {
        setFacultyData([]);
      }
    } catch (err) {
      setError("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 Compute metrics */
  const computeStats = () => {
    let totalSlots = DAYS.length * PERIODS.length;
    let filledSlots = 0;
    const facultyLoad = {};

    if (timetableData?.timetable) {
      DAYS.forEach((day) => {
        PERIODS.forEach((p) => {
          const slot = timetableData.timetable[day]?.[p];
          if (slot) {
            filledSlots++;
            facultyLoad[slot.facultyName] =
              (facultyLoad[slot.facultyName] || 0) + 1;
          }
        });
      });
    }

    return {
      totalFaculty: facultyData.length,
      filledSlots,
      emptySlots: totalSlots - filledSlots,
      utilization:
        totalSlots === 0 ? 0 : Math.round((filledSlots / totalSlots) * 100),
      facultyLoad,
    };
  };

  const stats = computeStats();

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />

      <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1>Reports</h1>

        {/* 🔹 Department Selector */}
        <div style={{ marginBottom: "20px" }}>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            style={{ padding: "10px", fontSize: "15px" }}
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading reports...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && departmentId && (
          <>
            {/* 🔹 Summary Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={cardStyle}>
                <h3>Total Faculty</h3>
                <p style={bigText}>{stats.totalFaculty}</p>
              </div>
              <div style={cardStyle}>
                <h3>Filled Slots</h3>
                <p style={bigText}>{stats.filledSlots}</p>
              </div>
              <div style={cardStyle}>
                <h3>Empty Slots</h3>
                <p style={bigText}>{stats.emptySlots}</p>
              </div>
            </div>

            {/* 🔹 Utilization */}
            <div style={cardStyle}>
              <h3>Timetable Utilization</h3>
              <div
                style={{
                  background: "#e9ecef",
                  borderRadius: "6px",
                  height: "28px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${stats.utilization}%`,
                    height: "100%",
                    background: "#007bff",
                    color: "#fff",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {stats.utilization}%
                </div>
              </div>
            </div>

            {/* 🔹 Overload Report */}
            <div style={{ ...cardStyle, marginTop: "20px" }}>
              <h3>Faculty Load</h3>
              {Object.keys(stats.facultyLoad).length === 0 ? (
                <p>No assignments yet</p>
              ) : (
                <table width="100%" border="1" cellPadding="10">
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Periods Assigned</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.facultyLoad).map(
                      ([name, count]) => (
                        <tr key={name}>
                          <td>{name}</td>
                          <td>{count}</td>
                          <td
                            style={{
                              color: count > 2 ? "red" : "green",
                              fontWeight: "bold",
                            }}
                          >
                            {count > 2 ? "Overloaded" : "Normal"}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const cardStyle = {
  background: "#fff",
  padding: "20px",
  borderRadius: "8px",
};

const bigText = {
  fontSize: "28px",
  fontWeight: "bold",
};

export default Reports;
