import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth-context';
import { api } from '../api';
import { User } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { IconG } from './Icons';

export const LoginScreen: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { login, isLoading: isLoggingIn } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const fetchedUsers = await api.fetchUsers();
                setUsers(fetchedUsers);
                if (fetchedUsers.length > 0) {
                    setSelectedUserId(fetchedUsers[0].id);
                }
            } catch (err) {
                setError('无法加载用户列表');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUserId) {
            setError('请选择一个用户');
            return;
        }
        setError('');
        try {
            await login(selectedUserId);
        } catch (err) {
            setError('登录失败，请重试');
        }
    };

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#1A1A1A] text-gray-900 dark:text-white">
            {(isLoggingIn) && <LoadingSpinner />}
            <div className="w-full max-w-sm mx-auto overflow-hidden bg-white dark:bg-[#232323] rounded-2xl shadow-xl border border-gray-200 dark:border-[#363636]">
                <div className="p-8">
                    <div className="flex flex-col items-center gap-3 mb-8">
                         <IconG className="w-12 h-12"/>
                         <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">项目中心</h2>
                         <p className="text-center text-gray-500 dark:text-gray-400">请选择您的账户登录</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-5">
                            <label htmlFor="user-select" className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">选择用户</label>
                            <select
                                id="user-select"
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="bg-gray-100 dark:bg-[#2d2d2d] border border-gray-300 dark:border-[#4a4a4a] text-gray-900 dark:text-white text-sm rounded-lg focus:ring-[#6C63FF] focus:border-[#6C63FF] block w-full p-2.5"
                            >
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}
                        
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isLoggingIn}
                                className="w-full px-6 py-3 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-[#6C63FF] rounded-lg hover:bg-[#5a52d9] focus:outline-none focus:ring focus:ring-[#6C63FF] focus:ring-opacity-50 disabled:bg-gray-500"
                            >
                                登录
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};