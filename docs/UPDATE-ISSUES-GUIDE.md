# Updating GitHub Issues

If your GitHub issues are missing content, labels, or other metadata, use this guide to update them.

## Quick Fix

Run the update script to add complete information to all existing issues:

```powershell
node scripts\update-github-issues.js
```

This will:
- ✅ Update issue bodies with full descriptions
- ✅ Add all labels (P0/P1/P2, epic, phase, etc.)
- ✅ Set milestones correctly
- ✅ Preserve issue numbers and existing comments

## What Gets Updated

For each issue, the script updates:

1. **Body Content:**
   - Feature description
   - User stories
   - Acceptance criteria
   - Related issues
   - Dependencies
   - Documentation links

2. **Labels:**
   - Priority: `P0`, `P1`, `P2`
   - Type: `epic`, `enhancement`
   - Phase: `phase-1`, `phase-2`, `phase-3`, `phase-4`
   - Component: `frontend`, `backend`, `database`, `security`
   - Other: `good first issue`, `saas-only`

3. **Milestones:**
   - Phase 1 - MVP
   - Phase 2 - Multi-Tenant
   - Phase 3 - SaaS Launch
   - Phase 4 - Enterprise

## Manual Update (Single Issue)

If you want to update just one issue:

### Update Body

```powershell
# Create a temp file with the new content
echo "Your markdown content here" | Out-File -Encoding UTF8 issue-body.md

# Update the issue
gh issue edit 1 --repo EAasen/signalsync-core --body-file issue-body.md
```

### Add Labels

```powershell
gh issue edit 1 --repo EAasen/signalsync-core --add-label "P0,epic,phase-1"
```

### Set Milestone

```powershell
gh issue edit 1 --repo EAasen/signalsync-core --milestone "Phase 1 - MVP"
```

## Verify Updates

After running the update script, verify the changes:

```powershell
# View a specific issue
gh issue view 1 --repo EAasen/signalsync-core

# List all issues with labels
gh issue list --repo EAasen/signalsync-core --limit 20
```

Or visit: https://github.com/EAasen/signalsync-core/issues

## Troubleshooting

### "Issue not found"

The issue number doesn't exist yet. Use `create-github-issues.js` instead.

### "Authentication required"

Run: `gh auth login`

### "Labels not found"

Create labels first using the commands in [CREATE-ISSUES.md](../.github/CREATE-ISSUES.md#create-labels).

### "Milestone not found"

Create milestones first using the commands in [CREATE-ISSUES.md](../.github/CREATE-ISSUES.md#create-milestones-first).

### Script fails on specific issue

Check if the issue already has comments or PRs linked. The script preserves existing data and only updates the fields specified.

## Re-creating Issues (Nuclear Option)

If issues are badly corrupted, you can delete and recreate them:

```powershell
# Delete an issue (WARNING: This is permanent!)
gh issue delete 1 --repo EAasen/signalsync-core --yes

# Then recreate
node scripts\create-github-issues.js
```

**Note:** This loses all comments, reactions, and PR links!

## Next Steps

After updating issues:

1. Verify all issues have complete information
2. Set up GitHub Projects board
3. Assign issues to team members
4. Start development!
