<div align="center" style="background-color: #1e1e2e; padding: 20px; border-radius: 10px; color: white;">
  <h1>🚀 Medietekniskt kandidatprojekt (TNM094 2025VT XS)</h1>
  <p>Welcome to our Medietekniskt Kandidatprojekt repository!</p>
</div>

---

<p align="center">
  <strong>🌜 Read through the instructions below the Shrek banner.</strong>
</p>

<p align="center">
  🎵 Important! Watch this 10 sec video before cloning the repo: <a href="https://www.youtube.com/watch?v=xvFZjo5PgG0">Click here</a>
</p>

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/en/4/4d/Shrek_%28character%29.png" alt="Shrek Banner" width="30%">
</p>

---

## 📌 Table of Contents
- [Introduction](#introduction)
- [Installation](#installation)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Introduction
Welcome to **TNM094 Kandidatprojekt**! This project focuses on **[short description]**, where we develop **[key features]**. The goal is to **[main objective, e.g., create an interactive visualization, analyze data, etc.]**.

---

## ⚙️ Installation
To set up the project locally, follow these steps:

```bash
# Clone the repository
git clone https://gitlab.liu.se/hanfr829/tnm094_kandidatprojekt.git

# Navigate to the project folder
cd tnm094_kandidatprojekt

# Install dependencies (if applicable )
npm install

# Install required librarys for main.py (for backend)
pip install -r requirements.txt 
```

**Note:** If `npm install` fails, try:
```bash
npm install --legacy-peer-deps
```

---

## 🚀 Usage
To start using this project:

### **Run the Backend**
Open a terminal and navigate to the backend directory:
```bash
C:\TNM094\"branch_name"\backend>
```
Then, run the FastAPI server using Uvicorn:
```bash
uvicorn main:app --reload
```

### **Run the Frontend**
Open another terminal and navigate to the frontend directory:
```bash
C:\TNM094\"branch_name"\frontend>
```
Ensure `export default App;` is included in your `App.js` aswell that you have `npm install` in the `frontend` folder, then run:
```bash
npm start
```

---

## 🛠 Troubleshooting
### Issue: `npm install` fails
**Solution:** Ensure Node.js is installed (`node -v`) and try:
```bash
npm install --legacy-peer-deps
```

### Issue: Backend doesn't start
**Solution:** Ensure you have Uvicorn installed:
```bash
pip install uvicorn fastapi
```

### Issue: Error warnings about plotly
**Solution:** Ensure you have plotly installed in the frontend:
```bash
npm install react-plotly.js plotly.js
```

### Issue: Backend still doesn't start
**Solution:** Ensure you have the right librarys and Python version installed for `main.py` in `Backend`:
```bash
check requirments.txt for the librarys and check that you have Python version 3.13 on your pc
```
---

## 🤝 Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add a new feature'`)
4. Push to the branch (`git push origin feature-branch`)
5. Open a Pull Request

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>💡 Let's a GO! 💡</strong>
</p>

