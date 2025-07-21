/**
 * ui.js
 * UI management module
 * 
 * This module handles all UI updates related to authentication status
 * It provides functions to update the UI based on the authentication state
 */

// CSS classes for styling different states
const UI_CLASSES = {
  authenticated: 'authenticated',
  unauthenticated: 'unauthenticated',
  loading: 'loading',
  error: 'error',
  success: 'success'
};

/**
 * Initialize the UI elements
 * @param {Function} signInCallback - Function to call when sign-in button is clicked
 * @param {Function} signOutCallback - Function to call when sign-out button is clicked

 */
export function initializeUI(signInCallback, signOutCallback, uploadFileCallback) {
  // Check if DOM is loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setupEventListeners(signInCallback, signOutCallback, uploadFileCallback));
  } else {
    setupEventListeners(signInCallback, signOutCallback, uploadFileCallback);
  }
}

/**
 * Set up event listeners for buttons
 * @param {Function} signInCallback - Function to call when sign-in button is clicked
 * @param {Function} signOutCallback - Function to call when sign-out button is clicked
 * @param {Function} uploadFileCallback - Function to call when upload button is clicked
 */
function setupEventListeners(signInCallback, signOutCallback, uploadFileCallback) {
  // Re-assign DOM elements to ensure they're available
  const elements = {
    welcomeMessage: document.getElementById('welcome-message'),
    signInButton: document.getElementById('signin-button'),
    signOutButton: document.getElementById('signout-button'),
    fileInput: document.getElementById('file-input'),
    uploadButton: document.getElementById('upload-button'),
    resetButton: document.getElementById('reset-button'),
    toggleUploadedFilesButton: document.getElementById('toggle-uploaded-files'),
    uploadedFilesContent: document.getElementById('uploaded-files-content'),
    uploadedFilesSection: document.getElementById('uploaded-files-section'),
    uploadedFilesList: document.getElementById('uploaded-files-list'),
  };
  
  // Set up sign in button
  if (elements.signInButton) {
    elements.signInButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof signInCallback === 'function') {
        signInCallback();
      }
    });
  }
  
  // Set up sign out button
  if (elements.signOutButton) {
    elements.signOutButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (typeof signOutCallback === 'function') {
        signOutCallback();
      }
    });
  }

  // Set up file input change listener
  if (elements.fileInput) {
    elements.fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const fileSizeKB = (file.size / 1024).toFixed(2);
        showFileInfo(file.name, fileSizeKB);
        elements.uploadButton.style.display = 'inline-block'; // Show upload button
        elements.resetButton.style.display = 'inline-block'; // Show upload button
      } else {
        showFileInfo('', ''); // Clear info if no file selected
        elements.uploadButton.style.display = 'none'; // Hide upload button
        elements.resetButton.style.display = 'none'; // Hide reset button
      }
    });
  }
 
   // Set up file upload button
   if (elements.uploadButton) {
     elements.uploadButton.addEventListener('click', (event) => {
       event.preventDefault();
       const file = elements.fileInput.files[0];
       if (file && typeof uploadFileCallback === 'function') {
         uploadFileCallback(file);
       } else if (!file) {
         showError("Please select a file to upload.");
       }
     });
   }

   // Set up reset button
   if (elements.resetButton) {
     elements.resetButton.addEventListener('click', (event) => {
       event.preventDefault();
       elements.fileInput.value = ''; // Clear the selected file
       showFileInfo('', ''); // Clear file info display
       elements.uploadButton.style.display = 'none'; // Hide upload button
       elements.resetButton.style.display = 'none'; // Hide reset button
     });
   }

  // Set up toggle uploaded files button
  if (elements.toggleUploadedFilesButton) {
    elements.toggleUploadedFilesButton.addEventListener('click', (event) => {
      event.preventDefault();
      if (elements.uploadedFilesContent.style.display === 'block') {
        elements.uploadedFilesContent.style.display = 'none';
      } else {
        elements.uploadedFilesContent.style.display = 'block';
        // add style class collapsible-content.activev
        elements.uploadedFilesContent.classList.add('active');
        loadAndDisplayUploadedFiles(); // Load files when section is opened
      }
    });
  }
 }

