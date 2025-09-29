---
sidebar_position: 1
---

# Automate feature flags with PostHog MCP

In this tutorial, we will use the PostHog MCP server to create and manage feature flags directly from your editor.

The [Model Context Protocol (MCP)](https://posthog.com/docs/model-context-protocol) is a standard that allows agents and editors to connect with external tools. PostHog provides an MCP server so you can automate common tasks in your project without leaving your dev environment. Instead of switching to the PostHog UI every time you want to create or update a flag, send a survey, or run an experiment, you can do it through your agent.

## Prerequisities

For this project, you will need:

- An MCP-compatible environment, such as Cursor.
- A PostHog account with API credentials that have MCP access.
- An app already configured [to use PostHog](https://posthog.com/blog/envoy-wizard-llm-agent), with [the PostHog MCP server](https://posthog.com/docs/model-context-protocol) set up.

## Example app: TaskHog

We’ll use a basic to-do app as an example. You can explore the code in this repository.

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-1.png" alt="A to-do list app with five tasks, one completed and crossed out." height="500"/>

We’ll add a new "Mark all complete" button and put it behind a feature flag. Then, we’ll use MCP to:

- Create the feature flag.
- Enable it for a test group of users.
- Roll it out to all users once it’s stable.
- Clean up when the feature is fully shipped.

By the end of this guide, you’ll have a repeatable workflow for automating feature flag management and other common tasks.

## Step 1: Create a feature behind a flag

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

Now, import `PostHogFeature` from `"posthog-js/react"` to the file and use it to wrap the new button with a feature flag check:

```jsx
<PostHogFeature flag="mark-all-complete" match={true}>
  {todos.length > 0 && (
    <button onClick={markAllComplete} className="mark-all-button">
      Mark all complete
    </button>
  )}
</PostHogFeature>
```

In this way, the button will only appear when the flag is active.

## Step 2: Use the MCP server to create a feature flag


Next, create the feature flag  called `mark-all-complete` in PostHog. Instead of switching to the PostHog UI, ask your agent to create it through the MCP server:

```bash
/mcp feature-flag-create mark-all-complete
```

Once the command has been executed, you should get a response similar to this one:

> Perfect! I've successfully created the mark-all-complete feature flag in PostHog with the following configuration:
> * Name: Mark All Complete Button
> * Key: mark-all-complete (matches what you're using in your code)
> * Description: Controls the visibility of the 'Mark all complete' button in the TaskHog todo application
> * Status: Active (enabled)
> * Rollout: 100% to all users
> * Feature Flag ID: 203789
> The feature flag is now live and will control the visibility of your "Mark all complete" button. Since it's set to 100% rollout and active, all users will see the button. You can adjust the rollout percentage or targeting criteria in the PostHog dashboard if needed.
>  You can view and manage this feature flag at: https://...

You can follow the link to see the feature flag on PostHog UI:

<img src="/img/automate-feature-flags-with-posthog-mcp/example-app-2-posthog-ui.png" alt="“PostHog feature flag page for ‘mark-all-complete,’ showing it is enabled and rolled out to all users.”" height="500"/>

However, you don't need to switch the context. You can instead use the MCP server to interact with your feature flags:

```bash
# see all feature flags
/mcp feature-flag-get-all

# get a specific feature flag definition
/mcp feature-flag-get-definition mark-all-complete
```

