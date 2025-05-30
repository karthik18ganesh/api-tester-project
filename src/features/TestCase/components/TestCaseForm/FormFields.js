import React from 'react';

const FormFields = React.memo(({
  formData,
  apiOptions,
  loading,
  loadingApis,
  selectedApiId,
  selectedApiDetails,
  onFieldChange
}) => {
  return (
    <div className="grid grid-cols-3 gap-4 mt-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Test case name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="testCaseName"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.testCaseName}
          onChange={onFieldChange}
          disabled={loading}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          name="type"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.type}
          onChange={onFieldChange}
          disabled={loading}
        >
          <option value="">Select</option>
          <option value="functional">functional</option>
          <option value="performance">performance</option>
          <option value="security">security</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          Response type <span className="text-red-500">*</span>
        </label>
        <select
          name="responseType"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.responseType}
          onChange={onFieldChange}
          disabled={loading}
        >
          <option value="">Select</option>
          <option value="json">json</option>
          <option value="xml">xml</option>
          <option value="text">text</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">API</label>
        <select
          name="api"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.api}
          onChange={onFieldChange}
          disabled={loading || loadingApis}
        >
          <option value="">Select</option>
          {apiOptions.map((api) => (
            <option key={api.id} value={api.name}>
              {api.name} ({api.method} {api.url})
            </option>
          ))}
        </select>
        {loadingApis && (
          <div className="text-xs text-gray-500 mt-1">Loading API details...</div>
        )}
        {selectedApiId && (
          <div className="text-xs text-green-600 mt-1">
            ✓ API associated (ID: {selectedApiId})
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          API Type <span className="text-red-500">*</span>
        </label>
        <select
          name="apiType"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.apiType}
          onChange={onFieldChange}
          disabled={loading || selectedApiDetails}
        >
          <option value="">Select</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
        {selectedApiDetails && (
          <div className="text-xs text-gray-500 mt-1">
            Using method from selected API
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">
          URL <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="url"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.url}
          onChange={onFieldChange}
          placeholder="/api/endpoint"
          disabled={loading || selectedApiDetails}
        />
        {selectedApiDetails && (
          <div className="text-xs text-gray-500 mt-1">
            Using URL from selected API
          </div>
        )}
      </div>

      <div className="col-span-3">
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          rows="3"
          className="border border-gray-300 rounded p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.description}
          onChange={onFieldChange}
          disabled={loading}
        />
      </div>
    </div>
  );
});

FormFields.displayName = 'FormFields';

export default FormFields; 