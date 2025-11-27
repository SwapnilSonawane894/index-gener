import { useRef, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import '../styles/SuccessIndex.css';

export default function SuccessIndex() {
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const studentFileRef = useRef<HTMLInputElement>(null);
  const resultFileRef = useRef<HTMLInputElement>(null);

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setStudentFile(file);
      // TODO: Backend integration will handle this file
      console.log('Student file uploaded:', file.name);
    }
  };

  const handleResultFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResultFile(file);
      // TODO: Backend integration will handle this file
      console.log('Result file uploaded:', file.name);
    }
  };

  const handleRemoveStudentFile = () => {
    setStudentFile(null);
    if (studentFileRef.current) {
      studentFileRef.current.value = '';
    }
  };

  const handleRemoveResultFile = () => {
    setResultFile(null);
    if (resultFileRef.current) {
      resultFileRef.current.value = '';
    }
  };

  return (
    <div className="success-index-container" data-testid="success-index-container">
      <div className="success-index-header">
        <h2 className="page-subtitle" data-testid="success-index-title">Success Index</h2>
        <p className="page-description">Upload student enrollment data and semester results to calculate success metrics</p>
      </div>

      <div className="upload-sections">
        {/* Student Data Upload Section */}
        <div className="upload-card" data-testid="student-data-upload-card">
          <div className="card-header">
            <div className="card-icon">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="card-title">Student Enrollment Data</h3>
              <p className="card-description">Upload Excel file with Enroll and Name columns</p>
            </div>
          </div>

          <div className="upload-area">
            {!studentFile ? (
              <div className="upload-placeholder">
                <button
                  className="upload-button"
                  onClick={() => studentFileRef.current?.click()}
                  data-testid="student-upload-button"
                >
                  <Upload size={20} />
                  <span>Choose File</span>
                </button>
                <p className="upload-hint">or drag and drop Excel file here</p>
                <p className="file-format">Supported format: .xlsx, .xls</p>
              </div>
            ) : (
              <div className="file-selected" data-testid="student-file-selected">
                <div className="file-info">
                  <FileText size={20} />
                  <span className="file-name">{studentFile.name}</span>
                </div>
                <button
                  className="remove-button"
                  onClick={handleRemoveStudentFile}
                  data-testid="remove-student-file-button"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={studentFileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleStudentFileChange}
              style={{ display: 'none' }}
              data-testid="student-file-input"
            />
          </div>

          <div className="file-requirements">
            <p className="requirement-title">Required Columns:</p>
            <ul className="requirement-list">
              <li>Enroll (Student Enrollment Number)</li>
              <li>Name (Student Name)</li>
            </ul>
          </div>
        </div>

        {/* Semester Results Upload Section */}
        <div className="upload-card" data-testid="result-data-upload-card">
          <div className="card-header">
            <div className="card-icon">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="card-title">Semester Results</h3>
              <p className="card-description">Upload raw Excel file with semester result data</p>
            </div>
          </div>

          <div className="upload-area">
            {!resultFile ? (
              <div className="upload-placeholder">
                <button
                  className="upload-button"
                  onClick={() => resultFileRef.current?.click()}
                  data-testid="result-upload-button"
                >
                  <Upload size={20} />
                  <span>Choose File</span>
                </button>
                <p className="upload-hint">or drag and drop Excel file here</p>
                <p className="file-format">Supported format: .xlsx, .xls</p>
              </div>
            ) : (
              <div className="file-selected" data-testid="result-file-selected">
                <div className="file-info">
                  <FileText size={20} />
                  <span className="file-name">{resultFile.name}</span>
                </div>
                <button
                  className="remove-button"
                  onClick={handleRemoveResultFile}
                  data-testid="remove-result-file-button"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              ref={resultFileRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleResultFileChange}
              style={{ display: 'none' }}
              data-testid="result-file-input"
            />
          </div>

          <div className="file-requirements">
            <p className="requirement-title">File Contains:</p>
            <ul className="requirement-list">
              <li>Raw semester examination results</li>
              <li>All subject marks and grades</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="action-footer">
        <button
          className="process-button"
          disabled={!studentFile || !resultFile}
          data-testid="process-button"
        >
          Process Data
        </button>
        <p className="footer-note">Backend integration will process these files to generate success metrics</p>
      </div>
    </div>
  );
}
