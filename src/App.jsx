/*
DevOps Portfolio - Single-file React component (Tailwind CSS)

How to use
1. Create a React app (Vite recommended):
   npm create vite@latest my-portfolio --template react
2. Install Tailwind CSS (follow Tailwind docs) or use a CDN in index.html for quick test.
3. Replace App.jsx content with this file (or import the component).
4. Start dev server: npm install && npm run dev

Features included
- Responsive grid of project cards
- Filters by category (DevOps, Minor, Major) and tags
- Search by title/description
- Project detail modal with links (GitHub / Live)
- Add new project form (data saved to localStorage)
- Export/Import JSON for backup
- Mark project as Major/Minor

Notes
- This is a single-file React component for quick preview. For production, split into components and add routing.
- Uses Tailwind utility classes. If not using Tailwind, adapt the classNames or add your own CSS.
- No external UI libs required.

*/

import React, { useEffect, useState } from 'react';

const SAMPLE_PROJECTS = [
  {
    id: 'p1',
    title: 'Apache in Docker with Persistent Volume',
    short: 'Run httpd:bullseye with host-mounted /home/laauser/localindex and host port 20020',
    description:
      'Containerized Apache web server using Docker. Demonstrates volume mounts for persistent storage, port mapping, and SELinux awareness. Good beginner DevOps project.',
    category: 'DevOps',
    level: 'Minor',
    tags: ['docker', 'apache', 'volumes'],
    github: '',
    live: '',
    image: '',
  },
  {
    id: 'p2',
    title: 'IoT Plant Watering System',
    short: 'Automated watering using sensors and microcontroller',
    description:
      'An IoT project that measures soil moisture and waters plants using a relay and water pump. Includes a web dashboard and scheduling.',
    category: 'IoT',
    level: 'Major',
    tags: ['iot', 'embedded', 'raspberry-pi'],
    github: '',
    live: '',
    image: '',
  },
];

export default function PortfolioApp() {
  const [projects, setProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('devops_projects');
      return stored ? JSON.parse(stored) : SAMPLE_PROJECTS;
    } catch (e) {
      return SAMPLE_PROJECTS;
    }
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem('devops_projects', JSON.stringify(projects));
  }, [projects]);

  function addProject(p) {
    setProjects(prev => [p, ...prev]);
  }

  function deleteProject(id) {
    if (!confirm('Delete this project?')) return;
    setProjects(prev => prev.filter(x => x.id !== id));
  }

  function exportJSON() {
    const dataStr = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const obj = JSON.parse(e.target.result);
        if (Array.isArray(obj)) setProjects(obj);
        else alert('Invalid JSON format');
      } catch (err) {
        alert('Failed to parse JSON');
      }
    };
    reader.readAsText(file);
  }

  const filtered = projects.filter(p => {
    const matchQuery = (p.title + ' ' + p.short + ' ' + p.description + ' ' + (p.tags || []).join(' '))
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    const matchLevel = level === 'All' || p.level === level;
    return matchQuery && matchCat && matchLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">DevOps Project Portfolio</h1>
            <p className="text-sm text-gray-600 mt-1">Showcase your projects — minor to major</p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowForm(s => !s)}
              className="px-3 py-2 bg-blue-600 text-white rounded shadow-sm hover:opacity-95"
            >
              {showForm ? 'Close' : 'Add Project'}
            </button>

            <button
              onClick={exportJSON}
              className="px-3 py-2 bg-gray-800 text-white rounded shadow-sm hover:opacity-95"
            >
              Export JSON
            </button>

            <label className="px-3 py-2 bg-white border rounded cursor-pointer text-sm">
              Import
              <input
                type="file"
                accept="application/json"
                className="sr-only"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) importJSON(e.target.files[0]);
                }}
              />
            </label>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex gap-2 items-center">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects..."
              className="px-3 py-2 border rounded w-64"
            />

            <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border rounded">
              <option>All</option>
              {[...new Set(projects.map(p => p.category))].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2 border rounded">
              <option>All</option>
              <option>Minor</option>
              <option>Major</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">Projects: <strong>{projects.length}</strong> • Showing: <strong>{filtered.length}</strong></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {showForm && (
          <AddProjectForm
            onAdd={p => {
              addProject(p);
              setShowForm(false);
            }}
          />
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <article key={p.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.short}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="px-2 py-1 border rounded text-xs">{p.level}</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {(p.tags || []).map(t => (
                  <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded">{t}</span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => setSelected(p)} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">View</button>
                <a href={p.github || '#'} target="_blank" rel="noreferrer" className={`px-3 py-2 border rounded text-sm ${p.github ? '' : 'opacity-50 pointer-events-none'}`}>
                  GitHub
                </a>
                <a href={p.live || '#'} target="_blank" rel="noreferrer" className={`px-3 py-2 border rounded text-sm ${p.live ? '' : 'opacity-50 pointer-events-none'}`}>
                  Live
                </a>
                <button onClick={() => deleteProject(p.id)} className="ml-auto text-sm text-red-600">Delete</button>
              </div>
            </article>
          ))}
        </section>
      </main>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 relative">
            <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-gray-600">✕</button>
            <h2 className="text-2xl font-bold">{selected.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{selected.short}</p>
            <div className="mt-4 text-gray-800 whitespace-pre-line">{selected.description}</div>
            <div className="mt-4 flex gap-2">
              <a href={selected.github || '#'} target="_blank" rel="noreferrer" className={`px-3 py-2 border rounded ${selected.github ? '' : 'opacity-50 pointer-events-none'}`}>
                GitHub
              </a>
              <a href={selected.live || '#'} target="_blank" rel="noreferrer" className={`px-3 py-2 border rounded ${selected.live ? '' : 'opacity-50 pointer-events-none'}`}>
                Live
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddProjectForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [short, setShort] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DevOps');
  const [level, setLevel] = useState('Minor');
  const [tags, setTags] = useState('');
  const [github, setGithub] = useState('');
  const [live, setLive] = useState('');

  function submit(e) {
    e.preventDefault();
    if (!title || !short) return alert('Title and short description required');
    const p = {
      id: Date.now().toString(),
      title,
      short,
      description,
      category,
      level,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      github,
      live,
      image: '',
    };
    onAdd(p);
    setTitle('');
    setShort('');
    setDescription('');
    setTags('');
    setGithub('');
    setLive('');
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <h3 className="font-semibold mb-2">Add New Project</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title" className="px-3 py-2 border rounded" />
        <input value={short} onChange={e => setShort(e.target.value)} placeholder="Short description" className="px-3 py-2 border rounded" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 border rounded">
          <option>DevOps</option>
          <option>IoT</option>
          <option>Web</option>
          <option>Other</option>
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2 border rounded">
          <option>Minor</option>
          <option>Major</option>
        </select>
        <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tags (comma separated)" className="px-3 py-2 border rounded md:col-span-2" />
        <input value={github} onChange={e => setGithub(e.target.value)} placeholder="GitHub URL" className="px-3 py-2 border rounded md:col-span-2" />
        <input value={live} onChange={e => setLive(e.target.value)} placeholder="Live URL" className="px-3 py-2 border rounded md:col-span-2" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Full description" className="px-3 py-2 border rounded md:col-span-2" />
      </div>
      <div className="mt-3 flex gap-2">
        <button type="submit" className="px-3 py-2 bg-green-600 text-white rounded">Add Project</button>
        <button type="button" onClick={() => {
          setTitle(''); setShort(''); setDescription(''); setTags(''); setGithub(''); setLive('');
        }} className="px-3 py-2 border rounded">Reset</button>
      </div>
    </form>
  );
}
