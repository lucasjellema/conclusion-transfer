/**
 * app.js
 * Main application module
 * 
 * This module initializes the application and connects the authentication
 * and UI modules together. It handles the application lifecycle and
 * authentication flow.
 */

import * as auth from './auth.js';
import * as ui from './ui.js';
import { FILE_SHARE_UPLOAD_ENDPOINT, FILE_SHARE_DOWNLOAD_ENDPOINT } from './dataConfig.js';


// Constants for application state
const APP_STATE = {
  initialized: false,
  authenticated: false
};

// Constants for event timing
const TIMING = {
  retryInterval: 1000, // ms between retries for MSAL loading
  maxRetries: 10       // maximum number of retries
};

/**
 * Initialize the application
 */
async function initializeApp() {
  // Add MSAL script to the page if not present
  await ensureMsalLoaded();

  // Initialize the authentication module
  APP_STATE.initialized = auth.initializeAuth();

  if (!APP_STATE.initialized) {
    ui.showError("Failed to initialize authentication system");
    return;
  }

  // Set up UI with auth callbacks and admin functionality
  ui.initializeUI(handleSignIn, handleSignOut, handleUploadFile);

  // Check for authentication event
  // Add MSAL login success listener, broadcast from auth.js
  window.addEventListener('msalLoginSuccess', async (event) => {
    console.log('MSAL Login Success Event:', event.detail);
    // Update UI or perform actions after successful login
    const { account } = event.detail.payload;
    if (account) {
      console.log(`User ${account.username} logged in successfully`);
      console.log("Successful authentication response received");
      await updateUserState();
    }
  })

  //   // Check if user is already signed in
  await checkExistingAuth();
  // }
}


const msalScriptURL = "https://alcdn.msauth.net/browser/2.30.0/js/msal-browser.min.js";
/**
 * Ensure MSAL script is loaded before proceeding
 */
async function ensureMsalLoaded() {
  // Check if MSAL is already available
  if (window.msal) {
    return;
  }

  return new Promise((resolve) => {
    // Create script tag for MSAL
    const msalScript = document.createElement('script');
    msalScript.src = msalScriptURL;
    msalScript.async = true;
    msalScript.defer = true;

    // Handle script load event
    msalScript.onload = () => {
      console.log("MSAL.js loaded successfully");
      resolve();
    };

    // Handle script error
    msalScript.onerror = () => {
      console.error("Failed to load MSAL.js");
      ui.showError("Failed to load authentication library");
      resolve(); // Resolve anyway to allow error handling
    };

    // Add the script to the document head
    document.head.appendChild(msalScript);
  });
}

/**
 * Check if user is already authenticated
 */
async function checkExistingAuth() {
  const account = auth.getAccount();
  if (account) {
    console.log("Found existing account", account.username);
    await updateUserState();
  } else {
    // No account found, show unauthenticated state
    APP_STATE.authenticated = false;
    ui.showUnauthenticatedState();
  }
}

/**
 * Update the user state and UI based on authentication
 */
/**
 * Show or hide admin section based on user claims
 * @param {Object} idTokenClaims - The user's ID token claims
 */


async function updateUserState() {
  try {
    // Get user details from Microsoft Graph API
    const userDetails = await auth.getUserDetails();

    if (userDetails) {
      APP_STATE.authenticated = true;

      // Get ID token claims for display
      const idTokenClaims = auth.getIdTokenClaims();

      // Update UI with user details and token claims
      ui.showAuthenticatedUser(userDetails, idTokenClaims);

    } else {
      APP_STATE.authenticated = false;
      ui.showUnauthenticatedState();
    }
  } catch (error) {
    console.error("Error updating user state:", error);
    APP_STATE.authenticated = false;
    ui.showUnauthenticatedState();
  }
}

/**
 * Handle sign-in button click
 */
function handleSignIn() {
  if (!APP_STATE.initialized) {
    ui.showError("Authentication system not initialized");
    return;
  }

  try {
    auth.signIn();
  } catch (error) {
    console.error("Sign in error:", error);
    ui.showError("Failed to sign in");
  }
}

/**
 * Handle sign-out button click
 */
function handleSignOut() {
  if (!APP_STATE.initialized) {
    return;
  }

  try {
    auth.signOut();
    APP_STATE.authenticated = false;
    ui.showUnauthenticatedState();
  } catch (error) {
    console.error("Sign out error:", error);
    ui.showError("Failed to sign out");
  }
}

/**
 * Handle file upload
 * @param {File} file - The file to upload
 */
async function handleUploadFile(file) {
  console.log("File selected for upload:", file.name, file.size);
  const fileSizeKB = (file.size / 1024).toFixed(2);
  ui.showFileInfo(file.name, fileSizeKB);

  try {
    // Get the ID token
    const idToken =  auth.getIdToken();
    if (!idToken) {
      throw new Error("Authentication token not available. Please sign in.");
    }

    // 1. Generate a UUID
    const uuid = crypto.randomUUID();

    // Get user details for metadata
    const userDetails = await auth.getUserDetails();
    const userName = userDetails ? (userDetails.displayName || userDetails.name) : 'Unknown User';
    const timestamp = new Date().toISOString();

    // 2. Construct upload URLs
    const fileNameWithUUID = `${uuid}-${file.name}`;
    const fileUploadUrl = `${FILE_SHARE_UPLOAD_ENDPOINT}`;
    const metadataFileName = `${uuid}_metadata.json`;
    const metadataUploadUrl = `${FILE_SHARE_UPLOAD_ENDPOINT}/${metadataFileName}`;


    // 3. Send file to FILE_SHARE_UPLOAD_ENDPOINT
    const fileUploadResponse = await fetch(fileUploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'Authorization': `Bearer ${idToken}`,
        'Asset-Path': fileNameWithUUID
      }
    });

    if (!fileUploadResponse.ok) {
      throw new Error(`File upload failed: ${fileUploadResponse.statusText}`);
    }
    console.log("File uploaded successfully:", fileNameWithUUID);

    // 4. Send metadata file
    const metadata = {
      uuid: uuid,
      userName: userName,
      timestamp: timestamp,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    };

    const metadataUploadResponse = await fetch(fileUploadUrl, {
      method: 'PUT',
      body: JSON.stringify(metadata),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'Asset-Path': metadataFileName
      }
    });

    if (!metadataUploadResponse.ok) {
      throw new Error(`Metadata upload failed: ${metadataUploadResponse.statusText}`);
    }
    console.log("Metadata uploaded successfully:", metadataFileName);

    // 5. Show a download link to the user
    const downloadLink = `${FILE_SHARE_DOWNLOAD_ENDPOINT}/${fileNameWithUUID}`;
    ui.showDownloadLink(downloadLink);

    // 6. Save the following data to the local storage
    const fileMetadata = {
      name: file.name,
      size: file.size,
      uploadDate: timestamp,
      userName: userName, // Add username to file metadata
      downloadUrl: `${FILE_SHARE_DOWNLOAD_ENDPOINT}/${fileNameWithUUID}` // Store the base URL, as the file name is appended in ui.js
    };
    ui.storeUploadedFileMetadata(fileMetadata);
    console.log("Upload data saved to local storage:", fileMetadata);

  } catch (error) {
    console.error("Error during file upload process:", error);
    ui.showError(`File upload failed: ${error.message}`);
  }
}

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
