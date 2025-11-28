#!/usr/bin/env node

/**
 * Script to update existing GitHub issues with complete information
 * 
 * This script updates issues that were created but are missing body content,
 * labels, or other metadata.
 * 
 * Prerequisites:
 * 1. Install GitHub CLI: https://cli.github.com/
 * 2. Authenticate: gh auth login
 * 
 * Usage:
 *   node scripts/update-github-issues.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Repository configuration
const REPO_OWNER = 'EAasen';
const REPO_NAME = 'signalsync-core';

// Import the ISSUES array from create script
const { ISSUES } = require('./create-github-issues.js');

// Function to update a single issue
function updateIssue(issue) {
  const labels = issue.labels.join(',');
  
  // Write body to temporary file
  const tempFile = path.join(__dirname, `issue-${issue.number}-update.md`);
  fs.writeFileSync(tempFile, issue.body, 'utf8');
  
  try {
    console.log(`Updating issue #${issue.number}: ${issue.title}`);
    
    // Update the issue body
    const editCommand = `gh issue edit ${issue.number} --repo ${REPO_OWNER}/${REPO_NAME} --body-file "${tempFile}"`;
    execSync(editCommand, { stdio: 'pipe' });
    
    // Update labels
    const labelCommand = `gh issue edit ${issue.number} --repo ${REPO_OWNER}/${REPO_NAME} --add-label "${labels}"`;
    execSync(labelCommand, { stdio: 'pipe' });
    
    // Update milestone
    const milestoneCommand = `gh issue edit ${issue.number} --repo ${REPO_OWNER}/${REPO_NAME} --milestone "${issue.milestone}"`;
    execSync(milestoneCommand, { stdio: 'pipe' });
    
    console.log(`✓ Updated issue #${issue.number}\n`);
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
  } catch (error) {
    console.error(`✗ Failed to update issue #${issue.number}: ${error.message}\n`);
    // Clean up temp file on error too
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Main execution
function main() {
  console.log('SignalSync GitHub Issues Updater');
  console.log('=================================\n');
  
  // Check if gh CLI is installed
  try {
    execSync('gh --version', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: GitHub CLI (gh) is not installed.');
    console.error('Install it from: https://cli.github.com/');
    process.exit(1);
  }
  
  // Check if authenticated
  try {
    execSync('gh auth status', { stdio: 'ignore' });
  } catch (error) {
    console.error('Error: Not authenticated with GitHub CLI.');
    console.error('Run: gh auth login');
    process.exit(1);
  }
  
  console.log(`Repository: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`Total issues to update: ${ISSUES.length}\n`);
  
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  readline.question('This will update existing issues. Continue? (y/n) ', (answer) => {
    readline.close();
    
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
    
    console.log('\nUpdating issues...\n');
    
    // Update issues
    ISSUES.forEach(issue => {
      updateIssue(issue);
    });
    
    console.log('\n=================================');
    console.log('Issue updates complete!');
    console.log(`View issues at: https://github.com/${REPO_OWNER}/${REPO_NAME}/issues`);
  });
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { updateIssue };
