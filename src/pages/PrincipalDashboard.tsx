import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GraduationCap, Building2, CheckCircle2, Users } from 'lucide-react';
import '../styles/Dashboard.css';

const passRateData = [
  { name: 'CSE', value: 85 },
  { name: 'MECH', value: 78 },
  { name: 'ME', value: 92 },
  { name: 'CE', value: 88 },
  { name: 'IT', value: 95 }
];

const subjectDifficulties = [
  'Mechanics',
  'Engineering Mathematics II',
  'SCM',
  'Operating System',
  'Engineering Mathematics I',
  'Data Structure'
];

export default function PrincipalDashboard() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {/* Student Pass Rates Chart */}
        <div className="dashboard-card chart-card">
          <h2 className="card-title" data-testid="student-pass-rates-title">Student Pass Rates</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={passRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fill: '#666', fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                label={{ value: '%', angle: -90, position: 'insideLeft', fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                cursor={{ fill: 'rgba(102, 126, 234, 0.05)' }}
              />
              <Bar 
                dataKey="value" 
                fill="url(#colorGradient)" 
                radius={[8, 8, 0, 0]}
                data-testid="pass-rate-bar"
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#667eea" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#764ba2" stopOpacity={1}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
          <div className="chart-footer" data-testid="other-info">Other info [......]</div>
        </div>

        {/* Subject Difficulties */}
        <div className="dashboard-card">
          <h2 className="card-title" data-testid="subject-difficulties-title">Subject Difficulties</h2>
          <div className="subject-list">
            {subjectDifficulties.map((subject, index) => (
              <div key={index} className="subject-item" data-testid={`subject-item-${index}`}>
                <span className="subject-name">{subject}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" data-testid="total-students-card">
          <div className="stat-icon" style={{ background: '#0078D4' }}>
            <GraduationCap size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">1,234</div>
            <div className="stat-label">Total Students</div>
          </div>
        </div>

        <div className="stat-card" data-testid="departments-card">
          <div className="stat-icon" style={{ background: '#E3008C' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">12</div>
            <div className="stat-label">Departments</div>
          </div>
        </div>

        <div className="stat-card" data-testid="pass-percentage-card">
          <div className="stat-icon" style={{ background: '#00BCF2' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">87.6%</div>
            <div className="stat-label">Pass Percentage</div>
          </div>
        </div>

        <div className="stat-card" data-testid="faculty-card">
          <div className="stat-icon" style={{ background: '#107C10' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">89</div>
            <div className="stat-label">Faculty Members</div>
          </div>
        </div>
      </div>
    </div>
  );
}