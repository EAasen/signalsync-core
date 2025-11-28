#!/usr/bin/env node

/**
 * Retry failed issues
 */

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

const REPO_OWNER = 'EAasen';
const REPO_NAME = 'signalsync-core';

// Only the failed issues
const FAILED_ISSUES = [
  {
    number: 36,
    title: 'Powered by Removal',
    labels: ['enhancement', 'P1', 'phase-3', 'saas-only'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Remove "Powered by SignalSync" branding from status pages for premium customers.`
  },
  {
    number: 51,
    title: 'Documentation Site (Docusaurus)',
    labels: ['enhancement', 'P1', 'phase-2', 'docs'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Build comprehensive documentation site using Docusaurus.

### Content
- Getting started guide
- API documentation
- Self-hosting instructions
- Integration guides`
  },
  {
    number: 52,
    title: 'Video Tutorials',
    labels: ['enhancement', 'P2', 'phase-3', 'docs'],
    milestone: 'Phase 3 - SaaS Launch',
    body: `### Feature Description
Create video tutorials for common tasks and workflows.`
  },
  {
    number: 62,
    title: 'Multi-Region Worker Deployment',
    labels: ['enhancement', 'P2', 'phase-4', 'infrastructure'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Deploy worker instances in multiple AWS/GCP regions (US East, US West, EU, Asia).`
  },
  {
    number: 66,
    title: 'Load Balancing & Failover',
    labels: ['enhancement', 'P2', 'phase-4', 'infrastructure'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Distribute check workload across healthy nodes with automatic failover.`
  },
  {
    number: 68,
    title: 'ConnectWise PSA Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Automatically create tickets in ConnectWise when monitors go down.`
  },
  {
    number: 69,
    title: 'Syncro RMM Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Integrate with Syncro for ticket creation and client linking.`
  },
  {
    number: 70,
    title: 'Datto RMM Integration',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Integrate with Datto Autotask for ticket management.`
  },
  {
    number: 71,
    title: 'Zapier/Make Automation',
    labels: ['enhancement', 'P2', 'phase-4', 'integration'],
    milestone: 'Phase 4 - Enterprise',
    body: `### Feature Description
Create Zapier and Make.com integrations for no-code automation workflows.`
  },
  {
    number: 72,
    title: 'Public REST API Documentation',
    labels: ['enhancement', 'P1', 'phase-2', 'docs'],
    milestone: 'Phase 2 - Multi-Tenant',
    body: `### Feature Description
Document public REST API with OpenAPI/Swagger specification.

### API Coverage
- Organizations and projects
- Monitors (CRUD)
- Check results (read)
- Incidents (CRUD)
- Status page data`
  }
];

async function execAsync(command) {
  try {
    const { stdout, stderr } = await exec(command);
    return { stdout: stdout.trim(), stderr: stderr.trim(), success: true };
  } catch (error) {
    return { stdout: '', stderr: error.message, success: false, error };
  }
}

async function createIssue(issue) {
  const labels = issue.labels.join(',');
  
  const tempFile = path.join(__dirname, `retry-issue-${issue.number}-temp.md`);
  fs.writeFileSync(tempFile, issue.body, 'utf8');
  
  try {
    const command = `gh issue create --repo ${REPO_OWNER}/${REPO_NAME} --title "${issue.title}" --body-file "${tempFile}" --label "${labels}" --milestone "${issue.milestone}"`;
    
    const result = await execAsync(command);
    
    if (result.success) {
      console.log(`  ✅ Created #${issue.number}: ${issue.title}`);
    } else {
      console.log(`  ❌ Failed #${issue.number}: ${result.stderr}`);
    }
    
    return result.success;
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function main() {
  console.log('Retrying failed issues...\n');
  
  for (const issue of FAILED_ISSUES) {
    await createIssue(issue);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n✅ Retry complete!');
  console.log(`View issues at: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
}

main().catch(console.error);
