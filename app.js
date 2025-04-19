class JSONParser {
    constructor() {
        this.jsonData = null;
        this.currentView = 'tree';
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.init();
        this.applyTheme(this.currentTheme);
        
        // Initialize Mermaid
        this.initializeMermaid();
        
        // Check for shared data in URL
        this.checkSharedData();

        this.diagramView = document.getElementById('diagram-view');
        this.diagramType = this.diagramView.querySelector('.diagram-type');
        this.mermaidContainer = this.diagramView.querySelector('.mermaid');
        
        // Add event listener for diagram type change
        this.diagramType.addEventListener('change', () => {
            this.renderDiagram();
        });

        // Chart section elements
        this.chartSection = document.querySelector('.chart-section');
        this.chartType = this.chartSection.querySelector('.chart-type');
        this.mermaidContainer = this.chartSection.querySelector('.mermaid');

        // Initialize mermaid with proper configuration
        mermaid.initialize({
            startOnLoad: false,
            theme: this.currentTheme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            flowchart: {
                curve: 'basis',
                padding: 20,
                nodeSpacing: 50,
                rankSpacing: 50
            },
            mindmap: {
                padding: 20,
                nodeSpacing: 50
            }
        });

        // Add event listener for chart type change
        this.chartType.addEventListener('change', () => {
            this.renderChart();
        });
    }

    init() {
        // DOM Elements
        this.dropZone = document.getElementById('drop-zone');
        this.fileInput = document.getElementById('file-input');
        this.uploadBtn = document.querySelector('.upload-btn');
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.viewContainers = document.querySelectorAll('.view-container');
        this.treeView = document.getElementById('tree-view');
        this.rawView = document.getElementById('raw-view');
        this.formattedView = document.getElementById('formatted-view');
        this.rawSize = document.getElementById('raw-size');
        this.formattedSize = document.getElementById('formatted-size');
        this.jsonpathInput = document.querySelector('.jsonpath-input');
        this.jsonpathBtn = document.querySelector('.jsonpath-btn');
        this.jsonpathOutput = document.getElementById('jsonpath-output');

        // Create theme switcher
        this.createThemeSwitcher();

        // Create search bar
        this.createSearchBar();

        // Create action buttons container
        this.createActionButtons();

        // Input method elements
        this.inputTabs = document.querySelectorAll('.input-tab');
        this.inputMethods = document.querySelectorAll('.input-method');
        this.jsonEditor = document.getElementById('json-input');
        this.formatBtn = document.getElementById('format-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.parseBtn = document.getElementById('parse-btn');

        // Additional editor elements
        this.lineNumbers = document.getElementById('line-numbers');
        if (this.lineNumbers) {
            this.lineNumbers.style.display = 'none'; // Hide line numbers
        }
        this.statusText = document.getElementById('editor-status-text');
        this.charCount = document.getElementById('char-count');
        
        this.updateCharCount();

        // Guides
        this.guides = document.querySelectorAll('.view-guide');

        // Event Listeners
        this.setupEventListeners();
        this.setupJSONPathListeners();
    }

    createThemeSwitcher() {
        const header = document.querySelector('.app-header');
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-switcher';
        themeBtn.innerHTML = `
            <svg class="light-icon" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" fill="currentColor"/>
            </svg>
            <svg class="dark-icon" viewBox="0 0 24 24" width="24" height="24">
                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" fill="currentColor"/>
            </svg>
        `;
        themeBtn.addEventListener('click', () => this.toggleTheme());
        header.appendChild(themeBtn);
    }

    createSearchBar() {
        const header = document.querySelector('.app-header');
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <input type="text" class="search-input" placeholder="Search keys and values...">
                <button class="search-prev" title="Previous match">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                    </svg>
                </button>
                <button class="search-next" title="Next match">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                    </svg>
                </button>
                <span class="search-count"></span>
            </div>
        `;
        header.appendChild(searchContainer);

        this.searchInput = searchContainer.querySelector('.search-input');
        this.searchPrev = searchContainer.querySelector('.search-prev');
        this.searchNext = searchContainer.querySelector('.search-next');
        this.searchCount = searchContainer.querySelector('.search-count');

        // Add search event listeners
        this.searchInput.addEventListener('input', () => this.handleSearch());
        this.searchPrev.addEventListener('click', () => this.navigateSearch('prev'));
        this.searchNext.addEventListener('click', () => this.navigateSearch('next'));
    }

    createActionButtons() {
        const panelHeader = document.querySelector('.visualization-panel .panel-header');
        const actionContainer = document.createElement('div');
        actionContainer.className = 'action-container';

        // Create share button
        const shareContainer = document.createElement('div');
        shareContainer.className = 'share-container';
        shareContainer.innerHTML = `
            <button class="share-btn">
                <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>
                </svg>
                Share
            </button>
            <div class="share-modal">
                <div class="share-modal-content">
                    <div class="share-modal-header">
                        <h3>Share JSON Data</h3>
                        <button class="share-modal-close">×</button>
                    </div>
                    <div class="share-modal-body">
                        <p>Share this link to provide access to your JSON data:</p>
                        <div class="share-link-container">
                            <input type="text" class="share-link" readonly>
                            <button class="copy-share-link">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                                </svg>
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Create export button
        const exportContainer = document.createElement('div');
        exportContainer.className = 'export-container';
        exportContainer.innerHTML = `
            <div class="export-wrapper">
                <button class="export-btn">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
                    </svg>
                    Export
                </button>
                <div class="export-dropdown">
                    <button class="export-option" data-format="json">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor"/>
                            <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor"/>
                        </svg>
                        JSON
                    </button>
                    <button class="export-option" data-format="yaml">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor"/>
                            <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor"/>
                        </svg>
                        YAML
                    </button>
                    <button class="export-option" data-format="csv">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="currentColor"/>
                            <polyline points="14 2 14 8 20 8" fill="none" stroke="currentColor"/>
                        </svg>
                        CSV
                    </button>
                </div>
            </div>
        `;

        // Add containers to the action container
        actionContainer.appendChild(shareContainer);
        actionContainer.appendChild(exportContainer);
        panelHeader.appendChild(actionContainer);

        // Add share button event listeners
        const shareBtn = shareContainer.querySelector('.share-btn');
        const shareModal = shareContainer.querySelector('.share-modal');
        const closeModal = shareContainer.querySelector('.share-modal-close');
        const shareLink = shareContainer.querySelector('.share-link');
        const copyLinkBtn = shareContainer.querySelector('.copy-share-link');

        shareBtn.addEventListener('click', () => {
            if (!this.jsonData) {
                this.showNotification('No data to share', 'error');
                return;
            }
            this.generateShareLink();
            shareModal.classList.add('show');
        });

        closeModal.addEventListener('click', () => {
            shareModal.classList.remove('show');
        });

        copyLinkBtn.addEventListener('click', () => {
            shareLink.select();
            document.execCommand('copy');
            this.showNotification('Share link copied to clipboard', 'success');
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.classList.remove('show');
            }
        });

        // Add event listeners
        const exportBtn = exportContainer.querySelector('.export-btn');
        const exportDropdown = exportContainer.querySelector('.export-dropdown');
        const exportOptions = exportContainer.querySelectorAll('.export-option');

        exportBtn.addEventListener('click', () => {
            exportDropdown.classList.toggle('show');
        });

        document.addEventListener('click', (e) => {
            if (!exportContainer.contains(e.target)) {
                exportDropdown.classList.remove('show');
            }
        });

        exportOptions.forEach(option => {
            option.addEventListener('click', () => {
                const format = option.dataset.format;
                this.exportData(format);
                exportDropdown.classList.remove('show');
            });
        });
    }

    generateShareLink() {
        try {
            const jsonStr = JSON.stringify(this.jsonData);
            const compressed = this.compressData(jsonStr);
            const url = new URL(window.location.href);
            url.searchParams.set('data', compressed);
            
            const shareLink = this.querySelector('.share-link');
            shareLink.value = url.toString();
        } catch (error) {
            console.error('Error generating share link:', error);
            this.showNotification('Failed to generate share link', 'error');
        }
    }

    compressData(jsonStr) {
        // Use base64 encoding for simplicity and URL safety
        return btoa(encodeURIComponent(jsonStr));
    }

    decompressData(compressed) {
        try {
            return decodeURIComponent(atob(compressed));
        } catch (error) {
            console.error('Error decompressing data:', error);
            return null;
        }
    }

    checkSharedData() {
        const url = new URL(window.location.href);
        const sharedData = url.searchParams.get('data');
        
        if (sharedData) {
            try {
                const jsonStr = this.decompressData(sharedData);
                if (jsonStr) {
                    this.jsonData = JSON.parse(jsonStr);
                    this.jsonEditor.value = JSON.stringify(this.jsonData, null, 2);
                    this.renderAllViews();
                    this.showNotification('Shared JSON data loaded successfully', 'success');
                    
                    // Clean URL after loading
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (error) {
                console.error('Error loading shared data:', error);
                this.showNotification('Failed to load shared data', 'error');
            }
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.currentTheme = newTheme;
        localStorage.setItem('theme', newTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        const themeSwitcher = document.querySelector('.theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.classList.toggle('dark', theme === 'dark');
        }
    }

    setupEventListeners() {
        // File upload
        this.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.add('dragover');
        });

        this.dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
        });

        this.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            this.handleFile(file);
        });

        this.uploadBtn.addEventListener('click', () => {
            this.fileInput.click();
        });

        this.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            this.handleFile(file);
        });

        // Input method tabs
        this.inputTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const inputMethod = tab.dataset.input;
                this.switchInputMethod(inputMethod);
            });
        });

        // Text editor actions
        this.formatBtn.addEventListener('click', () => {
            this.formatEditorContent();
        });

        this.clearBtn.addEventListener('click', () => {
            this.clearEditor();
        });

        this.parseBtn.addEventListener('click', () => {
            this.parseEditorContent();
        });

        // Tab switching
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });

        // Auto-format on paste
        this.jsonEditor.addEventListener('paste', (e) => {
            setTimeout(() => this.formatEditorContent(), 0);
        });

        // Add copy buttons to views
        this.setupCopyButtons();

        // Editor input handling
        this.jsonEditor.addEventListener('input', () => {
            this.updateCharCount();
            this.updateEditorStatus();
        });

        this.jsonEditor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.jsonEditor.selectionStart;
                const end = this.jsonEditor.selectionEnd;
                const spaces = '    ';
                
                this.jsonEditor.value = this.jsonEditor.value.substring(0, start) + spaces + this.jsonEditor.value.substring(end);
                this.jsonEditor.selectionStart = this.jsonEditor.selectionEnd = start + spaces.length;
            }
        });
    }

    setupCopyButtons() {
        const views = ['raw', 'formatted'];
        views.forEach(view => {
            const container = document.getElementById(`${view}-view`);
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>
                </svg>
                Copy
            `;
            copyBtn.addEventListener('click', () => this.copyToClipboard(view));
            container.insertBefore(copyBtn, container.firstChild);
        });
    }

    switchInputMethod(method) {
        this.inputTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.input === method);
        });

        this.inputMethods.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${method}-input-method`);
        });
    }

    clearEditor() {
        this.jsonEditor.value = '';
        this.updateCharCount();
        this.updateEditorStatus();
        this.showNotification('Editor cleared', 'success');
    }

    formatEditorContent() {
        try {
            const content = this.jsonEditor.value.trim();
            if (!content) return;

            const parsed = JSON.parse(content);
            this.jsonEditor.value = JSON.stringify(parsed, null, 4);
            this.updateCharCount();
            this.updateEditorStatus();
            this.showNotification('JSON formatted successfully', 'success');
        } catch (error) {
            this.showNotification('Invalid JSON format', 'error');
        }
    }

    parseEditorContent() {
        try {
            const content = this.jsonEditor.value.trim();
            if (!content) {
                this.showNotification('Please enter some JSON data', 'error');
                return;
            }

            this.jsonData = JSON.parse(content);
            this.renderAllViews();
            this.showNotification('JSON parsed successfully', 'success');
        } catch (error) {
            this.showNotification('Invalid JSON format', 'error');
            console.error(error);
        }
    }

    async handleFile(file) {
        if (!file) {
            this.showNotification('No file selected', 'error');
            return;
        }

        if (!file.name.endsWith('.json')) {
            this.showNotification('Please upload a valid JSON file', 'error');
            return;
        }

        try {
            const text = await file.text();
            this.jsonData = JSON.parse(text);
            
            // Switch to text input and show the content
            this.switchInputMethod('text');
            this.jsonEditor.value = JSON.stringify(this.jsonData, null, 2);
            
            this.renderAllViews();
            this.showNotification('JSON file loaded successfully', 'success');
        } catch (error) {
            this.showNotification('Invalid JSON format in file', 'error');
            console.error(error);
        }
    }

    renderAllViews() {
        this.renderTreeView();
        this.renderRawView();
        this.renderFormattedView();
        this.renderChart();
        this.updateSizeIndicators();
        
        if (this.searchInput && this.searchInput.value) {
            this.handleSearch();
        }
    }

    renderTreeView() {
        if (!this.jsonData) return;
        
        const createNode = (key, value) => {
            const node = document.createElement('div');
            node.className = 'tree-node';
            
            const content = document.createElement('div');
            content.className = 'tree-node-content';
            
            if (typeof value === 'object' && value !== null) {
                const isArray = Array.isArray(value);
                const isEmpty = Object.keys(value).length === 0;
                
                const toggle = document.createElement('span');
                toggle.className = 'tree-toggle';
                toggle.textContent = '▶';
                toggle.onclick = () => {
                    node.classList.toggle('expanded');
                    toggle.textContent = node.classList.contains('expanded') ? '▼' : '▶';
                };
                
                content.appendChild(toggle);
                
                if (key) {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'tree-key';
                    keySpan.textContent = `${key}: `;
                    content.appendChild(keySpan);
                }
                
                const typeSpan = document.createElement('span');
                typeSpan.className = 'tree-type';
                typeSpan.textContent = isEmpty ? (isArray ? '[]' : '{}') : (isArray ? '[' : '{');
                content.appendChild(typeSpan);
                
                if (!isEmpty) {
                    const children = document.createElement('div');
                    children.className = 'tree-children';
                    
                    Object.entries(value).forEach(([childKey, childValue]) => {
                        children.appendChild(createNode(childKey, childValue));
                    });
                    
                    const closing = document.createElement('span');
                    closing.className = 'tree-type';
                    closing.textContent = isArray ? ']' : '}';
                    
                    node.appendChild(content);
                    node.appendChild(children);
                    node.appendChild(closing);
                } else {
                    node.appendChild(content);
                }
            } else {
                if (key) {
                    const keySpan = document.createElement('span');
                    keySpan.className = 'tree-key';
                    keySpan.textContent = `${key}: `;
                    content.appendChild(keySpan);
                }
                
                const valueSpan = document.createElement('span');
                valueSpan.className = `tree-value ${typeof value}`;
                valueSpan.textContent = this.formatValue(value);
                content.appendChild(valueSpan);
                
                node.appendChild(content);
            }
            
            return node;
        };
        
        this.treeView.innerHTML = '';
        this.treeView.appendChild(createNode(null, this.jsonData));
    }

    formatValue(value) {
        if (value === null) return 'null';
        if (typeof value === 'string') return `"${value}"`;
        return String(value);
    }

    renderRawView() {
        if (!this.jsonData) return;
        
        const rawJson = JSON.stringify(this.jsonData);
        const codeElement = this.rawView.querySelector('code');
        codeElement.textContent = rawJson;
        this.highlightCode(codeElement);
        
        // Update size indicator
        const size = new Blob([rawJson]).size;
        this.rawSize.textContent = this.formatSize(size);
    }

    renderFormattedView() {
        if (!this.jsonData) return;
        
        const formattedJson = JSON.stringify(this.jsonData, null, 2);
        const codeElement = this.formattedView.querySelector('code');
        codeElement.textContent = formattedJson;
        this.highlightCode(codeElement);
        
        // Update size indicator
        const size = new Blob([formattedJson]).size;
        this.formattedSize.textContent = this.formatSize(size);
    }

    highlightCode(element) {
        const content = element.textContent;
        if (!content) return;

        // Escape HTML special characters
        const escaped = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Add syntax highlighting
        let highlighted = escaped
            .replace(/("(?:\\.|[^"\\])*")\s*:/g, '<span class="json-key">$1</span>:') // keys
            .replace(/:\s*("(?:\\.|[^"\\])*")/g, ': <span class="json-string">$1</span>') // string values
            .replace(/:\s*(true|false)/g, ': <span class="json-boolean">$1</span>') // booleans
            .replace(/:\s*(null)/g, ': <span class="json-null">$1</span>') // null
            .replace(/:\s*(-?\d+\.?\d*(?:e[+-]?\d+)?)/gi, ': <span class="json-number">$1</span>'); // numbers

        element.innerHTML = highlighted;
    }

    updateSizeIndicators() {
        if (!this.jsonData) {
            this.rawSize.textContent = '0 B';
            this.formattedSize.textContent = '0 B';
            return;
        }
        
        const rawSize = new Blob([JSON.stringify(this.jsonData)]).size;
        const formattedSize = new Blob([JSON.stringify(this.jsonData, null, 2)]).size;
        
        this.rawSize.textContent = this.formatSize(rawSize);
        this.formattedSize.textContent = this.formatSize(formattedSize);
    }

    formatSize(bytes) {
        const units = ['B', 'KB', 'MB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    }

    async copyToClipboard(view) {
        try {
            const content = view === 'raw' 
                ? JSON.stringify(this.jsonData)
                : JSON.stringify(this.jsonData, null, 2);
                
            await navigator.clipboard.writeText(content);
            this.showNotification('Copied to clipboard', 'success');
        } catch (error) {
            this.showNotification('Failed to copy to clipboard', 'error');
            console.error(error);
        }
    }

    switchView(view) {
        this.currentView = view;
        
        // Update tab buttons
        this.tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update view containers and guides
        this.viewContainers.forEach(container => {
            const isActive = container.id === `${view}-view`;
            container.classList.toggle('active', isActive);
            
            // Ensure proper display style
            setTimeout(() => {
                container.style.display = isActive ? 'block' : 'none';
            }, isActive ? 0 : 300); // Wait for fade out before hiding
        });
        
        // Re-render the current view to ensure proper display
        switch (view) {
            case 'raw':
                this.renderRawView();
                break;
            case 'formatted':
                this.renderFormattedView();
                break;
            case 'tree':
                this.renderTreeView();
                break;
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    updateCharCount() {
        const count = this.jsonEditor.value.length;
        this.charCount.textContent = `${count} character${count !== 1 ? 's' : ''}`;
    }

    updateEditorStatus() {
        try {
            const content = this.jsonEditor.value.trim();
            if (!content) {
                this.statusText.textContent = 'Ready to parse JSON';
                return;
            }
            
            JSON.parse(content);
            this.statusText.textContent = 'Valid JSON';
            this.statusText.style.color = 'var(--success)';
        } catch (error) {
            this.statusText.textContent = 'Invalid JSON';
            this.statusText.style.color = 'var(--error)';
        }
    }

    handleSearch() {
        const searchTerm = this.searchInput.value.toLowerCase();
        this.searchResults = [];
        this.currentSearchIndex = -1;

        if (!searchTerm || !this.jsonData) {
            this.updateSearchCount();
            this.clearHighlights();
            return;
        }

        // Search through the JSON data
        this.searchInObject(this.jsonData, '', []);
        this.updateSearchCount();

        if (this.searchResults.length > 0) {
            this.navigateSearch('next');
        } else {
            this.clearHighlights();
        }
    }

    searchInObject(obj, path, parentIndexes) {
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                const newPath = path ? `${path}[${index}]` : `[${index}]`;
                const newIndexes = [...parentIndexes, index];
                this.searchInObject(item, newPath, newIndexes);
            });
        } else if (obj && typeof obj === 'object') {
            Object.entries(obj).forEach(([key, value]) => {
                const newPath = path ? `${path}.${key}` : key;
                
                // Search in keys
                if (key.toLowerCase().includes(this.searchInput.value.toLowerCase())) {
                    this.searchResults.push({ path: newPath, type: 'key', value: key });
                }

                // Search in values if they're primitive types
                if (typeof value !== 'object' || value === null) {
                    const stringValue = String(value).toLowerCase();
                    if (stringValue.includes(this.searchInput.value.toLowerCase())) {
                        this.searchResults.push({ path: newPath, type: 'value', value: value });
                    }
                }

                // Recurse into nested objects/arrays
                if (value && typeof value === 'object') {
                    this.searchInObject(value, newPath, parentIndexes);
                }
            });
        }
    }

    navigateSearch(direction) {
        if (this.searchResults.length === 0) return;

        if (direction === 'next') {
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        } else {
            this.currentSearchIndex = (this.currentSearchIndex - 1 + this.searchResults.length) % this.searchResults.length;
        }

        this.highlightCurrentMatch();
        this.updateSearchCount();
    }

    updateSearchCount() {
        if (this.searchResults.length === 0) {
            this.searchCount.textContent = 'No matches';
            this.searchCount.className = 'search-count no-results';
        } else {
            this.searchCount.textContent = `${this.currentSearchIndex + 1} of ${this.searchResults.length}`;
            this.searchCount.className = 'search-count';
        }
    }

    highlightCurrentMatch() {
        this.clearHighlights();
        if (this.currentSearchIndex === -1 || !this.searchResults[this.currentSearchIndex]) return;

        const result = this.searchResults[this.currentSearchIndex];
        
        // Highlight in tree view
        const treeElements = this.treeView.querySelectorAll('.tree-node-content');
        treeElements.forEach(element => {
            if (element.textContent.includes(result.path)) {
                element.classList.add('search-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Expand parent nodes
                let parent = element.parentElement;
                while (parent && parent.classList.contains('tree-node')) {
                    parent.classList.add('expanded');
                    parent = parent.parentElement.closest('.tree-node');
                }
            }
        });

        // Highlight in formatted view
        const formattedElement = this.formattedView.querySelector('code');
        if (formattedElement) {
            const content = formattedElement.innerHTML;
            const highlightedContent = content.replace(
                new RegExp(`(${result.value})`, 'gi'),
                '<span class="search-highlight">$1</span>'
            );
            formattedElement.innerHTML = highlightedContent;
        }
    }

    clearHighlights() {
        // Clear tree view highlights
        const highlightedNodes = this.treeView.querySelectorAll('.search-highlight');
        highlightedNodes.forEach(node => node.classList.remove('search-highlight'));

        // Clear formatted view highlights
        const formattedElement = this.formattedView.querySelector('code');
        if (formattedElement && this.jsonData) {
            this.renderFormattedView(); // Re-render to clear highlights
        }
    }

    exportData(format) {
        if (!this.jsonData) {
            this.showNotification('No data to export', 'error');
            return;
        }

        try {
            let content = '';
            let filename = 'exported-data';
            let mimeType = '';

            switch (format) {
                case 'json':
                    content = JSON.stringify(this.jsonData, null, 2);
                    filename += '.json';
                    mimeType = 'application/json';
                    break;
                case 'yaml':
                    content = this.convertToYAML(this.jsonData);
                    filename += '.yaml';
                    mimeType = 'text/yaml';
                    break;
                case 'csv':
                    content = this.convertToCSV(this.jsonData);
                    filename += '.csv';
                    mimeType = 'text/csv';
                    break;
            }

            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showNotification(`Exported as ${format.toUpperCase()} successfully`, 'success');
        } catch (error) {
            console.error('Export error:', error);
            this.showNotification(`Failed to export as ${format.toUpperCase()}`, 'error');
        }
    }

    convertToYAML(obj, indent = 0) {
        const spaces = '  '.repeat(indent);
        let yaml = '';

        if (Array.isArray(obj)) {
            if (obj.length === 0) return '[]';
            return obj.map(item => {
                if (typeof item === 'object' && item !== null) {
                    return `${spaces}- ${this.convertToYAML(item, indent + 1).trimStart()}`;
                }
                return `${spaces}- ${this.formatYAMLValue(item)}`;
            }).join('\n');
        }

        if (typeof obj === 'object' && obj !== null) {
            if (Object.keys(obj).length === 0) return '{}';
            return Object.entries(obj).map(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    return `${spaces}${key}:\n${this.convertToYAML(value, indent + 1)}`;
                }
                return `${spaces}${key}: ${this.formatYAMLValue(value)}`;
            }).join('\n');
        }

        return this.formatYAMLValue(obj);
    }

    formatYAMLValue(value) {
        if (typeof value === 'string') {
            if (value.includes('\n') || value.includes('"')) {
                return `|\n${value.split('\n').map(line => `  ${line}`).join('\n')}`;
            }
            if (value.includes("'") || /^[0-9]/.test(value) || value.includes(' ')) {
                return `"${value.replace(/"/g, '\\"')}"`;
            }
            return value;
        }
        if (value === null) return 'null';
        if (value === undefined) return '~';
        return String(value);
    }

    convertToCSV(obj) {
        // Flatten the JSON object
        const flatData = this.flattenObject(obj);
        
        // Get all unique keys
        const keys = Array.from(new Set(
            Object.keys(flatData).map(key => key.split('.')[0])
        ));

        // Create CSV header
        const header = keys.join(',');

        // Create CSV rows
        const rows = [header];
        if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
                const row = keys.map(key => {
                    const value = flatData[`${key}.${index}`] || flatData[key] || '';
                    return this.formatCSVValue(value);
                });
                rows.push(row.join(','));
            });
        } else {
            const row = keys.map(key => {
                const value = flatData[key] || '';
                return this.formatCSVValue(value);
            });
            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    flattenObject(obj, prefix = '') {
        const flat = {};

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flat, this.flattenObject(value, newKey));
            } else {
                flat[newKey] = value;
            }
        }

        return flat;
    }

    formatCSVValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        if (typeof value === 'string') {
            if (value.includes('"') || value.includes(',') || value.includes('\n')) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }
        return String(value);
    }

    renderChart() {
        const container = document.querySelector('.mermaid');
        if (!container || !this.jsonData) return;

        // Create flowchart from JSON data
        let nodeId = 0;
        let chart = 'flowchart TB\n';
        
        const createNode = (key, value) => {
            nodeId++;
            const currentId = `node${nodeId}`;
            
            if (typeof value === 'object' && value !== null) {
                // For objects/arrays, create a node with the key
                chart += `    ${currentId}[${key}]\n`;
                
                // Process each child of the object/array
                Object.entries(value).forEach(([childKey, childValue]) => {
                    const childId = createNode(childKey, childValue);
                    chart += `    ${currentId} --> ${childId}\n`;
                });
                
                return currentId;
            } else {
                // For primitive values, create a node with both key and value
                chart += `    ${currentId}[${key}: ${value}]\n`;
                return currentId;
            }
        };

        // Start the flowchart
        chart += '    start[Start]\n';
        
        // Process the root level entries
        Object.entries(this.jsonData).forEach(([key, value], index) => {
            const nodeId = createNode(key, value);
            if (index === 0) {
                chart += `    start --> ${nodeId}\n`;
            }
        });

        // Update the container content
        container.textContent = chart;

        // Clear and re-render the chart
        container.removeAttribute('data-processed');
        mermaid.init(undefined, container);
    }

    initializeMermaid() {
        // Basic Mermaid configuration
        mermaid.initialize({
            startOnLoad: true,
            theme: this.currentTheme === 'dark' ? 'dark' : 'default',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true
            }
        });
    }

    setupJSONPathListeners() {
        if (this.jsonpathBtn && this.jsonpathInput) {
            this.jsonpathBtn.addEventListener('click', () => this.executeJSONPathQuery());
            this.jsonpathInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeJSONPathQuery();
                }
            });
        }
    }

    executeJSONPathQuery() {
        if (!this.jsonData) {
            this.showNotification('No JSON data to query', 'error');
            return;
        }

        const query = this.jsonpathInput.value.trim();
        if (!query) {
            this.showNotification('Please enter a JSONPath query', 'error');
            return;
        }

        try {
            const result = this.evaluateJSONPath(this.jsonData, query);
            this.jsonpathOutput.textContent = JSON.stringify(result, null, 2);
            this.highlightCode(this.jsonpathOutput);
            this.showNotification('Query executed successfully', 'success');
        } catch (error) {
            this.showNotification('Invalid JSONPath query', 'error');
            console.error(error);
        }
    }

    evaluateJSONPath(obj, path) {
        // Simple JSONPath implementation
        const parts = path.replace(/^\$\.?/, '').split('.');
        let result = obj;

        for (const part of parts) {
            const arrayMatch = part.match(/^([^\[]+)?\[([^\]]+)\]$/);
            if (arrayMatch) {
                const [, prop, index] = arrayMatch;
                if (prop) {
                    result = result[prop];
                }
                if (index === '*') {
                    return Array.isArray(result) ? result : [];
                }
                result = result[parseInt(index, 10)];
            } else {
                result = result[part];
            }

            if (result === undefined) {
                return null;
            }
        }

        return result;
    }
}

// Initialize the parser
new JSONParser(); 