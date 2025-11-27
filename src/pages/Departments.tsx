import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Building2 } from 'lucide-react';
import '../styles/Departments.css';

interface Department {
  id: string;
  name: string;
  hodName: string;
  totalStudents: number;
  action: string;
}

const initialDepartments: Department[] = [
  { id: '1', name: 'Computer Engineering', hodName: 'Dr. Smith', totalStudents: 320, action: '' },
  { id: '2', name: 'Civil Engineering', hodName: 'Dr. Johnson', totalStudents: 250, action: '' },
  { id: '3', name: 'Mechanical Engineering', hodName: 'Dr. Williams', totalStudents: 280, action: '' },
  { id: '4', name: 'Instrumentation Engineering', hodName: 'Dr. Brown', totalStudents: 180, action: '' },
  { id: '5', name: 'Automobile Engineering', hodName: 'Dr. Davis', totalStudents: 150, action: '' }
];

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    hodName: '',
    totalStudents: ''
  });

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: '', hodName: '', totalStudents: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      hodName: dept.hodName,
      totalStudents: dept.totalStudents.toString()
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.hodName || !formData.totalStudents) {
      alert('Please fill all fields');
      return;
    }

    if (editingDept) {
      // Update existing department
      setDepartments(departments.map(d => 
        d.id === editingDept.id 
          ? { ...d, name: formData.name, hodName: formData.hodName, totalStudents: parseInt(formData.totalStudents) }
          : d
      ));
    } else {
      // Add new department
      const newDept: Department = {
        id: Date.now().toString(),
        name: formData.name,
        hodName: formData.hodName,
        totalStudents: parseInt(formData.totalStudents),
        action: ''
      };
      setDepartments([...departments, newDept]);
    }
    
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  return (
    <div className="departments-container">
      <div className="departments-header">
        <div>
          <h2 className="departments-title" data-testid="departments-title">Departments</h2>
          <p className="departments-subtitle">Manage all college departments</p>
        </div>
        <button 
          className="add-department-btn"
          onClick={openAddModal}
          data-testid="add-department-button"
        >
          <Plus size={18} />
          Add Department
        </button>
      </div>

      <div className="table-container">
        <table className="departments-table" data-testid="departments-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>HOD Name</th>
              <th>Total Students</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.id} data-testid={`department-row-${dept.id}`}>
                <td>
                  <div className="dept-name-cell">
                    <div className="dept-icon">
                      <Building2 size={20} />
                    </div>
                    {dept.name}
                  </div>
                </td>
                <td>{dept.hodName}</td>
                <td>
                  <span className="student-count">{dept.totalStudents}</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(dept)}
                      data-testid={`edit-department-${dept.id}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(dept.id)}
                      data-testid={`delete-department-${dept.id}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" data-testid="department-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingDept ? 'Edit Department' : 'Add Department'}</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
                data-testid="close-modal-button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-field">
                <label>Department Name</label>
                <input
                  type="text"
                  placeholder="Department Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="department-name-input"
                />
              </div>

              <div className="form-field">
                <label>HOD Name</label>
                <input
                  type="text"
                  placeholder="HOD Name"
                  value={formData.hodName}
                  onChange={(e) => setFormData({ ...formData, hodName: e.target.value })}
                  data-testid="hod-name-input"
                />
              </div>

              <div className="form-field">
                <label>Total Students</label>
                <input
                  type="number"
                  placeholder="Total Students"
                  value={formData.totalStudents}
                  onChange={(e) => setFormData({ ...formData, totalStudents: e.target.value })}
                  data-testid="total-students-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn cancel-btn"
                onClick={() => setIsModalOpen(false)}
                data-testid="cancel-button"
              >
                Cancel
              </button>
              <button 
                className="modal-btn save-btn"
                onClick={handleSave}
                data-testid="save-button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}