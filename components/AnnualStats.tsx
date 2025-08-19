import React, { useMemo } from 'react';
import { Project, User, OKR, ProjectStatus } from '../types';
import { IconBriefcase, IconRocket, IconClipboard, IconTarget } from './Icons';

interface AnnualStatsProps {
  projects: Project[];
  allOkrs: OKR[];
  currentUser: User;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; colorClasses: string; }> = ({ icon, title, value, colorClasses }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 ${colorClasses}`}>
        <div className="p-3 rounded-lg bg-white/20">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    </div>
);

export const AnnualStats: React.FC<AnnualStatsProps> = ({ projects, allOkrs, currentUser }) => {
    
    const stats = useMemo(() => {
        const currentYear = new Date().getFullYear();
        
        const myProjects = projects.filter(p => 
            p.productManagers.some(m => m.userId === currentUser.id) ||
            p.backendDevelopers.some(m => m.userId === currentUser.id) ||
            p.frontendDevelopers.some(m => m.userId === currentUser.id) ||
            p.qaTesters.some(m => m.userId === currentUser.id)
        );

        const annualProjects = myProjects.filter(p => 
            new Date(p.proposalDate).getFullYear() === currentYear
        );

        const launchedProjects = myProjects.filter(p =>
            p.status === ProjectStatus.Launched && p.launchDate && new Date(p.launchDate).getFullYear() === currentYear
        );

        const ongoingProjects = myProjects.filter(p => p.status !== ProjectStatus.Launched);

        const krToOkrMap = new Map<string, string>();
        allOkrs.forEach(okr => {
            okr.keyResults.forEach(kr => {
                krToOkrMap.set(kr.id, okr.id);
            });
        });
        
        const contributedOkrIds = new Set<string>();
        myProjects.forEach(p => {
            p.keyResultIds.forEach(krId => {
                const okrId = krToOkrMap.get(krId);
                if (okrId) {
                    contributedOkrIds.add(okrId);
                }
            });
        });

        return {
            annualCount: annualProjects.length,
            launchedCount: launchedProjects.length,
            ongoingCount: ongoingProjects.length,
            okrCount: contributedOkrIds.size,
        };
    }, [projects, allOkrs, currentUser]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
                icon={<IconBriefcase className="w-6 h-6"/>}
                title="年度参与项目"
                value={stats.annualCount}
                colorClasses="bg-blue-500 text-white"
            />
            <StatCard 
                icon={<IconRocket className="w-6 h-6"/>}
                title="年度上线项目"
                value={stats.launchedCount}
                colorClasses="bg-green-500 text-white"
            />
            <StatCard 
                icon={<IconClipboard className="w-6 h-6"/>}
                title="进行中任务"
                value={stats.ongoingCount}
                colorClasses="bg-orange-500 text-white"
            />
            <StatCard 
                icon={<IconTarget className="w-6 h-6"/>}
                title="OKR 贡献"
                value={stats.okrCount}
                colorClasses="bg-purple-500 text-white"
            />
        </div>
    );
};