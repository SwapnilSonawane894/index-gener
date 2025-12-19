import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, ChevronDown, Users } from 'lucide-react';
import { apiTool, downloadFile, handleAPIError } from '../services/api';
import '../styles/SuccessIndex.css'; 

export default function API() {
  const [year, setYear] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedYearType, setSelectedYearType] = useState<'FY' | 'SY' | 'TY' | null>(null);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  
  const [studentFile, setStudentFile] = useState<File | null>(null);
  const [resultFile, setResultFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const studentFileRef = useRef<HTMLInputElement>(null);
  const resultFileRef = useRef<HTMLInputElement>(null);

  // Configuration for year types and semesters
  const YEAR_TYPE_CONFIG = {
    FY: { label: 'First Year', yearOffset: 0, semesters: [1, 2], romanLabels: ['I', 'II'] },
    SY: { label: 'Second Year', yearOffset: 1, semesters: [3, 4], romanLabels: ['III', 'IV'] },
    TY: { label: 'Third Year', yearOffset: 2, semesters: [5, 6], romanLabels: ['V', 'VI'] }
  };

  const yearTypeOptions = Object.entries(YEAR_TYPE_CONFIG).map(([key, config]) => ({
    value: key as 'FY' | 'SY' | 'TY',
    label: config.label
  }));

  const getYearOffset = (yearType: 'FY' | 'SY' | 'TY'): number => {
    return YEAR_TYPE_CONFIG[yearType].yearOffset;
  };

  const calculateDisplayYear = (baseYear: number, yearType: 'FY' | 'SY' | 'TY'): string => {
    const offset = getYearOffset(yearType);
    const startYear = baseYear + offset;
    const endYear = startYear + 1;
    return `${startYear}-${(endYear % 100).toString().padStart(2, '0')}`;
  };

  const getAvailableSemesters = () => {
    if (!selectedYearType) return [];
    const config = YEAR_TYPE_CONFIG[selectedYearType];
    return config.semesters.map((semValue, index) => ({
      value: semValue,
      romanLabel: config.romanLabels[index]
    }));
  };

  // Helper to calculate the exact header string (e.g. "SEM V (W-24)")
  const getSemesterHeader = (romanLabel: string, isEven: boolean, baseYear: number, yearType: 'FY' | 'SY' | 'TY') => {
    const config = YEAR_TYPE_CONFIG[yearType];
    const academicStart = baseYear + config.yearOffset;
    
    if (!isEven) {
      // Odd Semester (Winter) -> Same year
      const yy = academicStart % 100;
      return `SEM ${romanLabel} (W-${yy})`;
    } else {
      // Even Semester (Summer) -> Next year
      const yy = (academicStart + 1) % 100;
      return `SEM ${romanLabel} (S-${yy})`;
    }
  };

  const formatSemesterDisplay = (semValue: number, romanLabel: string, yearType: 'FY' | 'SY' | 'TY'): string => {
    if (!year) return '';
    const baseYear = parseInt(year);
    const config = YEAR_TYPE_CONFIG[yearType];
    const isEven = config.semesters.indexOf(semValue) === 1;
    return getSemesterHeader(romanLabel, isEven, baseYear, yearType);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputYear = e.target.value;
    setYear(inputYear);
    if (inputYear.length === 4 && !isNaN(Number(inputYear))) {
      const yearNum = parseInt(inputYear);
      const nextYear = (yearNum + 1) % 100;
      setAcademicYear(`${yearNum}-${nextYear.toString().padStart(2, '0')}`);
    } else {
      setAcademicYear('');
    }
  };

  const handleYearTypeSelect = (value: 'FY' | 'SY' | 'TY') => {
    setSelectedYearType(value);
    setYearDropdownOpen(false);
    setSelectedSemester(null);
  };

  const handleSemesterSelect = (value: number) => {
    setSelectedSemester(value);
    setSemesterDropdownOpen(false);
  };

  const handleStudentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setStudentFile(file);
  };

  const handleResultFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResultFile(file);
  };

  const handleRemoveStudentFile = () => {
    setStudentFile(null);
    if (studentFileRef.current) studentFileRef.current.value = '';
  };

  const handleRemoveResultFile = () => {
    setResultFile(null);
    if (resultFileRef.current) resultFileRef.current.value = '';
  };

  const getFormattedYearDisplay = () => {
    if (!selectedYearType || !academicYear) return 'Select Academic Year';
    const baseYear = parseInt(year);
    const displayYear = calculateDisplayYear(baseYear, selectedYearType);
    return `${YEAR_TYPE_CONFIG[selectedYearType].label} (${displayYear})`;
  };

  const handleProcess = async () => {
    if (!year || !academicYear || !selectedYearType || !selectedSemester || !studentFile || !resultFile) {
      setError('Please fill in all fields and upload both files');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const baseYear = parseInt(year);
      const config = YEAR_TYPE_CONFIG[selectedYearType];
      
      const sem1Header = getSemesterHeader(config.romanLabels[0], false, baseYear, selectedYearType);
      const sem2Header = getSemesterHeader(config.romanLabels[1], true, baseYear, selectedYearType);
      
      const displayYearLabel = calculateDisplayYear(baseYear, selectedYearType);

      // Pass selectedSemester (number) to the API
      const blob = await apiTool.generateReport(
        studentFile, 
        resultFile, 
        selectedYearType, 
        displayYearLabel, 
        sem1Header, 
        sem2Header,
        selectedSemester 
      );
      
      downloadFile(blob, `API_${selectedYearType}_${displayYearLabel}.xlsx`);
      setSuccess("API Report generated and downloaded successfully!");
      
      setTimeout(() => handleReset(), 3000);
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };


  const handleReset = () => {
    setYear('');
    setAcademicYear('');
    setSelectedYearType(null);
    setSelectedSemester(null);
    setStudentFile(null);
    setResultFile(null);
    setError('');
    setSuccess('');
    if (studentFileRef.current) studentFileRef.current.value = '';
    if (resultFileRef.current) resultFileRef.current.value = '';
  };

  return (
    <div className="success-index-container" data-testid="api-container">
      <div className="success-index-header">
        <h2 className="page-subtitle" data-testid="api-title">Academic Performance Index (API)</h2>
        <p className="page-description">Upload student data and semester results to generate API calculation reports</p>
      </div>

      {error && <div className="message-box error-message">{error}</div>}
      {success && <div className="message-box success-message"><CheckCircle size={18} />{success}</div>}

      <div className="batch-config-section">
        <h3 className="section-title">Academic Year Configuration</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Batch Start Year *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., 2022"
              value={year}
              onChange={handleYearChange}
              maxLength={4}
              data-testid="year-input"
            />
            <p className="form-hint">Enter the 1st year of the batch (e.g. 2022 for a 2022-26 batch)</p>
          </div>

          <div className="form-group">
            <label className="form-label">Target Academic Year *</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-trigger"
                onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                type="button"
                disabled={!academicYear}
              >
                <span className={selectedYearType ? 'dropdown-value' : 'dropdown-placeholder'}>
                  {getFormattedYearDisplay()}
                </span>
                <ChevronDown size={20} className={`dropdown-icon ${yearDropdownOpen ? 'open' : ''}`} />
              </button>
              {yearDropdownOpen && (
                <div className="dropdown-menu">
                  {yearTypeOptions.map((option) => {
                    const baseYear = parseInt(year);
                    const displayYear = calculateDisplayYear(baseYear, option.value);
                    return (
                      <button
                        key={option.value}
                        className={`dropdown-option ${selectedYearType === option.value ? 'selected' : ''}`}
                        onClick={() => handleYearTypeSelect(option.value)}
                        type="button"
                      >
                        {option.label} ({displayYear})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Closing Semester *</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-trigger"
                onClick={() => setSemesterDropdownOpen(!semesterDropdownOpen)}
                type="button"
                disabled={!selectedYearType}
              >
                <span className={selectedSemester ? 'dropdown-value' : 'dropdown-placeholder'}>
                  {selectedSemester
                    ? formatSemesterDisplay(selectedSemester, getAvailableSemesters().find(s => s.value === selectedSemester)?.romanLabel || '', selectedYearType!)
                    : 'Select Semester'}
                </span>
                <ChevronDown size={20} className={`dropdown-icon ${semesterDropdownOpen ? 'open' : ''}`} />
              </button>
              {semesterDropdownOpen && selectedYearType && (
                <div className="dropdown-menu">
                  {getAvailableSemesters().map((sem) => (
                    <button
                      key={sem.value}
                      className={`dropdown-option ${selectedSemester === sem.value ? 'selected' : ''}`}
                      onClick={() => handleSemesterSelect(sem.value)}
                      type="button"
                    >
                      {formatSemesterDisplay(sem.value, sem.romanLabel, selectedYearType)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="file-upload-section">
        <h3 className="section-title">Upload Files</h3>
        
        <div className="file-upload-row">
          <div className="file-upload-info">
            <Users size={20} className="file-icon" />
            <span className="file-label">Student Data (Enrollment, Name) *</span>
          </div>
          {!studentFile ? (
            <button className="file-choose-button-inline" onClick={() => studentFileRef.current?.click()} type="button">
              <Upload size={18} /><span>Choose File</span>
            </button>
          ) : (
            <div className="file-selected-inline">
              <span className="file-name">{studentFile.name}</span>
              <button className="remove-button-inline" onClick={handleRemoveStudentFile} type="button">Remove</button>
            </div>
          )}
          <input ref={studentFileRef} type="file" accept=".xlsx,.xls" onChange={handleStudentFileChange} style={{ display: 'none' }} />
        </div>

        <div className="file-upload-row">
          <div className="file-upload-info">
            <FileText size={20} className="file-icon" />
            <span className="file-label">Semester Result (Manual: Enr, Marks, Class) *</span>
          </div>
          {!resultFile ? (
            <button className="file-choose-button-inline" onClick={() => resultFileRef.current?.click()} type="button">
              <Upload size={18} /><span>Choose File</span>
            </button>
          ) : (
            <div className="file-selected-inline">
              <span className="file-name">{resultFile.name}</span>
              <button className="remove-button-inline" onClick={handleRemoveResultFile} type="button">Remove</button>
            </div>
          )}
          <input ref={resultFileRef} type="file" accept=".xlsx,.xls" onChange={handleResultFileChange} style={{ display: 'none' }} />
        </div>
      </div>

      <div className="action-footer">
        <button
          className="process-button"
          disabled={loading || !selectedSemester || !studentFile || !resultFile}
          onClick={handleProcess}
        >
          {loading ? 'Generating...' : 'Generate API Report'}
        </button>
      </div>
    </div>
  );
}