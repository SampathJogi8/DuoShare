# 🚀 DuoShare Changelog

All notable changes to this project will be documented in this file.

### 3.2.1 (2026-07-27)


### ⚡ Performance Improvements

* cache user rooms in localStorage for instant loading ([22cd75f](https://github.com/SampathJogi8/DuoShare/commit/22cd75fe146decf3592575849c7010e6444b34e3))


### 🎨 Styling & UI polish

* change (Edited) badge color to red ([4dfbbea](https://github.com/SampathJogi8/DuoShare/commit/4dfbbea402297ab97e93b37943d800da9ecbb860))
* fix oversized elements and modal container overflows on mobile ([97a12cb](https://github.com/SampathJogi8/DuoShare/commit/97a12cb4130b7d9256b34bcad3c3bc5df8db4f86))
* highlight the word 'edited' in red in activity logs ([afcc64c](https://github.com/SampathJogi8/DuoShare/commit/afcc64c35d69d97c4d62f24168d3d8874d9e861c))


### ♻️ Code Refactoring

* resolve all linter warnings, remove unused state variables and catch bindings to achieve code perfection ([3269b2d](https://github.com/SampathJogi8/DuoShare/commit/3269b2dda2440192a47eb4b1975de2a1e56b41d3))
* restrict Paid Back feature exclusively to Fund Tracker section ([c4cb762](https://github.com/SampathJogi8/DuoShare/commit/c4cb7622f7c3959ca60ea321d404455aebdd77d2))


### ⚙️ Maintenance & Tooling

* bump version to 3.1.8 ([4d378a3](https://github.com/SampathJogi8/DuoShare/commit/4d378a3c9ac90e088828fbac20b52161d433073a))
* dummy commit to test dynamic version increment ([23c4e24](https://github.com/SampathJogi8/DuoShare/commit/23c4e247241d808c4f728d94c2a7ab2379436925))
* implement dynamic pre-commit version bumping in package.json ([e2d3c8c](https://github.com/SampathJogi8/DuoShare/commit/e2d3c8cdd4e5b38e8ec16155d2975a072f93f774))
* **release:** configure MNC-level automated SemVer pipeline, changelogs, and CI workflows ([a2021cd](https://github.com/SampathJogi8/DuoShare/commit/a2021cdfa66fcb2a3bd7c13f4b3fe3aa628492cd))
* **version:** sync build.gradle to 3.1.50 ([d8ab5a1](https://github.com/SampathJogi8/DuoShare/commit/d8ab5a1a63f6077b122d102dc305ce66bb800220))
* **whatsapp:** completely remove WhatsApp feature, helpers, and settings ([96d29ef](https://github.com/SampathJogi8/DuoShare/commit/96d29ef611acec271e08502774b2bbe4ba2447a4))


### 🐛 Bug Fixes

* activeLimit and monthSharedSpend ReferenceError in renderHome ([d75424a](https://github.com/SampathJogi8/DuoShare/commit/d75424aa1f01b1071db347dd816471649571363e))
* add email notification dispatch to expense merge updates ([bd02b39](https://github.com/SampathJogi8/DuoShare/commit/bd02b3948f00f9b90959f8af5aae7da48eb50939))
* add global diagnostic overlays and view component encapsulation to catch runtime errors ([c0ad135](https://github.com/SampathJogi8/DuoShare/commit/c0ad1353c6609d2c30b62810f9860c694016210e))
* Add user to fetchTransactions dependency array to resolve stale closure ([b1ac439](https://github.com/SampathJogi8/DuoShare/commit/b1ac4390d6566590927d966baae6ca91aa7f777c))
* address various bugs found in site audit, including dynamic greeting, host roommate deletion refetching, and smart-pick override bugs ([f705be7](https://github.com/SampathJogi8/DuoShare/commit/f705be7cbd1533c994ae613522f9c4454f028946))
* allow decimal inputs for expense amounts, splits, and settle balances ([f59c45d](https://github.com/SampathJogi8/DuoShare/commit/f59c45dd71c55c35947f684758ffafb958b7e2a1))
* attach real inserted and edited transaction IDs to email notifications and eliminate TX-N/A ([11fe00e](https://github.com/SampathJogi8/DuoShare/commit/11fe00eefa962fef918035d48b66f22d5324bd53))
* **bills:** correct image_url database column mapping for bill inserts ([f547e99](https://github.com/SampathJogi8/DuoShare/commit/f547e9997c5266bdd9b73a795600b4532a789d47))
* **bills:** eliminate invalid image_url column from insert payload and encode category in split/splits ([0702374](https://github.com/SampathJogi8/DuoShare/commit/070237488fa5b08a048ef8b012c66e7b80689ebd))
* **bills:** fix user UID resolution and add optimistic UI rendering for new bills ([d386a5b](https://github.com/SampathJogi8/DuoShare/commit/d386a5b705f78938b39affd70a4ec3765de70f18))
* **bills:** make overdue status badge bold red and update field label to Assigned Payer (Who pays vendor) ([3b226af](https://github.com/SampathJogi8/DuoShare/commit/3b226afefce169f1e09668deb7659c9b2147d27d))
* capture email on code login + send alerts to all members with real emails incl. self ([27aac01](https://github.com/SampathJogi8/DuoShare/commit/27aac016cc922c80b26d74cc4ef12556c6d30d85))
* change default personalCap fallback from 10k to 2500 ([0663238](https://github.com/SampathJogi8/DuoShare/commit/06632382fd4755ef994cc87f12f6b2c1b1e504dc))
* **ci:** update GitHub Actions workflow to use npm install and sync lockfile ([2549ff8](https://github.com/SampathJogi8/DuoShare/commit/2549ff87c7ec2a20606b56b18185ed9b9092b3bc))
* Convert fund action arrow-functions to hoisted function declarations ([1fc7584](https://github.com/SampathJogi8/DuoShare/commit/1fc7584663b195bfc453d25c292e8eb76f949074))
* correct invalid Tailwind color classes to fix white input boxes in dark mode ([6f30789](https://github.com/SampathJogi8/DuoShare/commit/6f30789b441ab6571ca93ed35c29003c5e8555cf))
* correct receipt file type labels in edit log and deduplicate history entries ([53873df](https://github.com/SampathJogi8/DuoShare/commit/53873df0a342c69fe21690fa32c40af8bc9d6845))
* define receiver variable in renderSettleModal to resolve ReferenceError ([1638c48](https://github.com/SampathJogi8/DuoShare/commit/1638c48478834bccb04624fe793421b1569102f3))
* delete corresponding receipt when a transaction is deleted ([1f28359](https://github.com/SampathJogi8/DuoShare/commit/1f283597fe5476a4d76bb5e60bca8c1e65c6ec2e))
* dispatch email notifications on expense add, update, and settlement ([d019ef7](https://github.com/SampathJogi8/DuoShare/commit/d019ef7fa15426e0a4b96f991b9d7688ef9f8e7e))
* dispatch email notifications zero-latency and concurrently for expense updates and settlements ([aec2cc1](https://github.com/SampathJogi8/DuoShare/commit/aec2cc1cf85c4c299f5fb8319c48958397c4e346))
* display split percentages/amounts in ledger and resolve mobile layout truncation ([5ac8547](https://github.com/SampathJogi8/DuoShare/commit/5ac8547f3365d079636dcd7f7b71d5ea3336e8d2))
* ensure fund tracker logs are only visible to their creator and hidden from other roommates ([5f49d63](https://github.com/SampathJogi8/DuoShare/commit/5f49d6394940fc554c0fa10d50de1a558bc06dc9))
* exclude fund init and spend transactions from VIP analytics modal calculations ([242faf1](https://github.com/SampathJogi8/DuoShare/commit/242faf170b64374ad3c313b5df5fba53831b0212))
* exclude payments from ledger statistics cards and exported excel/pdf summary totals ([53954c4](https://github.com/SampathJogi8/DuoShare/commit/53954c4092154ad0a59ef97380e9bde7a2664c89))
* exclude personal expenses from room budget calculation ([345e2e5](https://github.com/SampathJogi8/DuoShare/commit/345e2e5f1589708df2531226f105fae6e575f92e))
* force Google prompt on login and verify account deletion against RLS policies ([780e652](https://github.com/SampathJogi8/DuoShare/commit/780e6524078ed620cf33aeef2eff0a10fee048e7))
* format currency to exact decimals in formatINR and preserve decimals in quick settle ([1452a70](https://github.com/SampathJogi8/DuoShare/commit/1452a7012f30932e04ebf0b3dc9108b31455f7c4))
* fully decouple email from DB write — email errors can no longer cause Saved Locally toast ([e1a0b7d](https://github.com/SampathJogi8/DuoShare/commit/e1a0b7daa35b34a6645a6401f9ac24b4b4cd816e))
* implement custom dynamic version progression based on git commit count (resets to 0 after 10) ([c437471](https://github.com/SampathJogi8/DuoShare/commit/c437471d66f327f4dc8e73c77ef0365e10ee9513))
* infinite rendering loop on auth state change ([b4fe75e](https://github.com/SampathJogi8/DuoShare/commit/b4fe75e62757cb8b98d7b346d339860e6c06c13f))
* issue reporter, Insights trend chart, per-member % accuracy, daily avg label ([28fad70](https://github.com/SampathJogi8/DuoShare/commit/28fad70af6697fd30ebc6154ed20210cbd66d719))
* make email dispatch safe against numeric errors and query Supabase DB directly for member emails ([5ed53a2](https://github.com/SampathJogi8/DuoShare/commit/5ed53a21c8365d398a3332602d3e3f411665c3cf))
* optimistically update UI after settling up or deleting an expense ([1933d74](https://github.com/SampathJogi8/DuoShare/commit/1933d7497bae5c16a0c205b548a23098cee02069))
* optimize Tallyin Diamond VIP Room Insights modal layout for mobile view fitting ([8b206f6](https://github.com/SampathJogi8/DuoShare/commit/8b206f65bfdae9f3696cc77c566ca036f28aae30))
* order transactions by date and created_at descending so newest are first ([1c7c5f1](https://github.com/SampathJogi8/DuoShare/commit/1c7c5f10cc12b2772c809c1fdaeebebc53d8446a))
* prevent activity logs from leaking across rooms ([f9ef507](https://github.com/SampathJogi8/DuoShare/commit/f9ef507b3b8f8136021aec6d080dc78c6a7baf9e))
* prevent cross-room receipts and transactions leak in real-time listeners and database uploads ([777db3b](https://github.com/SampathJogi8/DuoShare/commit/777db3b402d4259cbbe11233f0b5a32940a22d19))
* prevent double posting of recurring expenses by disabling button during submission ([33f9561](https://github.com/SampathJogi8/DuoShare/commit/33f9561ac5611cc72b2f3948d2e4fdc2c75fdd60))
* prevent number input value changing when scrolling ([cbe9a2e](https://github.com/SampathJogi8/DuoShare/commit/cbe9a2ed201bfd3dcb994ee60d4dc58edb99cbf5))
* prevent QR scanner crash on close by guarding stop() with isRunning flag ([49c2494](https://github.com/SampathJogi8/DuoShare/commit/49c2494131cfe09adb681348a068a58fa8dc619e))
* prompt user to confirm display name on login ([9b498ba](https://github.com/SampathJogi8/DuoShare/commit/9b498ba5ef8585da21ebbf681fc446237f0b1b0d))
* refactor dynamic Fairness Score logic to count settlements (Payment category) as balancing contributions ([83970f4](https://github.com/SampathJogi8/DuoShare/commit/83970f462039493bfc9610af808c04ef66085264))
* refine settle up suggestion logic for settled users and round balances to avoid owes 0.00 UI bugs ([0bafc6d](https://github.com/SampathJogi8/DuoShare/commit/0bafc6df95226ea11a344404d1706dbbf1015096))
* remove redundant QR scanner useEffect that was crashing the app on close ([c181e1d](https://github.com/SampathJogi8/DuoShare/commit/c181e1d37813ace43f551b3590ace8a96bf77f9e))
* remove stale recipientEmails guard — activity alert emails were never firing ([7d81481](https://github.com/SampathJogi8/DuoShare/commit/7d81481cb90a41d2d3fde64852e2cc8cb82bc47d))
* rename title and login subtitle to just Tallyin ([1bfc18c](https://github.com/SampathJogi8/DuoShare/commit/1bfc18ca7e4a55268aec24707ea11f5392544929))
* replace .catch() on Supabase builders with async IIFE try/catch ([bef0060](https://github.com/SampathJogi8/DuoShare/commit/bef0060be75643bb25c69e4f1fb9c90914bdc65d))
* report specific Gemini API error messages in chatbot UI ([d91fa31](https://github.com/SampathJogi8/DuoShare/commit/d91fa317126c8feb3ad1e8173ae566a19141e0ff))
* reset add/edit expense form state when modal closes and adjust modal text to match current action mode ([7ac6b75](https://github.com/SampathJogi8/DuoShare/commit/7ac6b75bd532a86b67a7fde8b89a51b6db880ddc))
* reset onboarding step to selection when leaving or deleting a room ([e4bef88](https://github.com/SampathJogi8/DuoShare/commit/e4bef88623f43d879a6b4a467618694c9d9add00))
* resolve blank page crash in Personal Expenses by adding safety checks and ErrorBoundary ([1fbea4d](https://github.com/SampathJogi8/DuoShare/commit/1fbea4dcfb511747066b4b5f395910bad15e7df7))
* resolve calculations and limit cap display bugs in Insights page under All Time mode ([bcd2599](https://github.com/SampathJogi8/DuoShare/commit/bcd2599be80f37f562bb4600c820a031bf44fe44))
* resolve hardcoded v2.4 base version in vite config, pulling dynamically from package.json instead ([30a85c2](https://github.com/SampathJogi8/DuoShare/commit/30a85c2c07a885dcd8050553724011c2a3b7d146))
* resolve page scrolling limit, optimize double-fetching on room switch, and exclude settlements (Payment) from spending metrics and trends ([4b3d725](https://github.com/SampathJogi8/DuoShare/commit/4b3d725989d9383ef1accf456c11c5ffce974016))
* resolve personal expense paidByUid initialization bug and fallback safeguard to prevent balance divergence ([51f9e33](https://github.com/SampathJogi8/DuoShare/commit/51f9e33bab183b4acf6931db61a0013b843f205a))
* resolve quick add percentage load and mobile layout issues ([7501cf7](https://github.com/SampathJogi8/DuoShare/commit/7501cf7e0d17c1cb70409698f9423b0249dcf37b))
* resolve room switching state retention and real-time sync issues ([4be5a87](https://github.com/SampathJogi8/DuoShare/commit/4be5a87aa598d4de4985a7d1a6ce0a472cedec65))
* resolve temporal dead zone ReferenceError for openAddPersonalExpense ([2cbcd4f](https://github.com/SampathJogi8/DuoShare/commit/2cbcd4ffbc49a8522e0d19b80114b6c52f18c924))
* resolve text overflow bugs for long payment titles and roommate nicknames in lists ([81932ba](https://github.com/SampathJogi8/DuoShare/commit/81932ba0d20da206b0e48bddcd75872a65e32986))
* resolve time display leaking raw JSON history and fix updates/uploads latency by updating receipts state immediately ([d421cbd](https://github.com/SampathJogi8/DuoShare/commit/d421cbd2210e154fb334cc7f01c343a8bbc290c7))
* resolve timezone-offset date bugs and add manual refetch fallback handlers on expense mutations ([102649c](https://github.com/SampathJogi8/DuoShare/commit/102649c0a07e8608c5cc532ca7143767302dc9eb))
* resolve type mismatch in split comparisons and auto-merge duplicate fund spends on form submission ([e1ec3b5](https://github.com/SampathJogi8/DuoShare/commit/e1ec3b5714b1ec835c9c0c863d06fc3db99e9e6c))
* resolve TypeError when calling export functions from Settings page by checking list parameters and updating onClick handlers ([3a5f3f8](https://github.com/SampathJogi8/DuoShare/commit/3a5f3f87e63dbe01479e32915fd277190ef1e7c2))
* restore sidebar scrollability on small viewports and exclude payments from home budget card, exports, and VIP insights modal ([ad679ee](https://github.com/SampathJogi8/DuoShare/commit/ad679ee67227770483e8790247022995d18b71bb))
* revert Audited category to original when audit mode is turned off ([db3797d](https://github.com/SampathJogi8/DuoShare/commit/db3797d62fad6e3beb939a0822184394fa426cde))
* revert hasConfirmedRoom initialization to show room selection screen on load ([668221c](https://github.com/SampathJogi8/DuoShare/commit/668221c256140d0f053905c54eb9956be1f60362))
* room budget and personal expense meter month filtering on home screen ([0fa3c07](https://github.com/SampathJogi8/DuoShare/commit/0fa3c07a981829fb5d0ddc8a8d7fa5703134a1ab))
* sanitize timestamp string to remove raw edit history JSON and remove duplicate update email trigger ([71c45ed](https://github.com/SampathJogi8/DuoShare/commit/71c45edb8e1b56bc2d6e90ceb23f0754c89a7e9e))
* set split method to Direct Settlement Transfer for payments and show dedicated Settlement Payment Details card in email ([b8fab56](https://github.com/SampathJogi8/DuoShare/commit/b8fab5637177b7dd702b994a8c3f5a368754dae1))
* show Tallyin name explicitly in sidebar, email & PDF headers ([a09b4f1](https://github.com/SampathJogi8/DuoShare/commit/a09b4f1d5bff8e80a790236bc18deb009dd4af0d))
* Use hidden iframe for PDF statements printing to bypass popup blockers ([debf28c](https://github.com/SampathJogi8/DuoShare/commit/debf28ca2a201454b337a2b5e68edcf5507c7a77))
* use try/catch around scanner.stop() since html5-qrcode throws synchronously ([531d624](https://github.com/SampathJogi8/DuoShare/commit/531d6248051f9641c0c49af2b7f74462495e3120))


### ✨ Features

* adapt all 3 logo variants by context + auto-send monthly statements on 5th of each month ([844d68c](https://github.com/SampathJogi8/DuoShare/commit/844d68cde6af0e68a0f599edd1652f82c9bf82fd))
* add capacitor configuration and wrap web app into android project folder ([8a41e4a](https://github.com/SampathJogi8/DuoShare/commit/8a41e4a5d57e29e27841c5c6535c072644b9073d))
* add date-filtered and all-time activity log CSV download options ([a48a9da](https://github.com/SampathJogi8/DuoShare/commit/a48a9da832b5bfaa68e330cf5b53a76d9e4f9e04))
* add delete account option ([87f119d](https://github.com/SampathJogi8/DuoShare/commit/87f119d595e2a15eb9b893a825b09d751fbaa532))
* add email notifications setup guide to settings ([cf2d55a](https://github.com/SampathJogi8/DuoShare/commit/cf2d55ad134ad6b4c6c0c49f32221d3aee12496f))
* add Email Statement button to send CSV, Excel, and PDF attachments via Apps Script ([97b2c0c](https://github.com/SampathJogi8/DuoShare/commit/97b2c0c1d14b836d8110b72549afbd5378bebf03))
* add homescreen icon support (apple-touch-icon and webmanifest) ([85ba57a](https://github.com/SampathJogi8/DuoShare/commit/85ba57a8d16a73b6a4a669bdac1e2536ebf33160))
* Add Inflow/Received payments support to Fund Tracker ([c1c1a1b](https://github.com/SampathJogi8/DuoShare/commit/c1c1a1b26deb2196deed7fc63e0c7fa5e9ba3188))
* add instant UPI payment QR and link settlement to Settle Up modal ([1e3435f](https://github.com/SampathJogi8/DuoShare/commit/1e3435f274768cbc7fec36e4f7ddb67c94d43d92))
* Add isolated private Fund Tracker section ([661b005](https://github.com/SampathJogi8/DuoShare/commit/661b005bc6a0b716e84247cbc2110497d04ba671))
* add loading state for user spaces on onboarding screen ([a369894](https://github.com/SampathJogi8/DuoShare/commit/a3698945e9579b56fcd5ff9098186eed3d3064a3))
* Add official logoIcon to print PDF statement headers ([22ff076](https://github.com/SampathJogi8/DuoShare/commit/22ff07622af13918a8238cfda57c7408e110e117))
* add option to link personal expenses to fund tracker ([af0e1e7](https://github.com/SampathJogi8/DuoShare/commit/af0e1e71c5b5270313300a7553ae7bbc1b3b73cd))
* Add PDF and Excel export features to Fund Tracker detailed view ([8b5144c](https://github.com/SampathJogi8/DuoShare/commit/8b5144c6cebd1696d367ca51ab316741c854c1f7))
* Add People category and auto-categorization for friends/family/names ([ed7f8d8](https://github.com/SampathJogi8/DuoShare/commit/ed7f8d816ef70bf8de15ce0212ccefaac6557e31))
* add projection, largest expense, and average bill size cards to insights tab ([7123d72](https://github.com/SampathJogi8/DuoShare/commit/7123d728ae1626b2f826dc0635c2a4b17e247332))
* Add Room Name support during creation and settings renaming ([1fe8c28](https://github.com/SampathJogi8/DuoShare/commit/1fe8c281e1440f4ff1ae077163ec10f16bcd4a69))
* add targeted statements for Room, Personal and Fund tracker ledgers ([d3bc002](https://github.com/SampathJogi8/DuoShare/commit/d3bc0022cb177bb0f0c17f421e5602711f9179a2))
* adjustable personal expense limit with inline edit on meter card ([e7f3ed4](https://github.com/SampathJogi8/DuoShare/commit/e7f3ed45904ef6264d14c3703e796bff22db3660))
* allow attaching receipt while adding/editing expense and support converting HEIC images to JPEG on the fly ([9f047a1](https://github.com/SampathJogi8/DuoShare/commit/9f047a1aabec04e228d9e768d23c723f8cf18c35))
* allow PDF and Excel files in receipts ([b1531b6](https://github.com/SampathJogi8/DuoShare/commit/b1531b67b88c399d838886fd2493375fc9466a84))
* audit receipt image changes and show Added receipt images details in history log instead of general expense edited log ([ac388ca](https://github.com/SampathJogi8/DuoShare/commit/ac388cac530f771a14a517983eba9d1fe9391681))
* auto-populate recipient emails from Google Sign-in roommates ([bb0ce30](https://github.com/SampathJogi8/DuoShare/commit/bb0ce308d3eefbb050a2c90642cbf364de5518ee))
* clearer insights breakdown, improved PDF, fix logActivity RLS logging, fix DUO ROOM branding ([291c07f](https://github.com/SampathJogi8/DuoShare/commit/291c07f161569b0ec4ff0791ffa4298b8cead4a6))
* consolidate statement delivery to a single Email Monthly Statements button ([472a3b8](https://github.com/SampathJogi8/DuoShare/commit/472a3b816011b7016def547318a044b3e39cebc9))
* crop favicon image to fit browser tabs perfectly ([c88ce33](https://github.com/SampathJogi8/DuoShare/commit/c88ce33a989493ad5838f8cf4a2afcaaddb49df4))
* enable delete receipt button and restrict auto-creation of receipts to transactions with attached images ([55ce52e](https://github.com/SampathJogi8/DuoShare/commit/55ce52e1d9beb7560b22246e352c9056f5559e88))
* enable option to attach receipt image to auto-created transaction receipts in gallery ([7ea1480](https://github.com/SampathJogi8/DuoShare/commit/7ea14801e8c409ae82af3fa0e4ffe071f8dfcc81))
* enforce display name confirmation before showing room options ([1e4b948](https://github.com/SampathJogi8/DuoShare/commit/1e4b94879fa834979fe846c7d00a19845cf984f6))
* force 12-hour format for all newly created transaction and activity log timestamps ([3a94c73](https://github.com/SampathJogi8/DuoShare/commit/3a94c73da550cae7d2f617a0374423049e8adb38))
* format and style delete and settle actions in activity logs ([3ea017d](https://github.com/SampathJogi8/DuoShare/commit/3ea017d2e67d43b38d760992c33a056d475d5ab9))
* fully automate roommate email list and remove recipientEmails setting input field ([69cca33](https://github.com/SampathJogi8/DuoShare/commit/69cca33b078533b790ec36c01b1fbe3f00e1edca))
* host permissions, leave room, optimistic UI, zero-latency fixes, room log ([c00e15d](https://github.com/SampathJogi8/DuoShare/commit/c00e15d9631ee3a8c720aab5ba8021730b84320d))
* implement 15 features including Activity Feed, Onboarding, Push Alerts, comments, and OCR ([b2f51c2](https://github.com/SampathJogi8/DuoShare/commit/b2f51c2d98cc80a1b412ff57a633b91fab66c1db))
* implement Paid Back toggle feature for Fund Tracker spends ([80544f8](https://github.com/SampathJogi8/DuoShare/commit/80544f8aae1bdc0610b1c9e22b2a63585b682d5c))
* implement Paid Back toggle feature for roommate transactions and adjust balance calculations ([2ad2d20](https://github.com/SampathJogi8/DuoShare/commit/2ad2d20acba9b19ecdcd83a1a6c5d43a7368473d))
* implement real-time duplicate payment merging inside Fund Tracker Record Payment form ([44324a0](https://github.com/SampathJogi8/DuoShare/commit/44324a0e91c8aeb7e09f597c8e479adcc9aad00d))
* implement real-time duplicate transaction detection and merging option in Add Expense form ([9fb7df1](https://github.com/SampathJogi8/DuoShare/commit/9fb7df1f43f18495a040148515902cd2b01141c4))
* implement receipt image file persistence via base64, polaroid visual preview, fullscreen zoom lightbox, and download action ([3af4a22](https://github.com/SampathJogi8/DuoShare/commit/3af4a2205162b8b811990660e341820518dc3ee9))
* implement Shared Shopping Board (with 1-click ledger splits) and Chores Rotation Chart (with auto-assignee rotation and scheduling) ([e8eb17d](https://github.com/SampathJogi8/DuoShare/commit/e8eb17db9e730ccf86ba7e304c71822d4be7f538))
* implement unique 6-character access code login flow and settings widget display ([3d27fc1](https://github.com/SampathJogi8/DuoShare/commit/3d27fc13db35748aab4edfcbb183eafcd6a233c5))
* include human-readable Transaction ID in email alerts, monthly statement exports, and web app UI ([6cca384](https://github.com/SampathJogi8/DuoShare/commit/6cca3840da376075dbc8925548aad73adf077610))
* integrate Google Gemini AI assistant and resolve remaining trend chart scope and search bar reset issues ([8d7f640](https://github.com/SampathJogi8/DuoShare/commit/8d7f64046ab0cff80f3a75d8a778b9620ac16565))
* integrate official Tallyin logos into onboarding, sidebar, and navbar views ([bdd9399](https://github.com/SampathJogi8/DuoShare/commit/bdd93991a692af907815ce5a6232cad239eba802))
* integrate Tallyin centralized email service and update setup guide ([0b666d5](https://github.com/SampathJogi8/DuoShare/commit/0b666d50e87bce062aa4be67f99e472b77c70ad0))
* introduce toggleable Audit mode with checkbox controls inside Fund Tracker ([4fc06ef](https://github.com/SampathJogi8/DuoShare/commit/4fc06ef5fdd189b1da5eb26a0ad8601b0e2e6da3))
* live PDF iframe preview in zoom modal and form thumbnails ([358627e](https://github.com/SampathJogi8/DuoShare/commit/358627e6696ad6b5b5e79f267020e7375eba8509))
* make spending trend chart and fairness score fully dynamic in Insights view ([6493ca3](https://github.com/SampathJogi8/DuoShare/commit/6493ca3eef525616e2e0657bc43398e4489b538c))
* make transaction edit change-detection fully automatic without prompting for edit reason ([6e71733](https://github.com/SampathJogi8/DuoShare/commit/6e71733d5b766f4765e80e5eed923272245d6d80))
* make transaction edit optimistic and show friendly Gemini API quota errors ([f2a4b7f](https://github.com/SampathJogi8/DuoShare/commit/f2a4b7f2356d8c4a4a42e3b06abb7836d9adb912))
* mark instant upi settlement as optional ([5195933](https://github.com/SampathJogi8/DuoShare/commit/5195933f1dc851be9c09784a19cdd41be29ca7dd))
* move display name to a dedicated Profile section in settings ([3b1becf](https://github.com/SampathJogi8/DuoShare/commit/3b1becf800ce1b06c37c4015e908f84f2822ce49))
* **notifications:** add 2-day advance and due date browser push and email alerts for bills ([aad2e53](https://github.com/SampathJogi8/DuoShare/commit/aad2e539dd09f76e73327fb907bfa04e6b2f8660))
* personalize email greetings with recipient roommate name ([935f589](https://github.com/SampathJogi8/DuoShare/commit/935f58947f63dca073ee46f9b77ea3979fa5549b))
* prevent personal expenses sidebar wrap and add personal expenses spending insights support ([8ae4fc5](https://github.com/SampathJogi8/DuoShare/commit/8ae4fc570ce0b493246dd85f7d777f0e84dfd78a))
* prompt for edit reason and show detailed changes audit timeline when clicked on (Edited) ([2f653f2](https://github.com/SampathJogi8/DuoShare/commit/2f653f2df311209c43b6814cd71b63896d95e7f9))
* query general activity logs as fallback for historical edits to show who edited them and when ([cf7b127](https://github.com/SampathJogi8/DuoShare/commit/cf7b12759994c8423bf2acf032df7090b562d564))
* rebrand to Tallin, implement onboarding wizard, sidebar switcher, personal expenses, transaction permissions, and activity logs ([6c1c46c](https://github.com/SampathJogi8/DuoShare/commit/6c1c46c4d41a5aa1dc8e6600f24f38846d94f8d4))
* rebrand to Tallyin, improve onboarding with room selector list, and clear active room on deletion ([9990c48](https://github.com/SampathJogi8/DuoShare/commit/9990c4892cc23f1d4d00a71fad618d14f262a083))
* remove Fund tracker statement from monthly email distribution ([15cc657](https://github.com/SampathJogi8/DuoShare/commit/15cc65758e3a442ed89ee6bca98d0e42a20617a1))
* rename Tallyin AI to Divvy ([0727dca](https://github.com/SampathJogi8/DuoShare/commit/0727dca003d408d6b2679f8f00b58dc3a21d5e4d))
* render personal expense meter on dashboard and make homescreen icon background solid white ([a54fb12](https://github.com/SampathJogi8/DuoShare/commit/a54fb12de34107a525120e138b247b4e1060dfc3))
* restore normal categories on toggling Audit mode off using getDisplayCategory dynamic resolver ([9142cb4](https://github.com/SampathJogi8/DuoShare/commit/9142cb47ca71d381201fc4ca1e8e40f4ce401c2f))
* show (Edited) badge on altered transactions ([03cc867](https://github.com/SampathJogi8/DuoShare/commit/03cc8675b4f200326877090649ff96d4d92b276b))
* show exactly who owes whom and how much, adding Suggested Transfers section and Settle shortcuts ([59d99c3](https://github.com/SampathJogi8/DuoShare/commit/59d99c300a2fb2d2fe14572068ccef2cfed1a8e0))
* show QR code on room creation share-code step with download option ([a93cd77](https://github.com/SampathJogi8/DuoShare/commit/a93cd77e76e9bc4927b3ea2da3d4f286ca8f860d))
* show unchangeable lodging time in ledger list, personal list, and home recent activity list ([61df356](https://github.com/SampathJogi8/DuoShare/commit/61df356ce7b9cf5e213fda3fb44fe35bfd7d9adb))
* show user and roommate profile pictures directly from Google auth metadata ([61fb213](https://github.com/SampathJogi8/DuoShare/commit/61fb213019061ab3ae1cf7cd49b61d49fece2a31))
* smart category auto-detection from expense title + hide own personal expenses from ledger ([30e1bc8](https://github.com/SampathJogi8/DuoShare/commit/30e1bc8235cadc868a1ba569bd0da24e1ff5ea9f))
* streamline email settings UI with toggle switch and remove setup guide ([8671051](https://github.com/SampathJogi8/DuoShare/commit/86710513c8f6ba59da7f9aa772ee13fdf9014ab3))
* support multiple images (up to 4) per transaction receipt ([d559dca](https://github.com/SampathJogi8/DuoShare/commit/d559dca54146f59eda5a539fc70e03d69658c64b))
* track split modifications and show who made edits, what was added, removed, or changed in split shares as bulleted lists ([f3dec59](https://github.com/SampathJogi8/DuoShare/commit/f3dec591d259f6d5c1b49cb0734a4fa5f16bb2da))
* turn Tallyin Diamond status button into an interactive VIP Room Analytics & Debt Settlement Dashboard ([9248433](https://github.com/SampathJogi8/DuoShare/commit/924843397c4538888661f3636349966b06bff82f))
* update site favicon to use the new transparent green/teal logo ([2efa5c5](https://github.com/SampathJogi8/DuoShare/commit/2efa5c5ee279e5730e516093ab2dba6a308f02ca))
* update Tallyin Diamond VIP Insights modal to filter month-wise and optimize for mobile screens ([2f15da1](https://github.com/SampathJogi8/DuoShare/commit/2f15da129ca0b49a655373cbe85851aa7e63c8b6))
* upgrade email notification layout with comprehensive details, category badge, timestamp, and roommate share breakdown table ([22ddab7](https://github.com/SampathJogi8/DuoShare/commit/22ddab78aae8619f4666e3fa89147f65b4dd6406))
* upgrade spending insights dashboard and fix monthly trend chart rendering ([bf60abd](https://github.com/SampathJogi8/DuoShare/commit/bf60abd7e42c01954352c36838aeb9a04d85285d))
* use cropped centered logo for logo_full and logo_icon ([07a28a3](https://github.com/SampathJogi8/DuoShare/commit/07a28a33e8f462cbd9e4ef6225780c425810290e))
* use new custom Tallyin logo icon as the website favicon ([342e0d8](https://github.com/SampathJogi8/DuoShare/commit/342e0d8e1736e14629a3185d7552c580a438380a))
* **whatsapp:** add 1-click whatsapp bill due reminders, room invites, and alerts ([d178622](https://github.com/SampathJogi8/DuoShare/commit/d1786228d040040241ec04033ae5d4c9ad7b9335))
* **whatsapp:** add 100% automated background whatsapp messaging via Meta Cloud API / Relay Gateway ([bf88c57](https://github.com/SampathJogi8/DuoShare/commit/bf88c57ed2d7e7d9f1e57dbf7d77a04f03ce3b26))
* **whatsapp:** connect central automated whatsapp dispatcher to Tallyin active script relay and add test alert button ([d54b9d2](https://github.com/SampathJogi8/DuoShare/commit/d54b9d291a04900d7febc7d153f6ad5dd4f62d50))
* **whatsapp:** implement Meta WhatsApp Cloud API Direct Background Dispatcher (Option 2) with free tier support ([108aa9e](https://github.com/SampathJogi8/DuoShare/commit/108aa9edd04051d99f20b45ac040b9ccd2d035e1))
* **whatsapp:** implement Tallyin central automated zero-setup whatsapp dispatch system ([57385d6](https://github.com/SampathJogi8/DuoShare/commit/57385d6a482908f077f7b35169231679ef245967))

## [3.1.49] - 2026-07-26

### ✨ Features
- Replaced household Chores rotator module with dedicated **Bills & Subscriptions** management board.
- Added **🔒 Private Personal Bill** option (private bills are hidden from other roommates and logged as private expenses).
- Added multi-currency symbol support and automatic merchant/category detection.

### 🐛 Bug Fixes
- Upgraded receipt OCR parser with canvas image preprocessing, strict word-boundary matching (`\b`), thousands separator handling (`1,250.00` -> `1250.00`), and exclusion filters for 10-digit mobile numbers, date years, GSTINs, and PIN codes.

### ⚙️ Maintenance & Tooling
- Configured automated SemVer release pipeline (`standard-version`, `.versionrc.json`).
- Added cross-platform version synchronization script (`scripts/sync-version.js`) for `package.json`, `package-lock.json`, and `android/app/build.gradle` (`versionName` & `versionCode`).
- Added GitHub Actions CI/CD workflows (`.github/workflows/ci.yml` and `.github/workflows/release.yml`).
