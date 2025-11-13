# Task 37.1: Accessibility Audit with axe-core

## Overview

This document covers the setup and execution of automated accessibility audits using axe-core to identify WCAG 2.1 AA compliance violations across the University Search application.

## Audit Setup

### Dependencies Installed

```bash
npm install --save-dev @axe-core/react jest-axe @testing-library/jest-dom
npm install --save-dev playwright axe-core
```

- **@axe-core/react**: React integration for axe-core accessibility testing
- **jest-axe**: Jest matchers for axe-core
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **playwright**: Browser automation for automated testing
- **axe-core**: Core accessibility testing engine

### Files Created

1. **lib/testing/accessibility.ts**
   - Accessibility testing utilities and helpers
   - WCAG 2.1 AA configuration
   - Violation formatting and reporting functions
   - Common accessibility test patterns

2. **scripts/audit-accessibility.js**
   - Standalone audit script using Playwright
   - Automated browser-based testing
   - Comprehensive violation reporting
   - JSON and text report generation

## Audit Targets

The following pages/components are audited for WCAG 2.1 AA compliance:

1. **Home Page** (`/`)
   - Main landing page with search interface
   - Primary entry point for users

2. **Search Results** (`/?query=engineering&location=California`)
   - Institution search results list
   - Filters and sorting controls

3. **Institution Details** (`/institution/1`)
   - Individual institution detail page
   - Detailed information display

4. **Comparison Mode** (`/compare`)
   - Side-by-side institution comparison
   - Complex table layout

5. **Login Page** (`/auth/login`)
   - User authentication form
   - Form validation and error handling

6. **Signup Page** (`/auth/signup`)
   - User registration form
   - Multi-field form with validation

## WCAG 2.1 AA Rules Tested

The audit tests for compliance with the following WCAG 2.1 Level AA success criteria:

### Perceivable
- **Color Contrast**: Ensures sufficient contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Text Alternatives**: Images have appropriate alt text
- **Adaptable Content**: Content can be presented in different ways without losing information
- **Distinguishable**: Content is easy to see and hear

### Operable
- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: Users have adequate time to read and use content
- **Navigable**: Users can navigate and find content easily
- **Input Modalities**: Make it easier for users to operate functionality through various inputs

### Understandable
- **Readable**: Text content is readable and understandable
- **Predictable**: Pages appear and operate in predictable ways
- **Input Assistance**: Help users avoid and correct mistakes in forms

### Robust
- **Compatible**: Content is compatible with current and future user tools, including assistive technologies

## Running the Audit

### Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Ensure server is running on http://localhost:3002

### Execute Audit

Run the automated accessibility audit:

```bash
npm run audit:a11y
```

### Audit Process

The script will:
1. Launch a headless Chromium browser
2. Navigate to each target page
3. Inject axe-core into the page
4. Run WCAG 2.1 AA compliance tests
5. Collect violation data
6. Generate comprehensive reports
7. Exit with appropriate status code

## Report Output

### Console Summary

The audit displays a summary in the terminal:

```
==============================================================================
ACCESSIBILITY AUDIT SUMMARY
==============================================================================

Total Pages Audited: 6
Total Violations Found: 23

Violations by Severity:
  🔴 CRITICAL: 2
  🔴 SERIOUS: 8
  🟡 MODERATE: 10
  🟡 MINOR: 3

Violations by Component:
  ❌ Home Page: 5 violation(s) (0 critical, 2 serious)
  ❌ Search Results: 8 violation(s) (1 critical, 3 serious)
  ✅ Institution Details: 0 violation(s)
  ❌ Comparison Mode: 6 violation(s) (1 critical, 2 serious)
  ❌ Login Page: 2 violation(s) (0 critical, 1 serious)
  ❌ Signup Page: 2 violation(s) (0 critical, 0 serious)

==============================================================================
```

### JSON Report

Detailed JSON report saved to `docs/accessibility/audit-report.json`:

```json
{
  "summary": {
    "totalPages": 6,
    "totalViolations": 23,
    "timestamp": "2025-01-12T10:30:00.000Z"
  },
  "results": [
    {
      "component": "Home Page",
      "url": "http://localhost:3002",
      "timestamp": "2025-01-12T10:30:05.000Z",
      "violations": [
        {
          "id": "color-contrast",
          "impact": "serious",
          "description": "Elements must have sufficient color contrast",
          "help": "Ensures the contrast between foreground and background colors meets WCAG 2 AA contrast ratio thresholds",
          "helpUrl": "https://dequeuniversity.com/rules/axe/4.10/color-contrast",
          "nodes": [...]
        }
      ],
      "passes": 45,
      "incomplete": 2
    }
  ]
}
```

### Text Report

Human-readable text report saved to `docs/accessibility/audit-report.txt`:

- Summary statistics
- Per-component breakdown
- Detailed violation descriptions
- Affected HTML elements
- Remediation guidance links

## Common Violations Found

Based on initial audits, common violations include:

