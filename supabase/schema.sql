-- ============================================================
-- life-rhythm 数据库建表脚本
-- 在 Supabase SQL Editor 中执行
-- ============================================================

-- ------------------------------------------------------------
-- 1. categories（L1/L2/L3 层级定义）
-- ------------------------------------------------------------
CREATE TABLE categories (
  id         SERIAL PRIMARY KEY,
  code       TEXT NOT NULL UNIQUE,       -- 如 qt-share，用于代码引用
  name       TEXT NOT NULL,              -- 显示名称，如 Qt-分享
  level      TEXT NOT NULL CHECK (level IN ('L1', 'L2', 'L3')),
  parent_id  INTEGER REFERENCES categories(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 2. daily_plan（每日内容计划，由用户手动填入）
-- ------------------------------------------------------------
CREATE TABLE daily_plan (
  id           SERIAL PRIMARY KEY,
  date         DATE NOT NULL UNIQUE,
  qt           TEXT,   -- 当天灵修内容
  br_new       TEXT,   -- 新约阅读内容，如 马太福音 5:1-12
  br_old       TEXT,   -- 旧约阅读内容，如 创世记 1:1-31
  br_other     TEXT,   -- 其他圣经阅读
  pr           TEXT,   -- 祷告主题/内容
  sm           TEXT,   -- 当天背诵经文
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 3. daily_log（每日打卡，L2 和 L3 统一一张表）
-- ------------------------------------------------------------
CREATE TABLE daily_log (
  id           SERIAL PRIMARY KEY,
  date         DATE NOT NULL,
  category_id  INTEGER NOT NULL REFERENCES categories(id),
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (date, category_id)
);

-- ------------------------------------------------------------
-- 4. weekly_task_def（每周任务定义）
-- ------------------------------------------------------------
CREATE TABLE weekly_task_def (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 5. weekly_task_log（每周任务完成记录）
-- ------------------------------------------------------------
CREATE TABLE weekly_task_log (
  id           SERIAL PRIMARY KEY,
  task_id      INTEGER NOT NULL REFERENCES weekly_task_def(id),
  week_start   DATE NOT NULL,            -- 该周周一的日期
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, week_start)
);

-- ------------------------------------------------------------
-- 6. monthly_task_def（每月任务定义）
-- ------------------------------------------------------------
CREATE TABLE monthly_task_def (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 7. monthly_task_log（每月任务完成记录）
-- ------------------------------------------------------------
CREATE TABLE monthly_task_log (
  id           SERIAL PRIMARY KEY,
  task_id      INTEGER NOT NULL REFERENCES monthly_task_def(id),
  month        TEXT NOT NULL,            -- 格式 YYYY-MM，如 2026-04
  done         BOOLEAN NOT NULL DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (task_id, month)
);

-- ============================================================
-- 初始数据：categories
-- ============================================================

-- L1
INSERT INTO categories (code, name, level, parent_id, sort_order) VALUES
  ('basiclife', 'BasicLife', 'L1', NULL, 1),
  ('body',      'Body',      'L1', NULL, 2),
  ('brain',     'Brain',     'L1', NULL, 3);

-- L2 under BasicLife
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'qt', 'Qt',  'L2', id, 1 FROM categories WHERE code = 'basiclife';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'pr', 'Pr',  'L2', id, 2 FROM categories WHERE code = 'basiclife';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sm', 'SM',  'L2', id, 3 FROM categories WHERE code = 'basiclife';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'br', 'Br',  'L2', id, 4 FROM categories WHERE code = 'basiclife';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'bs', 'Bs',  'L2', id, 5 FROM categories WHERE code = 'basiclife';

-- L3 under Qt
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'qt-share', 'Qt-分享',    'L3', id, 1 FROM categories WHERE code = 'qt';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'qt-read',  'Qt-阅读他人', 'L3', id, 2 FROM categories WHERE code = 'qt';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'qt-apply', 'Qt-应用',    'L3', id, 3 FROM categories WHERE code = 'qt';

-- L3 under Pr
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'pr-scheduled', 'Pr-定时祷告',   'L3', id, 1 FROM categories WHERE code = 'pr';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'pr-morning',   'Pr-早起悔改感恩', 'L3', id, 2 FROM categories WHERE code = 'pr';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'pr-night',     'Pr-晚前悔改感恩', 'L3', id, 3 FROM categories WHERE code = 'pr';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'pr-acts',      'Pr-ACTS',       'L3', id, 4 FROM categories WHERE code = 'pr';

-- L3 under SM
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sm-write', 'SM-默写', 'L3', id, 1 FROM categories WHERE code = 'sm';

-- L3 under Br
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'br-new', 'Br-新约阅读', 'L3', id, 1 FROM categories WHERE code = 'br';

-- L3 under Bs
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'bs-read',  'Bs-查经阅读', 'L3', id, 1 FROM categories WHERE code = 'bs';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'bs-think', 'Bs-思考',    'L3', id, 2 FROM categories WHERE code = 'bs';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'bs-apply', 'Bs-应用',    'L3', id, 3 FROM categories WHERE code = 'bs';

-- L2 under Body
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sleep', 'Sleep', 'L2', id, 1 FROM categories WHERE code = 'body';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sport', 'Sport', 'L2', id, 2 FROM categories WHERE code = 'body';

-- L3 under Sleep
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sleep-b23',  '早睡23点前', 'L3', id, 1 FROM categories WHERE code = 'sleep';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'wake-630',   '早起6点半',  'L3', id, 2 FROM categories WHERE code = 'sleep';

-- L3 under Sport
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'sport-in', '室内运动', 'L3', id, 1 FROM categories WHERE code = 'sport';

-- L2 under Brain
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'improve', 'Improve', 'L2', id, 1 FROM categories WHERE code = 'brain';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'review',  'Review',  'L2', id, 2 FROM categories WHERE code = 'brain';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'other',   'Other',   'L2', id, 3 FROM categories WHERE code = 'brain';

-- L3 under Improve
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'rss', '阅读RSS', 'L3', id, 1 FROM categories WHERE code = 'improve';

-- L3 under Review
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'rev-today', '回顾今天', 'L3', id, 1 FROM categories WHERE code = 'review';
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'rev-past',  '回顾之前', 'L3', id, 2 FROM categories WHERE code = 'review';

-- L3 under Other
INSERT INTO categories (code, name, level, parent_id, sort_order)
SELECT 'bill', '记录账单', 'L3', id, 1 FROM categories WHERE code = 'other';

-- ============================================================
-- 初始数据：weekly_task_def
-- ============================================================
INSERT INTO weekly_task_def (name, sort_order) VALUES
  ('联系弟兄&家人&他人', 1),
  ('整理内务&卫生&形象', 2),
  ('室外运动/健身2次',   3),
  ('复盘本周生活',       4),
  ('规划下周生活',       5);

-- ============================================================
-- 初始数据：monthly_task_def
-- ============================================================
INSERT INTO monthly_task_def (name, sort_order) VALUES
  ('账务统计',   1),
  ('复盘本月生活', 2),
  ('规划下月生活', 3);
