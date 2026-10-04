'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { ContentRow, Lang, localized } from '../../lib/types';

type Field = { key: string; label: string; kind?: 'text' | 'number' | 'boolean' | 'date' | 'json' | 'translation' | 'textarea' };
type Collection = { label: string; singular: string; fields: Field[] };

const translation = (key: string, label: string): Field => ({ key, label, kind: 'translation' });
const json = (key: string, label: string): Field => ({ key, label, kind: 'json' });
const text = (key: string, label: string): Field => ({ key, label });
const bool = (key: string, label: string): Field => ({ key, label, kind: 'boolean' });

const collections: Record<string, Collection> = {
  projects: { label: 'Projects', singular: 'project', fields: [translation('title', 'Title'), translation('summary', 'Short summary'), translation('problem', 'Problem'), translation('approach', 'Approach'), json('tools', 'Tools (JSON array)'), text('domain', 'Domain'), bool('featured', 'Featured'), bool('published', 'Published'), { key: 'impact', label: 'Impact (%)', kind: 'number' }, { key: 'order', label: 'Display order', kind: 'number' }, json('metrics', 'Metrics (JSON array)'), json('gallery', 'Gallery URLs (JSON array)'), text('embed_url', 'Embed URL'), text('github_url', 'GitHub URL'), text('demo_url', 'Live demo URL'), text('file_url', 'Download URL'), json('chart_data', 'Interactive chart JSON')] },
  skills: { label: 'Skills', singular: 'skill', fields: [translation('name', 'Name'), text('category', 'Category'), text('icon', 'Icon / emoji'), { key: 'proficiency', label: 'Proficiency (0–100)', kind: 'number' }, bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
  experience: { label: 'Experience', singular: 'experience entry', fields: [text('company', 'Company'), translation('role', 'Role'), json('achievements', 'Achievements (JSON array)'), { key: 'start_date', label: 'Start date', kind: 'date' }, { key: 'end_date', label: 'End date', kind: 'date' }, bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
  certificates: { label: 'Certificates', singular: 'certificate', fields: [translation('name', 'Name'), text('issuer', 'Issuer'), { key: 'issued_date', label: 'Issued date', kind: 'date' }, text('credential_id', 'Credential ID'), text('verify_url', 'Verify URL'), text('image_url', 'Image URL'), bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
  education: { label: 'Education', singular: 'education entry', fields: [text('institution', 'Institution'), translation('degree', 'Degree'), { key: 'start_date', label: 'Start date', kind: 'date' }, { key: 'end_date', label: 'End date', kind: 'date' }, bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
  testimonials: { label: 'Testimonials', singular: 'testimonial', fields: [translation('quote', 'Quote'), text('author', 'Author'), text('role', 'Author role'), text('avatar_url', 'Avatar URL'), bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
  blog: { label: 'Blog', singular: 'post', fields: [translation('title', 'Title'), translation('body', 'Body'), text('slug', 'Slug'), text('cover_url', 'Cover image URL'), bool('published', 'Published'), { key: 'order', label: 'Display order', kind: 'number' }] },
};

const profileFields: Field[] = [translation('name', 'Name'), translation('title', 'Professional title'), translation('bio', 'Bio'), text('photo_url', 'Photo URL'), text('cv_url', 'CV URL'), text('location', 'Location'), json('languages', 'Spoken languages (JSON array)'), text('availability', 'Availability'), json('contacts', 'Contacts (JSON object)'), json('counters', 'Counters (JSON object)')];
const settingsFields: Field[] = [text('accent_color', 'Accent colour'), text('default_language', 'Default language'), text('default_theme', 'Default theme'), json('sections', 'Manual section visibility (JSON object)'), text('seo_title', 'SEO title'), { key: 'seo_description', label: 'SEO description', kind: 'textarea' }, text('favicon_url', 'Favicon URL'), text('analytics_id', 'Google Analytics ID'), json('iframe_allowlist', 'Embed allowlist (JSON array)')];
const languages: Lang[] = ['en', 'ru', 'uz'];

function parse(value: FormDataEntryValue | null, field: Field) {
  const raw = String(value ?? '').trim();
  if (field.kind === 'boolean') return raw === 'on';
  if (field.kind === 'number') return raw === '' ? 0 : Number(raw);
  if (field.kind === 'json') { try { return raw ? JSON.parse(raw) : field.key === 'contacts' || field.key === 'counters' ? {} : []; } catch { throw new Error(`“${field.label}” must be valid JSON.`); } }
  return raw || null;
}

function rowTitle(row: ContentRow) { return localized(row.title ?? row.name ?? row.role ?? row.degree, 'en') || String(row.company ?? row.institution ?? row.author ?? 'Untitled'); }

export default function Admin() {
  const router = useRouter();
  const [table, setTable] = useState('projects'); const [rows, setRows] = useState<ContentRow[]>([]);
  const [editing, setEditing] = useState<ContentRow | null>(null); const [mode, setMode] = useState<'content' | 'profile' | 'settings' | 'messages'>('content');
  const [status, setStatus] = useState(''); const [busy, setBusy] = useState(false); const [language, setLanguage] = useState<Lang>('en');
  const config = collections[table];
  const fields = useMemo(() => mode === 'profile' ? profileFields : mode === 'settings' ? settingsFields : mode === 'content' ? config.fields : [], [mode, config]);

  const load = async () => {
    if (!supabase) return;
    const source = mode === 'content' ? table : mode === 'messages' ? 'messages' : mode === 'profile' ? 'profile' : 'site_settings';
    let query = supabase.from(source).select('*');
    if (mode === 'content') query = query.order('order');
    if (mode === 'messages') query = query.order('created_at', { ascending: false });
    const { data, error } = await query;
    setRows((data ?? []) as ContentRow[]); setStatus(error ? `Could not load: ${error.message}` : '');
  };

  useEffect(() => { if (!supabase) { router.replace('/admin/login'); return; } supabase.auth.getUser().then(({ data }) => { if (!data.user) router.replace('/admin/login'); else void load(); }); }, [table, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return; setBusy(true); setStatus('');
    try {
      const form = new FormData(event.currentTarget); const value: Record<string, unknown> = {};
      for (const field of fields) {
        if (field.kind === 'translation') {
          const old = (editing?.[field.key] ?? {}) as Record<string, string>;
          value[field.key] = { ...old, ...Object.fromEntries(languages.map((lang) => [lang, String(form.get(`${field.key}.${lang}`) ?? '').trim()])) };
        } else value[field.key] = parse(form.get(field.key), field);
      }
      const source = mode === 'content' ? table : mode === 'profile' ? 'profile' : 'site_settings';
      const result = editing?.id ? await supabase.from(source).update(value).eq('id', editing.id).select().single() : await supabase.from(source).insert(value).select().single();
      if (result.error) throw result.error;
      setStatus('Saved. Published changes are now available to the public site.'); setEditing(null); await load();
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Save failed.'); } finally { setBusy(false); }
  }

  async function remove(row: ContentRow) { if (!supabase || !confirm(`Delete “${rowTitle(row)}”? This cannot be undone.`)) return; const source = mode === 'content' ? table : mode === 'messages' ? 'messages' : ''; if (!source) return; setBusy(true); const { error } = await supabase.from(source).delete().eq('id', row.id); setBusy(false); setStatus(error ? error.message : 'Deleted.'); await load(); }
  async function signOut() { await supabase?.auth.signOut(); router.push('/admin/login'); }

  return <main className="admin"><header><a className="brand" href="/">signal<span>.</span> admin</a><button type="button" onClick={signOut}>Sign out</button></header><h1>Content manager</h1><p>Manage every portfolio section. English is used when a Russian or Uzbek translation is empty.</p>
    <div className="admin-tabs"><button className={mode === 'content' ? 'chosen' : ''} onClick={() => setMode('content')}>Content</button><button className={mode === 'profile' ? 'chosen' : ''} onClick={() => setMode('profile')}>Profile</button><button className={mode === 'settings' ? 'chosen' : ''} onClick={() => setMode('settings')}>Site settings</button><button className={mode === 'messages' ? 'chosen' : ''} onClick={() => setMode('messages')}>Messages</button></div>
    {mode === 'content' && <div className="chips">{Object.entries(collections).map(([key, collection]) => <button type="button" className={key === table ? 'chosen' : ''} onClick={() => { setTable(key); setEditing(null); }} key={key}>{collection.label}</button>)}</div>}
    {mode !== 'messages' && <button type="button" className="button" onClick={() => setEditing({ id: '' })}>Add {mode === 'content' ? config.singular : mode === 'profile' ? 'profile' : 'site settings'}</button>}
    {status && <p className="admin-status" role="status">{status}</p>}
    <div className="areas">{rows.map((row) => <article key={row.id}><h2>{rowTitle(row)}</h2><p>{mode === 'messages' ? `${String(row.email)} · ${String(row.message)}` : row.published ? 'Published' : 'Draft'}</p>{mode !== 'messages' && <button type="button" onClick={() => setEditing(row)}>Edit</button>}<button type="button" onClick={() => void remove(row)} disabled={busy}>Delete</button></article>)}</div>
    {!rows.length && <div className="empty-admin"><strong>{mode === 'messages' ? 'No messages yet.' : `No ${mode === 'content' ? config.label.toLowerCase() : mode} yet.`}</strong><span>{mode === 'messages' ? 'Contact form submissions appear here.' : 'Add your first item — drafts stay private until you publish them.'}</span></div>}
    {editing && <div className="modal" role="dialog" aria-modal="true"><form className="modal-form" onSubmit={save}><button type="button" onClick={() => setEditing(null)}>Close</button><h2>{editing.id ? 'Edit' : 'Add'} {mode === 'content' ? config.singular : mode}</h2><div className="langs">{languages.map((lang) => <button type="button" className={language === lang ? 'active' : ''} onClick={() => setLanguage(lang)} key={lang}>{lang}</button>)}</div>{fields.map((field) => field.kind === 'translation' ? <fieldset className="translation-fields" key={field.key}><legend>{field.label}</legend>{languages.map((lang) => <label key={lang} hidden={language !== lang}>{lang.toUpperCase()}<textarea name={`${field.key}.${lang}`} defaultValue={localized(editing[field.key], lang)} /></label>)}</fieldset> : <label key={field.key}>{field.label}{field.kind === 'boolean' ? <input name={field.key} type="checkbox" defaultChecked={Boolean(editing[field.key])} /> : field.kind === 'textarea' ? <textarea name={field.key} defaultValue={String(editing[field.key] ?? '')} /> : <input name={field.key} type={field.kind === 'date' ? 'date' : field.kind === 'number' ? 'number' : 'text'} defaultValue={field.kind === 'json' ? JSON.stringify(editing[field.key] ?? (field.key === 'contacts' || field.key === 'counters' ? {} : []), null, 2) : String(editing[field.key] ?? '')} />}</label>)}<button className="button" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button></form></div>}
  </main>;
}
