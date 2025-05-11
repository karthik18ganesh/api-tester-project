import React, { useState, useEffect, useRef } from "react";
import { FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import IconButton from "../../../components/common/IconButton";
import Button from "../../../components/common/Button";
import { api } from "../../../utils/api";
import { nanoid } from "nanoid";
import ConfirmationModal from "../../../components/common/ConfirmationModal";

const ITEMS_PER_PAGE = 6;

const TestSuiteAssignmentForm = ({
  suiteId, // Pass the suite ID for API calls
  onComplete, // Callback for when the user is finished with this form
}) => {
  const [selectedCases, setSelectedCases] = useState([]);
  const [availableCases, setAvailableCases] = useState([]);
  const [associatedCases, setAssociatedCases] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [associating, setAssociating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caseToRemove, setCaseToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [savingFinal, setSavingFinal] = useState(false);
  
  // Use refs to track API call status and prevent duplicate calls
  const availableCasesLoaded = useRef(false);
  const associatedCasesLoaded = useRef(false);
  const apiCallInProgress = useRef(false);

  // Fetch all available test cases and associated test cases
  useEffect(() => {
    const fetchTestCases = async () => {
      // Skip if already loaded or API call is in progress
      if (availableCasesLoaded.current || apiCallInProgress.current) return;
      
      apiCallInProgress.current = true;
      setLoading(true);
      
      try {
        // First fetch all available test cases
        const allCasesJson = await api("/api/v1/test-cases?pageNo=0&limit=100&sortBy=createdDate&sortDir=DESC", "GET");
        const { code: allCasesCode, message: allCasesMessage, data: allCasesData } = allCasesJson.result;
        
        if (allCasesCode === "200") {
          const allFormattedCases = allCasesData.content.map(testCase => ({
            id: testCase.testCaseId,
            name: testCase.name,
            description: testCase.description || `Description for ${testCase.name}`,
            createdDate: new Date(testCase.createdDate).toLocaleDateString(),
            executedDate: testCase.executedDate ? new Date(testCase.executedDate).toLocaleDateString() : "-",
            status: testCase.status || "Pending",
          }));
          
          // If we have a suiteId, fetch associated test cases
          if (suiteId) {
            try {
              const associatedCasesJson = await api(`/api/v1/test-suites/${suiteId}/test-cases`, "GET");
              const { code: assocCode, data: assocData } = associatedCasesJson.result;
              
              if (assocCode === "200" && Array.isArray(assocData)) {
                // Format associated test cases
                const assocCases = assocData.map(testCase => ({
                  id: testCase.testCaseId,
                  name: testCase.name,
                  description: testCase.description || `Description for ${testCase.name}`,
                  createdDate: new Date(testCase.createdDate).toLocaleDateString(),
                  executedDate: testCase.executedDate ? new Date(testCase.executedDate).toLocaleDateString() : "-",
                  status: testCase.status || "Pending",
                }));
                
                setAssociatedCases(assocCases);
                
                // Filter out associated cases from all cases to get available cases
                const associatedIds = assocCases.map(tc => tc.id);
                const availableCasesFiltered = allFormattedCases.filter(tc => !associatedIds.includes(tc.id));
                setAvailableCases(availableCasesFiltered);
              } else {
                // If no associated cases or error, all cases are available
                setAvailableCases(allFormattedCases);
              }
            } catch (assocError) {
              console.error("Error fetching associated test cases:", assocError);
              // If error fetching associated cases, assume all cases are available
              setAvailableCases(allFormattedCases);
            }
          } else {
            // If no suiteId, all cases are available
            setAvailableCases(allFormattedCases);
          }
          
          // Mark as loaded
          availableCasesLoaded.current = true;
          associatedCasesLoaded.current = true;
        } else {
          toast.error(allCasesMessage || "Failed to fetch test cases");
        }
      } catch (error) {
        console.error("Error fetching test cases:", error);
        toast.error("Error loading test cases");
      } finally {
        setLoading(false);
        apiCallInProgress.current = false;
      }
    };

    fetchTestCases();
  }, [suiteId]); // Only depends on suiteId
  
  // Reset loaded flags when suiteId changes
  useEffect(() => {
    if (suiteId !== undefined && suiteId !== null && suiteId !== prevSuiteIdRef.current) {
      availableCasesLoaded.current = false;
      associatedCasesLoaded.current = false;
      prevSuiteIdRef.current = suiteId;
    }
  }, [suiteId]);
  
  // Store previous suiteId to detect changes
  const prevSuiteIdRef = useRef(null);

  const handleSelectChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;
    
    const selected = availableCases.find((item) => item.id === parseInt(selectedId));
    if (selected) {
      setSelectedCases([...selectedCases, selected]);
      setAvailableCases(
        availableCases.filter((item) => item.id !== selected.id),
      );
    }
  };

  const handleRemoveBadge = (id) => {
    const toRemove = selectedCases.find((item) => item.id === id);
    setAvailableCases([...availableCases, toRemove]);
    setSelectedCases(selectedCases.filter((item) => item.id !== id));
  };

  const handleAddToSuite = async () => {
    if (selectedCases.length === 0) {
      toast.warning("No test cases selected");
      return;
    }

    // If we have a suiteId, use the API to associate test cases
    if (suiteId) {
      setAssociating(true);
      try {
        const selectedIds = selectedCases.map(tc => tc.id);
        const payload = {
          requestMetaData: {
            userId: localStorage.getItem("userId") || "302",
            transactionId: nanoid(),
            timestamp: new Date().toISOString(),
          },
          data: selectedIds
        };
        
        const json = await api(`/api/v1/test-cases/associate-to-suite/${suiteId}`, "POST", payload);
        const { code, message } = json.result;
        
        if (code === "200") {
          toast.success("Test cases successfully associated with suite");
          
          // Move selected cases to associated cases
          setAssociatedCases([...associatedCases, ...selectedCases]);
          setSelectedCases([]);
        } else {
          toast.error(message || "Failed to associate test cases");
        }
      } catch (error) {
        console.error("Error associating test cases:", error);
        toast.error("Error associating test cases with suite");
      } finally {
        setAssociating(false);
      }
    } else {
      // For cases where we don't have a suiteId yet
      setAssociatedCases([...associatedCases, ...selectedCases]);
      setSelectedCases([]);
      toast.success("Test cases added to suite");
    }
  };

  // Function to handle removing a test case from a suite
  const removeCaseFromSuite = async () => {
    if (!caseToRemove || !suiteId) {
      toast.error("Missing required information");
      return;
    }

    setIsRemoving(true);
    
    try {
      const payload = {
        requestMetaData: {
          userId: localStorage.getItem("userId") || "302",
          transactionId: nanoid(),
          timestamp: new Date().toISOString(),
        },
        data: {
          testCaseId: caseToRemove.id,
          testSuiteId: parseInt(suiteId)
        }
      };
      
      const response = await api("/api/v1/test-cases/remove-assoc-to-suite", "DELETE", payload);
      
      if (response.result?.code === "200") {
        toast.success(response.result.message || "Test case removed from suite successfully");
        
        // Update the UI
        setAssociatedCases(prev => prev.filter(item => item.id !== caseToRemove.id));
        
        // Add the test case back to available cases
        setAvailableCases(prev => [...prev, caseToRemove]);
      } else {
        throw new Error(response.result?.message || "Failed to remove test case");
      }
    } catch (error) {
      console.error("Error removing test case:", error);
      toast.error(error.message || "Failed to remove test case from suite");
    } finally {
      setIsRemoving(false);
      setShowDeleteModal(false);
      setCaseToRemove(null);
    }
  };

  const handleDeleteRow = (id) => {
    const testCase = associatedCases.find(item => item.id === id);
    if (testCase) {
      setCaseToRemove(testCase);
      setShowDeleteModal(true);
    }
  };

  const handleComplete = async () => {
    if (suiteId && associatedCases.length > 0) {
      setSavingFinal(true);
      try {
        // Final save - ensure all associations are correct
        const associatedIds = associatedCases.map(tc => tc.id);
        const payload = {
          requestMetaData: {
            userId: localStorage.getItem("userId") || "302",
            transactionId: nanoid(),
            timestamp: new Date().toISOString(),
          },
          data: associatedIds
        };
        
        const json = await api(`/api/v1/test-cases/associate-to-suite/${suiteId}`, "POST", payload);
        const { code, message } = json.result;
        
        if (code === "200") {
          toast.success("Test suite configuration saved successfully");
          if (onComplete) {
            onComplete();
          }
        } else {
          toast.error(message || "Failed to save test suite configuration");
        }
      } catch (error) {
        console.error("Error during final save:", error);
        toast.error("Error saving test suite configuration");
      } finally {
        setSavingFinal(false);
      }
    } else if (onComplete) {
      // If there's no suiteId or no test cases, just complete
      onComplete();
    }
  };

  // Pagination logic
  const paginatedData = associatedCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(associatedCases.length / ITEMS_PER_PAGE);

  const renderPagination = () => {
    let pages = [];
    const pageWindow = 2;
    const start = Math.max(1, currentPage - pageWindow);
    const end = Math.min(totalPages, currentPage + pageWindow);

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          className={`px-2 py-1 mx-1 ${i === currentPage ? "bg-indigo-600 text-white" : "bg-white border hover:bg-gray-100"}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>,
      );
    }

    return (
      <div className="flex justify-end items-center px-4 py-3 text-sm text-gray-600 gap-1">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>
        {start > 1 && <span>...</span>}
        {pages}
        {end < totalPages && <span>...</span>}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && !availableCasesLoaded.current) {
    return (
      <div className="bg-white shadow p-6 rounded-lg mt-8 flex justify-center">
        <div className="text-gray-600">Loading test cases...</div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow p-6 rounded-lg mt-8">
      <h3 className="font-semibold text-sm text-gray-700 mb-2">
        Test suite configuration
        <span className="ml-2 text-blue-500 text-xs bg-blue-100 px-2 py-1 rounded-full">
          ℹ Assign test cases
        </span>
      </h3>
      
      {/* Selection Area */}
      <label className="text-sm font-medium text-gray-600 mb-1 block">
        Select test case
      </label>
      <div className="flex items-center mb-4 space-x-2">
        <div className="flex flex-wrap gap-2 flex-1 border px-2 py-2 rounded">
          {selectedCases.map((test) => (
            <span
              key={test.id}
              className="bg-blue-100 text-blue-600 px-2 py-1 text-sm rounded-full flex items-center space-x-1"
            >
              <span>{test.name}</span>
              <button
                onClick={() => handleRemoveBadge(test.id)}
                className="text-xs font-bold px-1"
              >
                ×
              </button>
            </span>
          ))}
          <select
            onChange={handleSelectChange}
            className="outline-none flex-1 bg-transparent"
            value=""
            disabled={associating}
          >
            <option value="">Select a test case</option>
            {availableCases.map((test) => (
              <option key={test.id} value={test.id}>
                {test.name}
              </option>
            ))}
          </select>
        </div>
        <button
          className="px-4 py-2 bg-[#4F46E5] text-white text-sm rounded hover:bg-[#4338CA] disabled:opacity-50"
          onClick={handleAddToSuite}
          disabled={selectedCases.length === 0 || associating}
        >
          {associating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding...
            </>
          ) : "Add to suite"}
        </button>
      </div>

      {/* Associated Test Cases Table */}
      <div className="mt-6 mb-2">
        <h4 className="font-semibold text-sm text-gray-700">Associated Test Cases</h4>
      </div>
      
      {associatedCases.length > 0 ? (
        <>
          <table className="w-full border mt-2">
            <thead className="bg-gray-50 border-b text-left">
              <tr>
                <th className="p-3">Case ID</th>
                <th className="p-3">Test Case Name</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((test) => (
                <tr key={test.id} className="border-b">
                  <td className="p-3">{test.id}</td>
                  <td className="p-3">{test.name}</td>
                  <td className="p-3">{test.description}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleDeleteRow(test.id)}
                      disabled={isRemoving}
                    >
                      <IconButton icon={FiTrash2} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && renderPagination()}
        </>
      ) : (
        <div className="p-4 border border-dashed rounded-md text-center text-gray-500">
          No test cases associated with this suite yet. Select test cases from the dropdown above.
        </div>
      )}
      
      {/* Final action button */}
      <div className="flex justify-end mt-4">
        <Button 
          onClick={handleComplete}
          disabled={savingFinal}
        >
          {savingFinal ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : "Save"}
        </Button>
      </div>

      {/* Confirmation Modal for removing test case */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCaseToRemove(null);
        }}
        onConfirm={removeCaseFromSuite}
        title="Remove Test Case"
        message={`Are you sure you want to remove "${caseToRemove?.name}" from this suite? This action cannot be undone.`}
      />
    </div>
  );
};

export default TestSuiteAssignmentForm;