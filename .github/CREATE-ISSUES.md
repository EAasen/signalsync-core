# Creating GitHub Issues for SignalSync

This guide explains how to bulk-create all SignalSync issues as actual GitHub issues in the repository.

---

## Why GitHub Issues?

Creating issues in GitHub's issue tracker (instead of just documentation) provides:

- ✅ **Kanban Boards** - Visual project management
- ✅ **Pull Request Linking** - Automatic "Closes #X" functionality
- ✅ **Status Tracking** - Open, In Progress, Closed
- ✅ **Assignees & Labels** - Team coordination
- ✅ **Milestones** - Track progress toward releases
- ✅ **Comments & Discussion** - Centralized conversation

---

## Prerequisites

### 1. Install GitHub CLI

**Windows (PowerShell):**
```powershell
winget install --id GitHub.cli
```

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora
sudo dnf install gh
```

Or download from: https://cli.github.com/

### 2. Authenticate with GitHub

```bash
gh auth login
```

Follow the prompts to authenticate with your GitHub account.

### 3. Verify Authentication

```bash
gh auth status
```

---

## Option 1: Automated Bulk Creation (Recommended)

### Using the Node.js Script

The `scripts/create-github-issues.js` script creates the first 16 issues (Epic 1 and Epic 2).

**Run the script:**

```bash
# From repository root
node scripts/create-github-issues.js
```

The script will:
1. Check if GitHub CLI is installed and authenticated
2. Show you how many issues will be created
3. Ask for confirmation
4. Create all issues with proper labels and milestones

**Note:** The script currently includes issues #1-16. You can extend it by adding more issue definitions to the `ISSUES` array.

---

## Option 2: Manual Creation

### Create Milestones First

```bash
gh milestone create "Phase 1 - MVP" --repo EAasen/signalsync-core --description "Community Edition MVP - March 2026"
gh milestone create "Phase 2 - Multi-Tenant" --repo EAasen/signalsync-core --description "Multi-Tenant Foundation - May 2026"
gh milestone create "Phase 3 - SaaS Launch" --repo EAasen/signalsync-core --description "SaaS Launch - August 2026"
gh milestone create "Phase 4 - Enterprise" --repo EAasen/signalsync-core --description "Enterprise Features - November 2026"
```

### Create Labels

```bash
# Priority labels
gh label create "P0" --color "d73a4a" --description "Critical - Blocker" --repo EAasen/signalsync-core
gh label create "P1" --color "ff6b6b" --description "High Priority" --repo EAasen/signalsync-core
gh label create "P2" --color "ffa94d" --description "Medium Priority" --repo EAasen/signalsync-core

# Type labels
gh label create "epic" --color "0e8a16" --description "Epic Issue" --repo EAasen/signalsync-core
gh label create "enhancement" --color "a2eeef" --description "New feature or request" --repo EAasen/signalsync-core

# Phase labels
gh label create "phase-1" --color "d4c5f9" --description "Phase 1 - MVP" --repo EAasen/signalsync-core
gh label create "phase-2" --color "c2e0c6" --description "Phase 2 - Multi-Tenant" --repo EAasen/signalsync-core
gh label create "phase-3" --color "fef2c0" --description "Phase 3 - SaaS Launch" --repo EAasen/signalsync-core
gh label create "phase-4" --color "ffc09f" --description "Phase 4 - Enterprise" --repo EAasen/signalsync-core

# Component labels
gh label create "frontend" --color "5319e7" --description "Frontend/UI work" --repo EAasen/signalsync-core
gh label create "backend" --color "0052cc" --description "Backend/API work" --repo EAasen/signalsync-core
gh label create "database" --color "006b75" --description "Database schema/queries" --repo EAasen/signalsync-core
gh label create "security" --color "d93f0b" --description "Security-related" --repo EAasen/signalsync-core

# Other labels
gh label create "good first issue" --color "7057ff" --description "Good for newcomers" --repo EAasen/signalsync-core
gh label create "saas-only" --color "e99695" --description "SaaS edition only" --repo EAasen/signalsync-core
```

### Create Individual Issues

Use the detailed issue templates from the epic documentation files:

```bash
gh issue create \
  --repo EAasen/signalsync-core \
  --title "[EPIC] Monitoring Engine (Core)" \
  --body "$(cat .github/issues/EPIC-1-MONITORING-ENGINE.md | sed -n '/^## Epic Issue/,/^---/p')" \
  --label "epic,P0,phase-1" \
  --milestone "Phase 1 - MVP"
