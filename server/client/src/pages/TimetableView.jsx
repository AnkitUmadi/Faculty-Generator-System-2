import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const TimetableView = () => {
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [departmentId, setDepartmentId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [timetable, setTimetable] = useState({});
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState(null);
  const [periods, setPeriods] = useState([1, 2, 3, 4, 5]);
  const [scheduleItems, setScheduleItems] = useState([]);

  useEffect(() => {
    fetchDepartments();
    fetchSettings();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments");
      const data = await res.json();
      if (data.success) setDepartments(data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchSectionsByDepartment = async (deptId) => {
    try {
      // FIX: Corrected the endpoint URL to use the existing route /api/sections?departmentId=...
      const res = await fetch(`http://localhost:5000/api/sections?departmentId=${deptId}`);
      
      const data = await res.json();
      if (data.success) {
        setSections(data.data);
        console.log(`✅ Loaded ${data.data.length} sections for department`);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleDepartmentChange = (e) => {
    const deptId = e.target.value;
    setDepartmentId(deptId);
    setSectionId(""); // Reset section
    setTimetable(createEmptyTimetable());
    setMessage("");
    
    if (deptId) {
      fetchSectionsByDepartment(deptId);
    } else {
      setSections([]);
    }
  };

  // Group sections by year for better display (Logic is kept as provided)
  const groupSectionsByYear = (sections) => {
    const grouped = {
      '1st Year': [],
      '2nd Year': [],
      '3rd Year': [],
      '4th Year': []
    };

    sections.forEach(section => {
      // Use 'academicYear' property which is structured as '1st Year', '2nd Year', etc.
      if (grouped[section.academicYear]) {
        grouped[section.academicYear].push(section);
      }
    });

    return grouped;
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/settings");
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
        const numPeriods = data.data.numberOfPeriods || 5;
        setPeriods(Array.from({ length: numPeriods }, (_, i) => i + 1));
        
        const schedule = calculateSchedule(data.data);
        setScheduleItems(schedule);
        
        console.log("✅ Settings loaded:", data.data);
        console.log("✅ Schedule calculated:", schedule);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    return `${hours}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  const calculateSchedule = (settings) => {
    const startMinutes = parseTime(settings.workingHours.startTime);
    const endMinutes = parseTime(settings.workingHours.endTime);
    const periodDuration = settings.periodDuration;
    const numberOfPeriods = settings.numberOfPeriods;
    
    // Get and sort enabled breaks
    const enabledBreaks = settings.breakTimes
      .filter(b => b.enabled)
      .map(b => ({
        name: b.name,
        startMinutes: parseTime(b.startTime),
        endMinutes: parseTime(b.endTime)
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    const schedule = [];
    let currentTime = startMinutes;
    let periodNumber = 1;

    while (currentTime < endMinutes && periodNumber <= numberOfPeriods) {
      // Check if there's a break that should start before next period ends
      let breakToInsert = null;
      
      for (const breakItem of enabledBreaks) {
        // If break starts within current time and before period would end
        if (breakItem.startMinutes >= currentTime && 
            breakItem.startMinutes < currentTime + periodDuration) {
          breakToInsert = breakItem;
          break;
        }
      }
      
      if (breakToInsert) {
        // Add partial period before break if there's enough time (at least 20 minutes)
        const timeBeforeBreak = breakToInsert.startMinutes - currentTime;
        if (timeBeforeBreak >= 20 && periodNumber <= numberOfPeriods) {
          schedule.push({
            type: 'period',
            periodNumber: periodNumber,
            startTime: formatTime(currentTime),
            endTime: formatTime(breakToInsert.startMinutes),
            duration: timeBeforeBreak
          });
          periodNumber++;
        }
        
        // Add the break
        schedule.push({
          type: 'break',
          name: breakToInsert.name,
          startTime: formatTime(breakToInsert.startMinutes),
          endTime: formatTime(breakToInsert.endMinutes),
          duration: breakToInsert.endMinutes - breakToInsert.startMinutes
        });
        
        // Move time forward past the break
        currentTime = breakToInsert.endMinutes;
        
        // Remove this break so it doesn't get processed again
        const breakIndex = enabledBreaks.indexOf(breakToInsert);
        if (breakIndex > -1) {
          enabledBreaks.splice(breakIndex, 1);
        }
      } else {
        // No break interrupting, add full period
        const periodEnd = Math.min(currentTime + periodDuration, endMinutes);
        
        if (periodEnd > currentTime && periodNumber <= numberOfPeriods) {
          schedule.push({
            type: 'period',
            periodNumber: periodNumber,
            startTime: formatTime(currentTime),
            endTime: formatTime(periodEnd),
            duration: periodEnd - currentTime
          });
          periodNumber++;
          currentTime = periodEnd;
        } else {
          break;
        }
      }
    }

    return schedule;
  };

  const createEmptyTimetable = () => {
    const t = {};
    DAYS.forEach((day) => {
      t[day] = {};
      periods.forEach((p) => (t[day][p] = null));
    });
    return t;
  };

  const generateTimetable = async () => {
    if (!departmentId) {
      alert("Please select a department first");
      return;
    }

    if (!sectionId) {
      alert("Please select a section first");
      return;
    }

    setMessage("");
    setTimetable(createEmptyTimetable());

    try {
      const res = await fetch(
        `http://localhost:5000/api/timetable/generate?departmentId=${departmentId}&sectionId=${sectionId}`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!data.success || !data.data?.timetable) {
        setMessage(data.message || "Could not generate timetable. Check server logs or ensure faculty and subjects are assigned.");
        setTimetable(createEmptyTimetable());
        return;
      }

      console.log("✅ Received timetable data:", data.data.timetable);
      setTimetable(data.data.timetable);
    } catch (err) {
      console.error(err);
      setMessage("Server error during timetable generation.");
    }
  };

  const exportPDF = () => window.print();

  // Get only period schedule items (no breaks) for column mapping
  const periodScheduleItems = scheduleItems.filter(item => item.type === 'period');
  
  // Group sections for display
  const groupedSections = groupSectionsByYear(sections);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />

      <div style={{ padding: "40px", maxWidth: "1600px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "30px", color: "#333" }}>
          Department Timetable
        </h1>

        {/* SETTINGS DISPLAY */}
        {settings && (
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "8px",
              marginBottom: "24px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ marginBottom: "16px", color: "#555", fontSize: "16px" }}>
              Current Settings
            </h3>
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", fontSize: "14px" }}>
              <div>
                <strong>Working Hours:</strong> {settings.workingHours.startTime} - {settings.workingHours.endTime}
              </div>
              <div>
                <strong>Period Duration:</strong> {settings.periodDuration} minutes
              </div>
              <div>
                <strong>Number of Periods:</strong> {settings.numberOfPeriods}
              </div>
              <div>
                <strong>Active Breaks:</strong>{" "}
                {settings.breakTimes.filter((b) => b.enabled).length > 0
                  ? settings.breakTimes
                      .filter((b) => b.enabled)
                      .map((b) => `${b.name} (${b.startTime}-${b.endTime})`)
                      .join(", ")
                  : "None"}
              </div>
            </div>
          </div>
        )}

        {/* VALIDATION WARNING */}
        {settings && periodScheduleItems.length < settings.numberOfPeriods && (
          <div style={{
            background: "#fff3cd",
            border: "1px solid #ffc107",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "24px",
            color: "#856404"
          }}>
            <strong>⚠️ Warning:</strong> Only {periodScheduleItems.length} out of {settings.numberOfPeriods} periods 
            fit within working hours ({settings.workingHours.startTime} - {settings.workingHours.endTime}). 
            Timetable will use {periodScheduleItems.length} periods. To fit all {settings.numberOfPeriods} periods, 
            please adjust working hours, reduce period duration, or reduce number of periods in Settings.
          </div>
        )}

        {/* CONTROLS */}
        <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "6px", 
              fontSize: "14px",
              fontWeight: "500",
              color: "#555"
            }}>
              Department
            </label>
            <select
              value={departmentId}
              onChange={handleDepartmentChange}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "15px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "1", minWidth: "200px" }}>
            <label style={{ 
              display: "block", 
              marginBottom: "6px", 
              fontSize: "14px",
              fontWeight: "500",
              color: "#555"
            }}>
              Section
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              disabled={!departmentId}
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "15px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                backgroundColor: !departmentId ? "#f5f5f5" : "#fff",
                cursor: !departmentId ? "not-allowed" : "pointer"
              }}
            >
              <option value="">Select Section</option>
              
              {/* Render sections grouped by year */}
              {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yearKey => {
                const yearSections = groupedSections[yearKey] || [];
                if (yearSections.length === 0) return null;

                return (
                  <optgroup key={yearKey} label={`─── ${yearKey} ───`}>
                    {yearSections.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.code} 
                        {s.cycle ? ` - ${s.cycle} Cycle` : ''}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <button
            onClick={generateTimetable}
            disabled={!departmentId || !sectionId}
            style={{
              background: (!departmentId || !sectionId) ? "#ccc" : "#007bff",
              color: "#fff",
              padding: "10px 26px",
              border: "none",
              fontSize: "15px",
              cursor: (!departmentId || !sectionId) ? "not-allowed" : "pointer",
              borderRadius: "4px",
            }}
          >
            Generate Timetable
          </button>

          <button
            onClick={exportPDF}
            style={{
              background: "#28a745",
              color: "#fff",
              padding: "10px 26px",
              border: "none",
              fontSize: "15px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Export PDF
          </button>
        </div>

        {message && (
          <p style={{ color: "red", marginBottom: "12px", fontWeight: "500" }}>
            {message}
          </p>
        )}

        {/* TIMETABLE WITH DYNAMIC SCHEDULE */}
        <div
          style={{
            background: "#fff",
            padding: "24px",
            borderRadius: "8px",
            overflowX: "auto",
          }}
        >
          <table
            width="100%"
            cellPadding="12"
            style={{
              borderCollapse: "collapse",
              border: "2px solid #333",
            }}
          >
            <thead>
              {/* First row: Period numbers and break labels */}
              <tr style={{ background: "#2c3e50", color: "#fff" }}>
                <th style={{ border: "2px solid #333", padding: "12px", minWidth: "120px" }}>
                  Day
                </th>
                {scheduleItems.map((item, idx) => (
                  item.type === 'period' ? (
                    <th key={`period-header-${idx}`} style={{ 
                      border: "2px solid #333", 
                      padding: "12px",
                      minWidth: "140px"
                    }}>
                      Period {item.periodNumber}
                    </th>
                  ) : (
                    <th key={`break-header-${idx}`} style={{ 
                      border: "2px solid #333", 
                      padding: "12px",
                      background: "#e67e22",
                      minWidth: "120px",
                      fontWeight: "600"
                    }}>
                      {item.name}
                    </th>
                  )
                ))}
              </tr>

              {/* Second row: Time slots */}
              <tr style={{ background: "#34495e", color: "#fff" }}>
                <th style={{ border: "2px solid #333", padding: "8px", fontSize: "13px" }}>
                  Time
                </th>
                {scheduleItems.map((item, idx) => (
                  <th key={`time-header-${idx}`} style={{ 
                    border: "2px solid #333", 
                    padding: "8px",
                    fontSize: "12px",
                    background: item.type === 'break' ? '#d35400' : '#34495e'
                  }}>
                    {item.startTime}<br/>-<br/>{item.endTime}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td
                    style={{
                      border: "2px solid #333",
                      padding: "12px",
                      fontWeight: "700",
                      background: "#ecf0f1",
                      fontSize: "15px"
                    }}
                  >
                    {day}
                  </td>
                  {scheduleItems.map((item, idx) => {
                    if (item.type === 'break') {
                      return (
                        <td
                          key={`${day}-break-${idx}`}
                          style={{
                            border: "2px solid #333",
                            padding: "12px",
                            textAlign: "center",
                            background: "#fff3cd",
                            fontWeight: "600",
                            color: "#856404"
                          }}
                        >
                          {item.name}
                        </td>
                      );
                    }

                    // For periods, get data from timetable
                    const slot = timetable?.[day]?.[item.periodNumber];
                    return (
                      <td
                        key={`${day}-p${item.periodNumber}`}
                        style={{
                          border: "2px solid #333",
                          padding: "12px",
                          textAlign: "center",
                          background: slot ? "#e8f5e9" : "#fff",
                        }}
                      >
                        {slot ? (
                          <>
                            <div style={{ 
                              fontWeight: "700", 
                              marginBottom: "4px",
                              color: "#2e7d32",
                              fontSize: "14px"
                            }}>
                              {slot.subjectName}
                            </div>
                            <div style={{ fontSize: "13px", color: "#555" }}>
                              {slot.facultyName}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "#999" }}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SCHEDULE DEBUG INFO */}
        {scheduleItems.length > 0 && (
          <div style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#e7f3ff",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#004085"
          }}>
            <strong>📋 Schedule Breakdown:</strong>
            <div style={{ marginTop: "8px" }}>
              {scheduleItems.map((item, idx) => (
                <div key={idx} style={{ marginBottom: "4px" }}>
                  {item.type === 'period' 
                    ? `Period ${item.periodNumber}: ${item.startTime} - ${item.endTime} (${item.duration} min)`
                    : `${item.name}: ${item.startTime} - ${item.endTime} (${item.duration} min)`
                  }
                </div>
              ))}
            </div>
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ccc" }}>
              <strong>Total Periods Generated:</strong> {periodScheduleItems.length} / {settings?.numberOfPeriods || 0}
            </div>
          </div>
        )}
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          button, select {
            display: none !important;
          }
          body {
            margin: 0;
            padding: 20px;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default TimetableView;