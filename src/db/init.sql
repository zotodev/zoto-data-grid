WITH RECURSIVE cnt(x) AS (
  SELECT 1
  UNION ALL
  SELECT x + 1 FROM cnt WHERE x < 385
)
INSERT INTO tasks (
  id,
  title,
  description,
  status,
  label,
  priority,
  assignee,
  due_date,
  created_at,
  updated_at
)
SELECT
  'task_' || lower(hex(randomblob(10))), -- pseudo nanoid
  'Task ' || x,
  'Description for task ' || x,
  CASE (abs(random()) % 3)
    WHEN 0 THEN 'TODO'
    WHEN 1 THEN 'IN_PROGRESS'
    ELSE 'DONE'
  END,
  CASE (abs(random()) % 4)
    WHEN 0 THEN 'bug'
    WHEN 1 THEN 'feature'
    WHEN 2 THEN 'docs'
    ELSE 'refactor'
  END,
  CASE (abs(random()) % 3)
    WHEN 0 THEN 'low'
    WHEN 1 THEN 'medium'
    ELSE 'high'
  END,
  'user_' || (abs(random()) % 10),
  strftime('%s','now') + (abs(random()) % 1000000), -- future due date
  strftime('%s','now'),
  strftime('%s','now')
FROM cnt;