---
title: Setup tutorial
sidebar_label: Tutorial
sidebar_position: 3
---

# Email tracking setup tutorial

Follow this step-by-step guide to start tracking Resend email events in PostHog. You'll need about 15 minutes to complete this tutorial.

## Before you begin

To get started with this tutorial, you need the following: 

- PostHog account
- Resend account with API access
- A verified domain in Resend (or use their test domain for initial setup)

## Step 1: Create PostHog incoming webhook

First, set up PostHog to receive webhooks from Resend.

:::note
Incoming webhooks are an experimental feature and you may need to enable them for your account. To enable Incoming webhook sources, go to [your PostHog feature preview settings](https://app.posthog.com/settings/user-feature-previews).
:::

1. Log into your PostHog dashboard.
2. Navigate to **Data pipelines** in the left sidebar.
3. Click **New** > **Source**.
4. Select **HTTP Incoming Webhook"** from the list.
5. Optional: Edit the name and description.
6. Click **Create & enable**

PostHog generates a unique webhook URL that looks like:

```
https://us.i.posthog.com/capture/hook/abc123xyz...
```

Copy this URL to your clipboard, you'll need it in Step 3 to configure Resend.

## Step 2: Add Hog transformation code

Now you'll add code that transforms Resend's webhook format into PostHog events.

1. In your newly created webhook, click **Edit source code**.
2. You'll see a code editor with template code
3. **Replace all the code** with this transformation:

```hog
// Validate HTTP method
if(request.method != 'POST') {
  return {
    'httpResponse': {
      'status': 405,
      'body': 'Method not allowed'
    }
  }
}

// Map Resend event types to PostHog event names
let eventType := request.body.type
let event := 'email_unknown_event'

if (eventType == 'email.delivered') {
    event := 'email_delivered'
} else if (eventType == 'email.opened') {
    event := 'email_opened'
} else if (eventType == 'email.clicked') {
    event := 'email_link_clicked'
} else if (eventType == 'email.bounced') {
    event := 'email_bounced'
} else if (eventType == 'email.complained') {
    event := 'email_spam_complaint'
}

// Extract distinct_id: prefer user_id from tags, fallback to recipient email
let tags := request.body.data.tags
let distinctId := (tags and tags.user_id) ? tags.user_id : request.body.data.to[1]

// Build base properties object
let props := {
    'email_id': request.body.data.email_id,
    'email_subject': request.body.data.subject,
    'email_from': request.body.data.from,
    'email_to': request.body.data.to[1]
}

// Add event-specific properties
if (request.body.type == 'email.clicked') {
    props['clicked_link'] := request.body.data.click.link
    props['click_timestamp'] := request.body.data.click.timestamp
}

if (request.body.type == 'email.bounced') {
    props['bounce_type'] := request.body.data.bounce.type
}

// Validate required fields
if(empty(event)) {
  return {
    'httpResponse': {
      'status': 400,
      'body': {
        'error': 'Event could not be parsed'
      }
    }
  }
}

if(empty(distinctId)) {
  return {
    'httpResponse': {
      'status': 400,
      'body': {
        'error': 'Distinct ID could not be parsed'
      }
    }
  }
}

// Send to PostHog
postHogCapture({
  'event': event,
  'distinct_id': distinctId,
  'properties': props,
  'timestamp': request.body.created_at
})
```

4. Scroll to the bottom of the page and click **Save**.

This transformation:

- Receives webhook POST requests from Resend
- Maps Resend event names (like `email.clicked`) to PostHog names (like `email_link_clicked`)
- Extracts the user ID from email tags (or uses email address as fallback)
- Captures relevant properties like email subject, clicked links, and bounce types
- Sends the transformed event to PostHog's capture system


## Step 3: Configure Resend webhook

Connect Resend to your PostHog webhook.

1. Log into your [Resend dashboard](https://resend.com/webhooks)
2. Navigate to **Webhooks** in the sidebar
3. Click **"Create webhook"**
4. **Endpoint URL**: Paste your PostHog webhook URL from Step 1
5. **Events to subscribe**: Check these boxes:
   - ✅ `email.sent`
   - ✅ `email.delivered`
   - ✅ `email.opened`
   - ✅ `email.clicked`
   - ✅ `email.bounced`
   - ✅ `email.complained`
6. Click **"Create"** to save

:::warning Important
Make sure all event types are selected, especially `email.opened` and `email.clicked`. Without these, you won't get open and click tracking.
:::

## Step 4: Verify domain (optional but recommended)

For production use and to enable tracking, verify your domain in Resend.

1. In Resend dashboard, go to **Domains**
2. Click **Add domain**.
3. Enter your domain.
4. Add the DNS records Resend provides to your domain's DNS settings.
5. Wait for verification (usually a few minutes).

:::tip For Testing
You can skip domain verification and use Resend's test domain `onboarding@resend.dev` for initial testing. However, tracking may be limited.
:::

## Step 5: Send a test email

Now let's verify everything works by sending a test email.

### Option A: Using Node.js

Create a file called `send-test-email.js`:

```javascript
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendTestEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'hello@yourdomain.com', // Use your verified domain
      to: ['your-email@example.com'], // Your email address
      subject: 'PostHog Integration Test',
      html: `
        <h1>Testing PostHog Email Tracking</h1>
        <p>This email tests the Resend → PostHog integration.</p>
        <p><a href="https://example.com/test-link">Click this test link</a></p>
        <p><a href="https://example.com/another-link">Click this other link</a></p>
      `,
      tags: {
        user_id: 'test-user-123' // This becomes the distinct_id in PostHog
      }
    });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('Email ID:', data.id);
    console.log('\nNext steps:');
    console.log('1. Check your email inbox');
    console.log('2. Open the email');
    console.log('3. Click the test links');
    console.log('4. Wait 2-3 minutes');
    console.log('5. Check PostHog Activity for events');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

sendTestEmail();
```

Run it:
```bash
# Install dependencies
npm install resend

# Run the script
RESEND_API_KEY=re_your_api_key_here node send-test-email.js
```

### Option B: Using cURL

```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_RESEND_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "hello@yourdomain.com",
    "to": ["your-email@example.com"],
    "subject": "PostHog Integration Test",
    "html": "<h1>Test Email</h1><p>Testing the integration <a href=\"https://example.com/test\">with a link</a></p>",
    "tags": {
      "user_id": "test-user-123"
    }
  }'
```

:::info About user_id
The `user_id` tag is how PostHog identifies which user the email event belongs to. Always include it when sending emails to connect email events with user behavior.
:::

## Step 6: Verify events in PostHog

Now check that events are flowing into PostHog.

:::note Event Timing
Events can take 2-5 minutes to appear in PostHog after they occur. If you don't see events immediately, wait a few minutes and refresh.
:::

1. Check email delivery event.

   - Go to **Activity**
   - Filter by `distinct_id = test-user-123`
   - Look for `email_delivered` event

2. Open the email in your inbox.

   - Refresh PostHog Activity
   - Look for `email_opened` event

3. Click a link in the email.

   - Refresh PostHog Activity
   - Look for `email_link_clicked` event
   - Check the event properties to see which link was clicked


In PostHog Activity, you should see events like this:

**Event: email_delivered**
```json
{
  "distinct_id": "test-user-123",
  "properties": {
    "email_id": "abc123...",
    "email_subject": "PostHog Integration Test",
    "email_from": "hello@yourdomain.com",
    "email_to": "your-email@example.com"
  }
}
```

**Event: email_link_clicked**
```json
{
  "distinct_id": "test-user-123",
  "properties": {
    "email_id": "abc123...",
    "email_subject": "PostHog Integration Test",
    "email_from": "hello@yourdomain.com",
    "email_to": "your-email@example.com",
    "clicked_link": "https://example.com/test-link",
    "click_timestamp": "2025-11-11T17:55:21.057Z"
  }
}
```

## Need help?

Check out the [Troubleshooting Guide](./troubleshooting) for detailed solutions to common issues.

## Next steps

Yay! You're now tracking email events in PostHog.

Learn more in the [Going Further](./do-more) guide.