```

---

## Option 3: GitHub Web Interface

1. Go to https://github.com/EAasen/signalsync-core/issues/new
2. Copy the issue title and body from the epic documentation
3. Add appropriate labels
4. Assign to milestone
5. Click "Submit new issue"

Repeat for each issue.

---

## Setting Up GitHub Projects (Kanban Board)

### Create a Project Board

1. Go to https://github.com/EAasen/signalsync-core/projects
2. Click "New project"
3. Choose "Board" template
4. Name it "SignalSync Development"

### Add Custom Fields

- **Epic** - Select (Epic 1, Epic 2, etc.)
- **Phase** - Select (Phase 1, Phase 2, etc.)
- **Priority** - Select (P0, P1, P2)
- **Status** - Select (Backlog, Todo, In Progress, In Review, Done)

### Add All Issues to the Board

```bash
# List all issues
gh issue list --repo EAasen/signalsync-core --limit 100

# Add issues to project (requires GitHub CLI extension)
gh project item-add <PROJECT_NUMBER> --owner EAasen --url https://github.com/EAasen/signalsync-core/issues/<ISSUE_NUMBER>
```

Or use the web interface to bulk-add issues to the project.

---

## Viewing and Managing Issues

### View All Issues

```bash
gh issue list --repo EAasen/signalsync-core
```

### View Issues by Milestone

```bash
gh issue list --repo EAasen/signalsync-core --milestone "Phase 1 - MVP"
```

### View Issues by Label

```bash
gh issue list --repo EAasen/signalsync-core --label "P0"
```

### Close an Issue

```bash
gh issue close <ISSUE_NUMBER> --repo EAasen/signalsync-core
```

### Link a Pull Request to an Issue

In your PR description, include:

```markdown
Closes #42
```

This will automatically close issue #42 when the PR is merged.

---

## Extending the Script

To add more issues to `scripts/create-github-issues.js`, add them to the `ISSUES` array:

```javascript
{
  epic: 3,
  number: 17,
  title: '[EPIC] Status Page Presentation',
  labels: ['epic', 'P0', 'phase-1'],
  milestone: 'Phase 1 - MVP',
  body: `### Epic Overview
  
  [Your epic description here...]`
}
```

Then run the script again. It will create any new issues.

---

## Best Practices

### Issue Titles

- **Epic:** `[EPIC] Short Description`
- **Feature:** `Short, Actionable Description`
- **Bug:** `Bug: What's broken`

### Issue Body Template

```markdown
### Feature Description

Brief description of what this feature does.

### User Story

As a [role]
I want to [action]
So that [benefit]

### Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### Related Issues

- Depends on #X
- Relates to #Y
- Part of #Z (Epic)

### Documentation

See [EPIC-X.md](link) for detailed implementation guide.
```

### Labels Strategy

- **Priority:** Every issue should have P0, P1, or P2
- **Phase:** Assign to appropriate phase (phase-1, phase-2, etc.)
- **Type:** epic, enhancement, bug, documentation
- **Component:** frontend, backend, database, etc.

### Milestones

- Group issues by release/phase
- Track progress toward major milestones
- Update milestone dates as needed

---

## Updating Existing Issues

If you've already created issues but they're missing content or labels:

```powershell
node scripts\update-github-issues.js
```

This will update all existing issues with:
- Complete body content (descriptions, acceptance criteria, dependencies)
- All labels (priority, phase, component)
- Correct milestones

See [UPDATE-ISSUES-GUIDE.md](../docs/UPDATE-ISSUES-GUIDE.md) for detailed instructions.

## Troubleshooting

### "gh: command not found"

GitHub CLI is not installed. See Prerequisites section.

### "Must have push access"

You need write access to the repository to create issues.

### "Milestone not found"

Create milestones first (see "Create Milestones First" section).

### "Label does not exist"

Create labels first (see "Create Labels" section).

### Script fails with authentication error

Run `gh auth login` and reauthenticate.

### Issues created but missing content

Run the update script: `node scripts\update-github-issues.js`

---

## Additional Resources

- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Issues Documentation](https://docs.github.com/en/issues)
- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Linking PRs to Issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)

---

## Next Steps

After creating issues:

1. **Set up GitHub Projects** - Create a kanban board for visual tracking
2. **Assign Issues** - Assign team members to specific issues
3. **Start Development** - Pick an issue and create a branch
4. **Link PRs** - Use "Closes #X" in PR descriptions
5. **Track Progress** - Review completed issues in milestones

---

**Questions?**

- GitHub Discussions: https://github.com/EAasen/signalsync-core/discussions
- Discord: [Join our Discord](#)
- Email: dev@signalsync.io
