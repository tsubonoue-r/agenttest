#!/usr/bin/env tsx
/**
 * Dashboard Data Generator
 * Generates JSON data for project dashboard
 */

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0] || '';
const repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

interface DashboardData {
  generatedAt: string;
  repository: {
    owner: string;
    name: string;
  };
  issues: {
    total: number;
    open: number;
    closed: number;
    byState: Record<string, number>;
    byPriority: Record<string, number>;
    byType: Record<string, number>;
  };
  pullRequests: {
    total: number;
    open: number;
    merged: number;
    closed: number;
  };
  agents: {
    name: string;
    assignedIssues: number;
  }[];
  recentActivity: {
    type: string;
    title: string;
    number: number;
    timestamp: string;
  }[];
}

async function generateDashboardData(): Promise<DashboardData> {
  const data: DashboardData = {
    generatedAt: new Date().toISOString(),
    repository: { owner, name: repo },
    issues: {
      total: 0,
      open: 0,
      closed: 0,
      byState: {},
      byPriority: {},
      byType: {},
    },
    pullRequests: {
      total: 0,
      open: 0,
      merged: 0,
      closed: 0,
    },
    agents: [],
    recentActivity: [],
  };

  // Get issues
  const issues = await octokit.issues.listForRepo({
    owner,
    repo,
    state: 'all',
    per_page: 100,
  });

  const agentCounts: Record<string, number> = {};

  for (const issue of issues.data) {
    if (issue.pull_request) continue;

    data.issues.total++;
    if (issue.state === 'open') {
      data.issues.open++;
    } else {
      data.issues.closed++;
    }

    // Analyze labels
    const labels = issue.labels.map((l) =>
      typeof l === 'string' ? l : l.name || ''
    );

    for (const label of labels) {
      if (label.includes('state:')) {
        const state = label.split(':')[1];
        data.issues.byState[state] = (data.issues.byState[state] || 0) + 1;
      }
      if (label.includes('priority:')) {
        const priority = label.split(':')[1];
        data.issues.byPriority[priority] = (data.issues.byPriority[priority] || 0) + 1;
      }
      if (label.includes('type:')) {
        const type = label.split(':')[1];
        data.issues.byType[type] = (data.issues.byType[type] || 0) + 1;
      }
      if (label.includes('agent:')) {
        const agent = label.split(':')[1];
        agentCounts[agent] = (agentCounts[agent] || 0) + 1;
      }
    }

    // Add to recent activity
    if (data.recentActivity.length < 10) {
      data.recentActivity.push({
        type: 'issue',
        title: issue.title,
        number: issue.number,
        timestamp: issue.updated_at,
      });
    }
  }

  // Get PRs
  const prs = await octokit.pulls.list({
    owner,
    repo,
    state: 'all',
    per_page: 100,
  });

  for (const pr of prs.data) {
    data.pullRequests.total++;
    if (pr.state === 'open') {
      data.pullRequests.open++;
    } else if (pr.merged_at) {
      data.pullRequests.merged++;
    } else {
      data.pullRequests.closed++;
    }

    // Add to recent activity
    if (data.recentActivity.length < 10) {
      data.recentActivity.push({
        type: 'pr',
        title: pr.title,
        number: pr.number,
        timestamp: pr.updated_at,
      });
    }
  }

  // Build agent stats
  data.agents = Object.entries(agentCounts).map(([name, count]) => ({
    name,
    assignedIssues: count,
  }));

  // Sort recent activity by timestamp
  data.recentActivity.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return data;
}

async function main() {
  console.log('📊 Generating dashboard data...');

  try {
    const data = await generateDashboardData();

    // Write to file
    const outputPath = path.join(process.cwd(), 'dashboard-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`✅ Dashboard data written to: ${outputPath}`);
    console.log('\nSummary:');
    console.log(`  Issues: ${data.issues.open} open / ${data.issues.closed} closed`);
    console.log(`  PRs: ${data.pullRequests.open} open / ${data.pullRequests.merged} merged`);
    console.log(`  Agents: ${data.agents.length} active`);
  } catch (error) {
    console.error('❌ Error generating dashboard data:', error);
    process.exit(1);
  }
}

main();
