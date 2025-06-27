import React, { useState, useEffect } from 'react';
import { FiInfo, FiPlay, FiCheck, FiX, FiBookOpen } from 'react-icons/fi';
import Modal from '../../../../components/UI/Modal';
import Button from '../../../../components/UI/Button';
import {
  AssertionTypes,
  AssertionOperators,
  createAssertion,
  createAssertionConfig,
  getAssertionTypeInfo,
  validateAssertion,
  AssertionTemplates
} from '../../types/assertionTypes';
import { AssertionEngine } from '../../utils/assertionEngine';

const AssertionEditorModal = ({ 
  isOpen, 
  isEdit, 
  assertion = null, 
  onSave, 
  onClose, 
  sampleResponse = null 
}) => {
  const [formData, setFormData] = useState(() => {
    if (assertion) {
      return {
        name: assertion.name || '',
        description: assertion.description || '',
        type: assertion.type || AssertionTypes.JSON_PATH,
        isEnabled: assertion.isEnabled !== undefined ? assertion.isEnabled : true,
        config: {
          target: assertion.config?.target || '',
          operator: assertion.config?.operator || AssertionOperators.EQUALS,
          expectedValue: assertion.config?.expectedValue || '',
          caseSensitive: assertion.config?.caseSensitive || false,
          customMessage: assertion.config?.customMessage || '',
          timeout: assertion.config?.timeout || 5000,
          retryCount: assertion.config?.retryCount || 0
        }
      };
    }
    
    return {
      name: '',
      description: '',
      type: AssertionTypes.JSON_PATH,
      isEnabled: true,
      config: createAssertionConfig()
    };
  });

  const [errors, setErrors] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Get type info for current assertion type
  const typeInfo = getAssertionTypeInfo(formData.type);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle config field changes
  const handleConfigChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[`config.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`config.${field}`]: undefined
      }));
    }
  };

  // Handle type change - update default config
  const handleTypeChange = (newType) => {
    const newTypeInfo = getAssertionTypeInfo(newType);
    const defaultOperator = newTypeInfo.supportedOperators[0] || AssertionOperators.EQUALS;
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      config: {
        ...prev.config,
        target: newTypeInfo.targetPlaceholder || prev.config.target,
        operator: defaultOperator,
        expectedValue: ''
      }
    }));
    setTestResult(null);
  };

  // Test assertion against sample response
  const handleTestAssertion = async () => {
    if (!sampleResponse) return;
    
    const validation = validateAssertion({
      ...formData,
      id: 'temp-test'
    });
    
    if (!validation.isValid) {
      setErrors(validation.errors.reduce((acc, error) => {
        acc.general = error;
        return acc;
      }, {}));
      return;
    }

    try {
      setIsTesting(true);
      const testAssertion = createAssertion({
        ...formData,
        id: 'temp-test'
      });
      
      const result = await AssertionEngine.executeAssertion(
        testAssertion,
        sampleResponse,
        { responseTime: 500 }
      );
      
      setTestResult(result);
    } catch (error) {
      setTestResult({
        status: 'ERROR',
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const assertionData = createAssertion(formData);
    const validation = validateAssertion(assertionData);
    
    if (!validation.isValid) {
      const errorMap = {};
      validation.errors.forEach(error => {
        if (error.includes('name')) errorMap.name = error;
        else if (error.includes('type')) errorMap.type = error;
        else if (error.includes('target')) errorMap['config.target'] = error;
        else if (error.includes('operator')) errorMap['config.operator'] = error;
        else if (error.includes('expectedValue')) errorMap['config.expectedValue'] = error;
        else errorMap.general = error;
      });
      setErrors(errorMap);
      return;
    }
    
    onSave(assertionData);
  };

  // Apply template
  const applyTemplate = (template) => {
    const templateAssertion = template.assertions[0]; // Apply first assertion from template
    if (!templateAssertion) return;
    
    setFormData(prev => ({
      ...prev,
      name: templateAssertion.name,
      type: templateAssertion.type,
      config: { ...templateAssertion.config }
    }));
    setShowTemplates(false);
    setTestResult(null);
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEdit ? 'Edit Assertion' : 'Create Assertion'} 
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header with Templates */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {isEdit ? 'Edit Assertion' : 'Create Assertion'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Configure validation rules for API responses
            </p>
          </div>
          
          {!isEdit && (
            <Button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              variant="secondary"
              size="sm"
              icon={FiBookOpen}
            >
              Templates
            </Button>
          )}
        </div>

        {/* Templates Section */}
        {showTemplates && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Quick Start Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(AssertionTemplates).map(([key, template]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="text-left p-3 bg-white rounded border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h5 className="font-medium text-gray-900">{template.name}</h5>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {template.assertions.length} assertion{template.assertions.length > 1 ? 's' : ''}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            {/* Assertion Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assertion Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Validate user ID exists"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional description of what this assertion validates"
              />
            </div>

            {/* Assertion Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assertion Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.type ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {Object.entries(AssertionTypes).map(([key, value]) => {
                  const info = getAssertionTypeInfo(value);
                  return (
                    <option key={key} value={value}>
                      {info.label}
                    </option>
                  );
                })}
              </select>
              {errors.type && (
                <p className="text-sm text-red-600 mt-1">{errors.type}</p>
              )}
              
              {/* Type Description */}
              <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-sm text-blue-700">{typeInfo.description}</p>
              </div>
            </div>

            {/* Settings */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isEnabled}
                  onChange={(e) => handleFieldChange('isEnabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Enabled</span>
              </label>
            </div>
          </div>

          {/* Right Column - Assertion Configuration */}
          <div className="space-y-4">
            {/* Target Path */}
            {formData.type !== AssertionTypes.RESPONSE_TIME && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Path *
                </label>
                <input
                  type="text"
                  value={formData.config.target}
                  onChange={(e) => handleConfigChange('target', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors['config.target'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={typeInfo.targetPlaceholder}
                />
                {errors['config.target'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['config.target']}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Use dot notation for nested objects: response.body.data.field
                </p>
              </div>
            )}

            {/* Operator */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Operator *
              </label>
              <select
                value={formData.config.operator}
                onChange={(e) => handleConfigChange('operator', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors['config.operator'] ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {typeInfo.supportedOperators.map(operator => (
                  <option key={operator} value={operator}>
                    {operator.replace(/_/g, ' ').toLowerCase()}
                  </option>
                ))}
              </select>
              {errors['config.operator'] && (
                <p className="text-sm text-red-600 mt-1">{errors['config.operator']}</p>
              )}
            </div>

            {/* Expected Value */}
            {![AssertionOperators.EXISTS, AssertionOperators.NOT_EXISTS, AssertionOperators.IS_EMPTY, AssertionOperators.IS_NOT_EMPTY].includes(formData.config.operator) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Value *
                </label>
                <input
                  type="text"
                  value={formData.config.expectedValue}
                  onChange={(e) => handleConfigChange('expectedValue', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors['config.expectedValue'] ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder={
                    formData.type === AssertionTypes.REGEX ? 'Regular expression pattern' :
                    formData.type === AssertionTypes.RESPONSE_TIME ? 'Time in milliseconds' :
                    'Expected value to compare against'
                  }
                />
                {errors['config.expectedValue'] && (
                  <p className="text-sm text-red-600 mt-1">{errors['config.expectedValue']}</p>
                )}
              </div>
            )}

            {/* Additional Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.config.caseSensitive}
                  onChange={(e) => handleConfigChange('caseSensitive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Case sensitive comparison</span>
              </label>
            </div>

            {/* Custom Error Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Error Message
              </label>
              <input
                type="text"
                value={formData.config.customMessage}
                onChange={(e) => handleConfigChange('customMessage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Optional custom error message"
              />
            </div>

            {/* Test Section */}
            {sampleResponse && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Test Assertion</h4>
                  <Button
                    type="button"
                    onClick={handleTestAssertion}
                    disabled={isTesting}
                    variant="success"
                    size="sm"
                    loading={isTesting}
                    icon={FiPlay}
                  >
                    Test
                  </Button>
                </div>
                
                {testResult && (
                  <div className={`p-3 rounded border ${
                    testResult.status === 'PASSED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {testResult.status === 'PASSED' ? (
                        <FiCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <FiX className="w-4 h-4 text-red-600" />
                      )}
                      <span className={testResult.status === 'PASSED' ? 'text-green-700' : 'text-red-700'}>
                        {testResult.status}
                      </span>
                      {testResult.executionTime && (
                        <span className="text-gray-500">({testResult.executionTime}ms)</span>
                      )}
                    </div>
                    
                    {testResult.actualValue !== undefined && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">Actual: </span>
                        <code className="bg-gray-100 px-1 rounded">{JSON.stringify(testResult.actualValue)}</code>
                      </div>
                    )}
                    
                    {testResult.error && (
                      <p className="text-sm text-red-600 mt-2">{testResult.error}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
          >
            {isEdit ? 'Update Assertion' : 'Create Assertion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssertionEditorModal; 