---
sidebar_position: 1
---

# Automate feature flags with PostHog MCP

Manage PostHog feature flags directly from your code editor using AI agents. Instead of switching between your editor and the PostHog dashboard, you can create, update, and monitor feature flags through natural language commands.

In this guide, you'll build a complete feature flag workflow that enables you to:

- Create feature flags without leaving your editor.
- Target specific user groups through AI commands.  
- Roll out features gradually and roll back instantly.
- Clean up flags when features are fully shipped.

### What is MCP?

The [Model Context Protocol (MCP)](https://posthog.com/docs/model-context-protocol) is a standard that connects AI agents and code editors to external tools. An agent is an AI assistant (like Claude or ChatGPT) that can perform tasks on your behalf.

## Who this guide is for

You'll find this guide useful if you:

- Manage feature rollouts in production applications.
- Love increasing your productivity (or want to reduce context switching between tools during development).
- Need to quickly roll back features without redeploying.
- Work with AI-powered development environments like Cursor or Claude.

## Prerequisites

Before you start, make sure you have:

- An MCP-compatible code editor such as [Cursor](https://cursor.sh/) or VS Code with the MCP extension.
- Node.js 18+ and npm or yarn installed.
- A PostHog account.

You can use your own app that is already [set up with PostHog](https://posthog.com/blog/envoy-wizard-llm-agent) or follow along with the example app we use below.

## Example app: TaskHog

This example uses a simple Vite app built with React. You can explore the code in the [GitHub repository](https://github.com/sylwiavargas/TaskHog).

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-1.png" alt="TaskHog to-do app interface." height="500"/>

The TaskHog app has a simple structure:

```
TaskHog App
├── App.tsx (Main component)
│   ├── Todo list display
│   ├── Add todo functionality
│   ├── Mark complete functionality
│   └── PostHog integration
├── components/ (UI components)
└── styles/ (CSS files)
```

We’ll add a new **Mark all complete** button and put it behind a feature flag without ever leaving your IDE. In other words, no need to open your browser, ever. As you will see, using MCP, you will just chat with your agent and:

- Create a feature flag.
- Target a test group of users.
- Roll it out to all users once it’s stable.
- Clean up when the feature is fully shipped.

By the end, you’ll have a repeatable workflow for automating feature flag management.

## Step 0: Install the PostHog MCP server

Install the PostHog MCP server to connect your AI agent to PostHog. This enables you to manage feature flags, run analytics queries, create A/B experiments, and collect user feedback through natural language commands directly from your editor.

Follow the [MCP setup guide](https://posthog.com/docs/model-context-protocol) to install and configure the server with your PostHog API credentials.

## Step 1: Add a feature behind a flag

In the `App.tsx` file, first import the PostHog feature flag component:

```jsx
import { PostHogFeature } from 'posthog-js/react';
```

Then add a **"Mark all complete"** button to the to-do list:

```jsx
// Create the button inside your component's return statement 
{todos.length > 0 && (
  <button onClick={markAllComplete} className="mark-all-button">
    Mark all complete
  </button>
)}
```

Now wrap the button in a feature flag check. It's just one line of code so you may manage it yourself but of course you can ask your agent to do it for you. Anyway, here is the code:

```jsx
// highlight-next-line
<PostHogFeature flag="mark-all-complete" match={true}>
  {todos.length > 0 && (
    <button onClick={markAllComplete} className="mark-all-button">
      Mark all complete
    </button>
  )}
// highlight-next-line
</PostHogFeature>
```

The button only appears when the `mark-all-complete` flag is active.

## Step 2: Use the MCP server to create a feature flag

You can now ask your AI agent to create the feature flag. Open your Cursor Chat (or your coding agent of preference) and strike up a chat:

```bash
Create a feature flag in PostHog called "mark-all-complete" for the Mark All Complete button
```

Your agent will use the PostHog MCP server and respond with something like this:

```bash
Created feature flag mark-all-complete with the following configuration:
Name: Mark All Complete Button
Key: mark-all-complete
Description: Controls visibility of the "Mark all complete" button in the TaskHog app
Status: Active
Rollout: 100% to all users
You can view and manage this feature flag at: https://app.posthog.com/...
```

Then ask your agent for information about existing flags:

```bash
Show me all feature flags in this project
```

Or:

```bash
Get the details for the mark-all-complete feature flag
```

If you're feeling dubious, you may of course verify the flag in the PostHog UI:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-2-posthog-ui.png" alt="PostHog dashboard showing mark-all-complete feature flag." height="500"/>

:::warning When not to automate feature flags

While MCP automation is powerful for most feature flags, use manual controls for:

- **High-risk features** that could impact revenue, data integrity, or user safety.
- **Security-sensitive logic** like authentication, authorization, or payment processing.
- **Infrastructure changes** that affect database connections, API endpoints, or third-party integrations.
- **Compliance-critical features** in regulated industries (such as healthcare, finance).
- **Features with complex dependencies** that require careful coordination across multiple systems.

For these scenarios, use PostHog's dashboard for manual review and approval workflows.

:::

## Step 3: Invite a test cohort

Use feature flags to test changes with small groups before wide rollouts. You can target specific users or groups.

With MCP, you can change feature-flag targeting rules from your dev environment and target:

- users sharing a specific trait (for example, an email domain),
- a small percentage of users, or
- an explicit list of users.

PostHog’s MCP server supports operations like `update-feature-flag` to modify filters, rollout settings, and user targeting.

You can ask your AI agent to target specific users in natural language:

```bash
Update the mark-all-complete flag to only show for users with @example.com emails
```

```bash
Set the mark-all-complete flag to show for 10% of users
```

```bash
Target the mark-all-complete flag to specific users: user1@example.com, user2@example.com
```

Long story short, you can skip memorizing commands. If you know what effect you're after, you can ask your AI agent in your own words:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-3-agent-conversation.png" alt="AI agent conversation updating feature flag targeting." height="500"/>

Now, if you check the app, you will see that the feature is available to our hard-coded user, `brambell.prickleton@example.com` and disappears when the user changes:

<div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
  <div style={{flex: 1, textAlign: 'center'}}>
    <img src="/img/automate-feature-flags-with-posthog-mcp/example-app-4-feature-flag-working.png" alt="TaskHog app with Mark all complete button enabled." style={{width: '100%', height: 'auto'}}/>
    <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>Feature flag is enabled.</p>
  </div>
  <div style={{flex: 1, textAlign: 'center'}}>
    <img src="/img/automate-feature-flags-with-posthog-mcp/example-app-4-feature-flag-working-2.png" alt="TaskHog app with feature flag disabled." style={{width: '100%', height: 'auto'}}/>
    <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>Feature flag is off.</p>
  </div>
</div>

At this point, you can add the feature flag users according to your product needs. 

### Updating a flag

You might need to adjust rollout percentage or targeting rules after launch. For example, to expand targeting rules, Ask your agent to make these changes:

```bash
Expand the mark-all-complete flag to include @acme.com and @partner.com email domains
```

```bash
Increase the mark-all-complete flag rollout to 50% of users
```

This can be verified either within the terminal or, if you prefer, on the PostHog dashboard:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-5-fewer-users.png" alt="PostHog dashboard showing 50% rollout configuration." height="500"/>

## Handling updates, rollbacks, and cleanup

Once your feature is live, you will often need to make changes. Apart from the updates which we covered in the previous point, MCP lets you also disable, or retire feature flags directly from your editor.

### Roll back quickly

If a feature causes issues in production, you can disable its flag immediately:

```bash
Disable the mark-all-complete feature flag
```

You can roll back without redeploying your app, giving you instant control over feature availability.

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-6.png" alt='PostHog dashboard showing disabled feature flag' height="500"/>

### Clean up shipped flags

When a feature is fully rolled out, you don't need the flag anymore. Follow this two-step cleanup process:

1. **Remove the flag from your codebase**: Replace the `PostHogFeature` wrapper with the permanent feature code:

```jsx
// Remove this wrapper
<PostHogFeature flag="mark-all-complete" match={true}>
    {/* Keep only the button code */}
</PostHogFeature>
```

2. **Delete the flag in PostHog**: Ask your agent to clean up:

```bash
Delete the mark-all-complete feature flag since it's fully shipped
```

Cleaning up feature flags keeps your codebase lean and prevents confusion in future rollouts.

## Troubleshooting common issues and solutions

**Agent doesn't recognize MCP commands**

- Verify the PostHog MCP server is running and connected.
- Check your API credentials are properly configured.
- Restart your code editor and reconnect to the MCP server.

**Feature flag not appearing in app**

- Confirm the flag key matches exactly (case-sensitive).
- Check that PostHog is properly initialized in your app.
- Verify the user meets the targeting criteria you set.

**Commands return errors**

- Ensure you have the necessary permissions in your PostHog project
- Check that the feature flag exists before trying to update it
- Verify your PostHog project ID is correctly configured in MCP

## Advanced: Next things to try

Once you’re comfortable using MCP to manage feature flags, you can extend the workflow to cover more advanced use cases:

- **Automated A/B experiments** – Create multiple variants of a feature and measure impact on key metrics.
- **Surveys triggered by feature usage** – Collect feedback from users who interact with a new feature.
- **Integrating with metrics and SLIs** – Connect rollouts to your monitoring stack so you can pause or roll back automatically if performance drops.
- **Chained workflows** – Combine feature flag updates with deployments, alerts, or CI/CD pipelines.
- **Cross-tool automation** – Use MCP to coordinate flags, experiments, and data pipelines across multiple services.

## Next steps

You now have a complete feature flag workflow using PostHog MCP. This approach lets you ship features safely, target specific users, and roll back instantly, all from your code editor.

**Try these next:**
- Set up [A/B experiments](https://posthog.com/docs/experiments) using MCP commands
- Create [user surveys](https://posthog.com/docs/surveys) triggered by feature usage.  
- Connect flags to your [monitoring dashboard](https://posthog.com/docs/product-analytics) for automated rollbacks.
- Explore [PostHog's other MCP capabilities](https://posthog.com/docs/model-context-protocol) for surveys and analytics.

**Resources:**
- [PostHog MCP documentation](https://posthog.com/docs/model-context-protocol).
- [Feature flags best practices](https://posthog.com/docs/feature-flags/best-practices).
- [PostHog community](https://posthog.com/questions) for questions and support.