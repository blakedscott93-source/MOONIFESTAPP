# Sentry Error Tracking Setup Guide

Sentry is configured and ready to use! Just add your DSN to start tracking errors.

## Quick Setup (5 minutes)

### 1. Create Sentry Account (Free)
- Go to https://sentry.io/signup/
- Sign up with GitHub, Google, or email
- **Free tier includes**: 5,000 errors/month, 10,000 performance units

### 2. Create New Project
1. Click "Create Project"
2. Select platform: **React Native**
3. Set alert frequency: **On every new issue** (recommended)
4. Name your project: `moonifest-mobile`
5. Click "Create Project"

### 3. Get Your DSN
1. After project creation, you'll see setup instructions
2. Copy your DSN (looks like: `https://xxxxx@yyyyy.ingest.sentry.io/zzzzz`)
3. Or find it later in: Settings > Projects > moonifest-mobile > Client Keys (DSN)

### 4. Add DSN to .env File
Open `.env` and update:
```bash
SENTRY_DSN=https://your-actual-dsn-here.ingest.sentry.io/your-project-id
```

### 5. Restart Your App
```bash
# Kill the current Expo server
# Then restart with:
npx expo start --clear
```

## ✅ That's It!

Sentry is now tracking errors automatically. You'll see:
- **Crash reports** with stack traces
- **Error context** (device info, OS, app version)
- **User breadcrumbs** (actions leading to errors)
- **Performance monitoring**

## Testing Sentry Integration

### Method 1: Trigger Test Error
Add this to any screen temporarily:
```typescript
<TouchableOpacity onPress={() => { throw new Error('Sentry test error!'); }}>
  <Text>Test Sentry</Text>
</TouchableOpacity>
```

### Method 2: Use Sentry Utility
```typescript
import { captureMessage, captureError } from './src/utils/sentry';

// Send a test message
captureMessage('Sentry is working!', 'info');

// Send a test error
captureError(new Error('Test error from Moonifest'));
```

### Check Sentry Dashboard
1. Go to https://sentry.io
2. Click your project: `moonifest-mobile`
3. You should see the test error appear within seconds!

## What Gets Tracked Automatically

✅ **React Errors** - Caught by ErrorBoundary
✅ **Unhandled Promise Rejections** - Network failures, async errors
✅ **Native Crashes** - iOS/Android native code crashes
✅ **Performance Issues** - Slow screens, API calls

## Advanced Features

### Track User Context
```typescript
import { setUser, clearUser } from './src/utils/sentry';

// On login
setUser({
  id: userId,
  email: userEmail,
  username: userName,
});

// On logout
clearUser();
```

### Add Custom Context
```typescript
import { addBreadcrumb, setContext } from './src/utils/sentry';

// Track user actions
addBreadcrumb({
  message: 'User completed gratitude journal',
  category: 'user-action',
  level: 'info',
});

// Add context for debugging
setContext('gratitude-entry', {
  entryCount: 3,
  hasVoiceRecording: true,
});
```

### Manual Error Capture
```typescript
import { captureError } from './src/utils/sentry';

try {
  await riskyOperation();
} catch (error) {
  captureError(error, {
    operation: 'voice-transcription',
    audioUri: uri,
  });
}
```

## Sentry Dashboard Features

### Issues Tab
- See all errors grouped by type
- View error frequency and affected users
- Stack traces with source code context

### Performance Tab
- Track screen load times
- Monitor API call performance
- Identify slow operations

### Releases Tab
- Track errors by app version
- Compare error rates between releases
- View which release introduced issues

## Development vs Production

By default:
- **Development**: Errors logged to console only (not sent to Sentry)
- **Production**: All errors sent to Sentry

To test Sentry in development, add to `.env`:
```bash
SENTRY_DEV=true
```

## Pricing & Limits

**Free Tier** (perfect for starting):
- 5,000 errors/month
- 10,000 performance transactions
- 30-day event retention
- Unlimited projects

**If you exceed limits**:
- Older events are deleted first
- No charges - just stops accepting new events
- Upgrade to paid plan if needed (~$26/month)

## Troubleshooting

### Not seeing errors in Sentry?
1. Check DSN is correct in `.env`
2. Restart Expo server with `--clear` flag
3. Make sure you're testing in production mode, or set `SENTRY_DEV=true`
4. Check Sentry.io for any project configuration issues

### Errors only showing in console?
- Verify SENTRY_DSN is not 'your-sentry-dsn-here'
- Check for console message: `✅ Sentry initialized successfully`
- If you see `⚠️ Sentry not configured`, DSN is missing/invalid

## Security Notes

- ✅ DSN is safe to expose (it's client-side only)
- ✅ Sensitive data is filtered (no cookies, passwords)
- ✅ Source maps uploaded automatically (stack traces work)
- ✅ User IP addresses are anonymized by default

## What You Get

With Sentry configured, you'll:
1. **Know about crashes** before users report them
2. **See exact error locations** with stack traces
3. **Understand error context** (device, OS, user actions)
4. **Track error frequency** and trends
5. **Fix issues faster** with detailed debugging info

## Next Steps

1. Set up Sentry now (takes 5 minutes!)
2. Test with a sample error
3. Monitor your dashboard as you develop
4. Set up alerts for critical errors
5. Integrate with Slack/email for instant notifications

---

**Need help?** Check https://docs.sentry.io/platforms/react-native/
