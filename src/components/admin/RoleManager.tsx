import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  Loader2,
  Mail,
  User,
  Calendar,
  Key,
  Eye,
  EyeOff,
  AlertTriangle } from
'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'editor' | 'viewer';
  avatar_url: string | null;
  created_at?: string;
  last_sign_in?: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  roles: string[];
}

const PERMISSIONS: Permission[] = [
{ id: 'articles.create', name: 'יצירת כתבות', description: 'יכולת ליצור כתבות חדשות', roles: ['admin', 'editor'] },
{ id: 'articles.edit', name: 'עריכת כתבות', description: 'יכולת לערוך כתבות קיימות', roles: ['admin', 'editor'] },
{ id: 'articles.delete', name: 'מחיקת כתבות', description: 'יכולת למחוק כתבות', roles: ['admin'] },
{ id: 'articles.publish', name: 'פרסום כתבות', description: 'יכולת לפרסם כתבות', roles: ['admin', 'editor'] },
{ id: 'galleries.manage', name: 'ניהול גלריות', description: 'יכולת ליצור ולערוך גלריות', roles: ['admin', 'editor'] },
{ id: 'events.manage', name: 'ניהול אירועים', description: 'יכולת ליצור ולערוך אירועים', roles: ['admin', 'editor'] },
{ id: 'videos.manage', name: 'ניהול סרטונים', description: 'יכולת ליצור ולערוך סרטונים', roles: ['admin', 'editor'] },
{ id: 'ads.view', name: 'צפייה בפרסומות', description: 'יכולת לצפות בנתוני פרסומות', roles: ['admin', 'editor', 'viewer'] },
{ id: 'ads.manage', name: 'ניהול פרסומות', description: 'יכולת ליצור ולערוך קמפיינים', roles: ['admin'] },
{ id: 'categories.manage', name: 'ניהול קטגוריות', description: 'יכולת ליצור ולערוך קטגוריות', roles: ['admin'] },
{ id: 'users.view', name: 'צפייה במשתמשים', description: 'יכולת לצפות ברשימת משתמשים', roles: ['admin'] },
{ id: 'users.manage', name: 'ניהול משתמשים', description: 'יכולת לערוך ולמחוק משתמשים', roles: ['admin'] },
{ id: 'settings.manage', name: 'ניהול הגדרות', description: 'יכולת לשנות הגדרות מערכת', roles: ['admin'] },
{ id: 'analytics.view', name: 'צפייה באנליטיקס', description: 'יכולת לצפות בדוחות', roles: ['admin', 'editor'] }];


const ROLE_DETAILS = {
  admin: {
    name: 'מנהל',
    description: 'גישה מלאה לכל המערכת',
    icon: ShieldCheck,
    color: 'amber',
    permissions: PERMISSIONS.map((p) => p.id)
  },
  editor: {
    name: 'עורך',
    description: 'יכולת לערוך תוכן ללא גישה להגדרות',
    icon: Shield,
    color: 'blue',
    permissions: PERMISSIONS.filter((p) => p.roles.includes('editor')).map((p) => p.id)
  },
  viewer: {
    name: 'צופה',
    description: 'צפייה בלבד ללא יכולת עריכה',
    icon: Eye,
    color: 'zinc',
    permissions: PERMISSIONS.filter((p) => p.roles.includes('viewer')).map((p) => p.id)
  }
};

