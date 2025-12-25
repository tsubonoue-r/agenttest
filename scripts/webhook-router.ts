#!/usr/bin/env tsx
/**
 * Webhook Event Router
 * Routes GitHub webhook events to appropriate handlers
 */

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0] || '';
const repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

type EventType = 'issue' | 'pr' | 'push' | 'comment';

interface EventHandler {
  (action: string, identifier: string): Promise<void>;
}

const handlers: Record<EventType, EventHandler> = {
  async issue(action: string, issueNumber: string) {
    console.log(`📥 Processing issue event: ${action} for #${issueNumber}`);

    const issue = await octokit.issues.get({
      owner,
      repo,
      issue_number: parseInt(issueNumber),
    });

    const labels = issue.data.labels.map((l) =>
      typeof l === 'string' ? l : l.name
    );

    console.log(`  Labels: ${labels.join(', ') || 'none'}`);
    console.log(`  State: ${issue.data.state}`);

    // Route based on action
    switch (action) {
      case 'opened':
        console.log('  → New issue opened, triggering initial triage');
        break;
      case 'labeled':
        console.log('  → Label added, checking for state transitions');
        break;
      case 'closed':
        console.log('  → Issue closed');
        break;
      default:
        console.log(`  → Action "${action}" noted`);
    }
  },

  async pr(action: string, prNumber: string) {
    console.log(`📥 Processing PR event: ${action} for #${prNumber}`);

    const pr = await octokit.pulls.get({
      owner,
      repo,
      pull_number: parseInt(prNumber),
    });

    console.log(`  Title: ${pr.data.title}`);
    console.log(`  State: ${pr.data.state}`);
    console.log(`  Mergeable: ${pr.data.mergeable}`);

    switch (action) {
      case 'opened':
        console.log('  → New PR opened, triggering review');
        break;
      case 'closed':
        if (pr.data.merged) {
          console.log('  → PR merged successfully');
        } else {
          console.log('  → PR closed without merge');
        }
        break;
      default:
        console.log(`  → Action "${action}" noted`);
    }
  },

  async push(branchName: string, commitSha: string) {
    console.log(`📥 Processing push event: ${branchName} @ ${commitSha}`);

    const commit = await octokit.repos.getCommit({
      owner,
      repo,
      ref: commitSha,
    });

    console.log(`  Author: ${commit.data.commit.author?.name}`);
    console.log(`  Message: ${commit.data.commit.message.split('\n')[0]}`);
    console.log(`  Files changed: ${commit.data.files?.length || 0}`);
  },

  async comment(issueNumber: string, author: string) {
    console.log(`📥 Processing comment event: #${issueNumber} by ${author}`);

    // Check if it's a command comment
    const comments = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: parseInt(issueNumber),
      per_page: 1,
      direction: 'desc',
    });

    if (comments.data.length > 0) {
      const body = comments.data[0].body || '';
      if (body.startsWith('/')) {
        console.log(`  → Command detected: ${body.split(' ')[0]}`);
      }
    }
  },
};

async function main() {
  const [eventType, ...args] = process.argv.slice(2) as [EventType, ...string[]];

  if (!eventType || !handlers[eventType]) {
    console.error('Usage: webhook-router.ts <event-type> <args...>');
    console.error('Event types: issue, pr, push, comment');
    process.exit(1);
  }

  try {
    await handlers[eventType](args[0], args[1]);
    console.log('✅ Event processed successfully');
  } catch (error) {
    console.error('❌ Error processing event:', error);
    process.exit(1);
  }
}

main();
