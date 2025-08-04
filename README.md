# JFE Site

This is a web application for managing and showcasing projects, built using **Next.js**, **Firebase**, and **Tailwind CSS**. The app includes user authentication, event attendance tracking (`prezente`), and AI-generated project descriptions.

---

## 🧩 Features

- 🔐 **Authentication** — Sign up / Login with Firebase Authentication
- 🏠 **Home Page** — Publicly accessible landing page with navigation
- 📄 **About Us** — Info page about the JFE organization or project
- 📝 **Add Project** — Authenticated users can add projects with images and metadata
- 🤖 **AI Integration** — Auto-generate project descriptions via OpenAI
- 📅 **Prezente (Attendance)** — Saturday-only event registration with visual calendar and user linking
- 📷 **Image Uploads** — Upload project thumbnails to Firebase Storage
- 🗃️ **Firestore** — Store user data, projects, and attendance records securely

---

## 🚀 Pages Overview

### 🔹 Home Page

![Home Page seen on the site desktop](/assets/homePageGuest.png)

The landing page provides an overview of the platform and highlights featured projects.


---

### 🔹 About Us

An informational page about the mission, values, and people behind the platform. This page is static but easily editable in `app/about/page.tsx`.

---

### 🔹 Login / Sign Up

- Users can sign up or log in using Firebase Authentication.
- Password reset functionality is included.
- Auth state is managed globally via React context.

---

### 🔹 Projects

- Users can add new projects with:
  - Title
  - Description (manually or generated with AI)
  - Image (uploaded to Firebase Storage)
  - Start time
- Projects are stored in Firestore and visible on the main project listing page.

---

### 🔹 Prezente

- Attendance system for events (limited to Saturdays)
- Integrated calendar UI
- Visual indicators of presence
- Stored in Firestore per user & event

---

## 📦 Tech Stack

| Tech           | Description                          |
|----------------|--------------------------------------|
| Next.js        | React framework for SSR/SPAs         |
| Tailwind CSS   | Modern utility-first styling         |
| Firebase       | Backend-as-a-service (Auth, DB, Storage) |
| React Context  | Global state for user auth           |
| OpenAI API     | Description generation               |

---

## 📂 Folder Structure

!()
---

## 🔧 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/jfe-site.git
   cd jfe-site
