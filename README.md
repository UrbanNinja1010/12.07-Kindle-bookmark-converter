# Kindle to Obsidian Converter

A lightweight, local, and privacy-focused web application that takes HTML exports from Kindle notebooks and converts them into a beautiful, readable format optimized for Obsidian.

## Features

- **No Server Required:** Runs entirely in your browser using local files.
- **Privacy First:** Your notes are never uploaded or sent to any server.
- **Obsidian Webclipper Ready:** The output page automatically formats its document metadata (`title` and `<meta name="author">`) so the [Obsidian Web Clipper](https://obsidian.md/clipper) snags your book title and author perfectly.
- **Clean Markdown Export:** Prefer to copy-paste? There's a "Copy as Markdown" button that generates clean Obsidian-flavored markdown instantly.
- **Beautiful UI:** A dark, sleek, and responsive interface displaying your highlights and notes cleanly separated by chapters.

## How to Use

1. **Export from Kindle:** 
   Export your notebook from the Kindle app. You usually do this via email or the app's internal share features. Save the resulting `.html` file to your computer.
2. **Open the Converter:** 
   Double-click the `index.html` file in this repository to open it in your browser.
3. **Load your Notes:**
   Drag and drop your Kindle `.html` file anywhere on the upload zone, or click "Browse Files" to select it manually.
4. **Send to Obsidian:**
   - **Method 1 (Web Clipper):** Click the Obsidian Web Clipper extension in your browser to import the formatted page directly into your vault.
     *Tip: You can use the provided `bookmarks-clipper.json` template! Import this JSON file into your Obsidian Web Clipper settings to automatically format your highlights with the correct title, author (as wikilinks), and tags.*
   - **Method 2 (Manual Copy):** Click the "Copy as Markdown" button and paste it into a new note in Obsidian.

## Technical Details

The tool uses vanilla HTML, CSS, and JavaScript. 
- `index.html`: The main user interface.
- `style.css`: All styling, using a premium dark aesthetic with CSS animations.
- `app.js`: Local file reading and DOM parsing logic.

### Obsidian Metadata Formatting

When a file is loaded, `app.js` runs logic to extract the book's title and author. It injects these dynamically into the page header so that when the Obsidian Web Clipper extension parses the page, it can cleanly extract those metadata fields as properties for the newly created note. Multiple authors are normalized into a comma-separated format.

## Demo

*A beautiful UI to parse your highlights before sending them to your second brain.*
