import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Project, ProjectStatus, Comment } from '../types';
import ProjectCard from '../components/ProjectCard';
import ProjectDetailModal from '../components/ProjectDetailModal';
import ActivityItem from '../components/ActivityItem';
import { subDays } from 'date-fns';

const ONGOING_STATUSES: ProjectStatus[] = ['开发中', '待测试', '测试中', '测试完成待上线'];

const PersonalView: React.FC = () => {
  const { user } = useAuth();
  const { projects, loading } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const recentComments = useMemo(() => {
    if (!projects) return [];
    const twoWeeksAgo = subDays(new Date(), 14);
    const allComments: { comment: Comment; project: Project }[] = [];
    projects.forEach(project => {
      (project.comments || []).forEach(comment => {
        allComments.push({ comment, project });
      });
    });
    return allComments
      .filter(({ comment }) => new Date(comment.createdAt) > twoWeeksAgo)
      .sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
  }, [projects]);

  if (loading) {
    return <div>加载数据中...</div>;
  }

  if (!user) {
    return <div>无法获取用户信息。</div>;
  }

  const userIsParticipant = (project: Project) => {
    const roles = [
      ...project.productManagers,
      ...project.backendDevelopers,
      ...project.frontendDevelopers,
      ...project.qaTesters,
    ];
    return roles.some((role) => role.userId === user.id);
  };

  const ongoingProjects = projects.filter(
    (p) => ONGOING_STATUSES.includes(p.status) && userIsParticipant(p)
  );

  const followedProjects = projects.filter((p) => p.followers.includes(user.id));

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">你好，{user.name}！</h1>
      
      {/* Placeholder for stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">统计数据1</div>
        <div className="bg-white p-4 rounded-lg shadow">统计数据2</div>
        <div className="bg-white p-4 rounded-lg shadow">统计数据3</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section>
            <h2 className="text-2xl font-semibold mb-4">我正在参与的正在进行的项目</h2>
            {ongoingProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ongoingProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                ))}
              </div>
            ) : (
              <p>暂无进行中的项目。</p>
            )}
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">我关注的项目</h2>
            {followedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {followedProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} onClick={() => setSelectedProject(p)} />
                ))}
              </div>
            ) : (
              <p>暂无关注的项目。</p>
            )}
          </section>
        </div>

        <aside>
          <h2 className="text-2xl font-semibold mb-4">最近动态</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            {recentComments.length > 0 ? (
              <div>
                {recentComments.map(({ comment, project }) => (
                  <ActivityItem key={comment.id} comment={comment} project={project} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500">过去两周内没有新动态。</p>
            )}
          </div>
        </aside>
      </div>
      <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};

export default PersonalView;