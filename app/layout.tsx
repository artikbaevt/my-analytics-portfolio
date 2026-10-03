import type { Metadata } from 'next'; import './globals.css';
export const metadata: Metadata={title:'Signal — Data Analyst Portfolio',description:'A trilingual data analyst portfolio'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:"try{const t=localStorage.theme||((matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}"}}/></head><body>{children}</body></html>}
