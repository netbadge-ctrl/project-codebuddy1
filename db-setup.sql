-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  avatarUrl VARCHAR(255) NOT NULL
);

-- OKR 表
CREATE TABLE IF NOT EXISTS okrs (
  id VARCHAR(50) PRIMARY KEY,
  objective TEXT NOT NULL
);

-- 关键结果表
CREATE TABLE IF NOT EXISTS key_results (
  id VARCHAR(50) PRIMARY KEY,
  okr_id VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  FOREIGN KEY (okr_id) REFERENCES okrs(id) ON DELETE CASCADE
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  priority ENUM('P0', 'P1', 'P2', 'P3') NOT NULL,
  business_problem TEXT NOT NULL,
  weekly_update TEXT,
  last_week_update TEXT,
  status ENUM('未开始', '需求讨论', '需求完成', '评审完成待开发', '开发中', '开发完成待测试', '测试中', '测试完成待上线', '已上线') NOT NULL,
  proposal_date DATE NOT NULL,
  launch_date DATE NOT NULL
);

-- 项目与关键结果的关联表
CREATE TABLE IF NOT EXISTS project_key_results (
  project_id VARCHAR(50) NOT NULL,
  key_result_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (project_id, key_result_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (key_result_id) REFERENCES key_results(id) ON DELETE CASCADE
);

-- 项目关注者表
CREATE TABLE IF NOT EXISTS project_followers (
  project_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 团队成员表（包含所有角色）
CREATE TABLE IF NOT EXISTS team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  role ENUM('productManager', 'backendDeveloper', 'frontendDeveloper', 'qaTester') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  use_shared_schedule BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 评论提及表
CREATE TABLE IF NOT EXISTS comment_mentions (
  comment_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (comment_id, user_id),
  FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 变更日志表
CREATE TABLE IF NOT EXISTS change_logs (
  id VARCHAR(50) PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  user_id VARCHAR(50) NOT NULL,
  field VARCHAR(100) NOT NULL,
  old_value TEXT NOT NULL,
  new_value TEXT NOT NULL,
  changed_at DATETIME NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 插入初始数据
INSERT INTO users (id, name, avatarUrl) VALUES
  ('u1', '张三', 'https://picsum.photos/seed/u1/40/40'),
  ('u2', '李四', 'https://picsum.photos/seed/u2/40/40'),
  ('u3', '王五', 'https://picsum.photos/seed/u3/40/40'),
  ('u4', '赵六', 'https://picsum.photos/seed/u4/40/40'),
  ('u5', '孙七', 'https://picsum.photos/seed/u5/40/40'),
  ('u6', '周八', 'https://picsum.photos/seed/u6/40/40'),
  ('u7', '吴九', 'https://picsum.photos/seed/u7/40/40'),
  ('u8', '郑十', 'https://picsum.photos/seed/u8/40/40'),
  ('u9', '陈十一', 'https://picsum.photos/seed/u9/40/40'),
  ('u10', '卫十二', 'https://picsum.photos/seed/u10/40/40');

-- 插入OKR数据
INSERT INTO okrs (id, objective) VALUES
  ('okr1', '实现季度新用户增长30%，提升应用商店排名至前十。'),
  ('okr2', '将支付成功率提升至99.5%，减少支付流程平均时长50%。'),
  ('okr3', '新版后台上线，提升运营人员日均操作效率40%。');

-- 插入关键结果数据
INSERT INTO key_results (id, okr_id, description) VALUES
  ('kr1_1', 'okr1', '完成3次线上市场推广活动'),
  ('kr1_2', 'okr1', '应用商店评分提升至4.8分'),
  ('kr2_1', 'okr2', '重构支付网关，减少技术故障率90%'),
  ('kr2_2', 'okr2', '优化前端支付交互，减少用户操作步骤'),
  ('kr3_1', 'okr3', '收集运营团队反馈，完成10项核心功能优化'),
  ('kr3_2', 'okr3', '新后台系统Bug率低于0.1%');

-- 插入项目数据 (简化版，实际数据需要根据constants.ts中的数据调整日期)
INSERT INTO projects (id, name, priority, business_problem, weekly_update, last_week_update, status, proposal_date, launch_date) VALUES
  ('p1', 'Q3 用户增长计划', 'P0', '新用户注册率增长放缓，需要提升品牌曝光度和转化率。', '市场活动已启动，网红合作细节敲定中。', '<div>确定了市场推广的核心主题和预算。</div>', '开发中', '2024-06-19', '2024-09-17'),
  ('p2', '支付系统重构', 'P0', '现有支付流程复杂，掉单率高，影响用户体验和收入。', '核心架构设计完成，进入编码阶段。', '<div>支付网关选型调研完成。</div>', '已上线', '2024-04-20', '2024-08-13'),
  ('p3', '管理后台 V2.0', 'P1', '旧版后台操作繁琐，功能缺失，运营效率低下。', '需求评审阶段，部分原型图已出。', '<div>完成了初步的需求收集。</div>', '需求讨论', '2024-08-11', '2024-11-16'),
  ('p4', 'AI智能客服机器人', 'P1', '客服人力成本高，响应速度慢，需要引入AI提升效率和用户满意度。', '核心意图识别模块开发完成，准确率达到85%。正在进行多轮对话逻辑的开发。', '<div>确定技术选型，使用RASA框架。</div>', '开发中', '2024-06-29', '2024-10-07'),
  ('p5', '数据中台建设', 'P0', '各业务线数据孤岛问题严重，数据资产利用率低，决策缺少数据支持。', 'ETL流程测试中，发现几个性能瓶颈，正在优化。数据报表前端展示已完成。', '<div>数据仓库模型设计评审通过。</div>', '测试中', '2024-04-20', '2024-09-07'),
  ('p6', '官网2024版改版', 'P2', '旧版官网风格陈旧，无法体现公司新品牌形象，且移动端体验差。', '后端接口开发完成，前端正在集成。', '<div>完成UI/UX设计稿。</div>', '开发完成待测试', '2024-06-19', '2024-08-28');

-- 项目与关键结果关联
INSERT INTO project_key_results (project_id, key_result_id) VALUES
  ('p1', 'kr1_1'),
  ('p1', 'kr1_2'),
  ('p2', 'kr2_1'),
  ('p3', 'kr3_1'),
  ('p4', 'kr3_2'),
  ('p5', 'kr2_2'),
  ('p6', 'kr1_2');

-- 项目关注者
INSERT INTO project_followers (project_id, user_id) VALUES
  ('p1', 'u2'),
  ('p1', 'u3'),
  ('p2', 'u1'),
  ('p4', 'u1'),
  ('p4', 'u2'),
  ('p5', 'u3'),
  ('p5', 'u7'),
  ('p5', 'u1'),
  ('p6', 'u2'),
  ('p6', 'u3'),
  ('p6', 'u4'),
  ('p6', 'u7'),
  ('p6', 'u8'),
  ('p6', 'u10');

-- 团队成员 (简化版，实际数据需要根据constants.ts中的数据调整日期)
INSERT INTO team_members (project_id, user_id, role, start_date, end_date) VALUES
  -- p1 项目团队
  ('p1', 'u1', 'productManager', '2024-07-04', '2024-09-17'),
  ('p1', 'u4', 'backendDeveloper', '2024-07-19', '2024-09-02'),
  ('p1', 'u5', 'frontendDeveloper', '2024-07-19', '2024-09-07'),
  ('p1', 'u9', 'qaTester', '2024-08-18', '2024-09-17'),
  
  -- p2 项目团队
  ('p2', 'u2', 'productManager', '2024-05-20', '2024-08-13'),
  ('p2', 'u6', 'backendDeveloper', '2024-05-30', '2024-08-03'),
  ('p2', 'u8', 'backendDeveloper', '2024-05-30', '2024-08-08'),
  ('p2', 'u7', 'frontendDeveloper', '2024-06-19', '2024-08-10'),
  ('p2', 'u10', 'qaTester', '2024-07-19', '2024-08-12'),
  
  -- p3 项目团队
  ('p3', 'u3', 'productManager', '2024-08-18', '2024-10-17'),
  ('p3', 'u1', 'productManager', '2024-08-18', '2024-10-17'),
  
  -- p4 项目团队
  ('p4', 'u3', 'productManager', '2024-07-09', '2024-10-07'),
  ('p4', 'u8', 'backendDeveloper', '2024-07-19', '2024-10-07'),
  ('p4', 'u7', 'frontendDeveloper', '2024-07-29', '2024-09-27'),
  ('p4', 'u10', 'qaTester', '2024-08-28', '2024-10-07'),
  
  -- p5 项目团队
  ('p5', 'u2', 'productManager', '2024-05-10', '2024-09-07'),
  ('p5', 'u4', 'backendDeveloper', '2024-05-20', '2024-09-07'),
  ('p5', 'u6', 'backendDeveloper', '2024-05-20', '2024-09-07'),
  ('p5', 'u9', 'frontendDeveloper', '2024-06-19', '2024-08-28'),
  ('p5', 'u5', 'qaTester', '2024-07-29', '2024-09-07'),
  
  -- p6 项目团队
  ('p6', 'u1', 'productManager', '2024-06-29', '2024-08-28'),
  ('p6', 'u6', 'backendDeveloper', '2024-07-09', '2024-08-18'),
  ('p6', 'u5', 'frontendDeveloper', '2024-07-19', '2024-08-28'),
  ('p6', 'u9', 'qaTester', '2024-08-18', '2024-08-28');

-- 评论
INSERT INTO comments (id, project_id, user_id, text, created_at) VALUES
  ('c1-1', 'p1', 'u2', '这个项目很重要，@王五 大家加油！', '2024-07-20 10:00:00'),
  ('c1-2', 'p1', 'u1', '收到，后端进度正常，下周可以联调。', '2024-07-21 11:30:00'),
  ('c4-1', 'p4', 'u1', '这个项目看起来很有挑战，@郑十 加油！AI部分是关键。', '2024-08-03 14:20:00'),
  ('c4-2', 'p4', 'u3', '是的，我们正在攻克难关。下周会有一个demo。', '2024-08-04 09:00:00'),
  ('c5-1', 'p5', 'u3', '这个项目非常关键，是公司今年的重点。', '2024-08-13 11:00:00'),
  ('c5-2', 'p5', 'u2', '感谢关注！@赵六 @周八 我们会确保数据质量。', '2024-08-14 18:00:00'),
  ('c5-3', 'p5', 'u4', '收到，正在跟进SQL优化。', '2024-08-15 19:30:00'),
  ('c6-1', 'p6', 'u2', '新设计稿很棒！期待上线效果。', '2024-07-24 10:00:00'),
  ('c6-2', 'p6', 'u1', '@孙七 前端同学加油，争取下周提测！', '2024-08-17 16:00:00');

-- 评论提及
INSERT INTO comment_mentions (comment_id, user_id) VALUES
  ('c1-1', 'u3'),
  ('c4-1', 'u8'),
  ('c5-2', 'u4'),
  ('c5-2', 'u6'),
  ('c6-2', 'u5');

-- 变更日志
INSERT INTO change_logs (id, project_id, user_id, field, old_value, new_value, changed_at) VALUES
  ('cl1-1', 'p1', 'u1', 'status', '需求讨论', '开发中', '2024-07-19 14:00:00'),
  ('cl1-2', 'p1', 'u3', 'priority', 'P1', 'P0', '2024-07-18 09:00:00'),
  ('cl4-1', 'p4', 'u3', 'status', '需求讨论', '开发中', '2024-07-19 10:00:00');