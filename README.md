# COS 106: Introduction to Web Technologies &mdash; Term Project

**Project Title:** Responsive Student Portfolio and Academic Management Website  
**Institution:** Miva Open University  
**Student Name:** Adebayo Elisha  
**Matriculation Number:** `2025/C/CYB/1089`  
**Department:** Cybersecurity (Faculty of Computing & Applied Sciences)  
**Academic Level / Cohort:** 100 Level / May Cohort 2026  
**Email:** `e.adebayo6885@miva.edu.ng`  

---

## 1. Project Overview

This website is a fully functional, multi-page personal academic portfolio and student management platform designed and developed to fulfill the term project requirements for **COS 106 (Introduction to Web Technologies)**.

The project demonstrates proficiency in **Semantic HTML5**, **Modern CSS3 (Flexbox & CSS Grid)**, and **Interactive Client-Side JavaScript**, built with an **Obsidian & Precision Emerald** design system tailored for a cybersecurity undergraduate student.

---

## 2. Page Architecture & Features

The website contains five distinct, interconnected semantic HTML5 pages:

1. **Homepage (`index.html`)**:
   - Clean floating glassmorphism navigation header with mobile drawer toggle.
   - Student portrait photograph, welcome message, and 100-level cybersecurity status pill.
   - Interactive HTML5 multimedia audio welcome note (`assets/welcome_audio.wav`).
   - Quick preview highlights of enrolled coursework (COS 106, COS 102, CYB 101).

2. **About Me (`about.html`)**:
   - Detailed educational journey (B.Sc. Cybersecurity at MIVA Open University, SSCE).
   - Career aspirations in Security Operations Center (SOC) analysis and threat hunting.
   - Interactive technical competency progress bars (Python, HTML5, CSS3, JavaScript, Linux CLI, Wireshark).
   - Complete semantic academic course enrollment table (`<table>`, `<th>`, `<td>`).
   - Personal hobbies and interests (CTFs, Speed Chess, Security Podcasts).

3. **Projects Showcase (`projects.html`)**:
   - **SOC Incident & Network Threat Analyzer**: Defensive security telemetry dashboard.
   - **Right-Angled Triangle Angle Classifier**: Computational geometry solver developed for COS 102 Lab Assignment 1.
   - **Mathematical Palindrome Number Verifier**: Numerical digit-reversal algorithm developed for COS 102 Lab Assignment 2.
   - Complete project descriptions, screenshots, tech tags, and code links.

4. **Academic Planner (`planner.html`)**:
   - Interactive task management system powered by custom JavaScript (`js/planner.js`).
   - Add new study tasks with title, course code, due date, and priority tag (High, Medium, Low).
   - Toggle task completion with strikethrough styling and live counter updates.
   - Filter tasks by status (`All`, `Pending`, `Completed`).
   - Delete tasks from list.
   - **Persistent state**: Automatically saves and loads tasks from browser `localStorage`.

5. **Contact (`contact.html`)**:
   - Semantic contact form with Name, Email, Phone Number, and Message fields.
   - Client-side JavaScript validation (`js/contact.js`):
     - Empty field prevention.
     - Strict email format validation via regular expressions (`^[^\s@]+@[^\s@]+\.[^\s@]+$`).
     - Phone number validation requiring digits only (`^[0-9+ ]{7,15}$`).
     - Inline dynamic error feedback and non-reloading submission toast.
   - Institutional contact cards with official MIVA Open University email and student ID.

---

## 3. Directory Structure

```text
cos106_portfolio/
├── index.html                  # Homepage
├── about.html                  # About Me page with course table & skills
├── projects.html               # Technical projects showcase
├── planner.html                # Interactive Academic Planner
├── contact.html                # Validated contact form
├── README.md                   # Project documentation & deployment guide
├── css/
│   └── style.css               # External stylesheet (tokens, responsive grid, animations)
├── js/
│   ├── effects.js              # View Transitions API, particle physics, geometric matrix, drawer
│   ├── planner.js              # Academic task planner CRUD & localStorage
│   └── contact.js              # Client-side form regex validation & toast alerts
├── images/
│   ├── elisha.jpg              # Professional portrait photograph
│   ├── project_cybersecurity.jpg # SOC analyzer project mockup
│   ├── project_triangle.jpg    # Triangle classifier project mockup
│   └── project_palindrome.jpg  # Palindrome verifier project mockup
└── assets/
    └── welcome_audio.wav       # HTML5 multimedia audio greeting
```

---

## 4. How to Run Locally

You can run the website locally using any standard HTTP server or by opening `index.html` in a web browser:

### Option A: Using Python (Recommended)
```bash
cd cos106_portfolio
python -m http.server 8080
```
Open your browser and navigate to: `http://localhost:8080`

### Option B: Using Node.js `npx serve`
```bash
npx serve cos106_portfolio
```

---

## 5. Deployment Guide (Free Hosting)

Per the course submission instructions (*"It should be hosted and the link submitted along with the link to the GitHub repository"*), follow these steps:

### Step 1: Push to GitHub
1. Create a new GitHub repository named `portfolio`.
2. Push the contents of the `cos106_portfolio` directory to GitHub:
   ```bash
   cd cos106_portfolio
   git init
   git add .
   git commit -m "Initial commit: Student portfolio and academic management hub"
   git branch -M main
   git remote add origin https://github.com/Arshavin988/portfolio.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel or GitHub Pages
- **GitHub Pages**: In the GitHub repository, navigate to **Settings** &rarr; **Pages** &rarr; select `main` branch root &rarr; Click **Save**. The live URL will be: `https://Arshavin988.github.io/portfolio/`.
- **Vercel**: Import the GitHub repository on [Vercel](https://vercel.com) and click **Deploy**. Vercel will instantly provide a global HTTPS URL (e.g., `https://adebayo-elisha-portfolio.vercel.app`).
