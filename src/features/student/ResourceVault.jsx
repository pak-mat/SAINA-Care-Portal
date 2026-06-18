// File: src/features/student/ResourceVault.jsx
import React, { useState } from 'react';
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
      <div className="mb-8 items-end justify-between sm:flex">
        <div>
          <h2 className="text-3xl font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">Self-Care Vault</h2>
          <p className="text-slate-500 dark:text-zinc-400 mt-2 font-medium">
            Explore {MOCK_ARTICLES.length} curated guides to support your boarding school journey.
          </p>
        </div>
      </div>

      <div className="flex flex-col mb-8 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md text-sm text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 transition-shadow shadow-sm transition-colors duration-300"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none border
                ${activeCategory === cat 
                  ? 'border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/30' 
                  : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700/50 hover:text-slate-900 dark:hover:text-zinc-100'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <AnimatePresence>
          {filteredArticles.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="col-span-full py-12 text-center text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md transition-colors duration-300">
              No resources found matching your criteria.
            </motion.div>
          ) : (
            filteredArticles.map(article => (
              <motion.div 
                key={article.id}
                layoutId={`card-container-${article.id}`}
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md transition-all duration-300 group"
                onClick={() => setSelectedArticle(article)}
              >
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded text-xs font-semibold tracking-wide">
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-zinc-500">
                      <Clock size={14} /> {article.readTime}
                    </span>
                  </div>
                  
                  <motion.h3 layoutId={`title-${article.id}`} className="text-lg font-semibold text-slate-900 dark:text-zinc-100 mb-2 leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {article.title}
                  </motion.h3>
                  
                  <motion.p layoutId={`summary-${article.id}`} className="text-sm text-slate-500 dark:text-zinc-400 mb-4 line-clamp-3">
                    {article.summary}
                  </motion.p>
                  
                  <div className="mt-auto flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-500 pt-4 border-t border-slate-50 dark:border-zinc-700/50">
                    <span className="flex-1">Read full guide</span>
                    <ChevronRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div 
              layoutId={`card-container-${selectedArticle.id}`}
              className="bg-white dark:bg-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md shadow-2xl relative z-10 flex flex-col transition-colors duration-300"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-md transition-colors z-20 outline-none border border-transparent dark:border-zinc-700"
              >
                <X size={20} />
              </button>
              
              <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-zinc-700 relative bg-emerald-50/30 dark:bg-emerald-900/10">
                <div className="flex items-center gap-3 mb-4 pr-12">
                   <span className="bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded text-xs font-semibold tracking-wide">
                     {selectedArticle.category}
                   </span>
                   <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                     <Clock size={14} /> {selectedArticle.readTime}
                   </span>
                </div>
                
                <motion.h3 layoutId={`title-${selectedArticle.id}`} className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-zinc-100 mb-4 leading-tight">
                  {selectedArticle.title}
                </motion.h3>
                
                <motion.p layoutId={`summary-${selectedArticle.id}`} className="text-slate-600 dark:text-zinc-300 text-base leading-relaxed">
                  {selectedArticle.summary}
                </motion.p>
              </div>
              
              <div className="p-6 sm:p-8">
                <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-lg mb-6 flex items-center gap-2">
                  <BookOpen size={20} className="text-emerald-600 dark:text-emerald-500" />
                  Key Takeaways & Strategies
                </h4>
                
                <ul className="space-y-5">
                  {selectedArticle.tips.map((tip, idx) => (
                    <motion.li 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      key={idx} 
                      className="flex gap-4 text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-md border border-slate-100 dark:border-zinc-700/50 shadow-sm transition-colors duration-300"
                    >
                      <span className="w-6 h-6 rounded flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed text-sm">{tip}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
              
              <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900/50 flex justify-end">
                 <button 
                   onClick={() => setSelectedArticle(null)}
                   className="bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-700 text-white font-medium text-sm px-6 py-2.5 rounded-md transition-colors outline-none shadow-sm"
                 >
                   Close Article
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
