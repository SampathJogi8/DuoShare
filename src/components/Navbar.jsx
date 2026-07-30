import React from 'react';
import { 
  Home as HomeIcon, 
  BookOpen, 
  TrendingUp, 
  Wallet, 
  Plus, 
  Sparkles, 
  Sun, 
  Moon, 
  QrCode, 
  ChevronDown, 
  LogOut, 
  User, 
  Menu,
  ShieldCheck
} from 'lucide-react';
import faviconLogo from '../assets/favicon_logo.png';

export default function Navbar({
  currentView,
  setCurrentView,
  user,
  userNickname,
  userRooms,
  userRoomId,
  setUserRoomId,
  isDarkMode,
  setIsDarkMode,
  triggerToast,
  setIsInviteModalOpen,
  setIsAddExpenseOpen,
  setShowAiChat,
  isProfileDropdownOpen,
  setIsProfileDropdownOpen,
  handleSignOut,
  setIsMobileMenuOpen
}) {
  const activeRoom = userRooms?.find(r => r.room_id === userRoomId);

  return (
    <header className="sticky top-0 z-40 w-full hud-card border-b border-[#E3E8E3] dark:border-slate-800 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Brand Logo & Room Selector */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2.5 group transition-transform active:scale-95"
            >
              <img 
                src={faviconLogo} 
                alt="Tallyin Logo" 
                className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-xl shadow-md group-hover:rotate-6 transition-transform" 
              />
              <div className="text-left hidden xs:block">
                <span className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100 tracking-tight block leading-tight">
                  Tallyin
                </span>
                <span className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-extrabold uppercase tracking-wider block">
                  Expense Room
                </span>
              </div>
            </button>

            {/* Room Switcher Badge */}
            {userRoomId && (
              <div className="relative">
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EAF0EC] dark:bg-slate-800/80 border border-[#1A3827]/10 dark:border-slate-700/60 hover:bg-[#dfe7e2] dark:hover:bg-slate-800 text-xs font-bold text-[#1A3827] dark:text-slate-200 transition-all shadow-sm"
                  title="Invite or Manage Room"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="max-w-[100sm:max-w-[140px]] truncate font-extrabold">
                    {activeRoom?.room_name || userRoomId}
                  </span>
                  <QrCode className="w-3.5 h-3.5 text-[#5C6E5C] dark:text-slate-400 shrink-0" />
                </button>
              </div>
            )}
          </div>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EAF0EC]/70 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-[#1A3827]/5 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => setCurrentView('home')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                currentView === 'home'
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setCurrentView('activity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                currentView === 'activity'
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Activity</span>
            </button>

            <button
              onClick={() => setCurrentView('insights')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                currentView === 'insights'
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Insights</span>
            </button>

            <button
              onClick={() => setCurrentView('funds')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                currentView === 'funds'
                  ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635] shadow-sm'
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Funds</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile Drawer */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick Add Expense Action */}
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-[#1A3827] text-white hover:bg-[#255038] dark:bg-[#A3E635] dark:text-slate-950 dark:hover:bg-[#b7f34c] px-3.5 py-2 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>

            {/* AI Assistant Drawer Trigger */}
            <button
              onClick={() => setShowAiChat(true)}
              className="p-2 sm:p-2.5 text-purple-700 dark:text-purple-300 bg-purple-100/70 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-200/70 rounded-xl transition-all shadow-sm"
              title="Ask Divvy AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                if (triggerToast) triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
              }}
              className="p-2 sm:p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all shadow-sm"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-inner">
                  {userNickname?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden lg:inline text-xs font-bold text-[#1A3827] dark:text-slate-200 max-w-[90px] truncate">
                  {userNickname}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#5C6E5C] dark:text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 hud-card rounded-2xl p-2 shadow-2xl border border-[#E3E8E3] dark:border-slate-800 z-50 animate-fade-in text-left">
                  <div className="px-3 py-2 border-b border-[#E3E8E3] dark:border-slate-800/60 space-y-0.5">
                    <p className="text-xs font-black text-[#1A3827] dark:text-slate-100">{userNickname}</p>
                    <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 truncate">{user?.email || 'Logged In'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsInviteModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-xs font-bold text-[#1A3827] dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Room Invite Code</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      className="w-full px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Drawer Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 text-[#1A3827] dark:text-slate-200 hover:bg-[#EAF0EC] dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
