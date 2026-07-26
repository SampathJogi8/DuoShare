# 🚀 DuoShare Changelog

All notable changes to this project are documented in this file.

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
