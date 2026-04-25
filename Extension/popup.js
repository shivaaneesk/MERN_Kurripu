document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const authView = document.getElementById('authView');
  const noteView = document.getElementById('noteView');
  
  // Auth Elements
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const authError = document.getElementById('authError');
  
  // Note Elements
  const noteTitle = document.getElementById('noteTitle');
  const noteContent = document.getElementById('noteContent');
  const noteLabel = document.getElementById('noteLabel');
  const saveBtn = document.getElementById('saveBtn');
  const noteError = document.getElementById('noteError');
  const logoutBtn = document.getElementById('logoutBtn');
  const swatches = document.querySelectorAll('.swatch');
  
  // --- DEPLOYMENT CONFIGURATION ---
  // When deploying to the public Chrome Web Store, flip USE_PROD to true 
  // and paste your actual Vercel URL below!
  const USE_PROD = false; 
  const PROD_URL = 'https://kurripu.vercel.app/api'; 
  const LOCAL_URL = 'http://localhost:3000/api';
  
  const BASE_API = USE_PROD ? PROD_URL : LOCAL_URL;
  // --------------------------------
  
  let selectedColor = 'default';

  // Initialize Extension State
  const checkAuth = () => {
    chrome.storage.local.get(['kurripu_token'], (result) => {
      if (result.kurripu_token) {
        showNoteView();
      } else {
        showAuthView();
      }
    });
  };

  const showAuthView = () => {
    authView.classList.remove('hidden');
    noteView.classList.add('hidden');
    authError.innerText = '';
  };

  const showNoteView = () => {
    authView.classList.add('hidden');
    noteView.classList.remove('hidden');
    noteError.innerText = '';
    noteTitle.value = '';
    noteContent.value = '';
    noteLabel.value = '';
    noteTitle.focus();
  };

  // Color Picker Logic
  swatches.forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      swatches.forEach(s => s.classList.remove('active'));
      e.target.classList.add('active');
      selectedColor = e.target.getAttribute('data-color');
    });
  });

  // Login Logic
  loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    if (!email || !password) {
      authError.innerText = 'Email and Password required.';
      return;
    }

    loginBtn.innerText = 'Communicating...';
    loginBtn.disabled = true;

    try {
      const res = await fetch(`${BASE_API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (data.success && data.token) {
        chrome.storage.local.set({ kurripu_token: data.token }, () => {
          showNoteView();
        });
      } else {
        authError.innerText = data.error || 'Authentication Failed';
      }
    } catch (e) {
      authError.innerText = 'Network Error. Is Kurripu running?';
    } finally {
      loginBtn.innerText = 'Authenticate';
      loginBtn.disabled = false;
    }
  });

  // Logout Logic
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['kurripu_token'], () => {
      showAuthView();
      loginPassword.value = '';
    });
  });

  // Save Note Logic
  saveBtn.addEventListener('click', () => {
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    const label = noteLabel.value.trim();

    if (!title || !content) {
      noteError.innerText = 'Title and Content are required!';
      return;
    }

    saveBtn.innerText = 'Transmitting...';
    saveBtn.disabled = true;

    chrome.storage.local.get(['kurripu_token'], async (result) => {
      const token = result.kurripu_token;
      if (!token) {
        showAuthView();
        return;
      }

      try {
        const res = await fetch(`${BASE_API}/notes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            content,
            label,
            color: selectedColor
          })
        });

        const data = await res.json();

        if (res.status === 401) {
          noteError.innerText = 'Session expired.';
          setTimeout(logoutBtn.click, 1000);
        } else if (data.success) {
          saveBtn.innerText = 'Pinned!';
          saveBtn.style.color = '#a855f7';
          saveBtn.style.borderColor = '#a855f7';
          setTimeout(() => {
            window.close();
          }, 800);
        } else {
          noteError.innerText = data.error || 'Failed to pin note.';
        }
      } catch (error) {
        noteError.innerText = 'Network link broken.';
      } finally {
        saveBtn.innerText = 'Pin Note';
        saveBtn.disabled = false;
      }
    });
  });

  // Start Ext
  checkAuth();
});
