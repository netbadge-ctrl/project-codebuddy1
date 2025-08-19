import { Project, OKR, User } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

// 辅助函数：处理API请求
const fetchAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API请求失败: ${response.status}`);
  }

  return response.json();
};

export const api = {
  fetchProjects: (): Promise<Project[]> => {
    return fetchAPI<Project[]>('/projects');
  },
  
  fetchOkrs: (): Promise<OKR[]> => {
    return fetchAPI<OKR[]>('/okrs');
  },
  
  fetchUsers: (): Promise<User[]> => {
    return fetchAPI<User[]>('/users');
  },

  login: (userId: string): Promise<User> => {
    return fetchAPI<User>('/login', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  createProject: (projectData: Project): Promise<Project> => {
    return fetchAPI<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  },
  
  updateProject: (projectId: string, updates: Partial<Project>): Promise<Project> => {
    return fetchAPI<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  deleteProject: (projectId: string): Promise<{ success: boolean }> => {
    return fetchAPI<{ success: boolean }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  },
  
  updateOkrs: (newOkrs: OKR[]): Promise<OKR[]> => {
    return fetchAPI<OKR[]>('/okrs', {
      method: 'PUT',
      body: JSON.stringify(newOkrs),
    });
  },
  
  performWeeklyRollover: (): Promise<{ updatedProjectIds: string[] }> => {
    return fetchAPI<{ updatedProjectIds: string[] }>('/weekly-rollover', {
      method: 'POST',
    });
  }
};

// 辅助函数：将数据库行转换为应用程序对象
const mapRowToUser = (row: RowDataPacket): User => ({
  id: row.id,
  name: row.name,
  avatarUrl: row.avatarUrl
});

const mapRowToKeyResult = (row: RowDataPacket): KeyResult => ({
  id: row.id,
  description: row.description
});

const mapRowToOKR = (row: RowDataPacket, keyResults: KeyResult[]): OKR => ({
  id: row.id,
  objective: row.objective,
  keyResults: keyResults
});

const mapRowToComment = (row: RowDataPacket, mentions: string[] = []): Comment => ({
  id: row.id,
  userId: row.user_id,
  text: row.text,
  createdAt: row.created_at,
  mentions: mentions.length > 0 ? mentions : undefined
});

const mapRowToChangeLog = (row: RowDataPacket): ChangeLogEntry => ({
  id: row.id,
  userId: row.user_id,
  field: row.field,
  oldValue: row.old_value,
  newValue: row.new_value,
  changedAt: row.changed_at
});

const mapRowToTeamMember = (row: RowDataPacket): TeamMember => ({
  userId: row.user_id,
  startDate: row.start_date,
  endDate: row.end_date,
  useSharedSchedule: row.use_shared_schedule === 1
});

export const api = {
  fetchProjects: async (): Promise<Project[]> => {
    try {
      const connection = await pool.getConnection();
      
      // 获取所有项目基本信息
      const [projectRows] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM projects
      `);
      
      const projects: Project[] = [];
      
      // 为每个项目获取详细信息
      for (const projectRow of projectRows) {
        const projectId = projectRow.id;
        
        // 获取项目关键结果IDs
        const [keyResultRows] = await connection.query<RowDataPacket[]>(`
          SELECT kr.id
          FROM project_key_results pkr
          JOIN key_results kr ON pkr.key_result_id = kr.id
          WHERE pkr.project_id = ?
        `, [projectId]);
        
        const keyResultIds = keyResultRows.map(row => row.id);
        
        // 获取项目关注者
        const [followerRows] = await connection.query<RowDataPacket[]>(`
          SELECT user_id FROM project_followers
          WHERE project_id = ?
        `, [projectId]);
        
        const followers = followerRows.map(row => row.user_id);
        
        // 获取项目团队成员
        const [teamRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM team_members
          WHERE project_id = ?
        `, [projectId]);
        
        const productManagers: TeamMember[] = [];
        const backendDevelopers: TeamMember[] = [];
        const frontendDevelopers: TeamMember[] = [];
        const qaTesters: TeamMember[] = [];
        
        teamRows.forEach(row => {
          const member = mapRowToTeamMember(row);
          switch (row.role) {
            case 'productManager':
              productManagers.push(member);
              break;
            case 'backendDeveloper':
              backendDevelopers.push(member);
              break;
            case 'frontendDeveloper':
              frontendDevelopers.push(member);
              break;
            case 'qaTester':
              qaTesters.push(member);
              break;
          }
        });
        
        // 获取项目评论
        const [commentRows] = await connection.query<RowDataPacket[]>(`
          SELECT c.*, GROUP_CONCAT(cm.user_id) as mentions
          FROM comments c
          LEFT JOIN comment_mentions cm ON c.id = cm.comment_id
          WHERE c.project_id = ?
          GROUP BY c.id
        `, [projectId]);
        
        const comments: Comment[] = commentRows.map(row => {
          const mentions = row.mentions ? row.mentions.split(',') : [];
          return mapRowToComment(row, mentions);
        });
        
        // 获取项目变更日志
        const [changeLogRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM change_logs
          WHERE project_id = ?
        `, [projectId]);
        
        const changeLog = changeLogRows.map(mapRowToChangeLog);
        
        // 构建完整的项目对象
        projects.push({
          id: projectRow.id,
          name: projectRow.name,
          priority: projectRow.priority as any,
          businessProblem: projectRow.business_problem,
          keyResultIds,
          weeklyUpdate: projectRow.weekly_update || '',
          lastWeekUpdate: projectRow.last_week_update || '',
          status: projectRow.status as any,
          productManagers,
          backendDevelopers,
          frontendDevelopers,
          qaTesters,
          proposalDate: projectRow.proposal_date,
          launchDate: projectRow.launch_date,
          followers,
          comments,
          changeLog
        });
      }
      
      connection.release();
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  },
  
  fetchOkrs: async (): Promise<OKR[]> => {
    try {
      const connection = await pool.getConnection();
      
      // 获取所有OKR
      const [okrRows] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM okrs
      `);
      
      const okrs: OKR[] = [];
      
      // 为每个OKR获取关键结果
      for (const okrRow of okrRows) {
        const [keyResultRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM key_results
          WHERE okr_id = ?
        `, [okrRow.id]);
        
        const keyResults = keyResultRows.map(mapRowToKeyResult);
        
        okrs.push(mapRowToOKR(okrRow, keyResults));
      }
      
      connection.release();
      return okrs;
    } catch (error) {
      console.error('Error fetching OKRs:', error);
      throw error;
    }
  },
  
  fetchUsers: async (): Promise<User[]> => {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM users
      `);
      
      connection.release();
      return rows.map(mapRowToUser);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  login: async (userId: string): Promise<User> => {
    try {
      const connection = await pool.getConnection();
      
      const [rows] = await connection.query<RowDataPacket[]>(`
        SELECT * FROM users
        WHERE id = ?
      `, [userId]);
      
      connection.release();
      
      if (rows.length === 0) {
        throw new Error('User not found');
      }
      
      return mapRowToUser(rows[0]);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },
  
  createProject: async (projectData: Project): Promise<Project> => {
    try {
      const connection = await pool.getConnection();
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        const { isNew, ...restOfData } = projectData;
        const projectId = `p${Date.now()}`;
        
        // 插入项目基本信息
        await connection.query(`
          INSERT INTO projects (
            id, name, priority, business_problem, weekly_update, last_week_update,
            status, proposal_date, launch_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          projectId,
          restOfData.name,
          restOfData.priority,
          restOfData.businessProblem,
          restOfData.weeklyUpdate || '',
          restOfData.lastWeekUpdate || '',
          restOfData.status,
          restOfData.proposalDate,
          restOfData.launchDate
        ]);
        
        // 插入项目关键结果关联
        if (restOfData.keyResultIds && restOfData.keyResultIds.length > 0) {
          const keyResultValues = restOfData.keyResultIds.map(krId => [projectId, krId]);
          await connection.query(`
            INSERT INTO project_key_results (project_id, key_result_id)
            VALUES ?
          `, [keyResultValues]);
        }
        
        // 插入项目关注者
        if (restOfData.followers && restOfData.followers.length > 0) {
          const followerValues = restOfData.followers.map(userId => [projectId, userId]);
          await connection.query(`
            INSERT INTO project_followers (project_id, user_id)
            VALUES ?
          `, [followerValues]);
        }
        
        // 插入团队成员
        const insertTeamMembers = async (role: ProjectRoleKey, roleType: string) => {
          if (restOfData[role] && restOfData[role].length > 0) {
            const teamValues = restOfData[role].map(member => [
              projectId,
              member.userId,
              roleType,
              member.startDate,
              member.endDate,
              member.useSharedSchedule ? 1 : 0
            ]);
            
            await connection.query(`
              INSERT INTO team_members (project_id, user_id, role, start_date, end_date, use_shared_schedule)
              VALUES ?
            `, [teamValues]);
          }
        };
        
        await insertTeamMembers('productManagers', 'productManager');
        await insertTeamMembers('backendDevelopers', 'backendDeveloper');
        await insertTeamMembers('frontendDevelopers', 'frontendDeveloper');
        await insertTeamMembers('qaTesters', 'qaTester');
        
        // 提交事务
        await connection.commit();
        
        // 返回创建的项目
        const newProject: Project = {
          ...restOfData,
          id: projectId,
          comments: [],
          changeLog: []
        };
        
        connection.release();
        return newProject;
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },
  
  updateProject: async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    try {
      const connection = await pool.getConnection();
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        // 更新项目基本信息
        const updateFields = [];
        const updateValues = [];
        
        if (updates.name !== undefined) {
          updateFields.push('name = ?');
          updateValues.push(updates.name);
        }
        
        if (updates.priority !== undefined) {
          updateFields.push('priority = ?');
          updateValues.push(updates.priority);
        }
        
        if (updates.businessProblem !== undefined) {
          updateFields.push('business_problem = ?');
          updateValues.push(updates.businessProblem);
        }
        
        if (updates.weeklyUpdate !== undefined) {
          updateFields.push('weekly_update = ?');
          updateValues.push(updates.weeklyUpdate);
        }
        
        if (updates.lastWeekUpdate !== undefined) {
          updateFields.push('last_week_update = ?');
          updateValues.push(updates.lastWeekUpdate);
        }
        
        if (updates.status !== undefined) {
          updateFields.push('status = ?');
          updateValues.push(updates.status);
        }
        
        if (updates.proposalDate !== undefined) {
          updateFields.push('proposal_date = ?');
          updateValues.push(updates.proposalDate);
        }
        
        if (updates.launchDate !== undefined) {
          updateFields.push('launch_date = ?');
          updateValues.push(updates.launchDate);
        }
        
        if (updateFields.length > 0) {
          await connection.query(`
            UPDATE projects
            SET ${updateFields.join(', ')}
            WHERE id = ?
          `, [...updateValues, projectId]);
        }
        
        // 更新关键结果关联
        if (updates.keyResultIds !== undefined) {
          // 删除现有关联
          await connection.query(`
            DELETE FROM project_key_results
            WHERE project_id = ?
          `, [projectId]);
          
          // 添加新关联
          if (updates.keyResultIds.length > 0) {
            const keyResultValues = updates.keyResultIds.map(krId => [projectId, krId]);
            await connection.query(`
              INSERT INTO project_key_results (project_id, key_result_id)
              VALUES ?
            `, [keyResultValues]);
          }
        }
        
        // 更新关注者
        if (updates.followers !== undefined) {
          // 删除现有关注者
          await connection.query(`
            DELETE FROM project_followers
            WHERE project_id = ?
          `, [projectId]);
          
          // 添加新关注者
          if (updates.followers.length > 0) {
            const followerValues = updates.followers.map(userId => [projectId, userId]);
            await connection.query(`
              INSERT INTO project_followers (project_id, user_id)
              VALUES ?
            `, [followerValues]);
          }
        }
        
        // 更新团队成员
        const updateTeamMembers = async (role: ProjectRoleKey, roleType: string) => {
          if (updates[role] !== undefined) {
            // 删除现有成员
            await connection.query(`
              DELETE FROM team_members
              WHERE project_id = ? AND role = ?
            `, [projectId, roleType]);
            
            // 添加新成员
            if (updates[role]!.length > 0) {
              const teamValues = updates[role]!.map(member => [
                projectId,
                member.userId,
                roleType,
                member.startDate,
                member.endDate,
                member.useSharedSchedule ? 1 : 0
              ]);
              
              await connection.query(`
                INSERT INTO team_members (project_id, user_id, role, start_date, end_date, use_shared_schedule)
                VALUES ?
              `, [teamValues]);
            }
          }
        };
        
        if (updates.productManagers !== undefined) {
          await updateTeamMembers('productManagers', 'productManager');
        }
        
        if (updates.backendDevelopers !== undefined) {
          await updateTeamMembers('backendDevelopers', 'backendDeveloper');
        }
        
        if (updates.frontendDevelopers !== undefined) {
          await updateTeamMembers('frontendDevelopers', 'frontendDeveloper');
        }
        
        if (updates.qaTesters !== undefined) {
          await updateTeamMembers('qaTesters', 'qaTester');
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取更新后的项目
        const [projectRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM projects
          WHERE id = ?
        `, [projectId]);
        
        if (projectRows.length === 0) {
          throw new Error('Project not found');
        }
        
        // 获取项目关键结果IDs
        const [keyResultRows] = await connection.query<RowDataPacket[]>(`
          SELECT kr.id
          FROM project_key_results pkr
          JOIN key_results kr ON pkr.key_result_id = kr.id
          WHERE pkr.project_id = ?
        `, [projectId]);
        
        const keyResultIds = keyResultRows.map(row => row.id);
        
        // 获取项目关注者
        const [followerRows] = await connection.query<RowDataPacket[]>(`
          SELECT user_id FROM project_followers
          WHERE project_id = ?
        `, [projectId]);
        
        const followers = followerRows.map(row => row.user_id);
        
        // 获取项目团队成员
        const [teamRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM team_members
          WHERE project_id = ?
        `, [projectId]);
        
        const productManagers: TeamMember[] = [];
        const backendDevelopers: TeamMember[] = [];
        const frontendDevelopers: TeamMember[] = [];
        const qaTesters: TeamMember[] = [];
        
        teamRows.forEach(row => {
          const member = mapRowToTeamMember(row);
          switch (row.role) {
            case 'productManager':
              productManagers.push(member);
              break;
            case 'backendDeveloper':
              backendDevelopers.push(member);
              break;
            case 'frontendDeveloper':
              frontendDevelopers.push(member);
              break;
            case 'qaTester':
              qaTesters.push(member);
              break;
          }
        });
        
        // 获取项目评论
        const [commentRows] = await connection.query<RowDataPacket[]>(`
          SELECT c.*, GROUP_CONCAT(cm.user_id) as mentions
          FROM comments c
          LEFT JOIN comment_mentions cm ON c.id = cm.comment_id
          WHERE c.project_id = ?
          GROUP BY c.id
        `, [projectId]);
        
        const comments: Comment[] = commentRows.map(row => {
          const mentions = row.mentions ? row.mentions.split(',') : [];
          return mapRowToComment(row, mentions);
        });
        
        // 获取项目变更日志
        const [changeLogRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM change_logs
          WHERE project_id = ?
        `, [projectId]);
        
        const changeLog = changeLogRows.map(mapRowToChangeLog);
        
        const projectRow = projectRows[0];
        const updatedProject: Project = {
          id: projectRow.id,
          name: projectRow.name,
          priority: projectRow.priority as any,
          businessProblem: projectRow.business_problem,
          keyResultIds,
          weeklyUpdate: projectRow.weekly_update || '',
          lastWeekUpdate: projectRow.last_week_update || '',
          status: projectRow.status as any,
          productManagers,
          backendDevelopers,
          frontendDevelopers,
          qaTesters,
          proposalDate: projectRow.proposal_date,
          launchDate: projectRow.launch_date,
          followers,
          comments,
          changeLog
        };
        
        connection.release();
        return updatedProject;
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },
  
  deleteProject: async (projectId: string): Promise<{ success: boolean }> => {
    try {
      const connection = await pool.getConnection();
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        // 检查项目是否存在
        const [projectRows] = await connection.query<RowDataPacket[]>(`
          SELECT id FROM projects
          WHERE id = ?
        `, [projectId]);
        
        if (projectRows.length === 0) {
          throw new Error('Project not found');
        }
        
        // 删除项目相关数据
        await connection.query('DELETE FROM project_key_results WHERE project_id = ?', [projectId]);
        await connection.query('DELETE FROM project_followers WHERE project_id = ?', [projectId]);
        await connection.query('DELETE FROM team_members WHERE project_id = ?', [projectId]);
        
        // 删除评论提及
        await connection.query(`
          DELETE cm FROM comment_mentions cm
          JOIN comments c ON cm.comment_id = c.id
          WHERE c.project_id = ?
        `, [projectId]);
        
        await connection.query('DELETE FROM comments WHERE project_id = ?', [projectId]);
        await connection.query('DELETE FROM change_logs WHERE project_id = ?', [projectId]);
        
        // 删除项目
        await connection.query('DELETE FROM projects WHERE id = ?', [projectId]);
        
        // 提交事务
        await connection.commit();
        
        connection.release();
        return { success: true };
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  },
  
  updateOkrs: async (newOkrs: OKR[]): Promise<OKR[]> => {
    try {
      const connection = await pool.getConnection();
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        // 获取所有现有OKR的ID
        const [existingOkrRows] = await connection.query<RowDataPacket[]>(`
          SELECT id FROM okrs
        `);
        
        const existingOkrIds = new Set(existingOkrRows.map(row => row.id));
        
        for (const okr of newOkrs) {
          if (existingOkrIds.has(okr.id)) {
            // 更新现有OKR
            await connection.query(`
              UPDATE okrs
              SET objective = ?
              WHERE id = ?
            `, [okr.objective, okr.id]);
            
            // 删除现有关键结果
            await connection.query(`
              DELETE FROM key_results
              WHERE okr_id = ?
            `, [okr.id]);
          } else {
            // 创建新OKR
            await connection.query(`
              INSERT INTO okrs (id, objective)
              VALUES (?, ?)
            `, [okr.id, okr.objective]);
          }
          
          // 添加关键结果
          if (okr.keyResults && okr.keyResults.length > 0) {
            const keyResultValues = okr.keyResults.map(kr => [kr.id, okr.id, kr.description]);
            await connection.query(`
              INSERT INTO key_results (id, okr_id, description)
              VALUES ?
            `, [keyResultValues]);
          }
        }
        
        // 提交事务
        await connection.commit();
        
        // 获取更新后的OKR
        const [okrRows] = await connection.query<RowDataPacket[]>(`
          SELECT * FROM okrs
        `);
        
        const updatedOkrs: OKR[] = [];
        
        for (const okrRow of okrRows) {
          const [keyResultRows] = await connection.query<RowDataPacket[]>(`
            SELECT * FROM key_results
            WHERE okr_id = ?
          `, [okrRow.id]);
          
          const keyResults = keyResultRows.map(mapRowToKeyResult);
          
          updatedOkrs.push(mapRowToOKR(okrRow, keyResults));
        }
        
        connection.release();
        return updatedOkrs;
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error updating OKRs:', error);
      throw error;
    }
  },
  
  performWeeklyRollover: async (): Promise<{ updatedProjectIds: string[] }> => {
    try {
      const connection = await pool.getConnection();
      
      // 开始事务
      await connection.beginTransaction();
      
      try {
        // 获取所有有周更新的项目
        const [projectRows] = await connection.query<RowDataPacket[]>(`
          SELECT id, weekly_update
          FROM projects
          WHERE weekly_update IS NOT NULL AND weekly_update != ''
        `);
        
        const updatedProjectIds: string[] = [];
        
        for (const projectRow of projectRows) {
          await connection.query(`
            UPDATE projects
            SET last_week_update = weekly_update, weekly_update = ''
            WHERE id = ?
          `, [projectRow.id]);
          
          updatedProjectIds.push(projectRow.id);
        }
        
        // 提交事务
        await connection.commit();
        
        connection.release();
        return { updatedProjectIds };
      } catch (error) {
        // 回滚事务
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error('Error performing weekly rollover:', error);
      throw error;
    }
  }
};
