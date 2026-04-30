# Contributing to FlowBoard

First off, thank you for considering contributing to FlowBoard. It's people like you that make FlowBoard such a great tool.

## 1. Development Workflow

We use a standard GitHub flow. To contribute:

1.  **Fork the repo** and create your branch from `main`.
2.  If you've added code that should be tested, add tests.
3.  If you've changed APIs, update the documentation.
4.  Ensure the test suite passes (`npm run test`).
5.  Make sure your code lints (`npm run lint` and `tsc --noEmit`).
6.  Issue that pull request!

## 2. Technical Standards

To maintain the architectural integrity of the application, please adhere to the following strict guidelines:

*   **Strict Typing:** `any` types are prohibited. All variables, parameters, and returns must be strictly typed.
*   **Component Structure:** We follow atomic design principles. Do not put domain logic inside UI components. Move domain logic to Custom Hooks or Zustand stores.
*   **API Interactions:** All outgoing HTTP requests must use the pre-configured Axios instances found in `lib/`.
*   **Database Migrations:** If your PR changes the Prisma schema (`schema.prisma`), you must include the generated migration file.

## 3. Pull Request Process

1.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
2.  Your PR must pass the CI pipeline (GitHub Actions) before it can be merged.
3.  You may merge the Pull Request in once you have the sign-off of at least one core maintainer.

## 4. Issue Reporting

If you are opening an issue, please ensure you:
*   Use the provided issue template.
*   Include system logs where applicable.
*   Provide a minimal reproducible example if reporting a bug.

Thank you for helping us build a better workspace!
