export interface SecretFinding {
  file: string;
  line: number;
  type: string;
  severity: string;
  match: string;
}

export function isWhitelisted(match?: string): boolean;
export function shouldScanFile(filename: string): boolean;
export function scanFile(filename: string): SecretFinding[];
