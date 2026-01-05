<template>
  <div class="min-h-screen bg-bg-secondary p-8 transition-colors">
    <div class="max-w-4xl mx-auto space-y-8">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Design System Demo</h1>
        <ThemeToggle />
      </div>

      <!-- Buttons -->
      <Card padding="lg" shadow="md">
        <h2 class="text-xl font-semibold mb-4">Buttons</h2>
        <div class="flex flex-wrap gap-3">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="success">Success</Button>
          <Button variant="link">Link</Button>
        </div>
        
        <h3 class="text-lg font-medium mt-6 mb-3">Sizes</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>

        <h3 class="text-lg font-medium mt-6 mb-3">States</h3>
        <div class="flex flex-wrap gap-3">
          <Button :loading="true">Loading</Button>
          <Button :disabled="true">Disabled</Button>
          <Button variant="default">
            <Activity class="h-4 w-4" />
            With Icon
          </Button>
        </div>
      </Card>

      <!-- Cards -->
      <Card padding="lg" shadow="md">
        <h2 class="text-xl font-semibold mb-4">Cards</h2>
        <div class="grid grid-cols-3 gap-4">
          <Card variant="default" padding="md" shadow="sm">
            <p class="text-sm">Default Card</p>
          </Card>
          <Card variant="outline" padding="md" shadow="none">
            <p class="text-sm">Outline Card</p>
          </Card>
          <Card variant="ghost" padding="md" shadow="none">
            <p class="text-sm">Ghost Card</p>
          </Card>
        </div>

        <h3 class="text-lg font-medium mt-6 mb-3">Hover Effects</h3>
        <div class="grid grid-cols-2 gap-4">
          <Card hover="lift" padding="md" shadow="sm" class="cursor-pointer">
            <p class="text-sm font-medium">Hover to Lift</p>
            <p class="text-xs text-text-tertiary mt-1">Elevates on hover</p>
          </Card>
          <Card hover="glow" padding="md" shadow="sm" class="cursor-pointer">
            <p class="text-sm font-medium">Hover to Glow</p>
            <p class="text-xs text-text-tertiary mt-1">Border glows on hover</p>
          </Card>
        </div>
      </Card>

      <!-- Badges -->
      <Card padding="lg" shadow="md">
        <h2 class="text-xl font-semibold mb-4">Badges</h2>
        
        <h3 class="text-sm font-medium mb-3">Variants</h3>
        <div class="flex flex-wrap gap-2 mb-6">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">
            <Check class="h-3 w-3" />
            Success
          </Badge>
          <Badge variant="warning">
            <AlertTriangle class="h-3 w-3" />
            Warning
          </Badge>
          <Badge variant="danger">
            <X class="h-3 w-3" />
            Danger
          </Badge>
          <Badge variant="outline">Outline</Badge>
        </div>

        <h3 class="text-sm font-medium mb-3">Connection Status Examples</h3>
        <div class="flex flex-wrap gap-2">
          <Badge variant="success">
            <Activity class="h-3 w-3" />
            Proxy Active
          </Badge>
          <Badge variant="default">
            <Zap class="h-3 w-3" />
            Auto Switch
          </Badge>
          <Badge variant="secondary">
            <Circle class="h-3 w-3" />
            Direct
          </Badge>
          <Badge variant="danger">
            <AlertTriangle class="h-3 w-3" />
            Error
          </Badge>
        </div>
      </Card>

      <!-- Connection Status Example -->
      <Card padding="lg" shadow="lg">
        <div class="flex items-start gap-4">
          <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/20">
            <Activity class="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold">Proxy Active</h3>
            <p class="text-sm text-text-secondary mt-1">
              All traffic routed through Corporate VPN
            </p>
            <div class="flex items-center gap-4 mt-3">
              <Badge variant="default" size="sm">
                <Zap class="h-3 w-3" />
                Auto Switch
              </Badge>
              <span class="text-xs text-text-tertiary">247 requests today</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Typography -->
      <Card padding="lg" shadow="md">
        <h2 class="text-xl font-semibold mb-4">Typography</h2>
        <div class="space-y-2">
          <p class="text-3xl font-bold">Heading 3XL</p>
          <p class="text-2xl font-bold">Heading 2XL</p>
          <p class="text-xl font-semibold">Heading XL</p>
          <p class="text-lg font-medium">Heading LG</p>
          <p class="text-base">Body Base</p>
          <p class="text-sm text-text-secondary">Body Small</p>
          <p class="text-xs text-text-tertiary">Body XS</p>
          <code class="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            Monospace: proxy.example.com:8080
          </code>
        </div>
      </Card>

      <!-- Color Palette -->
      <Card padding="lg" shadow="md">
        <h2 class="text-xl font-semibold mb-4">Color Palette</h2>
        
        <h3 class="text-sm font-medium mb-3">Connection States</h3>
        <div class="grid grid-cols-4 gap-3">
          <div class="space-y-2">
            <div class="h-16 rounded-md bg-green-500 flex items-center justify-center text-white font-medium">
              Active
            </div>
            <p class="text-xs text-center text-text-secondary">Proxy Active</p>
          </div>
          <div class="space-y-2">
            <div class="h-16 rounded-md bg-blue-500 flex items-center justify-center text-white font-medium">
              Auto
            </div>
            <p class="text-xs text-center text-text-secondary">Auto Switch</p>
          </div>
          <div class="space-y-2">
            <div class="h-16 rounded-md bg-gray-500 flex items-center justify-center text-white font-medium">
              Direct
            </div>
            <p class="text-xs text-center text-text-secondary">Direct Connection</p>
          </div>
          <div class="space-y-2">
            <div class="h-16 rounded-md bg-red-500 flex items-center justify-center text-white font-medium">
              Error
            </div>
            <p class="text-xs text-center text-text-secondary">Connection Failed</p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, Card, Badge } from '@/components/ui';
import { ThemeToggle } from '@/components/layout';
import { Activity, Zap, Circle, AlertTriangle, Check, X } from 'lucide-vue-next';
</script>
