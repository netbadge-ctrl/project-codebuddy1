-- Drop existing types and tables to ensure a clean slate
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS okr_sets;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS project_status;
DROP TYPE IF EXISTS project_priority;

-- Create ENUM types
CREATE TYPE project_status AS ENUM (
  '未开始',
  '需求讨论',
  '需求完成',
  '待开发',
  '开发中',
  '待测试',
  '测试中',
  '测试完成待上线',
  '已上线'
);

CREATE TYPE project_priority AS ENUM (
  '部门OKR相关',
  '个人OKR相关',
  '临时重要需求',
  '日常需求'
);

-- Create tables
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatarUrl TEXT NOT NULL
);

CREATE TABLE okr_sets (
  periodId TEXT PRIMARY KEY,
  periodName TEXT NOT NULL,
  okrs JSONB NOT NULL
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  priority project_priority NOT NULL,
  businessProblem TEXT,
  keyResultIds TEXT[] DEFAULT '{}',
  weeklyUpdate TEXT,
  lastWeekUpdate TEXT,
  status project_status NOT NULL,
  productManagers JSONB DEFAULT '[]'::jsonb,
  backendDevelopers JSONB DEFAULT '[]'::jsonb,
  frontendDevelopers JSONB DEFAULT '[]'::jsonb,
  qaTesters JSONB DEFAULT '[]'::jsonb,
  proposalDate DATE,
  launchDate DATE,
  followers TEXT[] DEFAULT '{}',
  comments JSONB DEFAULT '[]'::jsonb,
  changeLog JSONB DEFAULT '[]'::jsonb
);