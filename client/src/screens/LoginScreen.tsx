import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import * as api from '../api';

export const LoginScreen: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  useEffect(() => {
    api.fetchUsers().then(setUsers).catch(() => setError('无法加载用户列表'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
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

  if (loading || users.length === 0) {
    return <div>加载中...</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">选择用户登录</h1>
        <form onSubmit={handleLogin}>
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          >
            <option value="" disabled>-- 请选择一个用户 --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading || !selectedUserId}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
};