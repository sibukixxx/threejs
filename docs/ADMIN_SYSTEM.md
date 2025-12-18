# Admin System Documentation

## Overview

Three.js デモアプリケーションの管理システム。シーン管理、認証、セキュリティ機能を提供します。

## Architecture

```
┌─────────────────┐
│  Admin UI       │  ← Glassmorphism Design
│  (index.html)   │
└────────┬────────┘
         │ HTTP/JSON
         ▼
┌─────────────────┐
│  Hono API       │  ← JWT + IP Whitelist
│  (port 3001)    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐ ┌──────────┐
│ Scenes │ │  Stats   │  ← In-Memory Storage
│ Config │ │  System  │
└────────┘ └──────────┘
```

## Key Features

### 1. 認証システム (Authentication)

- **JWT (JSON Web Tokens)**
  - 24時間有効期限（カスタマイズ可能）
  - HS256署名アルゴリズム
  - ペイロード: userId, username, iat, exp

- **Password Security**
  - bcrypt ハッシュ (10 salt rounds)
  - 平文保存なし
  - パスワード変更機能

### 2. セキュリティ (Security)

- **IP Whitelist**
  - カンマ区切りで複数IP設定可能
  - 空欄 = 全て許可
  - IPv4/IPv6対応
  - X-Forwarded-For ヘッダー対応

- **CORS Protection**
  - オリジン制限
  - 認証情報付きリクエスト対応
  - プリフライトリクエスト対応

### 3. シーン管理 (Scene Management)

5つのデモシーンを管理:

1. **Floor Manager** (`floor`)
   - ナイトクラブ/キャバクラ卓管理
   - デフォルトレイアウト: medium

2. **Champagne Tower** (`champagne`)
   - シャンパンタワーシミュレーター
   - デフォルト段数: 5

3. **Glitter Demo** (`glitter`)
   - 化粧品ラメシミュレーター

4. **Subsurface Scattering** (`subsurface`)
   - 美容製品マテリアル

5. **Vanning Simulator** (`vanning`)
   - コンテナ積載最適化
   - デフォルトコンテナ: 20ft

### 4. システム統計 (System Stats)

- **Uptime**: サーバー起動時間
- **Request Count**: 総リクエスト数
- **Version**: システムバージョン
- **Health Status**: ヘルスチェック

## Setup Guide

### 環境変数設定

```env
# 必須設定
JWT_SECRET=長いランダム文字列に変更すること
ADMIN_PASSWORD=強力なパスワードに変更すること

# セキュリティ設定
IP_WHITELIST=127.0.0.1,192.168.1.100  # 本番環境では設定推奨

# CORS設定
CORS_ORIGIN=https://your-frontend-domain.com
```

### インストール

```bash
# 依存関係インストール
npm install

# Admin server起動
npm run dev:admin
```

### 初回ログイン

1. Admin UI を開く: `admin/client/index.html`
2. デフォルト認証情報でログイン:
   - Username: `admin`
   - Password: `.env`で設定した値

3. **重要**: 初回ログイン後、必ずパスワードを変更すること

## API Usage Examples

### Login

```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'your-password'
  })
})

const { data } = await response.json()
const token = data.token
```

### Get Scenes

```javascript
const response = await fetch('http://localhost:3001/api/admin/scenes', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const { data } = await response.json()
// data = [{ id: 'floor', name: 'Floor Manager', enabled: true, ... }, ...]
```

### Toggle Scene

