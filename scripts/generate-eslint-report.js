/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { execSync } from 'child_process';
import fs from 'fs';

function runEslint() {
  try {
    // Use npx so local eslint is used consistently across environments
    const out = execSync('npx eslint . --ext .ts,.vue -f json', { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 });
    return { stdout: out, code: 0 };
  } catch (err) {
    // execSync throws on non-zero exit; try to capture stdout/stderr
    const stdout = err.stdout ? String(err.stdout) : '';
    const stderr = err.stderr ? String(err.stderr) : String(err.message || '');
    return { stdout, stderr, code: err.status || 1 };
  }
}

function summarizeReport(json) {
  const summary = { errors: 0, warnings: 0, ruleCounts: {} };
  for (const file of json) {
    for (const msg of file.messages) {
      if (msg.severity === 2) summary.errors++;
      if (msg.severity === 1) summary.warnings++;
      const rule = msg.ruleId || '<no-rule>';
      summary.ruleCounts[rule] = (summary.ruleCounts[rule] || 0) + 1;
    }
  }
  return summary;
}

function writeReport(rawOutput) {
  // Try to parse JSON; if parse fails, write raw output for debugging
  try {
    const parsed = JSON.parse(rawOutput);
    fs.writeFileSync('eslint-report.json', JSON.stringify(parsed, null, 2), 'utf8');
    const summary = summarizeReport(parsed);
    console.log(`ESLint report written to eslint-report.json (errors=${summary.errors}, warnings=${summary.warnings})`);
    // Print top 15 rules
    const items = Object.entries(summary.ruleCounts).sort((a, b) => b[1] - a[1]).slice(0, 15);
    if (items.length > 0) {
      console.log('Top rules:');
      for (const [rule, cnt] of items) {
        console.log(`  ${rule}: ${cnt}`);
      }
    }
    return 0;
  } catch (err) {
    console.error('Failed to parse ESLint JSON output. Writing raw output to eslint-report.txt');
    console.error(err);
    fs.writeFileSync('eslint-report.txt', rawOutput, 'utf8');
    return 2;
  }
}

function main() {
  console.log('Generating ESLint JSON report...');
  const result = runEslint();
  const raw = result.stdout || result.stderr || '';
  if (!raw || raw.trim() === '') {
    console.error('No ESLint output captured. Did ESLint run?');
    return 1;
  }
  return writeReport(raw);
}

if (process.argv[1] && process.argv[1].endsWith('generate-eslint-report.js')) {
  const code = main();
  process.exit(code);
}
