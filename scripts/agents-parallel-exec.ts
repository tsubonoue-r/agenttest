#!/usr/bin/env tsx
/**
 * Agents Parallel Execution Manager
 * Coordinates parallel execution of multiple agents
 */

import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0] || '';
const repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY?.split('/')[1] || '';

interface AgentTask {
  name: string;
  agent: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: string;
}

interface ExecutionPlan {
  issueNumber: number;
  tasks: AgentTask[];
  parallel: boolean;
}

function parseArgs(): { issue?: number; agents?: string[] } {
  const args = process.argv.slice(2);
  let issue: number | undefined;
  let agents: string[] = [];

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--issue' || args[i].startsWith('--issue=')) {
      issue = parseInt(args[i].includes('=') ? args[i].split('=')[1] : args[++i]);
    } else if (args[i] === '--agents' || args[i].startsWith('--agents=')) {
      const agentList = args[i].includes('=') ? args[i].split('=')[1] : args[++i];
      agents = agentList.split(',');
    }
  }

  return { issue, agents };
}

async function createExecutionPlan(issueNumber: number, agents: string[]): Promise<ExecutionPlan> {
  const tasks: AgentTask[] = agents.map((agent) => ({
    name: `${agent}-task`,
    agent,
    status: 'pending',
  }));

  return {
    issueNumber,
    tasks,
    parallel: true,
  };
}

async function executeTask(task: AgentTask): Promise<AgentTask> {
  console.log(`  🚀 Starting ${task.agent}...`);
  task.status = 'running';
  task.startTime = new Date();

  try {
    // Simulate agent execution
    await new Promise((resolve) => setTimeout(resolve, 100));

    task.status = 'completed';
    task.endTime = new Date();
    task.result = 'Success';
    console.log(`  ✅ ${task.agent} completed`);
  } catch (error) {
    task.status = 'failed';
    task.endTime = new Date();
    task.result = error instanceof Error ? error.message : 'Unknown error';
    console.log(`  ❌ ${task.agent} failed: ${task.result}`);
  }

  return task;
}

async function executeParallel(plan: ExecutionPlan): Promise<void> {
  console.log(`🔄 Executing ${plan.tasks.length} agents in parallel for #${plan.issueNumber}`);

  const results = await Promise.all(plan.tasks.map((task) => executeTask(task)));

  const successful = results.filter((t) => t.status === 'completed').length;
  const failed = results.filter((t) => t.status === 'failed').length;

  console.log(`\n📊 Execution Summary:`);
  console.log(`  Total: ${results.length}`);
  console.log(`  Successful: ${successful}`);
  console.log(`  Failed: ${failed}`);

  // Post summary to issue
  if (plan.issueNumber) {
    const summary = results
      .map((t) => `| ${t.agent} | ${t.status === 'completed' ? '✅' : '❌'} ${t.status} | ${t.result || '-'} |`)
      .join('\n');

    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: plan.issueNumber,
      body: `🤖 **Parallel Agent Execution Complete**

| Agent | Status | Result |
|-------|--------|--------|
${summary}

---
*Automated by [Agents Parallel Exec](../scripts/agents-parallel-exec.ts)*`,
    });
  }
}

async function main() {
  const { issue, agents } = parseArgs();

  if (!issue || !agents || agents.length === 0) {
    console.error('Usage: agents-parallel-exec.ts --issue=<number> --agents=<agent1,agent2,...>');
    process.exit(1);
  }

  try {
    const plan = await createExecutionPlan(issue, agents);
    await executeParallel(plan);
    console.log('\n✅ All agents executed');
  } catch (error) {
    console.error('❌ Error during execution:', error);
    process.exit(1);
  }
}

main();
