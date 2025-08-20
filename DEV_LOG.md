# 开发日志与版本控制系统

本文档用于记录项目开发过程中的关键对话、需求变更和技术决策，以确保上下文的连续性和可追溯性。

---

## 版本: 1.0 - 初始日志

**时间戳:** 2025-08-20 12:00

### 需求概述
用户提出需要一个系统来保存对话历史和实现版本控制，以便在多轮交流后仍能准确理解需求，并在出现问题时能快速回滚。

### 行动计划
采用基于文件和 Git 的轻量级方案：
1.  **上下文记录**: 使用此 `DEV_LOG.md` 文件记录所有关键交互。
2.  **版本控制**:
    *   每次有意义的更新后，执行 `git commit` 创建版本快照。
    *   使用 `git tag` 标记重要的里程碑版本。
    *   通过 `git diff` 和 `git log` 进行版本对比和追溯。
    *   通过 `git revert` 或 `git reset` 进行版本恢复。

---

## 历史回顾: 项目从后端到全栈的完整开发过程

### 阶段一: 后端服务构建 (Node.js + Express + PostgreSQL)
*   **目标**: 1:1 精确复刻前端 `api.ts` 文件中模拟的所有功能和业务逻辑。
*   **数据库**:
    *   在金山云 PostgreSQL 中创建了 `project_status` 和 `project_priority` ENUM 类型。
    *   设计并创建了 `users`, `okr_sets`, `projects` 表结构。
*   **API 实现**:
    *   实现了所有核心 API 端点 (`/api/users`, `/api/okr-sets`, `/api/projects`)。
    *   集成了业务逻辑，如“部门OKR相关”项目的 KR 校验和变更日志 (`changeLog`) 的自动生成。
*   **数据与任务**:
    *   编写并执行了 `seed_database.js` 脚本，用初始数据填充数据库。
    *   使用 `node-cron` 创建了每周自动结转“本周进展”的定时任务。

### 阶段二: 前端应用实现 (React + Vite + Tailwind CSS)
*   **目标**: 构建一个与设计稿 1:1 匹配的、功能完整的 React 前端。
*   **基础架构**:
    *   使用 Vite 初始化了 React + TypeScript 项目。
    *   配置了 Tailwind CSS。
    *   实现了基于 React Context 的全局状态管理，包括 `AuthContext` (用户认证) 和 `DataContext` (全局业务数据)。
*   **核心视图开发**:
    *   **登录视图 (`LoginScreen`)**: 完成用户选择和登录功能。
    *   **个人视图 (`PersonalView`)**: 展示用户参与和关注的项目、项目详情弹窗及动态。
    *   **项目总览 (`ProjectTableView`)**: 实现了功能强大的数据表格，支持行内编辑、多维度筛选、弹窗交互等。
    *   **OKR 视图 (`OkrView`)**: 实现了 OKR 周期的切换、内容的实时增删改查。
    *   **看板视图 (`KanbanView`)**: 实现了基于时间的资源排期看板，支持周/月视图切换。
    *   **周会视图 (`WeeklyMeetingView`)**: 实现了为周会设计的项目进展报告页面。
*   **导航**: 创建了 `Sidebar` 组件，并将所有视图集成到主应用 `App.tsx` 中，实现了单页应用内的视图切换。

### 阶段三: 调试与问题修复
*   **模块导入/导出不匹配**: 修复了 `App.tsx` 中因默认导出和命名导出混用导致的编译错误。
*   **上下文未导出**: 修复了 `DataContext.tsx` 中 `DataContext` 未导出的问题。
*   **PostCSS/Tailwind 配置过时**:
    *   安装了新的 `@tailwindcss/postcss` 依赖包。
    *   更新了 `postcss.config.js` 以使用新的配置，解决了 CSS 无法编译的问题。

### 当前状态
所有核心功能均已完成代码实现。在解决了若干编译问题后，应用已准备好进行最终的预览和测试。此日志文件的创建，标志着新的开发流程管理机制正式启动。

---

## 版本: 1.1 - 补充核心需求文档

**时间戳:** 2025-08-20 12:05

