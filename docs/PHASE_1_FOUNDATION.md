# Phase 1: Foundation & Tooling

## objective

Establish a strict, automated quality control environment before writing feature code.

## Tech Stack

- **Framework**: Next.js 16 (Existing)
- **Language**: TypeScript
- **Package Manager**: pnpm (Implied by lockfile)

## Requirements

### 1. Code Quality (Linting & Formatting)

- **ESLint**:
  - Extend `next/core-web-vitals`.
  - Enforce strict rules (no unused vars, no any).
- **Prettier**:
  - Enforce consistent style (single quotes, no semi, etc - user preference or standard).
  - Integrate with ESLint to avoid conflicts.

### 2. Git Hooks (Automated Checks)

- **Husky**:
  - `pre-commit`: Run `lint-staged`.
  - `commit-msg`: Run `commitlint`.
- **Lint-staged**:
  - `*.{ts,tsx}`: Run `eslint --fix`, `prettier --write`.
  - `*.{json,md}`: Run `prettier --write`.
- **Commitlint**:
  - Follow Conventional Commits (`feat:`, `fix:`, etc.).

## Implementation Details

### Dependencies

```bash
pnpm add -D prettier eslint-config-prettier husky lint-staged @commitlint/cli @commitlint/config-conventional
```

### Configuration Files

**`.prettierrc`**

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

**`commitlint.config.js`**

```js
module.exports = { extends: ['@commitlint/config-conventional'] }
```

**`package.json` Updates**

```json
"scripts": {
  "prepare": "husky",
  "format": "prettier --write .",
  "check-types": "tsc --noEmit"
}
```