/**
 * Update UI to show authenticated user with user information
 * @param {Object} user - The user object containing profile information
 * @param {Object|null} tokenClaims - The parsed ID token claims
 */
export function showAuthenticatedUser(user, tokenClaims) {
  const elements = {
    welcomeMessage: document.getElementById('welcome-message'),
    signInButton: document.getElementById('signin-button'),
    signOutButton: document.getElementById('signout-button'),
    fileUploadSection: document.getElementById('file-upload-section'),
    fileInfoDisplay: document.getElementById('file-info-display'),
    uploadedFilesSection: document.getElementById('uploaded-files-section'),
  };
  
  // Update welcome message with user's name
  if (elements.welcomeMessage) {
    const displayName = user.displayName || user.name || 'Authenticated User';
    elements.welcomeMessage.innerHTML = `
      <p>Welcome, <strong>${displayName}</strong>!</p>
    `;
  }
  
  // Update button visibility
  if (elements.signInButton) {
    elements.signInButton.style.display = 'none';
  }
  
  if (elements.signOutButton) {
    elements.signOutButton.style.display = 'inline-block';
  }

  // Show file upload section
  if (elements.fileUploadSection) {
    elements.fileUploadSection.style.display = 'block';
  }

  if (elements.uploadedFilesSection) {
    elements.uploadedFilesSection.style.display = 'block';
    loadAndDisplayUploadedFiles(); // Load files when authenticated
  }
  
  // Add authenticated class to body
  document.body.classList.add(UI_CLASSES.authenticated);
  document.body.classList.remove(UI_CLASSES.unauthenticated);
}


export function showUnauthenticatedState() {
  const elements = {
    welcomeMessage: document.getElementById('welcome-message'),
    signInButton: document.getElementById('signin-button'),
    signOutButton: document.getElementById('signout-button'),
    fileUploadSection: document.getElementById('file-upload-section'),
    fileInfoDisplay: document.getElementById('file-info-display'),
  };
  
  // Reset welcome message
  if (elements.welcomeMessage) {
    elements.welcomeMessage.innerHTML = `
      <p>Welcome, please sign in</p>
    `;
  }
  
  // Update button visibility
  if (elements.signInButton) {
    elements.signInButton.style.display = 'inline-block';
  }
  
  if (elements.signOutButton) {
    elements.signOutButton.style.display = 'none';
  }

  // Hide file upload section
  if (elements.fileUploadSection) {
    elements.fileUploadSection.style.display = 'none';
  }

  if (elements.uploadedFilesSection) {
    elements.uploadedFilesSection.style.display = 'none';
  }
  
  // Update body class
  document.body.classList.add(UI_CLASSES.unauthenticated);
  document.body.classList.remove(UI_CLASSES.authenticated);
}

/**
 * Show error message in the UI
 * @param {string} message - Error message to display
 */
export function showError(message) {
  const elements = {
    welcomeMessage: document.getElementById('welcome-message')
  };
  
  if (elements.welcomeMessage) {
    elements.welcomeMessage.innerHTML = `
      <p class="error-message">Error: ${message}</p>
      <p>Please try again or contact support if the issue persists.</p>
    `;
  }
}

export function showFileInfo(fileName, fileSizeKB) {
  const elements = {
    fileInfoDisplay: document.getElementById('file-info-display')
  };

  if (elements.fileInfoDisplay) {
    elements.fileInfoDisplay.innerHTML = fileName ? `
      <p>File Name: <strong>${fileName}</strong></p>
      <p>File Size: <strong>${fileSizeKB} KB</strong></p>
    ` : `
      <p></p>
    `;
  }
}

