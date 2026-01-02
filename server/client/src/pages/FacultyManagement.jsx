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
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    department: '',
    selectedSections: [],
    availability: []
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState({});
  const [blockedSlots, setBlockedSlots] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchFaculty();
    fetchSettings();
  }, []);

  useEffect(() => {
    // Recalculate blocked slots whenever sections are selected
    if (formData.selectedSections.length > 0) {
      calculateBlockedSlots();
    } else {
      setBlockedSlots({});
    }
  }, [formData.selectedSections, facultyList, editingId]);

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
        // Filter out 1st year sections (those with cycles)
        const filteredSections = data.data.filter(section => !section.cycle);
        setSections(filteredSections);
        console.log(`✅ Loaded ${filteredSections.length} sections (2nd-4th year) for department`);
      } else {
        console.error('❌ Failed to fetch sections');
        setSections([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sections:', error);
      setSections([]);
    }
  };

  const calculateBlockedSlots = () => {
    const blocked = {};
    
    // Get all other faculty members (exclude current editing faculty)
    const otherFaculty = facultyList.filter(f => f._id !== editingId);
    
    // For each selected section, find which slots are already occupied
    formData.selectedSections.forEach(selectedSectionId => {
      otherFaculty.forEach(faculty => {
        // Check if this faculty teaches any of our selected sections
        const teachesThisSection = faculty.sections?.some(
          section => section._id === selectedSectionId
        );
        
        if (teachesThisSection && faculty.availability) {
          // Block all slots where this faculty is available for this section
          faculty.availability.forEach(avail => {
            avail.periods.forEach(period => {
              const key = `${avail.day}-${period}`;
              if (!blocked[key]) {
                blocked[key] = [];
              }
              
              const sectionCode = faculty.sections.find(s => s._id === selectedSectionId)?.code;
              blocked[key].push({
                facultyName: faculty.name,
                subject: faculty.subject?.code || 'N/A',
                sectionCode: sectionCode
              });
            });
          });
        }
      });
    });
    
    setBlockedSlots(blocked);
    console.log('🚫 Blocked slots:', Object.keys(blocked).length);
  };

  const handleSubjectChange = (selected) => {
    if (!selected) {
      setFormData({ ...formData, subject: '', department: '', selectedSections: [] });
      setSections([]);
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
      selectedSections: []
    });

    fetchSectionsByDepartment(selectedSubject.department._id);
    console.log('✅ Selected subject:', subjectCode, '| Department:', selectedSubject.department.name);
  };

  const handleSectionToggle = (sectionId) => {
    setFormData(prev => {
      const isSelected = prev.selectedSections.includes(sectionId);
      return {
        ...prev,
        selectedSections: isSelected
          ? prev.selectedSections.filter(id => id !== sectionId)
          : [...prev.selectedSections, sectionId]
      };
    });
  };

  const handleSlotClick = (day, period) => {
    const key = `${day}-${period}`;
    
    // Don't allow selecting blocked slots
    if (blockedSlots[key]) {
      const conflicts = blockedSlots[key];
      const conflictInfo = conflicts.map(c => 
        `${c.facultyName} (${c.subject}) - Section ${c.sectionCode}`
      ).join('\n');
      
      alert(`⚠️ This slot is already occupied:\n\n${conflictInfo}\n\nPlease choose a different time slot.`);
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

    if (formData.selectedSections.length === 0) {
      alert('❌ Please select at least one section');
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
      sections: formData.selectedSections,
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
      selectedSections: faculty.sections ? faculty.sections.map(s => s._id) : [],
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
      selectedSections: [],
      availability: []
    });
    setSelectedSlots({});
    setBlockedSlots({});
    setEditingId(null);
    setSections([]);
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

  const getSlotStyle = (day, period) => {
    const key = `${day}-${period}`;
    const isSelected = selectedSlots[key];
    const isBlocked = blockedSlots[key];
    
    if (isBlocked) {
      return {
        backgroundColor: '#ffcccc',
        color: '#cc0000',
        cursor: 'not-allowed',
        opacity: 0.7
      };
    }
    
    if (isSelected) {
      return {
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer'
      };
    }
    
    return {
      backgroundColor: '#fff',
      color: '#333',
      cursor: 'pointer'
    };
  };

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

        {Object.keys(blockedSlots).length > 0 && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#856404'
          }}>
            <strong>⚠️ Slot Conflict Warning:</strong> {Object.keys(blockedSlots).length} time slot(s) 
            are already occupied by other faculty for the selected sections. 
            Blocked slots are shown in red and cannot be selected.
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
                    menuList: (base) => ({
                      ...base,
                      maxHeight: '220px',
                      overflowY: 'auto',
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

            {sections.length > 0 && (
              <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '12px', 
                  fontSize: '14px', 
                  color: '#555',
                  fontWeight: '600'
                }}>
                  Sections (Select one or more) * - {sections.length} available (2nd-4th Year only)
                </label>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '12px'
                }}>
                  {sections.map((section) => {
                    const isSelected = formData.selectedSections.includes(section._id);
                    return (
                      <div
                        key={section._id}
                        onClick={() => handleSectionToggle(section._id)}
                        style={{
                          padding: '12px',
                          border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                          textAlign: 'center',
                          transition: 'all 0.2s',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ 
                          fontWeight: '600', 
                          color: isSelected ? '#007bff' : '#333',
                          marginBottom: '4px'
                        }}>
                          {section.code}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: isSelected ? '#0056b3' : '#666'
                        }}>
                          {section.academicYear}
                        </div>
                        {isSelected && (
                          <div style={{
                            marginTop: '6px',
                            color: '#007bff',
                            fontSize: '16px'
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {formData.selectedSections.length > 0 && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#e7f3ff',
                    borderRadius: '4px',
                    fontSize: '13px',
                    color: '#004085'
                  }}>
                    ✓ Selected {formData.selectedSections.length} section(s)
                  </div>
                )}
              </div>
            )}

            {sections.length === 0 && formData.department && (
              <div style={{
                marginBottom: '20px',
                padding: '12px',
                backgroundColor: '#fff3cd',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#856404'
              }}>
                ⚠️ No sections found for this department. Please run: <code>node seed/seedSections.js</code>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', color: '#555', fontWeight: '600' }}>
                Availability (Click to select periods) * 
                {Object.keys(blockedSlots).length > 0 && (
                  <span style={{ color: '#dc3545', marginLeft: '8px' }}>
                    - Red slots are already occupied
                  </span>
                )}
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
                          const isBlocked = blockedSlots[key];
                          const cellStyle = getSlotStyle(day, period);
                          
                          return (
                            <td 
                              key={period}
                              onClick={() => handleSlotClick(day, period)}
                              title={isBlocked ? `Occupied by: ${blockedSlots[key].map(c => c.facultyName).join(', ')}` : ''}
                              style={{ 
                                padding: '12px', 
                                border: '1px solid #ddd',
                                textAlign: 'center',
                                transition: 'background-color 0.2s',
                                userSelect: 'none',
                                ...cellStyle
                              }}
                            >
                              {isBlocked ? '🚫' : isSelected ? '✓' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      Sections
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
                      <td style={{ padding: '12px', fontSize: '14px', color: '# 333' }}>
                        {faculty.subject?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#333' }}>
                        {faculty.subject?.department?.name || faculty.department?.name || 'N/A'}
                      </td>
                      <td style={{ padding: '12px', fontSize: '13px', color: '#666' }}>
                        {faculty.sections && faculty.sections.length > 0
                          ? faculty.sections.map(s => s.code).join(', ')
                          : 'No sections'}
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