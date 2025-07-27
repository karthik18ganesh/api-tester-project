import React, { useState, useCallback, useRef } from 'react';
import { 
  FiUpload, 
  FiFile, 
  FiCheckCircle, 
  FiXCircle, 
  FiAlertTriangle,
  FiDownload,
  FiEye,
  FiPlay,
  FiRefreshCw,
  FiTrash2,
  FiInfo,
  FiFileText,
  FiDatabase,
  FiFolder,
  FiArchive,
  FiLayers
} from 'react-icons/fi';
import { FaFileExcel, FaCloudUploadAlt } from 'react-icons/fa';
import Button from '../../../components/UI/Button';
import Modal from '../../../components/UI/Modal';
import Badge from '../../../components/UI/Badge';

// Mock Excel processing - In real implementation, use a library like SheetJS
const mockProcessExcel = (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fileName: file.name,
        fileSize: file.size,
        sheets: [
          {
            name: 'Test_Packages',
            type: 'test-package',
            rows: 5,
            columns: ['Package Name', 'Description', 'Environment', 'Priority', 'Owner'],
            data: [
              { 'Package Name': 'Payment API Tests', 'Description': 'Complete payment flow testing', 'Environment': 'QA', 'Priority': 'High', 'Owner': 'John Doe' },
              { 'Package Name': 'User Management Tests', 'Description': 'User CRUD operations', 'Environment': 'Staging', 'Priority': 'Medium', 'Owner': 'Sarah Smith' },
              { 'Package Name': 'Authentication Tests', 'Description': 'Login and security tests', 'Environment': 'QA', 'Priority': 'High', 'Owner': 'Mike Johnson' },
              { 'Package Name': 'Reporting Tests', 'Description': 'Report generation tests', 'Environment': 'Dev', 'Priority': 'Low', 'Owner': 'Emma Wilson' },
              { 'Package Name': 'Integration Tests', 'Description': 'Third-party API integration', 'Environment': 'QA', 'Priority': 'High', 'Owner': 'David Lee' }
            ],
            validationStatus: 'valid',
            errors: []
          },
          {
            name: 'Test_Suites',
            type: 'test-suite',
            rows: 8,
            columns: ['Suite Name', 'Package Name', 'Description', 'Priority', 'Tags'],
            data: [
              { 'Suite Name': 'Payment Flow', 'Package Name': 'Payment API Tests', 'Description': 'End-to-end payment testing', 'Priority': 'High', 'Tags': 'payment,critical' },
              { 'Suite Name': 'Refund Process', 'Package Name': 'Payment API Tests', 'Description': 'Refund scenarios', 'Priority': 'Medium', 'Tags': 'payment,refund' },
              { 'Suite Name': 'User Registration', 'Package Name': 'User Management Tests', 'Description': 'New user signup', 'Priority': 'High', 'Tags': 'user,registration' },
              { 'Suite Name': 'User Profile', 'Package Name': 'User Management Tests', 'Description': 'Profile management', 'Priority': 'Medium', 'Tags': 'user,profile' },
              { 'Suite Name': 'Login Security', 'Package Name': 'Authentication Tests', 'Description': 'Security validations', 'Priority': 'Critical', 'Tags': 'security,login' },
              { 'Suite Name': 'Password Reset', 'Package Name': 'Authentication Tests', 'Description': 'Password recovery', 'Priority': 'High', 'Tags': 'security,password' },
              { 'Suite Name': 'Sales Reports', 'Package Name': 'Reporting Tests', 'Description': 'Sales data reports', 'Priority': 'Medium', 'Tags': 'reports,sales' },
              { 'Suite Name': 'API Gateway', 'Package Name': 'Integration Tests', 'Description': 'Gateway testing', 'Priority': 'High', 'Tags': 'integration,gateway' }
            ],
            validationStatus: 'valid',
            errors: []
          },
          {
            name: 'Test_Cases',
            type: 'test-case',
            rows: 15,
            columns: ['Case Name', 'Suite Name', 'API ID', 'Method', 'Description', 'Priority'],
            data: [
              { 'Case Name': 'Valid Payment', 'Suite Name': 'Payment Flow', 'API ID': 'PAY_001', 'Method': 'POST', 'Description': 'Process valid payment', 'Priority': 'High' },
              { 'Case Name': 'Invalid Card', 'Suite Name': 'Payment Flow', 'API ID': 'PAY_001', 'Method': 'POST', 'Description': 'Handle invalid card', 'Priority': 'High' },
              { 'Case Name': 'Insufficient Funds', 'Suite Name': 'Payment Flow', 'API ID': 'PAY_001', 'Method': 'POST', 'Description': 'Insufficient balance', 'Priority': 'Medium' },
              { 'Case Name': 'Full Refund', 'Suite Name': 'Refund Process', 'API ID': 'REF_001', 'Method': 'POST', 'Description': 'Complete refund', 'Priority': 'High' },
              { 'Case Name': 'Partial Refund', 'Suite Name': 'Refund Process', 'API ID': 'REF_001', 'Method': 'POST', 'Description': 'Partial amount refund', 'Priority': 'Medium' },
              { 'Case Name': 'Valid Signup', 'Suite Name': 'User Registration', 'API ID': 'USER_001', 'Method': 'POST', 'Description': 'New user creation', 'Priority': 'Critical' },
              { 'Case Name': 'Duplicate Email', 'Suite Name': 'User Registration', 'API ID': 'USER_001', 'Method': 'POST', 'Description': 'Duplicate email validation', 'Priority': 'High' },
              { 'Case Name': 'Update Profile', 'Suite Name': 'User Profile', 'API ID': 'USER_002', 'Method': 'PUT', 'Description': 'Profile update', 'Priority': 'Medium' },
              { 'Case Name': 'Valid Login', 'Suite Name': 'Login Security', 'API ID': 'AUTH_001', 'Method': 'POST', 'Description': 'Successful login', 'Priority': 'Critical' },
              { 'Case Name': 'Invalid Password', 'Suite Name': 'Login Security', 'API ID': 'AUTH_001', 'Method': 'POST', 'Description': 'Wrong password', 'Priority': 'High' },
              { 'Case Name': 'Brute Force Protection', 'Suite Name': 'Login Security', 'API ID': 'AUTH_001', 'Method': 'POST', 'Description': 'Multiple failed attempts', 'Priority': 'Critical' },
              { 'Case Name': 'Password Reset Request', 'Suite Name': 'Password Reset', 'API ID': 'AUTH_002', 'Method': 'POST', 'Description': 'Request password reset', 'Priority': 'High' },
              { 'Case Name': 'Reset Token Validation', 'Suite Name': 'Password Reset', 'API ID': 'AUTH_003', 'Method': 'POST', 'Description': 'Validate reset token', 'Priority': 'High' },
              { 'Case Name': 'Monthly Sales Report', 'Suite Name': 'Sales Reports', 'API ID': 'RPT_001', 'Method': 'GET', 'Description': 'Generate monthly report', 'Priority': 'Medium' },
              { 'Case Name': 'Gateway Health Check', 'Suite Name': 'API Gateway', 'API ID': 'GW_001', 'Method': 'GET', 'Description': 'Gateway status', 'Priority': 'High' }
            ],
            validationStatus: 'warning',
            errors: [
              { row: 3, column: 'API ID', message: 'API ID PAY_001 not found in repository' },
              { row: 8, column: 'Method', message: 'Invalid HTTP method' }
            ]
          }
        ],
        totalRows: 28,
        processingTime: 1.2
      });
    }, 2000);
  });
};

