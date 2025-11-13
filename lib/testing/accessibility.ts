/**
 * Accessibility Testing Utilities
 * 
 * Provides utilities for running axe-core accessibility audits
 * and generating compliance reports.
 */

/**
 * Configure axe for WCAG 2.1 AA compliance
 */
export const axeConfig = {
  rules: {
    // WCAG 2.1 AA rules
    'color-contrast': { enabled: true },
    'html-has-lang': { enabled: true },
    'html-lang-valid': { enabled: true },
    'landmark-one-main': { enabled: true },
    'page-has-heading-one': { enabled: true },
    'region': { enabled: true },
    'skip-link': { enabled: true },
    'tabindex': { enabled: true },
    'aria-allowed-attr': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-required-children': { enabled: true },
    'aria-required-parent': { enabled: true },
    'aria-roles': { enabled: true },
    'aria-valid-attr-value': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'bypass': { enabled: true },
    'document-title': { enabled: true },
    'duplicate-id': { enabled: true },
    'form-field-multiple-labels': { enabled: true },
    'frame-title': { enabled: true },
    'image-alt': { enabled: true },
    'input-button-name': { enabled: true },
    'input-image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'meta-refresh': { enabled: true },
    'meta-viewport': { enabled: true },
    'object-alt': { enabled: true },
    'td-headers-attr': { enabled: true },
    'th-has-data-cells': { enabled: true },
    'video-caption': { enabled: true },
  },
};

/**
 * WCAG 2.1 AA compliance levels
 */
export const WCAG_LEVELS = {
  A: 'wcag2a',
  AA: 'wcag2aa',
  AAA: 'wcag2aaa',
  WCAG21A: 'wcag21a',
  WCAG21AA: 'wcag21aa',
  WCAG21AAA: 'wcag21aaa',
} as const;

/**
 * Accessibility violation severity
 */
export type ViolationSeverity = 'minor' | 'moderate' | 'serious' | 'critical';

/**
 * Accessibility violation details
 */
export interface AccessibilityViolation {
  id: string;
  impact: ViolationSeverity;
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

/**
 * Accessibility audit result
 */
export interface AccessibilityAuditResult {
  component: string;
  timestamp: string;
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  url?: string;
}

/**
 * Format violations for reporting
 */
export function formatViolations(
  violations: AccessibilityViolation[]
): string {
  if (violations.length === 0) {
    return '✅ No accessibility violations found!';
  }

  const lines: string[] = [
    `❌ Found ${violations.length} accessibility violation(s):`,
    '',
  ];

  violations.forEach((violation, index) => {
    lines.push(`${index + 1}. [${violation.impact.toUpperCase()}] ${violation.id}`);
    lines.push(`   Description: ${violation.description}`);
    lines.push(`   Help: ${violation.help}`);
    lines.push(`   Learn more: ${violation.helpUrl}`);
    lines.push(`   Affected elements: ${violation.nodes.length}`);
    
    violation.nodes.slice(0, 3).forEach((node, nodeIndex) => {
      lines.push(`   ${nodeIndex + 1}) ${node.target.join(' > ')}`);
      lines.push(`      HTML: ${node.html.substring(0, 100)}...`);
    });
    
    if (violation.nodes.length > 3) {
      lines.push(`   ... and ${violation.nodes.length - 3} more`);
    }
    
    lines.push('');
  });

  return lines.join('\n');
}

/**
 * Group violations by severity
 */
export function groupViolationsBySeverity(
  violations: AccessibilityViolation[]
): Record<ViolationSeverity, AccessibilityViolation[]> {
  return violations.reduce(
    (groups, violation) => {
      groups[violation.impact].push(violation);
      return groups;
    },
    {
      minor: [],
      moderate: [],
      serious: [],
      critical: [],
    } as Record<ViolationSeverity, AccessibilityViolation[]>
  );
}

/**
 * Generate accessibility report summary
 */
export function generateReportSummary(
  results: AccessibilityAuditResult[]
): string {
  const totalViolations = results.reduce(
    (sum, result) => sum + result.violations.length,
    0
  );

  const violationsByComponent = results.map((result) => ({
    component: result.component,
    count: result.violations.length,
    critical: result.violations.filter((v) => v.impact === 'critical').length,
    serious: result.violations.filter((v) => v.impact === 'serious').length,
  }));

  const allViolations = results.flatMap((r) => r.violations);
  const grouped = groupViolationsBySeverity(allViolations);

  const lines = [
    '=== Accessibility Audit Summary ===',
    '',
    `Total Components Tested: ${results.length}`,
    `Total Violations: ${totalViolations}`,
    '',
    'Violations by Severity:',
    `  Critical: ${grouped.critical.length}`,
    `  Serious: ${grouped.serious.length}`,
    `  Moderate: ${grouped.moderate.length}`,
    `  Minor: ${grouped.minor.length}`,
    '',
    'Violations by Component:',
    ...violationsByComponent.map(
      (c) =>
        `  ${c.component}: ${c.count} total (${c.critical} critical, ${c.serious} serious)`
    ),
    '',
    `Generated: ${new Date().toISOString()}`,
  ];

  return lines.join('\n');
}

/**
 * Save audit results to file
 */
export function saveAuditResults(
  results: AccessibilityAuditResult[],
  filename: string = 'accessibility-audit-report.json'
): void {
  const fs = require('fs');
  const path = require('path');

  const reportDir = path.join(process.cwd(), 'docs', 'accessibility');
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportPath = path.join(reportDir, filename);
  
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          totalComponents: results.length,
          totalViolations: results.reduce((sum, r) => sum + r.violations.length, 0),
          timestamp: new Date().toISOString(),
        },
        results,
      },
      null,
      2
    )
  );

  console.log(`📊 Accessibility audit report saved to: ${reportPath}`);
}

/**
 * Common accessibility testing patterns
 */
export const a11yTestPatterns = {
  /**
   * Test if element has accessible name
   */
  hasAccessibleName: (element: HTMLElement): boolean => {
    const name =
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim();
    return !!name && name.length > 0;
  },

  /**
   * Test if element is keyboard accessible
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const tagName = element.tagName.toLowerCase();
    
    // Naturally focusable elements
    const focusable = ['a', 'button', 'input', 'select', 'textarea'];
    
    return (
      focusable.includes(tagName) ||
      (tabIndex !== null && parseInt(tabIndex) >= 0)
    );
  },

  /**
   * Test if form field has label
   */
  hasLabel: (input: HTMLInputElement): boolean => {
    const id = input.id;
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    
    if (ariaLabel || ariaLabelledBy) return true;
    
    if (id) {
      const label = document.querySelector(`label[for="${id}"]`);
      if (label) return true;
    }
    
    const parentLabel = input.closest('label');
    return !!parentLabel;
  },

  /**
   * Test if image has alt text
   */
  hasAltText: (img: HTMLImageElement): boolean => {
    return img.hasAttribute('alt');
  },

  /**
   * Test color contrast (simplified check)
   */
  hasGoodContrast: (element: HTMLElement): boolean => {
    const styles = window.getComputedStyle(element);
    const bgColor = styles.backgroundColor;
    const color = styles.color;
    
    // This is a simplified check - use actual contrast ratio calculation in production
    return bgColor !== color;
  },
};
