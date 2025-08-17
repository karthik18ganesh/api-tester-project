// src/utils/bulkUploadApi.js
import { useAuthStore } from '../stores/authStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const BULK_PREFIX = '/api/bulk-upload';

const buildAuthHeader = () => {
  try {
    const token = useAuthStore.getState()?.token || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
};

export const downloadTemplate = async () => {
  const url = `${BASE_URL}${BULK_PREFIX}/download-template`;
  const res = await fetch(url, { headers: { ...buildAuthHeader() } });
  if (!res.ok) throw new Error(`Failed to download template (HTTP ${res.status})`);

  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition') || '';
  const fileNameMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
  const fileName = decodeURIComponent(fileNameMatch?.[1] || fileNameMatch?.[2] || 'Template_Automation.xlsx');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
};

export const validateBulkUpload = async ({ file, userId, projectId }) => {
  const url = `${BASE_URL}${BULK_PREFIX}/validate`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', String(userId ?? '')); // backend expects integer
  formData.append('projectId', String(projectId ?? ''));

  const res = await fetch(url, {
    method: 'POST',
    headers: { ...buildAuthHeader() }, // do NOT set Content-Type for multipart
    body: formData,
  });

  if (!res.ok) {
    // Backend may return empty body on errors
    const status = res.status;
    throw new Error(status === 400 ? 'Invalid file. Please upload a .xlsx template.' : `Validation failed (HTTP ${status})`);
  }

  const json = await res.json();
  return json; // BulkUploadResponse
};

export const processBulkUpload = async ({ uploadId, projectId, userId, confirmWarnings = false }) => {
  const url = `${BASE_URL}${BULK_PREFIX}/process`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...buildAuthHeader() },
    body: JSON.stringify({ uploadId, projectId: String(projectId), userId: String(userId), confirmWarnings }),
  });

  if (!res.ok) {
    // Handle error response
    let errorJson = null;
    try {
      const text = await res.text();
      errorJson = JSON.parse(text);
    } catch {
      // ignore parse errors
    }
    const message = errorJson?.result?.message || 'Processing failed';
    const details = errorJson?.result?.details;
    const code = errorJson?.result?.code || res.status;
    const composed = details ? `${message}: ${details}` : message;
    throw new Error(`${composed} (code ${code})`);
  }

  // Success response is now JSON with detailed information
  const json = await res.json();
  return json; // Returns the new response format with fileName, fileSize, completedAt, projectId, totalComponents
};

// Helper: Map backend sheet type to UI type key
export const mapSheetTypeToUi = (backendType) => {
  const t = (backendType || '').toLowerCase();
  if (t.includes('package')) return 'test-package';
  if (t.includes('suite')) return 'test-suite';
  if (t.includes('case')) return 'test-case';
  return 'unknown';
};

// Helper: Transform backend response into UI-friendly structure
export const transformValidationResponse = (bulkUploadResponse) => {
  const { success, data, processingTime } = bulkUploadResponse || {};
  const uploadId = data?.uploadId;
  const fileName = data?.fileName;
  const fileSize = data?.fileSize;

  const sheets = (data?.sheets || []).map((sheet) => {
    const uiType = mapSheetTypeToUi(sheet.type);
    const columns = sheet.columns || [];
    const validationStatusRaw = sheet.validationStatus || '';
    const validationStatus = validationStatusRaw === 'success' ? 'valid' : validationStatusRaw;

    // Build row objects keyed by column headers where possible
    const rows = Array.isArray(sheet.data) ? sheet.data : [];

    const mapRowByType = (row) => {
      // Map known camelCase keys to header names so the table can render row[column]
      const out = {};
      if (uiType === 'test-package') {
        out['Package_Name'] = row.packageName ?? row['Package_Name'];
        out['Description'] = row.description ?? row['Description'];
        out['Execution'] = row.execution ?? row['Execution'];
        out['Execution_Type'] = row.executionType ?? row['Execution_Type'];
        out['Report_Type'] = row.reportType ?? row['Report_Type'];
        out['Project_ID'] = row.projectId ?? row['Project_ID'];
      } else if (uiType === 'test-suite') {
        out['Suite_Name'] = row.suiteName ?? row['Suite_Name'];
        out['Description'] = row.description ?? row['Description'];
        out['Execution'] = row.execution ?? row['Execution'];
        out['Execution_Type'] = row.executionType ?? row['Execution_Type'];
        out['Publish_method'] = row.publishMethod ?? row['Publish_method'];
        out['FTP_Path'] = row.ftpPath ?? row['FTP_Path'];
        out['Email'] = row.email ?? row['Email'];
        out['Report_Type'] = row.reportType ?? row['Report_Type'];
        out['Package_Name'] = row.packageName ?? row['Package_Name'];
      } else if (uiType === 'test-case') {
        out['TestCaseName'] = row.testCaseName ?? row['TestCaseName'];
        out['Type'] = row.type ?? row['Type'];
        out['RESPONSE_TYPE'] = row.responseType ?? row['RESPONSE_TYPE'];
        out['API_ID'] = row.testCaseId ?? row.apiId ?? row['API_ID'];
        out['DESCRIPTION'] = row.description ?? row['DESCRIPTION'];
        out['Suite_Name'] = row.suiteName ?? row['Suite_Name'];
      }
      // Ensure all columns exist
      columns.forEach((col) => {
        if (!(col in out)) out[col] = row[col] ?? '';
      });
      return out;
    };

    const mappedData = rows.map(mapRowByType);

    // Normalize errors
    const errorsRaw = Array.isArray(sheet.errors) ? sheet.errors : [];
    const errors = errorsRaw.flatMap((err) => {
      const messages = Array.isArray(err.messages) ? err.messages : [err.message].filter(Boolean);
      if (!messages.length) return [];
      return messages.map((m) => ({ row: err.row, column: err.column, message: m, severity: err.severity || 'error' }));
    });

    return {
      name: sheet.name,
      type: uiType,
      rows: sheet.rowCount ?? mappedData.length,
      columns,
      data: mappedData,
      validationStatus,
      errors,
    };
  });

  const totalRows = sheets.reduce((sum, s) => sum + (s.rows || 0), 0);

  return {
    success: Boolean(success),
    uploadId,
    fileName,
    fileSize,
    processingTime,
    sheets,
    totalRows,
  };
};



