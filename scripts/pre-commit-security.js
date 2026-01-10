#!/usr/bin/env node
/**
 * Pre-commit security scanner
 * Checks for common security issues before allowing commits
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Security patterns to block
const SECURITY_PATTERNS = [
  {
    pattern: /console\.log(?!\s*\()/gi,
    severity: 'warning',
    message: 'Found console.log - consider using Logger utility',
    excludePaths: ['src/utils/Logger.ts', 'scripts/', 'tests/']
  },
  {
    pattern: /innerHTML|dangerouslySetInnerHTML/gi,
    severity: 'error',
    message: 'Found innerHTML usage - XSS risk! Use textContent or Vue data binding',
    excludePaths: ['scripts/']
  },
  {
    pattern: /eval\s*\(/gi,
    severity: 'error',
    message: 'Found eval() usage - code injection risk!',
    excludePaths: ['scripts/']
  },
  {
    pattern: /v-html/gi,
    severity: 'error',
    message: 'Found v-html directive - XSS risk! Use v-text or {{}} syntax',
    excludePaths: ['scripts/']
  },
  {
    pattern: /\.fromCharCode\(/gi,
    severity: 'warning',
    message: 'Found fromCharCode - potential obfuscation',
    excludePaths: ['src/utils/crypto.ts', 'tests/']
  },
  {
    pattern: /(?<!errors\.(?:value\.)?)(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']+["']/gi,
    severity: 'error',
    message: 'Possible hardcoded secret detected!',
    excludePaths: ['tests/', 'scripts/']
  },
  {
    pattern: /chrome\.storage\.(sync|local)\.get.*\)\.then/gi,
    severity: 'warning',
    message: 'Unvalidated storage access - ensure data validation'
  }
];

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(file => {
      return file && (file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.vue'));
    });
  } catch (error) {
    console.error(`${RED}Error getting staged files:${RESET}`, error.message);
    return [];
  }
}

function scanFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  // Always exclude the security scanner script itself
  if (filePath.includes('pre-commit-security.js')) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  patterns.forEach(({ pattern, severity, message, excludePaths = [] }) => {
    // Check if file should be excluded
    const shouldExclude = excludePaths.some(excludePath => 
      filePath.includes(excludePath.replace(/\//g, path.sep))
    );
    
    if (shouldExclude) return;

    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity,
          message,
          code: line.trim()
        });
      }
    });
  });

  return issues;
}

function main() {
  console.log(`${BOLD}🔒 Running security pre-commit checks...${RESET}\n`);

  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0 || stagedFiles[0] === '') {
    console.log(`${YELLOW}No staged TypeScript/JavaScript files to scan.${RESET}`);
    process.exit(0);
  }

  console.log(`Scanning ${stagedFiles.length} file(s)...\n`);

  let hasErrors = false;
  let hasWarnings = false;

  stagedFiles.forEach(file => {
    const issues = scanFile(file, SECURITY_PATTERNS);

    if (issues.length > 0) {
      console.log(`${BOLD}${file}${RESET}`);
      issues.forEach(issue => {
        if (issue.severity === 'error') {
          hasErrors = true;
          console.log(`  ${RED}✗ ERROR${RESET} Line ${issue.line}: ${issue.message}`);
        } else {
          hasWarnings = true;
          console.log(`  ${YELLOW}⚠ WARNING${RESET} Line ${issue.line}: ${issue.message}`);
        }
        console.log(`    ${issue.code}`);
      });
      console.log('');
    }
  });

  // Run npm audit
  console.log(`${BOLD}📦 Running npm audit...${RESET}`);
  try {
    execSync('npm audit --audit-level=moderate', { stdio: 'inherit' });
  } catch (error) {
    hasErrors = true;
    console.log(`${RED}✗ npm audit found vulnerabilities${RESET}\n`);
  }

  // Summary
  if (hasErrors) {
    console.log(`${RED}${BOLD}❌ Commit blocked due to security issues!${RESET}`);
    console.log(`${RED}Please fix the errors above before committing.${RESET}\n`);
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`${YELLOW}${BOLD}⚠️  Warnings detected but commit allowed.${RESET}`);
    console.log(`${YELLOW}Consider addressing these issues for better security.${RESET}\n`);
    process.exit(0);
  } else {
    console.log(`${GREEN}${BOLD}✓ All security checks passed!${RESET}\n`);
    process.exit(0);
  }
}

main();
