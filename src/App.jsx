import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Home as HomeIcon, 
  BookOpen, 
  TrendingUp, 
  FileText, 
  Settings as SettingsIcon, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Check, 
  Copy, 
  Download, 
  LogOut, 
  Sparkles, 
  Sliders, 
  X, 
  RefreshCw, 
  Moon, 
  Sun, 
  ChevronDown, 
  ChevronRight, 
  Info,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  User,
  Coffee,
  Lightbulb,
  Home as HouseIcon,
  ShoppingCart,
  DollarSign as CategoryIcon,
  Upload,
  UserCheck,
  Menu,
  ShieldCheck,
  QrCode,
  Share2,
  ScanLine,
  Bell,
  Mail
} from 'lucide-react';

// Firebase imports
import { auth, googleProvider, db } from './firebase';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';



export default function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Onboarding Setup View state
  const [userRoomId, setUserRoomId] = useState(() => localStorage.getItem('userRoomId') || null); 
  const [joinInput, setJoinInput] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Responsive drawer menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dropdown & Modal toggles
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Navigation State
  const [currentView, setCurrentView] = useState('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Core Data States
  const [transactions, setTransactions] = useState([]);
  const [receipts, setReceipts] = useState([]);
  
  // Theme option (default light, read from localStorage)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [offlineMode, setOfflineMode] = useState(true);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [hasConfirmedRoom, setHasConfirmedRoom] = useState(false);
  
  // Nicknames & Roommates Dynamic State
  const [userNickname, setUserNickname] = useState(() => localStorage.getItem('userNickname') || 'You');
  const [roommateName, setRoommateName] = useState(() => localStorage.getItem('roommateName') || 'Roommate');
  const [roommateOnline, setRoommateOnline] = useState(true);
  
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(() => localStorage.getItem('userNickname') || 'You');
  const [isEditingRoommate, setIsEditingRoommate] = useState(false);
  const [roommateInput, setRoommateInput] = useState(() => localStorage.getItem('roommateName') || 'Roommate');

  // Notification Config States
  const [notificationMethod, setNotificationMethod] = useState(() => localStorage.getItem('notificationMethod') || 'none');
  const [recipientEmails, setRecipientEmails] = useState(() => localStorage.getItem('recipientEmails') || '');
  const [emailJsServiceId, setEmailJsServiceId] = useState(() => localStorage.getItem('emailJsServiceId') || '');
  const [emailJsTemplateId, setEmailJsTemplateId] = useState(() => localStorage.getItem('emailJsTemplateId') || '');
  const [emailJsPublicKey, setEmailJsPublicKey] = useState(() => localStorage.getItem('emailJsPublicKey') || '');
  const [googleScriptUrl, setGoogleScriptUrl] = useState(() => localStorage.getItem('googleScriptUrl') || '');
  
  // File upload reference
  const fileInputRef = useRef(null);
  
  // Room code copying
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  // Toast / notification
  const [toastMessage, setToastMessage] = useState(null);

  // New Transaction Form State
  const [formFor, setFormFor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formDate, setFormDate] = useState('2026-06-21');
  const [formWho, setFormWho] = useState('Shared'); 
  const [formRepeat, setFormRepeat] = useState(false);

  // Search & Filter State (Ledger)
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Handle Google Auth state changes
  useEffect(() => {
    // Check redirect login results on page load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          triggerToast('Signed in successfully!');
        }
      })
      .catch((err) => {
        console.error("Redirect login error:", err);
        setAuthError(`Redirect Login Error: ${err.code || err.message}`);
        triggerToast(`Redirect Error: ${err.code || err.message}`);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setUserNickname(currentUser.displayName || 'You');
        setNicknameInput(currentUser.displayName || 'You');
        
        // Load room ID from localStorage if available, otherwise fetch from Firestore
        const localRoomId = localStorage.getItem('userRoomId');
        if (localRoomId) {
          setUserRoomId(localRoomId);
        } else {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDocSnapshot = await getDoc(userDocRef);
            if (userDocSnapshot.exists() && userDocSnapshot.data().roomId) {
              const rId = userDocSnapshot.data().roomId;
              setUserRoomId(rId);
              localStorage.setItem('userRoomId', rId);
            }
          } catch (e) {
            console.error('Error fetching user room ID:', e);
          }
        }
      } else {
        setUserRoomId(null);
        localStorage.removeItem('userRoomId');
        setHasConfirmedRoom(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auth Initialization Timeout Fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn("Auth initialization timed out.");
        setAuthError("Duo Room is taking longer than usual to connect. Please check your Google Cloud Console API Key restrictions and allow your Vercel domain.");
        setAuthLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [authLoading]);

  // Real-time camera QR scanner controller
  useEffect(() => {
    if (!isQrScannerOpen) return;
    
    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      
      const qrCodeSuccessCallback = (decodedText, decodedResult) => {
        const cleanCode = decodedText.trim();
        setJoinInput(cleanCode);
        setIsQrScannerOpen(false);
        setUserRoomId(cleanCode);
        setHasConfirmedRoom(true);
        triggerToast(`Scanned room code: ${cleanCode}`);
        
        if (html5QrCode.isScanning) {
          html5QrCode.stop().catch(err => console.error("Error stopping scanner:", err));
        }
      };
      
      const config = { fps: 10, qrbox: { width: 220, height: 220 } };
      
      html5QrCode.start(
        { facingMode: "environment" },
        config,
        qrCodeSuccessCallback
      ).catch(err => {
        console.warn("Camera scan failed to start (may need HTTPS or permissions):", err);
      });

      window.activeQrScanner = html5QrCode;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (window.activeQrScanner && window.activeQrScanner.isScanning) {
        window.activeQrScanner.stop()
          .then(() => {
            window.activeQrScanner = null;
          })
          .catch(err => console.error("Error stopping scanner on cleanup:", err));
      }
    };
  }, [isQrScannerOpen]);

  // Sync with dark mode class on document element and body
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Firebase Real-time Firestore Sync (runs when user and roomId are active)
  useEffect(() => {
    if (!user || !userRoomId) return;

      // Sync Transactions dynamically based on userRoomId
      const txQuery = query(collection(db, `rooms/${userRoomId}/transactions`), orderBy('date', 'desc'));
      const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
        // Monitor connection health
        setIsDbSynced(!snapshot.metadata.fromCache);
  
        const txData = [];
        snapshot.forEach((doc) => {
          txData.push({ id: doc.id, ...doc.data() });
        });
  
        setTransactions(txData);
      }, (error) => {
        console.error(error);
        setIsDbSynced(false);
        triggerToast("Offline Cache active. Syncing locally.");
        setTransactions([]);
      });

      // Sync Receipts dynamically based on userRoomId
      const receiptQuery = query(collection(db, `rooms/${userRoomId}/receipts`));
      const unsubscribeReceipts = onSnapshot(receiptQuery, (snapshot) => {
        const rData = [];
        snapshot.forEach((doc) => {
          rData.push({ id: doc.id, ...doc.data() });
        });
  
        setReceipts(rData);
      }, (error) => {
        setReceipts([]);
      });

    return () => {
      unsubscribeTx();
      unsubscribeReceipts();
    };
  }, [user, userRoomId]);

  // Login handler
  const handleGoogleLogin = async () => {
    try {
      setAuthError(null);
      setAuthLoading(true);
      await signInWithPopup(auth, googleProvider);
      triggerToast('Signed in successfully!');
    } catch (err) {
      console.warn("Popup sign-in failed/blocked. Trying redirect...", err);
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.error(redirectErr);
        setAuthError(`Auth Error: ${redirectErr.code || redirectErr.message}`);
        triggerToast(`Authentication failed: ${redirectErr.code || redirectErr.message}`);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setTransactions([]);
      setReceipts([]);
      setUserRoomId(null);
      localStorage.removeItem('userRoomId');
      setHasConfirmedRoom(false);
      triggerToast('Signed out successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to generate a room code with high entropy (4.1 Billion combinations)
  const generateUniqueRoomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let letters = '';
    for (let i = 0; i < 4; i++) {
      letters += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const digits = Math.floor(1000 + Math.random() * 9000);
    return `DUO-${letters}-${digits}`;
  };

  // Create Room handler with Firestore uniqueness check
  const handleCreateRoom = async () => {
    let uniqueCode = '';
    let exists = true;
    let attempts = 0;
    
    // Check up to 5 times for uniqueness (highly likely to succeed on 1st attempt)
    while (exists && attempts < 5) {
      uniqueCode = generateUniqueRoomCode();
      attempts++;
      
      try {
        const roomDocRef = doc(db, 'rooms', uniqueCode);
        const roomSnapshot = await getDoc(roomDocRef);
        if (!roomSnapshot.exists()) {
          exists = false;
        }
      } catch (err) {
        console.warn("Uniqueness check query error:", err);
        exists = false; // Fall back to proceed on offline/network errors
      }
    }

    if (!uniqueCode) {
      uniqueCode = generateUniqueRoomCode();
    }
    
    try {
      // 1. Create a metadata document for the room to claim it
      const roomDocRef = doc(db, 'rooms', uniqueCode);
      await setDoc(roomDocRef, {
        createdBy: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        createdAt: new Date().toISOString(),
        roomCode: uniqueCode
      });
      
      // 2. Set active room locally
      setUserRoomId(uniqueCode);
      localStorage.setItem('userRoomId', uniqueCode);
      setHasConfirmedRoom(true);
      triggerToast(`Room ${uniqueCode} created!`);
      
      // 3. Write to Firestore users profile to bind user session
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { roomId: uniqueCode }, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save room creation to Firestore:', err);
      // Local fallback to keep it working in offline environments
      setUserRoomId(uniqueCode);
      localStorage.setItem('userRoomId', uniqueCode);
      setHasConfirmedRoom(true);
      triggerToast(`Room ${uniqueCode} initialized locally (Offline Mode).`);
    }
  };

  // Join Room handler
  const handleJoinRoom = async () => {
    if (!joinInput || joinInput.trim() === '') {
      triggerToast('Please enter a valid room ID.');
      return;
    }
    const cleanId = joinInput.trim();
    setUserRoomId(cleanId);
    localStorage.setItem('userRoomId', cleanId);
    setHasConfirmedRoom(true);
    triggerToast(`Joined room: ${cleanId}`);
    
    // Write to Firestore users profile
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', auth.currentUser.uid), { roomId: cleanId }, { merge: true });
      } catch (err) {
        console.error('Failed to save room joining to Firestore:', err);
      }
    }
  };

  // Dynamically calculated values based on synced transactions state
  const computedStats = useMemo(() => {
    let youPaidShared = 0;
    let samPaidShared = 0;
    let personalPaidAlex = 0;
    let sharedTransactionsCount = 0;

    const data = transactions;

    data.forEach(t => {
      if (t.isShared) {
        sharedTransactionsCount++;
        const isSelf = t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || (user && t.paidBy === user.displayName) || (user && t.paidBy === user.email);
        if (isSelf) {
          youPaidShared += t.amount;
        } else {
          samPaidShared += t.amount;
        }
      } else {
        const isSelf = t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || (user && t.paidBy === user.displayName) || (user && t.paidBy === user.email);
        if (isSelf) {
          personalPaidAlex += t.amount;
        }
      }
    });

    const totalShared = youPaidShared + samPaidShared;
    const alexShare = totalShared / 2;
    const balanceOwedToAlex = youPaidShared - alexShare;

    return {
      youPaidShared,
      samPaidShared,
      totalShared,
      personalPaidAlex,
      juneSpend: totalShared + personalPaidAlex,
      balance: balanceOwedToAlex,
      sharedCount: sharedTransactionsCount,
      totalCount: data.length
    };
  }, [transactions, user]);

  // Copy Room Code Helper
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userRoomId || roomCode);
    setRoomCodeCopied(true);
    triggerToast('Room code copied to clipboard!');
    setTimeout(() => setRoomCodeCopied(false), 2000);
  };

  // Client-Side Email Notification Dispatcher
  const sendEmailNotification = async (transaction) => {
    if (!notificationMethod || notificationMethod === 'none') return;
    
    const formattedAmount = `₹${transaction.amount.toLocaleString("en-IN")}`;
    const roomDisplayName = userRoomId || 'DUO-ROOM';
    const messageText = `Duo Room Alert: A new expense "${transaction.title}" of ${formattedAmount} was added by ${transaction.paidBy} in Room ${roomDisplayName}.`;
    
    const emailList = recipientEmails.split(',').map(e => e.trim()).filter(e => e !== '');
    if (emailList.length === 0) return;

    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background-color: #F6F8F6; color: #1A3827; border-radius: 16px; border: 1px solid #E3E8E3; max-width: 500px; margin: 20px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
        <h2 style="color: #1A3827; margin: 0 0 4px 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Duo Room Expense</h2>
        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #5C6E5C; margin: 0 0 16px 0; font-weight: bold;">Real-time Billing Sync</p>
        <div style="background-color: white; padding: 20px; border-radius: 12px; border: 1px solid #E3E8E3; margin-bottom: 16px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #5C6E5C;">Hi Roommate,</p>
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.5; color: #1A3827;">
            A new expense has been recorded in room <strong>${roomDisplayName}</strong>:
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C; width: 100px;">Description:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: bold;">${transaction.title}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Amount:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: bold; font-size: 15px;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Paid By:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827; font-weight: 600;">${transaction.paidBy}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; font-size: 13px; color: #5C6E5C;">Split Ratio:</td>
              <td style="padding: 6px 0; font-size: 13px; color: #1A3827;">${transaction.split}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 11px; color: #5C6E5C; text-align: center; margin: 0;">Open your Duo Room dashboard to view the full ledger or settle balances.</p>
      </div>
    `;

    if (notificationMethod === 'google-script' && googleScriptUrl) {
      try {
        for (const email of emailList) {
          await fetch(googleScriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify({
              to: email,
              subject: `Duo Room Expense: ${transaction.title} (${formattedAmount})`,
              htmlBody: htmlBody,
              textBody: messageText
            })
          });
        }
        console.log('Client-side Google Apps Script email triggered successfully');
      } catch (err) {
        console.error('Failed client-side Apps Script email trigger:', err);
      }
    } else if (notificationMethod === 'emailjs' && emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
      try {
        for (const email of emailList) {
          const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              service_id: emailJsServiceId,
              template_id: emailJsTemplateId,
              user_id: emailJsPublicKey,
              template_params: {
                to_email: email,
                title: transaction.title,
                amount: formattedAmount,
                paid_by: transaction.paidBy,
                split_type: transaction.split,
                room_id: roomDisplayName
              }
            })
          });
          if (response.ok) {
            console.log(`EmailJS notification sent to ${email}`);
          } else {
            const errText = await response.text();
            console.error(`EmailJS error response: ${errText}`);
          }
        }
      } catch (err) {
        console.error('Failed client-side EmailJS trigger:', err);
      }
    }
  };

  // Add expense handler to Firestore
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!formFor || !formAmount) {
      triggerToast('Please fill out the description and amount.');
      return;
    }

    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast('Please enter a valid amount.');
      return;
    }

    const currentRoom = userRoomId || 'DUO-7729-XM';
    const newPayload = {
      title: formFor,
      amount: amountNum,
      category: formCategory,
      date: formDate,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paidBy: user ? user.displayName : 'Sampath Jogi Pusala',
      isShared: formWho === 'Shared',
      split: formWho === 'Shared' ? 'Shared (50/50)' : 'Personal'
    };

    try {
      await addDoc(collection(db, `rooms/${currentRoom}/transactions`), newPayload);

      if (formWho === 'Shared') {
        const bgColors = [
          'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
          'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
          'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
          'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
        ];
        const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
        const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
        const randomRot = rotations[Math.floor(Math.random() * rotations.length)];
        
        await addDoc(collection(db, `rooms/${currentRoom}/receipts`), {
          title: formFor,
          amount: amountNum,
          category: formCategory,
          date: new Date(formDate).toLocaleDateString([], { day: '2-digit', month: 'short' }),
          bgClass: randomBg,
          rotation: randomRot
        });
      }

      // Send client-side email notifications if configured
      if (notificationMethod !== 'none' && recipientEmails) {
        sendEmailNotification(newPayload);
        triggerToast(`Added expense! 📧 Email notification sent.`);
      } else {
        triggerToast("Added expense!");
      }
    } catch (error) {
      console.error(error);
      setTransactions([{ id: Date.now().toString(), ...newPayload }, ...transactions]);
      if (notificationMethod !== 'none' && recipientEmails) {
        triggerToast(`Saved locally (Offline). 📧 Notification queued.`);
      } else {
        triggerToast(`Saved locally (Offline).`);
      }
    }

    // Reset Form
    setFormFor('');
    setFormAmount('');
    setFormCategory('Food');
    setFormDate('2026-06-21');
    setFormWho('Shared');
    setFormRepeat(false);
    setIsAddExpenseOpen(false);
  };

  // Upload Receipt trigger
  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Receipt File upload selection handler
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const title = file.name.split('.')[0] || "Uploaded Receipt";
    const enteredAmount = prompt(`Confirm amount for receipt "${title}":`, "1240");
    if (enteredAmount === null) return; 

    const amountNum = parseFloat(enteredAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      triggerToast("Invalid receipt amount.");
      return;
    }

    const bgColors = [
      'bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-[#A3E635]',
      'bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
      'bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-400',
      'bg-rose-50 border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400'
    ];
    const rotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2'];
    const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
    const randomRot = rotations[Math.floor(Math.random() * rotations.length)];

    const newReceipt = {
      title: title,
      amount: amountNum,
      category: 'Groceries',
      date: new Date().toLocaleDateString([], { day: '2-digit', month: 'short' }),
      bgClass: randomBg,
      rotation: randomRot
    };

    const currentRoom = userRoomId || 'DUO-7729-XM';
    try {
      await addDoc(collection(db, `rooms/${currentRoom}/receipts`), newReceipt);
      triggerToast(`Receipt uploaded! 📧 Notification sent to roommates.`);
    } catch (err) {
      console.error(err);
      setReceipts([newReceipt, ...receipts]);
      triggerToast("Saved receipt details locally.");
    }
  };

  // Settle Up handler
  const handleSettleUp = async () => {
    if (computedStats.balance <= 0) {
      triggerToast('All settled up! No balance to settle.');
      return;
    }
    
    const settlementAmount = Math.abs(computedStats.balance);
    const newPayload = {
      title: 'Settle Up - Room Balance Cleared',
      amount: settlementAmount * 2, 
      category: 'Rent',
      date: '2026-06-21',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paidBy: roommateName,
      isShared: true,
      split: 'Settle Up'
    };

    const currentRoom = userRoomId || 'DUO-7729-XM';
    try {
      await addDoc(collection(db, `rooms/${currentRoom}/transactions`), newPayload);
      triggerToast(`Room Settle Up completed! 📱 SMS notifications dispatched.`);
    } catch (error) {
      console.error(error);
      setTransactions([{ id: Date.now().toString(), ...newPayload }, ...transactions]);
      triggerToast('Settled locally (Offline Mode).');
    }
  };

  // Invite trigger
  const handleInviteTrigger = async () => {
    const currentRoom = userRoomId || 'DUO-7729-XM';
    const shareData = {
      title: 'Duo Room Shared Space',
      text: `Join my roommate shared space on Duo Room! Use Code: ${currentRoom}`,
      url: `https://duoroom.app/invite/${currentRoom}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerToast('Shared successfully!');
      } catch (err) {
        setIsInviteModalOpen(true);
      }
    } else {
      setIsInviteModalOpen(true);
    }
  };

  // Get icon for categories
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Food':
      case 'Dining':
      case 'Groceries':
        return <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'Utilities':
        return <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Rent':
        return <HouseIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Shopping':
        return <ShoppingCart className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      default:
        return <CategoryIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  // Helper to format currency
  const formatINR = (val) => {
    return `₹${Math.round(val).toLocaleString('en-IN')}`;
  };

  // CSV Export Handler
  const exportToCSV = () => {
    try {
      const dataList = transactions;
      if (dataList.length === 0) {
        triggerToast("No transaction records to export.");
        return;
      }
      
      const csvHeaders = ["Date", "Time", "Description/Merchant", "Amount (INR)", "Category", "Paid By", "Split Type"];
      const csvRows = [
        csvHeaders.join(','),
        ...dataList.map(t => [
          `"${t.date}"`,
          `"${t.time}"`,
          `"${t.title.replace(/"/g, '""')}"`,
          t.amount,
          `"${t.category}"`,
          `"${t.paidBy}"`,
          `"${t.split}"`
        ].join(','))
      ];
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => encodeURIComponent(e)).join("%0A");
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", `duo_room_ledger_export_${userRoomId || 'room'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      triggerToast("CSV file downloaded successfully!");
    } catch (error) {
      console.error(error);
      triggerToast("Failed to export CSV. Please try again.");
    }
  };

  // Excel Export Handler (styled XLS format)
  const exportToExcel = () => {
    try {
      const dataList = transactions;
      if (dataList.length === 0) {
        triggerToast("No transaction records to export.");
        return;
      }
      
      const excelTemplate = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Ledger Sheet</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #1A3827; color: #ffffff; font-weight: bold; font-size: 13px; }
            td, th { border: 1px solid #E3E8E3; padding: 10px; text-align: left; font-size: 12px; }
            tr:nth-child(even) { background-color: #F6F8F6; }
            .header-info { margin-bottom: 20px; }
            .header-title { font-size: 18px; color: #1A3827; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header-info">
            <span class="header-title">Duo Room Financial Ledger Report</span><br/>
            <b>Room Workspace:</b> ${userRoomId || 'DUO-7729-XM'}<br/>
            <b>Exported on:</b> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}<br/>
            <b>Total Room Spend:</b> ${formatINR(computedStats.juneSpend)}<br/>
            <b>Roommate Nicknames:</b> ${userNickname} & ${roommateName}
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description/Merchant</th>
                <th>Amount (INR)</th>
                <th>Category</th>
                <th>Paid By</th>
                <th>Split Type</th>
              </tr>
            </thead>
            <tbody>
              ${dataList.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td>${t.title}</td>
                  <td>${t.amount}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>${t.split}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `duo_room_ledger_export_${userRoomId || 'room'}.xls`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      triggerToast("Excel file downloaded successfully!");
    } catch (error) {
      console.error(error);
      triggerToast("Failed to export Excel spreadsheet.");
    }
  };

  // PDF Export Handler (Print styled statement)
  const exportToPDF = () => {
    try {
      const dataList = transactions;
      if (dataList.length === 0) {
        triggerToast("No transaction records to export.");
        return;
      }
      
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (!printWindow) {
        triggerToast("Pop-up blocked. Please allow popups for print statements.");
        return;
      }
      
      const balanceVal = computedStats.balance;
      const statusText = balanceVal === 0 
        ? "All settled up" 
        : balanceVal > 0 
          ? `You are owed ${formatINR(balanceVal)}` 
          : `${roommateName} is owed ${formatINR(Math.abs(balanceVal))}`;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Duo Room Ledger - Statement of Account</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; color: #102217; padding: 40px; background-color: #ffffff; }
            .header-banner { background-color: #1A3827; color: #ffffff; padding: 24px 32px; border-radius: 16px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo-title { display: flex; align-items: center; gap: 12px; }
            .logo-icon { width: 36px; height: 36px; background: #eaf0ec; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; color: #1A3827; }
            .logo-text { font-weight: 800; font-size: 22px; letter-spacing: -0.025em; }
            .doc-info { text-align: right; font-size: 11px; opacity: 0.85; line-height: 1.5; }
            
            .summary-title { font-size: 14px; font-weight: 800; text-transform: uppercase; color: #5C6E5C; letter-spacing: 0.05em; margin-bottom: 12px; }
            .cards-grid { display: grid; grid-template-cols: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #E3E8E3; border-radius: 16px; padding: 16px; background-color: #fcfdfc; }
            .card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #5C6E5C; margin-bottom: 4px; }
            .card-value { font-size: 18px; font-weight: 800; color: #1A3827; }
            
            .status-banner { background-color: #EAF0EC; border: 1px solid rgba(26, 56, 39, 0.1); border-radius: 12px; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #1A3827; margin-bottom: 30px; display: flex; align-items: center; gap: 8px; }
            .status-dot { width: 8px; height: 8px; background-color: #A3E635; border-radius: 50%; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { background-color: #1A3827; color: white; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 16px; text-align: left; }
            td { padding: 12px 16px; border-bottom: 1px solid #E3E8E3; font-size: 12px; }
            tr:nth-child(even) td { background-color: #fbfdfb; }
            
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
            .badge-shared { background-color: #eaf0ec; color: #1a3827; }
            .badge-personal { background-color: #f1f3f1; color: #5c6e5c; }
            
            .footer { border-top: 1px solid #E3E8E3; padding-top: 16px; text-align: center; font-size: 10px; color: #5C6E5C; }
            
            @media print {
              body { padding: 20px; }
              .header-banner { background-color: #1A3827 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              th { background-color: #1A3827 !important; color: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .summary-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .status-banner { background-color: #EAF0EC !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <div class="logo-title">
              <div class="logo-icon">D</div>
              <div class="logo-text">Duo Room</div>
            </div>
            <div class="doc-info">
              <b>Room Statement</b><br/>
              <b>Workspace ID:</b> ${userRoomId || 'DUO-7729-XM'}<br/>
              <b>Generated on:</b> ${new Date().toLocaleDateString()}<br/>
              <b>Database connection:</b> Synced
            </div>
          </div>
          
          <h4 class="summary-title">Financial Summary</h4>
          <div class="cards-grid">
            <div class="summary-card">
              <p class="card-label">Total Room Spend</p>
              <p class="card-value">${formatINR(computedStats.juneSpend)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">Total Shared Bills</p>
              <p class="card-value">${formatINR(computedStats.totalShared)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">You Paid (Shared)</p>
              <p class="card-value">${formatINR(computedStats.youPaidShared)}</p>
            </div>
            <div class="summary-card">
              <p class="card-label">${roommateName} Paid (Shared)</p>
              <p class="card-value">${formatINR(computedStats.samPaidShared)}</p>
            </div>
          </div>
          
          <div class="status-banner">
            <div class="status-dot"></div>
            <span>${statusText} • Calculated from ${dataList.length} transaction records.</span>
          </div>
          
          <h4 class="summary-title" style="margin-bottom: 16px;">Ledger Details</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Description/Merchant</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Paid By</th>
                <th>Split</th>
              </tr>
            </thead>
            <tbody>
              ${dataList.map(t => `
                <tr>
                  <td>${t.date}</td>
                  <td>${t.time}</td>
                  <td style="font-weight: 600;">${t.title}</td>
                  <td style="font-weight: 700; color: #1A3827;">${formatINR(t.amount)}</td>
                  <td>${t.category}</td>
                  <td>${t.paidBy}</td>
                  <td>
                    <span class="badge ${t.isShared ? 'badge-shared' : 'badge-personal'}">
                      ${t.split}
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Duo Room roommate expense statement. Generated by pairing with Firestore Cloud database.
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      triggerToast("PDF statement generation complete.");
    } catch (error) {
      console.error(error);
      triggerToast("Failed to compile print layout.");
    }
  };

  // Filtered transactions for the ledger
  const activeTxList = transactions;
  const filteredTransactions = useMemo(() => {
    return activeTxList.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [activeTxList, searchQuery, categoryFilter]);

  // LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F6F8F6] dark:bg-slate-950 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF0EC] dark:bg-slate-900 border border-[#1A3827]/10 dark:border-slate-800 flex items-center justify-center animate-spin">
            <RefreshCw className="w-6 h-6 text-[#1A3827] dark:text-[#A3E635]" />
          </div>
          <p className="text-sm font-bold text-[#1A3827]/80 dark:text-slate-200">Loading Duo Room secure credentials...</p>
        </div>
      </div>
    );
  }

  // LOGIN PAGE VIEW (Unauthenticated State)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Floating Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
            }}
            className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>
        </div>

        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100 dark:bg-emerald-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-100 dark:bg-lime-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-2xl flex items-center justify-center font-black text-2xl text-[#1A3827] dark:text-[#A3E635] mx-auto shadow-sm">
              D
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-[#1A3827] dark:text-slate-100 tracking-tight">Duo Room</h1>
              <p className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold uppercase tracking-wider">Roommate Expense Tracker</p>
            </div>
            
            <p className="text-sm text-[#5C6E5C] dark:text-slate-400 max-w-xs mx-auto leading-relaxed pt-2">
              Keep roommate billing transparent, synchronized, and simple. Log in to split shared apartment expenses.
            </p>
          </div>

          <div className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 rounded-2xl p-4 space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Secure Google Authentication</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <RefreshCw className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Real-time room syncing across users</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-[#EAF0EC] dark:bg-slate-900 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <p className="text-xs text-[#1A3827] dark:text-slate-200 font-bold">Smart budget insights & visual receipts</p>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-[#1A3827] text-white hover:bg-[#255038] py-3.5 px-4 rounded-2xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-3 border border-white/5 active:scale-98"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 488 512">
              <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
            </svg>
            <span>Sign in with Google</span>
          </button>

          {authError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl text-[11px] text-red-700 dark:text-red-400 font-bold leading-relaxed text-center break-words select-all animate-fade-in">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ONBOARDING ROOM SELECTION VIEW (For joining or creating a room)
  if (user && (!userRoomId || !hasConfirmedRoom)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F8F6] dark:bg-slate-950 p-4 font-sans relative overflow-hidden transition-colors duration-300">
        {/* Floating Theme Toggle (Top Right) */}
        <div className="absolute top-4 right-4 z-50">
          <button 
            onClick={() => {
              setIsDarkMode(!isDarkMode);
              triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
            }}
            className="p-2.5 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
            title="Toggle Dark/Light Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-800" />}
          </button>
        </div>

        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-100 dark:bg-emerald-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime-100 dark:bg-lime-950/10 rounded-full blur-3xl opacity-40 -z-10"></div>

        <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl text-[#1A3827] dark:text-[#A3E635] mx-auto shadow-sm">
              D
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Set up your shared space</h1>
              <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-bold uppercase tracking-wider">Duo Room Onboarding</p>
            </div>
            
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Create a new digital room to log bills, or enter a roommate's room code to synchronize existing balances.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Continue to Active Room Option (shown if user has already joined a room) */}
            {userRoomId && (
              <div className="col-span-1 md:col-span-2 border-2 border-[#1A3827] dark:border-[#A3E635] bg-[#EAF0EC]/20 dark:bg-[#A3E635]/5 rounded-2xl p-5 hover:bg-[#EAF0EC]/30 dark:hover:bg-[#A3E635]/15 transition-all flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 text-left shadow-sm">
                <div className="space-y-1">
                  <span className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Active Room
                  </span>
                  <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100 mt-1">Continue to Room</h3>
                  <p className="font-mono text-xs font-bold text-[#5C6E5C] dark:text-slate-350">
                    Room Code: <span className="text-[#1A3827] dark:text-[#A3E635] font-black">{userRoomId}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setHasConfirmedRoom(true)}
                  className="bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 hover:bg-[#255038] dark:hover:bg-slate-200 py-2.5 px-6 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0 text-center"
                >
                  Enter Room
                </button>
              </div>
            )}

            {/* Create Room Option */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-5 hover:border-[#1A3827]/20 dark:hover:border-slate-700 hover:bg-[#F6F8F6]/20 dark:hover:bg-slate-800/10 transition-all flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Create new room</h3>
                <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
                  {userRoomId ? "Generate a fresh room code and discard/switch from your current room." : "Generate a new unique room code and invite your roommate."}
                </p>
              </div>
              <button 
                onClick={handleCreateRoom}
                className="w-full bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-955 hover:bg-[#255038] dark:hover:bg-slate-200 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-sm text-center"
              >
                Create Room
              </button>
            </div>

            {/* Join Room Option */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-5 hover:border-[#1A3827]/20 dark:hover:border-slate-700 hover:bg-[#F6F8F6]/20 dark:hover:bg-slate-800/10 transition-all flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-2">
                <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">
                  {userRoomId ? "Join different room" : "Join existing room"}
                </h3>
                <div className="space-y-1.5">
                  <input 
                    type="text" 
                    placeholder="Enter ID (e.g. DUO-7729-XM)"
                    value={joinInput}
                    onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={handleJoinRoom}
                  className="w-full bg-[#1A3827] dark:bg-slate-800 text-white hover:bg-[#255038] dark:hover:bg-slate-700 py-2 px-4 rounded-xl font-bold text-[11px] transition-all shadow-sm text-center"
                >
                  Join via Code
                </button>
                
                <button 
                  onClick={() => setIsQrScannerOpen(true)}
                  className="w-full border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 py-2 px-4 rounded-xl font-bold text-[11px] text-[#5C6E5C] dark:text-slate-350 transition-all flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#1A3827] dark:text-[#A3E635]" />
                  <span>Scan Room QR</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-[#5C6E5C] dark:text-slate-400">Signed in as {user.email}</span>
            <button 
              onClick={handleSignOut}
              className="text-rose-700 font-bold hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* QR Scanner Simulator Overlay */}
        {isQrScannerOpen && renderQrScanner()}
      </div>
    );
  }

  // MAIN RUNNING APP
  return (
    <div className={`min-h-screen flex bg-[#F6F8F6] dark:bg-slate-950 transition-colors duration-300 ${isDarkMode ? 'dark text-slate-100' : 'text-[#1A3827]'}`}>
      
      {/* Hidden File Input for Receipt Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleReceiptUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1A3827] dark:bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-[#BEF264]/20 animate-bounce text-xs font-semibold max-w-sm">
          <Check className="w-4 h-4 text-[#A3E635] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`w-64 border-r border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between fixed top-0 bottom-0 left-0 h-full z-40 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EAF0EC] dark:bg-slate-800 border border-[#1A3827]/10 dark:border-slate-700 rounded-xl flex items-center justify-center font-bold text-xl text-[#1A3827] dark:text-[#A3E635]">
                D
              </div>
              <div>
                <h1 className="font-bold text-[#1A3827] dark:text-slate-100 tracking-tight">Duo Room</h1>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold tracking-wider uppercase">Shared Spaces</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button 
              onClick={() => { setCurrentView('home'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'home' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('ledger'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'ledger' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" />
                <span>Ledger</span>
              </div>
              <span className="px-2 py-0.5 text-xs font-bold bg-[#1A3827] dark:bg-[#A3E635] text-[#A3E635] dark:text-slate-950 rounded-full">
                {computedStats.totalCount}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentView('insights'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'insights' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4" />
                <span>Insights</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('receipts'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'receipts' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Receipts</span>
              </div>
            </button>

            <button 
              onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                currentView === 'settings' 
                  ? 'bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 font-bold' 
                  : 'text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Roommate Profile */}
        <div className="p-6 border-t border-[#E3E8E3] dark:border-slate-800">
          <button 
            onClick={() => { setCurrentView('settings'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center gap-2 mb-4 px-2 py-1.5 rounded-lg text-xs text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200 transition-all"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Room settings</span>
          </button>
          
          <div className="bg-[#1A3827] dark:bg-slate-950 text-white p-4 rounded-2xl shadow-sm relative overflow-hidden border dark:border-slate-800">
            <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#A3E635] opacity-20 blur-xl rounded-full"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-pink-400 text-white flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                {roommateName.charAt(0)}
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-sm truncate">{roommateName}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${roommateOnline ? 'bg-[#A3E635] animate-ping' : 'bg-gray-400'}`}></span>
                  <span className={`w-1.5 h-1.5 rounded-full absolute ${roommateOnline ? 'bg-[#A3E635]' : 'bg-gray-400'}`}></span>
                  <span className={`text-[10px] font-medium tracking-wide ${roommateOnline ? 'text-[#A3E635]' : 'text-gray-400'}`}>
                    {roommateOnline ? 'Online now' : 'Away'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Page Container */}
      <div className="flex-1 flex flex-col pl-0 md:pl-64 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sm:px-8 fixed top-0 right-0 left-0 md:left-64 z-20 transition-colors duration-300">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl mr-1.5 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#EAF0EC] dark:bg-slate-800 rounded-lg hidden sm:block">
                <HouseIcon className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
              </div>
              <div>
                <h2 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 leading-tight">{userNickname.split(' ')[0]} & {roommateName}'s Room</h2>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDbSynced ? 'bg-[#A3E635]' : 'bg-amber-500 animate-pulse'}`}></span>
                  <span className="text-[8px] sm:text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest">
                    ROOM • {userRoomId} {isDbSynced ? '(Live Sync)' : '(Offline Cache)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions (Right) */}
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button 
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
              }}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827] hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Toggle Dark/Light Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={() => triggerToast('Duo Room Diamond is active! VIP benefits enabled.')}
              className="p-2 text-[#5C6E5C] dark:text-slate-400 hover:text-amber-500 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
              title="Diamond Membership Status"
            >
              <div className="w-4 h-4 border border-[#5C6E5C] dark:border-slate-700 hover:border-amber-500 rotate-45 flex items-center justify-center relative">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full absolute"></span>
              </div>
            </button>

            {/* Profile widget */}
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-1.5 border-l border-[#E3E8E3] dark:border-slate-800 pl-2 sm:pl-4 cursor-pointer select-none hover:opacity-80 py-1"
            >
              {user && user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={userNickname} 
                  className="w-8 h-8 rounded-full border border-[#E3E8E3] dark:border-slate-800 shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {userNickname.charAt(0)}
                </div>
              )}
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-100 leading-none truncate max-w-[120px]">{userNickname}</p>
                <span className="text-[9px] text-[#5C6E5C] dark:text-slate-400 font-semibold">Active User</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#5C6E5C]" />
            </div>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-48 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-30 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                <button 
                  onClick={() => { setCurrentView('settings'); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={() => { handleSignOut(); setIsProfileDropdownOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center gap-2 border-t border-[#F6F8F6] dark:border-slate-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-grow pt-20 px-4 sm:px-8 pb-24 overflow-y-auto">
          {currentView === 'home' && renderHome()}
          {currentView === 'ledger' && renderLedger()}
          {currentView === 'insights' && renderInsights()}
          {currentView === 'receipts' && renderReceipts()}
          {currentView === 'settings' && renderSettings()}
        </main>

        {/* Floating Action Button (FAB) */}
        <div className="fixed bottom-6 right-6 z-30">
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-2 bg-[#A3E635] text-[#1A3827] font-bold px-4 sm:px-5 py-3 sm:py-3.5 rounded-full shadow-lg shadow-lime-900/10 hover:bg-[#BEF264] hover:scale-105 active:scale-95 transition-all duration-200 border border-[#84CC16]"
            id="fab-quick-add"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span className="text-xs sm:text-sm">Quick add</span>
          </button>
        </div>

        {/* Add Expense Modal Overlay */}
        {isAddExpenseOpen && renderAddExpenseModal()}
        
        {/* Custom Invite Roommate Share Modal */}
        {isInviteModalOpen && renderInviteModal()}
      </div>
    </div>
  );

  // ==========================================
  // PAGE 1: HOME (DASHBOARD)
  // ==========================================
  function renderHome() {
    const totalSharedPaid = computedStats.youPaidShared + computedStats.samPaidShared;
    const youPercent = totalSharedPaid > 0 ? Math.round((computedStats.youPaidShared / totalSharedPaid) * 100) : 50;
    const samPercent = 100 - youPercent;

    const dataList = transactions;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">Good afternoon, {userNickname.split(' ')[0]}.</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Everything looks calm in your room today.</p>
          </div>
          <button 
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add expense</span>
          </button>
        </div>

        {/* Main Balance Card */}
        <div className="bg-[#1A3827] dark:bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-white/5 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6 sm:gap-8 transition-all duration-300">
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#A3E635] opacity-5 blur-3xl rounded-full -mr-20 -mt-20"></div>
          
          <div className="space-y-4 max-w-md z-10">
            <div>
              <p className="text-[10px] tracking-widest font-bold uppercase text-[#A3E635]/80">CURRENT BALANCE</p>
              <h3 className="text-xs text-white/70 mt-0.5">You are owed</h3>
              <h2 className="text-4xl sm:text-5xl font-black text-[#A3E635] tracking-tight mt-1">
                {formatINR(Math.abs(computedStats.balance))}
              </h2>
            </div>
            
            <p className="text-xs sm:text-sm text-[#EAF0EC]/80 dark:text-slate-300 font-medium">
              {computedStats.balance > 0 
                ? `${roommateName} owes you after all shared expenses.`
                : computedStats.balance < 0 
                  ? `You owe ${roommateName} after all shared expenses.`
                  : 'You are completely settled up!'}
            </p>

            <button 
              onClick={handleSettleUp}
              className="inline-flex items-center gap-2 bg-[#A3E635] text-[#1A3827] font-bold px-4 py-2 rounded-xl text-[10px] sm:text-xs hover:bg-[#BEF264] transition-all duration-150 shadow-sm"
            >
              <span>Settle up</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Right side stats */}
          <div className="border-t md:border-t-0 md:border-l border-white/10 dark:border-slate-800 pt-5 md:pt-0 md:pl-10 space-y-4 sm:space-y-5 flex-1 max-w-sm z-10">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-white/50 dark:text-slate-400 tracking-wider uppercase">YOU PAID</p>
                <p className="text-lg sm:text-xl font-bold text-white">{formatINR(computedStats.youPaidShared)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-white/50 dark:text-slate-400 tracking-wider uppercase">{roommateName.toUpperCase()} PAID</p>
                <p className="text-lg sm:text-xl font-bold text-white">{formatINR(computedStats.samPaidShared)}</p>
              </div>
            </div>

            {/* Split Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-white/10 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#A3E635] h-full transition-all duration-500" style={{ width: `${youPercent}%` }}></div>
                <div className="bg-[#84CC16] h-full transition-all duration-500 opacity-40" style={{ width: `${samPercent}%` }}></div>
              </div>
              <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-white/60 dark:text-slate-400 tracking-wider uppercase">
                <span>{youPercent}% YOU</span>
                <span>{samPercent}% {roommateName.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Left Column: Recent Activity */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between transition-colors duration-300">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Recent activity</h3>
                <button 
                  onClick={() => setCurrentView('ledger')} 
                  className="text-xs font-bold text-[#1A3827] dark:text-[#A3E635] hover:underline flex items-center gap-1 group"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              {/* Transactions List */}
              <div className="space-y-4">
                {dataList.length === 0 ? (
                  <div className="text-center py-8 text-[#5C6E5C] dark:text-slate-400">
                    <p className="text-xs sm:text-sm font-semibold">No recent activity.</p>
                    <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Expenses you log will show up here.</p>
                  </div>
                ) : (
                  dataList.slice(0, 4).map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-1 border-b border-[#F6F8F6] dark:border-slate-800 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center">
                        {getCategoryIcon(t.category)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">{t.title}</h4>
                        <p className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5 truncate">
                          {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'You' : roommateName} paid • {t.isShared ? 'split equally' : 'personal'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right ml-2 shrink-0">
                      <p className={`font-bold text-xs sm:text-sm ${t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'text-[#1A3827] dark:text-[#A3E635]' : 'text-gray-500 dark:text-slate-400'}`}>
                        {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? '-' : '+'}{formatINR(t.amount)}
                      </p>
                      <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold mt-0.5">{t.date}</p>
                    </div>
                  </div>
                )))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#F6F8F6] dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Last updated 2 mins ago</span>
              </span>
              <span className="text-[#1A3827] dark:text-[#A3E635] font-semibold">Synced live via Firestore</span>
            </div>
          </div>

          {/* Right Column (Stacked Cards) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Top: June Budget */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">June budget</h3>
                <span className="text-[10px] sm:text-xs font-bold text-[#5C6E5C] dark:text-slate-400 bg-[#F6F8F6] dark:bg-slate-950 px-2.5 py-1 rounded-lg">18 days remaining</span>
              </div>

              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(computedStats.juneSpend)}</span>
                  <span className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 font-semibold">of {formatINR(22000)}</span>
                </div>
                
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full overflow-hidden mt-3">
                  <div className="bg-[#1A3827] dark:bg-[#A3E635] h-full rounded-full transition-all duration-300" style={{ width: '71%' }}></div>
                </div>
              </div>

              <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">You're on track</p>
                  <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400 mt-0.5">Keep daily spending under ₹352 to hit savings target.</p>
                </div>
              </div>
            </div>

            {/* Bottom: Quick Actions */}
            <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
              <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-xs sm:text-sm tracking-widest uppercase">Quick actions</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsAddExpenseOpen(true)}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <Plus className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Add bill</span>
                </button>
                
                <button 
                  onClick={handleTriggerUpload}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <Upload className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Scan receipt</span>
                </button>
                
                <button 
                  onClick={handleInviteTrigger}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <UserCheck className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">Invite roommate</span>
                </button>
                
                <button 
                  onClick={() => setCurrentView('insights')}
                  className="bg-[#F6F8F6] dark:bg-slate-950 border border-[#E3E8E3]/50 dark:border-slate-800 hover:bg-[#EAF0EC] dark:hover:bg-slate-800/40 hover:border-[#1A3827]/20 p-3.5 rounded-2xl text-left transition-all duration-150"
                >
                  <TrendingUp className="w-5 h-5 text-[#1A3827] dark:text-[#A3E635] mb-2" />
                  <span className="text-xs font-bold block text-[#1A3827] dark:text-slate-200">View insights</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 2: THE LEDGER
  // ==========================================
  function renderLedger() {
    const categories = ['All', 'Food', 'Utilities', 'Rent', 'Shopping', 'Transport'];

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight">The ledger</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every expense, clearly accounted for.</p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Export Dropdown */}
            <div className="relative flex-1 sm:flex-none">
              <button 
                onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
                className="w-full flex items-center justify-center gap-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 px-4 py-2.5 rounded-xl font-bold transition-all text-xs sm:text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {isExportDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsExportDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-2xl shadow-lg py-2 z-40 animate-fade-in text-xs font-bold text-slate-800 dark:text-slate-100">
                    <button 
                      onClick={() => { exportToCSV(); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4 text-emerald-700" />
                      <span>Export to CSV</span>
                    </button>
                    <button 
                      onClick={() => { exportToExcel(); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <span>Export to Excel</span>
                    </button>
                    <button 
                      onClick={() => { exportToPDF(); setIsExportDropdownOpen(false); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setIsAddExpenseOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add expense</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center gap-3 justify-between transition-colors duration-300">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-[#5C6E5C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search merchant, title or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="flex-1 md:flex-none border border-[#E3E8E3] dark:border-slate-800 bg-[#F6F8F6]/50 dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-semibold cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
              ))}
            </select>

            <button 
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                triggerToast('Search filter reset.');
              }}
              className="bg-[#1A3827] dark:bg-slate-800 text-white px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Summary Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">JUNE SPEND</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(computedStats.juneSpend)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SHARED</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(computedStats.totalShared)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">PERSONAL</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{formatINR(computedStats.personalPaidAlex)}</p>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TRANSACTIONS</p>
            <p className="text-xl sm:text-2xl font-black text-[#1A3827] dark:text-slate-100 mt-1">{filteredTransactions.length}</p>
          </div>
        </div>

        {/* Transaction list panel */}
        <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-6 py-5 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight">June 2026</h3>
            <span className="text-xs font-bold text-[#5C6E5C] dark:text-slate-400">
              {filteredTransactions.length === transactions.length 
                ? `${filteredTransactions.length} transactions` 
                : `Filtered ${filteredTransactions.length} of ${transactions.length}`}
            </span>
          </div>

          <div className="divide-y divide-[#F6F8F6] dark:divide-slate-800">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No expenses logged yet in this room.</p>
                <p className="text-[10px] text-[#5C6E5C] dark:text-slate-505 mt-1">Click "Add Expense" at the top to log your first roommate bill.</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-[#5C6E5C] dark:text-slate-400">
                <p className="text-xs sm:text-sm font-semibold">No transactions match your search filter.</p>
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }} 
                  className="text-xs font-bold text-[#1A3827] dark:text-[#A3E635] underline mt-1"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredTransactions.map((t) => (
                <div key={t.id} className="px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-[#F6F8F6]/30 dark:hover:bg-slate-800/10 transition-all duration-100">
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F6F8F6] dark:bg-slate-950 flex items-center justify-center border border-[#E3E8E3]/20 shrink-0">
                      {getCategoryIcon(t.category)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs sm:text-sm text-[#1A3827] dark:text-slate-100 truncate">{t.title}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                        <span className="text-[8px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF0EC] dark:bg-slate-800 text-[#1A3827] dark:text-[#A3E635]">
                          {t.category}
                        </span>
                        <span className="text-[10px] sm:text-[11px] text-[#5C6E5C] dark:text-slate-400 font-semibold truncate">
                          {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'Paid by You' : `Paid by ${roommateName}`} • {t.split}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-3 shrink-0">
                    <p className={`font-black text-xs sm:text-sm ${t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? 'text-red-700 dark:text-rose-500' : 'text-[#1A3827] dark:text-[#A3E635]'}`}>
                      {t.paidBy === 'Alex' || t.paidBy === 'Sampath Jogi Pusala' || t.paidBy === userNickname ? '-' : '+'}{formatINR(t.amount)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 justify-end text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">
                      <Calendar className="w-3 h-3 hidden sm:block" />
                      <span>{t.date}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 3: ADD EXPENSE MODAL (OVERLAY)
  // ==========================================
  function renderAddExpenseModal() {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 relative max-h-[90vh] flex flex-col transition-colors duration-300">
          
          <div className="px-6 py-4 border-b border-[#E3E8E3] dark:border-slate-800 flex justify-between items-center bg-[#F6F8F6]/30 dark:bg-slate-950/20 shrink-0">
            <div>
              <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">NEW TRANSACTION</p>
              <h2 className="font-extrabold text-lg sm:text-xl text-[#1A3827] dark:text-slate-100 mt-0.5">Add an expense</h2>
            </div>
            <button 
              onClick={() => setIsAddExpenseOpen(false)}
              className="p-1.5 rounded-full text-[#5C6E5C] dark:text-slate-400 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 hover:text-[#1A3827] dark:hover:text-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleAddExpense} className="p-6 space-y-4 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200">
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">What was it for?</label>
              <input 
                type="text"
                placeholder="e.g. Weekly groceries"
                required
                value={formFor}
                onChange={(e) => setFormFor(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 font-semibold">₹</span>
                  <input 
                    type="number"
                    placeholder="0.00"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Category</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-[#1A3827] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#1A3827] cursor-pointer"
                >
                  <option value="Food">Food</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Expense date</label>
              <input 
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-[#1A3827] text-[#1A3827] dark:text-white bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200 block">Who is it for?</label>
              <div className="bg-[#F6F8F6] dark:bg-slate-950 p-1 rounded-xl flex border border-[#E3E8E3]/50 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setFormWho('Shared')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                    formWho === 'Shared' 
                      ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 shadow-sm' 
                      : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827]'
                  }`}
                >
                  Shared
                </button>
                <button
                  type="button"
                  onClick={() => setFormWho('Personal')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-150 ${
                    formWho === 'Personal' 
                      ? 'bg-white dark:bg-slate-800 text-[#1A3827] dark:text-slate-100 shadow-sm' 
                      : 'text-[#5C6E5C] dark:text-slate-400 hover:text-[#1A3827]'
                  }`}
                >
                  Personal
                </button>
              </div>
            </div>

            {/* Split Display Box */}
            <div className="border border-[#E3E8E3] dark:border-slate-800 rounded-2xl p-4 bg-[#F6F8F6]/30 dark:bg-slate-900/20">
              <p className="text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase mb-2">Split break down</p>
              
              {formWho === 'Shared' ? (
                <div className="space-y-2 text-[11px] sm:text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-[#E3E8E3]/50 dark:border-slate-800">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px]">A</span>
                      <span>You</span>
                    </span>
                    <span className="font-bold">50% ({formatINR((parseFloat(formAmount) || 0) / 2)})</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-pink-400 text-white flex items-center justify-center font-bold text-[9px]">{roommateName.charAt(0)}</span>
                      <span>{roommateName}</span>
                    </span>
                    <span className="font-bold">50% ({formatINR((parseFloat(formAmount) || 0) / 2)})</span>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-[11px] sm:text-xs py-1">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-[9px]">A</span>
                    <span>You</span>
                  </span>
                  <span className="font-bold">100% ({formatINR(parseFloat(formAmount) || 0)})</span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input 
                type="checkbox"
                checked={formRepeat}
                onChange={(e) => setFormRepeat(e.target.checked)}
                className="w-4 h-4 rounded text-[#1A3827] focus:ring-[#1A3827] accent-[#1A3827] border-[#E3E8E3]"
              />
              <span className="text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">Repeat this expense monthly</span>
            </label>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-[#E3E8E3] dark:border-slate-800 flex justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsAddExpenseOpen(false)}
                className="px-4 sm:px-5 py-2.5 rounded-xl border border-[#E3E8E3] dark:border-slate-800 text-[#5C6E5C] dark:text-slate-400 font-bold text-xs hover:bg-[#F6F8F6] dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              
              <button 
                type="submit"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 font-bold text-xs hover:bg-[#255038] dark:hover:bg-slate-200 transition-all shadow-sm"
              >
                Add expense
              </button>
            </div>

          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE 4: SPENDING INSIGHTS
  // ==========================================
  function renderInsights() {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">ROOM INTELLIGENCE</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Spending insights</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">A clearer view of where your money goes.</p>
          </div>

          <select 
            className="border border-[#E3E8E3] dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none text-[#1A3827] dark:text-slate-200 font-bold shadow-sm cursor-pointer w-full sm:w-auto"
          >
            <option>This month</option>
            <option>Last month</option>
            <option>Last 3 months</option>
          </select>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">TOTAL SPEND</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(computedStats.juneSpend)}</span>
              <span className="text-[10px] sm:text-xs font-bold text-red-600 dark:text-rose-500 flex items-center">
                ↓ 8.4%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">from May (₹17,080)</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-2 transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">DAILY AVERAGE</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(782)}</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#5C6E5C] dark:text-slate-400 font-semibold">₹352 recommended daily cap</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 p-5 sm:p-6 rounded-3xl shadow-sm space-y-2 transition-colors duration-300">
            <p className="text-[9px] sm:text-[10px] font-bold text-[#5C6E5C] dark:text-slate-400 tracking-wider uppercase">SAVINGS GOAL</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1A3827] dark:text-slate-100">{formatINR(3200)}</span>
              <span className="text-[10px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 font-semibold">of {formatINR(5000)}</span>
            </div>
            <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-2 rounded-full overflow-hidden mt-1">
              <div className="bg-[#A3E635] h-full rounded-full transition-all duration-300" style={{ width: '64%' }}></div>
            </div>
          </div>
        </div>

        {/* Charts area - 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Left: Spend by category (Donut Chart) */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Spend by category</h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              
              <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="#1A3827" 
                    strokeWidth="10"
                    strokeDasharray="128.2 251.3"
                    strokeDashoffset="0"
                    className="transition-all duration-500 hover:stroke-[12] cursor-pointer"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="#FBBF24" 
                    strokeWidth="10"
                    strokeDasharray="55.3 251.3"
                    strokeDashoffset="-128.2"
                    className="transition-all duration-500 hover:stroke-[12] cursor-pointer"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="#3B82F6" 
                    strokeWidth="10"
                    strokeDasharray="35.2 251.3"
                    strokeDashoffset="-183.5"
                    className="transition-all duration-500 hover:stroke-[12] cursor-pointer"
                  />
                  <circle 
                    cx="50" cy="50" r="40" 
                    fill="transparent" 
                    stroke="#F43F5E" 
                    strokeWidth="10"
                    strokeDasharray="32.6 251.3"
                    strokeDashoffset="-218.7"
                    className="transition-all duration-500 hover:stroke-[12] cursor-pointer"
                  />
                </svg>
                
                <div className="absolute text-center">
                  <p className="text-base sm:text-lg font-black text-[#1A3827] dark:text-slate-100">₹15.6k</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-wider">TOTAL</p>
                </div>
              </div>

              {/* Legend details */}
              <div className="space-y-2.5 sm:space-y-3 shrink-0 w-full sm:w-auto">
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A3827]"></span>
                    <span className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-300 w-14 sm:w-16">Rent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(8000)}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">51%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]"></span>
                    <span className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-300 w-14 sm:w-16">Food</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(3450)}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">22%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                    <span className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-300 w-14 sm:w-16">Utilities</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(2100)}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">14%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></span>
                    <span className="text-xs font-semibold text-[#5C6E5C] dark:text-slate-300 w-14 sm:w-16">Shopping</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#1A3827] dark:text-slate-200">{formatINR(2100)}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold">13%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Smart budget caps */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-6 transition-colors duration-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-base sm:text-lg tracking-tight">Smart budget caps</h3>
                <span className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[8px] sm:text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#1A3827]" />
                  <span>AI Suggested</span>
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                  <span>Food & dining</span>
                  <span>{formatINR(3450)} / {formatINR(5000)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full relative">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '69%' }}></div>
                  <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-rose-500/50"></div>
                  <span className="absolute -top-4 left-[80%] text-[8px] font-bold text-rose-600/70 uppercase">Cap</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-bold text-[#1A3827] dark:text-slate-200">
                  <span>Utilities</span>
                  <span>{formatINR(2100)} / {formatINR(3000)}</span>
                </div>
                <div className="w-full bg-[#F6F8F6] dark:bg-slate-950 h-3 rounded-full relative">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '70%' }}></div>
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-rose-500/50"></div>
                  <span className="absolute -top-4 left-[75%] text-[8px] font-bold text-rose-600/70 uppercase">Cap</span>
                </div>
              </div>
            </div>

            {/* Bottom green tip card */}
            <div className="bg-[#EAF0EC] dark:bg-slate-950 border border-[#1A3827]/10 dark:border-slate-800 p-4 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">A small win:</p>
                <p className="text-[10px] sm:text-[11px] text-[#255038] dark:text-slate-400 mt-0.5">✦ You spent 18% less on eating out than last month. Keep it up!</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // PAGE 5: RECEIPTS GALLERY
  // ==========================================
  function renderReceipts() {
    const activeReceipts = receipts;

    return (
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">VISUAL ARCHIVE</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Receipts gallery</h1>
            <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Every proof of purchase, close at hand.</p>
          </div>

          <button 
            onClick={handleTriggerUpload}
            className="flex items-center justify-center gap-2 bg-[#1A3827] dark:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#255038] dark:hover:bg-slate-700 transition-all duration-200 text-xs sm:text-sm shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Upload receipt</span>
          </button>
        </div>

        {activeReceipts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-12 text-center shadow-sm">
            <p className="text-xs sm:text-sm font-semibold text-[#5C6E5C] dark:text-slate-400">No receipts uploaded yet.</p>
            <p className="text-[10px] text-[#5C6E5C] dark:text-slate-500 mt-1">Upload roommate bill receipt files to archive them in this visual polaroid grid.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {activeReceipts.map((r) => (
              <div 
                key={r.id}
                className={`rounded-3xl border p-3 sm:p-4 shadow-sm flex flex-col justify-between aspect-square select-none transition-transform duration-300 hover:scale-102 hover:shadow-md cursor-pointer ${r.bgClass}`}
              >
                <div 
                  className={`bg-white text-slate-800 p-3 sm:p-4 border border-slate-200/50 shadow-sm mx-auto w-full aspect-[4/5] flex flex-col justify-between transform transition-all duration-300 hover:rotate-0 hover:scale-102 ${r.rotation}`}
                >
                  <div className="text-center font-mono">
                    <p className="text-[8px] sm:text-[10px] font-black text-slate-500 tracking-wider">DUO ROOM REC</p>
                    <p className="text-[10px] sm:text-xs font-black tracking-tight mt-2 uppercase truncate">{r.title}</p>
                    
                    <div className="border-t border-dashed border-slate-300 my-1.5"></div>
                    
                    <p className="text-base sm:text-xl font-black mt-2 text-slate-800">{formatINR(r.amount)}</p>
                  </div>
                  
                  <div className="text-center text-[8px] font-bold text-slate-400 tracking-wide mt-2">
                    <span>SECURE SYNC</span>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div className="mt-3 sm:mt-4 pt-2 border-t border-black/5 flex items-center justify-between">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-[10px] sm:text-xs tracking-tight truncate">{r.title}</h4>
                    <p className="text-[8px] sm:text-[10px] opacity-70 font-semibold mt-0.5 truncate">{r.category} • {r.date}</p>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerToast('Downloading receipt image...');
                    }}
                    className="p-1 rounded-lg hover:bg-black/5 transition-all shrink-0"
                    title="Download receipt details"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    );
  }

  // ==========================================
  // PAGE 6: SETTINGS
  // ==========================================
  function renderSettings() {
    return (
      <div className="space-y-6 sm:space-y-8 max-w-3xl mx-auto animate-fade-in pb-12">
        
        <div>
          <p className="text-[10px] tracking-widest font-extrabold uppercase text-[#5C6E5C] dark:text-slate-400">YOUR SPACE</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A3827] dark:text-slate-100 tracking-tight mt-0.5">Settings</h1>
          <p className="text-xs sm:text-sm text-[#5C6E5C] dark:text-slate-400 mt-1">Make Duo Room work the way you do.</p>
        </div>

        {/* Stacked Cards */}
        <div className="space-y-6">
          
          {/* Room & roommate */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Room & roommate
            </h3>

            {/* Room code */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Room code</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Share this code with a new roommate to sync bills.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold bg-[#F6F8F6] dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-[#E3E8E3]/50 dark:border-slate-800">
                  {userRoomId || roomCode}
                </span>
                <button 
                  onClick={handleCopyCode}
                  className="p-2 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 rounded-xl transition-all"
                  title="Copy room code"
                >
                  {roomCodeCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#5C6E5C]" />}
                </button>
              </div>
            </div>

            {/* Nickname editing */}
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
                      onClick={() => {
                        setUserNickname(nicknameInput);
                        localStorage.setItem('userNickname', nicknameInput);
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

            {/* Roommate Nickname */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div className="flex-1 w-full">
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Roommate's nickname</p>
                {isEditingRoommate ? (
                  <input 
                    type="text"
                    value={roommateInput}
                    onChange={(e) => setRoommateInput(e.target.value)}
                    className="mt-1 px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold w-full max-w-xs bg-white dark:bg-slate-900"
                  />
                ) : (
                  <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">{roommateName}</p>
                )}
              </div>
              <div className="w-full sm:w-auto text-left sm:text-right">
                {isEditingRoommate ? (
                  <div className="flex gap-2 justify-start sm:justify-end">
                    <button 
                      onClick={() => {
                        setIsEditingRoommate(false);
                        setRoommateInput(roommateName);
                      }}
                      className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-lg text-xs font-bold hover:bg-[#F6F8F6] dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        setRoommateName(roommateInput);
                        localStorage.setItem('roommateName', roommateInput);
                        setIsEditingRoommate(false);
                        triggerToast('Roommate name updated!');
                      }}
                      className="px-3 py-1.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-[#255038] dark:hover:bg-slate-200"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingRoommate(true)}
                    className="px-4 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
                  >
                    Rename
                  </button>
                )}
              </div>
            </div>

            {/* Roommate Status */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Roommate status</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Toggle roommate visibility simulation.</p>
              </div>
              <button 
                onClick={() => {
                  setRoommateOnline(!roommateOnline);
                  triggerToast(`${roommateName} is now ${!roommateOnline ? 'Online' : 'Offline'}`);
                }}
                className={`flex items-center gap-1.5 border px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roommateOnline 
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-[#A3E635] border-emerald-100 dark:border-emerald-900/30' 
                    : 'bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-800'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roommateOnline ? 'bg-[#A3E635]' : 'bg-gray-400'}`}></span>
                <span>{roommateOnline ? 'Online now' : 'Offline / Away'}</span>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Preferences
            </h3>

            {/* Cosmic Slate */}
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Cosmic Slate theme</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Activate a darker, modern charcoal aesthetic.</p>
              </div>
              <button 
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                  triggerToast(isDarkMode ? 'Theme set to Clean Light' : 'Cosmic Slate mode active');
                }}
                className={`w-12 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                  isDarkMode ? 'bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'
                }`}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Offline Mode */}
            <div className="flex justify-between items-center py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Offline mode cache</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Auto-save data locally when connectivity drops.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-[#EAF0EC] dark:bg-slate-955 border border-[#1A3827]/10 dark:border-slate-800 text-[#1A3827] dark:text-[#A3E635] text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider hidden sm:inline">
                  ACTIVE
                </span>
                <button 
                  onClick={() => {
                    setOfflineMode(!offlineMode);
                    triggerToast(offlineMode ? 'Offline mode disabled.' : 'Offline mode cached & active.');
                  }}
                  className={`w-12 h-6 rounded-full p-1 transition-all duration-200 cursor-pointer shrink-0 ${
                    offlineMode ? 'bg-[#A3E635]' : 'bg-[#E3E8E3] dark:bg-slate-800'
                  }`}
                >
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                      offlineMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Export data */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Export your data</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Download transaction records in multiple formats.</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={exportToCSV}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export detailed CSV file"
                >
                  CSV
                </button>
                <button 
                  onClick={exportToExcel}
                  className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#1A3827] dark:text-slate-200 font-bold text-[10px] rounded-lg transition-all"
                  title="Export styled Excel spreadsheet"
                >
                  Excel
                </button>
                <button 
                  onClick={exportToPDF}
                  className="px-3 py-1.5 bg-[#1A3827] dark:bg-slate-800 text-white dark:text-slate-100 font-bold text-[10px] rounded-lg transition-all hover:opacity-90"
                  title="Open styled print PDF statement"
                >
                  PDF
                </button>
              </div>
            </div>
          </div>

          {/* Email Notification Settings */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#1A3827] dark:text-[#A3E635]" />
              <span>Email Notification settings</span>
            </h3>

            {/* Provider Select */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Notification provider</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Select how email alerts are sent when expenses are added.</p>
              </div>
              <select 
                value={notificationMethod}
                onChange={(e) => {
                  setNotificationMethod(e.target.value);
                  localStorage.setItem('notificationMethod', e.target.value);
                  triggerToast(`Notification method set to ${e.target.value === 'none' ? 'Disabled' : e.target.value === 'google-script' ? 'Google Script' : 'EmailJS'}`);
                }}
                className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 min-w-[200px]"
              >
                <option value="none">Disabled (No Emails)</option>
                <option value="google-script">Google Apps Script (Free, 100% Google-backed)</option>
                <option value="emailjs">EmailJS Service (Free tier, template-based)</option>
              </select>
            </div>

            {notificationMethod !== 'none' && (
              <>
                {/* Recipient Emails */}
                <div className="flex flex-col gap-1 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
                  <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Roommate email addresses</label>
                  <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 mb-1">Comma-separated list of emails to notify (e.g. room1@example.com, room2@example.com).</p>
                  <input 
                    type="text"
                    value={recipientEmails}
                    onChange={(e) => {
                      setRecipientEmails(e.target.value);
                      localStorage.setItem('recipientEmails', e.target.value);
                    }}
                    placeholder="roommate1@example.com, roommate2@example.com"
                    className="px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 w-full"
                  />
                </div>

                {notificationMethod === 'google-script' && (
                  <div className="space-y-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Google Apps Script Web App URL</label>
                      <input 
                        type="url"
                        value={googleScriptUrl}
                        onChange={(e) => {
                          setGoogleScriptUrl(e.target.value);
                          localStorage.setItem('googleScriptUrl', e.target.value);
                        }}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 w-full"
                      />
                    </div>

                    {/* Collapsible Setup Instructions */}
                    <details className="group border border-[#E3E8E3] dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                      <summary className="flex justify-between items-center p-3 text-xs font-bold text-[#1A3827] dark:text-slate-200 cursor-pointer hover:bg-[#F6F8F6] dark:hover:bg-slate-800 list-none">
                        <span>How to set up your free Google Apps Script</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#5C6E5C] transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-4 bg-[#F6F8F6] dark:bg-slate-950 border-t border-[#E3E8E3] dark:border-slate-800 text-[11px] text-[#5C6E5C] dark:text-slate-400 space-y-2.5 leading-relaxed">
                        <p>Follow these 3 simple steps to get email notifications working for free:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Go to <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-[#A3E635] underline font-semibold">script.google.com</a> and sign in with your Google account.</li>
                          <li>Click <strong>New Project</strong>, delete any placeholder code, and paste the code block below.</li>
                          <li>Click <strong>Deploy &gt; New Deployment</strong>. Choose <strong>Web app</strong>. Set <i>Execute as:</i> <strong>Me</strong>, and <i>Who has access:</i> <strong>Anyone</strong>. Click deploy, authorize permissions, and copy the Web App URL into the field above!</li>
                        </ol>
                        
                        <div className="relative mt-2">
                          <pre className="p-3 bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-xl overflow-x-auto text-[10px] font-mono text-[#1A3827] dark:text-slate-300 leading-normal max-h-48">
{`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.htmlBody,
      body: data.textBody
    });
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    MailApp.sendEmail({
      to: data.to,
      subject: data.subject,
      htmlBody: data.htmlBody,
      body: data.textBody
    });
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`);
                              triggerToast('Apps Script code copied!');
                            }}
                            className="absolute top-2 right-2 px-2 py-1 bg-[#1A3827] hover:bg-[#255038] text-white font-bold text-[9px] rounded-lg shadow transition-all"
                          >
                            Copy Script
                          </button>
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {notificationMethod === 'emailjs' && (
                  <div className="space-y-3 py-2 border-t border-[#F6F8F6] dark:border-slate-800">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">EmailJS Service ID</label>
                        <input 
                          type="text"
                          value={emailJsServiceId}
                          onChange={(e) => {
                            setEmailJsServiceId(e.target.value);
                            localStorage.setItem('emailJsServiceId', e.target.value);
                          }}
                          placeholder="service_xxxxx"
                          className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">EmailJS Template ID</label>
                        <input 
                          type="text"
                          value={emailJsTemplateId}
                          onChange={(e) => {
                            setEmailJsTemplateId(e.target.value);
                            localStorage.setItem('emailJsTemplateId', e.target.value);
                          }}
                          placeholder="template_xxxxx"
                          className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 w-full"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-[#1A3827] dark:text-slate-200">EmailJS Public Key</label>
                        <input 
                          type="text"
                          value={emailJsPublicKey}
                          onChange={(e) => {
                            setEmailJsPublicKey(e.target.value);
                            localStorage.setItem('emailJsPublicKey', e.target.value);
                          }}
                          placeholder="user_xxxxxx / pk_xxxxx"
                          className="px-3 py-1.5 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs focus:outline-none text-[#1A3827] dark:text-white font-semibold bg-white dark:bg-slate-950 w-full"
                        />
                      </div>
                    </div>

                    {/* Collapsible Setup Instructions */}
                    <details className="group border border-[#E3E8E3] dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300">
                      <summary className="flex justify-between items-center p-3 text-xs font-bold text-[#1A3827] dark:text-slate-200 cursor-pointer hover:bg-[#F6F8F6] dark:hover:bg-slate-800 list-none">
                        <span>How to set up your free EmailJS integration</span>
                        <ChevronDown className="w-3.5 h-3.5 text-[#5C6E5C] transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-4 bg-[#F6F8F6] dark:bg-slate-950 border-t border-[#E3E8E3] dark:border-slate-800 text-[11px] text-[#5C6E5C] dark:text-slate-400 space-y-2 leading-relaxed">
                        <p>1. Register a free account at <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-[#A3E635] underline font-semibold">emailjs.com</a>.</p>
                        <p>2. Connect an Email Service (like Gmail or Outlook) and copy your **Service ID**.</p>
                        <p>3. Create an Email Template. You can design it as you like, and use the following template variables to print the expense details:</p>
                        <ul className="list-disc list-inside pl-2 space-y-0.5">
                          <li><code>{"{{to_email}}"}</code>: Recipient's email address</li>
                          <li><code>{"{{title}}"}</code>: Expense description / item</li>
                          <li><code>{"{{amount}}"}</code>: Formatted expense cost (e.g. ₹450)</li>
                          <li><code>{"{{paid_by}}"}</code>: Roommate who paid</li>
                          <li><code>{"{{split_type}}"}</code>: Split details (e.g. Shared (50/50))</li>
                          <li><code>{"{{room_id}}"}</code>: Room workspace code</li>
                        </ul>
                        <p className="mt-2">4. Copy the **Template ID** and your account **Public Key** (from Account &gt; API Keys) into the fields above!</p>
                      </div>
                    </details>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Account & Danger zone */}
          <div className="bg-white dark:bg-slate-900 border border-[#E3E8E3] dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors duration-300">
            <h3 className="font-extrabold text-[#1A3827] dark:text-slate-100 text-sm sm:text-base tracking-tight pb-2 border-b border-[#F6F8F6] dark:border-slate-800">
              Account & Danger zone
            </h3>

            {/* Leave Room (Redirects to Onboarding Setup View) */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-2">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Leave room workspace</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Disconnect from this room. Room data remains safe in Firestore.</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm("Leave this room space? You'll be redirected back to the onboarding room setup.")) {
                    setUserRoomId(null);
                    setHasConfirmedRoom(false);
                    setTransactions([]);
                    setReceipts([]);
                    localStorage.removeItem('userRoomId');
                    if (auth.currentUser) {
                      setDoc(doc(db, 'users', auth.currentUser.uid), { roomId: null }, { merge: true })
                        .catch(err => console.error(err));
                    }
                    triggerToast("Left room workspace.");
                  }
                }}
                className="px-4 py-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-900 font-bold text-xs rounded-xl transition-all w-full sm:w-auto"
              >
                Leave room
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-[#F6F8F6] dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-[#1A3827] dark:text-slate-200">Sign out</p>
                <p className="text-[11px] sm:text-xs text-[#5C6E5C] dark:text-slate-400 mt-0.5">Sign out of your Duo Room profile on this browser.</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ==========================================
  // CUSTOM INVITE MODAL
  // ==========================================
  function renderInviteModal() {
    const currentRoom = userRoomId || roomCode;
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-5 transition-colors duration-300">
          
          <div className="flex justify-between items-center">
            <h3 className="font-black text-lg text-[#1A3827] dark:text-slate-100">Invite Roommate</h3>
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 text-center">
            <div className="w-40 h-40 bg-[#F6F8F6] dark:bg-slate-950 rounded-2xl flex flex-col items-center justify-center mx-auto border border-[#E3E8E3] dark:border-slate-800 p-4">
              <QrCode className="w-24 h-24 text-[#1A3827] dark:text-[#A3E635] stroke-[1.5]" />
              <span className="text-[9px] font-bold text-[#5C6E5C] dark:text-slate-400 uppercase tracking-widest mt-2">Scan to join room</span>
            </div>

            <p className="text-xs text-[#5C6E5C] dark:text-slate-400 leading-relaxed">
              Your roommate can scan the QR code above or use the share link below to synchronize bills instantly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text" 
              readOnly 
              value={`https://duoroom.app/invite/${currentRoom}`}
              className="flex-1 px-3 py-2 border border-[#E3E8E3] dark:border-slate-800 rounded-xl text-xs font-mono text-[#5C6E5C] dark:text-slate-300 dark:bg-slate-950"
            />
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`https://duoroom.app/invite/${currentRoom}`);
                triggerToast('Copied share link!');
              }}
              className="p-2.5 bg-[#1A3827] dark:bg-[#A3E635] text-white dark:text-slate-950 rounded-xl hover:opacity-90 transition-all"
              title="Copy link"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex justify-end pt-2 border-t border-[#F6F8F6] dark:border-slate-800">
            <button 
              onClick={() => setIsInviteModalOpen(false)}
              className="px-5 py-2 bg-[#1A3827] dark:bg-slate-800 text-white rounded-xl text-xs font-bold hover:opacity-90"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // QR SCANNER SIMULATOR
  // ==========================================
  function renderQrScanner() {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-xl overflow-hidden border border-[#E3E8E3] dark:border-slate-800 p-6 space-y-4 transition-colors duration-300 text-center">
          <div className="flex justify-between items-center pb-2 border-b border-[#E3E8E3] dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-[#1A3827] dark:text-slate-100">Scan QR Code</h3>
            <button 
              onClick={() => setIsQrScannerOpen(false)} 
              className="p-1 rounded-full hover:bg-[#F6F8F6] dark:hover:bg-slate-800 text-[#5C6E5C] dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scanner view */}
          <div className="relative w-64 h-64 mx-auto rounded-2xl border-2 border-[#1A3827] dark:border-[#A3E635] overflow-hidden flex items-center justify-center bg-slate-950">
            {/* The real camera scanner renders here */}
            <div id="reader" className="absolute inset-0 w-full h-full"></div>
            
            {/* Corner brackets overlay */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#A3E635] z-10 pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#A3E635] z-10 pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#A3E635] z-10 pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#A3E635] z-10 pointer-events-none"></div>
            
            {/* Scanning line overlay */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#A3E635] shadow-[0_0_8px_#A3E635] animate-scan z-10 pointer-events-none"></div>
          </div>

          <p className="text-[11px] text-[#5C6E5C] dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
            Point your device camera at your roommate's room QR code. Make sure you are using secure HTTPS.
          </p>
        </div>
      </div>
    );
  }

}
