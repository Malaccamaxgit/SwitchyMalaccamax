declare module 'safe-regex' {
  export default function safe(re: RegExp | string, options?: { limit?: number }): boolean;
}
