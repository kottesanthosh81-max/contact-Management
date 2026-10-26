import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import config from './config.json';
import './style.css';

function App() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({});
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8009').replace(/\/+$/, '');
  const api = `${apiBase}/api/${config.key}`;

  async function load() {
    try {
      const response = await fetch(api);
      if (!response.ok) throw Error('API returned ' + response.status);
      setRows(await response.json());
    } catch (error) {
      setMsg('Could not connect to the backend. Start Spring Boot and check MySQL. ' + error.message);
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function change(key, value) {
    setForm({ ...form, [key]: value });
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(edit ? api + '/' + edit : api, {
        method: edit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw Error(data.message || 'Request failed');
      setMsg(edit ? 'Contact updated successfully.' : 'Contact added successfully.');
      setMsgType('success');
      setForm({});
      setEdit(null);
      await load();
    } catch (error) {
      setMsg(error.message);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  }

  function begin(contact) {
    const values = { ...contact };
    delete values.id;
    setForm(values);
    setEdit(contact.id);
    setMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEdit(null);
    setForm({});
    setMsg('');
  }

  async function remove(id) {
    if (!window.confirm('Delete this contact? This action cannot be undone.')) return;
    try {
      const response = await fetch(api + '/' + id, { method: 'DELETE' });
      if (!response.ok) throw Error('Delete failed (' + response.status + ')');
      setMsg('Contact deleted.');
      setMsgType('success');
      await load();
    } catch (error) {
      setMsg(error.message);
      setMsgType('error');
    }
  }

  const query = search.trim().toLowerCase();
  const visible = rows.filter((contact) => JSON.stringify(contact).toLowerCase().includes(query));

  function initials(name) {
    return String(name || '?')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="hero-copy">
          <div className="brand-mark" aria-hidden="true">C</div>
          <div>
            <p className="eyebrow">YOUR PERSONAL DIRECTORY</p>
            <h1>Good connections<br />start here.</h1>
            <p className="hero-description">Keep the people who matter organized and close at hand.</p>
          </div>
        </div>
        <div className="hero-count" aria-label={`${rows.length} contacts saved`}>
          <span className="count-icon" aria-hidden="true">✳</span>
          <span><strong>{rows.length}</strong><small>{rows.length === 1 ? 'contact saved' : 'contacts saved'}</small></span>
        </div>
        <div className="hero-decoration hero-decoration-one" aria-hidden="true" />
        <div className="hero-decoration hero-decoration-two" aria-hidden="true" />
      </header>

      <div className="stats-row" aria-label="Contact summary">
        <div className="stat-card">
          <span className="stat-icon stat-icon-purple" aria-hidden="true">◎</span>
          <span><strong>{rows.length}</strong><small>Total contacts</small></span>
        </div>
        <div className="stat-card">
          <span className="stat-icon stat-icon-mint" aria-hidden="true">⌕</span>
          <span><strong>{visible.length}</strong><small>{query ? 'Search results' : 'Currently shown'}</small></span>
        </div>
      </div>

      {msg && <p className={`notice notice-${msgType}`} role={msgType === 'error' ? 'alert' : 'status'}>{msg}</p>}

      <section className="panel form-panel" aria-labelledby="form-title">
        <div className="section-heading">
          <div className="section-icon" aria-hidden="true">{edit ? '✎' : '+'}</div>
          <div>
            <p className="eyebrow">CONTACT DETAILS</p>
            <h2 id="form-title">{edit ? 'Edit contact' : 'Add someone new'}</h2>
            <p className="section-description">{edit ? 'Update the details below and save your changes.' : 'Add their details so you can find them whenever you need.'}</p>
          </div>
        </div>

        <form onSubmit={save} className="fields">
          {config.fields.map((field) => (
            <label key={field.name}>
              <span>{field.label}<span className="required-mark" aria-hidden="true"> *</span></span>
              {field.type.startsWith('select:') ? (
                <select required value={form[field.name] || ''} onChange={(event) => change(field.name, event.target.value)}>
                  <option value="">Choose an option</option>
                  {field.type.slice(7).split(',').map((value) => <option key={value}>{value}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea required value={form[field.name] || ''} onChange={(event) => change(field.name, event.target.value)} />
              ) : (
                <input
                  required
                  type={field.type}
                  min={field.type === 'number' ? '0' : undefined}
                  step={field.type === 'number' ? 'any' : undefined}
                  placeholder={field.name === 'name' ? 'e.g. Alex Morgan' : field.name === 'phone' ? 'e.g. +1 (555) 010-2040' : field.name === 'email' ? 'e.g. alex@example.com' : ''}
                  value={form[field.name] ?? ''}
                  onChange={(event) => change(field.name, event.target.value)}
                />
              )}
            </label>
          ))}
          <div className="actions">
            <button className="primary-button" disabled={saving}>
              <span aria-hidden="true">{saving ? '…' : edit ? '✓' : '+'}</span>
              {saving ? 'Saving…' : edit ? 'Save changes' : 'Add contact'}
            </button>
            {edit && <button type="button" className="secondary-button" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="panel contacts-panel" aria-labelledby="contacts-title">
        <div className="contacts-heading">
          <div>
            <p className="eyebrow">YOUR DIRECTORY</p>
            <h2 id="contacts-title">All contacts <span className="result-count">{visible.length}</span></h2>
          </div>
          <label className="search-box">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="sr-only">Search contacts</span>
            <input
              type="search"
              placeholder="Search by name, phone, email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
          </label>
        </div>

        {loading ? (
          <div className="empty-state"><span className="loading-dot" />Loading your contacts…</div>
        ) : visible.length > 0 ? (
          <div className="contact-list">
            {visible.map((contact) => (
              <article className="contact-row" key={contact.id}>
                <div className="avatar" aria-hidden="true">{initials(contact.name)}</div>
                <div className="contact-identity">
                  <strong>{String(contact.name || 'Unnamed contact')}</strong>
                  {config.fields.filter((field) => field.name !== 'name').map((field) => (
                    <span className="contact-detail" key={field.name}>
                      <span aria-hidden="true">{field.name === 'email' ? '✉' : field.name === 'phone' ? '↗' : '·'}</span>
                      {String(contact[field.name] ?? '—')}
                    </span>
                  ))}
                </div>
                <div className="row-actions">
                  <button className="icon-button" type="button" onClick={() => begin(contact)} aria-label={`Edit ${contact.name || 'contact'}`} title="Edit contact">✎</button>
                  <button className="icon-button delete-button" type="button" onClick={() => remove(contact.id)} aria-label={`Delete ${contact.name || 'contact'}`} title="Delete contact">⌫</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-illustration" aria-hidden="true">{query ? '⌕' : '♡'}</span>
            <strong>{query ? 'No matches found' : 'Your directory is ready'}</strong>
            <p>{query ? 'Try another name, phone number, or email.' : 'Add your first contact above and they’ll show up here.'}</p>
            {query && <button type="button" className="text-button" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        )}
      </section>

      <footer className="app-footer">
        <span><span className="connection-dot" /> Connected to your private directory</span>
        <span>CONTACTS · <code>/api/{config.key}</code></span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
