import React, { useState } from 'react';
import { UserPlus, RefreshCw, Users, Mail, Shield, Search, Sparkles } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import UserCard from '../components/ui/UserCard';

const AdminPanel = () => {
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [users] = useState([
    { id: 1, name: 'muhammadnasirpk44', email: 'muhammadnasirpk44@gmail.com', role: 'admin' },
    { id: 2, name: 'Amit Noach', email: 'amitnoa@base44.com', role: 'admin' },
    { id: 3, name: 'Gigi Fortune', email: 'gigi@creativefundingagency.com', role: 'admin' },
  ]);

  const handleInvite = () => {
    console.log('Inviting user:', email, selectedRole);
    setEmail('');
    alert(`Invitation sent to ${email} as ${selectedRole}!`);
  };

  const handleRemove = (userId) => {
    console.log('Removing user:', userId);
    alert('User removed successfully!');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 dark:from-emerald-500/20 dark:to-blue-500/20 rounded-full border border-emerald-500/20">
            <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Admin Dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:via-slate-100 dark:to-white bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Invite new users and manage admin permissions
          </p>
        </div>

        {/* Invite New User Card */}
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-xl">
                <UserPlus size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Invite New User
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Send an invitation to add new team members
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-sm hover:shadow-md"
                />
              </div>
              
              <div className="lg:col-span-3 relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md font-semibold"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="lg:col-span-3">
                <Button 
                  icon={UserPlus}
                  onClick={handleInvite}
                  disabled={!email}
                  className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white border-0 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed py-4 font-bold"
                >
                  Send Invite
                </Button>
              </div>
            </div>

            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
              <div className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-400">
                <span className="text-xl">💡</span>
                <p>
                  <strong className="font-bold">Tip:</strong> Admin users have full access to manage other users and system settings.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List Card */}
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
                  <Users size={28} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Active Users ({filteredUsers.length})
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Manage user roles and permissions
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  />
                </div>
                <Button 
                  variant="outline" 
                  icon={RefreshCw} 
                  size="sm"
                  className="bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-purple-500 dark:hover:border-purple-500"
                >
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
              </div>
            </div>
            
            {filteredUsers.length > 0 ? (
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    name={user.name}
                    email={user.email}
                    role={user.role}
                    onRemove={() => handleRemove(user.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                  <Users size={56} className="text-slate-400" />
                </div>
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                  No users found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-500/30 p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl shadow-lg">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{users.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-500/30 p-6 hover:scale-105 transition-transform duration-300">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow-lg">
                <Shield size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">Admin Users</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {users.filter(u => u.role === 'admin').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 border-2 border-blue-200 dark:border-blue-500/30 p-6 hover:scale-105 transition-transform duration-300 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                <UserPlus size={32} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Regular Users</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {users.filter(u => u.role === 'user').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;