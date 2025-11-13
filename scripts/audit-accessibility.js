#!/usr/bin/env node

/**
 * Accessibility Audit Script
 * 
 * Runs automated accessibility audits on the application using axe-core.
 * Generates detailed reports of WCAG 2.1 AA violations.
 * 
 * Usage: node scripts/audit-accessibility.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Components/pages to audit
const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

const AUDIT_TARGETS = [
  {
    name: 'Home Page',
    url: BASE_URL,
    description: 'Main landing page with search interface',
  },
  {
    name: 'Search Results',
    url: `${BASE_URL}?query=engineering&location=California`,
    description: 'Institution search results list',
  },
  {
    name: 'Institution Details',
    url: `${BASE_URL}/institution/1`,
    description: 'Individual institution detail page',
  },
  {
    name: 'Comparison Mode',
    url: `${BASE_URL}/compare`,
    description: 'Side-by-side institution comparison',
  },
  {
    name: 'Login Page',
    url: `${BASE_URL}/auth/login`,
    description: 'User authentication form',
  },
  {
    name: 'Signup Page',
    url: `${BASE_URL}/auth/signup`,
    description: 'User registration form',
  },
];

// Severity levels
const SEVERITY_ORDER = ['critical', 'serious', 'moderate', 'minor'];

async function injectAxe(page) {
  // Inject axe-core into the page
  const axeCore = fs.readFileSync(
    path.join(__dirname, '../node_modules/axe-core/axe.min.js'),
    'utf8'
  );
  await page.evaluate(axeCore);
}

async function runAudit(page, target) {
  console.log(`\n🔍 Auditing: ${target.name}`);
  console.log(`   URL: ${target.url}`);

  try {
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 10000 });
    await injectAxe(page);

    // Run axe audit
    const results = await page.evaluate(() => {
      return new Promise((resolve) => {
        // @ts-ignore
        axe.run(
          {
            runOnly: {
              type: 'tag',
              values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
            },
          },
          (err, results) => {
            if (err) throw err;
            resolve(results);
          }
        );
      });
    });

    return {
      component: target.name,
      url: target.url,
      description: target.description,
      timestamp: new Date().toISOString(),
      violations: results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        tags: v.tags,
        nodes: v.nodes.map((n) => ({
          html: n.html,
          target: n.target,
          failureSummary: n.failureSummary,
        })),
      })),
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    };
  } catch (error) {
    console.error(`   ❌ Error auditing ${target.name}:`, error.message);
    return {
      component: target.name,
      url: target.url,
      timestamp: new Date().toISOString(),
      violations: [],
      error: error.message,
    };
  }
}

function formatViolationSummary(results) {
  const lines = [
    '',
    '=' .repeat(80),
    'ACCESSIBILITY AUDIT SUMMARY',
    '='.repeat(80),
    '',
  ];

  const totalViolations = results.reduce(
    (sum, r) => sum + (r.violations?.length || 0),
    0
  );

  lines.push(`Total Pages Audited: ${results.length}`);
  lines.push(`Total Violations Found: ${totalViolations}`);
  lines.push('');

  // Count by severity
  const allViolations = results.flatMap((r) => r.violations || []);
  const bySeverity = {};
  allViolations.forEach((v) => {
    bySeverity[v.impact] = (bySeverity[v.impact] || 0) + 1;
  });

  lines.push('Violations by Severity:');
  SEVERITY_ORDER.forEach((severity) => {
    if (bySeverity[severity]) {
      const icon = severity === 'critical' || severity === 'serious' ? '🔴' : '🟡';
      lines.push(`  ${icon} ${severity.toUpperCase()}: ${bySeverity[severity]}`);
    }
  });
  lines.push('');

  // Per-component breakdown
  lines.push('Violations by Component:');
  results.forEach((result) => {
    if (result.error) {
      lines.push(`  ❌ ${result.component}: ERROR - ${result.error}`);
    } else {
      const count = result.violations.length;
      const icon = count === 0 ? '✅' : '❌';
      const critical = result.violations.filter((v) => v.impact === 'critical').length;
      const serious = result.violations.filter((v) => v.impact === 'serious').length;
      
      lines.push(
        `  ${icon} ${result.component}: ${count} violation(s)` +
          (count > 0 ? ` (${critical} critical, ${serious} serious)` : '')
      );
    }
  });

  lines.push('');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

function formatDetailedReport(results) {
  const lines = [
    '',
    '=' .repeat(80),
    'DETAILED VIOLATION REPORT',
    '='.repeat(80),
    '',
  ];

  results.forEach((result, index) => {
    lines.push(`\n${index + 1}. ${result.component}`);
    lines.push(`   URL: ${result.url}`);
    lines.push(`   Description: ${result.description}`);

    if (result.error) {
      lines.push(`   ❌ ERROR: ${result.error}`);
      return;
    }

    if (result.violations.length === 0) {
      lines.push('   ✅ No violations found!');
      return;
    }

    lines.push(`   Found ${result.violations.length} violation(s):`);
    lines.push('');

    result.violations.forEach((violation, vIndex) => {
      lines.push(`   ${vIndex + 1}. [${violation.impact.toUpperCase()}] ${violation.id}`);
      lines.push(`      ${violation.description}`);
      lines.push(`      Help: ${violation.help}`);
      lines.push(`      URL: ${violation.helpUrl}`);
      lines.push(`      Affected elements: ${violation.nodes.length}`);

      violation.nodes.slice(0, 2).forEach((node, nIndex) => {
        lines.push(`      ${nIndex + 1}) ${node.target.join(' > ')}`);
        const html = node.html.length > 100 ? node.html.substring(0, 100) + '...' : node.html;
        lines.push(`         HTML: ${html}`);
      });

      if (violation.nodes.length > 2) {
        lines.push(`      ... and ${violation.nodes.length - 2} more element(s)`);
      }

      lines.push('');
    });
  });

  return lines.join('\n');
}

async function main() {
  console.log('🚀 Starting Accessibility Audit...');
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🎯 Testing ${AUDIT_TARGETS.length} page(s)`);

  // Check if server is running
  console.log(`\n⚠️  Make sure the development server is running on ${BASE_URL}`);
  console.log('   Run: npm run dev\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const target of AUDIT_TARGETS) {
    const result = await runAudit(page, target);
    results.push(result);
  }

  await browser.close();

  // Generate reports
  const reportDir = path.join(__dirname, '../docs/accessibility');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  // Save JSON report
  const jsonPath = path.join(reportDir, 'audit-report.json');
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        summary: {
          totalPages: results.length,
          totalViolations: results.reduce((sum, r) => sum + (r.violations?.length || 0), 0),
          timestamp: new Date().toISOString(),
        },
        results,
      },
      null,
      2
    )
  );

  // Save text report
  const textPath = path.join(reportDir, 'audit-report.txt');
  const textReport = [
    formatViolationSummary(results),
    formatDetailedReport(results),
  ].join('\n\n');
  fs.writeFileSync(textPath, textReport);

  // Print summary to console
  console.log(formatViolationSummary(results));

  console.log(`\n📊 Reports saved:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   Text: ${textPath}`);

  // Exit with error code if violations found
  const totalViolations = results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
  const criticalViolations = results
    .flatMap((r) => r.violations || [])
    .filter((v) => v.impact === 'critical').length;

  if (criticalViolations > 0) {
    console.log(`\n🔴 CRITICAL: Found ${criticalViolations} critical violation(s)!`);
    process.exit(1);
  } else if (totalViolations > 0) {
    console.log(`\n🟡 WARNING: Found ${totalViolations} violation(s)`);
    process.exit(0);
  } else {
    console.log('\n✅ SUCCESS: No accessibility violations found!');
    process.exit(0);
  }
}

// Run the audit
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