export default function RoleManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.
    from('profiles').
    select('*').
    order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data as UserProfile[]);
    }
    setLoading(false);
  }

  async function updateUserRole(userId: string, newRole: 'admin' | 'editor' | 'viewer') {
    if (!supabase) return;
    setSaving(true);

    const { error } = await supabase.
    from('profiles').
    update({ role: newRole }).
    eq('id', userId);

    if (!error) {
      setUsers(users.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
    setSaving(false);
    setShowUserModal(false);
    setEditingUser(null);
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const roleColorClasses = {
    admin: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    editor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    viewer: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  };

  return (
    <div data-ev-id="ev_4791e9d97d" className="flex flex-col gap-6">
      {/* Header */}
      <div data-ev-id="ev_5400ba49b4" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div data-ev-id="ev_8bd8294abd">
          <h2 data-ev-id="ev_925261fa08" className="text-xl font-bold text-white">ניהול הרשאות</h2>
          <p data-ev-id="ev_0aba1a68eb" className="text-zinc-400 text-sm mt-1">ניהול משתמשים ותפקידים במערכת</p>
        </div>
        <button data-ev-id="ev_04639499e3"
        onClick={() => setShowPermissions(!showPermissions)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors">

          <Key className="w-4 h-4" />
          מפת הרשאות
        </button>
      </div>

      {/* Permissions Map */}
      <AnimatePresence>
        {showPermissions &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">

            <div data-ev-id="ev_69f7ebb21e" className="p-5">
              <h3 data-ev-id="ev_39ccd73172" className="font-bold text-white mb-4">מפת הרשאות לפי תפקיד</h3>
              <div data-ev-id="ev_385cc748ce" className="overflow-x-auto">
                <table data-ev-id="ev_de9703ad19" className="w-full">
                  <thead data-ev-id="ev_5049d5c646">
                    <tr data-ev-id="ev_5799978b54" className="border-b border-zinc-800">
                      <th data-ev-id="ev_fbce7bd463" className="text-right text-sm font-medium text-zinc-400 pb-3 pr-2">הרשאה</th>
                      {Object.entries(ROLE_DETAILS).map(([key, role]) =>
                    <th data-ev-id="ev_56a967420a" key={key} className="text-center text-sm font-medium pb-3 px-4">
                          <span data-ev-id="ev_0fbbc47e41" className={roleColorClasses[key as keyof typeof roleColorClasses].split(' ')[1]}>
                            {role.name}
                          </span>
                        </th>
                    )}
                    </tr>
                  </thead>
                  <tbody data-ev-id="ev_3a8fa6d8f3">
                    {PERMISSIONS.map((permission) =>
                  <tr data-ev-id="ev_1cd3f20964" key={permission.id} className="border-b border-zinc-800/50">
                        <td data-ev-id="ev_20ab6939c6" className="py-3 pr-2">
                          <div data-ev-id="ev_28867b93c2">
                            <p data-ev-id="ev_b902203db0" className="text-sm font-medium text-white">{permission.name}</p>
                            <p data-ev-id="ev_83e49ca5a8" className="text-xs text-zinc-500">{permission.description}</p>
                          </div>
                        </td>
                        {Object.keys(ROLE_DETAILS).map((role) =>
                    <td data-ev-id="ev_ff7825d5b5" key={role} className="text-center py-3">
                            {permission.roles.includes(role) ?
                      <Check className="w-5 h-5 text-green-400 mx-auto" /> :

                      <X className="w-5 h-5 text-zinc-600 mx-auto" />
                      }
                          </td>
                    )}
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>

      {/* Role Stats */}
      <div data-ev-id="ev_e5ca32d263" className="grid grid-cols-3 gap-4">
        {Object.entries(ROLE_DETAILS).map(([key, role]) => {
          const count = users.filter((u) => u.role === key).length;
          const Icon = role.icon;

          return (
            <button data-ev-id="ev_77aef3251f"
            key={key}
            onClick={() => setSelectedRole(selectedRole === key ? null : key)}
            className={`p-4 rounded-2xl border transition-all ${
            selectedRole === key ?
            roleColorClasses[key as keyof typeof roleColorClasses] :
            'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`
            }>

              <div data-ev-id="ev_f43869c23b" className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${
                selectedRole === key ?
                roleColorClasses[key as keyof typeof roleColorClasses].split(' ')[1] :
                'text-zinc-400'}`
                } />
                <div data-ev-id="ev_7f16708f20" className="text-right">
                  <p data-ev-id="ev_03d882d271" className="font-bold text-white text-lg">{count}</p>
                  <p data-ev-id="ev_a62284c033" className="text-sm text-zinc-400">{role.name}</p>
                </div>
              </div>
            </button>);

        })}
      </div>

      {/* Search */}
      <div data-ev-id="ev_694d553e09" className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input data-ev-id="ev_44863ee227"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="חיפוש משתמשים..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50" />

      </div>

      {/* Users List */}
      <div data-ev-id="ev_56318f10fc" className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loading ?
        <div data-ev-id="ev_3415ba7d46" className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
          </div> :
        filteredUsers.length === 0 ?
        <div data-ev-id="ev_1693070efb" className="text-center py-12 text-zinc-500">
            לא נמצאו משתמשים
          </div> :

        <div data-ev-id="ev_3e2a369ec0" className="divide-y divide-zinc-800">
            {filteredUsers.map((user) => {
            const roleDetails = ROLE_DETAILS[user.role];
            const Icon = roleDetails.icon;

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-4 hover:bg-zinc-800/30 transition-colors">

                  <div data-ev-id="ev_329ef5c4d7" className="flex items-center justify-between">
                    <div data-ev-id="ev_c6b59ae2fb" className="flex items-center gap-4">
                      <div data-ev-id="ev_51f365c67f" className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                        {user.full_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div data-ev-id="ev_1447ca623a">
                        <p data-ev-id="ev_df6d20389c" className="font-medium text-white">{user.full_name || 'משתמש'}</p>
                        <p data-ev-id="ev_3be43a6d72" className="text-sm text-zinc-400">{user.email}</p>
                      </div>
                    </div>
                    
                    <div data-ev-id="ev_3d6f5ea63b" className="flex items-center gap-3">
                      <span data-ev-id="ev_fe3cec4c99" className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border ${roleColorClasses[user.role]}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {roleDetails.name}
                      </span>
                      
                      <button data-ev-id="ev_62a97270e2"
                    onClick={() => {
                      setEditingUser(user);
                      setShowUserModal(true);
                    }}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">

                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>);

          })}
          </div>
        }
      </div>

      {/* Edit User Modal */}
      <AnimatePresence>
        {showUserModal && editingUser &&
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUserModal(false)}>

            <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">

              <div data-ev-id="ev_c6b4f2b830" className="flex items-center justify-between mb-6">
                <h3 data-ev-id="ev_3eba67cb7a" className="text-lg font-bold text-white">עריכת משתמש</h3>
                <button data-ev-id="ev_9bd160dc40"
              onClick={() => setShowUserModal(false)}
              className="p-1 text-zinc-400 hover:text-white">

                  <X className="w-5 h-5" />
                </button>
              </div>

              <div data-ev-id="ev_ba2cb33c50" className="flex flex-col gap-4">
                <div data-ev-id="ev_bedd27a669" className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                  <div data-ev-id="ev_6e648eeede" className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                    {editingUser.full_name?.[0] || editingUser.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div data-ev-id="ev_fcbdaa54d3">
                    <p data-ev-id="ev_103029d33b" className="font-medium text-white">{editingUser.full_name || 'משתמש'}</p>
                    <p data-ev-id="ev_49c00731c3" className="text-sm text-zinc-400">{editingUser.email}</p>
                  </div>
                </div>

                <div data-ev-id="ev_9d59c6190a">
                  <label data-ev-id="ev_6a9badc0c3" className="block text-sm font-medium text-zinc-300 mb-2">תפקיד</label>
                  <div data-ev-id="ev_f321df5409" className="flex flex-col gap-2">
                    {Object.entries(ROLE_DETAILS).map(([key, role]) => {
                    const Icon = role.icon;
                    const isSelected = editingUser.role === key;

                    return (
                      <button data-ev-id="ev_82ec31f8bd"
                      key={key}
                      onClick={() => setEditingUser({ ...editingUser, role: key as 'admin' | 'editor' | 'viewer' })}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isSelected ?
                      roleColorClasses[key as keyof typeof roleColorClasses] :
                      'border-zinc-700 hover:border-zinc-600'}`
                      }>

                          <Icon className={`w-5 h-5 ${
                        isSelected ?
                        roleColorClasses[key as keyof typeof roleColorClasses].split(' ')[1] :
                        'text-zinc-400'}`
                        } />
                          <div data-ev-id="ev_b3033fa349" className="text-right flex-1">
                            <p data-ev-id="ev_85d886e8f4" className={`font-medium ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                              {role.name}
                            </p>
                            <p data-ev-id="ev_10576268d6" className="text-xs text-zinc-500">{role.description}</p>
                          </div>
                          {isSelected && <Check className="w-5 h-5 text-green-400" />}
                        </button>);

                  })}
                  </div>
                </div>

                {editingUser.role === 'admin' &&
              <div data-ev-id="ev_44282ffeae" className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p data-ev-id="ev_2c66f4bf3b" className="text-sm text-amber-300">
                      למנהלים יש גישה מלאה לכל המערכת כולל מחיקת תוכן והגדרות
                    </p>
                  </div>
              }

                <div data-ev-id="ev_151b2e2db6" className="flex gap-3 mt-2">
                  <button data-ev-id="ev_8bac9d3dc1"
                onClick={() => setShowUserModal(false)}
                className="flex-1 px-4 py-2.5 bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-colors">

                    ביטול
                  </button>
                  <button data-ev-id="ev_520e32c235"
                onClick={() => updateUserRole(editingUser.id, editingUser.role)}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-bold rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50">

                    {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'שמירה'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </div>);

}