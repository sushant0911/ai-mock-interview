# 🚀 PrepWise – AI-Powered Interview Practice Assistant

PrepWise is an AI-powered mock interview assistant that generates personalized interview sessions using natural conversational flows.  
Built using **Next.js**, **Firebase**, and **VAPI AI**, it provides a smooth and realistic interview experience—complete with structured data extraction, user authentication, and automatic interview storage.

This project was completed as a part of the **Eightfold Assignment**, demonstrating the integration of conversational AI workflows with full‑stack web applications and real-time databases.

---

## 📸 Live Demo
👉 ai-mock-interview-neon-eta.vercel.app

---

# ✨ Features
- 🎙 AI‑driven interview flow using VAPI Conversation Nodes  
- 📚 Role‑specific interview questions  
- 🔐 Secure user authentication (Firebase Auth)  
- 💾 Automatic interview storage (Firestore)  
- 🧠 Real‑time extraction of user inputs (role, level, tech stack, etc.)  
- 📈 Dashboard to view previous interviews  
- ⚡ Fast UI powered by Next.js  
- 🔄 Optimized Firestore queries with composite indexes  
- 🚀 Production‑ready deployment on Vercel  

---

# 🧰 Tech Stack

### **Frontend**
- Next.js 14 (App Router)
- React
- TailwindCSS  
- Vercel Hosting

### **Backend**
- Firebase Authentication  
- Firestore NoSQL Database  
- VAPI AI Workflow  
- Next.js API Routes  

---

# 🏛 Architecture Overview

```
Frontend (Next.js)
        ↓
VAPI Workflow (Conversation + Extraction)
        ↓
Backend API Route (Validation + Processing)
        ↓
Firestore (Persistent Storage)
```

Each layer is isolated for maximum clarity, scalability, and maintainability.

---

# ⚙️ Setup & Installation

### **1. Clone the repo**
```bash
git clone https://github.com/sushant0911/ai-mock-interview.git
cd ai-mock-interview
```

### **2. Install dependencies**
```bash
npm install
```

### **3. Add environment variables**
Create a `.env.local` file and fill in the required values.

### **4. Run the development server**
```bash
npm run dev
```

---

# 🔐 Environment Variables

### **Public variables**
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_WORKFLOW_ID=
NEXT_PUBLIC_BASE_URL=
```

# 📘 Design Decisions & Reasoning

This project was built with a focus on reliability, scalability, and developer‑friendly workflows.  
Below are the core design decisions made throughout development and the reasoning behind each choice.

---

## 🔹 1. Using Firebase (Auth + Firestore)

Firebase provides seamless authentication, a scalable NoSQL database, and easy integration with React/Next.js.

### **Why this made sense**
- No need for custom auth servers  
- Real-time sync for live updates  
- Simple and powerful client SDK  

---

## 🔹 2. Next.js for the Web App

Next.js was selected for its blend of SSR, routing, and performance features.

### **Why this made sense**
- Faster first paint using SSR  
- Cleaner architecture via App Router  
- Server Components reduce bundle size  

---

## 🔹 3. VAPI AI for Voice + AI Workflow

VAPI manages the conversational flow and structured data extraction.

### **Why this made sense**
- Natural, human-like interviews using Conversation Nodes  
- Structured output simplifies backend logic  
- Workflow versioning ensures production stability  

---

## 🔹 4. API Requests from VAPI Workflow to Backend

Sending structured data instead of raw conversation improves clarity and reliability.

### **Why this made sense**
- Backend receives clean JSON  
- Validation & sanitization become easier  
- AI/LLM logic stays separate from DB logic  

---

## 🔹 5. Environment Variable Strategy

A strict environment variable policy ensures secure and reliable deployments.

### **Why this made sense**
- Prevents secret exposure in client bundle  
- Avoids production bugs like `auth/invalid-api-key`  
- Enables stable, reproducible builds  

---

## 🔹 6. Firestore Composite Indexes

Composite indexes were required for filtering on multiple fields such as `finalized`, `createdAt`, and `userId`.

### **Why this made sense**
- Faster Firestore queries  
- Eliminates `FAILED_PRECONDITION` errors  
- Ensures smooth dashboard filtering  

---

## 🔹 7. Keeping the UX as Natural as Possible

The system avoids robotic IVR-style interactions and focuses on real conversations.

### **Why this made sense**
- More engaging interview experience  
- Smooth multi-field extraction  
- No DTMF or "press 1" friction  

---

## 🔹 8. Clean Separation of Concerns

Each part of the system has a well-defined responsibility.

### **Architecture**
- **Frontend** → UI, auth, session handling  
- **VAPI Workflow** → Conversation + extraction  
- **API Route** → Validation + business logic  
- **Firestore** → Persistent storage  

### **Why this made sense**
- Easier debugging  
- Maintainable codebase  
- Better scalability long-term  


