import React, { useState } from 'react';
import { FiSave, FiSearch, FiSettings, FiCheck, FiX } from 'react-icons/fi';
import Breadcrumb from '../common/Breadcrumb';
import { Button, Input, Card, Badge } from '../UI';

const DesignSystemDemo = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="page-container">
      {/* Breadcrumb Demo */}
      <Breadcrumb />
      
      <div className="page-header">
        <h1 className="page-title">Design System Demo</h1>
        <p className="page-subtitle">
          Showcase of all standardized UI components and design patterns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buttons Demo */}
        <Card>
          <Card.Header>
            <Card.Title>Buttons</Card.Title>
            <Card.Description>Various button styles and states</Card.Description>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary">Small</Button>
              <Button size="md" variant="primary">Medium</Button>
              <Button size="lg" variant="primary">Large</Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" icon={FiSave}>With Icon</Button>
              <Button variant="secondary" icon={FiSettings} iconPosition="right">Icon Right</Button>
              <Button variant="primary" loading={loading} onClick={handleLoadingDemo}>
                {loading ? 'Loading...' : 'Click to Load'}
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </Card.Body>
        </Card>

        {/* Inputs Demo */}
        <Card>
          <Card.Header>
            <Card.Title>Form Inputs</Card.Title>
            <Card.Description>Input fields with various states</Card.Description>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Input
              label="Basic Input"
              placeholder="Enter text..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            
            <Input
              label="With Left Icon"
              leftIcon={FiSearch}
              placeholder="Search..."
            />
            
            <Input
              label="With Right Icon"
              rightIcon={FiX}
              placeholder="Clearable input"
              onRightIconClick={() => console.log('Clear clicked')}
            />
            
            <Input
              label="Required Field"
              required
              placeholder="This field is required"
              helpText="This is a helpful message"
            />
            
            <Input
              label="Error State"
              error="This field has an error"
              placeholder="Invalid input"
            />
          </Card.Body>
        </Card>

        {/* Badges Demo */}
        <Card>
          <Card.Header>
            <Card.Title>Status Badges</Card.Title>
            <Card.Description>Various badge styles for status indicators</Card.Description>
          </Card.Header>
          <Card.Body className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="success" icon={FiCheck}>Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="gray">Gray</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge size="sm" variant="success">Small</Badge>
              <Badge size="md" variant="success">Medium</Badge>
              <Badge size="lg" variant="success">Large</Badge>
            </div>
          </Card.Body>
        </Card>

        {/* Cards Demo */}
        <Card>
          <Card.Header>
            <Card.Title>Card Variations</Card.Title>
            <Card.Description>Different card layouts and styles</Card.Description>
          </Card.Header>
          <Card.Body className="space-y-4">
            <Card hover className="p-4">
              <h4 className="font-medium text-gray-900">Hover Card</h4>
              <p className="text-sm text-gray-600 mt-1">This card has hover effects</p>
            </Card>
            
            <Card>
              <Card.Header>
                <Card.Title as="h4">Nested Card</Card.Title>
              </Card.Header>
              <Card.Body>
                <p className="text-sm text-gray-600">Card with header and body</p>
              </Card.Body>
              <Card.Footer>
                <Button size="sm" variant="secondary">Action</Button>
              </Card.Footer>
            </Card>
          </Card.Body>
        </Card>

        {/* Color Palette Demo */}
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Color Palette</Card.Title>
            <Card.Description>Primary colors and status colors</Card.Description>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Primary</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-indigo-100 rounded flex items-center justify-center text-xs">100</div>
                  <div className="h-8 bg-indigo-300 rounded flex items-center justify-center text-xs">300</div>
                  <div className="h-8 bg-indigo-500 rounded flex items-center justify-center text-xs text-white">500</div>
                  <div className="h-8 bg-indigo-700 rounded flex items-center justify-center text-xs text-white">700</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Success</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-green-100 rounded flex items-center justify-center text-xs">100</div>
                  <div className="h-8 bg-green-300 rounded flex items-center justify-center text-xs">300</div>
                  <div className="h-8 bg-green-500 rounded flex items-center justify-center text-xs text-white">500</div>
                  <div className="h-8 bg-green-700 rounded flex items-center justify-center text-xs text-white">700</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Warning</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-yellow-100 rounded flex items-center justify-center text-xs">100</div>
                  <div className="h-8 bg-yellow-300 rounded flex items-center justify-center text-xs">300</div>
                  <div className="h-8 bg-yellow-500 rounded flex items-center justify-center text-xs text-white">500</div>
                  <div className="h-8 bg-yellow-700 rounded flex items-center justify-center text-xs text-white">700</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Error</h4>
                <div className="space-y-1">
                  <div className="h-8 bg-red-100 rounded flex items-center justify-center text-xs">100</div>
                  <div className="h-8 bg-red-300 rounded flex items-center justify-center text-xs">300</div>
                  <div className="h-8 bg-red-500 rounded flex items-center justify-center text-xs text-white">500</div>
                  <div className="h-8 bg-red-700 rounded flex items-center justify-center text-xs text-white">700</div>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DesignSystemDemo; 