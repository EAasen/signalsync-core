# Contributing to SignalSync

Thank you for considering contributing to SignalSync! This document outlines the process and guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [License](#license)

---

## Code of Conduct

This project adheres to a standard code of conduct. By participating, you are expected to uphold this code:

- **Be respectful:** Treat everyone with respect and courtesy
- **Be constructive:** Provide helpful feedback and suggestions
- **Be collaborative:** Work together toward the common goal
- **Be patient:** Remember that contributors have varying experience levels

Unacceptable behavior will not be tolerated.

---

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
1. **Check existing issues** to avoid duplicates
2. **Verify the bug** exists in the latest version
3. **Collect information:** Version, environment, steps to reproduce

Submit bug reports using the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md).

### Suggesting Features

Feature suggestions are welcome! Before submitting:
1. **Check the roadmap** to see if it's already planned
2. **Search existing issues** to avoid duplicates
3. **Consider scope:** Does this fit SignalSync's mission?

Submit feature requests using the [Feature Request template](.github/ISSUE_TEMPLATE/feature.md).

### Contributing Code

We welcome pull requests for:
- Bug fixes
- Documentation improvements
- Features marked as "good first issue" or "help wanted"

**Before starting work on a major feature:**
- Open an issue to discuss the approach
- Wait for maintainer feedback to avoid wasted effort

---

## Development Setup

### Prerequisites

- **Node.js:** v18+ (v20 recommended)
- **Docker:** Latest stable version
- **pnpm:** v8+ (preferred package manager)
- **Supabase CLI:** For local database management

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/EAasen/signalsync-core.git
cd signalsync-core

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env

# Start local Supabase (database + auth)
supabase start

# Run migrations
pnpm db:migrate

# Start development servers
pnpm dev
```

### Repository Structure

```
signalsync-core/
├── apps/
│   ├── web/              # Next.js dashboard
│   ├── status-page/      # Public status pages
│   └── worker/           # Monitoring engine
├── packages/
│   ├── database/         # Prisma schema & migrations
│   ├── ui/               # Shared components
│   └── config/           # Shared configs
├── docs/                 # Documentation
└── docker/               # Docker configs
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

---

## Issue Guidelines

### Good Issue Practices

**DO:**
- Use descriptive titles (e.g., "HTTP monitor returns false positive for 301 redirects")
- Provide context and reproduction steps
- Include environment details
- Search for existing issues first

**DON'T:**
- Use vague titles (e.g., "It's broken")
- Submit duplicates
- Mix multiple unrelated issues in one report

### Labels

Issues are categorized with labels:

**Type:**
- `bug` - Something isn't working
- `enhancement` - New feature or improvement
- `documentation` - Documentation updates
- `epic` - High-level feature group

**Priority:**
- `P0` - Critical (blocking MVP/release)
- `P1` - High (important for launch)
- `P2` - Medium (nice to have)
- `P3` - Low (future consideration)

**Status:**
- `good first issue` - Suitable for newcomers
- `help wanted` - Maintainer seeks assistance
- `wontfix` - Not planned
- `duplicate` - Already reported

**Edition:**
- `community-edition` - Applies to self-hosted version
- `saas-only` - Applies only to paid cloud version

---

## Pull Request Process

### Before Submitting

1. **Fork the repository** and create a feature branch
2. **Follow coding standards** (see below)
3. **Write tests** for new functionality
4. **Update documentation** if needed
5. **Run linters** and tests locally

### Creating a Pull Request

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ... code code code ...

# Commit with conventional commits
git commit -m "feat: add SSL certificate expiry monitoring"

# Push to your fork
git push origin feature/your-feature-name

# Open a PR on GitHub
```

### PR Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
- `feat: add TCP port monitoring`
- `fix: resolve RLS policy for cross-org queries`
- `docs: update Docker deployment instructions`

### PR Description Template

```markdown
## Description
<!-- Brief summary of changes -->

## Related Issues
Closes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
<!-- How did you test this? -->

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
```

### Review Process

1. **Automated checks** must pass (linting, tests, build)
2. **Maintainer review** (usually within 48 hours)
3. **Address feedback** if requested
4. **Approval & merge** by maintainer

---

## Coding Standards

### TypeScript Guidelines

- **Use TypeScript strictly:** No `any` types without justification
- **Export types:** Share interfaces between packages
- **Document complex logic:** Add JSDoc comments

```typescript
/**
 * Executes an HTTP monitor check
 * @param monitor - The monitor configuration
 * @returns Promise resolving to check result
 */
async function executeHttpCheck(monitor: Monitor): Promise<CheckResult> {
  // Implementation
}
```

### React/Next.js Guidelines

- **Use server components** by default (Next.js 14 App Router)
- **Client components:** Only when needed for interactivity
- **Avoid prop drilling:** Use context or state management for deep trees
- **Accessibility:** All interactive elements must be keyboard navigable

### Database Guidelines

- **Write RLS policies first:** Security before functionality
- **Use migrations:** Never manually edit the database
- **Index strategically:** Add indexes for frequent queries
- **Naming convention:** `snake_case` for tables/columns

### Code Style

We use automated formatters:
- **Prettier:** Code formatting
- **ESLint:** Linting
- **Husky:** Pre-commit hooks

Run before committing:
```bash
pnpm format
pnpm lint
```

---

## License

By contributing to SignalSync, you agree that your contributions will be licensed under the [Business Source License 1.1](../LICENSE).

**Key points:**
- Your code will be visible and usable for non-production purposes
- After the Change Date, it converts to Apache 2.0
- You retain copyright of your contributions

For questions about licensing, open an issue or contact the maintainers.

---

## Questions?

- **Discord:** Join our [community server](https://discord.gg/signalsync) for real-time help
- **GitHub Discussions:** For longer-form questions
- **Email:** contribute@signalsync.io for private inquiries

Thank you for contributing to SignalSync! 🚦