export function showDownloadLink(link) {
  const elements = {
    fileInfoDisplay: document.getElementById('file-info-display')
  };

  if (elements.fileInfoDisplay) {
    elements.fileInfoDisplay.innerHTML += `
      <p>Download Link: <a href="${link}" target="_blank">${link}</a>
      <button id="copy-link-button" data-link="${link}">Copy Link</button></p>
    `;
    const copyButton = document.getElementById('copy-link-button');
    if (copyButton) {
      copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(copyButton.dataset.link)
          .then(() => alert('Download link copied to clipboard!'))
          .catch(err => console.error('Failed to copy link: ', err));
      });
    }
  }
}

/**
 * Loads uploaded file metadata from local storage and displays them.
 */
function loadAndDisplayUploadedFiles() {
  const uploadedFilesList = document.getElementById('uploaded-files-list');
  if (!uploadedFilesList) return;

  uploadedFilesList.innerHTML = ''; // Clear existing list

  const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');

  if (files.length === 0) {
    uploadedFilesList.innerHTML = '<li>No files uploaded yet.</li>';
    return;
  }

  files.forEach(file => {
    const listItem = document.createElement('li');
    const downloadLink = `${file.downloadUrl}`; // Construct full download URL

    listItem.innerHTML = `
      <p><strong>File Name:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p><strong>Uploaded On:</strong> ${new Date(file.uploadDate).toLocaleString()}</p>
      <p><strong>Download Link:</strong> <a href="${downloadLink}" target="_blank">${downloadLink}</a></p>
      <button class="copy-link-button" data-link="${downloadLink}">Copy Link</button>
    `;
    uploadedFilesList.appendChild(listItem);
  });

  // Add event listeners for copy buttons
  uploadedFilesList.querySelectorAll('.copy-link-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const linkToCopy = event.target.dataset.link;
      navigator.clipboard.writeText(linkToCopy)
        .then(() => alert('Download link copied to clipboard!'))
        .catch(err => console.error('Failed to copy link: ', err));
    });
  });
}

/**
 * Stores uploaded file metadata in local storage.
 * @param {Object} fileMetadata - The metadata of the uploaded file.
 */
export function storeUploadedFileMetadata(fileMetadata) {
  let files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
  files.push(fileMetadata);
  localStorage.setItem('uploadedFiles', JSON.stringify(files));
  loadAndDisplayUploadedFiles(); // Refresh the displayed list
}

/**
 * Loads uploaded file metadata from local storage and displays them.
 */
function loadAndDisplayUploadedFiles2() {
  const uploadedFilesList = document.getElementById('uploaded-files-list');
  if (!uploadedFilesList) return;

  uploadedFilesList.innerHTML = ''; // Clear existing list

  const files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');

  if (files.length === 0) {
    uploadedFilesList.innerHTML = '<li>No files uploaded yet.</li>';
    return;
  }

  files.forEach(file => {
    const listItem = document.createElement('li');
    const downloadLink = `${file.downloadUrl}/${file.name}`; // Construct full download URL

    listItem.innerHTML = `
      <p><strong>File Name:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p><strong>Uploaded On:</strong> ${new Date(file.uploadDate).toLocaleString()}</p>
      <p><strong>Download Link:</strong> <a href="${downloadLink}" target="_blank">${downloadLink}</a></p>
      <button class="copy-link-button" data-link="${downloadLink}">Copy Link</button>
    `;
    uploadedFilesList.appendChild(listItem);
  });

  // Add event listeners for copy buttons
  uploadedFilesList.querySelectorAll('.copy-link-button').forEach(button => {
    button.addEventListener('click', (event) => {
      const linkToCopy = event.target.dataset.link;
      navigator.clipboard.writeText(linkToCopy)
        .then(() => alert('Download link copied to clipboard!'))
        .catch(err => console.error('Failed to copy link: ', err));
    });
  });
}

/**
 * Stores uploaded file metadata in local storage.
 * @param {Object} fileMetadata - The metadata of the uploaded file.
 */
export function storeUploadedFileMetadata2(fileMetadata) {
  let files = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
  files.push(fileMetadata);
  localStorage.setItem('uploadedFiles', JSON.stringify(files));
  loadAndDisplayUploadedFiles(); // Refresh the displayed list
}
