'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Grid, Menu, Moon, Rows3, Sun, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContentRow, Lang, localized, Project } from '../lib/types';

type Store = Record<string, ContentRow[]>;

const empty: Store = {
  projects: [],
  skills: [],
  experience: [],
  certificates: [],
  education: [],
  testimonials: [],
  blog: [],
};

const ui = {
  en: {
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    certificates: 'Certificates',
    education: 'Education',
    testimonials: 'Testimonials',
    contact: 'Contact',
    view: 'View projects',
    cv: 'Download CV',
    message: 'Contact me',
    search: 'Search projects...',
    newest: 'Newest',
    impact: 'Most impactful',
    az: 'A-Z',
    all: 'All',
    no: 'No projects match your filters.',
    send: 'Send message',
    name: 'Your name',
    email: 'Email',
    note: 'Tell me about your project',
    sent: 'Thanks, your message has been sent.',
    open: 'Open to work',
    problem: 'Problem',
    approach: 'Approach',
    heroLabel: 'DATA ANALYST / INSIGHT PARTNER',
    heroName: 'Make every',
    heroTitle: 'signal count.',
    heroBio: 'A clear, confident portfolio ready for your first great data story.',
    aboutHeading: 'Clear thinking, useful dashboards and honest analysis.',
    aboutEmpty: 'This portfolio is ready. Add your profile in the admin panel and this section will fill in instantly.',
    skillsHeading: 'Tools, thoughtfully applied.',
    projectsHeading: 'Evidence, not decoration.',
    experienceHeading: 'Experience.',
    certificatesHeading: 'Certificates.',
    educationHeading: 'Education.',
    caseStudy: 'Case study',
    businessImpact: 'Business impact',
    verify: 'Verify',
    certificateAlt: 'Certificate image',
    footer: 'Built for meaningful work.',
  },
  ru: {
    about: 'Обо мне',
    skills: 'Навыки',
    projects: 'Проекты',
    experience: 'Опыт',
    certificates: 'Сертификаты',
    education: 'Образование',
    testimonials: 'Отзывы',
    contact: 'Контакты',
    view: 'Смотреть проекты',
    cv: 'Скачать CV',
    message: 'Связаться',
    search: 'Поиск проектов...',
    newest: 'Сначала новые',
    impact: 'Самые значимые',
    az: 'А-Я',
    all: 'Все',
    no: 'Нет проектов под эти фильтры.',
    send: 'Отправить сообщение',
    name: 'Ваше имя',
    email: 'Email',
    note: 'Расскажите о проекте',
    sent: 'Спасибо, сообщение отправлено.',
    open: 'Открыт к предложениям',
    problem: 'Задача',
    approach: 'Подход',
    heroLabel: 'АНАЛИТИК ДАННЫХ / ПАРТНЁР ПО ИНСАЙТАМ',
    heroName: 'Каждый',
    heroTitle: 'сигнал важен.',
    heroBio: 'Чистое, уверенное портфолио для первой сильной истории на данных.',
    aboutHeading: 'Ясное мышление, полезные дашборды и честная аналитика.',
    aboutEmpty: 'Портфолио уже готово. Добавьте профиль в админке, и этот блок заполнится сразу.',
    skillsHeading: 'Инструменты, применённые с умом.',
    projectsHeading: 'Доказательства, а не декорация.',
    experienceHeading: 'Опыт.',
    certificatesHeading: 'Сертификаты.',
    educationHeading: 'Образование.',
    caseStudy: 'Кейс',
    businessImpact: 'Бизнес-эффект',
    verify: 'Проверить',
    certificateAlt: 'Изображение сертификата',
    footer: 'Создано для осмысленной работы.',
  },
  uz: {
    about: 'Men haqimda',
    skills: 'Ko‘nikmalar',
    projects: 'Loyihalar',
    experience: 'Tajriba',
    certificates: 'Sertifikatlar',
    education: 'Ta’lim',
    testimonials: 'Fikrlar',
    contact: 'Aloqa',
    view: 'Loyihalarni ko‘rish',
    cv: 'CV yuklab olish',
    message: 'Bog‘lanish',
    search: 'Loyihalarni qidirish...',
    newest: 'Eng yangilari',
    impact: 'Eng katta ta’sir',
    az: 'A-Z',
    all: 'Barchasi',
    no: 'Bu filtrlarga mos loyiha topilmadi.',
    send: 'Xabar yuborish',
    name: 'Ismingiz',
    email: 'Email',
    note: 'Loyihangiz haqida yozing',
    sent: 'Rahmat, xabaringiz yuborildi.',
    open: 'Ish takliflariga ochiq',
    problem: 'Muammo',
    approach: 'Yondashuv',
    heroLabel: 'DATA ANALITIK / INSAYT HAMKORI',
    heroName: 'Har bir',
    heroTitle: 'signal muhim.',
    heroBio: 'Ma’lumotlar bilan birinchi kuchli hikoyani ko‘rsatishga tayyor portfolio.',
    aboutHeading: 'Aniq fikr, foydali dashboardlar va halol tahlil.',
    aboutEmpty: 'Portfolio tayyor. Admin panelda profilni qo‘shsangiz, bu bo‘lim darhol to‘ladi.',
    skillsHeading: 'Vositalar puxta qo‘llanganda.',
    projectsHeading: 'Bezak emas, isbot.',
    experienceHeading: 'Tajriba.',
    certificatesHeading: 'Sertifikatlar.',
    educationHeading: 'Ta’lim.',
    caseStudy: 'Keys',
    businessImpact: 'Biznes ta’siri',
    verify: 'Tekshirish',
    certificateAlt: 'Sertifikat rasmi',
    footer: 'Mazmunli ishlar uchun yaratilgan.',
  },
};