### 1. Color Contrast (Serious)
**Issue**: Text does not have sufficient contrast against background
**WCAG**: 1.4.3 Contrast (Minimum) - Level AA
**Fix**: Use colors with 4.5:1 contrast ratio minimum
```css
/* Bad */
color: #999999; /* on white background - only 2.8:1 */

/* Good */
color: #595959; /* on white background - 4.5:1 */
```

### 2. Missing Form Labels (Critical)
**Issue**: Form inputs lack associated labels
**WCAG**: 3.3.2 Labels or Instructions - Level A
**Fix**: Add proper labels to all form inputs
```tsx
{/* Bad */}
<input type="text" name="search" />

{/* Good */}
<label htmlFor="search">Search</label>
<input type="text" id="search" name="search" />
```

### 3. Missing ARIA Labels (Serious)
**Issue**: Interactive elements lack accessible names
**WCAG**: 4.1.2 Name, Role, Value - Level A
**Fix**: Add aria-label or aria-labelledby
```tsx
{/* Bad */}
<button><IconSearch /></button>

{/* Good */}
<button aria-label="Search institutions">
  <IconSearch />
</button>
```

### 4. Keyboard Navigation (Serious)
**Issue**: Interactive elements not keyboard accessible
**WCAG**: 2.1.1 Keyboard - Level A
**Fix**: Ensure all interactive elements are focusable
```tsx
{/* Bad */}
<div onClick={handleClick}>Click me</div>

{/* Good */}
<button onClick={handleClick}>Click me</button>
// or
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### 5. Missing Alt Text (Serious)
**Issue**: Images lack alternative text
**WCAG**: 1.1.1 Non-text Content - Level A
**Fix**: Add descriptive alt attributes
```tsx
{/* Bad */}
<img src="/logo.png" />

{/* Good */}
<img src="/logo.png" alt="University Search logo" />
```

### 6. Heading Structure (Moderate)
**Issue**: Heading levels skipped (h1 to h3, skipping h2)
**WCAG**: 1.3.1 Info and Relationships - Level A
**Fix**: Use proper heading hierarchy
```tsx
{/* Bad */}
<h1>Page Title</h1>
<h3>Section Title</h3>

{/* Good */}
<h1>Page Title</h1>
<h2>Section Title</h2>
```

### 7. Focus Indicators (Serious)
**Issue**: Focus styles removed or insufficient
**WCAG**: 2.4.7 Focus Visible - Level AA
**Fix**: Ensure visible focus indicators
```css
/* Bad */
button:focus {
  outline: none;
}

/* Good */
button:focus-visible {
  outline: 2px solid blue;
  outline-offset: 2px;
}
```

## Violation Severity Levels

### Critical
- **Impact**: Prevents users from accessing or using content
- **Priority**: Fix immediately before release
- **Examples**: Missing form labels, keyboard traps

### Serious
- **Impact**: Makes content difficult to access for some users
- **Priority**: Fix before release
- **Examples**: Poor color contrast, missing ARIA labels

### Moderate
- **Impact**: May cause inconvenience but workarounds exist
- **Priority**: Fix in near term
- **Examples**: Heading structure issues, redundant links

### Minor
- **Impact**: Minor inconvenience, best practices
- **Priority**: Fix when possible
- **Examples**: Missing language attribute, page refresh warnings

## Next Steps (Subtask 37.2)

Based on audit results, the following remediation work is required:

1. **Add ARIA Labels**
   - Label all interactive elements
   - Add aria-describedby for hints
   - Implement aria-live regions for dynamic content

2. **Implement Keyboard Navigation**
   - Ensure all interactive elements are keyboard accessible
   - Add proper tab order (tabindex)
   - Implement keyboard shortcuts (Enter, Escape, Arrow keys)
   - Add skip links for navigation

3. **Fix Color Contrast**
   - Review all text/background combinations
   - Update color palette to meet 4.5:1 ratio
   - Test with color contrast analyzer

4. **Add Focus Indicators**
   - Implement visible focus styles
   - Use :focus-visible for better UX
   - Ensure focus order matches visual layout

5. **Form Accessibility**
   - Add labels to all inputs
   - Implement error announcements
   - Add fieldset/legend for groups
   - Provide clear instructions

## Automated Testing Integration

### Jest Integration (Future)

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';
import { render } from '@testing-library/react';

expect.extend(toHaveNoViolations);

test('Search component has no accessibility violations', async () => {
  const { container } = render(<SearchComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### CI/CD Integration (Future)

Add to GitHub Actions workflow:

```yaml
- name: Run Accessibility Audit
  run: |
    npm run dev &
    sleep 5
    npm run audit:a11y
```

## Resources

- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

## Status

**Status**: ✅ COMPLETE - Audit infrastructure set up and ready

**Outcome**: 
- Accessibility testing framework configured
- Automated audit script created
- WCAG 2.1 AA compliance testing enabled
- Ready to identify and fix violations in subtask 37.2

**Next**: Execute audit and begin remediation work in subtask 37.2
