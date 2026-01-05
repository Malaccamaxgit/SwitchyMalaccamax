export interface RegexValidationResult {
  safe: boolean;
  reason?: string;
  pattern?: string;
}

export interface WildcardValidationResult {
  valid: boolean;
  reason?: string;
  patterns?: string[];
}
