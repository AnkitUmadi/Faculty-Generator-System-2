import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Select from 'react-select';
import { SUBJECT_GROUPS } from '../constants/subjects';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const FacultyManagement = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [settings, setSettings] = useState(null);
  const [periods, setPeriods] = useState([1, 2, 3, 4, 5]);
  const [conflictSlots, setConflictSlots] = useState({}); // ✅ NEW: Track blocked slots
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    department: '',
    section: '',
    availability: []
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
    fetchSettings();
  }, []);

  // ✅ NEW: Recalculate conflicts whenever faculty name or section changes
  useEffect(() => {
    if (formData.name && formData.section) {
      checkForConflicts();
    } else {
      setConflictSlots({});
    }
  }, [formData.name, formData.section, facultyList]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        const numPeriods = data.data.numberOfPeriods || 5;
        setPeriods(Array.from({ length: numPeriods }, (_, i) => i + 1));
        console.log(`✅ Loaded ${numPeriods} periods from settings`);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setPeriods([1, 2, 3, 4, 5]);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/subjects');
      const data = await response.json();
      if (data.success) {
        setSubjects(data.data);
        console.log('✅ Loaded subjects from DB:', data.data.map(s => s.code).join(', '));
      }
    } catch (error) {
      console.error('❌ Error fetching subjects:', error);
      alert('Failed to load subjects. Please check your connection.');
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/faculty');
      const data = await response.json();
      if (data.success) {
        console.log('✅ Loaded faculty:', data.data.length);
        setFacultyList(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchSectionsByDepartment = async (deptId) => {
    if (!deptId) {
      setSections([]);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/sections?departmentId=${deptId}`);
      const data = await response.json();
      
      if (data.success) {
        setSections(data.data);
        console.log(`✅ Loaded ${data.data.length} sections for department`);
      } else {
        setSections([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sections:', error);
      setSections([]);
    }
  };

  // ✅ NEW: Check for conflicts and mark slots
  const checkForConflicts = () => {
    const conflicts = {};
    const currentFacultyName = formData.name.trim().toLowerCase();
    const currentSection = formData.section;

    if (!currentFacultyName || !currentSection) {
      setConflictSlots({});
      return;
    }

    facultyList.forEach(faculty => {
      // Skip if this is the same faculty being edited
      if (editingId && faculty._id === editingId) {
        return;
      }

      const facultyName = faculty.name.trim().toLowerCase();
      const facultySection = faculty.section?._id;

      // Check for conflicts:
      // 1. Same faculty name teaching different section at same time
      // 2. Different faculty teaching same section at same time
      if (facultyName === currentFacultyName || facultySection === currentSection) {
        faculty.availability.forEach(avail => {
          avail.periods.forEach(period => {
            const key = `${avail.day}-${period}`;
            
            if (!conflicts[key]) {
              conflicts[key] = [];
            }

            if (facultyName === currentFacultyName) {
              conflicts[key].push({
                type: 'same-faculty',
                faculty: faculty.name,
                section: faculty.section?.code || 'N/A'
              });
            }
            
            if (facultySection === currentSection && facultyName !== currentFacultyName) {
              conflicts[key].push({
                type: 'same-section',
                faculty: faculty.name,
                section: faculty.section?.code || 'N/A'
              });
            }
          });
        });
      }
    });

    setConflictSlots(conflicts);
    console.log('🚫 Conflict slots:', conflicts);
  };

  const handleSubjectChange = (selected) => {
    if (!selected) {
      setFormData({ ...formData, subject: '', department: '', section: '' });
      setSections([]);
      setConflictSlots({});
      return;
    }

    const subjectCode = selected.value;
    const selectedSubject = subjects.find(s => s.code === subjectCode);
    
    if (!selectedSubject) {
      console.warn(`⚠️ Subject with code "${subjectCode}" not found in database`);
      alert(`Subject "${subjectCode}" not found in database. Please run the seed script first.`);
      return;
    }
    
    setFormData({
      ...formData,
      subject: subjectCode,
      department: selectedSubject.department._id,
      section: ''
    });

    fetchSectionsByDepartment(selectedSubject.department._id);
    console.log('✅ Selected subject:', subjectCode, '| Department:', selectedSubject.department.name);
  };

  const handleSlotClick = (day, period) => {
    const key = `${day}-${period}`;
    
    // ✅ Check if slot is blocked due to conflict
    if (conflictSlots[key]) {
      // Show tooltip or alert explaining why it's blocked
      const conflicts = conflictSlots[key];
      const messages = conflicts.map(c => {
        if (c.type === 'same-faculty') {
          return `${c.faculty} is already teaching section ${c.section}`;
        } else {
          return `${c.faculty} is already teaching this section`;
        }
      });
      alert(`⚠️ This slot is blocked:\n\n${messages.join('\n')}`);
      return;
    }

    setSelectedSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const convertSlotsToAvailability = () => {
    const availability = [];
    
    DAYS.forEach(day => {
      const periodsForDay = [];
      periods.forEach(period => {
        const key = `${day}-${period}`;
        if (selectedSlots[key]) {
          periodsForDay.push(period);
        }
      });
      
      if (periodsForDay.length > 0) {
        availability.push({ day, periods: periodsForDay });
      }
    });
    
    return availability;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('❌ Please enter faculty name');
      return;
    }

    if (!formData.subject) {
      alert('❌ Please select a subject');
      return;
    }

    if (!formData.section) {
      alert('❌ Please select a section');
      return;
    }

    const availability = convertSlotsToAvailability();
    
    if (availability.length === 0) {
      alert('❌ Please select at least one availability slot');
      return;
    }

    const selectedSubject = subjects.find(s => s.code === formData.subject);
    
    if (!selectedSubject) {
      alert(`❌ Subject "${formData.subject}" not found in database.`);
      return;
    }

    const payload = {
      name: formData.name,
      subjectCode: formData.subject,
      section: formData.section,
      availability
    };

    console.log('📤 Sending payload:', payload);

    setLoading(true);

    try {
      const url = editingId 
        ? `http://localhost:5000/api/faculty/${editingId}`
        : 'http://localhost:5000/api/faculty';
      
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingId ? '✅ Faculty updated successfully!' : '✅ Faculty added successfully!');
        await fetchFaculty();
        resetForm();
      } else {
        alert('❌ Error: ' + (data.message || 'Operation failed'));
        console.error('Backend error:', data);
      }
    } catch (error) {
      console.error('❌ Error saving faculty:', error);
      alert('Server error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faculty) => {
    console.log('📝 Editing faculty:', faculty);

    setEditingId(faculty._id);
    
    const subjectCode = faculty.subject?.code || '';
    
    setFormData({
      name: faculty.name,
      subject: subjectCode,
      department: faculty.subject?.department?._id || '',
      section: faculty.section?._id || '',
      availability: faculty.availability
    });
    
    if (faculty.subject?.department?._id) {
      fetchSectionsByDepartment(faculty.subject.department._id);
    }
    
    const slots = {};
    if (faculty.availability && Array.isArray(faculty.availability)) {
      faculty.availability.forEach(avail => {
        if (avail.periods && Array.isArray(avail.periods)) {
          avail.periods.forEach(period => {
            slots[`${avail.day}-${period}`] = true;
          });
        }
      });
    }
    
    console.log('✅ Restored slots:', slots);
    setSelectedSlots(slots);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this faculty member?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/faculty/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('✅ Faculty deleted successfully!');
        fetchFaculty();
      } else {
        alert('❌ Error: ' + (data.message || 'Delete failed'));
      }
    } catch (error) {
      console.error('Error deleting faculty:', error);
      alert('Server error: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      department: '',
      section: '',
      availability: []
    });
    setSelectedSlots({});
    setEditingId(null);
    setSections([]);
    setConflictSlots({});
  };

  const getSelectedSubjectDepartment = () => {
    const selectedSubject = subjects.find(s => s.code === formData.subject);
    return selectedSubject ? selectedSubject.department.name : '';
  };

  const subjectOptions = SUBJECT_GROUPS.map((g) => ({
    label: g.label,
    options: g.options.map((o) => ({
      label: o.label,
      value: o.value,
    })),
  }));

  const sectionOptions = sections.map(section => ({
    value: section._id,
    label: `${section.code} - ${section.academicYear}`
  }));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Header />
      
      <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '40px', color: '#333' }}>
          Faculty Management
        </h1>

        {settings && (
          <div style={{
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#004085'
          }}>
            <strong>📊 Current Settings:</strong> {periods.length} periods configured 
            ({settings.workingHours.startTime} - {settings.workingHours.endTime}, 
            {settings.periodDuration} min per period)
          </div>
        )}

        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>
            {editingId ? '✏️ Edit Faculty' : '➕ Add Faculty'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>
                  Faculty Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter faculty name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>
                  Subject *
                </label>
                <Select
                  options={subjectOptions}
                  placeholder="Select Subject"
                  isSearchable
                  value={
                    subjectOptions
                      .flatMap(group => group.options)
                      .find(opt => opt.value === formData.subject) || null
                  }
                  onChange={handleSubjectChange}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      fontSize: '14px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }),
                  }}
                />
              </div>

              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>
                  Department
                </label>
                <input
                  type="text"
                  value={getSelectedSubjectDepartment()}
                  readOnly
                  placeholder="Auto-filled from subject"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: '#f9f9f9',
                    color: '#666'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: '500' }}>
                Section *
              </label>
              <Select
                options={sectionOptions}
                placeholder="Select section..."
                value={sectionOptions.find(opt => opt.value === formData.section) || null}
                onChange={(selected) => setFormData({ ...formData, section: selected ? selected.value : '' })}
                isDisabled={!formData.department || sections.length === 0}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }),
                }}
              />
              {sections.length === 0 && formData.department && (
                <p style={{ marginTop: '8px', fontSize: '13px', color: '#dc3545' }}>
                  ⚠️ No sections found. Please run: node seed/seedSections.js
                </p>
              )}
            </div>

            {/* ✅ CONFLICT LEGEND */}
            {Object.keys(conflictSlots).length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#856404'
              }}>
                <strong>⚠️ Blocked slots (in red):</strong> Already occupied by this faculty or another faculty in this section
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#555', fontWeight: '600' }}>
                Availability (Click to select periods) *
              </label>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ 
                        padding: '12px', 
                        border: '1px solid #ddd',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#555'
                      }}>
                        Day
                      </th>
                      {periods.map(period => (
                        <th key={period} style={{ 
                          padding: '12px', 
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#555',
                          textAlign: 'center'
                        }}>
                          P{period}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day}>
                        <td style={{ 
                          padding: '12px', 
                          border: '1px solid #ddd',
                          fontSize: '14px',
                          fontWeight: '500',
                          backgroundColor: '#f8f9fa'
                        }}>
                          {day}
                        </td>
                        {periods.map(period => {
                          const key = `${day}-${period}`;
                          const isSelected = selectedSlots[key];
                          const isBlocked = conflictSlots[key];
                          
                          return (
                            <td 
                              key={period}
                              onClick={() => handleSlotClick(day, period)}
                              title={isBlocked ? '🚫 Blocked - Slot already occupied' : isSelected ? 'Click to deselect' : 'Click to select'}
                              style={{ 
                                padding: '12px', 
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                cursor: isBlocked ? 'not-allowed' : 'pointer',
                                backgroundColor: isBlocked 
                                  ? '#ffcccc' // Light red for blocked
                                  : isSelected 
                                    ? '#007bff' // Blue for selected
                                    : '#fff', // White for available
                                color: isBlocked 
                                  ? '#cc0000' // Dark red text
                                  : isSelected 
                                    ? '#fff' // White text
                                    : '#333',
                                transition: 'background-color 0.2s',
                                userSelect: 'none',
                                position: 'relative'
                              }}
                            >
                              {isBlocked && '🚫'}
                              {isSelected && !isBlocked && '✓'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* ✅ LEGEND */}
              <div style={{ 
                marginTop: '12px', 
                display: 'flex', 
                gap: '24px', 
                fontSize: '13px',
                color: '#666'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: '#007bff',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}></div>
                  <span>Selected</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: '#ffcccc',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}></div>
                  <span>Blocked (Conflict)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '20px', 
                    height: '20px', 
                    backgroundColor: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '3px'
                  }}></div>
                  <span>Available</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Saving...' : editingId ? 'Update Faculty' : 'Add Faculty'}
              </button>
              
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    backgroundColor: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={{
          backgroundColor: '#fff',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>
            Faculty List
          </h2>
          
          {facultyList.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
              No faculty members added yet. Add your first faculty member above!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                      Name
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                      Subject
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                      Department
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                      Section
                    </th>
                    <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map((faculty) => (
                    <tr key={faculty._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333' }}>
                        {faculty.name}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333' }}>
                        {faculty.subject?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333' }}>
                        {faculty.subject?.department?.name || faculty.department?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                        {faculty.section?.code || 'N/A'}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <button
                          onClick={() => handleEdit(faculty)}
                          style={{
                            backgroundColor: '#007bff',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            marginRight: '8px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(faculty._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;
