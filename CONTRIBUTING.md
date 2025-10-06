# Contributing to Authenticai AI Prevention Coach

Thank you for your interest in contributing to the Authenticai AI Prevention Coach! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Docker (optional)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/authenticai-software-coach.git
   cd authenticai-software-coach
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your development API keys
   ```

3. **Install Dependencies**
   ```bash
   npm run setup
   ```

4. **Start Development Servers**
   ```bash
   npm run dev
   ```

## 📋 Development Workflow

### Branch Naming

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add JWT token refresh functionality
fix(predictions): resolve ML model memory leak
docs(api): update endpoint documentation
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Coverage Reports

```bash
npm run test
```

## 📝 Code Style

### Python (Backend)

- Follow PEP 8
- Use type hints
- Maximum line length: 88 characters
- Use Black for formatting
- Use flake8 for linting

```bash
cd backend
black .
flake8 .
```

### TypeScript/React (Frontend)

- Use TypeScript strict mode
- Follow React best practices
- Use Prettier for formatting
- Use ESLint for linting

```bash
cd frontend
npm run lint
npm run format
```

## 🏗️ Architecture Guidelines

### Backend Structure

```
backend/
├── main.py              # FastAPI app entry point
├── database.py          # Database configuration
├── models/
│   └── schemas.py       # Pydantic models
├── routers/             # API route handlers
├── services/            # Business logic
├── utils/               # Utility functions
└── tests/               # Test files
```

### Frontend Structure

```
frontend/src/
├── components/          # Reusable UI components
├── contexts/           # React contexts
├── pages/              # Page components
├── services/           # API services
├── tests/              # Test files
└── types/              # TypeScript types
```

### API Design

- Use RESTful conventions
- Include proper HTTP status codes
- Implement pagination for list endpoints
- Use consistent error response format
- Include comprehensive OpenAPI documentation

### Database Design

- Use meaningful table and column names
- Implement proper foreign key relationships
- Add appropriate indexes
- Use Row Level Security (RLS) in Supabase

## 🔒 Security Guidelines

### Authentication

- Never store passwords in plain text
- Use JWT tokens with appropriate expiration
- Implement proper token refresh mechanism
- Validate all user inputs

### API Security

- Implement rate limiting
- Use HTTPS in production
- Validate request payloads
- Sanitize database queries

### Environment Variables

- Never commit secrets to version control
- Use different keys for development/production
- Rotate API keys regularly
- Use secure key generation

## 📊 Performance Guidelines

### Backend Performance

- Use async/await for I/O operations
- Implement proper caching strategies
- Optimize database queries
- Monitor API response times

### Frontend Performance

- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size
- Implement proper loading states

## 🐛 Bug Reports

When reporting bugs, include:

1. **Environment Details**
   - OS and version
   - Python/Node.js versions
   - Browser (for frontend issues)

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Screenshots/logs if applicable

3. **Additional Context**
   - Error messages
   - Console logs
   - Network requests (if relevant)

## 💡 Feature Requests

When requesting features:

1. **Use Case Description**
   - Who would use this feature?
   - What problem does it solve?
   - How would it work?

2. **Implementation Ideas**
   - Suggested approach
   - Potential challenges
   - Alternative solutions

## 📚 Documentation

### Code Documentation

- Add docstrings to all functions/classes
- Include type hints
- Document complex algorithms
- Update README when adding features

### API Documentation

- Use OpenAPI/Swagger annotations
- Include request/response examples
- Document error cases
- Keep documentation up to date

## 🔄 Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Update documentation
   - Follow code style guidelines
   - Test locally with different scenarios

2. **PR Description**
   - Clear title and description
   - Link related issues
   - Include screenshots for UI changes
   - List breaking changes

3. **Review Process**
   - Address reviewer feedback
   - Keep PR scope focused
   - Rebase if needed
   - Squash commits before merge

## 🎯 Areas for Contribution

### High Priority

- [ ] Additional ML model improvements
- [ ] Voice assistant enhancements
- [ ] Mobile app development
- [ ] Performance optimizations

### Medium Priority

- [ ] Additional data source integrations
- [ ] UI/UX improvements
- [ ] Documentation enhancements
- [ ] Test coverage improvements

### Low Priority

- [ ] Code refactoring
- [ ] Developer tooling
- [ ] Monitoring and analytics
- [ ] Internationalization

## 📞 Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Email**: For security issues or private matters

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (Commercial License).

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for helping make Authenticai better! 🚀
