export const testHierarchy = {
  id: 'pkg-001',
  name: 'Test Package',
  type: 'package',
  children: [
    {
      id: 'ts-001',
      name: 'Test Suite 1',
      type: 'suite',
      children: [
        {
          id: 'tc-001',
          name: 'Test Case 1.1',
          type: 'case',
        },
        {
          id: 'tc-002',
          name: 'Test Case 1.2',
          type: 'case',
        },
      ],
    },
    {
      id: 'ts-002',
      name: 'Test Suite 2',
      type: 'suite',
      children: [
        {
          id: 'tc-003',
          name: 'Test Case 2.1',
          type: 'case',
        },
        {
          id: 'tc-004',
          name: 'Test Case 2.2',
          type: 'case',
        },
      ],
    },
  ],
};

export const executionResults = {
  'exec-20405009-001': {
    id: 'exec-20405009-001',
    status: 'Failed',
    instanceId: 'exec-20405009-001',
    executedBy: 'karthik.g',
    environment: 'Staging',
    executedAt: 'May 9, 2025 - 10:32 AM',
    passedCount: 1,
    failedCount: 1,
    results: [
      {
        id: 'tc-001',
        name: 'Test Case 1.1',
        status: 'Passed',
        duration: '0.84s',
        request: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: {
            'Authorization': 'Bearer token'
          }
        },
        response: {
          status: 200,
          data: {
            id: 1,
            name: 'Example'
          }
        },
        assertions: [
          { id: 1, description: 'Status code is 200', status: 'Passed' },
          { id: 2, description: 'Response body contains "Example"', status: 'Passed' }
        ]
      },
      {
        id: 'tc-002',
        name: 'Test Case 1.2',
        status: 'Failed',
        duration: '1.3s',
        request: {
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: {
            'Authorization': 'Bearer token'
          }
        },
        response: {
          status: 200,
          data: {
            id: 1,
            name: 'Example'
          }
        },
        assertions: [
          { id: 1, description: 'Status code is 200', status: 'Passed' },
          { id: 2, description: 'Response body contains "Example"', status: 'Passed' },
          { id: 3, description: 'Response time is less than 500ms', status: 'Failed' }
        ]
      }
    ]
  }
};

export const executionHistory = [
  {
    id: 'exec-202505091',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505092',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505093',
    status: 'Passed',
    passedFailed: '5/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505094',
    status: 'Failed',
    passedFailed: '3/5',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
  {
    id: 'exec-202505095',
    status: 'Failed',
    passedFailed: '2/10',
    executedAt: 'May 9, 2025 - 11:15 AM',
    executedBy: 'karthik G'
  },
]; 