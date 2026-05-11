# Contributing to Fa3liat

We're excited that you're interested in contributing to **Fa3liat**! This project aims to provide a world-class ticketing experience, and your help makes that possible.

## 🚀 Getting Started

1.  **Fork the Repository**: Create your own copy of the project on GitHub.
2.  **Clone the Repo**:
    ```bash
    git clone https://github.com/your-username/graduation_project.git
    cd fa3liat
    ```
3.  **Setup the Environment**: Follow the [README.md](../README.md) instructions to configure your `.env` and Docker environment.

## 🛠 Development Workflow

### 1. Branching
Always create a new branch for your work:
```bash
git checkout -b feature/amazing-feature
# OR
git checkout -b fix/annoying-bug
```

### 2. Coding Standards
*   **Consistency**: Adhere to the existing code style (Prettier configuration included).
*   **ES Modules**: We use `import/export` syntax exclusively.
*   **JSend**: All API responses must follow the JSend pattern:
    ```json
    {
      "status": "success",
      "data": { ... }
    }
    ```
*   **Error Handling**: Throw `AppError` subclasses from the `src/errors` directory.

### 3. Testing
*   Write unit tests in the `/tests` folder using **Jest**.
*   Run the test suite before submitting:
    ```bash
    npm test
    ```

### 4. Committing
Keep your commits surgical and descriptive. We prefer the [Conventional Commits](https://www.conventionalcommits.org/) format:
*   `feat:` New features
*   `fix:` Bug fixes
*   `docs:` Documentation changes
*   `refactor:` Code refactoring without behavioral changes

## 📮 Submitting Changes

1.  Push your branch to your fork.
2.  Open a **Pull Request (PR)** against our `main` branch.
3.  Provide a clear summary of your changes and reference any related issues.
4.  Our team will review your PR as soon as possible!

---

Thank you for being part of the Fa3liat community!