const stepConfig = [
  { id: 'upload', title: 'Upload File', description: 'Select and upload your Excel file', icon: <FiUpload /> },
  { id: 'validate', title: 'Validate Data', description: 'Verify data structure and content', icon: <FiCheckCircle /> },
  { id: 'preview', title: 'Preview & Review', description: 'Review parsed data before processing', icon: <FiEye /> },
  { id: 'process', title: 'Process & Create', description: 'Create test components in the system', icon: <FiPlay /> }
];

const sheetTypeConfig = {
  'test-package': {
    label: 'Test Packages',
    icon: <FiArchive className="h-5 w-5" />,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Test package definitions and configurations'
  },
  'test-suite': {
    label: 'Test Suites',
    icon: <FiFolder className="h-5 w-5" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Test suite groupings with package associations'
  },
  'test-case': {
    label: 'Test Cases',
    icon: <FiFileText className="h-5 w-5" />,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Individual test cases with API associations'
  }
};

const BulkUpload = () => {
  const [currentStep, setCurrentStep] = useState('upload');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [processedData, setProcessedData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [createProgress, setCreateProgress] = useState({ current: 0, total: 0, status: 'idle' });
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setUploadedFile(file);
    setCurrentStep('validate');
    setProcessing(true);

    try {
      const processed = await mockProcessExcel(file);
      setProcessedData(processed);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setCurrentStep('upload');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setProcessedData(null);
    setCurrentStep('upload');
    setCreateProgress({ current: 0, total: 0, status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTestComponents = async () => {
    setCurrentStep('process');
    setCreateProgress({ current: 0, total: processedData.totalRows, status: 'processing' });

    // Simulate creation process
    for (let i = 0; i <= processedData.totalRows; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setCreateProgress(prev => ({ ...prev, current: i }));
    }

    setCreateProgress(prev => ({ ...prev, status: 'completed' }));
  };

  const openPreviewModal = (sheet) => {
    setSelectedSheet(sheet);
    setShowPreviewModal(true);
  };

  const downloadTemplate = () => {
    // In real implementation, this would download an actual Excel template
    const link = document.createElement('a');
    link.href = '#';
    link.download = 'bulk_upload_template.xlsx';
    link.click();
  };

  const getStepStatus = (stepId) => {
    const stepIndex = stepConfig.findIndex(s => s.id === stepId);
    const currentIndex = stepConfig.findIndex(s => s.id === currentStep);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FiLayers className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Bulk Upload</h1>
              <p className="text-emerald-100 mt-1">
                Import Test Packages, Suites, and Cases from Excel files
              </p>
            </div>
          </div>
          <div className="text-right">
            <Button
              onClick={downloadTemplate}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <FiDownload className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Upload Progress</h2>
          {uploadedFile && (
            <Button
              onClick={resetUpload}
              variant="secondary"
              size="sm"
            >
              <FiRefreshCw className="h-4 w-4 mr-2" />
              Start Over
            </Button>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          {stepConfig.map((step, index) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${status === 'current' ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                    ${status === 'pending' ? 'bg-gray-100 border-gray-300 text-gray-400' : ''}
                  `}>
                    {status === 'completed' ? <FiCheckCircle className="h-6 w-6" /> : step.icon}
                  </div>
                  <div className="text-center mt-3">
                    <div className={`text-sm font-medium ${status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-1 ${status === 'pending' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < stepConfig.length - 1 && (
                  <div className={`
                    flex-1 h-0.5 mx-4 transition-all
                    ${status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      {currentStep === 'upload' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div
            className={`
              border-2 border-dashed rounded-xl p-12 text-center transition-all
              ${dragActive 
                ? 'border-emerald-400 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className={`
                  p-4 rounded-full transition-all
                  ${dragActive ? 'bg-emerald-200' : 'bg-gray-100'}
                `}>
                  <FaCloudUploadAlt className={`
                    h-12 w-12 transition-all
                    ${dragActive ? 'text-emerald-600' : 'text-gray-400'}
                  `} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {dragActive ? 'Drop your Excel file here' : 'Upload Your Excel File'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop your Excel file here, or click to browse
                </p>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiFile className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              
              <div className="text-sm text-gray-500">
                Supported formats: .xlsx, .xls | Maximum size: 10MB
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <FiInfo className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Excel File Structure</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Sheet 1 - Test Packages:</strong> Package Name, Description, Environment, Priority, Owner</p>
                  <p><strong>Sheet 2 - Test Suites:</strong> Suite Name, Package Name, Description, Priority, Tags</p>
                  <p><strong>Sheet 3 - Test Cases:</strong> Case Name, Suite Name, API ID, Method, Description, Priority</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing */}
      {currentStep === 'validate' && processing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Your File</h3>
              <p className="text-gray-600">Analyzing Excel structure and validating data...</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <FaFileExcel className="h-5 w-5 text-green-600" />
                <span>File: {uploadedFile?.name}</span>
                <span>•</span>
                <span>Size: {(uploadedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview & Validation Results */}
      {currentStep === 'preview' && processedData && (
        <div className="space-y-6">
          {/* File Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <FiCheckCircle className="h-4 w-4 mr-1" />
                Processing Complete
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{processedData.sheets.length}</div>
                <div className="text-sm text-gray-600">Sheets Detected</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{processedData.totalRows}</div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {processedData.sheets.filter(s => s.validationStatus === 'valid').length}
                </div>
                <div className="text-sm text-gray-600">Valid Sheets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {processedData.sheets.filter(s => s.validationStatus === 'warning').length}
                </div>
                <div className="text-sm text-gray-600">Warnings</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <strong>File:</strong> {processedData.fileName} • 
              <strong> Processing Time:</strong> {processedData.processingTime}s • 
              <strong> Ready for import</strong>
            </div>
          </div>

          {/* Sheets Overview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Detected Sheets</h3>
            
            <div className="grid gap-4">
              {processedData.sheets.map((sheet, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${sheetTypeConfig[sheet.type]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {sheetTypeConfig[sheet.type]?.icon || <FiFile className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-gray-900">{sheet.name}</h4>
                          <Badge className={sheetTypeConfig[sheet.type]?.color || 'bg-gray-100 text-gray-800'}>
                            {sheetTypeConfig[sheet.type]?.label || 'Unknown'}
                          </Badge>
                          <Badge className={
                            sheet.validationStatus === 'valid' ? 'bg-green-100 text-green-800 border-green-200' :
                            sheet.validationStatus === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          }>
                            {sheet.validationStatus === 'valid' && <FiCheckCircle className="h-3 w-3 mr-1" />}
                            {sheet.validationStatus === 'warning' && <FiAlertTriangle className="h-3 w-3 mr-1" />}
                            {sheet.validationStatus === 'error' && <FiXCircle className="h-3 w-3 mr-1" />}
                            {sheet.validationStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {sheetTypeConfig[sheet.type]?.description} • {sheet.rows} rows • {sheet.columns.length} columns
                        </p>
                        {sheet.errors.length > 0 && (
                          <div className="mt-2">
                            <div className="text-sm text-amber-700 bg-amber-50 rounded px-2 py-1 inline-block">
                              {sheet.errors.length} validation issue{sheet.errors.length > 1 ? 's' : ''} found
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => openPreviewModal(sheet)}
                      variant="secondary"
                      size="sm"
                    >
                      <FiEye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                onClick={resetUpload}
                variant="secondary"
              >
                <FiTrash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleCreateTestComponents}
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={processedData.sheets.some(s => s.validationStatus === 'error')}
              >
                <FiPlay className="h-4 w-4 mr-2" />
                Create Test Components
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Processing Progress */}
      {currentStep === 'process' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              {createProgress.status === 'completed' ? (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="h-8 w-8 text-green-600" />
                </div>
              ) : (
                <div className="animate-pulse w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                  <FiLayers className="h-8 w-8 text-emerald-600" />
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {createProgress.status === 'completed' ? 'Test Components Created Successfully!' : 'Creating Test Components'}
              </h3>
              <p className="text-gray-600">
                {createProgress.status === 'completed' 
                  ? 'All test packages, suites, and cases have been created and are ready for use.'
                  : 'Please wait while we create your test components in the system...'
                }
              </p>
            </div>

            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{createProgress.current} / {createProgress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(createProgress.current / createProgress.total) * 100}%` }}
                />
              </div>
            </div>

            {createProgress.status === 'completed' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-purple-600">
                      {processedData.sheets.find(s => s.type === 'test-package')?.rows || 0}
                    </div>
                    <div className="text-sm text-purple-700">Test Packages</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-blue-600">
                      {processedData.sheets.find(s => s.type === 'test-suite')?.rows || 0}
                    </div>
                    <div className="text-sm text-blue-700">Test Suites</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-lg font-semibold text-green-600">
                      {processedData.sheets.find(s => s.type === 'test-case')?.rows || 0}
                    </div>
                    <div className="text-sm text-green-700">Test Cases</div>
                  </div>
                </div>
                
                <Button
                  onClick={resetUpload}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <FiUpload className="h-4 w-4 mr-2" />
                  Upload Another File
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={`Preview: ${selectedSheet?.name}`}
        size="xl"
      >
        {selectedSheet && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={sheetTypeConfig[selectedSheet.type]?.color}>
                {sheetTypeConfig[selectedSheet.type]?.icon}
                <span className="ml-2">{sheetTypeConfig[selectedSheet.type]?.label}</span>
              </Badge>
              <div className="text-sm text-gray-600">
                {selectedSheet.rows} rows • {selectedSheet.columns.length} columns
              </div>
            </div>

            {selectedSheet.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-2">Validation Issues</h4>
                <div className="space-y-1">
                  {selectedSheet.errors.map((error, index) => (
                    <div key={index} className="text-sm text-amber-700">
                      Row {error.row}, Column "{error.column}": {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {selectedSheet.columns.map((column, index) => (
                      <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSheet.data.slice(0, 10).map((row, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {selectedSheet.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-3 py-2 text-gray-900">
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {selectedSheet.data.length > 10 && (
                    <tr>
                      <td colSpan={selectedSheet.columns.length} className="px-3 py-2 text-center text-gray-500 italic">
                        ... and {selectedSheet.data.length - 10} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BulkUpload; 