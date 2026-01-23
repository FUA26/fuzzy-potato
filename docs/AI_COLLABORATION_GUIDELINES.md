# AI Collaboration Guidelines

## Objective

Define how AI agents and Human developers should collaborate, emphasizing code readability, context maintenance, and documentation standards.

## 1. Code Generation Principles

- **Readability Over Cleverness**: Code should be boring. Avoid complex one-liners where a named function would be clearer.
- **Type Safety**: strict TypeScript usage. No `any`. Explicit return types for exported functions.
- **Comments as Context**:
  - **Why > What**: Comments should explain _why_ a decision was made, not just describe the syntax.
  - **Docstrings**: All exported components/functions must have TSDoc comments explaining props/params.

## 2. Context Maintenance

- **Update Documentation**: When code implementation changes significantly, the corresponding `docs/PHASE_*.md` file must be updated to reflect reality.
- **Task Tracking**: Mark progress in `task.md` meticulously.
- **Architectural Decision Records (ADR)**: For major changes, create a new record in `docs/ADR/` (optional, but recommended for large pivots).

## 3. Communication Style

- **Commit Messages**: Follow Conventional Commits.
  - `feat(auth): add login form`
  - `fix(db): correct schema relation`
- **Pull Requests / Implementation Plans**:
  - Summary of changes.
  - Risk assessment (Breaking changes?).
  - Verification steps.

## 4. Specific Patterns for AI

- **File Structure**:
  - Keep related files close (Co-location).
  - Use Barrel files (`index.ts`) sparingly (only for clean library exports).
- **Naming Conventions**:
  - `PascalCase` for Components/Classes.
  - `camelCase` for variables/functions.
  - `kebab-case` for filenames.
- **Error Handling**:
  - Always handle errors at boundaries.
  - Use `try/catch` in Server Actions.
  - Display user-friendly errors in UI (Toast/Alert).
