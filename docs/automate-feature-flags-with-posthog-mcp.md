---
sidebar_position: 1
---


# Automate feature flags with PostHog MCP

In this guide, you’ll learn how to use the PostHog MCP server to create and manage feature flags directly from your editor.

The [Model Context Protocol (MCP)](https://posthog.com/docs/model-context-protocol) is a standard that connects agents and editors to external tools. PostHog provides an MCP server so you can manage feature flags, send surveys, or run experiments without leaving your development environment.

## Prerequisites

Before you start, make sure you have:

- An MCP-compatible environment (for example, Cursor).
- A PostHog account with API credentials that work with MCP.
- An app already [set up with PostHog](https://posthog.com/blog/envoy-wizard-llm-agent).
- The [PostHog MCP server](https://posthog.com/docs/model-context-protocol) installed and running.

## Example app: TaskHog

This example uses a simple to-do app. You can explore the code in the [example repository](LINK).
<!-- TODO: add repo link -->

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-1.png" alt="A to-do list app with five tasks, one completed and crossed out." height="500"/>

We’ll add a new **Mark all complete** button and put it behind a feature flag. Using MCP, you’ll:

- Create the feature flag.
- Target a test group of users.
- Roll it out to all users once it’s stable.
- Clean up when the feature is fully shipped.

By the end, you’ll have a repeatable workflow for automating feature flag management.

## Step 1: Add a feature behind a flag

In the `App.tsx` file, add a **"Mark all complete"** button to the to-do list:

```jsx
const markAllComplete = () => {
  setTodos(todos.map((todo) => ({ ...todo, completed: true })));
};

/// create the button 
{todos.length > 0 && (
  <button onClick={markAllComplete} className="mark-all-button">
    Mark all complete
  </button>
)}
```

Now import `PostHogFeature` from `"posthog-js/react"` and wrap the button in a feature flag check:

```jsx
<PostHogFeature flag="mark-all-complete" match={true}>
  {todos.length > 0 && (
    <button onClick={markAllComplete} className="mark-all-button">
      Mark all complete
    </button>
  )}
</PostHogFeature>
```

The button only appears when the `mark-all-complete` flag is active.

## Step 2: Use the MCP server to create a feature flag

Next, create the feature flag in PostHog. Instead of opening the PostHog UI, use your agent with the MCP server:

```bash
/mcp feature-flag-create mark-all-complete
```

You’ll get a response similar to:

> Created feature flag mark-all-complete with the following configuration:
> Name: Mark All Complete Button
> Key: mark-all-complete
> Description: Controls visibility of the “Mark all complete” button in the TaskHog app
> Status: Active
> Rollout: 100% to all users
> You can view and manage this feature flag at: https://...

You can view the flag in the PostHog UI:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-2-posthog-ui.png" alt="PostHog feature flag page for ‘mark-all-complete,’ showing it is enabled and rolled out to all users." height="500"/>

But you don’t need to switch contexts. You can keep working in your editor and ask the agent to interact with your feature flags:

```bash
# see all feature flags
/mcp feature-flag-get-all

# get a specific feature flag definition
/mcp feature-flag-get-definition mark-all-complete
```

## Step 3: Invite a test cohort

Feature flags are most useful when you can test changes with a small group before rolling them out widely. With MCP, you can target specific users or groups without leaving your editor.

With MCP, you can change feature-flag targeting rules from your dev environment and target:

- users sharing a specific trait (for example, an email domain),
- a small percentage of users, or
- an explicit list of users.

PostHog’s MCP server supports operations like `update-feature-flag` to modify filters, rollout settings, and user targeting.

Here are example commands you might run (adapt them to your MCP client or API syntax):

```bash
# Target only users with @acme.com in their email
/mcp update-feature-flag --key mark-all-complete --filters 'email CONTAINS "@example.com"'

# Or set a small rollout percentage (for example, 10%)
/mcp update-feature-flag --key mark-all-complete --rollout 10

# Or target a specific list of users by identifier (for example, user IDs or emails)
/mcp update-feature-flag --key mark-all-complete --users user1@example.com user2@example.com
```

However, you don't need to even remember these commands. You can just ask your agent to do this job for you:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-3-agent-conversation.png" alt="Code snippet showing a PostHog feature flag update. The flag 'mark-all-complete' is set to show only for users with emails containing '@example.com'." height="500"/>

Now, if you check the app, you will see that the feature is available to our hard-coded user, `brambell.prickleton@example.com` and disappears when the user changes:

<div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
  <div style={{flex: 1, textAlign: 'center'}}>
    <img src="/img/automate-feature-flags-with-posthog-mcp/example-app-4-feature-flag-working.png" alt="A green 'Mark all complete' button is visible, showing the enabled feature flag for the logged-in user email is on the @example.com domain." style={{width: '100%', height: 'auto'}}/>
    <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>Feature flag is enabled.</p>
  </div>
  <div style={{flex: 1, textAlign: 'center'}}>
    <img src="/img/automate-feature-flags-with-posthog-mcp/example-app-4-feature-flag-working-2.png" alt="Basic to-do app as the logged-in user email is not at @example.com domain." style={{width: '100%', height: 'auto'}}/>
    <p style={{fontSize: '14px', color: '#666', marginTop: '10px'}}>Feature flag is off.</p>
  </div>
</div>

At this point, you can add the feature flag users according to your product needs. 

### Updating a flag

You might need to adjust rollout percentage or targeting rules after launch. For example, to expand targeting rules:

```bash
/mcp update-feature-flag --key mark-all-complete --filters 'email CONTAINS "@acme.com" OR email CONTAINS "@partner.com"'
```

Or to increase rollout to 50%:

```bash
/mcp update-feature-flag --key mark-all-complete --rollout 50
```

This can be verified either within the terminal or, if you prefer, on the PostHog dashboard:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-5-fewer-users.png" alt="PostHog dashboard showing a feature flag named 'mark-all-complete'. Release conditions indicate it applies to 50% of users with email addresses ending in @example.com. The flag status is shown as ENABLED." height="500"/>

## Handling updates, rollbacks, and cleanup

Once your feature is live, you will often need to make changes. Apart from the updates which we covered in the previous point, MCP lets you also disable, or retire feature flags directly from your editor.

### Roll back quickly

If a feature causes issues in production, you can disable its flag immediately:

```bash
/mcp update-feature-flag --key mark-all-complete --active false
```

This lets you roll back without redeploying your app.

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-6.png" alt='PostHog dashboard showing the feature flag "mark-all-complete". Release conditions target 50% of users with email addresses ending in @example.com. The status is highlighted as DISABLED.' height="500"/>

### Clean up shipped flags

When a feature is fully rolled out, you don’t need the flag anymore. Instead of deleting it right away, follow a two-step cleanup:

1. Remove the flag from your codebase. Replace the `PostHogFeature` wrapper with the permanent feature code.

2. Archive or delete the flag in PostHog. Use MCP to mark the flag as inactive or remove it completely if your team prefers.

```bash
/mcp delete-feature-flag --key mark-all-complete
```

Cleaning up feature flags keeps your codebase lean and prevents confusion in future rollouts.

## Advanced: Next things to try

Once you’re comfortable using MCP to manage feature flags, you can extend the workflow to cover more advanced use cases:

- **Automated A/B experiments** – Create multiple variants of a feature and measure impact on key metrics.
- **Surveys triggered by feature usage** – Collect feedback from users who interact with a new feature.
- **Integrating with metrics and SLIs** – Connect rollouts to your monitoring stack so you can pause or roll back automatically if performance drops.
- **Chained workflows** – Combine feature flag updates with deployments, alerts, or CI/CD pipelines.
- **Cross-tool automation** – Use MCP to coordinate flags, experiments, and data pipelines across multiple services.

## Wrapping up

Using the PostHog MCP server, you can create, test, and manage feature flags without leaving your editor. This workflow helps you:

- Ship features safely behind flags.  
- Target specific users or cohorts.  
- Roll out gradually and roll back quickly if needed.  
- Clean up flags once features are fully launched.  

From here, you can expand into experiments, surveys, and monitoring integrations to make your workflow even stronger.  

By keeping feature management close to your development environment, you shorten feedback loops and reduce context switching.
