export interface SecurityIssue {
  file: string;
  line: number;
  severity: string;
  message: string;
  code: string;
}

export function getStagedFiles(): string[];

export function scanFile(filePath: string, patterns: Array<{ pattern: RegExp; severity: string; message: string; excludePaths?: string[] }>): SecurityIssue[];
