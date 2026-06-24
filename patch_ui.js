const fs = require('fs');
let content = fs.readFileSync('src/App.jsx', 'utf8');

const target1 = `                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                    This is how you'll appear to roommates. If you want to change this later, you can do so in Settings.
                  </p>
                </div>
              )}`;

const replacement1 = `                  <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400">
                    This is how you'll appear to roommates. If you want to change this later, you can do so in Settings.
                  </p>
                  <button
                    onClick={() => {
                      if (!nicknameInput.trim() || nicknameInput === 'You') {
                        triggerToast('Please enter your display name first.');
                        return;
                      }
                      setIsNicknameFixed(true);
                    }}
                    className="w-full py-2.5 bg-[#1A3827] dark:bg-[#A3E635] hover:bg-[#234A34] dark:hover:bg-[#b0f23d] text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-sm active:scale-98 mt-3"
                  >
                    Continue
                  </button>
                </div>
              )}

              {isNicknameFixed && (
                <div className="space-y-5">`;

const target2 = `                </div>
              )}
            </div>
          )}

          {/* Wizard step: room-name */}`;

const replacement2 = `                </div>
              )}
                </div>
              )}
            </div>
          )}

          {/* Wizard step: room-name */}`;

content = content.replace(target1, replacement1);
content = content.replace(target2, replacement2);

fs.writeFileSync('src/App.jsx', content);
console.log('Patched');
