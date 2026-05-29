import { PointHttpOptions } from '../types';
import { getDefaultStyle } from './style';
import { clientScriptRaw } from './scripts/script.generated';

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getHtmlTemplate(options: PointHttpOptions, files: Array<{ relativePath: string; content: string }>): string {
  const title = escapeHtml(options.title || 'PointHTTP Playground');
  const logoTitle = escapeHtml(options.logoTitle || 'PointHTTP');
  const customCss = options.customCss || '';
  const defaultEnvVars = JSON.stringify(options.envVariables || {});

  let navItemsHtml = '';
  let docSectionsHtml = '';

  files.forEach((file, index) => {
    const activeClass = index === 0 ? 'active' : '';
    const escapedPath = escapeHtml(file.relativePath);
    
    navItemsHtml += `
      <a href="#doc-${index}" class="nav-item ${activeClass}" id="nav-doc-${index}" data-filepath="${escapedPath}">
        <span class="nav-item-icon">📄</span>
        <span class="nav-item-text">${escapedPath}</span>
      </a>
    `;

    const escapedContent = file.content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '\\`');

    docSectionsHtml += `
      <div class="doc-section" id="doc-${index}" data-filepath="${escapedPath.toLowerCase()}">
        <div class="section-header" onclick="window.toggleSection(${index})">
          <div class="section-title-wrapper">
            <svg class="section-chevron" id="chevron-${index}" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            <h3 class="section-title">${escapedPath}</h3>
          </div>
          <div class="section-actions" onclick="event.stopPropagation()">
            <button class="btn-copy" onclick="window.copyContent('raw-${index}', this)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              Copy File
            </button>
          </div>
        </div>
        <div class="section-body" id="body-${index}">
          <div class="pre-wrapper">
            <pre id="display-${index}"></pre>
          </div>
          <textarea id="raw-${index}" style="display:none;">${escapedContent}</textarea>
        </div>
      </div>
    `;
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${getDefaultStyle()}
    ${customCss}
  </style>
</head>
<body>

  <div class="sidebar">
    <div class="logo-area">
      <svg class="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
        <defs>
          <radialGradient id="space-grad-lib" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stop-color="#3b82f6" />
            <stop offset="60%" stop-color="#1e3a8a" />
            <stop offset="100%" stop-color="#0f172a" />
          </radialGradient>
          <linearGradient id="glow-grad-lib" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#60a5fa" />
            <stop offset="50%" stop-color="#3b82f6" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        <circle cx="250" cy="250" r="230" fill="url(#space-grad-lib)" stroke="#1e2942" stroke-width="4" />
        <circle cx="250" cy="250" r="226" fill="none" stroke="#2563eb" stroke-width="2" stroke-opacity="0.4" />
        <g transform="translate(110, 120)">
          <path d="M 0,0 L 90,0 C 130,0 150,20 150,55 C 150,90 130,110 90,110 L 40,110 L 40,260 L 0,260 Z M 40,40 L 40,75 L 85,75 C 98,75 110,70 110,57 C 110,45 98,40 85,40 Z" fill="#ffffff" />
          <rect x="180" y="0" width="40" height="260" rx="6" fill="url(#glow-grad-lib)" />
          <path d="M 220,100 L 280,100 L 280,30 L 360,130 L 280,230 L 280,160 L 220,160 Z" fill="#ffffff" stroke="url(#glow-grad-lib)" stroke-width="6" stroke-linejoin="round" />
        </g>
      </svg>
      <div class="logo-title-wrapper">
        <div class="logo-title">${logoTitle}</div>
        <div class="logo-subtitle">API REST Client</div>
      </div>
    </div>

    <div class="search-wrapper">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="text" class="search-input" id="search-docs" placeholder="Search files & endpoints..." oninput="window.handleSearch(this.value)">
    </div>

    <div class="sidebar-tabs">
      <div class="sidebar-tab active" id="tab-btn-docs" onclick="window.switchSidebarTab('docs')">REST Documents</div>
      <div class="sidebar-tab" id="tab-btn-snapshots" onclick="window.switchSidebarTab('snapshots')">Saved Snapshots</div>
    </div>

    <div class="sidebar-tab-content active" id="sidebar-tab-content-docs">
      <div class="nav-list" id="navigation-list">
        ${navItemsHtml}
      </div>
    </div>

    <div class="sidebar-tab-content" id="sidebar-tab-content-snapshots">
      <div class="nav-list" id="saved-snapshots-list">
        <div class="no-snapshots-msg">No saved snapshots yet</div>
      </div>
    </div>
  </div>

  <div class="content" id="main-content">
    <header>
      <div class="header-main">
        <h1>PointHTTP Playground (.http REST Client)</h1>
      </div>
      <p>Consolidated, fully interactive API documentation. You can test and execute requests directly inside your browser!</p>
      
      <div class="vars-container">
        <div class="vars-header" onclick="window.toggleVariablesPanel()">
          <div class="vars-title">Active Environment Variables</div>
          <span class="vars-toggle-icon" id="vars-toggle-text">
            Show Variables
            <svg class="vars-arrow" id="vars-arrow-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>
        </div>
        <div class="vars-grid" id="variables-editor" style="display:none;"></div>
      </div>
    </header>

    <div id="docs-list-container">
      ${docSectionsHtml}
    </div>
  </div>

  <div class="drawer" id="response-drawer">
    <div class="drawer-resize-handle" id="drawer-resize-handle"></div>
    <div class="drawer-header">
      <h2 class="drawer-title" id="drawer-req-title">API Response</h2>
      <button class="drawer-close" onclick="window.toggleDrawer(false)">✕</button>
    </div>
    <div class="drawer-meta" id="drawer-metadata">
      <div class="meta-badges">
        <span class="status-badge status-pending" id="res-status">PENDING</span>
        <span class="latency-badge" id="res-latency">-- ms</span>
      </div>
      <div class="section-actions">
        <button class="btn-copy" id="btn-copy-response" onclick="window.copyResponseText()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          Copy JSON
        </button>
        <button class="btn-copy" id="btn-copy-curl" onclick="window.copyCurlCommand()">cURL</button>
        <button class="btn-copy" id="btn-download-response" onclick="window.downloadResponseText()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download
        </button>
        <button class="btn-copy" id="btn-save-snapshot" onclick="window.saveResponseSnapshot()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
          Save Snapshot
        </button>
      </div>
    </div>
    <div class="drawer-body">
      <div class="response-tabs" id="res-tabs-bar" style="display: none;">
        <button class="response-tab active" onclick="window.switchResponseTab('pretty')">Pretty</button>
        <button class="response-tab" onclick="window.switchResponseTab('raw')">Raw</button>
        
        <div class="pretty-controls" id="pretty-view-controls">
          <button class="btn-control" onclick="window.expandAllJson()">Expand All</button>
          <button class="btn-control" onclick="window.collapseAllJson()">Collapse All</button>
        </div>
      </div>

      <div id="res-loader" class="spinner-container">
        <div class="spinner"></div>
        <p>Executing HTTP request...</p>
      </div>

      <div id="res-pretty-wrapper" style="display: none;">
        <div id="res-pretty-content" class="json-tree-container"></div>
      </div>

      <div id="res-body-wrapper" style="display: none;">
        <pre style="padding:0; background:transparent;"><code id="res-body-content" style="color: #60a5fa; font-family:'Fira Code', monospace;"></code></pre>
      </div>
    </div>
  </div>

  <script>
    (function() {
      // Inject compiled, un-shakable layout data block directly 
      ${clientScriptRaw}
      
      // Ignite entry initialization sequence
      window.bootstrapApplication(${defaultEnvVars});
    })();
  </script>

  <div id="custom-modal" class="modal-overlay">
    <div class="modal-card">
      <h3 id="modal-title">Confirm Action</h3>
      <p id="modal-message"></p>
      <input type="text" id="modal-input" placeholder="Type here..." />
      <div class="modal-actions">
        <button id="modal-btn-cancel" class="btn-secondary">Cancel</button>
        <button id="modal-btn-confirm" class="btn-primary">OK</button>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}