# Three.js Admin System

モダンでセキュアな管理システム - Hono API + JWT認証 + IP制限

## 🌟 Features

- **🔐 JWT Authentication** - Token-based secure authentication
- **🛡️ IP Whitelist** - IP-based access control
- **🎨 Modern UI** - Glassmorphism design with smooth animations
- **⚡ Fast API** - Lightweight Hono framework
- **📊 Scene Management** - Enable/disable Three.js scenes
- **📈 System Stats** - Real-time server statistics
- **🚀 Easy Deployment** - Single server, simple configuration

## 📁 Directory Structure

```
admin/
├── server/
│   ├── index.ts                 # Main Hono server
│   ├── types.ts                 # TypeScript interfaces
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication
│   │   └── ipWhitelist.ts       # IP whitelist middleware
│   └── routes/
│       ├── auth.ts              # Authentication endpoints
│       └── admin.ts             # Admin operation endpoints
├── client/
│   └── index.html               # Admin UI (single-page app)
├── tsconfig.json                # TypeScript configuration
└── README.md                    # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important environment variables:**

```env
# Change these in production!
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_PASSWORD=your-secure-password

# Optional: IP whitelist (leave empty to allow all)
IP_WHITELIST=127.0.0.1,192.168.1.100

# CORS origin (frontend URL)
CORS_ORIGIN=http://localhost:5173
```

### 3. Start Admin Server

```bash
npm run dev:admin
```

The server will start on `http://localhost:3001`

### 4. Open Admin UI

Open `admin/client/index.html` in your browser or serve it via a static server:

```bash
# Option 1: Open directly
open admin/client/index.html

# Option 2: Use a static server (recommended)
npx serve admin/client
```

### 5. Login

Use the credentials from your `.env` file:

- **Username:** `admin` (default)
- **Password:** `admin123` (default - CHANGE THIS!)

## 🔧 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/logout` | Logout | ✅ |
| POST | `/api/auth/change-password` | Change password | ✅ |

### Admin Operations

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/scenes` | List all scenes | ✅ |
| GET | `/api/admin/scenes/:id` | Get scene details | ✅ |
| PUT | `/api/admin/scenes/:id` | Update scene config | ✅ |
| POST | `/api/admin/scenes/:id/toggle` | Enable/disable scene | ✅ |
| GET | `/api/admin/stats` | Get system stats | ✅ |
| GET | `/api/admin/health` | Health check | ❌ |
| POST | `/api/admin/clear-cache` | Clear cache | ✅ |

## 🔐 Security Features

### JWT Authentication

All protected endpoints require a Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/admin/scenes
```

Token includes:
- User ID and username
- Expiration time (default 24h)
- HMAC signature verification

### IP Whitelist

Configure allowed IPs in `.env`:

```env
# Allow specific IPs only
IP_WHITELIST=127.0.0.1,192.168.1.100,10.0.0.1

# Allow all IPs (leave empty)
IP_WHITELIST=
```

Supports:
- IPv4 addresses
- Localhost variations (127.0.0.1, ::1)
- Comma-separated list

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plaintext
- Minimum 6 characters for new passwords

## 📊 Frontend Integration

### Login Example

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'your-password'
  })
})

const data = await response.json()
const token = data.data.token

// Store token
localStorage.setItem('adminToken', token)
```

### Authenticated Request Example

```javascript
const response = await fetch('http://localhost:3001/api/admin/scenes', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await response.json()
console.log(data.data) // Array of scenes
```

### Scene Toggle Example

```javascript
await fetch('http://localhost:3001/api/admin/scenes/floor/toggle', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 🚀 Deployment

### Build for Production

```bash
npm run build:admin
```

### Environment Setup

1. Update `.env` with production values:
   - Strong `JWT_SECRET` (use random string generator)
   - Strong `ADMIN_PASSWORD`
   - Enable `IP_WHITELIST` for security
   - Set correct `CORS_ORIGIN`

2. Set `NODE_ENV=production`

### Deployment Options

#### Option 1: Node.js Server

```bash
NODE_ENV=production node dist/index.js
```

#### Option 2: PM2 (Process Manager)

```bash
pm2 start dist/index.js --name threejs-admin
pm2 save
pm2 startup
```

#### Option 3: Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY admin/dist ./admin/dist
COPY .env .
CMD ["node", "admin/dist/index.js"]
EXPOSE 3001
```

#### Option 4: Vercel/Netlify

Hono supports edge deployments - see [Hono deployment docs](https://hono.dev/getting-started/vercel)

### Serve Admin UI

The `admin/client/index.html` can be served via:

- Static file hosting (Netlify, Vercel, S3)
- Nginx/Apache
- Same server as API (add static file middleware)

Update `API_BASE_URL` in `index.html` to point to your production API.

## 🔧 Development

### Project Structure

```typescript
// admin/server/types.ts
export interface AdminUser {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
  lastLogin?: string
}

export interface SceneConfig {
  id: string
  name: string
  enabled: boolean
  settings?: Record<string, any>
}
```

### Adding New Routes

1. Create route file in `admin/server/routes/`
2. Import and mount in `admin/server/index.ts`:

```typescript
import myRouter from './routes/myRouter'
app.route('/api/my-route', myRouter)
```

### Adding Middleware

```typescript
// admin/server/middleware/myMiddleware.ts
import { Context, Next } from 'hono'

export async function myMiddleware(c: Context, next: Next) {
  // Your logic here
  await next()
}
```

## 📝 API Response Format

All endpoints return consistent JSON:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message"
}
```

## 🐛 Troubleshooting

### CORS Errors

Update `CORS_ORIGIN` in `.env`:

```env
CORS_ORIGIN=http://localhost:5173
```

### IP Whitelist Blocking Requests

Check server logs for IP address:

```
[IP Whitelist] Checking IP: 127.0.0.1
[IP Whitelist] Blocked IP: 127.0.0.1
```

Add your IP to `IP_WHITELIST` or leave it empty to disable.

### Token Expired

Tokens expire after 24 hours (configurable). Login again to get a new token.

### Port Already in Use

Change port in `.env`:

```env
PORT=3002
```

## 📚 Tech Stack

- **[Hono](https://hono.dev/)** - Ultrafast web framework
- **[JWT](https://jwt.io/)** - JSON Web Tokens
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing
- **TypeScript** - Type safety
- **Vanilla JS** - Lightweight frontend (no framework overhead)

## 🎨 UI Features

- **Glassmorphism Design** - Modern backdrop-filter effects
- **Responsive Layout** - Mobile-friendly
- **Smooth Animations** - Micro-interactions
- **Real-time Updates** - Auto-refreshing stats
- **Dark Theme** - Eye-friendly interface

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please follow the existing code style and patterns.

---

**Built with ❤️ for the Three.js Demo System**
