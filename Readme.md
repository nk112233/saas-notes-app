# 📝 Multi-Tenant SaaS Notes Application

A full-stack **multi-tenant SaaS Notes app** with authentication, tenant isolation, role-based access, free/pro plans, and CRUD for notes.  
Built with **Node.js, Express, MongoDB** (backend) and **React + Vite** (frontend).

---

## 🚀 Features

- **Multi-Tenant Architecture** – each company (tenant) is isolated.  
- **Authentication & JWT** – secure login and registration.  
- **Role-Based Access** – Admin vs Member restrictions.  
- **Free vs Pro Plans** – note limit enforced for Free plan, unlimited on Pro.  
- **CRUD Notes** – create, view, update, delete notes.  
- **User Management** – invite users, assign roles (Admin only).  
- **Frontend UI** – login, dashboard, notes list, upgrade button.  



git clone https://github.com/nk112233/saas-notes-app.git

frontend
cd frontend
npm install

backend
cd ../backend
npm install

Backend .env.example
PORT=4000
MONGODB_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret_key"
JWT_EXPIRES_IN="7d"

fronetEnd
VITE_API_URL=http://localhost:4000

#start backend
cd backend
npm start

#start frontend
cd frontend
npm run dev


6️⃣ Test Accounts
Email	            Password	Role	Tenant

admin@acme.test     password	Admin	ACME
user@acme.test      password	Member	ACME
admin@globex.test   password	Admin	Globex
user@globex.test    password	Member	Globex