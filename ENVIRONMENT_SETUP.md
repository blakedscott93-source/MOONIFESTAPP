# Environment Setup Guide

## 🔐 Setting Up Environment Variables

This app requires environment variables for external services. Follow these steps:

### 1. Create `.env` file

Copy the example file:
```bash
cp .env.example .env
```

### 2. Configure Supabase

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project or select existing
3. Navigate to **Settings → API**
4. Copy the following values to your `.env` file:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Stripe (Optional - for premium features)

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy **Publishable key** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Use **test mode** for development

### 4. Configure Sentry (Optional - for error tracking)

1. Go to [https://sentry.io](https://sentry.io)
2. Create a new project (React Native)
3. Copy the **DSN** → `EXPO_PUBLIC_SENTRY_DSN`

### 5. Verify Setup

Your `.env` file should look like this:

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

## 🚨 SECURITY NOTES

- **NEVER commit `.env` to git** (already in `.gitignore`)
- **NEVER share your keys publicly**
- **Rotate keys immediately** if accidentally exposed
- Use **test keys** for development
- Use **production keys** only in production builds

## 🔄 Rotating Exposed Keys

If you accidentally committed keys to git:

1. **Supabase**: Project Settings → API → Reset anon key
2. **Stripe**: Dashboard → API keys → Delete & create new
3. **Sentry**: Settings → Client Keys (DSN) → Rotate key
4. Update `.env` with new keys
5. **Remove from git history**:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## ✅ Testing Configuration

Run the app and check console for errors:
```bash
npm start
```

If environment variables are missing, you'll see warnings in the console.
