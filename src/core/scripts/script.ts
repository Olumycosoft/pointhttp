declare global {
  interface Window {
    envVariables: Record<string, string>;
    executeRequest: (fileIndex: number, reqId: number) => Promise<void>;
    updateRequestPayload: (fileIndex: number, reqId: number, value: string) => void;
    updateQueryParam: (fileIndex: number, reqId: number, paramIndex: number, value: string) => void;
    updateEnvVariable: (key: string, val: string) => void;
    toggleVariablesPanel: () => void;
    toggleSection: (index: number) => void;
    handleSearch: (query: string) => void;
    toggleJsonNode: (element: HTMLElement) => void;
    expandAllJson: () => void;
    collapseAllJson: () => void;
    switchResponseTab: (tab: 'pretty' | 'raw') => void;
    copyResponseText: () => void;
    copyCurlCommand: () => void;
    downloadResponseText: () => void;
    saveResponseSnapshot: () => Promise<void>;
    loadResponseSnapshot: (id: string) => void;
    deleteResponseSnapshot: (event: Event, id: string) => Promise<void>;
    copyContent: (textareaId: string, button: HTMLButtonElement) => void;
    switchSidebarTab: (tabId: 'docs' | 'snapshots') => void;
    toggleDrawer: (isOpen: boolean) => void;
    setNavigationMode: (mode: 'single' | 'scroll') => void;
    getSingleFileMode: () => boolean;
    initNavigationMode: () => void;
    updateDocVisibility: () => void;
  }
}

let defaultEnvVars: Record<string, string> = {};
let storageNamespace = '';

export function getStorageKey(baseKey: string): string {
  if (storageNamespace) {
    return `${baseKey}_${storageNamespace}`;
  }
  return baseKey;
}

export function safeGetStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(getStorageKey(key));
  } catch (e) {
    console.error('Failed to get item from localStorage:', e);
    return null;
  }
}

export function safeSetStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(getStorageKey(key), value);
  } catch (e) {
    console.error('Failed to set item in localStorage:', e);
    if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      alert('PointHTTP Storage Warning: Browser local storage quota exceeded. Consider clearing some saved snapshots.');
    }
  }
}

const parsedFiles: Record<number, any> = {};
let lastExecutedRequestDetail: any = null;
let lastResponseRawText = '';
let lastResponseStatusText = '';
let lastResponseLatency = '';
let lastResponseRequestTitle = '';
let lastResponseRequestMethod = '';
let lastResponseRequestUrl = '';
let lastResponseContentType = '';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function initEnvironmentVariables() {
  const stored = safeGetStorageItem('pointhttp_env_vars');
  let parsedStored = {};
  if (stored) {
    try {
      parsedStored = JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load stored environment variables', e);
    }
  }
  window.envVariables = Object.assign({}, defaultEnvVars, parsedStored);
}

export function saveEnvironmentVariables() {
  safeSetStorageItem('pointhttp_env_vars', JSON.stringify(window.envVariables));
}

