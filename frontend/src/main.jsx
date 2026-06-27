import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LogOut, RefreshCcw, Search, Star, Store, Users } from 'lucide-react';
import { api, clearSession, getSession, qs, saveSession } from './api.js';
import './styles.css';

const emptySignup = { name: '', email: '', address: '', password: '' };
const demoAccounts = [
  ['Admin', 'admin@stores.test', 'Admin@123'],
  ['User', 'user@stores.test', 'User@123'],
  ['Owner', 'owner@stores.test', 'Owner@123']
];

function App() {
  const [session, setSession] = useState(getSession());
  const [authMode, setAuthMode] = useState('login');
  const [message, setMessage] = useState('');

  function onAuthed(nextSession) {
    saveSession(nextSession);
    setSession(nextSession);
    setMessage('');
  }

  function logout() {
    clearSession();
    setSession(null);
  }

  if (!session) {
    return (
      <AuthScreen
        mode={authMode}
        setMode={setAuthMode}
        onAuthed={onAuthed}
        message={message}
        setMessage={setMessage}
      />
    );
  }

  return <Dashboard session={session} logout={logout} />;
}

function AuthScreen({ mode, setMode, onAuthed, message, setMessage }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [signup, setSignup] = useState(emptySignup);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const data =
        mode === 'signup'
          ? await api('/auth/signup', { method: 'POST', body: signup })
          : await api('/auth/login', { method: 'POST', body: form });
      onAuthed(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">FullStack Intern Coding Challenge</p>
          <h1>Store Rating Platform</h1>
          <p className="muted">
            One login, three roles, searchable store ratings, admin management, and owner analytics.
          </p>
        </div>

        <div className="segmented">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>
            Sign up
          </button>
        </div>

        <form onSubmit={submit} className="stack">
          {mode === 'signup' && (
            <>
              <Field label="Name" value={signup.name} onChange={(name) => setSignup({ ...signup, name })} />
              <Field
                label="Address"
                value={signup.address}
                onChange={(address) => setSignup({ ...signup, address })}
              />
            </>
          )}
          <Field
            label="Email"
            type="email"
            value={mode === 'signup' ? signup.email : form.email}
            onChange={(email) =>
              mode === 'signup' ? setSignup({ ...signup, email }) : setForm({ ...form, email })
            }
          />
          <Field
            label="Password"
            type="password"
            value={mode === 'signup' ? signup.password : form.password}
            onChange={(password) =>
              mode === 'signup'
                ? setSignup({ ...signup, password })
                : setForm({ ...form, password })
            }
          />
          {message && <p className="error">{message}</p>}
          <button className="primary" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Login'}
          </button>
        </form>

        <div className="demo-grid">
          {demoAccounts.map(([label, email, password]) => (
            <button
              key={email}
              type="button"
              onClick={() => {
                setMode('login');
                setForm({ email, password });
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

function Dashboard({ session, logout }) {
  const { user } = session;
  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">{user.role}</p>
          <h1>{user.name}</h1>
        </div>
        <button className="icon-button" onClick={logout} title="Log out">
          <LogOut size={18} />
          Logout
        </button>
      </header>

      {user.role === 'ADMIN' && <AdminDashboard />}
      {user.role === 'USER' && <UserDashboard />}
      {user.role === 'OWNER' && <OwnerDashboard />}
      <PasswordPanel />
    </main>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [userFilters, setUserFilters] = useState({ name: '', email: '', address: '', role: '', sortBy: 'name', sortDir: 'asc' });
  const [storeFilters, setStoreFilters] = useState({ name: '', email: '', address: '', sortBy: 'name', sortDir: 'asc' });
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'USER' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [message, setMessage] = useState('');

  async function load() {
    const [dashboard, userRows, storeRows] = await Promise.all([
      api('/admin/dashboard'),
      api(`/admin/users${qs(userFilters)}`),
      api(`/admin/stores${qs(storeFilters)}`)
    ]);
    setStats(dashboard);
    setUsers(userRows);
    setStores(storeRows);
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [JSON.stringify(userFilters), JSON.stringify(storeFilters)]);

  async function createUser(event) {
    event.preventDefault();
    setMessage('');
    try {
      await api('/admin/users', { method: 'POST', body: newUser });
      setNewUser({ name: '', email: '', password: '', address: '', role: 'USER' });
      await load();
      setMessage('User created.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function createStore(event) {
    event.preventDefault();
    setMessage('');
    try {
      await api('/admin/stores', { method: 'POST', body: { ...newStore, ownerId: newStore.ownerId || null } });
      setNewStore({ name: '', email: '', address: '', ownerId: '' });
      await load();
      setMessage('Store created.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="grid-layout">
      <div className="metrics">
        <Metric icon={<Users />} label="Users" value={stats?.users ?? '-'} />
        <Metric icon={<Store />} label="Stores" value={stats?.stores ?? '-'} />
        <Metric icon={<Star />} label="Ratings" value={stats?.ratings ?? '-'} />
      </div>

      {message && <p className={message.includes('.') ? 'success' : 'error'}>{message}</p>}

      <Panel title="Create user">
        <form className="form-grid" onSubmit={createUser}>
          <Field label="Name" value={newUser.name} onChange={(name) => setNewUser({ ...newUser, name })} />
          <Field label="Email" type="email" value={newUser.email} onChange={(email) => setNewUser({ ...newUser, email })} />
          <Field label="Address" value={newUser.address} onChange={(address) => setNewUser({ ...newUser, address })} />
          <Field label="Password" type="password" value={newUser.password} onChange={(password) => setNewUser({ ...newUser, password })} />
          <Select label="Role" value={newUser.role} onChange={(role) => setNewUser({ ...newUser, role })} options={['USER', 'OWNER', 'ADMIN']} />
          <button className="primary">Add user</button>
        </form>
      </Panel>

      <Panel title="Create store">
        <form className="form-grid" onSubmit={createStore}>
          <Field label="Name" value={newStore.name} onChange={(name) => setNewStore({ ...newStore, name })} />
          <Field label="Email" type="email" value={newStore.email} onChange={(email) => setNewStore({ ...newStore, email })} />
          <Field label="Address" value={newStore.address} onChange={(address) => setNewStore({ ...newStore, address })} />
          <Select
            label="Owner"
            value={newStore.ownerId}
            onChange={(ownerId) => setNewStore({ ...newStore, ownerId })}
            options={['', ...users.filter((user) => user.role === 'OWNER').map((user) => String(user.id))]}
            labels={{ '': 'Unassigned', ...Object.fromEntries(users.map((user) => [user.id, user.name])) }}
          />
          <button className="primary">Add store</button>
        </form>
      </Panel>

      <Panel title="Users">
        <Filters filters={userFilters} setFilters={setUserFilters} includeRole includeEmail />
        <DataTable
          columns={['name', 'email', 'address', 'role', 'owner_rating']}
          rows={users}
          sort={userFilters}
          setSort={setUserFilters}
        />
      </Panel>

      <Panel title="Stores">
        <Filters filters={storeFilters} setFilters={setStoreFilters} includeEmail />
        <DataTable
          columns={['name', 'email', 'address', 'rating']}
          rows={stores}
          sort={storeFilters}
          setSort={setStoreFilters}
        />
      </Panel>
    </section>
  );
}

function UserDashboard() {
  const [filters, setFilters] = useState({ name: '', address: '', sortBy: 'name', sortDir: 'asc' });
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState('');

  async function load() {
    setStores(await api(`/stores${qs(filters)}`));
  }

  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, [JSON.stringify(filters)]);

  async function rate(storeId, rating) {
    try {
      await api(`/stores/${storeId}/rating`, { method: 'PUT', body: { rating } });
      await load();
      setMessage('Rating saved.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="grid-layout">
      {message && <p className={message.includes('.') ? 'success' : 'error'}>{message}</p>}
      <Panel title="Registered stores">
        <Filters filters={filters} setFilters={setFilters} />
        <div className="store-list">
          {stores.map((store) => (
            <article className="store-card" key={store.id}>
              <div>
                <h3>{store.name}</h3>
                <p>{store.address}</p>
              </div>
              <div className="rating-row">
                <span>Overall: {store.overall_rating ?? 'No ratings'}</span>
                <StarPicker value={store.user_rating || 0} onChange={(rating) => rate(store.id, rating)} />
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function OwnerDashboard() {
  const [data, setData] = useState({ stores: [], ratings: [] });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/owner/dashboard').then(setData).catch((error) => setMessage(error.message));
  }, []);

  return (
    <section className="grid-layout">
      {message && <p className="error">{message}</p>}
      <div className="metrics">
        {data.stores.map((store) => (
          <Metric key={store.id} icon={<Store />} label={store.name} value={store.average_rating ?? 'No ratings'} />
        ))}
      </div>
      <Panel title="Ratings received">
        <DataTable columns={['store_name', 'user_name', 'user_email', 'user_address', 'rating']} rows={data.ratings} />
      </Panel>
    </section>
  );
}

function PasswordPanel() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    try {
      await api('/auth/password', { method: 'PATCH', body: form });
      setForm({ currentPassword: '', newPassword: '' });
      setMessage('Password updated.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <Panel title="Update password">
      <form className="form-grid" onSubmit={submit}>
        <Field label="Current password" type="password" value={form.currentPassword} onChange={(currentPassword) => setForm({ ...form, currentPassword })} />
        <Field label="New password" type="password" value={form.newPassword} onChange={(newPassword) => setForm({ ...form, newPassword })} />
        <button className="secondary">Update</button>
      </form>
      {message && <p className={message.includes('.') ? 'success' : 'error'}>{message}</p>}
    </Panel>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <label>
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ label, value, onChange, options, labels = {} }) {
  return (
    <label>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {labels[option] || option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, children }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      {React.cloneElement(icon, { size: 22 })}
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function Filters({ filters, setFilters, includeRole = false, includeEmail = false }) {
  return (
    <div className="filters">
      <div className="searchbox">
        <Search size={16} />
        <input placeholder="Name" value={filters.name || ''} onChange={(event) => setFilters({ ...filters, name: event.target.value })} />
      </div>
      {includeEmail && (
        <div className="searchbox">
          <Search size={16} />
          <input placeholder="Email" value={filters.email || ''} onChange={(event) => setFilters({ ...filters, email: event.target.value })} />
        </div>
      )}
      <div className="searchbox">
        <Search size={16} />
        <input placeholder="Address" value={filters.address || ''} onChange={(event) => setFilters({ ...filters, address: event.target.value })} />
      </div>
      {includeRole && (
        <select value={filters.role || ''} onChange={(event) => setFilters({ ...filters, role: event.target.value })}>
          <option value="">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="OWNER">Owner</option>
        </select>
      )}
      <button className="icon-button" onClick={() => setFilters({ ...filters })} title="Refresh">
        <RefreshCcw size={16} />
      </button>
    </div>
  );
}

function DataTable({ columns, rows, sort, setSort }) {
  function label(column) {
    return column.replaceAll('_', ' ');
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>
                {setSort ? (
                  <button
                    className="table-sort"
                    onClick={() =>
                      setSort({
                        ...sort,
                        sortBy: column,
                        sortDir: sort.sortBy === column && sort.sortDir === 'asc' ? 'desc' : 'asc'
                      })
                    }
                  >
                    {label(column)}
                  </button>
                ) : (
                  label(column)
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column}>{row[column] ?? '-'}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StarPicker({ value, onChange }) {
  return (
    <div className="stars" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={rating <= value ? 'filled' : ''}
          onClick={() => onChange(rating)}
          title={`${rating} star`}
        >
          <Star size={18} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
