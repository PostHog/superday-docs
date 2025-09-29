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

<img src="/static/img/automate-feature-flags-with-posthog-mcp/example-app-1.png" alt="A to-do list app with five tasks, one completed and crossed out." height="500">

We’ll add a new "Mark all complete" button and put it behind a feature flag. Then we’ll use MCP to:

- Create the feature flag.
- Enable it for a test group of users.
- Roll it out to all users once it’s stable.
- Clean up when the feature is fully shipped.

By the end of this guide, you’ll have a repeatable workflow for automating feature flag management and other common tasks.