```javascript
await fetch('http://localhost:3001/api/admin/scenes/floor/toggle', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### Get System Stats

```javascript
const response = await fetch('http://localhost:3001/api/admin/stats', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const { data } = await response.json()
// data = { uptime: 3600, requests: 150, version: '1.0.0', ... }
```

## Frontend Integration

### React Example

```typescript
import { useState, useEffect } from 'react'

interface Scene {
  id: string
  name: string
  enabled: boolean
}

function AdminPanel() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const token = localStorage.getItem('adminToken')

  useEffect(() => {
    fetch('http://localhost:3001/api/admin/scenes', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setScenes(data.data))
  }, [])

  const toggleScene = async (sceneId: string) => {
    await fetch(`http://localhost:3001/api/admin/scenes/${sceneId}/toggle`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    // Reload scenes
  }

  return (
    <div>
      {scenes.map(scene => (
        <div key={scene.id}>
          <h3>{scene.name}</h3>
          <button onClick={() => toggleScene(scene.id)}>
            {scene.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
    </div>
  )
}
```

## Deployment Checklist

### Pre-deployment

- [ ] Change `JWT_SECRET` to strong random string
- [ ] Change `ADMIN_PASSWORD` to strong password
- [ ] Enable `IP_WHITELIST` for security
- [ ] Set `CORS_ORIGIN` to production frontend URL
- [ ] Set `NODE_ENV=production`
- [ ] Test all API endpoints
- [ ] Test authentication flow
- [ ] Test IP whitelist (if enabled)

### Deployment Options

1. **Traditional VPS**
   ```bash
   npm run build:admin
   NODE_ENV=production node dist/index.js
   ```

2. **PM2 (Recommended)**
   ```bash
   pm2 start dist/index.js --name threejs-admin
   pm2 startup
   pm2 save
   ```

3. **Docker**
   ```dockerfile
   FROM node:20-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY admin/dist ./admin/dist
   COPY .env .
   EXPOSE 3001
   CMD ["node", "admin/dist/index.js"]
   ```

4. **Serverless (Vercel/Netlify)**
   - Hono supports edge deployments
   - See [Hono Deployment Guide](https://hono.dev/getting-started/vercel)

### Post-deployment

- [ ] Verify server is running
- [ ] Test health endpoint: `GET /api/admin/health`
- [ ] Test login flow
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use strong, random values for secrets
   - Rotate secrets regularly

2. **IP Whitelist**
   - Enable in production
   - Only whitelist necessary IPs
   - Update when IP changes

3. **Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Change default password immediately
   - Use password manager

4. **HTTPS**
   - Always use HTTPS in production
   - Use Let's Encrypt for free SSL
   - Redirect HTTP to HTTPS

5. **Rate Limiting**
   - Consider adding rate limiting middleware
   - Prevent brute force attacks
   - Limit API requests per IP

## Troubleshooting

### Cannot connect to API

- Check server is running: `npm run dev:admin`
- Verify port 3001 is not blocked
- Check CORS settings in `.env`
- Look for errors in server logs

### 401 Unauthorized

- Token expired (24h default) - login again
- Token invalid - check JWT_SECRET hasn't changed
- Token not sent - check Authorization header

### 403 Forbidden

- IP not whitelisted - check `IP_WHITELIST` in `.env`
- Check server logs for your IP address
- Add IP or disable whitelist temporarily

### Scene changes not reflected

- Check if scene exists: `GET /api/admin/scenes`
- Verify token is valid
- Check server logs for errors
- Frontend may need cache clear

## Maintenance

### Logs

Server logs include:
- Authentication events (login, logout)
- IP whitelist checks
- Scene modifications
- API errors

Monitor logs for suspicious activity.

### Backups

Currently using in-memory storage. For production:
- Implement database (PostgreSQL, MongoDB, etc.)
- Regular database backups
- Export scene configurations

### Updates

```bash
# Update dependencies
npm update

# Rebuild
npm run build:admin

# Restart server
pm2 restart threejs-admin
```

## Future Enhancements

Potential improvements:

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User management (multiple admin users)
- [ ] Role-based access control (RBAC)
- [ ] Activity logs and audit trail
- [ ] Real-time notifications (WebSocket)
- [ ] Scene configuration editor
- [ ] Backup/restore functionality
- [ ] API rate limiting
- [ ] 2FA authentication
- [ ] Email notifications
- [ ] Dashboard analytics

## Support

For issues or questions:

1. Check this documentation
2. Review `admin/README.md`
3. Check server logs
4. Review Hono documentation: https://hono.dev/

---

**Last Updated**: 2025-12-18
**Version**: 1.0.0
