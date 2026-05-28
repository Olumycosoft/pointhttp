export function getDefaultStyle(): string {
  return `
    :root {
      --bg-dark: #070a13;
      --bg-sidebar: #0d1222;
      --panel-dark: #121829;
      --panel-header: #192137;
      --border-color: #1e2942;
      --blue: #2563eb;
      --blue-glow: rgba(37, 99, 235, 0.4);
      --blue-light: #60a5fa;
      --green: #10b981;
      --green-glow: rgba(16, 185, 129, 0.2);
      --orange: #f59e0b;
      --orange-glow: rgba(245, 158, 11, 0.2);
      --red: #ef4444;
      --red-glow: rgba(239, 68, 68, 0.2);
      --purple: #8b5cf6;
      --purple-glow: rgba(139, 92, 246, 0.2);
      --text-main: #f1f5f9;
      --text-muted: #64748b;
      --text-secondary: #94a3b8;
    }

    body {
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Outfit', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* Scrollbar Styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg-dark);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border-color);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    /* Sidebar Navigation */
    .sidebar {
      width: 320px;
      background-color: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      padding: 24px 16px 16px 16px;
      overflow: hidden;
      box-sizing: border-box;
      z-index: 90;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 4px 8px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--blue), var(--purple));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 18px;
      box-shadow: 0 4px 20px var(--blue-glow);
      letter-spacing: 0.5px;
    }

    .logo-title-wrapper {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 18px;
      font-weight: 800;
      background: linear-gradient(to right, #ffffff, #cbd5e1);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    .logo-subtitle {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }

    /* Search Bar Styling */
    .search-wrapper {
      position: relative;
      margin: 4px 0;
    }

    .search-input {
      width: 100%;
      background: #090d16;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      color: var(--text-main);
      padding: 10px 12px 10px 36px;
      font-size: 13px;
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--blue-light);
      box-shadow: 0 0 12px rgba(37, 99, 235, 0.15);
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      pointer-events: none;
    }

    .sidebar-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      font-weight: 700;
      padding-left: 8px;
    }

    .nav-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s ease;
      border: 1px solid transparent;
      word-break: break-all;
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.02);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(139, 92, 246, 0.08));
      border-color: rgba(37, 99, 235, 0.15);
      color: var(--blue-light);
    }

    .nav-item-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .nav-item-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* Main Content Container */
    .content {
      margin-left: 320px;
      flex-grow: 1;
      padding: 0 40px 40px 40px;
      max-width: 1000px;
      transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-sizing: border-box;
    }

    header {
      position: sticky;
      top: 0;
      background: rgba(7, 10, 19, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      z-index: 85;
      margin-left: -40px;
      margin-right: -40px;
      padding: 24px 40px 16px 40px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 30px;
    }

    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    header h1 {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #93c2faff, #aed4ffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    header p {
      font-size: 13px;
      color: var(--text-secondary);
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    /* Environment Variables Panel */
    .vars-container {
      background: rgba(18, 24, 41, 0.5);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 10px 16px;
      backdrop-filter: blur(8px);
    }

    .vars-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .vars-title {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      font-weight: 700;
    }

    .vars-toggle-icon {
      color: var(--text-muted);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: color 0.2s;
    }

    .vars-toggle-icon:hover {
      color: white;
    }

    .vars-arrow {
      transition: transform 0.2s ease;
    }

    .vars-arrow.rotated {
      transform: rotate(180deg);
    }

    .vars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 12px;
      margin-top: 12px;
    }

    .var-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .var-label {
      font-size: 11px;
      color: var(--text-secondary);
      font-family: 'Fira Code', monospace;
    }

    .var-input {
      background: #080c15;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: var(--text-main);
      padding: 6px 10px;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      transition: all 0.2s ease;
    }

    .var-input:focus {
      border-color: var(--blue-light);
      outline: none;
    }

    /* Document Section styling */
    .doc-section {
      background-color: var(--panel-dark);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      scroll-margin-top: 220px;
    }

    .section-header {
      background-color: var(--panel-header);
      padding: 14px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      user-select: none;
    }

    .section-title-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-chevron {
      color: var(--text-muted);
      transition: transform 0.2s ease;
    }

    .section-chevron.collapsed {
      transform: rotate(-90deg);
    }

    .section-title {
      font-size: 14px;
      font-family: 'Fira Code', monospace;
      font-weight: 600;
      color: var(--blue-light);
      margin: 0;
    }

    .section-actions {
      display: flex;
      gap: 8px;
    }

    .btn-copy {
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-copy:hover {
      background-color: var(--blue);
      color: white;
      border-color: var(--blue);
    }

    .section-body {
      opacity: 1;
      transition: opacity 0.2s ease-in-out;
    }

    .section-body.collapsed {
      display: none;
      opacity: 0;
    }

    .pre-wrapper {
      position: relative;
      background-color: #080c14;
    }

    pre {
      margin: 0;
      padding: 12px 16px;
      font-family: 'Fira Code', monospace;
      font-size: 13.5px;
      line-height: 1.6;
      white-space: pre-wrap;
      word-wrap: break-word;
      word-break: break-all;
    }

    /* Request Action Bar style */
    .request-action-bar {
      padding: 12px 20px 0 20px;
      background-color: #080c14;
      display: flex;
      gap: 16px;
      font-size: 13px;
    }

    .link-send-request {
      color: var(--blue-light);
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      user-select: none;
    }

    .link-send-request:hover {
      color: white;
      text-decoration: none;
    }

    /* Slide-out Response Drawer */
    .drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 520px;
      background-color: #090d18;
      border-left: 1px solid var(--border-color);
      box-shadow: -10px 0 40px rgba(0, 0, 0, 0.6);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .drawer.open {
      transform: translateX(0);
    }
    
    .drawer.resizing {
      transition: none !important;
    }
    
    .drawer-resize-handle {
      position: absolute;
      top: 0;
      left: -2px;
      bottom: 0;
      width: 5px;
      cursor: ew-resize;
      z-index: 1010;
      background-color: transparent;
      transition: background-color 0.15s ease;
    }
    
    .drawer-resize-handle:hover,
    .drawer-resize-handle.active-resize {
      background-color: #3b82f6;
      box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
    }

    .drawer-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--panel-header);
    }

    .drawer-title {
      font-size: 16px;
      font-weight: 700;
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 380px;
    }

    .drawer-close {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      transition: color 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drawer-close:hover {
      color: white;
    }

    .drawer-meta {
      padding: 12px 24px;
      background: rgba(255, 255, 255, 0.01);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-badges {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .status-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'Fira Code', monospace;
    }

    .status-success { background: var(--green-glow); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-error { background: var(--red-glow); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.3); }
    .status-pending { background: var(--orange-glow); color: var(--orange); border: 1px solid rgba(245, 158, 11, 0.3); }

    .latency-badge {
      font-size: 11px;
      color: var(--text-secondary);
      font-family: 'Fira Code', monospace;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid var(--border-color);
    }

    .drawer-body {
      flex-grow: 1;
      overflow-y: auto;
      padding: 24px;
      font-family: 'Fira Code', monospace;
      font-size: 13px;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 100px 0;
      color: var(--text-muted);
    }

    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(37, 99, 235, 0.1);
      border-top-color: var(--blue-light);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 20px;
      box-shadow: 0 0 15px rgba(37, 99, 235, 0.15);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Token Highlighting Styles */
    .token-header { color: var(--purple); font-weight: 600; }
    .token-comment { color: #4e5e78; font-style: italic; }
    .token-variable { color: var(--orange); }
    .token-method {
      display: inline-block;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-right: 8px;
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    .token-get { background: var(--green-glow); color: var(--green); border: 1px solid rgba(16, 185, 129, 0.2); }
    .token-post { background: var(--blue-glow); color: var(--blue-light); border: 1px solid rgba(37, 99, 235, 0.2); }
    .token-put { background: var(--orange-glow); color: var(--orange); border: 1px solid rgba(245, 158, 11, 0.2); }
    .token-delete { background: var(--red-glow); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
    .token-patch { background: var(--purple-glow); color: var(--purple); border: 1px solid rgba(139, 92, 246, 0.2); }
    .token-header-key { color: var(--purple); font-weight: 500; }
    .token-header-val { color: var(--text-secondary); }

    /* Response Tabs styling */
    .response-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 16px;
      padding-bottom: 8px;
    }

    .response-tab {
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .response-tab:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.02);
    }

    .response-tab.active {
      background-color: rgba(37, 99, 235, 0.1);
      border-color: rgba(37, 99, 235, 0.2);
      color: var(--blue-light);
    }

    .pretty-controls {
      margin-left: auto;
      display: flex;
      gap: 6px;
    }

    .btn-control {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-control:hover {
      color: white;
      border-color: var(--text-secondary);
      background-color: rgba(255, 255, 255, 0.05);
    }

    /* JSON Interactive Tree Styles */
    .json-tree-container {
      font-family: 'Fira Code', monospace;
      font-size: 12.5px;
      line-height: 1.6;
      color: var(--text-main);
      overflow-x: auto;
    }
    
    .json-group {
      display: flex;
      flex-direction: column;
    }
    
    .json-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      padding: 1px 0;
      white-space: pre-wrap;
    }
    
    .json-header {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-left: 18px;
      margin-left: -18px;
      border-radius: 4px;
      transition: background-color 0.15s ease;
    }
    
    .json-header:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }
    
    .json-toggle-icon {
      position: absolute;
      left: 2px;
      color: var(--text-muted);
      width: 12px;
      height: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .json-toggle-icon svg {
      transition: transform 0.2s ease;
    }
    
    .json-children {
      padding-left: 20px;
      border-left: 1px dashed var(--border-color);
      margin-left: 4px;
    }
    
    .json-footer {
      cursor: pointer;
      user-select: none;
      padding-left: 18px;
      margin-left: -18px;
      border-radius: 4px;
      transition: background-color 0.15s ease;
    }
    
    .json-footer:hover {
      background-color: rgba(255, 255, 255, 0.04);
    }
    
    .json-key {
      color: #93c5fd; /* Soft blue for keys */
      font-weight: 500;
    }
    
    .json-bracket {
      color: #cbd5e1;
      font-weight: 600;
    }
    
    .json-preview {
      color: var(--text-muted);
      font-size: 10.5px;
      margin-left: 8px;
      font-style: italic;
    }
    
    .json-collapsed-text {
      display: none;
      color: var(--text-muted);
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      padding: 0 4px;
      font-size: 11px;
      margin-left: 4px;
    }
    
    /* Collapsed State overrides */
    .json-group.collapsed > .json-children {
      display: none;
    }
    
    .json-group.collapsed > .json-footer {
      display: none;
    }
    
    .json-group.collapsed > .json-header .json-collapsed-text {
      display: inline;
    }
    
    .json-group.collapsed > .json-header .json-toggle-icon svg {
      transform: rotate(-90deg);
    }
    
    /* Value Token Types */
    .json-value.json-string {
      color: #34d399; /* Emerald green for string values */
      word-break: break-all;
    }
    
    .json-value.json-number {
      color: #fb7185; /* Soft red/coral for numbers */
    }
    
    .json-value.json-boolean {
      color: #fbbf24; /* Amber yellow for booleans */
      font-weight: 600;
    }
    
    .json-value.json-null {
      color: #94a3b8; /* Muted slate for nulls */
      font-style: italic;
    }

    /* Saved Snapshots Styles */
    .no-snapshots-msg {
      font-size: 11px;
      color: var(--text-muted, #64748b);
      padding: 12px 16px;
      font-style: italic;
      text-align: center;
    }
    
    .snapshot-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 6px;
      color: var(--text-light, #f8fafc);
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 6px;
      position: relative;
      background-color: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.03);
    }
    
    .snapshot-item:hover {
      background-color: rgba(255, 255, 255, 0.045);
      border-color: rgba(255, 255, 255, 0.08);
      transform: translateX(2px);
    }
    
    .snapshot-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
    }
    
    .snapshot-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--text-main, #e2e8f0);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .snapshot-meta {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
    }
    
    .snapshot-method {
      font-size: 8px;
      font-weight: 700;
      padding: 1px 3px;
      border-radius: 2px;
      text-transform: uppercase;
      line-height: 1;
    }
    
    .snapshot-url {
      color: var(--text-muted, #64748b);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }
    
    .snapshot-delete-btn {
      color: var(--text-muted, #64748b);
      background: none;
      border: none;
      font-size: 10px;
      cursor: pointer;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.15s ease;
      margin-left: 6px;
      flex-shrink: 0;
    }
    
    .snapshot-delete-btn:hover {
      color: #f87171;
      background-color: rgba(239, 68, 68, 0.15);
    }

    /* Custom Premium Modal Dialog Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .modal-overlay.active {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-card {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      width: 90%;
      max-width: 420px;
      padding: 24px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4);
      transform: scale(0.95);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .modal-overlay.active .modal-card {
      transform: scale(1);
    }
    .modal-card h3 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 16px;
      font-weight: 600;
      color: white;
    }
    .modal-card p {
      margin-top: 0;
      margin-bottom: 20px;
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.5;
    }
    .modal-card input[type="text"] {
      width: 100%;
      padding: 10px 14px;
      background-color: rgba(30, 41, 59, 0.5);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      color: white;
      font-size: 13px;
      margin-bottom: 24px;
      outline: none;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      box-sizing: border-box;
    }
    .modal-card input[type="text"]:focus {
      border-color: var(--blue);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .modal-actions button {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
    }
    .modal-actions .btn-secondary {
      background-color: transparent;
      border-color: var(--border-color);
      color: #cbd5e1;
    }
    .modal-actions .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.05);
      border-color: #94a3b8;
    }
    .modal-actions .btn-primary {
      background-color: var(--blue);
      color: white;
    }
    .modal-actions .btn-primary:hover {
      background-color: #2563eb;
    }
    .modal-actions .btn-danger {
      background-color: var(--red);
      color: white;
    }
    .modal-actions .btn-danger:hover {
      background-color: #dc2626;
    }

    /* Sidebar Tab Switcher Styles */
    .sidebar-tabs {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      gap: 16px;
      padding: 0 4px;
      margin-top: 4px;
    }
    .sidebar-tab {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      font-weight: 700;
      padding: 8px 0;
      cursor: pointer;
      position: relative;
      transition: color 0.15s ease;
      user-select: none;
    }
    .sidebar-tab:hover {
      color: var(--text-main);
    }
    .sidebar-tab.active {
      color: var(--blue-light);
    }
    .sidebar-tab.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--blue-light);
      border-radius: 2px;
      box-shadow: 0 0 8px var(--blue-glow);
    }
    .sidebar-tab-content {
      display: none;
    }
    .sidebar-tab-content.active {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      margin-right: -8px;
      padding-right: 8px;
    }

    /* Premium HTTP Request Card Demarcation */
    .http-request-card {
      margin: 12px 0;
      border: 1px solid rgba(147, 197, 253, 0.15);
      border-radius: 8px;
      background-color: rgba(13, 18, 34, 0.3);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .http-request-card:hover {
      border-color: rgba(99, 102, 241, 0.35);
      background-color: rgba(13, 18, 34, 0.4);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
    }
    .http-request-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background-color: var(--panel-header);
      border-bottom: 1px solid rgba(147, 197, 253, 0.15);
      user-select: none;
      margin: 0;
    }
    .http-request-card-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      font-family: 'Outfit', 'Inter', system-ui, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .http-request-card-comments {
      margin-top: 0;
      margin-bottom: 8px;
      font-size: 12px;
      color: #94a3b8;
      opacity: 0.85;
      font-style: italic;
      border-left: 2px solid rgba(255, 255, 255, 0.15);
      padding-left: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.4;
    }
    .http-request-card-body {
      padding: 8px 14px 10px 14px;
    }
 
    /* Live Editable JSON Payload Editor */
    .payload-editor-container {
      margin: 8px 0 12px 0;
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-left: 3px solid rgba(59, 130, 246, 0.7);
      border-radius: 8px;
      background-color: rgba(6, 8, 16, 0.85);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .payload-editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      background-color: rgba(13, 18, 34, 0.9);
      border-bottom: 1px solid rgba(59, 130, 246, 0.2);
      font-size: 11px;
      font-weight: 600;
      color: rgba(147, 197, 253, 0.9);
      user-select: none;
    }
    .payload-editor-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: var(--green);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .payload-editor-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: var(--green);
      border-radius: 50%;
      box-shadow: 0 0 6px var(--green-glow);
    }
    .payload-editor {
      width: 100%;
      background-color: transparent;
      border: none;
      color: #60a5fa;
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      padding: 12px;
      resize: vertical;
      outline: none;
      box-sizing: border-box;
      line-height: 1.5;
    }
    .payload-editor:focus {
      background-color: rgba(30, 41, 59, 0.2);
    }

    /* Premium Live Editable Query Parameters Grid */
    .query-params-container {
      margin: 8px 0 12px 0;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background-color: rgba(13, 18, 34, 0.4);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      max-width: 600px;
    }
    .query-params-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background-color: var(--panel-header);
      border-bottom: 1px solid var(--border-color);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      user-select: none;
    }
    .query-params-status {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 10px;
      color: var(--blue-light);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .query-params-status::before {
      content: '';
      display: inline-block;
      width: 6px;
      height: 6px;
      background-color: var(--blue-light);
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(96, 165, 250, 0.4);
    }
    .query-params-grid {
      padding: 8px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .query-param-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .query-param-key {
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      color: var(--orange);
      font-weight: 600;
      min-width: 120px;
      text-align: right;
      padding-right: 4px;
      word-break: break-all;
    }
    .query-param-equals {
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 700;
      user-select: none;
    }
    .query-param-value-input {
      flex: 1;
      background-color: rgba(30, 41, 59, 0.4);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-main);
      font-family: 'Fira Code', monospace;
      font-size: 12px;
      padding: 4px 8px;
      outline: none;
      transition: all 0.15s ease;
    }
    .query-param-value-input:focus {
      border-color: var(--blue);
      background-color: rgba(30, 41, 59, 0.7);
      box-shadow: 0 0 4px var(--blue-glow);
    }
  `;
}