### 需求概述
用户提供了项目的完整需求文档，涵盖了从后端 API 到前端 UI/UX 的所有细节。此文档将作为项目开发的“唯一事实来源”。

### 行动计划
将用户提供的完整需求文档追加到此日志中，以供随时查阅。

### 详细需求文档

#### 首要目标
你的核心任务是创建一个功能完整的全栈项目管理应用。这个应用必须是所提供的前端代码的 1:1 精确复刻，包括前端UI/UX和后端的完整功能实现。最终交付的应用必须是一个无缝集成的、功能完备的中文项目管理仪表盘。

#### 技术栈要求
*   **前端**: 使用 React 和 Tailwind CSS (基于提供的代码)。
*   **后端**: 使用 Node.js 和 Express.js 框架。
*   **数据库**: 使用 PostgreSQL。

---

### 第一部分：后端实现需求 (Backend Implementation)

后端是整个应用的数据和逻辑核心。你需要严格按照以下规范来实现数据库和API。

**1. 数据库设置**
*   **连接配置**: 你必须连接到以下指定的金山云 PostgreSQL 数据库。在 Replit 中，请将此连接 URI 存储在 Secrets 中，并命名为 `DATABASE_URL`。严禁在代码中硬编码此URI。
    *   **URI**: `postgresql://admin:Kingsoft0531@120.92.44.85:51022/project_codebuddy`
*   **Schema 权限**: 你可以根据下文定义的 Schema，自由地在数据库中创建或修改表和类型。

**2. 数据库 Schema 设计**
根据前端 `types.ts` 文件中的定义，创建对应的表和枚举类型。

**2.1. 自定义枚举类型 (ENUMs)**
首先，创建以下 SQL ENUM 类型：
```sql
CREATE TYPE project_status AS ENUM (
  '未开始', '需求讨论', '需求完成', '待开发', '开发中', '待测试', '测试中', '测试完成待上线', '已上线'
);

CREATE TYPE project_priority AS ENUM (
  '部门OKR相关', '个人OKR相关', '临时重要需求', '日常需求'
);
```

**2.2. 表结构定义**
*   **users 表**
    *   `id` (TEXT, Primary Key) - 注意: 必须使用前端 `constants.ts` 中预设的静态ID (如 'u1', 'u2')，而不是UUID。
    *   `name` (TEXT, NOT NULL)
    *   `avatarUrl` (TEXT, NOT NULL)
*   **okr_sets 表**
    *   `periodId` (TEXT, Primary Key) - 唯一周期标识，例如 "2025-H2"。
    *   `periodName` (TEXT, NOT NULL) - 周期的显示名称，例如 "2025下半年"。
    *   `okrs` (JSONB, NOT NULL) - 存储 `OKR[]` 结构，精确定义如下:
        ```json
        [
          {
            "id": "okr1",
            "objective": "目标描述",
            "keyResults": [
              { "id": "kr1_1", "description": "关键成果描述" }
            ]
          }
        ]
        ```
*   **projects 表** (所有新记录的主键 `id` 应为 UUID 类型并自动生成)
    *   `id` (UUID, Primary Key, default: `gen_random_uuid()`)
    *   `name` (TEXT, NOT NULL)
    *   `priority` (project_priority, NOT NULL)
    *   `businessProblem` (TEXT)
    *   `keyResultIds` (TEXT[], default: `{}`) - 存储关联的 KR ID 字符串数组。
    *   `weeklyUpdate` (TEXT) - 存储富文本 HTML 字符串。
    *   `lastWeekUpdate` (TEXT) - 存储富文本 HTML 字符串。
    *   `status` (project_status, NOT NULL)
    *   `productManagers` (JSONB, default: `'[]'`) - 存储 `Role[]` 结构。
    *   `backendDevelopers` (JSONB, default: `'[]'`) - 存储 `Role[]` 结构。
    *   `frontendDevelopers` (JSONB, default: `'[]'`) - 存储 `Role[]` 结构。
    *   `qaTesters` (JSONB, default: `'[]'`) - 存储 `Role[]` 结构。
    *   `proposalDate` (DATE)
    *   `launchDate` (DATE)
    *   `followers` (TEXT[], default: `{}`) - 存储关注者的 User ID 字符串数组。
    *   `comments` (JSONB, default: `'[]'`) - 存储 `Comment[]` 结构。
    *   `changeLog` (JSONB, default: `'[]'`) - 存储 `ChangeLogEntry[]` 结构。
