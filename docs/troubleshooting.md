---
title: Troubleshooting
sidebar_label: Troubleshooting
sidebar_position: 5
---

# Troubleshooting

Find solutions to common issues with receiving incoming webhooks from Resend.

:::note
PostHog's incoming webhook source is currently in an experimental state. It's not officially supported yet and may be unstable.
:::

## Events not appearing in PostHog

If events aren't appearing in PostHog, try these solutions.

### Check PostHog webhook logs

1. Go to PostHog > **Data pipelines** > **Sources** > Your webhook.
2. Click the **Logs** tab.
3. Look for recent executions and any error messages.

**What to look for:**
- Success status with `200 OK`
- Error messages or `400/500` status codes
- Debug output showing event type and data

### Check Resend webhook deliveries

1. Go to Resend > **Webhooks** > Your webhook.
2. Check **Recent deliveries** tab.
3. Verify deliveries show `200 OK` status.

**Common issues:**

- Webhook URL is incorrect
- Webhook not subscribed to required events
- Resend is sending events but PostHog isn't receiving them

### Verify you're actually testing

It sounds obvious, but double-check:

- Did you actually open the email? (Check spam folder)
- Did you actually click the links?
- Did you wait 2-5 minutes for events to process?

### Check event subscriptions

Make sure your Resend webhook is subscribed to the target events:

1. Go to Resend > **Webhooks** > Edit your webhook.
2. Verify that the event you want to track are selected. For example:
   - email.delivered
   - email.opened
   - email.clicked
   - email.bounced
   - email.complained

## Only getting email delivered events

**Problem:** You see `email_delivered` but not `email_opened` or `email_link_clicked`.

### Solution 1: Check webhook subscriptions

Resend webhook might not be subscribed to open and click events. See [Check event subscriptions](#check-event-subscriptions).

### Solution 2: Verify domain

Email tracking (opens/clicks) requires a verified domain:

1. Go to Resend > **Domains**.
2. Verify your domain is active.
3. Test domain has DNS records properly configured.
4. Make sure open tracking and/or click tracking are enabled.

:::tip
The test domain `onboarding@resend.dev` has limited tracking. Use a verified domain for full tracking.
:::

### Solution 3: Email client blocking

Some email clients (Apple Mail, Gmail) block tracking pixels:

- Try opening in a different email client
- Click links (those always track, even if opens don't)

## Empty event names

**Problem:** PostHog logs show `Event: ''` (empty string).

### Check Hog code

1. Verify the transformation code is saved
2. Check for syntax errors
3. Look at debug logs for `request.body.type` value

### Verify event mapping

Make sure your Hog code includes all event types:

```hog
if (eventType == 'email.delivered') {
    event := 'email_delivered'
} else if (eventType == 'email.opened') {
    event := 'email_opened'
} else if (eventType == 'email.clicked') {
    event := 'email_link_clicked'
// ... etc
```

## Missing distinct_id

**Problem:** Events appear but with no user attribution.

### Solution: Add user_id tag

Include `user_id` in email tags:

```javascript
await resend.emails.send({
  // ... email config
  tags: {
    user_id: 'your-user-id-here' // Add this!
  }
});
```

Without this tag, the integration falls back to using the recipient's email address as the `distinct_id`.

## Webhook delivery failures

**Problem:** Resend shows 4xx or 5xx errors for webhook deliveries.

### 405 Method not allowed

**Cause:** Resend is sending GET instead of POST (unlikely), or the Hog code is rejecting non-POST requests.

**Solution:** Verify the Hog code includes:
```hog
if(request.method != 'POST') {
  return {
    'httpResponse': {
      'status': 405,
      'body': 'Method not allowed'
    }
  }
}
```

### 400 Bad request

**Cause:** Validation failing (empty event or distinct_id).

**Solution:** Check PostHog logs for which validation is failing:
- Is `event` mapped correctly?
- Is `distinct_id` being extracted correctly?

### 500 Internal server error

**Cause:** Hog code has a runtime error.

**Solution:**
1. Check PostHog logs for error details
2. Look for null pointer errors or undefined variables
3. Add null checks in your Hog code

## Events delayed

**Problem:** Events take a long time to appear in PostHog.

**Expected behavior:** Events can take 2-5 minutes to process and appear in the PostHog UI.

**If longer than 5 minutes:**

1. Check PostHog status page
2. Verify webhook logs show successful execution
3. Check if there's a backlog

## Debugging tips

### Add debug logging

Temporarily add debug statements to your Hog code:

```hog
print('DEBUG - Request type:', request.body.type)
print('DEBUG - Request data:', request.body.data)
print('DEBUG - Mapped event:', event)
print('DEBUG - Distinct ID:', distinctId)
print('DEBUG - Properties:', props)
```

Check PostHog webhook logs to see the output.

:::warning
Remove debug statements in production to reduce log clutter.
:::

### Test with known payload

Use Resend's webhook testing tool:

1. Go to Resend webhook configuration.
2. Click **Test webhook**.
3. Send a test payload.
4. Check if PostHog receives it correctly.

### Compare with documentation

Verify your Resend webhook payload matches the expected format:

```json
{
  "type": "email.clicked",
  "created_at": "2025-11-11T17:55:21.057Z",
  "data": {
    "email_id": "abc123...",
    "from": "hello@yourdomain.com",
    "to": ["user@example.com"],
    "subject": "Email subject",
    "tags": {
      "user_id": "user-123"
    },
    "click": {
      "link": "https://example.com/page",
      "timestamp": "2025-11-11T17:55:21.057Z"
    }
  }
}
```

## Still having issues?

If you've tried everything and still having problems:

1. **Check service status:**
   - [PostHog Status](https://status.posthog.com)
   - [Resend Status](https://resend.com/status)

2. **Review the full setup:**
   - Go back through the [Tutorial](./tutorial) step by step
   - Verify each step was completed correctly

3. **Ask for help:**
   - [PostHog Community](https://posthog.com/questions)
   - [Resend Support](https://resend.com/support)