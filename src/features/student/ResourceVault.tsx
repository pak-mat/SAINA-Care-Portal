import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, ChevronRight, BookOpen } from 'lucide-react';
import { MOCK_ARTICLES } from './resourceData';

export default function ResourceVault() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const categories = ['All', 'Stress Management', 'Time Management', 'Mental Well-being'];

  const filteredArticles = MOCK_ARTICLES.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      
      {/* Hero Banner */}
      <div className="mb-8 overflow-hidden bg-gradient-to-r from-emerald-900 to-slate-900 dark:from-emerald-950 dark:to-black rounded-[1.75rem] p-8 sm:p-10 relative shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 opacity-20 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/4 pointer-events-none"></div>
        <div className="relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Self-Care Vault</h2>
          <p className="text-emerald-100/80 text-sm font-medium max-w-lg">
            Explore {MOCK_ARTICLES.length} curated guides to support your boarding school journey.
          </p>
        </div>
      </div>

      <div className="flex flex-col mb-8 space-y-5">
        <div className="relative max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={20} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 glass-panel text-base text-slate-900 dark:text-zinc-100 outline-none focus:bg-white dark:focus:bg-zinc-800 focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 focus:border-emerald-500 shadow-sm transition-all duration-300"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all outline-none border shadow-sm
                ${activeCategory === cat 
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 transform -translate-y-0.5' 
                  : 'glass-panel text-slate-600 dark:text-zinc-400 border-white/80 dark:border-zinc-800 hover:bg-white hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 hover:-translate-y-0.5'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <>
          {filteredArticles.length === 0 ? (
            <div className="col-span-full py-16 text-center glass-panel shadow-sm transition-colors duration-300 flex flex-col items-center">
              <div className="w-20 h-20 mb-6 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-inner border border-slate-200 dark:border-zinc-700">
                <Search size={32} className="text-slate-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-zinc-200 mb-2">No matching resources</h3>
              <p className="text-slate-500 dark:text-zinc-400">Try adjusting your search terms or category filter.</p>
            </div>
          ) : (
            filteredArticles.map(article => (
              <div 
                key={article.id}
                className="glass-panel shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border border-emerald-100 dark:border-emerald-800/50">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-zinc-500">
                      <Clock size={14} /> {article.readTime}
                    </span>
                  </div>
                  
                  
                  <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-3 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mb-6 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                  
                  <div className="mt-auto flex items-center text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 pt-5 border-t border-slate-100 dark:border-zinc-800/50">
                    <span className="flex-1">Read full guide</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/50 transition-colors">
                      <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      </div>

      <>
        {selectedArticle && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <div 
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <div 
              className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl relative z-10 flex flex-col transition-colors duration-300 border border-white/50 dark:border-zinc-800/50"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100/80 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl transition-all z-20 outline-none border border-transparent dark:border-zinc-700 hover:scale-105"
              >
                <X size={20} />
              </button>
              
              <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-zinc-800 relative bg-emerald-50/50 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3 mb-6 pr-12">
                   <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">
                     {selectedArticle.category}
                   </span>
                   <span className="flex items-center gap-1.5 text-[11px] font-black tracking-wider uppercase text-slate-500 dark:text-zinc-400">
                     <Clock size={14} /> {selectedArticle.readTime}
                   </span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-zinc-100 mb-4 leading-tight tracking-tight">
                  {selectedArticle.title}
                </h3>
                
                <p className="text-slate-600 dark:text-zinc-300 text-base font-medium leading-relaxed max-w-xl">
                  {selectedArticle.summary}
                </p>
              </div>
              
              <div className="p-8 sm:p-10">
                <h4 className="font-bold text-slate-900 dark:text-zinc-100 text-lg mb-6 flex items-center gap-2 tracking-tight">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <BookOpen size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Key Takeaways & Strategies
                </h4>
                
                <ul className="space-y-4">
                  {selectedArticle.tips.map((tip, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      key={idx} 
                      className="flex gap-4 text-slate-700 dark:text-zinc-300 bg-slate-50/80 dark:bg-zinc-900/80 p-5 rounded-2xl border border-slate-200/50 dark:border-zinc-800/50 shadow-sm transition-colors duration-300 hover:bg-white dark:hover:bg-zinc-800"
                    >
                      <span className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold text-sm flex-shrink-0 shadow-sm">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed text-sm font-medium pt-1.5">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 flex justify-end">
                 <button 
                   onClick={() => setSelectedArticle(null)}
                   className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all outline-none shadow-md hover:-translate-y-0.5 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
                 >
                   Close Article
                 </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    </div>
  );
}