*   **JSONB 内部结构定义**:
    *   `Role`: `[{"userId": "u1", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "useSharedSchedule": boolean}]`
    *   `Comment`: `[{"id": "c1", "userId": "u1", "text": "...", "createdAt": "ISO_TIMESTAMP", "mentions": ["u2"]}]`
    *   `ChangeLogEntry`: `[{"id": "cl1", "userId": "u1", "field": "状态", "oldValue": "开发中", "newValue": "测试中", "changedAt": "ISO_TIMESTAMP"}]`

**3. API 端点规格 (严格复刻 api.ts 行为)**
所有 API 路径以 `/api` 开头。
*   `GET /api/users`: 获取所有用户列表。
*   `POST /api/login`: 用户登录。请求体 `{ "userId": "u1" }`，成功则返回 User 对象，失败返回 404。
*   `GET /api/okr-sets`: 获取所有 OKR 周期集合。
*   `POST /api/okr-sets`: 创建新 OKR 周期。请求体 `{ "periodId": "...", "periodName": "..." }`。`periodId` 已存在则返回 409。
*   `PUT /api/okr-sets/:periodId`: 整体更新指定周期的 `okrs` 数组。
*   `GET /api/projects`: 获取所有项目列表。
*   `POST /api/projects`: 创建新项目。
    *   **核心业务逻辑**:
        *   **校验**: 如果 `priority` 是 `'部门OKR相关'`，则 `keyResultIds` 数组必须非空。若校验失败，返回 400 Bad Request，并附带错误信息 `"“部门OKR相关”项目必须关联至少一个KR才能保存。"`。
        *   自动生成 `id` (UUID)。
        *   自动在 `changeLog` 数组开头插入一条“项目创建”的记录。
*   `PUT /api/projects/:id`: 局部更新一个项目。
    *   **核心业务逻辑**:
        *   **校验**: 更新前，先获取项目当前数据，并与传入的更新数据合并。如果合并后的最终状态是 `priority` 为 `'部门OKR相关'` 且 `keyResultIds` 为空，则校验失败，返回 400 Bad Request，并附带错误信息 `"“部门OKR相关”项目必须关联至少一个KR。"`。
        *   **变更记录 (ChangeLog)**: 如果更新的字段在 `['name', 'priority', 'status', 'weeklyUpdate', 'productManagers', 'backendDevelopers', 'frontendDevelopers', 'qaTesters', 'launchDate']` 列表中，必须自动在 `changeLog` 数组的开头插入一条 `ChangeLogEntry` 记录。`field` 字段必须使用对应的中文名 (例如: 项目名称, 优先级, 状态 等)。
*   `DELETE /api/projects/:id`: 删除一个项目。

**4. 特殊后端逻辑：每周进展自动结转**
*   **需求**: 实现一个后端定时任务 (Cron Job)，在每周一凌晨（例如 UTC 时间 01:00）自动执行。
*   **任务逻辑**: 遍历所有 `projects` 表中的项目。如果项目的 `weeklyUpdate` 字段有内容，则将其内容移动到 `lastWeekUpdate` 字段，并清空 `weeklyUpdate` 字段。此逻辑严禁由前端触发。

**5. 初始数据填充 (Data Seeding)**
*   编写一个一次性脚本，将前端 `constants.ts` 文件中的 `ALL_USERS`, `OKR_SETS`, 和 `PROJECTS` 的初始数据填充到数据库对应的表中。
*   **关键规则**: 填充 `users` 表时，`id` 必须使用常量中的 `'u1'`, `'u2'` 等。填充 `projects` 表时，`id` 必须由数据库自动生成新的 UUID。

---

### 第二部分：前端实现需求 (Frontend Implementation)

前端需要完全重现所提供的 React 代码库的功能、外观和交互。