type UiText = (typeof ui)['en'];
const dates = (row: ContentRow) => [row.start_date, row.end_date].filter(Boolean).join(' - ');

export default function Portfolio() {
  const [lang, setLang] = useState<Lang>('en');
  const [dark, setDark] = useState(false);
  const [menu, setMenu] = useState(false);
  const [content, setContent] = useState<Store>(empty);
  const [profile, setProfile] = useState<ContentRow | null>(null);
  const [settings, setSettings] = useState<ContentRow | null>(null);
  const t = ui[lang];

  const load = async () => {
    const client = supabase;
    if (!client) return;
    const tables = Object.keys(empty);
    const results = await Promise.all(
      tables.map((table) => client.from(table).select('*').eq('published', true).order('order')),
    );
    const next = { ...empty };
    results.forEach((result, index) => {
      next[tables[index]] = (result.data ?? []) as ContentRow[];
    });
    setContent(next);
    const [{ data: p }, { data: s }] = await Promise.all([
      client.from('profile').select('*').limit(1).maybeSingle(),
      client.from('site_settings').select('*').limit(1).maybeSingle(),
    ]);
    setProfile(p as ContentRow | null);
    setSettings(s as ContentRow | null);
  };

  useEffect(() => {
    const initial = (localStorage.lang as Lang) || 'en';
    setLang(initial);
    document.documentElement.lang = initial;
    setDark(document.documentElement.dataset.theme === 'dark');
    void load();
    const client = supabase;
    if (!client) return;
    const channel = client.channel('portfolio-content-live');
    for (const table of [...Object.keys(empty), 'profile', 'site_settings']) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, () => void load());
    }
    channel.subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (settings?.accent_color) document.documentElement.style.setProperty('--accent', String(settings.accent_color));
  }, [settings]);

  const enabled = (name: keyof Store) =>
    content[name].length > 0 && (settings?.sections as Record<string, boolean> | undefined)?.[name] !== false;
  const nav = [
    ['about', true],
    ['skills', enabled('skills')],
    ['projects', enabled('projects')],
    ['experience', enabled('experience')],
    ['certificates', enabled('certificates')],
    ['education', enabled('education')],
    ['testimonials', enabled('testimonials')],
    ['contact', true],
  ] as const;
  const chooseLanguage = (next: Lang) => {
    setLang(next);
    localStorage.lang = next;
    document.documentElement.lang = next;
  };
  const changeTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    localStorage.theme = next ? 'dark' : 'light';
  };

  return (
    <>
      <header>
        <a className="brand" href="#top">signal<span>.</span></a>
        <nav>
          {nav.filter(([, show]) => show).map(([name]) => <a href={`#${name}`} key={name}>{t[name]}</a>)}
        </nav>
        <div className="controls">
          <button aria-label="Toggle theme" onClick={changeTheme}>{dark ? <Sun /> : <Moon />}</button>
          <div className="langs">
            {(['en', 'ru', 'uz'] as Lang[]).map((item) => (
              <button className={item === lang ? 'active' : ''} onClick={() => chooseLanguage(item)} key={item}>{item}</button>
            ))}
          </div>
          <button className="mobile" aria-label="Open menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
        </div>
      </header>
      <AnimatePresence>
        {menu && (
          <motion.nav className="drawer" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}>
            {nav.filter(([, show]) => show).map(([name]) => <a onClick={() => setMenu(false)} href={`#${name}`} key={name}>{t[name]}</a>)}
          </motion.nav>
        )}
      </AnimatePresence>
      <main id="top">
        <Hero profile={profile} language={lang} text={t} />
        <About profile={profile} language={lang} text={t} />
        {enabled('skills') && <Skills rows={content.skills} language={lang} text={t} />}
        {enabled('projects') && <Projects projects={content.projects as Project[]} language={lang} text={t} />}
        {enabled('experience') && <Experience rows={content.experience} language={lang} text={t} />}
        {enabled('certificates') && <Certificates rows={content.certificates} language={lang} text={t} />}
        {enabled('education') && <Education rows={content.education} language={lang} text={t} />}
        {enabled('testimonials') && <Testimonials rows={content.testimonials} language={lang} text={t} />}
        <Contact profile={profile} text={t} />
      </main>
      <footer>© {new Date().getFullYear()} {localized(profile?.name, lang) || 'Signal Analytics'} <span>{t.footer}</span></footer>
    </>
  );
}

