import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Building2, UserPlus } from 'lucide-react';
import { departmentsAPI, handleAPIError } from '../services/api';
import '../styles/Departments.css';

interface Department {
  id: string;
  name: string;
  abbreviation: string;
  hodName: string;
  action: string;
}

interface HodCredentials {
  username: string;
  password: string;
  message: string;
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    hodName: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hodCredentials, setHodCredentials] = useState<HodCredentials | null>(null);

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await departmentsAPI.getAll();
      const formattedDepts = response.departments.map(d => ({
        id: d.id,
        name: d.name,
        abbreviation: d.abbreviation || '',
        hodName: d.hodName,
        action: ''
      }));
      setDepartments(formattedDepts);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDept(null);
    setFormData({ name: '', abbreviation: '', hodName: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      abbreviation: dept.abbreviation || '',
      hodName: dept.hodName
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.abbreviation || !formData.hodName) {
      alert('Please fill all fields');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      if (editingDept) {
        // Update existing department
        await departmentsAPI.update(editingDept.id, {
          name: formData.name,
          abbreviation: formData.abbreviation.toUpperCase(),
          hodName: formData.hodName,
          totalStudents: 0
        });
        setDepartments(departments.map(d => 
          d.id === editingDept.id 
            ? { ...d, name: formData.name, abbreviation: formData.abbreviation.toUpperCase(), hodName: formData.hodName }
            : d
        ));
      } else {
        // Add new department
        const result = await departmentsAPI.create({
          name: formData.name,
          abbreviation: formData.abbreviation.toUpperCase(),
          hodName: formData.hodName,
          totalStudents: 0
        });
        const newDept: Department = {
          id: result.id,
          name: formData.name,
          abbreviation: formData.abbreviation.toUpperCase(),
          hodName: formData.hodName,
          action: ''
        };
        setDepartments([...departments, newDept]);
        
        // Show HOD credentials if returned
        if (result.hod_username) {
          setHodCredentials({
            username: result.hod_username,
            password: result.hod_temp_password || '123',
            message: result.message || `HOD account created for ${formData.hodName}`
          });
        }
      }
      
      setIsModalOpen(false);
    } catch (err) {
      alert(handleAPIError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department? This will also delete the HOD user account.')) {
      try {
        await departmentsAPI.delete(id);
        setDepartments(departments.filter(d => d.id !== id));
      } catch (err) {
        alert(handleAPIError(err));
      }
    }
  };

  const handleCreateHod = async (dept: Department) => {
    try {
      const result = await departmentsAPI.createHodUser(dept.id);
      if (result.success && result.hod_username) {
        setHodCredentials({
          username: result.hod_username,
          password: result.hod_temp_password || '123',
          message: result.message || `HOD account created for ${dept.hodName}`
        });
      } else {
        alert(result.message || 'HOD user already exists for this department');
      }
    } catch (err) {
      alert(handleAPIError(err));
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
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading departments...</div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>{error}</div>
        ) : (
        <table className="departments-table" data-testid="departments-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Abbreviation</th>
              <th>HOD Name</th>
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
                <td><span className="abbr-badge">{dept.abbreviation}</span></td>
                <td>{dept.hodName}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => openEditModal(dept)}
                      data-testid={`edit-department-${dept.id}`}
                      title="Edit Department"
                    >
                      <Pencil size={16} />
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => handleCreateHod(dept)}
                      data-testid={`create-hod-${dept.id}`}
                      title="Create HOD Login"
                      style={{ color: '#10b981' }}
                    >
                      <UserPlus size={16} />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(dept.id)}
                      data-testid={`delete-department-${dept.id}`}
                      title="Delete Department"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
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
                  placeholder="e.g., Mechanical Engineering"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="department-name-input"
                />
              </div>

              <div className="form-field">
                <label>Abbreviation</label>
                <input
                  type="text"
                  placeholder="e.g., ME, CO, EE"
                  value={formData.abbreviation}
                  onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                  data-testid="abbreviation-input"
                  maxLength={10}
                  style={{ textTransform: 'uppercase' }}
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
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOD Credentials Modal */}
      {hodCredentials && (
        <div className="modal-overlay" data-testid="hod-credentials-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>HOD Login Credentials</h3>
              <button 
                className="modal-close-btn"
                onClick={() => setHodCredentials(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: '#059669' }}>
                {hodCredentials.message}
              </p>
              
              <div className="form-field">
                <label>Username</label>
                <input
                  type="text"
                  value={hodCredentials.username}
                  readOnly
                  style={{ background: '#f3f4f6', fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-field">
                <label>Temporary Password</label>
                <input
                  type="text"
                  value={hodCredentials.password}
                  readOnly
                  style={{ background: '#f3f4f6', fontFamily: 'monospace' }}
                />
              </div>

              <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
                Please share these credentials with the HOD. They should change their password after first login.
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="modal-btn save-btn"
                onClick={() => setHodCredentials(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}