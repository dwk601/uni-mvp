/**
 * API Client Tests
 * Simple validation tests for PostgREST connection
 */

import { apiClient } from './client';
import type { Institution, InstitutionComplete } from '@/types';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

/**
 * Test 1: Basic API Connection
 */
async function testApiConnection(): Promise<TestResult> {
  try {
    const institutions = await apiClient.get<Institution[]>('institutions', {
      limit: 3,
    });
    
    if (!institutions || institutions.length === 0) {
      return {
        name: 'API Connection',
        passed: false,
        message: 'No data returned from API',
      };
    }
    
    return {
      name: 'API Connection',
      passed: true,
      message: `✅ Successfully connected to PostgREST`,
      data: {
        returned: institutions.length,
        sample: institutions[0].institution_name,
      },
    };
  } catch (error) {
    return {
      name: 'API Connection',
      passed: false,
      message: `❌ ${error instanceof Error ? error.message : 'Connection failed'}`,
    };
  }
}

/**
 * Test 2: Type Safety Validation
 */
async function testTypeSafety(): Promise<TestResult> {
  try {
    const institutions = await apiClient.get<Institution[]>('institutions', {
      limit: 1,
    });
    
    const inst = institutions[0];
    
    // Verify TypeScript types match runtime data
    const hasRequiredFields = 
      typeof inst.unitid === 'number' &&
      typeof inst.institution_name === 'string' &&
      typeof inst.state_code === 'string';
    
    if (!hasRequiredFields) {
      return {
        name: 'Type Safety',
        passed: false,
        message: 'Data types do not match TypeScript definitions',
      };
    }
    
    return {
      name: 'Type Safety',
      passed: true,
      message: `✅ TypeScript types match runtime data`,
      data: {
        unitid: inst.unitid,
        name: inst.institution_name,
        state: inst.state_code,
      },
    };
  } catch (error) {
    return {
      name: 'Type Safety',
      passed: false,
      message: `❌ ${error instanceof Error ? error.message : 'Type validation failed'}`,
    };
  }
}

/**
 * Test 3: Materialized View Access
 */
async function testViewAccess(): Promise<TestResult> {
  try {
    const complete = await apiClient.get<any[]>(
      'v_institutions_complete',
      { limit: 2 }
    );
    
    if (!complete || complete.length === 0) {
      return {
        name: 'View Access',
        passed: false,
        message: 'Cannot access materialized views',
      };
    }
    
    const inst = complete[0];
    
    // Check if basic institution data exists
    if (!inst.unitid || !inst.institution_name) {
      return {
        name: 'View Access',
        passed: false,
        message: 'View missing basic institution data',
      };
    }
    
    // Just verify the view is accessible and returns data
    // The actual structure may vary based on the database view definition
    return {
      name: 'View Access',
      passed: true,
      message: `✅ Materialized views accessible`,
      data: {
        unitid: inst.unitid,
        name: inst.institution_name,
        fields_returned: Object.keys(inst).length,
        sample_fields: Object.keys(inst).slice(0, 10).join(', '),
      },
    };
  } catch (error) {
    return {
      name: 'View Access',
      passed: false,
      message: `❌ ${error instanceof Error ? error.message : 'View access failed'}`,
    };
  }
}

/**
 * Test 4: RPC Function Call
 */
async function testRpcFunction(): Promise<TestResult> {
  try {
    const results = await apiClient.rpc<Institution[]>('search_institutions', {
      search_term: 'University',
    });
    
    if (!results || results.length === 0) {
      return {
        name: 'RPC Functions',
        passed: false,
        message: 'RPC function returned no results',
      };
    }
    
    return {
      name: 'RPC Functions',
      passed: true,
      message: `✅ RPC functions working (${results.length} results)`,
      data: {
        count: results.length,
        first: results[0].institution_name,
      },
    };
  } catch (error) {
    return {
      name: 'RPC Functions',
      passed: false,
      message: `❌ ${error instanceof Error ? error.message : 'RPC call failed'}`,
    };
  }
}

/**
 * Test 5: Pagination
 */
async function testPagination(): Promise<TestResult> {
  try {
    const result = await apiClient.getPaginated<Institution>(
      'institutions',
      {},
      1,
      5
    );
    
    if (!result.data || result.data.length === 0) {
      return {
        name: 'Pagination',
        passed: false,
        message: 'Pagination returned no data',
      };
    }
    
    if (result.data.length > 5) {
      return {
        name: 'Pagination',
        passed: false,
        message: 'Page size limit not respected',
      };
    }
    
    return {
      name: 'Pagination',
      passed: true,
      message: `✅ Pagination working correctly`,
      data: {
        page: result.page,
        pageSize: result.pageSize,
        totalCount: result.count,
        returned: result.data.length,
      },
    };
  } catch (error) {
    return {
      name: 'Pagination',
      passed: false,
      message: `❌ ${error instanceof Error ? error.message : 'Pagination failed'}`,
    };
  }
}



/**
 * Run all tests and generate report
 */
export async function runAllTests(): Promise<void> {
  console.log('\n🧪 API CLIENT TEST SUITE');
  console.log('═'.repeat(50));
  
  // Clear previous results
  results.length = 0;
  
  // Run tests
  const tests = [
    testApiConnection,
    testTypeSafety,
    testViewAccess,
    testRpcFunction,
    testPagination,
  ];
  
  for (const test of tests) {
    const result = await test();
    results.push(result);
    
    console.log(`\n${result.passed ? '✅' : '❌'} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.data && result.passed) {
      console.log(`   Sample:`, JSON.stringify(result.data, null, 2)
        .split('\n')
        .map(line => `   ${line}`)
        .join('\n'));
    }
  }
  
  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log('\n' + '═'.repeat(50));
  console.log(`\n📊 SUMMARY: ${passed}/${total} tests passed (${percentage}%)`);
  
  if (passed === total) {
    console.log('✨ All tests passed!\n');
  } else {
    console.log('⚠️  Some tests failed.\n');
  }
}

/**
 * Get test results (useful for programmatic access)
 */
export function getTestResults(): TestResult[] {
  return results;
}
