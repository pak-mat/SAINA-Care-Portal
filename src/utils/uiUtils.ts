export const getBannerClass = (styleId?: string) => {
  const presets: Record<string, string> = {
    emerald_calm: 'bg-gradient-to-r from-teal-500 to-emerald-600',
    indigo_dusk: 'bg-gradient-to-r from-violet-600 to-indigo-600',
    sunset_glow: 'bg-gradient-to-r from-orange-400 via-rose-500 to-amber-500',
    midnight_blue: 'bg-gradient-to-r from-slate-900 via-zinc-800 to-slate-900',
    rose_gold: 'bg-gradient-to-r from-rose-400 to-orange-300',
    cosmic_neon: 'bg-gradient-to-r from-purple-800 via-fuchsia-700 to-indigo-900'
  };
  return presets[styleId || 'emerald_calm'] || presets['emerald_calm'];
};

export const getAvatarClass = (colorId?: string) => {
  const presets: Record<string, string> = {
    emerald: 'bg-emerald-600 text-white',
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-purple-600 text-white',
    rose: 'bg-rose-600 text-white',
    amber: 'bg-amber-500 text-zinc-950',
    blue: 'bg-blue-600 text-white'
  };
  return presets[colorId || 'emerald'] || presets['emerald'];
};
