---
name: test-generator
description: Generate comprehensive test cases and test code for functions, APIs, and components. Use when the user needs unit tests, integration tests, test cases, or wants to improve test coverage. Triggers include "write tests", "generate tests", "test cases for", "unit test", "integration test", "test this function", "add tests".
---

# Test Generator

## Core Principles

1. **Behavior-focused**: Test what code does, not how
2. **Edge cases first**: Happy path + boundaries + errors
3. **Readable**: Tests are documentation
4. **Independent**: Tests don't depend on each other

## Test Case Categories

### For Every Function

1. **Happy path**: Normal expected input → expected output
2. **Edge cases**: Empty, null, boundaries, limits
3. **Error cases**: Invalid input, exceptions
4. **Type variations**: Different valid types (if applicable)

### Test Matrix Template

| Category | Input | Expected Output |
|----------|-------|-----------------|
| Happy path | [normal input] | [expected result] |
| Empty | [], "", null | [behavior] |
| Boundary - min | 0, -1 | [behavior] |
| Boundary - max | MAX_INT, limit | [behavior] |
| Invalid | wrong type, malformed | [error/exception] |
| Edge | special chars, unicode | [behavior] |

## Test Code Templates

### JavaScript (Jest)

```javascript
describe('[FunctionName]', () => {
  // Happy path
  it('should [expected behavior] when [condition]', () => {
    const result = functionName(validInput);
    expect(result).toBe(expectedOutput);
  });

  // Edge cases
  it('should handle empty input', () => {
    expect(functionName([])).toEqual([]);
  });

  it('should handle null gracefully', () => {
    expect(() => functionName(null)).toThrow('Input required');
  });

  // Boundary
  it('should handle maximum value', () => {
    const result = functionName(Number.MAX_SAFE_INTEGER);
    expect(result).toBeDefined();
  });
});
```

### Python (pytest)

```python
import pytest
from module import function_name

class TestFunctionName:
    # Happy path
    def test_returns_expected_for_valid_input(self):
        result = function_name(valid_input)
        assert result == expected_output

    # Edge cases
    def test_handles_empty_list(self):
        assert function_name([]) == []

    def test_raises_on_none(self):
        with pytest.raises(ValueError):
            function_name(None)

    # Parameterized
    @pytest.mark.parametrize("input,expected", [
        (1, 2),
        (2, 4),
        (0, 0),
    ])
    def test_various_inputs(self, input, expected):
        assert function_name(input) == expected
```

### React Component (Testing Library)

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders with default props', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    render(<Component loading={true} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message on failure', () => {
    render(<Component error="Failed to load" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Failed to load');
  });
});
```

### API Endpoint (Integration)

```javascript
describe('POST /api/users', () => {
  it('creates user with valid data', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'test@example.com' });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });

  it('returns 400 for missing required fields', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test' });
    
    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });

  it('returns 409 for duplicate email', async () => {
    await createUser({ email: 'existing@example.com' });
    
    const response = await request(app)
      .post('/api/users')
      .send({ name: 'Test', email: 'existing@example.com' });
    
    expect(response.status).toBe(409);
  });
});
```

## Test Naming Convention

```
[should/does] [expected behavior] [when/given condition]
```

**Examples:**
- `should return empty array when input is empty`
- `should throw error when user not found`
- `does not modify original array`
- `calls API once per request`

## Output Format

```markdown
## Test Cases for [Function/Component]

### Test Matrix
| # | Category | Input | Expected | Notes |
|---|----------|-------|----------|-------|
| 1 | Happy | ... | ... | ... |

### Test Code

```[language]
[test code]
```

### Coverage Notes
- [What's covered]
- [Edge cases to consider]
```

## Quality Checks

- [ ] Happy path covered
- [ ] Edge cases (empty, null, boundaries)
- [ ] Error cases with assertions
- [ ] Tests are independent
- [ ] Descriptive test names
- [ ] Assertions are specific