function Hero({ profile, language, text }: { profile: ContentRow | null; language: Lang; text: UiText }) {
  const counters = Object.entries((profile?.counters as Record<string, string | number>) || {}).filter(([, value]) => Number(value) || String(value));
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">{text.heroLabel}</p>
        <h1>{localized(profile?.name, language) || text.heroName}<br /><i>{localized(profile?.title, language) || text.heroTitle}</i></h1>
        <p className="lede">{localized(profile?.bio, language) || text.heroBio}</p>
        <div className="actions">
          <a className="button" href="#projects">{text.view}</a>
          {Boolean(profile?.cv_url) && <a className="textlink" href={String(profile?.cv_url)} target="_blank">{text.cv}</a>}
          <a className="textlink" href="#contact">{text.message}</a>
        </div>
        {counters.length > 0 && <div className="counters">{counters.map(([label, value]) => <b key={label}><strong>{String(value)}</strong>{String(label)}</b>)}</div>}
      </div>
      <div className="portrait">
        {Boolean(profile?.photo_url) ? <img src={String(profile?.photo_url)} alt={localized(profile?.name, language) || 'Portfolio portrait'} /> : <div className="face">{(localized(profile?.name, language) || 'A').slice(0, 1)}</div>}
        <p>{profile?.availability ? String(profile.availability) : text.open}</p>
      </div>
    </section>
  );
}

function About({ profile, language, text }: { profile: ContentRow | null; language: Lang; text: UiText }) {
  const languages = Array.isArray(profile?.languages) ? profile.languages.join(' · ') : '';
  return (
    <section id="about" className="about">
      <p className="eyebrow">01 / {text.about}</p>
      <h2>{localized(profile?.title, language) || text.aboutHeading}</h2>
      <p>{localized(profile?.bio, language) || text.aboutEmpty}</p>
      <div className="pills">
        {Boolean(profile?.location) && <b>📍 {String(profile?.location)}</b>}
        {Boolean(profile?.availability) && <b>● {String(profile?.availability)}</b>}
        {Boolean(languages) && <b>{languages}</b>}
      </div>
    </section>
  );
}

