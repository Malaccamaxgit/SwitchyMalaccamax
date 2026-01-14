/* eslint-disable @typescript-eslint/explicit-function-return-type */
/**
 * Secret Scanner - Prevents accidental commit of sensitive data
 * Scans staged files for common secret patterns
 */

import fs from 'fs';
import { execSync } from 'child_process';

// ANSI color codes
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

// Secret patterns to detect
const SECRET_PATTERNS = [
  // API Keys and Tokens
  {
    name: 'Generic API Key',
    pattern: /[a-zA-Z0-9_-]*api[_-]?key[a-zA-Z0-9_-]*['"\s]*[:=]\s*['"]([a-zA-Z0-9-]{20,})['"]/gi,
    severity: 'HIGH',
  },
  {
    name: 'Generic Secret/Token',
    pattern: /[a-zA-Z0-9_-]*secret[a-zA-Z0-9_-]*['"\s]*[:=]\s*['"]([a-zA-Z0-9-]{20,})['"]/gi,
    severity: 'HIGH',
  },
  {
    name: 'Generic Token',
    pattern: /[a-zA-Z0-9_-]*token[a-zA-Z0-9_-]*['"\s]*[:=]\s*['"]([a-zA-Z0-9-]{20,})['"]/gi,
    severity: 'HIGH',
  },
  
  // AWS
  {
    name: 'AWS Access Key',
    pattern: /(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    severity: 'CRITICAL',
  },
  {
    name: 'AWS Secret Key',
    pattern: /aws[_-]?secret[_-]?access[_-]?key['"\s]*[:=]\s*['"]([a-zA-Z0-9/+=]{40})['"]/gi,
    severity: 'CRITICAL',
  },
  
  // Private Keys
  {
    name: 'RSA Private Key',
    pattern: /-----BEGIN RSA PRIVATE KEY-----/g,
    severity: 'CRITICAL',
  },
  {
    name: 'SSH Private Key',
    pattern: /-----BEGIN OPENSSH PRIVATE KEY-----/g,
    severity: 'CRITICAL',
  },
  {
    name: 'PGP Private Key',
    pattern: /-----BEGIN PGP PRIVATE KEY BLOCK-----/g,
    severity: 'CRITICAL',
  },
  
  // Passwords
  {
    name: 'Password Assignment',
    pattern: /[a-zA-Z0-9_-]*password[a-zA-Z0-9_-]*['"\s]*[:=]\s*['"]([^'"]{8,})['"]/gi,
    severity: 'HIGH',
    // Skip test files and examples
    exclude: /test|spec|example|demo|mock/i,
  },
  
  // Database Connections
  {
    name: 'Database Connection String',
    pattern: /(postgres|mysql|mongodb|redis):\/\/[^:]+:[^@]+@[^/]+/gi,
    severity: 'CRITICAL',
  },
  
  // OAuth/JWT
  {
    name: 'JWT Token',
    pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g,
    severity: 'MEDIUM',
  },
  
  // GitHub
  {
    name: 'GitHub Token',
    pattern: /gh[pousr]_[a-zA-Z0-9]{36,}/g,
    severity: 'CRITICAL',
  },
  
  // Generic Base64 Credentials
  {
    name: 'Base64 Basic Auth',
    pattern: /['"]?authorization['"]?\s*:\s*['"]?basic\s+([a-zA-Z0-9+/]{40,}={0,2})['"]?/gi,
    severity: 'HIGH',
  },
];

// Whitelist patterns (legitimate uses that shouldn't trigger alerts)
const WHITELIST_PATTERNS = [
  /example\.com/i,
  /placeholder/i,
  /your[_-]?api[_-]?key/i,
  /your[_-]?password/i,
  /your[_-]?token/i,
  /\*+/,  // Masked values like ********
  /xxx+/i,
  /test[_-]?key/i,
  /dummy/i,
  /fake/i,
  /mock/i,
];

// File extensions to scan
const SCANNABLE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.vue',
  '.json', '.env', '.yml', '.yaml',
  '.sh', '.bash', '.py', '.rb',
  '.php', '.go', '.java', '.cs',
  '.xml', '.properties', '.conf', '.config',
];

/**
 * Check whether a match string is whitelisted (false positive).
 * @param {string|undefined} match
 * @returns {boolean}
 */
export function isWhitelisted(match) {
  if (!match || typeof match !== 'string') return false;
  return WHITELIST_PATTERNS.some(pattern => pattern.test(match));
} 

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.error(`${RED}Failed to get staged files:${RESET}`, error.message);
    return [];
  }
}

/**
 * Determine if the filename should be scanned (based on extension and paths).
 * @param {string} filename
 * @returns {boolean}
 */
