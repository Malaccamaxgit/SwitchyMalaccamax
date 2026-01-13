# PAC Output Comparison

## Test Configuration

```typescript
const profiles: Profile[] = [
  {
    name: 'Direct',
    profileType: 'DirectProfile',
    color: 'blue'
  },
  {
    name: 'Example',
    profileType: 'FixedProfile',
    color: 'green',
    fallbackProxy: {
      scheme: 'http',
      host: '192.168.50.30',
      port: 8213
    },
    bypassList: [
      { conditionType: 'BypassCondition', pattern: '127.0.0.1' },
      { conditionType: 'BypassCondition', pattern: 'localhost' },
      { conditionType: 'BypassCondition', pattern: '192.168.2.0/24' }
    ]
  },
  {
    name: 'Auto Switch',
    profileType: 'SwitchProfile',
    color: 'purple',
    defaultProfileName: 'Direct',
    rules: [
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: 'confluence.example.com' },
        profileName: 'Example'
      },
      {
        condition: { conditionType: 'HostWildcardCondition', pattern: '*.example.com' },
        profileName: 'Example'
      }
    ]
  }
];
```

## Generated PAC Script

```javascript
var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            if (!profiles[result]) return result;
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+Auto Switch", {
    "+Auto Switch": function(url, host, scheme) {
        "use strict";
        if (/^confluence\.example\.com$/.test(host)) return "+Example";
        if (/(?:^|\.)example\.com$/.test(host)) return "+Example";
        return "+Direct";
    },
    "+Direct": function(url, host, scheme) {
        "use strict";
        return "DIRECT";
    },
    "+Example": function(url, host, scheme) {
        "use strict";
        if (/^127\.0\.0\.1$/.test(host)) return "DIRECT";
        if (/^127\.0\.0\.1$/.test(host) || /^::1$/.test(host) || /^localhost$/.test(host)) return "DIRECT";
        if (host[host.length - 1] >= 0 && isInNet(host, "192.168.2.0", "255.255.255.0")) return "DIRECT";
        return "PROXY 192.168.50.30:8213";
    }
});
```

## Execution Flow Example

### Request 1: `https://confluence.example.com/wiki`

1. **Start**: `result = "+Auto Switch"`
2. **First iteration**: Execute `profiles["+Auto Switch"](url, host, scheme)`
   - Host matches `/^confluence\.example\.com$/`
   - Returns `"+Example"`
3. **Second iteration**: Execute `profiles["+Example"](url, host, scheme)`
   - Host does not match `127.0.0.1`
   - Host does not match bypass conditions
   - Returns `"PROXY 192.168.50.30:8213"`
4. **Result**: `"PROXY 192.168.50.30:8213"`

### Request 2: `https://docs.example.com/api`

1. **Start**: `result = "+Auto Switch"`
2. **First iteration**: Execute `profiles["+Auto Switch"](url, host, scheme)`
   - Host matches `/(?:^|\.)example\.com$/`
   - Returns `"+Example"`
3. **Second iteration**: Execute `profiles["+Example"](url, host, scheme)`
   - Host does not match bypass conditions
   - Returns `"PROXY 192.168.50.30:8213"`
4. **Result**: `"PROXY 192.168.50.30:8213"`

### Request 3: `http://127.0.0.1:3000`

1. **Start**: `result = "+Auto Switch"`
2. **First iteration**: Execute `profiles["+Auto Switch"](url, host, scheme)`
   - Host does not match any rules
   - Returns `"+Direct"`
3. **Second iteration**: Execute `profiles["+Direct"](url, host, scheme)`
   - Returns `"DIRECT"`
4. **Result**: `"DIRECT"`

### Request 4: `https://192.168.2.50:8080` (within bypass CIDR)

1. **Start**: `result = "+Auto Switch"`
2. **First iteration**: Execute `profiles["+Auto Switch"](url, host, scheme)`
   - Host does not match any rules
   - Returns `"+Direct"`
3. **Second iteration**: Execute `profiles["+Direct"](url, host, scheme)`
   - Returns `"DIRECT"`
4. **Result**: `"DIRECT"`

**Note**: If the request to `192.168.2.50` was routed to Example profile instead:
1. **Start**: `result = "+Example"`
2. **First iteration**: Execute `profiles["+Example"](url, host, scheme)`
   - Host matches `isInNet(host, "192.168.2.0", "255.255.255.0")`
   - Returns `"DIRECT"` (bypass rule)
3. **Result**: `"DIRECT"`

## Key Features Demonstrated

1. ✅ **Recursive Resolution**: Multiple profile lookups ("+Auto Switch" → "+Example")
2. ✅ **Bypass List**: Checks bypass conditions before returning proxy
3. ✅ **Wildcard Patterns**: Converts `*.example.com` to regex
4. ✅ **CIDR Support**: Uses `isInNet()` for IP range matching
5. ✅ **Loop Termination**: Stops when result is a string not starting with '+' (charCodeAt(0) !== 43)
