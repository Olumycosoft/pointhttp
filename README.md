# PointHTTP 🚀

> **A premium, fully interactive browser-based REST client playground & API documentation portal for Node.js.** 

Built and maintained with ❤️ by **[Olumycosoft](https://github.com/Olumycosoft)**.

PointHTTP automatically converts your `.http` (VS Code REST Client standard) files into a stunning, dark-mode interactive playground. Mount it as a middleware in Express or NestJS to let developers test, execute, and document APIs directly inside the browser with zero third-party dependencies!

---

## ✨ Features

- **📂 Live Folder & File Navigation:** Sleek sidebar grouping all `.http` modular documents.
- **⚡ In-Browser Execution:** Run REST requests directly from the interface using the native browser `fetch` API.
- **🔐 Environment Variables Panel:** Manage dynamic environment variables (like `{{baseUrl}}`, `{{authToken}}`) with a live-syncing grid editor.
- **📝 Live Request Customization:** Customize request query parameters and body payloads dynamically in the UI before execution.
- **📦 Collapsible Interactive JSON Tree:** Inspect API response structures easily with expandable/collapsible JSON nodes.
- **💾 Local Storage Snapshots:** Save, manage, and recall historic response snapshots directly in the browser.
- **📋 Developer Quick Actions:** One-click copy JSON responses, download payloads, or copy ready-to-run `cURL` commands.
- **🔒 Production Grade Security:**
  - **No SSRF:** Requests are dispatched client-side in the user's browser. Your server is completely insulated.
  - **XSS Sanitized:** Comprehensive sanitization of values, variables, and tree keys protects against malicious HTML injections.
  - **Auth Gates:** Inject custom authentication gate callbacks (e.g. JWT verification) before serving the playground.

---

## 📦 Installation

```bash
npm install pointhttp
```

---

## 🚀 Quick Start

### 0. Zero-Config Setup ⚡

If you want to get up and running instantly with no parameters, simply mount the playground middleware with zero configuration. It will automatically scan your project directories recursively for `.http` documents and load default brand styling out-of-the-box:

```typescript
import express from 'express';
import { playground } from 'pointhttp';

const app = express();

// Just mount it - scans directories & serves automatically!
app.use('/docs/http', playground());

app.listen(3000);
```

### 1. In Express

```typescript
import express from 'express';
import { playground } from 'pointhttp';
import path from 'path';

const app = express();

app.use(
  '/docs/api',
  playground({
    modulesDir: path.join(process.cwd(), 'src/modules'),
    title: 'Interactive API Portal',
    logoText: 'AP',
    logoTitle: 'MyAPI Docs',
    // Optional: Allowed environments. Defaults to ['development', 'test'] to secure production
    enabledEnvironments: ['development', 'test', 'staging'],
  })
);

app.listen(3000);
```

### 2. In NestJS

You can easily mount the Express middleware onto your NestJS app in `main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { playground } from 'pointhttp';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    '/docs/http',
    playground({
      modulesDir: path.join(process.cwd(), 'src/modules'),
      title: 'Code API Portal',
      logoText: 'iD',
      logoTitle: 'Code Docs',
      // Optional 
      // Default variables that are global (others are dynamically loaded from .http files!)
      envVariables: {
        baseUrl: 'http://localhost:5000/api/v1',
        authToken: '',
      }
    })
  );

  await app.listen(3000);
}
bootstrap();
```

---

## 🛠️ API Reference

### `playground(options: PointHttpOptions)`

Configures and returns the PointHTTP Express middleware.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `modulesDir` | `string \| string[]` | `['src']` | Target directories to scan recursively for `.http` documents. |
| `title` | `string` | `'PointHTTP Playground'` | Document title displayed in the browser tab and page header. |
| `logoText` | `string` | `'PH'` | Logo icon text inside the sidebar. |
| `logoTitle` | `string` | `'PointHTTP'` | Logo title inside the sidebar header. |
| `customCss` | `string` | `''` | Custom CSS styles injected into the rendered HTML layout. |
| `enabledEnvironments`| `string[]` | `['development', 'test']`| Optional list of environments allowed to render the playground (matches against `process.env.NODE_ENV`). If not set, it defaults to `['development', 'test']` to ensure security and prevent accidental exposure in production! When disabled, the route falls through silently to normal `next()` handlers (so it looks like the route doesn't exist). |
| `envVariables` | `Record<string, string>`| `{}` | Optional default environment variables. (Note: Variables defined in `.http` files via `@name = value` are also automatically extracted and preloaded here!) |
| `customAuth` | `(req, res) => boolean \| Promise<boolean>` | `undefined` | Callback hook to authorize requests before rendering the portal. |

---

## 📝 `.http` File Syntax Reference

PointHTTP fully supports the **VS Code REST Client standard syntax**:

```http
# @name Authentication API
# This file handles login and token retrieval.

@baseUrl = http://localhost:3000/api/v1
@orderId = 4237e635-d2c1-4d33-a24f-05f400d0b23f

### Login Request
# Authenticates user credentials
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "dev@example.com",
  "password": "SecurePassword123"
}

### Get User Profile
GET {{baseUrl}}/users/profile
Authorization: Bearer {{authToken}}

### Get Order
GET {{baseUrl}}/orders/{{orderId}}
Authorization: Bearer {{authToken}}

### Get Orders List
# Fetches a paginated list of orders (supports multiline query strings!)
GET {{baseUrl}}/orders
  ?page=1
  &limit=10
  &status=pending
Authorization: Bearer {{authToken}}
```

---

## 🛡️ Security Best Practices

### Custom Auth Gates

To protect your staging or production environments, you can inject a `customAuth` check. Since PointHTTP is a completely independent library, it does not manage users or databases. Instead, it gives you a callback hook where you can run your own app's custom authentication logic using the standard Node/Express `req` and `res` objects.

Here are the three most popular copy-paste security patterns you can use:

#### Pattern A: Alphanumeric Secret Access Code (Super Lightweight! ⚡)
Perfect for internal dev teams or QA testers. Access the portal by visiting `https://your-domain.com/docs/http?code=A89F2K8Z`.

```typescript
playground({
  modulesDir: path.join(process.cwd(), 'src/modules'),
  customAuth: (req, res) => {
    const accessCode = req.query?.code;
    const SECRET_ACCESS_CODE = process.env.PLAYGROUND_ACCESS_CODE || 'A89F2K8Z';
    
    return accessCode === SECRET_ACCESS_CODE;
  }
})
```

#### Pattern B: JWT Cookie Verification (Seamless Security 🔐)
If your application's client dashboard stores a session JWT inside cookies, the browser will automatically pass it when developers visit the playground.

```typescript
import * as jwt from 'jsonwebtoken';

playground({
  modulesDir: path.join(process.cwd(), 'src/modules'),
  customAuth: async (req, res) => {
    const token = req.cookies?.auth_token;
    if (!token) return false; // Block access

    try {
      // Decode and verify the JWT with your app's secret
      const payload = jwt.verify(token, process.env.JWT_SECRET) as any;
      return payload.role === 'admin' || payload.role === 'developer';
    } catch (err) {
      return false; // Token expired or invalid
    }
  }
})
```

#### Pattern C: JWT Query Parameter (For LocalStorage Apps 🌐)
If your app stores JWTs in `localStorage` (which isn't sent in direct browser page requests), you can pass the token as a query parameter in the URL: `https://your-domain.com/docs/http?token=YOUR_JWT_HERE`.

```typescript
import * as jwt from 'jsonwebtoken';

playground({
  modulesDir: path.join(process.cwd(), 'src/modules'),
  customAuth: async (req, res) => {
    const token = req.query?.token;
    if (!token) return false;

    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true; // Valid token, show playground!
    } catch (err) {
      return false;
    }
  }
})
```

---

## 📄 License

MIT © **[Olumycosoft](https://github.com/Olumycosoft)**