export function shouldScanFile(filename) {
  if (!filename || typeof filename !== 'string') return false;
  // Skip non-text files
  if (filename.includes('node_modules/')) return false;
  if (filename.includes('.git/')) return false;
  if (filename.includes('dist/')) return false;
  if (filename.includes('build/')) return false;
  if (filename.endsWith('.map')) return false;
  if (filename.endsWith('.min.js')) return false;
  if (filename.endsWith('.png')) return false;
  if (filename.endsWith('.jpg')) return false;
  if (filename.endsWith('.ico')) return false;
  
  // Skip the scanner itself (contains example patterns)
  if (filename.includes('secret-scanner.js')) return false;
  
  // Check extension
  const ext = '.' + filename.split('.').pop();
  return SCANNABLE_EXTENSIONS.includes(ext);
} 

export function scanFile(filename) {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const findings = [];
    
    for (const pattern of SECRET_PATTERNS) {
      // Skip if file matches exclude pattern
      if (pattern.exclude && pattern.exclude.test(filename)) {
        continue;
      }
      
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const matchText = match[0];
        
        // Skip whitelisted matches
        if (isWhitelisted(matchText)) {
          continue;
        }
        
        // Find line number
        const beforeMatch = content.substring(0, match.index);
        const lineNumber = beforeMatch.split('\n').length;
        
        findings.push({
          file: filename,
          line: lineNumber,
          type: pattern.name,
          severity: pattern.severity,
          match: matchText.substring(0, 100), // Truncate long matches
        });
      }
    }
    
    return findings;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(`${YELLOW}Warning: Could not read ${filename}${RESET}`);
    }
    return [];
  }
}

/**
 * Map severity to ANSI color code.
 * @param {string} severity
 * @returns {string}
 */
function getSeverityColor(severity) {
  switch (severity) {
    case 'CRITICAL':
    case 'HIGH':
      return RED;
    case 'MEDIUM':
    case 'LOW':
      return YELLOW;
    default:
      return RESET;
  }
} 

function main() {
  console.log(`${BOLD}🔍 Secret Scanner - Checking staged files...${RESET}\n`);
  
  const stagedFiles = getStagedFiles();
  
  if (stagedFiles.length === 0) {
    console.log(`${YELLOW}No staged files to scan.${RESET}`);
    return 0;
  }
  
  const scannableFiles = stagedFiles.filter(shouldScanFile);
  console.log(`Scanning ${scannableFiles.length} file(s)...\n`);
  
  const allFindings = [];
  
  for (const file of scannableFiles) {
    const findings = scanFile(file);
    allFindings.push(...findings);
  }
  
  if (allFindings.length === 0) {
    console.log(`${GREEN}✓ No secrets detected${RESET}\n`);
    return 0;
  }
  
  // Group findings by severity
  const critical = allFindings.filter(f => f.severity === 'CRITICAL');
  const high = allFindings.filter(f => f.severity === 'HIGH');
  const medium = allFindings.filter(f => f.severity === 'MEDIUM');
  
  console.log(`${RED}${BOLD}⚠ SECRETS DETECTED!${RESET}\n`);
  
  if (critical.length > 0) {
    console.log(`${getSeverityColor('CRITICAL')}${BOLD}CRITICAL (${critical.length}):${RESET}`);
    critical.forEach(f => {
      const color = getSeverityColor(f.severity);
      console.log(`${color}  ${f.file}:${f.line} - ${f.type}${RESET}`);
      const raw = f.match || '';
      const snippet = raw.length > 80 ? `${raw.slice(0, 80)}...` : raw;
      console.log(`${color}    ${snippet}${RESET}`);
    });
    console.log();
  }
  
  if (high.length > 0) {
    console.log(`${getSeverityColor('HIGH')}${BOLD}HIGH (${high.length}):${RESET}`);
    high.forEach(f => {
      const color = getSeverityColor(f.severity);
      console.log(`${color}  ${f.file}:${f.line} - ${f.type}${RESET}`);
    });
    console.log();
  }
  
  if (medium.length > 0) {
    console.log(`${getSeverityColor('MEDIUM')}${BOLD}MEDIUM (${medium.length}):${RESET}`);
    medium.forEach(f => {
      const color = getSeverityColor(f.severity);
      console.log(`${color}  ${f.file}:${f.line} - ${f.type}${RESET}`);
    });
    console.log();
  }
  
  console.log(`${RED}${BOLD}Commit aborted to prevent secret exposure.${RESET}`);
  console.log(`\nIf these are false positives:`);
  console.log(`1. Review the detected patterns`);
  console.log(`2. Use placeholder values (e.g., 'your-api-key', 'example.com')`);
  console.log(`3. Store real secrets in environment variables`);
  console.log(`4. Use .env files (and add to .gitignore)\n`);
  
  return 1;
}

// Only run main when executed directly, not on import (tests import functions)
try {
  const invokedAsScript = typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].endsWith('secret-scanner.js');
  if (invokedAsScript) {
    const code = main();
    process.exit(code);
  }
} catch (e) {
  // Allow tests to import exported functions without side-effects
  console.error('Error running secret-scanner script:', e);
}