function Skills({ rows, language, text }: { rows: ContentRow[]; language: Lang; text: UiText }) {
  const [category, setCategory] = useState(text.all);
  useEffect(() => setCategory(text.all), [text.all]);
  const categories = [text.all, ...new Set(rows.map((row) => String(row.category || 'Other')))];
  const shown = rows.filter((row) => category === text.all || row.category === category);
  return (
    <section id="skills">
      <p className="eyebrow">02 / {text.skills}</p>
      <h2>{text.skillsHeading}</h2>
      <div className="chips">{categories.map((item) => <button className={item === category ? 'chosen' : ''} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div>
      <div className="skills">{shown.map((row) => <motion.div whileHover={{ y: -4 }} className="skill" key={row.id}><span>{String(row.icon || '◆')}</span><b>{localized(row.name, language)}</b><i><em style={{ width: `${Number(row.proficiency || 0)}%` }} /></i></motion.div>)}</div>
    </section>
  );
}

function Projects({ projects, language, text }: { projects: Project[]; language: Lang; text: UiText }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState(text.all);
  const [list, setList] = useState(false);
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState<Project | null>(null);
  useEffect(() => setFilter(text.all), [text.all]);
  const tools = [text.all, ...new Set(projects.flatMap((project) => project.tools || []))];
  const shown = useMemo(
    () => projects
      .filter((project) => (filter === text.all || project.tools.includes(filter)) && `${localized(project.title, language)} ${localized(project.summary, language)}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => (sort === 'impact' ? b.impact - a.impact : sort === 'az' ? localized(a.title, language).localeCompare(localized(b.title, language)) : +new Date(b.created_at) - +new Date(a.created_at))),
    [projects, language, filter, query, sort, text.all],
  );
  return (
    <section id="projects" className="projects">
      <p className="eyebrow">03 / {text.projects}</p>
      <h2>{text.projectsHeading}</h2>
      <div className="project-controls">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.search} />
        <select value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="newest">{text.newest}</option>
          <option value="impact">{text.impact}</option>
          <option value="az">{text.az}</option>
        </select>
        <button aria-label="Toggle layout" onClick={() => setList(!list)}>{list ? <Grid /> : <Rows3 />}</button>
      </div>
      <div className="chips">{tools.map((item) => <button onClick={() => setFilter(item)} className={item === filter ? 'chosen' : ''} key={item}>{item}</button>)}</div>
      {shown.length ? (
        <motion.div layout className={`project-grid ${list ? 'list' : ''}`}>
          {shown.map((project) => <motion.button layout whileHover={{ y: -7 }} className={`project ${project.featured ? 'featured' : ''}`} onClick={() => setSelected(project)} key={project.id}><div className="cover"><span>{project.domain}</span><b>{project.impact}%</b></div><div><small>{project.tools.join(' · ')}</small><h3>{localized(project.title, language)}</h3><p>{localized(project.summary, language)}</p></div></motion.button>)}
        </motion.div>
      ) : <p>{text.no}</p>}
      <AnimatePresence>{selected && <CaseStudy project={selected} language={language} text={text} close={() => setSelected(null)} />}</AnimatePresence>
    </section>
  );
}

function CaseStudy({ project, language, text, close }: { project: Project; language: Lang; text: UiText; close: () => void }) {
  const [chart, setChart] = useState('bar');
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    addEventListener('keydown', key);
    return () => removeEventListener('keydown', key);
  }, [close]);
  const Chart = chart === 'line' ? LineChart : chart === 'area' ? AreaChart : BarChart;
  return (
    <motion.div className="modal" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close}>
      <article onMouseDown={(event) => event.stopPropagation()}>
        <button className="close" onClick={close} autoFocus aria-label="Close"><X /></button>
        <p className="eyebrow">{project.domain} / {text.caseStudy}</p>
        <h2>{localized(project.title, language)}</h2>
        <p className="lede">{localized(project.summary, language)}</p>
        {project.problem && <><h3>{text.problem}</h3><p>{localized(project.problem, language)}</p></>}
        {project.approach && <><h3>{text.approach}</h3><p>{localized(project.approach, language)}</p></>}
        <div className="kpis">{(project.metrics || [{ label: text.businessImpact, value: `${project.impact}%` }]).map((metric) => <b key={metric.label}><strong>{metric.value}</strong>{metric.label}</b>)}</div>
        {project.chart_data && (
          <>
            <div className="chart-buttons">{['bar', 'line', 'area'].map((kind) => <button className={chart === kind ? 'chosen' : ''} onClick={() => setChart(kind)} key={kind}>{kind}</button>)}</div>
            <div className="chart">
              <ResponsiveContainer width="100%" height={250}>
                <Chart data={project.chart_data.data}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  {project.chart_data.series.map((series, index) => (chart === 'bar' ? <Bar dataKey={series} fill={index ? '#f4b860' : '#7267f0'} key={series} /> : chart === 'line' ? <Line type="monotone" dataKey={series} stroke={index ? '#f4b860' : '#7267f0'} key={series} /> : <Area type="monotone" dataKey={series} stroke={index ? '#f4b860' : '#7267f0'} fill={index ? '#f4b860' : '#7267f0'} key={series} />))}
                </Chart>
              </ResponsiveContainer>
            </div>
          </>
        )}
        {project.embed_url && <iframe className="embed" src={project.embed_url} title={localized(project.title, language)} />}
      </article>
    </motion.div>
  );
}

function Experience({ rows, language, text }: { rows: ContentRow[]; language: Lang; text: UiText }) {
  return <section id="experience" className="timeline"><p className="eyebrow">04 / {text.experience}</p><h2>{text.experienceHeading}</h2>{rows.map((row) => <div key={row.id}><b>{dates(row)}</b><h3>{localized(row.role, language)} - {String(row.company)}</h3>{Array.isArray(row.achievements) && <p>{row.achievements.map((item) => localized(item, language) || String(item)).join(' · ')}</p>}</div>)}</section>;
}

function Certificates({ rows, language, text }: { rows: ContentRow[]; language: Lang; text: UiText }) {
  const [image, setImage] = useState('');
  return <section id="certificates"><p className="eyebrow">05 / {text.certificates}</p><h2>{text.certificatesHeading}</h2><div className="certs">{rows.map((row) => <article key={row.id}>{Boolean(row.image_url) && <button className="certificate-image" onClick={() => setImage(String(row.image_url))}><img src={String(row.image_url)} alt={localized(row.name, language) || text.certificateAlt} /></button>}<span>✦</span><h3>{localized(row.name, language)}</h3><p>{String(row.issuer || '')} · {String(row.credential_id || '')}</p>{Boolean(row.verify_url) && <a href={String(row.verify_url)} target="_blank">{text.verify} ↗</a>}</article>)}</div><AnimatePresence>{Boolean(image) && <motion.div className="modal" onClick={() => setImage('')}><img className="lightbox" src={image} alt={text.certificateAlt} /></motion.div>}</AnimatePresence></section>;
}

function Education({ rows, language, text }: { rows: ContentRow[]; language: Lang; text: UiText }) {
  return <section id="education" className="timeline"><p className="eyebrow">06 / {text.education}</p><h2>{text.educationHeading}</h2>{rows.map((row) => <div key={row.id}><b>{dates(row)}</b><h3>{localized(row.degree, language)}</h3><p>{String(row.institution)}</p></div>)}</section>;
}

function Testimonials({ rows, language, text }: { rows: ContentRow[]; language: Lang; text: UiText }) {
  const [index, setIndex] = useState(0);
  const row = rows[index % rows.length];
  return <section id="testimonials" className="quote"><p className="eyebrow">07 / {text.testimonials}</p><blockquote>“{localized(row.quote, language)}”</blockquote><p>- {String(row.author)}, {String(row.role || '')}</p>{rows.length > 1 && <div className="chips">{rows.map((item, itemIndex) => <button aria-label={`Show testimonial ${itemIndex + 1}`} className={itemIndex === index ? 'chosen' : ''} onClick={() => setIndex(itemIndex)} key={item.id}>{itemIndex + 1}</button>)}</div>}</section>;
}

function Contact({ profile, text }: { profile: ContentRow | null; text: UiText }) {
  const [sent, setSent] = useState(false);
  const contacts = (profile?.contacts as Record<string, string>) || {};
  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const { error } = await supabase!.from('messages').insert({ name: form.get('name'), email: form.get('email'), message: form.get('message') });
    if (!error) {
      setSent(true);
      event.currentTarget.reset();
    }
  }
  return <section id="contact" className="contact"><p className="eyebrow">08 / {text.contact}</p><h2>{text.message}</h2><form onSubmit={send}><input name="name" required placeholder={text.name} /><input name="email" type="email" required placeholder={text.email} /><textarea name="message" required placeholder={text.note} /><button className="button">{text.send}</button></form>{sent && <p>{text.sent}</p>}<p>{Object.entries(contacts).filter(([, value]) => value).map(([name, value]) => <a className="contact-link" href={name === 'email' ? `mailto:${value}` : value} key={name}>{name}</a>)}</p></section>;
}
