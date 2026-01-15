---
name: database-query-helper
description: Help write, optimize, and debug SQL queries for various databases. Use when the user needs help with SQL queries, database schema design, query optimization, or understanding query results. Triggers include "SQL query", "write query", "optimize query", "database query", "PostgreSQL", "MySQL", "SQLite", "help with SQL", "query for".
---

# Database Query Helper

## Core Principles

1. **Correctness first**: Query returns right data
2. **Performance-aware**: Consider indexes and execution
3. **Readable**: Format for maintainability
4. **Safe**: Prevent injection, handle nulls

## Query Patterns

### Basic SELECT

```sql
-- Simple
SELECT column1, column2
FROM table_name
WHERE condition;

-- With aliases
SELECT 
    u.name AS user_name,
    o.total AS order_total
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed';
```

### Filtering & Sorting

```sql
-- Multiple conditions
SELECT *
FROM products
WHERE category = 'electronics'
  AND price BETWEEN 100 AND 500
  AND name ILIKE '%phone%'
ORDER BY price DESC
LIMIT 20 OFFSET 40;

-- NULL handling
SELECT *
FROM users
WHERE deleted_at IS NULL
  AND (email IS NOT NULL OR phone IS NOT NULL);
```

### Aggregations

```sql
-- Basic grouping
SELECT 
    category,
    COUNT(*) AS product_count,
    AVG(price) AS avg_price,
    SUM(quantity) AS total_quantity
FROM products
GROUP BY category
HAVING COUNT(*) > 5
ORDER BY product_count DESC;

-- Window functions
SELECT 
    name,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
    salary - LAG(salary) OVER (ORDER BY hire_date) AS salary_vs_prev
FROM employees;
```

### Joins

```sql
-- Multiple joins
SELECT 
    o.id AS order_id,
    u.name AS customer,
    p.name AS product,
    oi.quantity
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.created_at > NOW() - INTERVAL '30 days';

-- Left join with null check
SELECT 
    u.name,
    COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name;
```

### Subqueries & CTEs

```sql
-- Subquery
SELECT *
FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- CTE (preferred for readability)
WITH monthly_sales AS (
    SELECT 
        DATE_TRUNC('month', created_at) AS month,
        SUM(total) AS revenue
    FROM orders
    WHERE status = 'completed'
    GROUP BY 1
)
SELECT 
    month,
    revenue,
    revenue - LAG(revenue) OVER (ORDER BY month) AS growth
FROM monthly_sales;
```

### Insert/Update/Delete

```sql
-- Insert with returning
INSERT INTO users (name, email)
VALUES ('John', 'john@example.com')
RETURNING id, created_at;

-- Update with join (PostgreSQL)
UPDATE products p
SET price = p.price * 1.1
FROM categories c
WHERE p.category_id = c.id
  AND c.name = 'electronics';

-- Soft delete
UPDATE users
SET deleted_at = NOW()
WHERE id = 123;

-- Upsert (PostgreSQL)
INSERT INTO stats (user_id, login_count)
VALUES (1, 1)
ON CONFLICT (user_id)
DO UPDATE SET login_count = stats.login_count + 1;
```

## Optimization Tips

### Index Usage

```sql
-- Check if index is used
EXPLAIN ANALYZE
SELECT * FROM users WHERE email = 'test@example.com';

-- Create index for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
```

### Common Anti-Patterns

```sql
-- ❌ SELECT * in production
SELECT * FROM large_table;

-- ✅ Select only needed columns
SELECT id, name, email FROM large_table;

-- ❌ Function on indexed column
WHERE YEAR(created_at) = 2024

-- ✅ Range query (uses index)
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01'

-- ❌ LIKE with leading wildcard
WHERE name LIKE '%smith'

-- ✅ LIKE with trailing wildcard (can use index)
WHERE name LIKE 'smith%'
```

### N+1 Query Prevention

```sql
-- ❌ N+1 (one query per user)
-- SELECT * FROM orders WHERE user_id = ?

-- ✅ Batch load
SELECT * FROM orders WHERE user_id IN (1, 2, 3, 4, 5);

-- ✅ Or join in single query
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id IN (1, 2, 3, 4, 5);
```

## Output Format

```markdown
## Query Solution

### Query
```sql
[formatted SQL query]
```

### Explanation
[What the query does, step by step]

### Index Recommendations
- [Suggested indexes if applicable]

### Notes
- [Performance considerations]
- [Edge cases to handle]
```

## Quality Checks

- [ ] Query is properly formatted
- [ ] JOINs use explicit syntax (not implicit)
- [ ] NULL handling considered
- [ ] Index usage noted
- [ ] No SQL injection risk
- [ ] LIMIT used for large results
