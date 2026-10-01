#!/bin/bash

# 1. Overwrite the CSS with a premium dark automotive theme
cat << 'EOF' > frontend/src/App.css
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Inter:wght@400;600&display=swap');

body { font-family: 'Inter', sans-serif; background: #0a0a0c; color: #f4f4f5; margin: 0; padding: 20px; }
.container { max-width: 1200px; margin: auto; background: #131316; padding: 35px; border-radius: 12px; border: 1px solid #27272a; box-shadow: 0 20px 50px rgba(0,0,0,0.8); border-top: 5px solid #d97736; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
.header h1 { font-family: 'Oswald', sans-serif; font-size: 2.8em; text-transform: uppercase; margin: 0; color: #ffffff; letter-spacing: 1px; }
.header h1::after { content: '.'; color: #d97736; }
.form-section form { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; background: #1a1a1f; padding: 25px; border-radius: 8px; border: 1px solid #27272a; }
.form-section h2, .list-header h2 { font-family: 'Oswald', sans-serif; font-size: 1.8em; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; color: #e4e4e7; }
input, select, textarea { padding: 14px; background: #0a0a0c; border: 1px solid #3f3f46; color: #fff; border-radius: 4px; font-family: inherit; transition: all 0.3s ease; }
input:focus, select:focus, textarea:focus { border-color: #d97736; outline: none; box-shadow: 0 0 0 2px rgba(217, 119, 54, 0.2); }
button { grid-column: span 2; padding: 16px; background: #d97736; color: #000; border: none; border-radius: 4px; cursor: pointer; font-family: 'Oswald', sans-serif; font-size: 1.3em; text-transform: uppercase; font-weight: bold; transition: all 0.2s; letter-spacing: 1px; }
button:hover { background: #b8602b; transform: translateY(-2px); }
.logout-btn { background: #27272a; color: #fff; padding: 10px 20px; font-size: 1em; width: auto; grid-column: span 1; }
.logout-btn:hover { background: #3f3f46; }
table { width: 100%; border-collapse: separate; border-spacing: 0 10px; margin-top: 10px; }
th { background: transparent; color: #a1a1aa; font-family: 'Oswald', sans-serif; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #27272a; padding: 12px; text-align: left; }
td { padding: 18px 12px; background: #1a1a1f; border-top: 1px solid #27272a; border-bottom: 1px solid #27272a; }
td:first-child { border-left: 1px solid #27272a; border-top-left-radius: 8px; border-bottom-left-radius: 8px; font-weight: bold; color: #d97736; }
td:last-child { border-right: 1px solid #27272a; border-top-right-radius: 8px; border-bottom-right-radius: 8px; }
.status { padding: 6px 12px; border-radius: 4px; font-size: 0.85em; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
.status.pending { background: rgba(234, 179, 8, 0.1); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.2); }
.status.in-progress { background: rgba(56, 189, 248, 0.1); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }
.status.completed { background: rgba(74, 222, 128, 0.1); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.2); }
.login-container { display: flex; justify-content: center; align-items: center; height: 100vh; background: #0a0a0c; background-image: radial-gradient(circle at center, #1a1a1f 0%, #0a0a0c 100%); }
.login-form { background: #131316; padding: 40px; border-radius: 12px; border: 1px solid #27272a; border-top: 5px solid #d97736; box-shadow: 0 25px 50px rgba(0,0,0,0.8); display: flex; flex-direction: column; gap: 20px; width: 380px; }
.login-form h2 { font-family: 'Oswald', sans-serif; color: #fff; margin: 0 0 10px 0; font-size: 2.2em; text-transform: uppercase; text-align: center; letter-spacing: 1px; }
.btn-sm { font-size: 0.9em; padding: 8px 15px; grid-column: span 1; width: auto; }
.btn-progress { background: #0284c7; color: #fff; } .btn-progress:hover { background: #0369a1; }
.btn-complete { background: #16a34a; color: #fff; } .btn-complete:hover { background: #15803d; }
.mod-badge { background: #d97736; color: #000; font-size: 0.75em; padding: 4px 10px; border-radius: 4px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; cursor: help; }
.thumbnail { width: 45px; height: 45px; object-fit: cover; border-radius: 4px; border: 1px solid #3f3f46; cursor: pointer; transition: transform 0.2s; }
.thumbnail:hover { transform: scale(3.5); box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 10; position: relative; }
.file-upload-group { grid-column: span 2; display: flex; flex-direction: column; gap: 5px; font-size: 0.9em; color: #a1a1aa; }
.error-msg { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); padding: 10px; border-radius: 4px; text-align: center; }
EOF

# 2. Rebuild the React Application
echo "📦 Compiling new bold UI..."
cd frontend
npm run build --silent
cd ..

# 3. Move the newly styled app back into Spring Boot
echo "🚚 Deploying new UI to server..."
cp -r frontend/build/* src/main/resources/static/

echo "✅ UI Upgrade Complete!"