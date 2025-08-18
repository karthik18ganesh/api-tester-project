import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import TestExecution from '../TestExecution';

// Mock dependencies
jest.mock('react-toastify');
jest.mock('../../../utils/api');
jest.mock('../../../stores/authStore');
jest.mock('../../../stores/projectStore');

// Mock the API response for ERR-423
const mockApi = require('../../../utils/api');
mockApi.api.mockImplementation((url, method, body) => {
  // Simulate ERR-423 response for test suite execution
  if (url.includes('/api/v1/test-execution/suite/') && method === 'POST') {
    return Promise.resolve({
      result: {
        code: 'ERR-423',
        message:
          'This test case has dynamic variable configuration, cannot be executed separately',
      },
    });
  }

  // Default success response
  return Promise.resolve({
    executionId: 'test-123',
    status: 'Running',
    testCaseResult: [],
  });
});

describe('TestExecution ERR-423 Error Handling', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock auth store
    const { useAuthStore } = require('../../../stores/authStore');
    useAuthStore.mockReturnValue({
      user: { username: 'testuser' },
    });

    // Mock project store
    const { useProjectStore } = require('../../../stores/projectStore');
    useProjectStore.mockReturnValue({
      activeProject: { id: 'test-project' },
    });
  });

  test('should show error modal when ERR-423 occurs', async () => {
    render(
      <BrowserRouter>
        <TestExecution />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Execution')).toBeInTheDocument();
    });

    // Select a test suite (you'll need to mock the hierarchy data)
    // This is a simplified test - in a real scenario you'd need to mock the hierarchy API

    // Trigger execution
    const runButton = screen.getByText(/Run/);
    fireEvent.click(runButton);

    // Check if error modal appears
    await waitFor(() => {
      expect(
        screen.getByText('Execution Strategy Conflict')
      ).toBeInTheDocument();
    });
  });

  test('should retry with sequential when user clicks retry button', async () => {
    render(
      <BrowserRouter>
        <TestExecution />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Execution')).toBeInTheDocument();
    });

    // Trigger execution to get ERR-423
    const runButton = screen.getByText(/Run/);
    fireEvent.click(runButton);

    // Wait for error modal
    await waitFor(() => {
      expect(
        screen.getByText('Execution Strategy Conflict')
      ).toBeInTheDocument();
    });

    // Click retry with sequential
    const retryButton = screen.getByText(/Run with Sequential Strategy/);
    fireEvent.click(retryButton);

    // Check if success toast is shown
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining(
          'is now running with Sequential execution strategy'
        )
      );
    });
  });

  test('should track error analytics when ERR-423 occurs', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(
      <BrowserRouter>
        <TestExecution />
      </BrowserRouter>
    );

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText('Test Execution')).toBeInTheDocument();
    });

    // Trigger execution
    const runButton = screen.getByText(/Run/);
    fireEvent.click(runButton);

    // Check if analytics are logged
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Execution error analytics:',
        expect.objectContaining({
          error_code: 'ERR-423',
          user_action: 'error_occurred',
        })
      );
    });

    consoleSpy.mockRestore();
  });
});
