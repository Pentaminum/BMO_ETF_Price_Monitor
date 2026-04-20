import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  isOnline: boolean;
}

const Header = ({ isOnline }: { isOnline: boolean }) => (
  <header className="bg-white border-b border-slate-200 px-6 py-4">
    <div className="mx-auto max-w-8xl flex justify-between items-center">

      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold text-slate-800">ETF Price Monitor</h1>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {isOnline ? 'LIVE' : 'OFFLINE'}
      </div>
      
    </div>
  </header>
);

const Footer = () => (
  <footer className="py-6 border text-center text-slate-400 border-slate-200 text-sm">
    © BMO Capital Markets' Data Cognition Team Assessment - Jusung Park
  </footer>
);

export const PageLayout = ({ children, isOnline }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Header isOnline={isOnline}/>
      <main className="flex-1 mx-auto w-full max-w-8xl p-6 sm:p-10">
        <div className="bg-white shadow-xl rounded-3xl min-h-[80vh] p-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};