**1. 整体架构和页面**
*   **技术栈**: React, ReactDOM, Tailwind CSS, pinyin-pro。
*   **核心结构**:
    *   应用入口为 `index.tsx`，包含主题管理 (`ThemeProvider`) 和认证管理 (`AuthProvider`)。
    *   `AppGate` 组件作为认证守卫，用户未登录时显示 `LoginScreen`，否则显示主应用 `App`。
*   **主要视图** (通过左侧 `Sidebar` 切换):
    *   **个人视图 (`PersonalView`)**: 默认视图。顶部展示当前用户的年度统计数据。下方分为“我正在参与的正在进行的项目”和“我关注的项目”两大板块，以卡片形式 (`ProjectCard`) 展示。右侧为“过去两周的项目评论”动态流 (`ActivityItem`)。
    *   **项目总览 (`MainContent`)**: 核心视图。包含一个功能强大的筛选栏 (`FilterBar`) 和一个复杂的项目表格 (`ProjectTable`)。
    *   **OKR (`OKRPage`)**: 用于管理不同周期的 OKR。支持周期切换、搜索、创建新周期、添加/编辑/删除 OKR。
    *   **看板 (`KanbanView`)**: 一个基于时间线的资源排期视图。可以按“周”或“月”为粒度，展示每个用户在不同项目中的时间安排。
    *   **周会视图 (`WeeklyMeetingView`)**: 专为周会设计。以更详细的大卡片 (`WeeklyMeetingProjectCard`) 形式展示筛选出的进行中项目，聚焦于业务问题、关联OKR、团队排期和本/上周进展。

**2. 关键组件与交互逻辑**
*   **ProjectTable (项目表格)**:
    *   **样式**: 实现左右固定列 (左侧3列，右侧1列)。
    *   **行内编辑**: 大部分单元格支持点击后进入编辑模式。文本、文本域、日期选择、状态和优先级下拉选择。
    *   **富文本编辑 (`RichTextEditableCell`)**: “本周进展/问题”列使用富文本编辑器，支持加粗和标红。
    *   **关联KR (`OkrMultiSelectCell`)**: 点击后弹出多选菜单，按 O 分组展示所有 KR。单元格需实现“部门OKR相关”但未关联KR时的红色“必填”样式和业务校验逻辑。
    *   **角色单元格 (`RoleCell`)**: 点击后弹出 `RoleEditModal` 进行成员和排期的详细编辑。
    *   **操作菜单**: “更多”按钮弹出菜单，包含关注/取消关注、评论、查看变更记录和删除功能。
    *   **Tooltip**: 鼠标悬停在项目名称上时，显示该项目的团队成员及排期信息 (`TeamScheduleTooltip`)。
*   **各类弹窗 (Modals)**:
    *   `RoleEditModal`: 编辑项目角色，支持增删成员、设置个人排期或选择使用共享排期。
    *   `ProjectDetailModal`: 在个人视图中点击项目卡片时弹出，聚合展示项目的核心信息，并支持对“本周进展”进行编辑。
    *   `CommentModal`: 查看和发表评论，支持 `@` 提及用户。
    *   `ChangeLogModal`: 展示项目的字段变更历史记录。
*   **筛选功能**:
    *   `FilterBar` 和 `KanbanFilterBar` 等组件使用可搜索的多选下拉框 (`MultiSelectDropdown`)，支持对项目状态、优先级、人员、OKR等多维度进行筛选。
    *   搜索框支持中文、拼音全拼和拼音首字母的模糊搜索 (`fuzzySearch`)。
*   **认证流程**:
    *   `LoginScreen` 提供用户选择列表进行模拟登录。
    *   `AuthProvider` 管理用户登录状态，并将用户信息持久化到 `localStorage`，实现自动登录。

**3. API 集成**
*   创建一个新的 `api.ts` 文件（或修改现有的）。
*   将所有原有的模拟函数（如 `api.fetchProjects`）替换为使用 `fetch` 或 `axios` 对后端相应 API 端点的真实网络请求。
*   确保前端应用的乐观更新（Optimistic Updates）逻辑与后端API调用正确衔接，包括成功后的状态确认和失败后的状态回滚及用户提示。
