# Events

> Lightweight, type-safe, and framework-agnostic event dispatcher and reactive
> state management library.

## Description

This library provides a robust foundation for building event-driven
architectures in TypeScript. By offering `Signal` for generic pub/sub mechanisms
and `Store` for reactive state containers, it enables highly decoupled
components with strict typing. It natively integrates with standard lifecycle
contracts (like `Disposable` and `Exposable`), ensuring safe resource cleanup
and restricted API exposure.

## Features

- **Signal**: A strictly-typed event dispatcher for triggering and listening to
  specific actions or notifications.
- **Store**: A reactive state container that holds a value, evaluates equality,
  and notifies subscribers only when the value changes.
- **Type-Safe Payloads**: Fully typed event payloads leveraging TypeScript's
  tuple types to ensure listeners and dispatchers are always in sync.
- **Connection Management**: Persistent and non-persistent event connections
  that can be individually disconnected or batch-cleared.
- **Restricted Exposure**: Built-in `expose()` method to provide a read-only
  view of events, preventing external consumers from firing or clearing the
  event.
- **Lifecycle Safety**: Native support for standard disposal contracts,
  preventing memory leaks and throwing safe errors if dispatched after disposal.

## Getting Started

### Prerequisites

- [Deno 1.40 or higher](https://deno.land/)

### Installation

```bash
deno add jsr:@rayscale/events
```

## Overview

### Using `Signal`

```typescript
import { Signal } from '@rayscale/events'

// 1. Create a strictly typed signal
const onUserLogin = new Signal<[string, number]>()

// 2. Subscribe to the signal
const connection = onUserLogin.connect((username, attempts) => {
  console.log(`User ${username} logged in after ${attempts} attempts.`)
})

// 3. Dispatch the event
onUserLogin.fire('johndoe', 2)

// 4. Cleanup when done
connection.disconnect()
// or onUserLogin.dispose()
```

### Using `Store`

```typescript
import { Store } from '@rayscale/events'

// 1. Create a reactive state container
const themeStore = new Store<'light' | 'dark'>('light')

// 2. Listen to state changes
themeStore.connect((theme) => {
  console.log(`Theme updated to: ${theme}`)
})

// 3. Update the value (triggers listeners)
themeStore.set('dark') // Logs: Theme updated to: dark

// 4. Updating with the same value does nothing (built-in equality check)
themeStore.set('dark') // No log

// 5. Retrieve the current value directly
console.log(themeStore.get()) // 'dark'
```

## Documentation & Help

### Ecosystem Dependencies

- [@rayscale/types](https://jsr.io/@rayscale/types)

### Troubleshooting

- **Error**: `Signal is disposed, cannot fire**`: You are trying to dispatch an
  event or set a store value after `dispose()` has been called on it. Ensure
  that you are not interacting with disposed resources.
- **Error**: `Event is disposed, cannot clear**`: Similar to the above,
  `clear()` cannot be called once the event instance has been permanently marked
  as disposed.

---

## Authors

- **Rayscale** ([@rayscale](https://github.com/rayscale))

## License

This project is licensed under the MIT License - see the `LICENSE` file for
details.
