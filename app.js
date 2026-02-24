document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadSection = document.getElementById('upload-section');
    const outputSection = document.getElementById('output-section');
    const obsidianView = document.getElementById('obsidian-view');
    const btnCopy = document.getElementById('btn-copy');
    const btnReset = document.getElementById('btn-reset');

    let currentTitle = '';
    let currentAuthors = '';
    let currentItems = [];

    // Drag & Drop Handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) handleFile(files[0]);
    });

    fileInput.addEventListener('change', function () {
        if (this.files.length) handleFile(this.files[0]);
    });

    function handleFile(file) {
        if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
            alert('Please upload a valid Kindle HTML file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const htmlContent = e.target.result;
            processKindleHTML(htmlContent);
        };
        reader.readAsText(file);
    }

    function processKindleHTML(htmlString) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');

        currentTitle = doc.querySelector('.bookTitle')?.textContent.trim() || 'Unknown Title';
        let rawAuthors = doc.querySelector('.authors')?.textContent.trim() || 'Unknown Author';

        // Ensure authors are comma-separated (Kindle sometimes separates multiple authors with semicolons)
        currentAuthors = rawAuthors.split(';').map(a => a.trim()).filter(a => a).join(', ');

        // Update page metadata for Obsidian Webclipper
        document.title = currentTitle;
        let authorMeta = document.querySelector('meta[name="author"]');
        if (!authorMeta) {
            authorMeta = document.createElement('meta');
            authorMeta.name = 'author';
            document.head.appendChild(authorMeta);
        }
        authorMeta.content = currentAuthors;

        const elements = doc.querySelectorAll('.sectionHeading, .noteHeading, .noteText');
        currentItems = [];
        let currentSection = '';
        let currentNoteHeading = '';

        elements.forEach(el => {
            if (el.classList.contains('sectionHeading')) {
                currentSection = el.textContent.trim();
            } else if (el.classList.contains('noteHeading')) {
                currentNoteHeading = el.textContent.trim();
            } else if (el.classList.contains('noteText')) {
                const headingLower = currentNoteHeading.toLowerCase();
                const isNote = headingLower.includes('note -');

                // Extract location/page info
                let metadata = currentNoteHeading;
                if (metadata.includes('-')) {
                    metadata = metadata.split('-').slice(1).join('-').trim();
                }

                currentItems.push({
                    section: currentSection,
                    metadata: metadata,
                    text: el.textContent.trim(),
                    type: isNote ? 'note' : 'highlight'
                });
            }
        });

        renderOutput(currentTitle, currentAuthors, currentItems);
    }

    function renderOutput(title, authors, items) {
        let html = `<article>\n`;
        html += `  <h1 class="book-title">${title}</h1>\n`;
        html += `  <p class="book-authors">${authors}</p>\n\n`;

        let lastSection = null;

        items.forEach((item, index) => {
            if (item.section && item.section !== lastSection) {
                let sectionName = isNaN(item.section) ? item.section : `Chapter ${item.section}`;
                html += `  <h2 class="section-title">${sectionName}</h2>\n`;
                lastSection = item.section;
            }

            // Stagger animations based on index
            const animDelay = `style="animation-delay: ${Math.min(index * 0.05, 1.5)}s"`;

            if (item.type === 'highlight') {
                html += `  <div class="clip-highlight" ${animDelay}>\n`;
                html += `    <blockquote><p>${item.text}</p></blockquote>\n`;
                html += `    <cite>${item.metadata}</cite>\n`;
                html += `  </div>\n`;
            } else if (item.type === 'note') {
                html += `  <div class="clip-note" ${animDelay}>\n`;
                html += `    <p><strong>Note:</strong> ${item.text}</p>\n`;
                html += `    <cite>${item.metadata}</cite>\n`;
                html += `  </div>\n`;
            }
        });

        html += `</article>`;

        obsidianView.innerHTML = html;
        uploadSection.classList.add('hidden');
        outputSection.classList.remove('hidden');
    }

    function convertItemsToMarkdown(title, authors, items) {
        let md = `# ${title}\n*${authors}*\n\n`;
        let lastSection = null;

        items.forEach(item => {
            if (item.section && item.section !== lastSection) {
                let sectionName = isNaN(item.section) ? item.section : `Chapter ${item.section}`;
                md += `## ${sectionName}\n\n`;
                lastSection = item.section;
            }

            if (item.type === 'highlight') {
                const quotedText = item.text.split('\n').map(line => `> ${line}`).join('\n');
                md += `${quotedText}\n*${item.metadata}*\n\n`;
            } else if (item.type === 'note') {
                md += `**Note:** ${item.text}\n*${item.metadata}*\n\n`;
            }
        });

        return md;
    }

    btnReset.addEventListener('click', () => {
        outputSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        fileInput.value = '';
    });

    btnCopy.addEventListener('click', () => {
        const md = convertItemsToMarkdown(currentTitle, currentAuthors, currentItems);
        navigator.clipboard.writeText(md).then(() => {
            const originalText = btnCopy.textContent;
            btnCopy.textContent = 'Copied Markdown!';
            setTimeout(() => { btnCopy.textContent = originalText; }, 2000);
        });
    });
});
