const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `        {/* Stacked Cards */}
        <div className="space-y-6">
          
          {/* Room & Members */}`;

const replacement1 = `        {/* Stacked Cards */}
        <div className="space-y-6">
          
          {/* Your Profile */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <div className="flex justify-between items-center pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">
                Your Profile
              </h3>
            </div>
            
            {/* Display Name editing */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Display Name</p>
                {isEditingNickname ? (
                  <input 
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="mt-1 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold w-full max-w-xs bg-white dark:bg-slate-950"
                  />
                ) : (
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">{userNickname}</p>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                {isEditingNickname ? (
                  <div className="flex gap-2 justify-start sm:justify-end">
                    <button 
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNicknameInput(userNickname);
                      }}
                      className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setUserNickname(nicknameInput);
                        localStorage.setItem('userNickname', nicknameInput);
                        if (nicknameInput && nicknameInput !== 'You' && nicknameInput.trim() !== '') {
                          setIsNicknameFixed(true);
                        }
                        if (userRoomId && user) {
                          await addMemberToRoom(userRoomId, nicknameInput);
                        }
                        setIsEditingNickname(false);
                        triggerToast('Display name updated!');
                      }}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-[#255038] dark:hover:bg-slate-200"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingNickname(true)}
                    className="px-4 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Room & Members */}`;

const target2 = `            {/* Nickname editing */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Your nickname</p>
                {isEditingNickname ? (
                  <input 
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    className="mt-1 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold w-full max-w-xs bg-white dark:bg-slate-950"
                  />
                ) : (
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">{userNickname}</p>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                {isEditingNickname ? (
                  <div className="flex gap-2 justify-start sm:justify-end">
                    <button 
                      onClick={() => {
                        setIsEditingNickname(false);
                        setNicknameInput(userNickname);
                      }}
                      className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={async () => {
                        setUserNickname(nicknameInput);
                        localStorage.setItem('userNickname', nicknameInput);
                        if (nicknameInput && nicknameInput !== 'You' && nicknameInput.trim() !== '') {
                          setIsNicknameFixed(true);
                        }
                        if (userRoomId && user) {
                          await addMemberToRoom(userRoomId, nicknameInput);
                        }
                        setIsEditingNickname(false);
                        triggerToast('Nickname updated!');
                      }}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-[#255038] dark:hover:bg-slate-200"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingNickname(true)}
                    className="px-4 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Room Name */}`;

const replacement2 = `            {/* Room Name */}`;

if (content.includes(target1) && content.includes(target2)) {
  content = content.replace(target1, replacement1);
  content = content.replace(target2, replacement2);
  fs.writeFileSync('src/App.jsx', content);
  console.log('Moved nickname to its own Profile block!');
} else {
  console.error('Could not find targets');
}
