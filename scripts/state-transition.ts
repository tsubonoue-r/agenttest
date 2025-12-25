#!/usr/bin/env tsx
/**
 * State Transition Manager
 * Manages Issue/PR state transitions based on label changes
 */

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0] || '';
const repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

// State label definitions
const STATE_LABELS: Record<string, string> = {
  pending: '📥 state:pending',
  analyzing: '🔍 state:analyzing',
  implementing: '🏗️ state:implementing',
  reviewing: '👀 state:reviewing',
  testing: '🧪 state:testing',
  deploying: '🚀 state:deploying',
  done: '✅ state:done',
  blocked: '🚫 state:blocked',
  paused: '⏸️ state:paused',
};

// Valid state transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['analyzing', 'blocked', 'paused'],
  analyzing: ['implementing', 'blocked', 'paused', 'pending'],
  implementing: ['reviewing', 'blocked', 'paused', 'analyzing'],
  reviewing: ['testing', 'implementing', 'blocked', 'paused'],
  testing: ['deploying', 'implementing', 'blocked', 'paused'],
  deploying: ['done', 'blocked', 'paused'],
  done: ['pending'], // Allow reopening
  blocked: ['pending', 'analyzing', 'implementing', 'reviewing', 'testing'],
  paused: ['pending', 'analyzing', 'implementing', 'reviewing', 'testing'],
};

function parseArgs(): { issue: number; to: string; reason: string } {
  const args = process.argv.slice(2);
  let issue = 0;
  let to = '';
  let reason = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--issue' || args[i].startsWith('--issue=')) {
      issue = parseInt(args[i].includes('=') ? args[i].split('=')[1] : args[++i]);
    } else if (args[i] === '--to' || args[i].startsWith('--to=')) {
      to = args[i].includes('=') ? args[i].split('=')[1] : args[++i];
    } else if (args[i] === '--reason' || args[i].startsWith('--reason=')) {
      reason = args[i].includes('=') ? args[i].split('=')[1] : args[++i];
    }
  }

  return { issue, to, reason };
}

async function getCurrentState(issueNumber: number): Promise<string | null> {
  const issue = await octokit.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  const labels = issue.data.labels.map((l) =>
    typeof l === 'string' ? l : l.name || ''
  );

  for (const [state, label] of Object.entries(STATE_LABELS)) {
    if (labels.includes(label)) {
      return state;
    }
  }

  return null;
}

async function removeStateLabels(issueNumber: number): Promise<void> {
  const issue = await octokit.issues.get({
    owner,
    repo,
    issue_number: issueNumber,
  });

  const labels = issue.data.labels.map((l) =>
    typeof l === 'string' ? l : l.name || ''
  );

  const stateLabels = Object.values(STATE_LABELS);
  const labelsToRemove = labels.filter((l) => stateLabels.includes(l));

  for (const label of labelsToRemove) {
    try {
      await octokit.issues.removeLabel({
        owner,
        repo,
        issue_number: issueNumber,
        name: label,
      });
    } catch {
      // Label might not exist, ignore
    }
  }
}

async function transition(
  issueNumber: number,
  toState: string,
  reason: string
): Promise<void> {
  const currentState = await getCurrentState(issueNumber);

  console.log(`🔄 State Transition: #${issueNumber}`);
  console.log(`  From: ${currentState || 'none'}`);
  console.log(`  To: ${toState}`);
  console.log(`  Reason: ${reason}`);

  // Validate transition
  if (currentState && !VALID_TRANSITIONS[currentState]?.includes(toState)) {
    console.warn(
      `⚠️ Warning: Transition from "${currentState}" to "${toState}" is not standard`
    );
  }

  // Remove existing state labels
  await removeStateLabels(issueNumber);

  // Add new state label
  const newLabel = STATE_LABELS[toState];
  if (newLabel) {
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels: [newLabel],
    });
    console.log(`✅ Added label: ${newLabel}`);
  }

  // Add transition comment
  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body: `🔄 **State Transition**

| From | To | Reason |
|------|-----|--------|
| ${currentState || 'none'} | ${toState} | ${reason} |

---
*Automated by [State Machine](../.github/workflows/state-machine.yml)*`,
  });

  console.log('✅ Transition complete');
}

async function main() {
  const { issue, to, reason } = parseArgs();

  if (!issue || !to) {
    console.error('Usage: state-transition.ts --issue=<number> --to=<state> --reason="<reason>"');
    console.error('States:', Object.keys(STATE_LABELS).join(', '));
    process.exit(1);
  }

  try {
    await transition(issue, to, reason || 'No reason provided');
  } catch (error) {
    console.error('❌ Error during transition:', error);
    process.exit(1);
  }
}

main();
