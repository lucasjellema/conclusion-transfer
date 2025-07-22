# Conclusion Transfer Web App

This is a lightweight static web application designed for secure file transfer, leveraging Microsoft Entra ID (Azure AD) for authentication. It enables users to upload files to a remote cloud storage API and generates a shareable URL, facilitating easy and secure distribution of potentially large files. The application also provides a QR code for convenient mobile access to download links and displays a list of uploaded files, ordered by the most recent uploads.

## Features

- **Secure Authentication**: Integrates with Microsoft Entra ID (Azure AD) using MSAL.js for robust user authentication.
- **File Upload & Sharing**: Allows users to upload files to a configured cloud storage API and generates a unique, shareable download link.
- **QR Code Generation**: Provides a QR code for each download link, enabling quick and easy access on mobile devices.
- **Uploaded Files List**: Displays a list of previously uploaded files, ordered by the most recent upload date, including file name, size, upload date, and download link.
- **User-Friendly Interface**: Features a simple, clean, and responsive UI that displays the authenticated user's name and profile information.
- **In-Memory Token Storage**: Enhances security by storing authentication tokens only in memory, not in browser storage.
- **Modular Design**: Built with a modular code structure using ES Modules for maintainability and scalability.

## Project Structure

```
/
├── index.html       - Main HTML file with application structure
├── styles.css       - CSS styling for the application
├── js/
│   ├── app.js       - Main application module that connects components
│   ├── auth.js      - Authentication module for Entra ID integration
│   ├── authConfig.js - Authentication configuration settings
│   ├── dataConfig.js - Configuration settings for data endpoints
│   ├── dataService.js - Service for fetching and persisting data
│   └── ui.js        - UI module for managing the user interface
└── README.md        - This documentation file
```

## Setup Instructions

### Prerequisites

- A Microsoft Azure account with permissions to register applications
- A registered application in the Microsoft Entra ID portal (Azure AD)
- A valid API endpoint for fetching authenticated data (for example on a API Gateway)

### Configuration

1. Register an application in the [Azure Portal](https://portal.azure.com):
   - Navigate to Microsoft Entra ID (Azure Active Directory)
   - Go to App Registrations and create a new registration
   - Set the redirect URI to match your deployment URL
   - Note the Application (client) ID and Directory (tenant) ID

2. Update `js/authConfig.js` with your application's details:
   - Replace the `clientId` with your application's client ID
   - If using a specific tenant, update the `authority` value with your tenant ID

3. Serve the application:
   - Use a local development server during development
   - For production, deploy to any static web hosting service

## Usage

1.  **Access the Application**: Open the `index.html` file in a web browser.
2.  **Sign In**: Click the "Sign In" button to authenticate using your Microsoft Entra ID credentials.
3.  **Upload a File**: Once authenticated, select a file using the "Choose File" button and then click "Upload File" to send it to cloud storage.
4.  **Share Download Link**: After a successful upload, a download link and a corresponding QR code will be displayed. You can copy the link or scan the QR code to share the file.
5.  **View Uploaded Files**: The "Uploaded Files" section will display a list of all files you've uploaded, ordered from most recent to oldest.
6.  **Sign Out**: To end your session, click the "Sign Out" button.

## Development Principles

This project follows these development principles:

1. **Modular Code**: Uses ES Modules to break up functionality into logical units
2. **Size Limitations**: JavaScript files are kept under 200 lines for maintainability
3. **No Magic Values**: Constants are used instead of hardcoded values
4. **Documentation**: Comprehensive comments explain what the code does

## Security Notes

- ID tokens are stored in memory only, not in browser storage
- The application follows security best practices for authentication
- Authentication state is not persisted between browser sessions
- API requests include bearer tokens in Authorization headers
- Preflight requests are automatically handled by the browser for authenticated API calls with custom headers
  
## Customization

The application can be extended in various ways:

1. Add additional Microsoft Graph API calls to retrieve more user information
2. Further enhance role-based access control using roles from the ID token
3. Add custom branding and styling to match your organization
4. Implement additional authentication options like multi-factor authentication


## License

This project is available for use under the MIT License.
