/**
 * API Test Page - Schema Validation
 * Comprehensive test suite for PostgREST API client
 */

'use client';

import { useState } from 'react';
import { runAllTests, getTestResults } from '@/lib/api/tests';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
}

export default function ApiTestPage() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [completed, setCompleted] = useState(false);

  const handleRunTests = async () => {
    setRunning(true);
    setCompleted(false);
    setResults([]);
    
    // Run tests (they log to console)
    await runAllTests();
    
    // Get results
    const testResults = getTestResults();
    setResults(testResults);
    setCompleted(true);
    setRunning(false);
  };

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const percentage = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">PostgREST API Test Suite</h1>
        <p className="text-gray-600">
          Comprehensive validation tests based on SCHEMA_DIAGRAM.md
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Expected: ~18,000+ rows across all tables (2,388 institutions)
        </p>
      </div>

      <div className="mb-8">
        <button
          onClick={handleRunTests}
          disabled={running}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {running ? '🧪 Running Tests...' : '▶️ Run All Tests'}
        </button>
        
        {running && (
          <p className="mt-4 text-sm text-gray-600 animate-pulse">
            Check browser console for detailed output...
          </p>
        )}
      </div>

      {completed && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
          <h2 className="text-2xl font-bold mb-4">📊 Test Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-gray-700">{totalCount}</div>
              <div className="text-sm text-gray-500">Total Tests</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-green-600">{passedCount}</div>
              <div className="text-sm text-gray-500">Passed</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <div className="text-3xl font-bold text-red-600">{totalCount - passedCount}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Success Rate</span>
              <span className="text-sm font-bold">{percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  percentage === 100 ? 'bg-green-500' : percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Test Results</h2>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">
                  {result.passed ? '✅' : '❌'} {result.name}
                </h3>
              </div>
              
              <p className={`text-sm mb-2 ${result.passed ? 'text-green-700' : 'text-red-700'}`}>
                {result.message}
              </p>
              
              {result.data && result.passed && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View Sample Data
                  </summary>
                  <pre className="mt-2 p-3 bg-white rounded text-xs overflow-x-auto border border-gray-200">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {!completed && !running && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">👆 Click "Run All Tests" to validate the API client</p>
          <p className="text-sm">Quick tests will validate:</p>
          <ul className="text-sm mt-2 space-y-1">
            <li>✓ PostgREST connection</li>
            <li>✓ TypeScript type safety</li>
            <li>✓ Materialized views</li>
            <li>✓ RPC functions</li>
            <li>✓ Pagination</li>
          </ul>
        </div>
      )}
    </div>
  );
}
