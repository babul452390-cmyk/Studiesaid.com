# Studiesaid.com – Vercel Deploy

## 🚀 Deploy করার পদ্ধতি

### Option 1: Drag & Drop (সবচেয়ে সহজ)
1. [vercel.com](https://vercel.com) এ যান
2. Sign in করুন (GitHub দিয়ে)
3. Dashboard থেকে **"Add New → Project"** ক্লিক করুন
4. **"Deploy without a Git repository"** → এই folder (`studiesaid-vercel`) drag করুন
5. ✅ Done! URL পাবেন

### Option 2: Vercel CLI
```bash
npm i -g vercel
cd studiesaid-vercel
vercel
```
Follow the prompts — project name, framework: **Other**.

### Option 3: GitHub → Vercel
1. এই folder-টি GitHub repo-তে push করুন
2. Vercel-এ "Import Git Repository" করুন
3. Auto-deploy হবে

## ⚠️ Firebase Config
`index.html` এর ভেতরে Firebase config যদি placeholder থাকে, তাহলে আসল credentials দিয়ে replace করুন:
```js
const firebaseConfig = {
  apiKey: "YOUR_REAL_KEY",
  authDomain: "yourapp.firebaseapp.com",
  projectId: "yourapp",
  ...
};
```

## 📁 ফাইল Structure
```
studiesaid-vercel/
├── index.html     ← মূল অ্যাপ
├── vercel.json    ← Vercel config
└── README.md
```