export function parseRESTClientFile(text: string) {
  const lines = text.split('\n');
  const fileVars: Record<string, string> = {};

  lines.forEach(line => {
    if (line.trim().startsWith('@')) {
      const parts = line.trim().substring(1).split('=');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        fileVars[name] = val;
      }
    }
  });

  const blocks = text.split('###');
  const requests: any[] = [];

  blocks.forEach((block, blockIdx) => {
    const blockLines = block.split('\n');
    let requestLineIdx = -1;
    let method = '';
    let url = '';
    let commentedParams: any[] = [];

    let separatorTitle = '';
    if (blockIdx > 0 && blockLines.length > 0) {
      const firstLine = blockLines[0].trim();
      if (firstLine && !firstLine.startsWith('@') && !firstLine.startsWith('#') && !firstLine.startsWith('//') && !firstLine.match(/^(GET|POST|PUT|DELETE|PATCH)\s+/)) {
        separatorTitle = firstLine;
      }
    }

    for (let i = 0; i < blockLines.length; i++) {
      const match = blockLines[i].trim().match(/^(GET|POST|PUT|DELETE|PATCH)\s+(.*)$/);
      if (match) {
        requestLineIdx = i;
        method = match[1];
        let urlParts = [match[2]];

        let j = i + 1;
        for (; j < blockLines.length; j++) {
          const nextLine = blockLines[j].trim();
          if (nextLine === '') break;
          if (nextLine.includes(':') && !nextLine.startsWith('{') && !nextLine.startsWith('#') && !nextLine.startsWith('//')) {
            break;
          }

          if (nextLine.startsWith('?') || nextLine.startsWith('&')) {
            urlParts.push(nextLine);
          } else if (nextLine.startsWith('#') || nextLine.startsWith('//')) {
            const cleanComment = nextLine.replace(/^[#\/]+/, '').trim();
            if (cleanComment.startsWith('&') || cleanComment.includes('=')) {
              const paramPart = cleanComment.startsWith('&') ? cleanComment.substring(1).trim() : cleanComment;
              const eqIdx = paramPart.indexOf('=');
              if (eqIdx !== -1) {
                const k = paramPart.substring(0, eqIdx).trim();
                commentedParams.push({ key: k, value: '' });
              } else if (paramPart) {
                commentedParams.push({ key: paramPart.trim(), value: '' });
              }
            }
          } else {
            break;
          }
        }
        url = urlParts.join('').trim();
        break;
      }
    }

    if (requestLineIdx === -1) return;

    const headers: Record<string, string> = {};
    let bodyIdx = -1;
    for (let i = requestLineIdx + 1; i < blockLines.length; i++) {
      const line = blockLines[i].trim();
      if (line === '') {
        bodyIdx = i + 1;
        break;
      }
      if (line.includes(':') && !line.startsWith('{')) {
        const colonIdx = line.indexOf(':');
        const key = line.substring(0, colonIdx).trim();
        const val = line.substring(colonIdx + 1).trim();
        headers[key] = val;
      }
    }

    let body = '';
    if (bodyIdx !== -1 && bodyIdx < blockLines.length) {
      body = blockLines.slice(bodyIdx).join('\n').trim();
    }

    let title = separatorTitle;
    let rawComments: string[] = [];
    for (let i = 0; i < requestLineIdx; i++) {
      const line = blockLines[i].trim();
      if (i === 0 && separatorTitle) continue;
      if (line.startsWith('#')) {
        rawComments.push(blockLines[i]);
        const clean = line.replace(/^[#\s]+/, '').trim();
        if (!title && clean && !clean.toLowerCase().includes('use rest') && !clean.toLowerCase().includes('api documentation')) {
          title = clean;
        }
      }
    }
    if (!title) title = method + ' ' + url.split('?')[0];

    let basePath = url;
    let queryParams: any[] = [];
    if (url.includes('?')) {
      const parts = url.split('?');
      basePath = parts[0];
      const queryStr = parts.slice(1).join('?');
      if (queryStr) {
        queryStr.split('&').forEach(pair => {
          if (pair) {
            const eqIdx = pair.indexOf('=');
            if (eqIdx !== -1) {
              const k = pair.substring(0, eqIdx);
              const v = pair.substring(eqIdx + 1);
              queryParams.push({ key: k, value: v });
            } else {
              queryParams.push({ key: pair, value: '' });
            }
          }
        });
      }
    }

    const seenKeys = new Set(queryParams.map(q => q.key));
    commentedParams.forEach(p => {
      if (!seenKeys.has(p.key)) {
        queryParams.push(p);
        seenKeys.add(p.key);
      }
    });

    requests.push({ title, rawComments, method, url, basePath, queryParams, headers, body });
  });

  return { variables: fileVars, requests };
}

export function resolveVariables(str: string, vars: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return vars[varName] !== undefined ? vars[varName] : match;
  });
}

export function renderRESTClient(index: number, rawText: string) {
  const parsed = parseRESTClientFile(rawText);
  parsed.requests.forEach((req: any) => reconstructRequestUrl(req));
  parsedFiles[index] = parsed;

  Object.entries(parsed.variables).forEach(([k, v]) => {
    if (window.envVariables[k] === undefined) {
      window.envVariables[k] = v as string;
    }
  });

  const lines = rawText.split('\n');
  let requestCounter = 0;
  const displayLines: string[] = [];
  let currentReqId = -1;
  let inBody = false;
  let bodyLines: string[] = [];
  let seenBlankLine = false;
  let inUrlBlock = false;
  let queryParamsPendingHtml = '';
  let inRequestCard = false;

  const commentsToSkip = new Set<string>();
  parsed.requests.forEach((req: any) => {
    if (req.rawComments) {
      req.rawComments.forEach((c: string) => commentsToSkip.add(c.trim()));
    }
  });

  function closeRequestCardIfNeeded() {
    flushBodyTextarea();
    if (inRequestCard) {
      displayLines.push('</div></div>');
      inRequestCard = false;
    }
  }

  function flushQueryParamsGrid() {
    if (queryParamsPendingHtml) {
      displayLines.push(queryParamsPendingHtml);
      queryParamsPendingHtml = '';
    }
  }

  function flushBodyTextarea() {
    flushQueryParamsGrid();
    if (inBody && currentReqId !== -1) {
      const bodyText = bodyLines.join('\n').trim();
      if (bodyText) {
        const escapedBodyText = bodyText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        const rows = Math.max(3, Math.min(15, bodyLines.length));
        displayLines.push(`<div class="payload-editor-container" onclick="event.stopPropagation()"><div class="payload-editor-header"><span>Request Body (JSON)</span><span class="payload-editor-status">Editable</span></div><textarea class="payload-editor" id="payload-${index}-${currentReqId}" oninput="window.updateRequestPayload(${index}, ${currentReqId}, this.value)" rows="${rows}" spellcheck="false" autocapitalize="off" autocorrect="off">${escapedBodyText}</textarea></div>`);
      }
      inBody = false;
      bodyLines = [];
    }
  }

  lines.forEach(line => {
    const trimmed = line.trim();

    if (inUrlBlock) {
      if (trimmed === '' || (trimmed.includes(': ') && !trimmed.startsWith('{') && !trimmed.includes('"'))) {
        inUrlBlock = false;
      } else {
        if (trimmed.startsWith('?') || trimmed.startsWith('&')) return;
        if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
          const clean = trimmed.replace(/^[#\/]+/, '').trim();
          if (clean.startsWith('&') || clean.includes('=')) return;
        }
      }
    }

    if (trimmed.startsWith('###')) {
      closeRequestCardIfNeeded();
      currentReqId = -1;
      inUrlBlock = false;
      return;
    }
    if (trimmed.startsWith('#')) {
      if (commentsToSkip.has(trimmed)) return;
      displayLines.push(`<span class="token-comment">${escapeHtml(line)}</span>`);
      return;
    }
    if (trimmed.startsWith('@')) {
      displayLines.push(`<span class="token-variable">${escapeHtml(line)}</span>`);
      return;
    }

    const match = line.match(/^(\s*)(GET|POST|PUT|DELETE|PATCH)(\s+)(.*)$/);
    if (match) {
      closeRequestCardIfNeeded();
      const [_, spaces, method, spaces2, url] = match;
      const reqId = requestCounter++;
      currentReqId = reqId;
      seenBlankLine = false;
      inBody = false;
      bodyLines = [];
      inUrlBlock = true;

      const lowerMethod = method.toLowerCase();
      const req = parsed.requests[reqId];
      let queryParamsHtml = '';
      if (req && req.queryParams && req.queryParams.length > 0) {
        let rowsHtml = '';
        req.queryParams.forEach((param: any, paramIdx: number) => {
          const escapedVal = escapeHtml(param.value);
          const escapedKey = escapeHtml(param.key);
          rowsHtml += `<div class="query-param-row"><span class="query-param-key">${escapedKey}</span><span class="query-param-equals">=</span><input type="text" class="query-param-value-input" value="${escapedVal}" oninput="window.updateQueryParam(${index}, ${reqId}, ${paramIdx}, this.value)" spellcheck="false" autocapitalize="off" autocorrect="off"></div>`;
        });

        queryParamsHtml = `<div class="query-params-container" onclick="event.stopPropagation()"><div class="query-params-header"><span>Query Parameters</span><span class="query-params-status">Live Sync</span></div><div class="query-params-grid">${rowsHtml}</div></div>`;
      }

      queryParamsPendingHtml = queryParamsHtml;

      let commentsHtml = '';
      if (req && req.rawComments && req.rawComments.length > 0) {
        const cleanComments = req.rawComments
          .map((rc: string) => rc.trim().replace(/^[#\s]+/, '').trim())
          .filter((c: string) => c !== req.title && c.length > 0);
        if (cleanComments.length > 0) {
          commentsHtml = `<div class="http-request-card-comments">${cleanComments.map((c: string) => `<div># ${c}</div>`).join('')}</div>`;
        }
      }

      inRequestCard = true;
      const actionBar = `${spaces}<span class="link-send-request" onclick="window.executeRequest(${index}, ${reqId})"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Send Request</span>`;
      const methodUrlLine = `${spaces}<span class="token-method token-${lowerMethod}">${method}</span>${spaces2}<span id="url-text-${index}-${reqId}" style="color: #cbd5e1;">${escapeHtml(req.url)}</span>`;
      displayLines.push(`<div class="http-request-card"><div class="http-request-card-header"><span class="http-request-card-title">${escapeHtml(req.title)}</span></div><div class="http-request-card-body">${commentsHtml}`);
      displayLines.push(actionBar);
      displayLines.push(methodUrlLine);
      return;
    }

    if (trimmed.includes(': ') && !trimmed.startsWith('{') && !trimmed.includes('"')) {
      const [key, ...valParts] = line.split(': ');
      const val = valParts.join(': ');
      displayLines.push(`<span class="token-header-key">${escapeHtml(key)}:</span> <span class="token-header-val">${escapeHtml(val)}</span>`);
      return;
    }

    if (currentReqId !== -1 && !seenBlankLine && trimmed === '') {
      seenBlankLine = true;
      flushQueryParamsGrid();

      const req = parsed.requests[currentReqId];
      const hasBody = req && req.body && req.body.trim().length > 0;
      if (hasBody) {
        inBody = true;
        return;
      }
    }

    if (inBody) {
      bodyLines.push(line);
    } else {
      displayLines.push(line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
    }
  });

  closeRequestCardIfNeeded();
  const displayElement = document.getElementById('display-' + index);
  if (displayElement) displayElement.innerHTML = displayLines.join('\n');
}

export function renderVariablesEditor() {
  const editor = document.getElementById('variables-editor');
  if (!editor) return;
  editor.innerHTML = '';

  Object.entries(window.envVariables).forEach(([key, value]) => {
    const field = document.createElement('div');
    field.className = 'var-field';
    field.innerHTML = `
      <label class="var-label">{{${escapeHtml(key)}}}</label>
      <input type="text" class="var-input" value="${escapeHtml(value)}" oninput="window.updateEnvVariable('${escapeHtml(key)}', this.value)" spellcheck="false" autocapitalize="off" autocorrect="off">
    `;
    editor.appendChild(field);
  });
}

export function updateEnvVariable(key: string, val: string) {
  window.envVariables[key] = val;
  saveEnvironmentVariables();
}

export function updateRequestPayload(fileIndex: number, reqId: number, value: string) {
  if (parsedFiles[fileIndex] && parsedFiles[fileIndex].requests[reqId]) {
    parsedFiles[fileIndex].requests[reqId].body = value;
  }
}

export function updateQueryParam(fileIndex: number, reqId: number, paramIndex: number, value: string) {
  if (parsedFiles[fileIndex] && parsedFiles[fileIndex].requests[reqId]) {
    const req = parsedFiles[fileIndex].requests[reqId];
    if (req.queryParams && req.queryParams[paramIndex]) {
      req.queryParams[paramIndex].value = value;
      reconstructRequestUrl(req);

      const urlSpan = document.getElementById(`url-text-${fileIndex}-${reqId}`);
      if (urlSpan) {
        urlSpan.innerText = req.url;
      }
    }
  }
}

export function reconstructRequestUrl(req: any) {
  if (!req.queryParams || req.queryParams.length === 0) {
    req.url = req.basePath;
    return;
  }
  const activeParams = req.queryParams.filter((p: any) => p.key.trim() !== '' && p.value.trim() !== '');
  if (activeParams.length === 0) {
    req.url = req.basePath;
    return;
  }
  const queryStr = activeParams.map((p: any) => `${p.key}=${p.value}`).join('&');
  req.url = req.basePath + '?' + queryStr;
}

export function toggleVariablesPanel() {
  const editor = document.getElementById('variables-editor');
  const text = document.getElementById('vars-toggle-text');
  if (!editor || !text) return;

  if (editor.style.display === 'none') {
    editor.style.display = 'grid';
    text.innerHTML = 'Hide Variables <svg class="vars-arrow rotated" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  } else {
    editor.style.display = 'none';
    text.innerHTML = 'Show Variables <svg class="vars-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  }
}

export function toggleDrawer(isOpen: boolean) {
  const drawer = document.getElementById('response-drawer');
  const content = document.getElementById('main-content');
  if (!drawer || !content) return;

  if (isOpen) {
    drawer.classList.add('open');
    content.style.marginRight = '520px';
  } else {
    drawer.classList.remove('open');
    content.style.marginRight = '0';
  }
}

export function toggleSection(index: number) {
  const body = document.getElementById('body-' + index);
  const chevron = document.getElementById('chevron-' + index);
  if (body) body.classList.toggle('collapsed');
  if (chevron) chevron.classList.toggle('collapsed');
}

export function getSingleFileMode(): boolean {
  const mode = safeGetStorageItem('pointhttp_nav_mode');
  return mode === 'single';
}

export function setNavigationMode(mode: 'single' | 'scroll') {
  safeSetStorageItem('pointhttp_nav_mode', mode);
  
  const control = document.querySelector('.segmented-control');
  const btnSingle = document.getElementById('btn-mode-single');
  const btnScroll = document.getElementById('btn-mode-scroll');
  
  if (control && btnSingle && btnScroll) {
    if (mode === 'single') {
      control.classList.remove('scroll-mode');
      btnSingle.classList.add('active');
      btnScroll.classList.remove('active');
    } else {
      control.classList.add('scroll-mode');
      btnSingle.classList.remove('active');
      btnScroll.classList.add('active');
    }
  }

  updateDocVisibility();
  
  if (mode === 'single') {
    window.scrollTo({ top: 0 });
  }
}

export function initNavigationMode() {
  const isSingle = getSingleFileMode();
  setNavigationMode(isSingle ? 'single' : 'scroll');
}

export function updateDocVisibility() {
  const isSingle = getSingleFileMode();
  const hash = window.location.hash || '';
  let activeId = hash.replace('#', '');
  
  const queryInput = document.getElementById('search-docs') as HTMLInputElement;
  const cleanQuery = queryInput ? queryInput.value.toLowerCase().trim() : '';

  const docSections = document.querySelectorAll('.doc-section');
  
  // Find first visible ID that matches search query as potential fallback
  if (cleanQuery || !activeId) {
    let firstVisibleId = '';
    for (let i = 0; i < docSections.length; i++) {
      const sec = docSections[i] as HTMLElement;
      const filepath = (sec.getAttribute('data-filepath') || '').toLowerCase();
      if (!cleanQuery || filepath.includes(cleanQuery)) {
        if (!firstVisibleId) firstVisibleId = sec.id;
        if (sec.id === activeId) {
          break;
        }
      }
    }
    // If active ID is not valid/matching or is empty, use the first visible one
    if (!activeId || !Array.from(docSections).some(s => s.id === activeId && (!cleanQuery || (s.getAttribute('data-filepath') || '').includes(cleanQuery)))) {
      activeId = firstVisibleId;
    }
  }

  docSections.forEach(sec => {
    const filepath = (sec.getAttribute('data-filepath') || '').toLowerCase();
    const isMatchedBySearch = !cleanQuery || filepath.includes(cleanQuery);
    
    if (isSingle) {
      if (sec.id === activeId) {
        (sec as HTMLElement).style.display = 'block';
      } else {
        (sec as HTMLElement).style.display = 'none';
      }
    } else {
      (sec as HTMLElement).style.display = isMatchedBySearch ? 'block' : 'none';
    }
  });

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const href = item.getAttribute('href') || '';
    const filepath = (item.getAttribute('data-filepath') || '').toLowerCase();
    const isMatchedBySearch = !cleanQuery || filepath.includes(cleanQuery);
    
    (item as HTMLElement).style.display = isMatchedBySearch ? 'flex' : 'none';
    item.classList.toggle('active', href === '#' + activeId);
  });
}

export function handleSearch(query: string) {
  updateDocVisibility();
}

export function jsonToHtml(value: any, key: string | null = null, isLast = true): string {
  const typeofValue = typeof value;
  let html = '';

  if (value === null) {
    html += `<span class="json-row"><span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span><span class="json-value json-null">null</span>${isLast ? '' : ','}</span>`;
  } else if (typeofValue === 'number') {
    html += `<span class="json-row"><span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span><span class="json-value json-number">${value}</span>${isLast ? '' : ','}</span>`;
  } else if (typeofValue === 'boolean') {
    html += `<span class="json-row"><span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span><span class="json-value json-boolean">${value}</span>${isLast ? '' : ','}</span>`;
  } else if (typeofValue === 'string') {
    const escapedStr = escapeHtml(value);
    html += `<span class="json-row"><span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span><span class="json-value json-string">"${escapedStr}"</span>${isLast ? '' : ','}</span>`;
  } else if (typeofValue === 'undefined') {
    html += `<span class="json-row"><span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span><span class="json-value json-null">undefined</span>${isLast ? '' : ','}</span>`;
  } else if (Array.isArray(value)) {
    const isEmpty = value.length === 0;
    const size = value.length;

    html += `<div class="json-group json-collapsible expanded">`;
    html += `  <div class="json-row json-header" onclick="window.toggleJsonNode(this)">`;
    html += `    <span class="json-toggle-icon"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>`;
    html += `    <span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span>`;
    html += `    <span class="json-bracket">[</span>`;
    html += `    <span class="json-preview">${isEmpty ? '' : `/* ${size} items */`}</span>`;
    html += `    <span class="json-collapsed-text">... ]${isLast ? '' : ','}</span>`;
    html += `  </div>`;

    if (!isEmpty) {
      html += `  <div class="json-children">`;
      value.forEach((item, index) => {
        const itemIsLast = index === value.length - 1;
        html += jsonToHtml(item, null, itemIsLast);
      });
      html += `  </div>`;
    }

    html += `  <div class="json-row json-footer" onclick="window.toggleJsonNode(this)">`;
    html += `    <span class="json-bracket">]</span>${isLast ? '' : ','}`;
    html += `  </div>`;
    html += `</div>`;
  } else if (typeofValue === 'object') {
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;
    const size = keys.length;

    html += `<div class="json-group json-collapsible expanded">`;
    html += `  <div class="json-row json-header" onclick="window.toggleJsonNode(this)">`;
    html += `    <span class="json-toggle-icon"><svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>`;
    html += `    <span class="json-key-container">${key ? `<span class="json-key">"${escapeHtml(key)}"</span>: ` : ''}</span>`;
    html += `    <span class="json-bracket">{</span>`;
    html += `    <span class="json-preview">${isEmpty ? '' : `/* ${size} keys */`}</span>`;
    html += `    <span class="json-collapsed-text">... }${isLast ? '' : ','}</span>`;
    html += `  </div>`;

    if (!isEmpty) {
      html += `  <div class="json-children">`;
      keys.forEach((k, index) => {
        const itemIsLast = index === keys.length - 1;
        html += jsonToHtml(value[k], k, itemIsLast);
      });
      html += `  </div>`;
    }

    html += `  <div class="json-row json-footer" onclick="window.toggleJsonNode(this)">`;
    html += `    <span class="json-bracket">}</span>${isLast ? '' : ','}`;
    html += `  </div>`;
    html += `</div>`;
  }

  return html;
}

export function toggleJsonNode(element: HTMLElement) {
  const group = element.closest('.json-group');
  if (!group) return;
  if (group.classList.contains('expanded')) {
    group.classList.remove('expanded');
    group.classList.add('collapsed');
  } else {
    group.classList.remove('collapsed');
    group.classList.add('expanded');
  }
}

export function expandAllJson() {
  const groups = document.querySelectorAll('#res-pretty-content .json-group');
  groups.forEach(group => {
    group.classList.remove('collapsed');
    group.classList.add('expanded');
  });
}

export function collapseAllJson() {
  const groups = document.querySelectorAll('#res-pretty-content .json-group');
  groups.forEach(group => {
    if (group !== document.querySelector('#res-pretty-content > .json-group')) {
      group.classList.remove('expanded');
      group.classList.add('collapsed');
    }
  });
}

export function switchResponseTab(tab: 'pretty' | 'raw') {
  const tabs = document.querySelectorAll('.response-tab');
  if (tabs.length < 2) return;
  const prettyTab = tabs[0];
  const rawTab = tabs[1];
  const prettyWrapper = document.getElementById('res-pretty-wrapper');
  const rawWrapper = document.getElementById('res-body-wrapper');
  const prettyControls = document.getElementById('pretty-view-controls');

  if (!prettyWrapper || !rawWrapper) return;

  if (tab === 'pretty') {
    prettyTab.classList.add('active');
    rawTab.classList.remove('active');
    prettyWrapper.style.display = 'block';
    rawWrapper.style.display = 'none';
    if (prettyControls) prettyControls.style.display = 'flex';
  } else {
    prettyTab.classList.remove('active');
    rawTab.classList.add('active');
    prettyWrapper.style.display = 'none';
    rawWrapper.style.display = 'block';
    if (prettyControls) prettyControls.style.display = 'none';
  }
}

export async function executeRequest(fileIndex: number, reqId: number) {
  const request = parsedFiles[fileIndex].requests[reqId];
  if (!request) return;

  lastResponseRawText = '';
  lastResponseStatusText = '';
  lastResponseLatency = '';
  lastResponseRequestTitle = request.title;
  lastResponseRequestMethod = request.method;
  lastResponseRequestUrl = '';
  lastResponseContentType = '';

  const drawerReqTitle = document.getElementById('drawer-req-title');
  const statusBadge = document.getElementById('res-status');
  const resLatency = document.getElementById('res-latency');
  const resLoader = document.getElementById('res-loader');
  const resBodyWrapper = document.getElementById('res-body-wrapper');
  const resTabsBar = document.getElementById('res-tabs-bar');
  const resPrettyWrapper = document.getElementById('res-pretty-wrapper');

  if (drawerReqTitle) drawerReqTitle.innerText = request.title;
  if (statusBadge) {
    statusBadge.className = 'status-badge status-pending';
    statusBadge.innerText = 'EXECUTING';
  }
  if (resLatency) resLatency.innerText = '-- ms';
  if (resLoader) resLoader.style.display = 'flex';
  if (resBodyWrapper) resBodyWrapper.style.display = 'none';
  if (resTabsBar) resTabsBar.style.display = 'none';
  if (resPrettyWrapper) resPrettyWrapper.style.display = 'none';

  toggleDrawer(true);

  const vars = window.envVariables;
  const resolvedUrl = resolveVariables(request.url, vars);
  lastResponseRequestUrl = resolvedUrl;

  const resolvedHeaders: Record<string, string> = {};
  Object.entries(request.headers).forEach(([k, v]) => {
    resolvedHeaders[k] = resolveVariables(v as string, vars);
  });

  if (request.body && !resolvedHeaders['Content-Type'] && !resolvedHeaders['content-type']) {
    resolvedHeaders['Content-Type'] = 'application/json';
  }

  let resolvedBody = null;
  if (request.body && request.method !== 'GET') {
    resolvedBody = resolveVariables(request.body, vars);
  }

  lastExecutedRequestDetail = {
    method: request.method,
    url: resolvedUrl,
    headers: resolvedHeaders,
    body: resolvedBody
  };

  const startTime = performance.now();

  try {
    const response = await fetch(resolvedUrl, {
      method: request.method,
      headers: resolvedHeaders,
      body: resolvedBody
    });

    const duration = Math.round(performance.now() - startTime);
    if (resLatency) resLatency.innerText = duration + ' ms';
    lastResponseLatency = duration + ' ms';

    const statusText = response.status + ' ' + response.statusText;
    if (statusBadge) {
      statusBadge.innerText = statusText;
      statusBadge.className = response.ok ? 'status-badge status-success' : 'status-badge status-error';
    }
    lastResponseStatusText = statusText;

    const cType = response.headers.get('content-type') || '';
    lastResponseContentType = cType;

    let rawBody = '';
    let isJson = false;
    let jsonParsed = null;

    if (cType.includes('application/json')) {
      try {
        jsonParsed = await response.json();
        rawBody = JSON.stringify(jsonParsed, null, 2);
        isJson = true;
      } catch (e) {
        rawBody = await response.text();
      }
    } else {
      rawBody = await response.text();
    }

    lastResponseRawText = rawBody;
    const resBodyContent = document.getElementById('res-body-content');
    if (resBodyContent) resBodyContent.innerText = rawBody || '// Empty Response';
    if (resLoader) resLoader.style.display = 'none';

    const tabsBar = document.getElementById('res-tabs-bar');
    const prettyWrapper = document.getElementById('res-pretty-wrapper');
    const rawWrapper = document.getElementById('res-body-wrapper');
    const resPrettyContent = document.getElementById('res-pretty-content');

    if (isJson && resPrettyContent) {
      resPrettyContent.innerHTML = jsonToHtml(jsonParsed);
      if (tabsBar) tabsBar.style.display = 'flex';
      switchResponseTab('pretty');
    } else {
      if (tabsBar) tabsBar.style.display = 'none';
      if (prettyWrapper) prettyWrapper.style.display = 'none';
      if (rawWrapper) rawWrapper.style.display = 'block';
    }

  } catch (error: any) {
    const duration = Math.round(performance.now() - startTime);
    if (resLatency) resLatency.innerText = duration + ' ms';
    lastResponseLatency = duration + ' ms';

    if (statusBadge) {
      statusBadge.innerText = 'FAILED';
      statusBadge.className = 'status-badge status-error';
    }
    lastResponseStatusText = 'FAILED';
    lastResponseContentType = 'text/plain';

    const tabsBar = document.getElementById('res-tabs-bar');
    const prettyWrapper = document.getElementById('res-pretty-wrapper');
    if (tabsBar) tabsBar.style.display = 'none';
    if (prettyWrapper) prettyWrapper.style.display = 'none';

    lastResponseRawText = error.message;
    const resBodyContent = document.getElementById('res-body-content');
    if (resBodyContent) {
      resBodyContent.innerText = `Error dispatching request:\n${error.message}\n\nPlease verify that the local server is running and CORS is enabled.`;
    }
    if (resLoader) resLoader.style.display = 'none';
    if (resBodyWrapper) resBodyWrapper.style.display = 'block';
  }
}

export function copyResponseText() {
  navigator.clipboard.writeText(lastResponseRawText).then(() => {
    const btn = document.getElementById('btn-copy-response');
    if (!btn) return;
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Copied!';
    btn.style.backgroundColor = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1500);
  });
}

export function copyCurlCommand() {
  if (!lastExecutedRequestDetail) return;
  const req = lastExecutedRequestDetail;
  let curl = `curl -X ${req.method} "${req.url}"`;

  Object.entries(req.headers).forEach(([k, v]) => {
    curl += ` \n  -H "${k}: ${v}"`;
  });

  if (req.body) {
    const escapedBody = req.body.replace(/"/g, '\\"');
    curl += ` \n  -d "${escapedBody}"`;
  }

  navigator.clipboard.writeText(curl).then(() => {
    const btn = document.getElementById('btn-copy-curl');
    if (!btn) return;
    btn.innerHTML = 'Copied cURL!';
    btn.style.backgroundColor = 'var(--blue)';
    btn.style.borderColor = 'var(--blue)';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.innerHTML = 'cURL';
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1500);
  });
}

export function downloadResponseText() {
  if (!lastResponseRawText) {
    alert('No response available to download.');
    return;
  }

  let extension = 'json';
  let type = 'application/json';

  if (lastResponseContentType.includes('text/html')) {
    extension = 'html';
    type = 'text/html';
  } else if (lastResponseContentType.includes('text/plain')) {
    extension = 'txt';
    type = 'text/plain';
  }

  const blob = new Blob([lastResponseRawText], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;

  const safeTitle = (lastResponseRequestTitle || 'api_response')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_');

  a.download = `response_${safeTitle}_${new Date().toISOString().slice(0, 10)}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const btn = document.getElementById('btn-download-response');
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Downloaded!`;
    btn.style.backgroundColor = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1500);
  }
}

export async function saveResponseSnapshot() {
  if (!lastResponseRawText) {
    alert('No response available to save.');
    return;
  }

  const defaultName = `${lastResponseRequestTitle} - ${lastResponseStatusText}`;
  const name = await showCustomModal({
    title: 'Save Snapshot',
    message: 'Enter a custom name for this snapshot:',
    isPrompt: true,
    defaultValue: defaultName,
    confirmText: 'Save',
    cancelText: 'Cancel'
  });
  if (name === null) return;

  const sanitizedName = (name as string).trim() || defaultName;

  const newSnapshot = {
    id: 'snap_' + Date.now(),
    name: sanitizedName,
    timestamp: new Date().toISOString(),
    requestTitle: lastResponseRequestTitle,
    requestMethod: lastResponseRequestMethod,
    requestUrl: lastResponseRequestUrl,
    statusText: lastResponseStatusText,
    latency: lastResponseLatency,
    body: lastResponseRawText,
    contentType: lastResponseContentType
  };

  let snapshots = [];
  const stored = safeGetStorageItem('pointhttp_saved_snapshots');
  if (stored) {
    try {
      snapshots = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  snapshots.unshift(newSnapshot);
  safeSetStorageItem('pointhttp_saved_snapshots', JSON.stringify(snapshots));

  renderSavedSnapshots();
  switchSidebarTab('snapshots');

  const btn = document.getElementById('btn-save-snapshot');
  if (btn) {
    const originalText = btn.innerHTML;
    btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Saved!`;
    btn.style.backgroundColor = 'var(--green)';
    btn.style.borderColor = 'var(--green)';
    btn.style.color = 'white';

    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.style.backgroundColor = '';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 1500);
  }
}

export function renderSavedSnapshots() {
  const container = document.getElementById('saved-snapshots-list');
  if (!container) return;

  let snapshots: any[] = [];
  const stored = safeGetStorageItem('pointhttp_saved_snapshots');
  if (stored) {
    try {
      snapshots = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  if (snapshots.length === 0) {
    container.innerHTML = '<div class="no-snapshots-msg">No saved snapshots yet</div>';
    return;
  }

  let html = '';
  snapshots.forEach(snap => {
    let methodClass = 'token-get';
    if (snap.requestMethod === 'POST') methodClass = 'token-post';
    if (snap.requestMethod === 'PUT') methodClass = 'token-put';
    if (snap.requestMethod === 'DELETE') methodClass = 'token-delete';
    if (snap.requestMethod === 'PATCH') methodClass = 'token-patch';

    const shortMethod = snap.requestMethod ? snap.requestMethod.slice(0, 4) : 'API';

    html += `
      <div class="snapshot-item" onclick="window.loadResponseSnapshot('${snap.id}')">
        <div class="snapshot-info">
          <div class="snapshot-name" title="${snap.name}">${snap.name}</div>
          <div class="snapshot-meta">
            <span class="snapshot-method ${methodClass}">${shortMethod}</span>
            <span class="snapshot-url" title="${snap.requestUrl || ''}">${snap.requestUrl || ''}</span>
          </div>
        </div>
        <button class="snapshot-delete-btn" title="Delete snapshot" onclick="window.deleteResponseSnapshot(event, '${snap.id}')">
          ✕
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
}

export function loadResponseSnapshot(id: string) {
  let snapshots: any[] = [];
  const stored = safeGetStorageItem('pointhttp_saved_snapshots');
  if (stored) {
    try {
      snapshots = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  const snap = snapshots.find(s => s.id === id);
  if (!snap) return;

  lastResponseRawText = snap.body;
  lastResponseStatusText = snap.statusText;
  lastResponseLatency = snap.latency;
  lastResponseRequestTitle = snap.requestTitle;
  lastResponseRequestMethod = snap.requestMethod;
  lastResponseRequestUrl = snap.requestUrl;
  lastResponseContentType = snap.contentType || 'application/json';

  const titleElem = document.getElementById('drawer-req-title');
  if (titleElem) titleElem.innerText = snap.name + ' (Saved Snapshot)';

  const statusBadge = document.getElementById('res-status');
  if (statusBadge) {
    statusBadge.innerText = snap.statusText;
    if (snap.statusText.includes('200') || snap.statusText.includes('success')) {
      statusBadge.className = 'status-badge status-success';
    } else if (snap.statusText.includes('EXECUTING') || snap.statusText.includes('PENDING')) {
      statusBadge.className = 'status-badge status-pending';
    } else {
      statusBadge.className = 'status-badge status-error';
    }
  }

  const latencyElem = document.getElementById('res-latency');
  const contentElem = document.getElementById('res-body-content');
  const loaderElem = document.getElementById('res-loader');

  if (latencyElem) latencyElem.innerText = snap.latency;
  if (contentElem) contentElem.innerText = snap.body || '// Empty Response';
  if (loaderElem) loaderElem.style.display = 'none';

  const tabsBar = document.getElementById('res-tabs-bar');
  const prettyWrapper = document.getElementById('res-pretty-wrapper');
  const rawWrapper = document.getElementById('res-body-wrapper');
  const prettyContent = document.getElementById('res-pretty-content');

  let isJson = false;
  let jsonParsed = null;

  if (lastResponseContentType.includes('application/json')) {
    try {
      jsonParsed = JSON.parse(snap.body);
      isJson = true;
    } catch (e) { }
  }

  if (isJson && prettyContent) {
    prettyContent.innerHTML = jsonToHtml(jsonParsed);
    if (tabsBar) tabsBar.style.display = 'flex';
    switchResponseTab('pretty');
  } else {
    if (tabsBar) tabsBar.style.display = 'none';
    if (prettyWrapper) prettyWrapper.style.display = 'none';
    if (rawWrapper) rawWrapper.style.display = 'block';
  }

  toggleDrawer(true);
}

export async function deleteResponseSnapshot(event: Event, id: string) {
  event.stopPropagation();

  const confirmDelete = await showCustomModal({
    title: 'Delete Snapshot',
    message: 'Are you sure you want to permanently delete this snapshot?',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    isDanger: true
  });
  if (!confirmDelete) return;

  let snapshots: any[] = [];
  const stored = safeGetStorageItem('pointhttp_saved_snapshots');
  if (stored) {
    try {
      snapshots = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
  }

  snapshots = snapshots.filter(s => s.id !== id);
  safeSetStorageItem('pointhttp_saved_snapshots', JSON.stringify(snapshots));

  renderSavedSnapshots();
}

export function initDrawerResize() {
  const handle = document.getElementById('drawer-resize-handle');
  const drawer = document.getElementById('response-drawer');
  if (!handle || !drawer) return;

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;

  handle.addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startWidth = drawer.getBoundingClientRect().width;

    handle.classList.add('active-resize');
    drawer.classList.add('resizing');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const dx = e.clientX - startX;
    const newWidth = startWidth - dx;

    const minWidth = 380;
    const maxWidth = window.innerWidth * 0.9;

    if (newWidth >= minWidth && newWidth <= maxWidth) {
      drawer.style.width = newWidth + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;

    handle.classList.remove('active-resize');
    drawer.classList.remove('resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    safeSetStorageItem('pointhttp_drawer_width', drawer.style.width);
  });

  const savedWidth = safeGetStorageItem('pointhttp_drawer_width');
  if (savedWidth) {
    drawer.style.width = savedWidth;
  }
}

export function copyContent(textareaId: string, button: HTMLButtonElement) {
  const ta = document.getElementById(textareaId) as HTMLTextAreaElement;
  if (!ta) return;
  navigator.clipboard.writeText(ta.value).then(() => {
    const originalText = button.innerHTML;
    button.innerHTML = 'Copied!';
    button.style.backgroundColor = 'var(--green)';
    button.style.borderColor = 'var(--green)';
    button.style.color = 'white';

    setTimeout(() => {
      button.innerHTML = originalText;
      button.style.backgroundColor = '';
      button.style.borderColor = '';
      button.style.color = '';
    }, 1500);
  });
}

export function showCustomModal({ title, message, isPrompt, defaultValue, confirmText, cancelText, isDanger }: any) {
  return new Promise((resolve) => {
    const modal = document.getElementById('custom-modal');
    const mTitle = document.getElementById('modal-title');
    const mMessage = document.getElementById('modal-message');
    const mInput = document.getElementById('modal-input') as HTMLInputElement;
    const mConfirm = document.getElementById('modal-btn-confirm');
    const mCancel = document.getElementById('modal-btn-cancel');
    if (!modal || !mTitle || !mConfirm || !mCancel || !mInput || !mMessage) return;

    mTitle.innerText = title;
    mMessage.innerText = message || '';

    if (isPrompt) {
      mInput.style.display = 'block';
      mInput.value = defaultValue || '';
      setTimeout(() => {
        mInput.focus();
        mInput.select();
      }, 100);
    } else {
      mInput.style.display = 'none';
    }

    mConfirm.innerText = confirmText || 'OK';
    mCancel.innerText = cancelText || 'Cancel';

    if (isDanger) {
      mConfirm.className = 'btn-danger';
    } else {
      mConfirm.className = 'btn-primary';
    }

    modal.classList.add('active');

    function cleanup() {
      modal?.classList.remove('active');
      if (mConfirm) mConfirm.onclick = null;
      if (mCancel) mCancel.onclick = null;
      mInput.onkeydown = null;
      if (modal) modal.onclick = null;
    }

    mConfirm.onclick = () => {
      const value = isPrompt ? mInput.value : true;
      cleanup();
      resolve(value);
    };

    mCancel.onclick = () => {
      cleanup();
      resolve(null);
    };

    mInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        mConfirm.click();
      } else if (e.key === 'Escape') {
        mCancel.click();
      }
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        mCancel.click();
      }
    };
  });
}

// Sidebar Tab Controller
export function switchSidebarTab(tabId: 'docs' | 'snapshots') {
  const isDocs = tabId === 'docs';
  document.getElementById('tab-btn-docs')?.classList.toggle('active', isDocs);
  document.getElementById('tab-btn-snapshots')?.classList.toggle('active', !isDocs);
  document.getElementById('sidebar-tab-content-docs')?.classList.toggle('active', isDocs);
  document.getElementById('sidebar-tab-content-snapshots')?.classList.toggle('active', !isDocs);
}

// --- GLOBAL ATTACHMENT BOUNDARY ---
if (typeof window !== 'undefined') {
  Object.assign(window, {
    initEnvironmentVariables,
    saveEnvironmentVariables,
    renderRESTClient,
    updateEnvVariable,
    updateRequestPayload,
    updateQueryParam,
    toggleVariablesPanel,
    toggleDrawer,
    toggleSection,
    handleSearch,
    toggleJsonNode,
    expandAllJson,
    collapseAllJson,
    switchResponseTab,
    executeRequest,
    copyResponseText,
    copyCurlCommand,
    downloadResponseText,
    saveResponseSnapshot,
    renderSavedSnapshots,
    loadResponseSnapshot,
    deleteResponseSnapshot,
    copyContent,
    switchSidebarTab,
    bootstrapApplication,
    getSingleFileMode,
    setNavigationMode,
    initNavigationMode,
    updateDocVisibility
  });
}

// --- RUNTIME BOOTSTRAP ENTRY POINT ---
export function bootstrapApplication(incomingEnvVars: Record<string, string>, namespace?: string) {
  defaultEnvVars = incomingEnvVars;
  if (namespace) {
    storageNamespace = namespace;
  }
  initDrawerResize();
  initEnvironmentVariables();
  renderSavedSnapshots();

  document.querySelectorAll('textarea').forEach(ta => {
    const parts = ta.id.split('-');
    if (parts[0] === 'raw' && parts[1]) {
      renderRESTClient(parseInt(parts[1], 10), ta.value);
    }
  });

  renderVariablesEditor();
  
  // Initialize navigation mode (Single File vs Continuous Scroll)
  initNavigationMode();

  window.addEventListener('hashchange', () => {
    updateDocVisibility();
    if (getSingleFileMode()) {
      window.scrollTo({ top: 0 });
    }
  });

  document.addEventListener('click', (e) => {
    const navItem = (e.target as HTMLElement).closest('.nav-item');
    if (navItem) {
      const href = navItem.getAttribute('href');
      if (href && href.startsWith('#doc-')) {
        if (getSingleFileMode()) {
          const currentHash = window.location.hash || '';
          if (currentHash === href) {
            window.scrollTo({ top: 0 });
          }
        }
      }
    }
  });

  window.addEventListener('scroll', () => {
    if (getSingleFileMode()) return;
    
    let curr = "";
    document.querySelectorAll('.doc-section').forEach(sec => {
      if ((sec as HTMLElement).style.display !== 'none' && window.pageYOffset >= (sec as HTMLElement).offsetTop - 250) {
        curr = sec.getAttribute('id') || "";
      }
    });
    if (curr) {
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('href') === '#' + curr);
      });
    }
  });
}