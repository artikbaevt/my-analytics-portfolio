'use client'; 
import {useEffect,useState} from 'react'; 
import {supabase} from '../../lib/supabase'; 
import {useRouter} from 'next/navigation';

const schemas:Record<string,Record<string,string>>={
  projects:{title:'{"en":""}',summary:'{"en":""}',tools:'["SQL"]',domain:'',featured:'false',published:'false',impact:'0',order:'0'},
  skills:{name:'{"en":""}',category:'BI Tools',icon:'📊',proficiency:'70',published:'false',order:'0'},
  experience:{company:'',role:'{"en":""}',achievements:'[]',published:'false',order:'0'},
  certificates:{name:'{"en":""}',issuer:'',credential_id:'',verify_url:'',image_url:'',published:'false',order:'0'},
  education:{institution:'',degree:'{"en":""}',published:'false',order:'0'},
  testimonials:{quote:'{"en":""}',author:'',role:'',published:'false',order:'0'},
  blog:{title:'{"en":""}',body:'{"en":""}',slug:'',published:'false',order:'0'}
};

function cast(k:string,v:string){
  if(['published','featured'].includes(k))return v==='true';
  if(['order','impact','proficiency'].includes(k))return Number(v);
  if(v.startsWith('{')||v.startsWith('[')){try{return JSON.parse(v)}catch{return v}}
  return v;
}

export default function Admin(){
  const r=useRouter(),[table,setTable]=useState('projects'),[rows,setRows]=useState<any[]>([]),[editing,setEditing]=useState<any|null>(null),[status,setStatus]=useState('');
  const fields=schemas[table];
  
  const load=async()=>{
    const {data,error}=await supabase!.from(table).select('*').order('order');
    setRows(data||[]);
    setStatus(error?.message||'');
  };

  useEffect(()=>{
    if(!supabase){r.replace('/admin/login');return}
    supabase.auth.getUser().then(x=>{if(!x.data.user)r.replace('/admin/login');else void load()})
  },[table]);

  async function save(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    const f=new FormData(e.currentTarget),value=Object.fromEntries(Object.keys(fields).map(k=>[k,cast(k,String(f.get(k)||''))]));
    const q=editing?supabase!.from(table).update(value).eq('id',editing.id):supabase!.from(table).insert(value);
    const {error}=await q;
    setStatus(error?.message||'Saved — public site updates through Realtime.');
    setEditing(null);
    void load();
  }

  return (
    <main className="admin">
      <header>
        <a className="brand" href="/">signal<span>.</span> admin</a>
        <button onClick={()=>supabase?.auth.signOut().then(()=>r.push('/admin/login'))}>Sign out</button>
      </header>
      <h1>Content manager</h1>
      <p>Select a collection, add items, publish them, edit translations as JSON.</p>
      <div className="chips">
        {Object.keys(schemas).map(x=><button className={x===table?'chosen':''} onClick={()=>{setTable(x);setEditing(null)}} key={x}>{x}</button>)}
      </div>
      <button className="button" onClick={()=>setEditing({})}>Add {table.slice(0,-1)}</button>
      {status&&<p>{status}</p>}
      <div className="areas">
        {rows.map(x=>(
          <article key={x.id}>
            <h2>{x.title?.en||x.name?.en||x.company||x.institution||x.author||'Untitled'}</h2>
            <p>{x.published?'Published':'Draft'}</p>
            <button onClick={()=>setEditing(x)}>Edit</button>
            <button onClick={async()=>{await supabase!.from(table).delete().eq('id',x.id);void load()}}>Delete</button>
          </article>
        ))}
      </div>
      {editing&&(
        <div className="modal">
          <form className="modal-form" onSubmit={save}>
            <button type="button" onClick={()=>setEditing(null)}>Close</button>
            <h2>{editing.id?'Edit':'Add'} {table}</h2>
            {Object.entries(fields).map(([k,d])=>(
              <label key={k}>{k}
                <textarea name={k} defaultValue={editing[k]===undefined?d:typeof editing[k]==='object'?JSON.stringify(editing[k]):String(editing[k])}/>
              </label>
            ))}
            <button className="button">Save</button>
          </form>
        </div>
      )}
    </main>
  );
}