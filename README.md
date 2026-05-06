# xenforo-html-client

> JavaScript HTML client for XenForo forums — anti-bot bypass, thread/post/member parsing, proxy support.

[![npm](https://img.shields.io/badge/install-npm-blue?style=flat-square)](https://github.com/jalisco2213/xenforo-html-client)
[![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Anti-Bot Bypass](#anti-bot-bypass)
- [Using the Cookie](#using-the-cookie)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Environment Variables](#environment-variables)
- [Exported API](#exported-api)

---

## Installation

```bash
npm install github:jalisco2213/xenforo-html-client
```

**Dependencies**

| Package | Purpose |
|---|---|
| `axios` | HTTP requests |
| `cheerio` | HTML parsing |
| `https-proxy-agent` | HTTPS proxy support |
| `socks-proxy-agent` | SOCKS proxy support |
| `vm2` | Secure JS execution in sandbox |

---

## Quick Start

```js
const xenforo = require('xenforo-html-client');

xenforo.configure({ baseUrl: 'https://forum.example.com' });

const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...';
const antibot = await xenforo.bypassAntibot(userAgent);

console.log(antibot.cookie);     // Cookie for subsequent requests
console.log(antibot.userAgent);  // User-Agent used during bypass
```

---

## Configuration

### `configure(options)`

Sets global library options.

| Parameter | Type | Description |
|---|---|---|
| `options.baseUrl` | `string` | Base URL of the forum (e.g. `https://forum.example.com`) |

**Returns:** `{ baseUrl: string }`

```js
xenforo.configure({ baseUrl: 'https://forum.example.com' });
```

The base URL can also be set via environment variable:

```bash
XENFORO_BASE_URL=https://forum.example.com
```

---

### `getBaseUrl(value?)`

Returns the current base URL. Priority order:

1. Value passed as argument
2. Value set via `configure()`
3. `XENFORO_BASE_URL` environment variable

Throws an `Error` if none of the sources are set.

```js
const url = xenforo.getBaseUrl(); // 'https://forum.example.com'
```

---

### `normalizeBaseUrl(value)`

Trims whitespace and trailing slashes from a URL.

```js
xenforo.normalizeBaseUrl('https://forum.example.com///');
// → 'https://forum.example.com'
```

---

## Anti-Bot Bypass

### `bypassAntibot(userAgent, proxy?, baseUrl?)`

Bypasses the forum anti-bot system (`R3ACTLAB-ARZ1`). Fetches the forum page, extracts encrypted codes from the HTML, decrypts them using AES, and produces a valid cookie.

**Parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `userAgent` | `string` | — | User-Agent for the HTTP request |
| `proxy` | `string` | `null` | Proxy server URL (optional) |
| `baseUrl` | `string` | `null` | Override base URL (optional) |

**Supported proxy formats**

| Format | Type |
|---|---|
| `http://host:port` | HTTP / HTTPS proxy |
| `socks5://host:port` | SOCKS5 proxy |
| `socks4://host:port` | SOCKS4 proxy |

**Returns:** `Promise<{ cookie: string, userAgent: string }>`

| Field | Description |
|---|---|
| `cookie` | Ready-to-use string: `R3ACTLAB-ARZ1=<value>; expires=...` |
| `userAgent` | User-Agent used during the request |

**Examples**

```js
// No proxy
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
);
// R3ACTLAB-ARZ1=abc123...; expires=Thu, 31-Dec-37 23:55:55 GMT; path=/

// SOCKS5 proxy
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 ...',
  'socks5://127.0.0.1:9050'
);

// HTTP proxy with explicit baseUrl
const antibot = await xenforo.bypassAntibot(
  'Mozilla/5.0 ...',
  'http://proxy.example.com:8080',
  'https://forum.example.com'
);
```

> Throws `Error: Error bypassing antibot: <reason>` if bypass fails.

---

## Using the Cookie

Combine the antibot cookie with forum session cookies and pass them in the `Cookie` header with every request.

```js
const antibot = await xenforo.bypassAntibot(userAgent);
const antibotValue = antibot.cookie.split(';')[0]; // value only

const cookie = antibotValue
  + '; xf_csrf=<your_csrf_token>'
  + '; xf_session=<your_session_token>'
  + '; xf_user=<your_user_token>';

const response = await axios.get('https://forum.example.com/forums/1/', {
  headers: {
    'User-Agent': userAgent,
    'Cookie': cookie
  }
});
```

---

## Data Models

### `Thread`

```js
const { Thread } = require('xenforo-html-client');

const thread = new Thread({
  threadId: 123,
  title: 'Thread Title',
  author: 'username',
  date: '2024-01-15T10:00:00Z',
  categoryId: 5,
  posts: [],
  replyCount: 42,
  isLocked: false
});
```

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Thread ID |
| `title` | `string` | Thread title |
| `author` | `string` | Thread author |
| `date` | `Date` | Creation date |
| `category` | `number` | Category ID |
| `posts` | `Array` | Posts array (default `[]`) |
| `replyCount` | `number` | Number of replies |
| `isLocked` | `boolean` | Whether the thread is locked |

---

### `Post`

```js
const { Post } = require('xenforo-html-client');

const post = new Post({
  postId: 456,
  creator: 'username',
  htmlContent: '<p>Post content</p>',
  createDate: '2024-01-15T11:00:00Z',
  thread: 123,
  textContent: 'Post content'
});
```

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Post ID |
| `author` | `string` | Post author |
| `content` | `string` | HTML content |
| `date` | `string` | Creation date |
| `thread` | `number` | Parent thread ID |
| `textContent` | `string` | Plain text content (no HTML) |

---

### `Member`

```js
const { Member } = require('xenforo-html-client');

const member = new Member({
  userId: 789,
  username: 'john_doe',
  role: 'Moderator',
  roles: ['Moderator', 'VIP'],
  messageCount: 1500,
  reactionScore: 320,
  trophyPoints: 75,
  lastActivity: '2024-01-15T12:00:00Z'
});
```

| Property | Type | Description |
|---|---|---|
| `id` | `number` | User ID |
| `username` | `string` | Username |
| `role` | `string` | Primary role |
| `roles` | `Array` | All user roles |
| `messageCount` | `number` | Total message count |
| `reactionScore` | `number` | Reaction score |
| `trophyPoints` | `number` | Trophy points |
| `lastActivity` | `string` | Last activity timestamp |

---

### `Category`

```js
const { Category } = require('xenforo-html-client');

const category = new Category({
  categoryId: 1,
  title: 'General',
  description: 'General discussion'
});
```

| Property | Type | Description |
|---|---|---|
| `id` | `number` | Category ID |
| `title` | `string` | Category title |
| `description` | `string` | Category description |

---

## Error Handling

### `IncorrectLoginData`

Thrown when invalid login credentials are provided.

```js
const { IncorrectLoginData } = require('xenforo-html-client');

try {
  // ... authentication operation
} catch (err) {
  if (err instanceof IncorrectLoginData) {
    console.error('Invalid username or password');
  }
}
```

### `ThisIsYouError`

Thrown when attempting to perform an action on your own profile (e.g. following yourself).

```js
const { ThisIsYouError } = require('xenforo-html-client');

try {
  // ...
} catch (err) {
  if (err instanceof ThisIsYouError) {
    console.error('Cannot perform this action on your own profile');
  }
}
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `XENFORO_BASE_URL` | Base forum URL. Used as fallback if `configure()` was not called. |

Using with `dotenv`:

```bash
# .env
XENFORO_BASE_URL=https://forum.example.com
```

```js
require('dotenv').config();
const xenforo = require('xenforo-html-client');
// baseUrl is picked up automatically
```

---

## Exported API

```js
const {
  configure,          // Set global config
  getBaseUrl,         // Get current base URL
  normalizeBaseUrl,   // Normalize a URL string
  bypassAntibot,      // Bypass anti-bot protection
  IncorrectLoginData, // Error: invalid login credentials
  ThisIsYouError,     // Error: action on own profile
  Category,           // Category model
  Member,             // Member model
  Thread,             // Thread model
  Post,               // Post model
} = require('xenforo-html-client');
```
