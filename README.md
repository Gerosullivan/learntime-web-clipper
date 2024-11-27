# Learntime Web Clipper

A Chrome extension that enables users to save web pages directly to their Learntime MemoryStack for active recall practice.

## Functionality Overview

The extension operates through three main components:

1. **Popup Interface** (`popup.html`, `popup.js`)

   - Handles user authentication with Learntime
   - Fetches and displays user's MemoryStacks
   - Provides interface for saving the current page

2. **Content Script** (`content.js`)

   - Extracts main content from web pages
   - Filters out unnecessary elements (ads, scripts, navigation)
   - Cleans and processes text content for optimal learning

3. **Background Integration**
   - Manages communication between popup and content script
   - Handles API interactions with Learntime backend

## API Interactions

The extension interacts with the Learntime API in the following ways:

### Authentication

```javascript
GET / api / auth / session;
// Returns current session information and access token
```

### MemoryStack Retrieval

```javascript
GET / api / workspaces;
// Requires: Bearer token
// Returns: List of user's MemoryStacks
```

### Topic Creation

```javascript
POST / api / create - topic - from - web;
// Requires: Bearer token
// Payload: {
//   title: string,        // Page title
//   content: string,      // Extracted content
//   url: string,         // Source URL
//   workspaceId: string  // Selected MemoryStack ID
// }
// Returns: {
//   success: boolean,
//   chatId?: string,    // ID of created topic
//   error?: string
// }
```

## Content Extraction

The content script employs the following strategy to extract relevant content:

1. Removes unwanted elements (scripts, styles, ads)
2. Attempts to locate main content in `<article>` or `<main>` tags
3. Falls back to body content if specific containers aren't found
4. Cleans and normalizes text content
5. Limits content length to prevent oversized topics

## Security & Privacy

- Uses activeTab permission to access content only when explicitly triggered
- Connects only to app.learntime.ai domain
- No local storage of user data
- Requires explicit user action to capture content

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the extension: `npm run build`
4. Load unpacked extension in Chrome from the `dist` directory

## Production Build

The extension requires the following environment configurations:

- Production API URL set to `https://app.learntime.ai`
- Appropriate host permissions in manifest.json
- Proper Chrome Web Store assets and listings
