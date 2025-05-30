import React, { useState } from 'react';
import { FiCode, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter, FiDownload, FiUpload } from 'react-icons/fi';
import { Card, Button, Input, Badge } from '../../components/UI';
import { PageLayout } from '../../components/UI';
import Breadcrumb from '../../components/common/Breadcrumb';

const FunctionsVariables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('functions');

  // Mock data for functions
  const mockFunctions = [
    {
      id: 1,
      name: 'generateAuthToken',
      description: 'Generates JWT authentication token for API requests',
      parameters: ['username', 'password'],
      returnType: 'String',
      category: 'Authentication',
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'validateResponse',
      description: 'Validates API response structure and data types',
      parameters: ['response', 'schema'],
      returnType: 'Boolean',
      category: 'Validation',
      lastModified: '2024-01-14'
    },
    {
      id: 3,
      name: 'generateTestData',
      description: 'Creates random test data for API testing',
      parameters: ['dataType', 'count'],
      returnType: 'Array',
      category: 'Data Generation',
      lastModified: '2024-01-13'
    }
  ];

  // Mock data for variables
  const mockVariables = [
    {
      id: 1,
      name: 'BASE_URL',
      value: 'https://api.example.com/v1',
      type: 'String',
      scope: 'Global',
      category: 'Environment',
      lastModified: '2024-01-15'
    },
    {
      id: 2,
      name: 'API_TIMEOUT',
      value: '30000',
      type: 'Number',
      scope: 'Global',
      category: 'Configuration',
      lastModified: '2024-01-14'
    },
    {
      id: 3,
      name: 'TEST_USER_ID',
      value: 'user_12345',
      type: 'String',
      scope: 'Test Suite',
      category: 'Test Data',
      lastModified: '2024-01-13'
    }
  ];

  const filteredFunctions = mockFunctions.filter(func =>
    func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    func.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVariables = mockVariables.filter(variable =>
    variable.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variable.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryColor = (category) => {
    const colors = {
      'Authentication': 'success',
      'Validation': 'info',
      'Data Generation': 'warning',
      'Environment': 'primary',
      'Configuration': 'secondary',
      'Test Data': 'info'
    };
    return colors[category] || 'gray';
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
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <FiUpload className="h-4 w-4" />
              Import
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center gap-2">
              <FiDownload className="h-4 w-4" />
              Export
            </Button>
            <Button variant="primary" className="flex items-center gap-2">
              <FiPlus className="h-4 w-4" />
              Create New
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('functions')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'functions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Functions ({mockFunctions.length})
            </button>
            <button
              onClick={() => setActiveTab('variables')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'variables'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Variables ({mockVariables.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={FiSearch}
          />
        </div>
        <Button variant="secondary" size="sm" className="flex items-center gap-2">
          <FiFilter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Functions Tab */}
      {activeTab === 'functions' && (
        <div className="space-y-4">
          {filteredFunctions.map((func) => (
            <Card key={func.id} className="hover:shadow-md transition-shadow">
              <Card.Body>
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
                      <span>Parameters: {func.parameters.join(', ')}</span>
                      <span>Returns: {func.returnType}</span>
                      <span>Modified: {func.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getCategoryColor(func.category)}>
                      {func.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <FiEdit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Variables Tab */}
      {activeTab === 'variables' && (
        <div className="space-y-4">
          {filteredVariables.map((variable) => (
            <Card key={variable.id} className="hover:shadow-md transition-shadow">
              <Card.Body>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                        <FiCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{variable.name}</h3>
                        <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                          {variable.value}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Type: {variable.type}</span>
                      <span>Scope: {variable.scope}</span>
                      <span>Modified: {variable.lastModified}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getCategoryColor(variable.category)}>
                      {variable.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <FiEdit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <FiTrash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((activeTab === 'functions' && filteredFunctions.length === 0) ||
        (activeTab === 'variables' && filteredVariables.length === 0)) && (
        <Card>
          <Card.Body className="text-center py-12">
            <FiCode className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} found
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? `No ${activeTab} match your search criteria.`
                : `Get started by creating your first ${activeTab.slice(0, -1)}.`
              }
            </p>
            <Button variant="primary" className="flex items-center gap-2">
              <FiPlus className="h-4 w-4" />
              Create {activeTab.slice(0, -1)}
            </Button>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default FunctionsVariables; 