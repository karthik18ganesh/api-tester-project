import React, { useState, useEffect } from 'react';
import { FiCode, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter, FiDownload, FiUpload, FiPlay } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Breadcrumb from '../../components/common/Breadcrumb';

const FunctionsVariables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('functions');
  const [functions, setFunctions] = useState([]);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize with empty arrays - in real implementation, this would fetch from API
  useEffect(() => {
    // Placeholder for API calls
    setFunctions([]);
    setVariables([]);
  }, []);

  const filteredFunctions = functions.filter(func =>
    func.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVariables = variables.filter(variable =>
    variable.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.value?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateFunction = () => {
    toast.info('Function creation will be available in a future update');
  };

  const handleCreateVariable = () => {
    toast.info('Variable creation will be available in a future update');
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Authentication': 'bg-green-100 text-green-800',
      'Validation': 'bg-blue-100 text-blue-800',
      'Data Generation': 'bg-yellow-100 text-yellow-800',
      'Environment': 'bg-indigo-100 text-indigo-800',
      'Configuration': 'bg-gray-100 text-gray-800',
      'Test Data': 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 text-gray-800 font-inter">
      <Breadcrumb />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Functions & Variables</h1>
            <p className="text-gray-600">Manage reusable functions and global variables for your API tests</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              onClick={() => toast.info('Import functionality coming soon')}
            >
              <FiUpload className="h-4 w-4" />
              Import
            </button>
            <button
              className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              onClick={() => toast.info('Export functionality coming soon')}
            >
              <FiDownload className="h-4 w-4" />
              Export
            </button>
            <button
              onClick={activeTab === 'functions' ? handleCreateFunction : handleCreateVariable}
              className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <FiPlus className="h-4 w-4" />
              Create {activeTab === 'functions' ? 'Function' : 'Variable'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('functions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm hover:-translate-y-0.5 transition-all ${
                activeTab === 'functions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Functions ({functions.length})
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`py-2 px-1 border-b-2 font-medium text-sm hover:-translate-y-0.5 transition-all ${
                activeTab === 'variables'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Variables ({variables.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <button 
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 hover:-translate-y-0.5 transition-all flex items-center gap-2"
          onClick={() => toast.info('Filter functionality coming soon')}
        >
          <FiFilter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Functions Tab */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          {filteredFunctions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FiCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Functions Created</h3>
              <p className="text-gray-600 mb-4">
                Create reusable functions to enhance your API testing capabilities
              </p>
              <button
                onClick={handleCreateFunction}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
              >
                <FiPlus className="h-4 w-4" />
                Create Your First Function
              </button>
            </div>
          ) : (
            filteredFunctions.map((func) => (
              <div key={func.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <FiCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{func.name}</h3>
                        <p className="text-sm text-gray-600">{func.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Parameters: {func.parameters?.join(', ') || 'None'}</span>
                      <span>Returns: {func.returnType}</span>
                      <span>Modified: {func.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(func.category)}`}>
                      {func.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:-translate-y-0.5 transition-all rounded">
                        <FiPlay className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-indigo-600 hover:-translate-y-0.5 transition-all rounded">
                        <FiEdit3 className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:-translate-y-0.5 transition-all rounded">
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Variables Tab */}
      {activeTab === 'variables' && (
        <div className="space-y-4">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FiCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Variables Created</h3>
              <p className="text-gray-600 mb-4">
                Create global variables to store reusable values across your tests
              </p>
              <button
                onClick={handleCreateVariable}
                className="px-4 py-2 bg-[#4F46E5] text-white rounded-md text-sm hover:bg-[#4338CA] hover:-translate-y-0.5 transition-all flex items-center gap-2 mx-auto"
              >
                <FiPlus className="h-4 w-4" />
                Create Your First Variable
              </button>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scope</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVariables.map((variable) => (
                    <tr key={variable.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{variable.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{variable.value}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                          {variable.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {variable.scope}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(variable.category)}`}>
                          {variable.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:text-indigo-600 hover:-translate-y-0.5 transition-all">
                            <FiEdit3 className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-red-600 hover:-translate-y-0.5 transition-all">
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FunctionsVariables; 