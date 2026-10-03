/**
 * Obsidian LeetCode Workspace Plugin - Modern Minimal Edition
 * Fully interactive multi-tab system with native Obsidian note persistence.
 * Every tab corresponds to a Markdown note in the vault so all work is saved.
 */

let obsidian;
try {
  obsidian = require('obsidian');
} catch (e) {
  // Fallback for non-Obsidian environments
}

const VIEW_TYPE_LEETCODE = 'leetcode-workspace-view';
const WORKSPACE_FOLDER = 'LeetCode Workspace';

// Language tag map for Markdown code blocks
const LANG_MAP = {
  'Python 3': 'python',
  'Python': 'python',
  'C++ (clang 17)': 'cpp',
  'C++': 'cpp',
  'Java 21': 'java',
  'Java': 'java',
  'JavaScript': 'javascript',
  'TypeScript (Node 20)': 'typescript',
  'TypeScript': 'typescript',
  'Rust 1.75': 'rust',
  'Rust': 'rust',
  'Go': 'go'
};

// Pre-configured AI models available for direct selection
const AI_PRESETS = {
  'gemini-3.8-flash': {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Google Latest)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.8-flash'
  },
  'gemini-3.5-flash': {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.5-flash'
  },
  'gemini-3.5-pro': {
    id: 'gemini-3.5-pro',
    name: 'Gemini 3.5 Pro (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.5-pro'
  },
  'gemini-3.1-pro': {
    id: 'gemini-3.1-pro',
    name: 'Gemini 3.1 Pro (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.1-pro'
  },
  'gemini-3.1-flash': {
    id: 'gemini-3.1-flash',
    name: 'Gemini 3.1 Flash (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.1-flash'
  },
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.5-flash'
  },
  'gemini-2.0-flash-thinking': {
    id: 'gemini-2.0-flash-thinking',
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash-thinking-exp'
  },
  'gemini-2.0-flash': {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash'
  },
  'gemini-2.0-pro': {
    id: 'gemini-2.0-pro',
    name: 'Gemini 2.0 Pro (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-pro-exp-02-05'
  },
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-1.5-flash'
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (Google)',
    provider: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-1.5-pro'
  },
  'gpt-4o-mini': {
    id: 'gpt-4o-mini',
    name: 'ChatGPT (GPT-4o mini)',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'ChatGPT (GPT-4o)',
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o'
  },
  'claude-3-5-sonnet': {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    model: 'anthropic/claude-3.5-sonnet'
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  'groq-llama3': {
    id: 'groq-llama3',
    name: 'Groq (Llama 3.3 70B)',
    provider: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile'
  },
  'ollama-local': {
    id: 'ollama-local',
    name: 'Local Ollama (localhost)',
    provider: 'ollama',
    baseUrl: 'http://localhost:11434/v1',
    model: 'llama3'
  },
  'custom': {
    id: 'custom',
    name: 'Custom Provider / Local',
    provider: 'custom',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini'
  }
};

// Default AI settings for Custom API
const DEFAULT_SETTINGS = {
  apiKey: '',
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  model: 'gemini-3.8-flash'
};

function getActiveApiKey(settings) {
  if (!settings) return '';
  return (settings.apiKey || settings.geminiApiKey || settings.openaiApiKey || '').trim();
}

let problemListCache = null;

async function getLeetCodeProblemList() {
  if (problemListCache && problemListCache.length > 0) {
    return problemListCache;
  }
  const reqUrl = (typeof obsidian !== 'undefined' && obsidian?.requestUrl) ? obsidian.requestUrl : window?.requestUrl;
  if (!reqUrl) {
    console.error('Obsidian requestUrl is not available.');
    return [];
  }
  try {
    const listResponse = await reqUrl({
      url: 'https://leetcode.com/api/problems/all/',
      method: 'GET'
    });
    const pairs = listResponse.json?.stat_status_pairs;
    if (Array.isArray(pairs)) {
      problemListCache = pairs;
      return pairs;
    }
  } catch (e) {
    console.error('Failed to load LeetCode problem list:', e);
  }
  return [];
}

async function fetchLeetCodeProblem(questionNumberOrSlug) {
  const reqUrl = (typeof obsidian !== 'undefined' && obsidian?.requestUrl) ? obsidian.requestUrl : window?.requestUrl;
  if (!reqUrl) {
    console.error('Obsidian requestUrl is not available.');
    return null;
  }

  // 1. Fetch the complete problem list to find the matching titleSlug
  const problems = await getLeetCodeProblemList();
  if (!problems || problems.length === 0) {
    console.error('Could not load problem list.');
    return null;
  }

  let target = null;
  const rawStr = String(questionNumberOrSlug || '').trim();
  const numMatch = rawStr.match(/^#?\s*(\d+)$/);

  if (numMatch) {
    const num = Number(numMatch[1]);
    target = problems.find((p) => p.stat.frontend_question_id === num);
  } else {
    const slug = rawStr.toLowerCase();
    target = problems.find((p) => p.stat.question__title_slug === slug || p.stat.question__title.toLowerCase() === slug);
  }

  if (!target) {
    console.error(`Question ${questionNumberOrSlug} not found.`);
    return null;
  }

  const titleSlug = target.stat.question__title_slug;

  // 2. Query the GraphQL API for description, test cases and code snippets
  const graphqlQuery = {
    query: `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          questionId
          title
          content
          exampleTestcases
          codeSnippets {
            lang
            langSlug
            code
          }
        }
      }
    `,
    variables: { titleSlug }
  };

  const detailResponse = await reqUrl({
    url: 'https://leetcode.com/graphql',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphqlQuery)
  });

  const data = detailResponse.json?.data?.question;
  if (!data) return null;

  const diffLevel = target.difficulty?.level;
  const diffName = diffLevel === 1 ? 'Easy' : (diffLevel === 3 ? 'Hard' : 'Medium');

  return {
    questionId: target.stat.frontend_question_id,
    title: data.title,
    difficulty: diffName,
    htmlDescription: data.content,
    testCases: data.exampleTestcases,
    codeSnippets: data.codeSnippets || []
  };
}

function getCodeSnippetForLang(snippets, langName) {
  if (!snippets || !Array.isArray(snippets) || snippets.length === 0) return '';
  const l = (langName || '').toLowerCase().trim();

  let targetSlug = 'python3';
  if (l.includes('python')) targetSlug = 'python3';
  else if (l.includes('c++') || l.includes('clang') || l.includes('cpp')) targetSlug = 'cpp';
  else if (l.includes('typescript')) targetSlug = 'typescript';
  else if (l.includes('javascript') || l.includes('js')) targetSlug = 'javascript';
  else if (l.includes('java') && !l.includes('script')) targetSlug = 'java';
  else if (l.includes('rust')) targetSlug = 'rust';
  else if (l.includes('go')) targetSlug = 'golang';
  else if (l.includes('c#') || l.includes('csharp')) targetSlug = 'csharp';
  else if (l.startsWith('c ') || l === 'c') targetSlug = 'c';

  // 1. Direct match on langSlug
  let match = snippets.find(s => s.langSlug === targetSlug);
  if (match) return match.code;

  // 2. Partial match on langSlug
  match = snippets.find(s => s.langSlug?.toLowerCase().includes(targetSlug));
  if (match) return match.code;

  // 3. Partial match on lang name
  match = snippets.find(s => s.lang?.toLowerCase().includes(targetSlug));
  if (match) return match.code;

  // 4. Default fallback: python3, python, or first
  const fallback = snippets.find(s => s.langSlug === 'python3' || s.langSlug === 'python');
  return fallback ? fallback.code : (snippets[0]?.code || '');
}

/**
 * Executes chat completions request against any AI provider using central plugin.settings
 */
async function fetchChatResponse(userPrompt, plugin) {
  const settings = plugin?.settings || DEFAULT_SETTINGS;
  const apiKey = (settings.apiKey || getActiveApiKey(settings)).trim();
  let baseUrl = (settings.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai').trim();
  let model = (settings.model || 'gemini-3.8-flash').trim();

  // Smart Auto-Correction: If the user provides a Google Gemini API key (starts with 'AQ.' or 'AIzaSy'),
  // make sure it routes to Google's endpoint instead of OpenAI (which causes status 401)
  const isGoogleKey = apiKey.startsWith('AQ.') || apiKey.startsWith('AIzaSy');
  const isGemini = baseUrl.includes('generativelanguage.googleapis.com') || isGoogleKey;

  const reqUrl = (typeof obsidian !== 'undefined' && obsidian?.requestUrl) ? obsidian.requestUrl : window?.requestUrl;
  if (!reqUrl) {
    throw new Error('Obsidian requestUrl is not available.');
  }

  // 1. If using Google Gemini, call Google's native generateContent endpoint directly for fast, reliable responses
  if (isGemini && apiKey) {
    const primary = (model && model.startsWith('gemini') && !model.includes('3.5') && !model.includes('2.0') && !model.includes('2.5')) 
      ? model 
      : 'gemini-3.8-flash';
    const modelsToTry = [...new Set([primary, 'gemini-3.8-flash', 'gemini-flash-latest'])];

    let lastError = null;
    for (const m of modelsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const nativeUrl = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
          const nativeRes = await reqUrl({
            url: nativeUrl,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: userPrompt }] }]
            })
          });
          const text = nativeRes.json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
        } catch (err) {
          lastError = err;
          if (err.status === 503 || (err.message && err.message.includes('503'))) {
            await new Promise(r => setTimeout(r, 600));
            continue;
          }
          break;
        }
      }
    }
    if (lastError) throw lastError;
  }

  // 2. For OpenAI, DeepSeek, Groq, or custom providers, use standard OpenAI-compatible completions
  const cleanBaseUrl = baseUrl.replace(/\/+$/, "");
  const headers = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const response = await reqUrl({
    url: `${cleanBaseUrl}/chat/completions`,
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: "You are an expert programming assistant and LeetCode mentor. Provide helpful, concise intuition, edge cases, and algorithmic hints." },
        { role: "user", content: userPrompt }
      ]
    })
  });

  const choices = response.json?.choices;
  if (choices && choices.length > 0 && choices[0]?.message?.content) {
    return choices[0].message.content;
  }

  throw new Error('No response content received from AI provider.');
}

// Modal for selecting existing vault notes
class VaultNoteModal extends (obsidian?.FuzzySuggestModal || class {}) {
  constructor(app, onSelect) {
    super(app);
    this.onSelect = onSelect;
    if (this.setPlaceholder) {
      this.setPlaceholder('Select a note to open in LeetCode Workspace...');
    }
  }

  getItems() {
    return this.app?.vault?.getMarkdownFiles?.() || [];
  }

  getItemText(file) {
    return file.path;
  }

  onChooseItem(file) {
    if (this.onSelect) this.onSelect(file);
  }
}

class LeetCodeWorkspaceView extends (obsidian?.ItemView || class {}) {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.app = leaf?.app || plugin?.app;

    // View state
    this.currentZoom = 100;
    this.currentLang = 'Python 3';
    this.currentDifficulty = 'Medium';

    // Tabs & History
    this.tabs = [];
    this.activeTabId = null;
    this.tabHistory = [];
    this.historyIndex = -1;
    this.isNavigatingHistory = false;

    // Active Note Data
    this.activeNote = {
      title: 'LeetCode Workspace',
      filePath: '',
      difficulty: 'Medium',
      language: 'Python 3',
      question: '',
      approach: '',
      code: '',
      copilotNotes: '',
      chatHistory: []
    };

    // Auto-save debounce timer
    this.saveTimeout = null;
    this.renameTimeout = null;
    this.fetchTimeout = null;
    this.suggestMatches = [];
    this.suggestHighlightedIndex = -1;

    // Panel slot layout: default ONLY Question + Thinking (Problem) in left column
    this.panelSlots = {
      left: ['problem'],
      right: []
    };

    // Resizable layout sizes (persisted in memory)
    this.layoutSizes = {
      leftColWidth: 50,
      leftTopHeight: 50,
      rightTopHeight: 50,
      questionHeight: 50,
      approachHeight: 50
    };
  }

  getViewType() {
    return VIEW_TYPE_LEETCODE;
  }

  getDisplayText() {
    return 'LeetCode Workspace';
  }

  getIcon() {
    return 'code-2';
  }

  getPlugin() {
    if (this.plugin && this.plugin.settings) {
      return this.plugin;
    }
    const plugins = this.app?.plugins;
    const p = plugins?.plugins?.['main-plugin'] ||
              plugins?.plugins?.['main plugin'] ||
              plugins?.getPlugin?.('main-plugin') ||
              plugins?.getPlugin?.('main plugin');
    if (p) {
      this.plugin = p;
      return p;
    }
    return this.plugin || {};
  }

  async getSettings() {
    const plugin = this.getPlugin();
    if (plugin?.settings?.apiKey) {
      return plugin.settings;
    }
    if (plugin?.loadData) {
      const data = await plugin.loadData();
      if (data) {
        if (!plugin.settings) plugin.settings = Object.assign({}, DEFAULT_SETTINGS);
        plugin.settings.apiKey = data.apiKey || data.settings?.apiKey || data.geminiApiKey || data.openaiApiKey || plugin.settings.apiKey || '';
        plugin.settings.baseUrl = data.baseUrl || data.settings?.baseUrl || plugin.settings.baseUrl;
        plugin.settings.model = data.model || data.settings?.model || plugin.settings.model;
        plugin.settings.activePreset = data.activePreset || data.settings?.activePreset || plugin.settings.activePreset;
        return plugin.settings;
      }
    }
    return plugin?.settings || DEFAULT_SETTINGS;
  }

  // ==========================================
  // NOTE & VAULT STORAGE METHODS
  // ==========================================

  async ensureWorkspaceFolder() {
    if (!this.app?.vault) return WORKSPACE_FOLDER;
    try {
      const exists = await this.app.vault.adapter.exists(WORKSPACE_FOLDER);
      if (!exists) {
        await this.app.vault.createFolder(WORKSPACE_FOLDER);
      }
    } catch (e) {
      // Folder might already exist
    }
    return WORKSPACE_FOLDER;
  }

  parseNoteContent(rawMarkdown, defaultTitle) {
    let title = defaultTitle || 'LeetCode Workspace';
    let difficulty = 'Medium';
    let language = 'Python 3';
    let question = '';
    let approach = '';
    let code = '';
    let copilotNotes = '';
    let content = rawMarkdown || '';

    // If empty note, return completely blank fields
    if (!content.trim()) {
      return { title, difficulty, language, question: '', approach: '', code: '', copilotNotes: '' };
    }

    // 1. Parse YAML Frontmatter
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (fmMatch) {
      const yaml = fmMatch[1];
      content = content.slice(fmMatch[0].length);

      const titleMatch = yaml.match(/^title:\s*["']?(.*?)["']?$/m);
      if (titleMatch && titleMatch[1]) title = titleMatch[1].trim();

      const diffMatch = yaml.match(/^difficulty:\s*["']?(.*?)["']?$/m);
      if (diffMatch && diffMatch[1]) {
        const val = diffMatch[1].trim();
        if (['Easy', 'Medium', 'Hard'].includes(val)) difficulty = val;
      }

      const langMatch = yaml.match(/^language:\s*["']?(.*?)["']?$/m);
      if (langMatch && langMatch[1]) {
        const lVal = langMatch[1].trim();
        if (LANG_MAP[lVal]) language = lVal;
      }
    }

    // Strip top H1 # Title if present so it never leaks into textareas
    content = content.replace(/^#\s+[^\r\n]*\r?\n?/m, '').trim();

    // 2. Extract sections by headings (## Question, ## Approach, ## Solution, ## Notes)
    const sections = content.split(/\r?\n(?=##\s+)/);
    for (const sec of sections) {
      const headerMatch = sec.match(/^##\s+([^\r\n]+)\r?\n?([\s\S]*)$/);
      if (!headerMatch) {
        const clean = sec.trim();
        if (clean && !clean.startsWith('#') && !question) {
          question = clean;
        }
        continue;
      }

      const header = headerMatch[1].trim().toLowerCase();
      const body = headerMatch[2].trim();

      if (header.includes('question') || header.includes('description') || header.includes('problem')) {
        question = body.replace(/^#+\s+[^\r\n]*\r?\n?/gm, '').trim();
      } else if (header.includes('approach') || header.includes('intuition') || header.includes('idea')) {
        approach = body.replace(/^#+\s+[^\r\n]*\r?\n?/gm, '').trim();
      } else if (header.includes('solution') || header.includes('code') || header.includes('implementation')) {
        const codeFenceMatch = body.match(/```(?:[a-zA-Z0-9_\-+]+)?\r?\n([\s\S]*?)\r?\n?```/);
        code = codeFenceMatch ? codeFenceMatch[1] : body;
      } else if (header.includes('copilot') || header.includes('ai') || header.includes('notes')) {
        copilotNotes = body;
      } else if (header.includes('test') || header.includes('cases')) {
        const codeFenceMatch = body.match(/```(?:[a-zA-Z0-9_\-+]+)?\r?\n([\s\S]*?)\r?\n?```/);
        testCases = codeFenceMatch ? codeFenceMatch[1].trim() : body.trim();
      }
    }

    if (!testCases && question) {
      testCases = this.extractTestCasesFromQuestion(question);
    }

    return { title, difficulty, language, question, approach, code, copilotNotes, testCases };
  }

  extractTestCasesFromQuestion(text) {
    if (!text || typeof text !== 'string') return '';
    const cleanText = text.replace(/<[^>]+>/g, '\n');
    const inputMatches = [...cleanText.matchAll(/Input:\s*([^\r\n]+)/gi)];
    if (inputMatches.length === 0) return '';
    const lines = [];
    for (const m of inputMatches) {
      const line = m[1].trim();
      const parts = line.split(/,\s*(?=[a-zA-Z_]\w*\s*=)/);
      if (parts.length > 1) {
        for (const p of parts) {
          const valMatch = p.match(/=\s*(.+)$/);
          if (valMatch) lines.push(valMatch[1].trim());
          else lines.push(p.trim());
        }
      } else {
        const valMatch = line.match(/=\s*(.+)$/);
        if (valMatch) lines.push(valMatch[1].trim());
        else lines.push(line);
      }
    }
    return lines.join('\n');
  }

  serializeNoteContent(data) {
    const langTag = LANG_MAP[data.language] || 'python';
    const title = data.title || 'Problem 1';
    const difficulty = data.difficulty || 'Medium';
    const language = data.language || 'Python 3';

    const hasQ = data.question && data.question.trim().length > 0;
    const hasA = data.approach && data.approach.trim().length > 0;
    const hasC = data.code && data.code.trim().length > 0;
    const hasN = data.copilotNotes && data.copilotNotes.trim().length > 0;
    const hasT = data.testCases && data.testCases.trim().length > 0;

    // If completely empty, keep note file completely empty - DO NOT write dummy headings!
    if (!hasQ && !hasA && !hasC && !hasN && !hasT) {
      return '';
    }

    let md = `---
title: ${JSON.stringify(title)}
difficulty: ${difficulty}
language: ${language}
tags:
  - leetcode
---

# ${title}
`;

    if (hasQ) {
      md += `\n## Question\n${data.question.trim()}\n`;
    }

    if (hasA) {
      md += `\n## Approach & Intuition\n${data.approach.trim()}\n`;
    }

    if (hasC) {
      md += `\n## Solution\n\`\`\`${langTag}\n${data.code.trim()}\n\`\`\`\n`;
    }

    if (hasT) {
      md += `\n## Test Cases\n\`\`\`text\n${data.testCases.trim()}\n\`\`\`\n`;
    }

    if (hasN) {
      md += `\n## AI Copilot Notes\n${data.copilotNotes.trim()}\n`;
    }

    return md.trim() + '\n';
  }

  queueSave() {
    this.showSaveStatus('saving');
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(async () => {
      await this.saveActiveNote();
      this.showSaveStatus('saved');
    }, 400);
  }

  queueTitleRename(tabId, newTitle) {
    if (this.renameTimeout) clearTimeout(this.renameTimeout);
    this.renameTimeout = setTimeout(async () => {
      await this.commitTitleRename(tabId, newTitle);
    }, 500);
  }

  async commitTitleRename(tabId, newTitle) {
    if (this.renameTimeout) {
      clearTimeout(this.renameTimeout);
      this.renameTimeout = null;
    }
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !newTitle) return;
    await this.renameTab(tab.id, newTitle, true);
  }

  renderTestCases(testCases) {
    const panel = this.contentEl.querySelector('#test-output-panel');
    if (!panel) return;
    const lines = (typeof testCases === 'string' ? testCases : '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      panel.innerHTML = '<span class="text-[#5b5d6e]">No test cases available.</span>';
      return;
    }

    panel.innerHTML = `
      <div class="space-y-1.5 py-0.5">
        ${lines.map((line, idx) => `
          <div class="test-case-row flex flex-col py-1.5 px-2.5 bg-[#1b1b24] hover:bg-[#20202c] border border-[#2b2b3b] rounded font-mono text-[11px] text-[#e0e2ed] transition gap-1">
            <div class="flex items-center justify-between text-[10px]">
              <span class="text-purple-400 font-semibold select-none flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                Line ${idx + 1}
              </span>
              <span class="text-[9px] text-[#717488] uppercase tracking-wider font-mono select-none px-1.5 py-0.5 bg-[#14141a] rounded border border-[#262634]">Case ${idx + 1}</span>
            </div>
            <div class="select-text font-mono text-[#ced1e0] break-all leading-relaxed whitespace-pre-wrap">${this.escapeHtml(line)}</div>
          </div>
        `).join('')}
      </div>
    `;

    const statusEl = this.contentEl.querySelector('#test-runner-status');
    if (statusEl) {
      statusEl.innerHTML = `<span class="text-emerald-400 font-mono">${lines.length} Cases Loaded</span>`;
    }
  }

  async runPythonLocally(code, testCasesLines) {
    let cp = null, fs = null, path = null, os = null;
    try {
      if (typeof require === 'function') {
        cp = require('child_process');
        fs = require('fs');
        path = require('path');
        os = require('os');
      }
    } catch(e) {}

    if (!cp || !fs || !path || !os) {
      throw new Error('Local process execution not available in current environment.');
    }

    const runnerScript = `
import sys, json, traceback, io
from typing import *
import collections, heapq, bisect, math, itertools

user_code = ${JSON.stringify(code)}
test_lines = ${JSON.stringify(testCasesLines)}

stdout_capture = io.StringIO()
old_stdout = sys.stdout
sys.stdout = stdout_capture

namespace = {
    'List': List,
    'Optional': Optional,
    'Dict': Dict,
    'Tuple': Tuple,
    'Set': Set
}

try:
    exec(user_code, namespace)
    captured_stdout = stdout_capture.getvalue()
    sys.stdout = old_stdout

    sol_cls = namespace.get('Solution')
    fn = None
    if sol_cls and isinstance(sol_cls, type):
        try:
            inst = sol_cls()
            methods = [m for m in dir(inst) if not m.startswith('_')]
            if methods:
                fn = getattr(inst, methods[0])
        except Exception:
            pass
    if not fn:
        callables = [v for k, v in namespace.items() if callable(v) and not k.startswith('_') and k != 'Solution']
        if callables:
            fn = callables[0]

    parsed_items = []
    for l in test_lines:
        try:
            parsed_items.append(json.loads(l))
        except Exception:
            parsed_items.append(l)

    results = []

    if fn:
        import inspect
        try:
            sig = inspect.signature(fn)
            params = [p for p in sig.parameters.values() if p.name != 'self']
            param_count = len(params)
        except Exception:
            param_count = 1
        if param_count <= 0:
            param_count = 1

        batches = []
        if len(parsed_items) > 0:
            for i in range(0, len(parsed_items), param_count):
                batches.append(parsed_items[i:i + param_count])
        elif param_count == 0:
            batches = [[]]
        else:
            if not captured_stdout:
                results.append({
                    'case': 1,
                    'input': 'No inputs provided',
                    'output': f"Function requires {param_count} argument(s). Click '+ Custom Test' to add inputs.",
                    'status': 'passed'
                })

        for idx, args in enumerate(batches):
            try:
                out = fn(*args)
                results.append({'case': idx + 1, 'input': args, 'output': out, 'status': 'passed'})
            except Exception as ex:
                results.append({'case': idx + 1, 'input': args, 'error': str(ex), 'status': 'runtime_error'})

    if len(results) == 0:
        out_msg = captured_stdout.strip() if captured_stdout else "Code executed successfully without errors."
        results.append({'case': 1, 'input': 'Direct Run', 'output': out_msg, 'status': 'passed', 'stdout': captured_stdout})

    print(json.dumps({'status': 'ok', 'results': results, 'stdout': captured_stdout}))
except Exception as e:
    sys.stdout = old_stdout
    tb = traceback.format_exc()
    print(json.dumps({'status': 'error', 'error': str(e), 'traceback': tb, 'stdout': stdout_capture.getvalue()}))
`;

    const tmpFile = path.join(os.tmpdir(), `lc_run_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.py`);
    fs.writeFileSync(tmpFile, runnerScript, 'utf8');

    return new Promise((resolve, reject) => {
      cp.exec(`python "${tmpFile}"`, { timeout: 10000 }, (error, stdout, stderr) => {
        try { if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile); } catch(e) {}
        if (error && !stdout) {
          return reject(new Error(stderr || error.message));
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.status === 'ok') {
            resolve(parsed.results || []);
          } else {
            reject(new Error(parsed.error || 'Execution failed'));
          }
        } catch(e) {
          if (stderr) reject(new Error(stderr));
          else resolve([{ case: 1, output: stdout.trim(), status: 'passed' }]);
        }
      });
    });
  }

  async runCppLocally(code, testCasesLines) {
    let cp = null, fs = null, path = null, os = null;
    try {
      if (typeof require === 'function') {
        cp = require('child_process');
        fs = require('fs');
        path = require('path');
        os = require('os');
      }
    } catch(e) {}

    if (!cp || !fs || !path || !os) {
      throw new Error('Local process execution not available in current environment.');
    }

    const runnerScript = `
import subprocess, tempfile, os, json, re, sys

cpp_code = ${JSON.stringify(code)}
test_lines = ${JSON.stringify(testCasesLines)}

# If code already has a main function, run directly
if 'int main(' in cpp_code:
    tmp_cpp = os.path.join(tempfile.gettempdir(), f'lc_direct_{os.getpid()}.cpp')
    tmp_exe = os.path.join(tempfile.gettempdir(), f'lc_direct_{os.getpid()}.exe')
    with open(tmp_cpp, 'w', encoding='utf-8') as f:
        f.write(cpp_code)
    c = subprocess.run(['g++', '-std=c++14', tmp_cpp, '-o', tmp_exe], capture_output=True, text=True)
    try: os.unlink(tmp_cpp)
    except: pass
    if c.returncode != 0:
        print(json.dumps({'status': 'error', 'error': 'C++ Compilation Error:\\n' + c.stderr}))
        sys.exit(0)
    r = subprocess.run([tmp_exe], capture_output=True, text=True)
    try: os.unlink(tmp_exe)
    except: pass
    print(json.dumps({'status': 'ok', 'results': [{'case': 1, 'input': 'Direct Run', 'output': r.stdout.strip(), 'status': 'passed'}]}))
    sys.exit(0)

def json_to_cpp(val):
    if isinstance(val, bool):
        return 'true' if val else 'false'
    elif isinstance(val, (int, float)):
        return str(val)
    elif isinstance(val, str):
        return json.dumps(val)
    elif isinstance(val, list):
        return '{' + ', '.join(json_to_cpp(x) for x in val) + '}'
    return str(val)

clean_cpp = re.sub(r'//.*', '', cpp_code)
clean_cpp = re.sub(r'/\\*[\\s\\S]*?\\*/', '', clean_cpp)
sol_match = re.search(r'class\\s+Solution\\s*\\{([\\s\\S]*?)\\};', clean_cpp)
sol_body = sol_match.group(1) if sol_match else clean_cpp

matches = re.findall(r'([\\w:<>,*&\\s]+?)\\s+(\\w+)\\s*\\(([^)]*)\\)\\s*\\{', sol_body)
target_method = None
for ret, name, params in matches:
    clean_ret = re.sub(r'\\b(public|private|protected)\\s*:\\s*', '', ret).strip()
    if name != 'Solution' and not name.startswith('_'):
        param_list = [p.strip() for p in params.split(',') if p.strip()]
        target_method = (clean_ret, name, param_list)
        break

if not target_method:
    print(json.dumps({'status': 'error', 'error': 'No Solution class or method definition found in C++ code.'}))
    sys.exit(0)

harness = '''
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <deque>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <climits>

using namespace std;

''' + cpp_code + '''

template<typename T>
void printVal(const T& val) { cout << val; }
inline void printVal(bool val) { cout << (val ? "true" : "false"); }
inline void printVal(const string& val) { cout << "\\"" << val << "\\""; }
template<typename T>
void printVal(const vector<T>& vec) {
    cout << "[";
    for(size_t i=0; i<vec.size(); ++i){
        if(i > 0) cout << ",";
        printVal(vec[i]);
    }
    cout << "]";
}

int main() {
    Solution sol;
'''

parsed_items = []
for l in test_lines:
    try: parsed_items.append(json.loads(l))
    except: parsed_items.append(l)

param_count = len(target_method[2])
if param_count == 0:
    batches = [[]]
elif len(parsed_items) > 0:
    batches = [parsed_items[i:i+param_count] for i in range(0, len(parsed_items), param_count)]
else:
    batches = []

if len(batches) == 0:
    print(json.dumps({'status': 'ok', 'results': [{'case': 1, 'input': 'No test cases provided', 'output': f'Method requires {param_count} argument(s). Click \\'+ Custom Test\\' to add inputs.', 'status': 'passed'}]}))
    sys.exit(0)

for idx, b in enumerate(batches):
    harness += f'    cout << "__CASE_{idx+1}__" << endl;\\n'
    harness += f'    {{\\n'
    arg_names = []
    for p_idx, (p_decl, val) in enumerate(zip(target_method[2], b)):
        clean_type = re.sub(r'&|\\bconst\\b', '', p_decl)
        clean_type = re.sub(r'\\w+$', '', clean_type).strip()
        var_name = f'arg_{idx}_{p_idx}'
        harness += f'        {clean_type} {var_name} = {json_to_cpp(val)};\\n'
        arg_names.append(var_name)
    harness += f'        auto res = sol.{target_method[1]}({", ".join(arg_names)});\\n'
    harness += f'        printVal(res);\\n'
    harness += f'        cout << endl;\\n'
    harness += f'    }}\\n'

harness += '    return 0;\\n}\\n'

tmp_cpp = os.path.join(tempfile.gettempdir(), f'lc_test_{os.getpid()}.cpp')
tmp_exe = os.path.join(tempfile.gettempdir(), f'lc_test_{os.getpid()}.exe')
with open(tmp_cpp, 'w', encoding='utf-8') as f:
    f.write(harness)

c = subprocess.run(['g++', '-std=c++14', tmp_cpp, '-o', tmp_exe], capture_output=True, text=True)
try: os.unlink(tmp_cpp)
except: pass

if c.returncode != 0:
    print(json.dumps({'status': 'error', 'error': 'C++ Compilation Error:\\n' + c.stderr}))
    sys.exit(0)

r = subprocess.run([tmp_exe], capture_output=True, text=True)
try: os.unlink(tmp_exe)
except: pass

lines = r.stdout.splitlines()
res = []
curr_case = None
for l in lines:
    if l.startswith('__CASE_'):
        curr_case = int(l.replace('__CASE_', '').replace('__', ''))
    elif curr_case is not None:
        try: out = json.loads(l)
        except: out = l
        res.append({'case': curr_case, 'input': batches[curr_case-1], 'output': out, 'status': 'passed'})
        curr_case = None

print(json.dumps({'status': 'ok', 'results': res}))
`;

    const tmpRunner = path.join(os.tmpdir(), `lc_cpp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}.py`);
    fs.writeFileSync(tmpRunner, runnerScript, 'utf8');

    return new Promise((resolve, reject) => {
      cp.exec(`python "${tmpRunner}"`, { timeout: 15000 }, (error, stdout, stderr) => {
        try { if (fs.existsSync(tmpRunner)) fs.unlinkSync(tmpRunner); } catch(e) {}
        if (error && !stdout) {
          return reject(new Error(stderr || error.message));
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.status === 'ok') {
            resolve(parsed.results || []);
          } else {
            reject(new Error(parsed.error || 'Execution failed'));
          }
        } catch(e) {
          if (stderr) reject(new Error(stderr));
          else resolve([{ case: 1, output: stdout.trim(), status: 'passed' }]);
        }
      });
    });
  }

  runJavaScriptLocally(code, testCasesLines) {
    const parsedItems = (testCasesLines || []).map(l => {
      try { return JSON.parse(l); } catch(e) { return l; }
    });

    const logs = [];
    const customConsole = {
      log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      error: (...args) => logs.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => logs.push('[WARN] ' + args.join(' '))
    };

    // Strip TypeScript annotations and strict mode modifiers that break new Function
    const cleanCode = code
      .replace(/\b(public|private|protected|readonly)\s+/g, '')
      .replace(/:\s*([a-zA-Z0-9_<>[\]|&?]+)/g, '')
      .replace(/\bas\s+[a-zA-Z0-9_<>[\]]+/g, '');

    let runnerFn;
    try {
      runnerFn = new Function('console', `
        ${cleanCode}
        let target = null;
        if (typeof Solution !== 'undefined') {
          const inst = new Solution();
          const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(inst)).filter(m => m !== 'constructor');
          if (methods.length > 0) target = inst[methods[0]].bind(inst);
        }
        if (!target) {
          const fns = Object.keys(this).filter(k => typeof this[k] === 'function');
          if (fns.length > 0) target = this[fns[0]];
        }
        if (!target) {
          try { if (typeof twoSum === 'function') target = twoSum; } catch(e){}
        }
        return target;
      `);
    } catch(err) {
      throw new Error('Code syntax error: ' + err.message);
    }

    let fn;
    try {
      fn = runnerFn(customConsole);
    } catch(err) {
      throw new Error('Code evaluation error: ' + err.message);
    }

    if (typeof fn !== 'function') {
      return [{
        case: 1,
        input: 'Direct Run',
        output: logs.length > 0 ? logs.join('\n') : 'Code executed cleanly.',
        status: 'passed'
      }];
    }

    const paramCount = fn.length || 1;
    const batches = [];
    if (parsedItems.length > 0) {
      for (let i = 0; i < parsedItems.length; i += paramCount) {
        batches.push(parsedItems.slice(i, i + paramCount));
      }
    } else if (paramCount === 0) {
      batches.push([]);
    } else {
      return [{
        case: 1,
        input: 'No inputs provided',
        output: `Function requires ${paramCount} argument(s). Click '+ Custom Test' to add inputs.`,
        status: 'passed'
      }];
    }

    return batches.map((args, idx) => {
      try {
        const out = fn(...args);
        return { case: idx + 1, input: args, output: out, status: 'passed' };
      } catch(err) {
        return { case: idx + 1, input: args, error: err.message, status: 'runtime_error' };
      }
    });
  }

  renderExecutionResults(results, durationMs, langName) {
    const panel = this.contentEl.querySelector('#test-output-panel');
    const statusEl = this.contentEl.querySelector('#test-runner-status');
    if (!panel) return;

    const hasError = results.some(r => r.status !== 'passed');
    if (statusEl) {
      statusEl.innerHTML = hasError
        ? `<span class="text-rose-400 font-mono font-bold">Error (${durationMs}ms)</span>`
        : `<span class="text-emerald-400 font-mono font-bold">Accepted (${durationMs}ms)</span>`;
    }

    panel.innerHTML = `
      <div class="space-y-2 py-1 select-text">
        <div class="flex items-center justify-between pb-1 border-b border-[#2b2b3b] text-[10px]">
          <span class="${hasError ? 'text-rose-400' : 'text-emerald-400'} font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <span class="w-1.5 h-1.5 rounded-full ${hasError ? 'bg-rose-400' : 'bg-emerald-400'}"></span>
            ${hasError ? 'Runtime Error' : 'Accepted'}
          </span>
          <span class="text-[#7d8095] font-mono">${this.escapeHtml(langName)} • ${durationMs}ms</span>
        </div>
        ${results.map((res, i) => `
          <div class="p-2.5 rounded bg-[#181822] border ${res.status === 'passed' ? 'border-[#2d2d3e]' : 'border-rose-500/40'} text-[11px] font-mono space-y-1">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-bold ${res.status === 'passed' ? 'text-purple-300' : 'text-rose-400'}">Test Case ${res.case || i + 1}</span>
              <span class="${res.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'} font-semibold uppercase text-[9px] px-1.5 py-0.5 rounded bg-[#13131a]">${res.status === 'passed' ? 'Passed' : 'Error'}</span>
            </div>
            ${res.input !== undefined ? `<div class="text-[#8e91a2] text-[10.5px]">Input: <span class="text-[#ced1e0] font-mono">${this.escapeHtml(typeof res.input === 'object' ? JSON.stringify(res.input) : String(res.input))}</span></div>` : ''}
            ${res.output !== undefined ? `<div class="text-[#8e91a2] text-[10.5px]">Output: <span class="text-emerald-300 font-mono font-bold">${this.escapeHtml(typeof res.output === 'object' ? JSON.stringify(res.output) : String(res.output))}</span></div>` : ''}
            ${res.stdout ? `<div class="text-[#9da0b5] text-[10px] bg-[#121217] p-1.5 rounded border border-[#23232f] whitespace-pre-wrap">Logs:\n${this.escapeHtml(res.stdout)}</div>` : ''}
            ${res.error ? `<div class="text-rose-400 text-[10.5px] whitespace-pre-wrap">${this.escapeHtml(res.error)}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  async runCodeTestCases(isSubmit = false) {
    const code = (this.activeNote?.code || this.contentEl.querySelector('#code-editor-input')?.value || '').trim();
    const testStatus = this.contentEl.querySelector('#test-runner-status');
    const testOutputPanel = this.contentEl.querySelector('#test-output-panel');
    const langSelect = this.contentEl.querySelector('#lang-select');
    let lang = (langSelect ? langSelect.value : (this.currentLang || 'Python 3')).toLowerCase();

    if (!code) {
      if (obsidian?.Notice) new obsidian.Notice('Please write or paste code in the editor before running.');
      return;
    }

    // Auto-detect language if code strongly indicates a specific language
    const trimmedCode = code.trim();
    if (trimmedCode.includes('#include') || trimmedCode.includes('using namespace std') || trimmedCode.includes('public:') || trimmedCode.includes('vector<') || trimmedCode.includes('unordered_map<')) {
      lang = 'cpp';
    } else if (trimmedCode.includes('def ') || trimmedCode.includes('self.') || trimmedCode.includes('elif ') || trimmedCode.includes(': List[') || trimmedCode.includes('import collections')) {
      lang = 'python';
    }

    if (testStatus) {
      testStatus.innerHTML = '<span class="text-amber-400 font-mono animate-pulse">Running test cases...</span>';
    }
    if (testOutputPanel) {
      testOutputPanel.innerHTML = '<div class="text-[#7d8095] text-[11px] font-mono animate-pulse py-1">Executing code against test cases...</div>';
    }

    let testCasesRaw = this.activeNote?.testCases || '';
    if (!testCasesRaw.trim() && this.activeNote?.question) {
      testCasesRaw = this.extractTestCasesFromQuestion(this.activeNote.question);
      if (testCasesRaw) {
        this.activeNote.testCases = testCasesRaw;
        this.renderTestCases(testCasesRaw);
      }
    }

    const lines = (typeof testCasesRaw === 'string' ? testCasesRaw : '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);

    const startTime = performance.now();

    try {
      let results = [];
      if (lang.includes('cpp') || lang.includes('c++') || lang.includes('clang')) {
        results = await this.runCppLocally(code, lines);
      } else if (lang.includes('python')) {
        results = await this.runPythonLocally(code, lines);
      } else if (lang.includes('javascript') || lang.includes('typescript')) {
        results = this.runJavaScriptLocally(code, lines);
      } else {
        try {
          results = await this.runCppLocally(code, lines);
        } catch (eCpp) {
          try {
            results = await this.runPythonLocally(code, lines);
          } catch (ePy) {
            results = this.runJavaScriptLocally(code, lines);
          }
        }
      }

      const duration = Math.round(performance.now() - startTime);
      this.renderExecutionResults(results, duration, this.currentLang);
      if (obsidian?.Notice) {
        const passCount = results.filter(r => r.status === 'passed').length;
        new obsidian.Notice(`${isSubmit ? 'Submitted' : 'Test Run'}: ${passCount}/${results.length} test cases passed (${duration}ms)`);
      }
    } catch (err) {
      const duration = Math.round(performance.now() - startTime);
      if (testStatus) {
        testStatus.innerHTML = '<span class="text-rose-400 font-mono">Error</span>';
      }
      if (testOutputPanel) {
        testOutputPanel.innerHTML = `
          <div class="space-y-1.5 py-1 text-[11px] font-mono select-text">
            <div class="text-rose-400 font-bold flex items-center gap-1.5 text-xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Execution Error
            </div>
            <div class="p-2.5 rounded bg-rose-950/20 border border-rose-500/30 text-rose-300 whitespace-pre-wrap leading-relaxed">${this.escapeHtml(err.message || String(err))}</div>
          </div>
        `;
      }
    }
  }

  async showProblemDropdown(query) {
    const dropdown = this.contentEl.querySelector('#leetcode-suggest-dropdown');
    const container = this.contentEl.querySelector('#suggest-items-container');
    const countEl = this.contentEl.querySelector('#suggest-count');
    if (!dropdown || !container) return;

    const trimmed = (query || '').trim();
    if (!trimmed) {
      this.hideProblemDropdown();
      return;
    }

    container.innerHTML = '<div class="p-2.5 text-center text-[#787b8e] text-[11px] font-mono animate-pulse">Loading LeetCode questions...</div>';
    dropdown.classList.remove('hidden');

    const problems = await getLeetCodeProblemList();
    if (!problems || problems.length === 0) {
      container.innerHTML = '<div class="p-2.5 text-center text-[#787b8e] text-[11px] font-mono">Unable to load problem list</div>';
      return;
    }

    const q = trimmed.toLowerCase();
    const cleanNum = q.replace(/^#/, '');
    const isNum = /^\d+$/.test(cleanNum);

    const matches = problems.filter(p => {
      const fid = p.stat.frontend_question_id.toString();
      const title = p.stat.question__title.toLowerCase();
      if (isNum) {
        return fid.startsWith(cleanNum) || fid === cleanNum;
      }
      return fid.startsWith(cleanNum) || title.includes(q);
    });

    matches.sort((a, b) => {
      const aId = a.stat.frontend_question_id;
      const bId = b.stat.frontend_question_id;
      if (isNum) {
        if (aId === Number(cleanNum)) return -1;
        if (bId === Number(cleanNum)) return 1;
      }
      return aId - bId;
    });

    this.suggestMatches = matches.slice(0, 30);
    this.suggestHighlightedIndex = -1;

    if (this.suggestMatches.length === 0) {
      container.innerHTML = '<div class="p-2.5 text-center text-[#6e7284] text-[11px] font-mono">No matching LeetCode questions</div>';
      if (countEl) countEl.textContent = '0 found';
      dropdown.classList.remove('hidden');
      return;
    }

    if (countEl) countEl.textContent = `${matches.length} found`;

    container.innerHTML = this.suggestMatches.map((p, idx) => {
      const diffLevel = p.difficulty?.level;
      const diff = diffLevel === 1 ? 'Easy' : (diffLevel === 3 ? 'Hard' : 'Medium');
      const diffClass = diffLevel === 1 ? 'diff-badge-easy' : (diffLevel === 3 ? 'diff-badge-hard' : 'diff-badge-med');

      return `
        <div class="leetcode-suggest-item" data-index="${idx}" data-id="${p.stat.frontend_question_id}">
          <div class="flex items-center gap-2 truncate">
            <span class="text-purple-400 font-mono font-bold text-[11px] min-w-[34px]">#${p.stat.frontend_question_id}</span>
            <span class="truncate font-medium text-[#e2e4ed]">${this.escapeHtml(p.stat.question__title)}</span>
          </div>
          <span class="${diffClass}">${diff}</span>
        </div>
      `;
    }).join('');

    dropdown.classList.remove('hidden');
  }

  hideProblemDropdown() {
    const dropdown = this.contentEl?.querySelector('#leetcode-suggest-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
    this.suggestMatches = [];
    this.suggestHighlightedIndex = -1;
  }

  highlightDropdownItem(index) {
    const container = this.contentEl.querySelector('#suggest-items-container');
    if (!container) return;
    const items = container.querySelectorAll('.leetcode-suggest-item');
    items.forEach(it => it.classList.remove('active'));
    if (index >= 0 && index < items.length) {
      items[index].classList.add('active');
      items[index].scrollIntoView({ block: 'nearest' });
      this.suggestHighlightedIndex = index;
    }
  }

  async selectProblem(problem) {
    if (!problem) return;
    this.hideProblemDropdown();

    const qNum = problem.stat.frontend_question_id;
    const qTitle = problem.stat.question__title;
    const qSlug = problem.stat.question__title_slug;
    const diffLevel = problem.difficulty?.level;
    const diffName = diffLevel === 1 ? 'Easy' : (diffLevel === 3 ? 'Hard' : 'Medium');

    const formattedTitle = `${qNum}. ${qTitle}`;
    const titleInput = this.contentEl.querySelector('#problem-title-input');
    if (titleInput) {
      titleInput.value = formattedTitle;
    }

    this.updateDifficultyBadge(diffName);

    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      await this.renameTab(activeTab.id, formattedTitle, true);
    }

    await this.loadLeetCodeProblem(qSlug || qNum);
  }

  queueLeetCodeFetchIfNumber(val) {
    if (this.fetchTimeout) clearTimeout(this.fetchTimeout);
    const trimmed = (val || '').trim();
    const match = trimmed.match(/^#?\s*(\d+)$/);
    if (!match) return;

    const questionNumber = parseInt(match[1], 10);
    if (isNaN(questionNumber) || questionNumber <= 0) return;

    this.fetchTimeout = setTimeout(async () => {
      await this.loadLeetCodeProblem(questionNumber);
    }, 700);
  }

  async checkAndFetchLeetCode(val) {
    if (this.fetchTimeout) {
      clearTimeout(this.fetchTimeout);
      this.fetchTimeout = null;
    }
    const trimmed = (val || '').trim();
    const match = trimmed.match(/^#?\s*(\d+)$/);
    if (!match) return;

    const questionNumber = parseInt(match[1], 10);
    if (isNaN(questionNumber) || questionNumber <= 0) return;

    await this.loadLeetCodeProblem(questionNumber);
  }

  async loadLeetCodeProblem(questionNumberOrSlug) {
    const loader = this.contentEl.querySelector('#question-fetch-loader');
    const descView = this.contentEl.querySelector('#description-view');
    const questionInput = this.contentEl.querySelector('#question-input');
    const toggleBtn = this.contentEl.querySelector('#toggle-desc-view-btn');
    const charCount = this.contentEl.querySelector('#question-char-count');
    const titleInput = this.contentEl.querySelector('#problem-title-input');

    if (loader) loader.classList.remove('hidden');
    if (obsidian?.Notice) new obsidian.Notice(`Fetching LeetCode problem...`);

    try {
      const result = await fetchLeetCodeProblem(questionNumberOrSlug);
      if (!result) {
        if (obsidian?.Notice) new obsidian.Notice(`LeetCode problem not found.`);
        return;
      }

      // 1. Inject htmlDescription as innerHTML of top-left description view
      if (descView) {
        descView.innerHTML = result.htmlDescription || '<p>No description provided.</p>';
        descView.style.display = 'block';
      }
      if (questionInput) {
        questionInput.style.display = 'none';
        questionInput.value = result.htmlDescription || '';
      }
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.textContent = 'Raw Edit';
      }
      if (charCount) {
        charCount.textContent = `${(result.htmlDescription || '').length} chars`;
      }

      this.activeNote.question = result.htmlDescription || '';
      this.activeNote.testCases = result.testCases || '';
      this.activeNote.codeSnippets = result.codeSnippets || [];

      // Update starter code in code editor
      const codeEditor = this.contentEl.querySelector('#code-editor-input');
      const langSelect = this.contentEl.querySelector('#lang-select');
      const currentLang = langSelect ? langSelect.value : (this.currentLang || 'Python 3');
      const starterCode = getCodeSnippetForLang(result.codeSnippets, currentLang);
      if (codeEditor && starterCode) {
        codeEditor.value = starterCode;
        this.activeNote.code = starterCode;
        this.updateCodeLineNumbers();
      }

      // 2. Render test cases split by newlines in bottom test cases box
      this.renderTestCases(result.testCases);

      // 3. Update title
      const qNum = result.questionId || questionNumberOrSlug;
      const updatedTitle = `${qNum}. ${result.title}`;
      if (titleInput) {
        titleInput.value = updatedTitle;
      }
      if (result.difficulty) {
        this.updateDifficultyBadge(result.difficulty);
      }
      const activeTab = this.tabs.find(t => t.id === this.activeTabId);
      if (activeTab) {
        await this.renameTab(activeTab.id, updatedTitle, true);
      }

      this.updateWordCount();
      this.queueSave();

      if (obsidian?.Notice) {
        new obsidian.Notice(`Loaded LeetCode #${qNum}: ${result.title}`);
      }
    } catch (err) {
      console.error('Error fetching LeetCode problem:', err);
      if (obsidian?.Notice) new obsidian.Notice(`Failed to fetch LeetCode problem`);
    } finally {
      if (loader) loader.classList.add('hidden');
    }
  }

  async saveActiveNote() {
    if (!this.app?.vault || !this.activeTabId) return;
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (!activeTab || !activeTab.filePath) return;

    // Read current input values
    const container = this.contentEl;
    const questionInput = container.querySelector('#question-input');
    const approachInput = container.querySelector('#approach-input');
    const codeEditor = container.querySelector('#code-editor-input');

    if (questionInput) this.activeNote.question = questionInput.value;
    if (approachInput) this.activeNote.approach = approachInput.value;
    if (codeEditor) this.activeNote.code = codeEditor.value;
    this.activeNote.difficulty = this.currentDifficulty;
    this.activeNote.language = this.currentLang;
    this.activeNote.title = activeTab.title;

    const markdown = this.serializeNoteContent(this.activeNote);

    try {
      const file = this.app.vault.getAbstractFileByPath(activeTab.filePath);
      if (file && file instanceof obsidian.TFile) {
        await this.app.vault.modify(file, markdown);
      } else {
        await this.ensureWorkspaceFolder();
        await this.app.vault.create(activeTab.filePath, markdown);
      }
    } catch (err) {
      console.error('Error auto-saving note:', err);
    }
  }

  showSaveStatus(status) {
    const statusEl = this.contentEl.querySelector('#autosave-status');
    const footerStatusEl = this.contentEl.querySelector('#save-status-footer');

    if (status === 'saving') {
      if (statusEl) {
        statusEl.innerHTML = `
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-1"></span>
          <span class="text-amber-400 font-mono text-[10.5px]">Saving...</span>
        `;
      }
      if (footerStatusEl) {
        footerStatusEl.textContent = 'Saving to note...';
        footerStatusEl.className = 'text-amber-400 font-mono';
      }
    } else {
      if (statusEl) {
        statusEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle text-emerald-400 mr-1"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
          <span class="text-[#636677] font-mono text-[10.5px]">Auto-saved</span>
        `;
      }
      if (footerStatusEl) {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        footerStatusEl.textContent = activeTab ? `Saved: ${activeTab.title}` : 'Saved to vault';
        footerStatusEl.className = 'text-emerald-400 font-mono';
      }
    }
  }

  async savePluginSettings() {
    if (this.plugin?.saveData) {
      const current = (await this.plugin?.loadData?.()) || {};
      await this.plugin.saveData(Object.assign({}, current, {
        openTabs: this.tabs,
        activeTabId: this.activeTabId
      }));
    }
  }

  // ==========================================
  // TAB LIFECYCLE & NAVIGATION
  // ==========================================

  async initWorkspaceState() {
    await this.ensureWorkspaceFolder();

    const savedData = (await this.plugin?.loadData?.()) || {};
    let restoredTabs = [];

    if (Array.isArray(savedData.openTabs) && savedData.openTabs.length > 0) {
      for (const tab of savedData.openTabs) {
        const file = this.app?.vault?.getAbstractFileByPath?.(tab.filePath);
        if (file) {
          restoredTabs.push(tab);
        }
      }
    }

    if (restoredTabs.length > 0) {
      this.tabs = restoredTabs;
      this.activeTabId = savedData.activeTabId && this.tabs.some(t => t.id === savedData.activeTabId)
        ? savedData.activeTabId
        : this.tabs[0].id;
    } else {
      // Create initial persistent notes matching the user's view
      const defaultNote1Path = `${WORKSPACE_FOLDER}/Untitled.md`;
      const defaultNote2Path = `${WORKSPACE_FOLDER}/Canvas.md`;

      if (!this.app?.vault?.getAbstractFileByPath?.(defaultNote1Path)) {
        try {
          await this.app?.vault?.create?.(defaultNote1Path, '');
        } catch (e) {}
      }

      if (!this.app?.vault?.getAbstractFileByPath?.(defaultNote2Path)) {
        try {
          await this.app?.vault?.create?.(defaultNote2Path, '');
        } catch (e) {}
      }

      this.tabs = [
        {
          id: 'tab-main-problem',
          title: 'Untitled',
          filePath: defaultNote1Path,
          type: 'problem',
          isManuallyNamed: false
        },
        {
          id: 'tab-main-canvas',
          title: 'Canvas',
          filePath: defaultNote2Path,
          type: 'canvas',
          isManuallyNamed: false
        }
      ];
      this.activeTabId = this.tabs[0].id;
    }

    this.tabHistory = [this.activeTabId];
    this.historyIndex = 0;
  }

  renderTabs() {
    const container = this.contentEl.querySelector('#tabs-container');
    if (!container) return;
    container.innerHTML = '';

    this.tabs.forEach(tab => {
      const isActive = tab.id === this.activeTabId;
      const tabEl = document.createElement('div');
      tabEl.setAttribute('data-tab-id', tab.id);
      tabEl.dataset.tabId = tab.id;

      if (isActive) {
        tabEl.className = 'workspace-tab active-tab flex items-center h-7 px-3 bg-[#24242c] text-white border-t-2 border-purple-500 rounded-t text-xs space-x-2 border-x border-[#333342] shadow-sm select-none';
        tabEl.innerHTML = `
          <span class="w-2 h-2 rounded-full ${tab.type === 'canvas' ? 'bg-purple-400' : 'bg-emerald-400'} flex-shrink-0"></span>
          <span class="font-medium truncate max-w-[140px] tab-title-text" title="Double click to rename">${this.escapeHtml(tab.title)}</span>
          <span class="tab-close-btn" role="button" tabindex="0" title="Close Tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </span>
        `;
      } else {
        tabEl.className = 'workspace-tab inactive-tab group flex items-center h-7 px-2.5 text-[#858896] hover:bg-[#202026] hover:text-white rounded-t text-xs space-x-1.5 cursor-pointer border-t-2 border-transparent transition select-none';
        tabEl.innerHTML = `
          ${tab.type === 'canvas'
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-layout-grid text-[#6d7080] flex-shrink-0"><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect></svg>`
            : `<span class="w-1.5 h-1.5 rounded-full bg-[#626574] flex-shrink-0 group-hover:bg-emerald-400/70"></span>`
          }
          <span class="truncate max-w-[120px] tab-title-text">${this.escapeHtml(tab.title)}</span>
          <span class="tab-close-btn" role="button" tabindex="0" title="Close Tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </span>
        `;
      }

      // Click to switch tab
      tabEl.addEventListener('click', (e) => {
        if (e.target.closest('.tab-close-btn') || e.target.closest('.tab-rename-input')) return;
        this.switchTab(tab.id);
      });

      // Close tab button
      const closeBtn = tabEl.querySelector('.tab-close-btn');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeTab(tab.id);
        });
      }

      // Double-click to rename tab
      const titleSpan = tabEl.querySelector('.tab-title-text');
      if (titleSpan) {
        titleSpan.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          this.enableTabRename(tab, titleSpan);
        });
      }

      container.appendChild(tabEl);
    });
  }

  enableTabRename(tab, spanEl) {
    const currentTitle = tab.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'tab-rename-input';

    const commitRename = async () => {
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== currentTitle) {
        await this.renameTab(tab.id, newTitle);
      } else {
        this.renderTabs();
      }
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        input.blur();
      } else if (e.key === 'Escape') {
        this.renderTabs();
      }
    });

    input.addEventListener('blur', commitRename);

    spanEl.replaceWith(input);
    input.focus();
    input.select();
  }

  async switchTab(tabId) {
    if (tabId === this.activeTabId) return;

    // Commit any pending title rename before leaving
    if (this.renameTimeout) {
      clearTimeout(this.renameTimeout);
      this.renameTimeout = null;
      const currTab = this.tabs.find(t => t.id === this.activeTabId);
      const titleInput = this.contentEl.querySelector('#problem-title-input');
      if (currTab && titleInput) {
        const committedTitle = titleInput.value.trim() || 'Untitled';
        await this.renameTab(currTab.id, committedTitle, true);
      }
    }

    // 1. Immediately save current tab content before leaving
    await this.saveActiveNote();

    // 2. Set new active tab
    this.activeTabId = tabId;
    const targetTab = this.tabs.find(t => t.id === tabId);
    if (!targetTab) return;

    // 3. Update history if not navigating via back/forward
    if (!this.isNavigatingHistory) {
      if (this.historyIndex < this.tabHistory.length - 1) {
        this.tabHistory = this.tabHistory.slice(0, this.historyIndex + 1);
      }
      this.tabHistory.push(tabId);
      this.historyIndex = this.tabHistory.length - 1;
    }

    // 4. Update UI
    this.renderTabs();
    this.updateHistoryButtons();

    // 5. Load note content into workspace
    await this.loadTabNote(targetTab);

    // 6. Save tab states
    await this.savePluginSettings();
  }

  async addNewTab(type = 'problem', customTitle = null, existingFile = null) {
    // Save current active tab first
    await this.saveActiveNote();

    let title = customTitle;
    let filePath = '';

    if (existingFile) {
      title = existingFile.basename;
      filePath = existingFile.path;
    } else {
      if (!title) {
        title = type === 'canvas' ? 'Canvas' : 'Untitled';
      }

      const folder = await this.ensureWorkspaceFolder();
      filePath = `${folder}/${title}.md`;

      // Guarantee unique file path without bulky number suffixes
      let counter = 1;
      while (this.app?.vault?.getAbstractFileByPath?.(filePath)) {
        counter++;
        filePath = `${folder}/${title} ${counter}.md`;
      }
      if (counter > 1) {
        title = `${title} ${counter}`;
      }

      try {
        if (this.app?.vault?.create) {
          await this.app.vault.create(filePath, '');
        }
      } catch (err) {
        console.error('Error creating note file:', err);
      }
    }

    const newTab = {
      id: 'tab-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: title,
      filePath: filePath,
      type: type,
      isManuallyNamed: false
    };

    this.tabs.push(newTab);
    this.activeTabId = newTab.id;

    if (!this.isNavigatingHistory) {
      this.tabHistory.push(newTab.id);
      this.historyIndex = this.tabHistory.length - 1;
    }

    this.renderTabs();
    this.updateHistoryButtons();
    await this.loadTabNote(newTab);
    await this.savePluginSettings();

    // Focus title input so user can type question number immediately
    const titleInput = this.contentEl.querySelector('#problem-title-input');
    if (titleInput) {
      titleInput.focus();
      titleInput.select();
    }

    if (obsidian?.Notice) {
      new obsidian.Notice(`Opened page: ${title}`);
    }

    const qInput = this.contentEl.querySelector('#question-input');
    if (qInput) qInput.focus();
  }

  async closeTab(tabId) {
    const index = this.tabs.findIndex(t => t.id === tabId);
    if (index === -1) return;

    if (this.renameTimeout && this.activeTabId === tabId) {
      clearTimeout(this.renameTimeout);
      this.renameTimeout = null;
    }

    const closingTab = this.tabs[index];

    // Save if closing active
    if (this.activeTabId === tabId) {
      await this.saveActiveNote();
    }

    this.tabs.splice(index, 1);

    // Update history
    this.tabHistory = this.tabHistory.filter(id => id !== tabId);
    if (this.historyIndex >= this.tabHistory.length) {
      this.historyIndex = this.tabHistory.length - 1;
    }

    // If all closed, spawn a fresh Problem 1
    if (this.tabs.length === 0) {
      await this.addNewTab('problem', 'Problem 1');
      return;
    }

    // Switch to neighboring tab if active was closed
    if (this.activeTabId === tabId) {
      const nextTab = this.tabs[Math.min(index, this.tabs.length - 1)];
      this.activeTabId = nextTab.id;
      await this.loadTabNote(nextTab);
    }

    this.renderTabs();
    this.updateHistoryButtons();
    await this.savePluginSettings();

    if (obsidian?.Notice) {
      new obsidian.Notice(`Closed tab: ${closingTab.title}`);
    }
  }

  async renameTab(tabId, newTitle, isManual = false) {
    const tab = this.tabs.find(t => t.id === tabId);
    if (!tab || !newTitle) return;

    if (isManual) {
      tab.isManuallyNamed = true;
    }

    const folder = await this.ensureWorkspaceFolder();
    const oldFile = this.app?.vault?.getAbstractFileByPath?.(tab.filePath);
    const safeFileName = newTitle.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').trim() || 'Untitled';
    const newFilePath = `${folder}/${safeFileName}.md`;

    // Only skip if title matches AND file already matches the newFilePath
    if (tab.title === newTitle && oldFile && oldFile.path === newFilePath) {
      return;
    }

    if (oldFile && this.app?.fileManager?.renameFile && oldFile.path !== newFilePath) {
      let finalFilePath = newFilePath;
      let counter = 1;
      while (
        this.app?.vault?.getAbstractFileByPath?.(finalFilePath) &&
        this.app.vault.getAbstractFileByPath(finalFilePath).path !== oldFile.path
      ) {
        counter++;
        finalFilePath = `${folder}/${safeFileName} ${counter}.md`;
      }

      try {
        await this.app.fileManager.renameFile(oldFile, finalFilePath);
        tab.filePath = finalFilePath;
      } catch (e) {
        console.error('File rename error:', e);
      }
    } else if (!oldFile && this.app?.vault?.create) {
      let finalFilePath = newFilePath;
      let counter = 1;
      while (this.app?.vault?.getAbstractFileByPath?.(finalFilePath)) {
        counter++;
        finalFilePath = `${folder}/${safeFileName} ${counter}.md`;
      }
      tab.filePath = finalFilePath;
      try {
        await this.app.vault.create(finalFilePath, '');
      } catch (e) {}
    }

    tab.title = newTitle;
    if (this.activeTabId === tabId) {
      this.activeNote.title = newTitle;
      this.activeNote.filePath = tab.filePath;
      const titleInput = this.contentEl.querySelector('#problem-title-input');
      if (titleInput && titleInput.value !== newTitle) {
        titleInput.value = newTitle;
      }
      const fileLinkEl = this.contentEl.querySelector('#active-note-file-link');
      if (fileLinkEl) {
        fileLinkEl.textContent = `${newTitle}.md`;
      }
    }

    this.renderTabs();
    await this.savePluginSettings();
    this.queueSave();
  }

  extractQuestionNumberOrTitle(text) {
    if (!text) return null;
    const lines = text.trim().split('\n');
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Pattern 1: "1. Two Sum" or "42. Trapping Rain Water" or "# 1. Two Sum"
      const matchFull = line.match(/^(?:#+\s*)?(?:(?:Problem|LeetCode|LC|No\.?|Question|Q)\s*)?(\d+)[\.\s:\-]+([A-Za-z0-9\s'\-()]+)/i);
      if (matchFull) {
        const num = matchFull[1].trim();
        const name = matchFull[2].trim();
        if (name.length > 0 && name.length <= 40) {
          return `${num}. ${name}`;
        }
        return `${num}`;
      }

      // Pattern 2: Question number at start, e.g. "1." or "42" or "Problem 42" or "Q1" or "#1"
      const matchNum = line.match(/^(?:#+\s*)?(?:(?:Problem|LeetCode|LC|No\.?|Question|Q)\s*)?(\d+)(?:[\.\s:\-]|$)/i);
      if (matchNum) {
        return `${matchNum[1].trim()}`;
      }

      // Pattern 3: Top title header if user typed e.g. "# Two Sum"
      const matchHeader = line.match(/^#+\s+([A-Za-z0-9\s'\-()]+)$/);
      if (matchHeader) {
        const name = matchHeader[1].trim();
        if (name.length > 0 && name.length <= 40) {
          return name;
        }
      }
    }
    return null;
  }

  navigateHistory(direction) {
    if (direction === -1 && this.historyIndex > 0) {
      this.historyIndex--;
      const targetId = this.tabHistory[this.historyIndex];
      if (this.tabs.some(t => t.id === targetId)) {
        this.isNavigatingHistory = true;
        this.switchTab(targetId).then(() => {
          this.isNavigatingHistory = false;
          this.updateHistoryButtons();
        });
      }
    } else if (direction === 1 && this.historyIndex < this.tabHistory.length - 1) {
      this.historyIndex++;
      const targetId = this.tabHistory[this.historyIndex];
      if (this.tabs.some(t => t.id === targetId)) {
        this.isNavigatingHistory = true;
        this.switchTab(targetId).then(() => {
          this.isNavigatingHistory = false;
          this.updateHistoryButtons();
        });
      }
    }
  }

  updateHistoryButtons() {
    const backBtn = this.contentEl.querySelector('#history-back-btn');
    const forwardBtn = this.contentEl.querySelector('#history-forward-btn');

    if (backBtn) {
      const canGoBack = this.historyIndex > 0;
      backBtn.disabled = !canGoBack;
      backBtn.className = canGoBack
        ? 'p-1 text-[#a0a3b5] hover:text-white cursor-pointer transition'
        : 'p-1 text-[#626574] disabled:opacity-40 cursor-default';
    }

    if (forwardBtn) {
      const canGoForward = this.historyIndex < this.tabHistory.length - 1;
      forwardBtn.disabled = !canGoForward;
      forwardBtn.className = canGoForward
        ? 'p-1 text-[#a0a3b5] hover:text-white cursor-pointer transition'
        : 'p-1 text-[#626574] disabled:opacity-40 cursor-default';
    }
  }

  async loadTabNote(tab) {
    if (!tab || !this.app?.vault) return;

    let noteData = null;
    const file = this.app.vault.getAbstractFileByPath(tab.filePath);
    if (file && file instanceof obsidian.TFile) {
      try {
        const raw = await this.app.vault.read(file);
        noteData = this.parseNoteContent(raw, tab.title);
      } catch (e) {
        console.error('Error reading note file:', e);
      }
    }

    if (!noteData) {
      noteData = {
        title: tab.title,
        difficulty: 'Medium',
        language: this.currentLang || 'Python 3',
        question: '',
        approach: '',
        code: '',
        copilotNotes: ''
      };
    }

    this.activeNote = {
      ...noteData,
      filePath: tab.filePath
    };
    this.currentLang = noteData.language || 'Python 3';
    this.currentDifficulty = noteData.difficulty || 'Medium';

    const container = this.contentEl;

    // Title input
    const titleInput = container.querySelector('#problem-title-input');
    if (titleInput) {
      titleInput.value = noteData.title || '';
      titleInput.placeholder = 'Question # or Title...';
    }

    // Difficulty badge
    this.updateDifficultyBadge(this.currentDifficulty);

    // Language select
    const langSelect = container.querySelector('#lang-select');
    if (langSelect) langSelect.value = this.currentLang;

    // Question
    const questionInput = container.querySelector('#question-input');
    const questionCount = container.querySelector('#question-char-count');
    const descView = container.querySelector('#description-view');
    const toggleBtn = container.querySelector('#toggle-desc-view-btn');

    if (questionInput) questionInput.value = noteData.question || '';
    if (questionCount) questionCount.textContent = `${(noteData.question || '').length} chars`;

    if (noteData.question && (noteData.question.includes('<p>') || noteData.question.includes('<div>') || noteData.question.includes('<code>'))) {
      if (descView) {
        descView.innerHTML = noteData.question;
        descView.style.display = 'block';
      }
      if (questionInput) questionInput.style.display = 'none';
      if (toggleBtn) {
        toggleBtn.classList.remove('hidden');
        toggleBtn.textContent = 'Raw Edit';
      }
    } else {
      if (descView) {
        descView.innerHTML = '';
        descView.style.display = 'none';
      }
      if (questionInput) questionInput.style.display = 'block';
      if (toggleBtn) toggleBtn.classList.add('hidden');
    }

    // Approach
    const approachInput = container.querySelector('#approach-input');
    const approachCount = container.querySelector('#approach-char-count');
    if (approachInput) approachInput.value = noteData.approach || '';
    if (approachCount) approachCount.textContent = `${(noteData.approach || '').length} chars`;

    // Code
    const codeEditor = container.querySelector('#code-editor-input');
    if (codeEditor) {
      codeEditor.value = noteData.code || '';
      this.updateCodeLineNumbers();
    }

    // Test cases
    const testCasesToLoad = noteData.testCases || this.extractTestCasesFromQuestion(noteData.question || '');
    this.renderTestCases(testCasesToLoad);
    this.activeNote.testCases = testCasesToLoad;

    // Status and word count
    this.updateWordCount();
    this.showSaveStatus('saved');
  }

  updateDifficultyBadge(diff) {
    const badge = this.contentEl.querySelector('#problem-difficulty-badge');
    if (!badge) return;

    this.currentDifficulty = diff;
    badge.textContent = diff;

    if (diff === 'Easy') {
      badge.className = 'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-pointer select-none transition hover:bg-emerald-500/20';
    } else if (diff === 'Hard') {
      badge.className = 'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer select-none transition hover:bg-rose-500/20';
    } else {
      badge.className = 'px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer select-none transition hover:bg-amber-500/20';
    }
  }

  updateCodeLineNumbers() {
    const lineGutter = this.contentEl?.querySelector('#code-line-numbers');
    const codeEditor = this.contentEl?.querySelector('#code-editor-input');
    if (!lineGutter || !codeEditor) return;
    const count = Math.max(1, (codeEditor.value || '').split('\n').length);
    let html = '';
    for (let i = 1; i <= count; i++) {
      html += `<div>${i}</div>`;
    }
    lineGutter.innerHTML = html;
    lineGutter.scrollTop = codeEditor.scrollTop;
  }

  // ==========================================
  // WORKSPACE RESPONSIVE LAYOUT, SLOTS & DOCKING
  // ==========================================

  renderWorkspaceSlots() {
    const container = this.contentEl;
    if (!container) return;

    const leftCol = container.querySelector('#workspace-left-col');
    const rightCol = container.querySelector('#workspace-right-col');
    const resizerMainCol = container.querySelector('#resizer-main-col');
    const resizerLeftRow = container.querySelector('#resizer-left-row');
    const resizerRightRow = container.querySelector('#resizer-right-row');

    if (!leftCol || !rightCol) return;

    const panels = {
      problem: container.querySelector('#section-problem'),
      editor: container.querySelector('#section-editor'),
      copilot: container.querySelector('#section-copilot'),
      canvas: container.querySelector('#section-canvas')
    };

    const allPanelIds = ['problem', 'editor', 'copilot', 'canvas'];

    // Ensure valid active panels
    const activeLeft = (this.panelSlots.left || []).filter(id => panels[id]);
    const activeRight = (this.panelSlots.right || []).filter(id => panels[id]);
    const activeAll = new Set([...activeLeft, ...activeRight]);

    // 1. Hide inactive panels completely
    allPanelIds.forEach(id => {
      const el = panels[id];
      if (!el) return;
      if (!activeAll.has(id)) {
        el.classList.add('is-panel-hidden');
      } else {
        el.classList.remove('is-panel-hidden');
      }
    });

    // 2. Left column should never be completely empty if right has panels
    if (activeLeft.length === 0 && activeRight.length > 0) {
      activeLeft.push(activeRight.shift());
      this.panelSlots.left = activeLeft;
      this.panelSlots.right = activeRight;
    }

    // 3. Arrange Left Column
    if (activeLeft.length === 1) {
      const p1 = panels[activeLeft[0]];
      leftCol.appendChild(p1);
      p1.style.flex = '1 1 100%';
      if (resizerLeftRow) resizerLeftRow.classList.add('is-panel-hidden');
    } else if (activeLeft.length >= 2) {
      const p1 = panels[activeLeft[0]];
      const p2 = panels[activeLeft[1]];
      leftCol.appendChild(p1);
      if (resizerLeftRow) {
        resizerLeftRow.classList.remove('is-panel-hidden');
        leftCol.appendChild(resizerLeftRow);
      }
      leftCol.appendChild(p2);
      const topH = this.layoutSizes.leftTopHeight || 50;
      p1.style.flex = `0 0 ${topH}%`;
      p2.style.flex = '1 1 0%';
    }

    // 4. Arrange Right Column
    if (activeRight.length === 0) {
      rightCol.classList.add('is-panel-hidden');
      if (resizerMainCol) resizerMainCol.classList.add('is-panel-hidden');
      leftCol.style.flex = '1 1 100%';
    } else {
      rightCol.classList.remove('is-panel-hidden');
      if (resizerMainCol) resizerMainCol.classList.remove('is-panel-hidden');
      const leftColW = this.layoutSizes.leftColWidth || 50;
      leftCol.style.flex = `0 0 ${leftColW}%`;
      rightCol.style.flex = '1 1 0%';

      if (activeRight.length === 1) {
        const p1 = panels[activeRight[0]];
        rightCol.appendChild(p1);
        p1.style.flex = '1 1 100%';
        if (resizerRightRow) resizerRightRow.classList.add('is-panel-hidden');
      } else if (activeRight.length >= 2) {
        const p1 = panels[activeRight[0]];
        const p2 = panels[activeRight[1]];
        rightCol.appendChild(p1);
        if (resizerRightRow) {
          resizerRightRow.classList.remove('is-panel-hidden');
          rightCol.appendChild(resizerRightRow);
        }
        rightCol.appendChild(p2);
        const topH = this.layoutSizes.rightTopHeight || 50;
        p1.style.flex = `0 0 ${topH}%`;
        p2.style.flex = '1 1 0%';
      }
    }

    // 5. Update Toggle Buttons in top bar
    const editorBtn = container.querySelector('#toggle-panel-editor');
    const copilotBtn = container.querySelector('#toggle-panel-copilot');
    const canvasBtn = container.querySelector('#toggle-panel-canvas');

    if (editorBtn) editorBtn.classList.toggle('is-active', activeAll.has('editor'));
    if (copilotBtn) copilotBtn.classList.toggle('is-active', activeAll.has('copilot'));
    if (canvasBtn) canvasBtn.classList.toggle('is-active', activeAll.has('canvas'));

    // Question vs Approach split inside Problem quadrant
    const questionPart = container.querySelector('#question-part');
    const approachPart = container.querySelector('#approach-part');
    const resizerQA = container.querySelector('#resizer-question-approach');
    if (questionPart && approachPart) {
      questionPart.style.flex = `0 0 ${this.layoutSizes.questionHeight || 50}%`;
      approachPart.style.flex = '1 1 0%';
    }

    try {
      window.dispatchEvent(new Event('resize'));
    } catch (e) {}
  }

  movePanelToOtherColumn(panelId) {
    const inLeft = this.panelSlots.left.indexOf(panelId);
    const inRight = this.panelSlots.right.indexOf(panelId);

    if (inLeft !== -1) {
      this.panelSlots.left.splice(inLeft, 1);
      this.panelSlots.right.push(panelId);
      if (this.panelSlots.left.length === 0 && this.panelSlots.right.length > 1) {
        this.panelSlots.left.push(this.panelSlots.right.shift());
      }
    } else if (inRight !== -1) {
      this.panelSlots.right.splice(inRight, 1);
      this.panelSlots.left.push(panelId);
      if (this.panelSlots.left.length > 2) {
        this.panelSlots.right.push(this.panelSlots.left.shift());
      }
    }

    this.renderWorkspaceSlots();
  }

  setupDragAndDropDocking(container) {
    const leftCol = container.querySelector('#workspace-left-col');
    const rightCol = container.querySelector('#workspace-right-col');
    if (!leftCol || !rightCol) return;

    let draggedPanelId = null;

    container.querySelectorAll('.section-drag-handle').forEach(handle => {
      handle.addEventListener('dragstart', (e) => {
        draggedPanelId = handle.getAttribute('data-panel');
        if (!draggedPanelId) return;

        e.dataTransfer.setData('text/plain', draggedPanelId);
        e.dataTransfer.effectAllowed = 'move';

        const section = container.querySelector(`#section-${draggedPanelId}`);
        if (section) section.classList.add('is-drag-source');

        // If right column is empty, temporarily show it with a drop placeholder
        if (this.panelSlots.right.length === 0) {
          rightCol.classList.remove('is-panel-hidden');
          rightCol.style.flex = '0 0 50%';
          leftCol.style.flex = '0 0 50%';
          const dropPlaceholder = document.createElement('div');
          dropPlaceholder.id = 'temp-right-drop-placeholder';
          dropPlaceholder.className = 'empty-col-drop-target';
          dropPlaceholder.innerHTML = '<span>Drop here to dock on Right Side</span>';
          rightCol.appendChild(dropPlaceholder);
        }
      });

      handle.addEventListener('dragend', () => {
        container.querySelectorAll('.workspace-quadrant').forEach(q => {
          q.classList.remove('is-drag-source', 'drag-hover-top', 'drag-hover-bottom');
        });
        leftCol.classList.remove('drag-hover-col');
        rightCol.classList.remove('drag-hover-col');

        const tempPlaceholder = container.querySelector('#temp-right-drop-placeholder');
        if (tempPlaceholder) tempPlaceholder.remove();

        draggedPanelId = null;
        this.renderWorkspaceSlots();
      });
    });

    container.querySelectorAll('.section-dock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = btn.getAttribute('data-panel');
        if (pId) this.movePanelToOtherColumn(pId);
      });
    });

    leftCol.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      leftCol.classList.add('drag-hover-col');
    });

    leftCol.addEventListener('dragleave', (e) => {
      if (!leftCol.contains(e.relatedTarget)) {
        leftCol.classList.remove('drag-hover-col');
      }
    });

    leftCol.addEventListener('drop', (e) => {
      e.preventDefault();
      leftCol.classList.remove('drag-hover-col');
      const pId = draggedPanelId || e.dataTransfer.getData('text/plain');
      if (!pId) return;

      const inL = this.panelSlots.left.indexOf(pId);
      const inR = this.panelSlots.right.indexOf(pId);
      if (inL !== -1) this.panelSlots.left.splice(inL, 1);
      if (inR !== -1) this.panelSlots.right.splice(inR, 1);

      const rect = leftCol.getBoundingClientRect();
      const isTop = (e.clientY - rect.top) < (rect.height / 2);
      if (isTop) {
        this.panelSlots.left.unshift(pId);
      } else {
        this.panelSlots.left.push(pId);
      }

      if (this.panelSlots.left.length > 2) {
        const excess = this.panelSlots.left.pop();
        this.panelSlots.right.unshift(excess);
      }

      this.renderWorkspaceSlots();
    });

    rightCol.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      rightCol.classList.add('drag-hover-col');
    });

    rightCol.addEventListener('dragleave', (e) => {
      if (!rightCol.contains(e.relatedTarget)) {
        rightCol.classList.remove('drag-hover-col');
      }
    });

    rightCol.addEventListener('drop', (e) => {
      e.preventDefault();
      rightCol.classList.remove('drag-hover-col');
      const tempPlaceholder = container.querySelector('#temp-right-drop-placeholder');
      if (tempPlaceholder) tempPlaceholder.remove();

      const pId = draggedPanelId || e.dataTransfer.getData('text/plain');
      if (!pId) return;

      const inL = this.panelSlots.left.indexOf(pId);
      const inR = this.panelSlots.right.indexOf(pId);
      if (inL !== -1) this.panelSlots.left.splice(inL, 1);
      if (inR !== -1) this.panelSlots.right.splice(inR, 1);

      if (this.panelSlots.left.length === 0 && this.panelSlots.right.length > 0) {
        this.panelSlots.left.push(this.panelSlots.right.shift());
      }

      const rect = rightCol.getBoundingClientRect();
      const isTop = (e.clientY - rect.top) < (rect.height / 2);
      if (isTop) {
        this.panelSlots.right.unshift(pId);
      } else {
        this.panelSlots.right.push(pId);
      }

      if (this.panelSlots.right.length > 2) {
        const excess = this.panelSlots.right.pop();
        this.panelSlots.left.push(excess);
      }

      this.renderWorkspaceSlots();
    });
  }

  setupDraggableResizer({ resizerEl, orientation, minPercent = 15, maxPercent = 85, onResize }) {
    if (!resizerEl) return;

    let isDragging = false;
    let containerSize = 0;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const firstEl = resizerEl.previousElementSibling;
      const secondEl = resizerEl.nextElementSibling;
      const parentEl = resizerEl.parentElement;
      if (!firstEl || !secondEl || !parentEl) return;

      isDragging = true;
      resizerEl.classList.add('is-dragging');
      document.body.classList.add('workspace-is-resizing');

      const parentRect = parentEl.getBoundingClientRect();
      containerSize = orientation === 'vertical' ? parentRect.width : parentRect.height;

      const onMouseMove = (ev) => {
        if (!isDragging || containerSize <= 0) return;
        ev.preventDefault();

        const currentRect = parentEl.getBoundingClientRect();
        const currentPos = orientation === 'vertical'
          ? (ev.clientX - currentRect.left)
          : (ev.clientY - currentRect.top);

        let percent = (currentPos / containerSize) * 100;
        percent = Math.max(minPercent, Math.min(maxPercent, percent));

        firstEl.style.flex = `0 0 ${percent}%`;
        secondEl.style.flex = '1 1 0%';

        if (typeof onResize === 'function') {
          onResize(percent);
        }
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        resizerEl.classList.remove('is-dragging');
        document.body.classList.remove('workspace-is-resizing');

        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);

        try {
          window.dispatchEvent(new Event('resize'));
        } catch (err) {}
      };

      window.addEventListener('mousemove', onMouseMove, { passive: false });
      window.addEventListener('mouseup', onMouseUp);
    };

    resizerEl.addEventListener('mousedown', onMouseDown);
  }

  setupTestRunnerResizer(resizerEl, editorBody, testRunnerPanel) {
    if (!resizerEl || !editorBody || !testRunnerPanel) return;

    let isDragging = false;
    let startY = 0;
    let startHeight = 0;

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      resizerEl.classList.add('is-dragging');
      document.body.classList.add('workspace-is-resizing');

      startY = e.clientY;
      startHeight = testRunnerPanel.getBoundingClientRect().height;

      window.addEventListener('mousemove', onMouseMove, { passive: false });
      window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();

      const deltaY = startY - e.clientY;
      const newHeight = Math.max(60, Math.min(420, startHeight + deltaY));
      testRunnerPanel.style.height = `${newHeight}px`;
    };

    const onMouseUp = () => {
      if (!isDragging) return;
      isDragging = false;
      resizerEl.classList.remove('is-dragging');
      document.body.classList.remove('workspace-is-resizing');

      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      try {
        window.dispatchEvent(new Event('resize'));
      } catch (e) {}
    };

    resizerEl.addEventListener('mousedown', onMouseDown);
  }

  setupToggleButtons(container) {
    const toggles = [
      {
        id: '#toggle-panel-editor',
        panel: 'editor',
        title: 'Code Area & Test Runner',
        desc: 'Write or paste solutions, choose languages (Python, C++, Java, JS, Rust), and run test cases locally.'
      },
      {
        id: '#toggle-panel-copilot',
        panel: 'copilot',
        title: 'AI Helper & Mentor',
        desc: 'Interactive AI tutor for Socratic algorithmic clues, complexity analysis, and edge cases.'
      },
      {
        id: '#toggle-panel-canvas',
        panel: 'canvas',
        title: 'Whiteboard & Architecture',
        desc: 'Infinite canvas for visual problem diagramming, trees, graphs, and system design notes.'
      }
    ];

    const tooltipEl = container.querySelector('#workspace-floating-tooltip');

    toggles.forEach(item => {
      const btn = container.querySelector(item.id);
      if (!btn) return;

      const isPanelOpen = () => {
        return (this.panelSlots.left.includes(item.panel) || this.panelSlots.right.includes(item.panel));
      };

      const updateTooltipContent = () => {
        if (!tooltipEl) return;
        const open = isPanelOpen();
        tooltipEl.innerHTML = `
          <div class="tooltip-title">
            <span>${item.title}</span>
          </div>
          <div class="tooltip-desc">${item.desc}</div>
          <div class="tooltip-status">${open ? '● Active (Click to hide)' : '○ Inactive (Click to show)'}</div>
        `;
      };

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pId = item.panel;
        const inLeft = this.panelSlots.left.indexOf(pId);
        const inRight = this.panelSlots.right.indexOf(pId);

        if (inLeft !== -1 || inRight !== -1) {
          if (inLeft !== -1) this.panelSlots.left.splice(inLeft, 1);
          if (inRight !== -1) this.panelSlots.right.splice(inRight, 1);

          if (this.panelSlots.left.length === 0 && this.panelSlots.right.length > 0) {
            this.panelSlots.left.push(this.panelSlots.right.shift());
          }

          // Auto-align: if total panels === 2, align tool below question in left col
          const allActive = [...this.panelSlots.left, ...this.panelSlots.right];
          if (allActive.length === 2 && this.panelSlots.right.length === 1 && this.panelSlots.left.length === 1) {
            this.panelSlots.left.push(this.panelSlots.right.shift());
          }
        } else {
          // Add panel: if left has < 2, add to left (below question)
          if (this.panelSlots.left.length < 2) {
            this.panelSlots.left.push(pId);
          } else if (this.panelSlots.right.length < 2) {
            // Otherwise, add to right-hand side
            this.panelSlots.right.push(pId);
          } else {
            this.panelSlots.right[1] = pId;
          }
        }

        this.renderWorkspaceSlots();
        updateTooltipContent();
      });

      btn.addEventListener('mouseenter', () => {
        if (!tooltipEl) return;
        updateTooltipContent();
        tooltipEl.classList.add('is-visible');

        const rect = btn.getBoundingClientRect();
        const tooltipWidth = 260;
        let left = rect.left + rect.width / 2 - tooltipWidth / 2;
        if (left + tooltipWidth > window.innerWidth - 12) {
          left = window.innerWidth - tooltipWidth - 12;
        }
        if (left < 12) left = 12;

        tooltipEl.style.left = `${left}px`;
        tooltipEl.style.top = `${rect.bottom + 8}px`;
      });

      btn.addEventListener('mouseleave', () => {
        if (tooltipEl) tooltipEl.classList.remove('is-visible');
      });
    });
  }

  // ==========================================
  // VIEW RENDERING
  // ==========================================

  async onOpen() {
    await this.initWorkspaceState();
    getLeetCodeProblemList(); // Prefetch problem list in background

    const container = this.contentEl;
    container.empty();
    container.addClass('leetcode-workspace-view');

    container.innerHTML = `
      <!-- Tab Bar Top -->
      <div class="h-9 bg-[#17171b] border-b border-[#2d2d38] flex items-center justify-between px-2 flex-shrink-0" data-purpose="tab-header">
        <div class="flex items-center h-full space-x-1 overflow-x-auto" id="workspace-tab-bar">
          <button id="history-back-btn" class="p-1 text-[#626574] hover:text-white disabled:opacity-40 transition" disabled title="History Back">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"></path></svg>
          </button>
          <button id="history-forward-btn" class="p-1 text-[#626574] hover:text-white disabled:opacity-40 transition" disabled title="History Forward">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"></path></svg>
          </button>
          
          <!-- Dynamic Tabs Container -->
          <div class="flex items-center h-full space-x-1" id="tabs-container"></div>

          <!-- Add New Page Button -->
          <button id="new-tab-btn" class="p-1 text-[#6d7080] hover:text-white hover:bg-[#25252e] rounded ml-1 transition" title="Add new page (+)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
          </button>
        </div>

        <!-- Right Tab Actions -->
        <div class="flex items-center space-x-2 text-[#7e8292]">
          <!-- 3 Panel Toggle Buttons: Code Area, AI Helper, Whiteboard -->
          <div class="workspace-toggle-group" id="workspace-panel-toggles">
            <button id="toggle-panel-editor" class="workspace-toggle-btn" data-panel="editor">
              <span class="toggle-dot"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              <span>Code Area</span>
            </button>
            <button id="toggle-panel-copilot" class="workspace-toggle-btn" data-panel="copilot">
              <span class="toggle-dot"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path></svg>
              <span>AI Helper</span>
            </button>
            <button id="toggle-panel-canvas" class="workspace-toggle-btn" data-panel="canvas">
              <span class="toggle-dot"></span>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-tool"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"></path><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"></path><circle cx="11" cy="11" r="2"></circle></svg>
              <span>Whiteboard</span>
            </button>
          </div>

          <div class="h-4 w-[1px] bg-[#333342] mx-1"></div>

          <span class="text-[11px] px-2 py-0.5 bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 rounded font-mono select-none hidden lg:inline-block">LeetCode Sync: Ready</span>
          
          <button id="open-vault-note-btn" class="px-2 py-1 hover:text-white hover:bg-[#2b2b36] rounded text-[11px] text-[#9fa2b4] flex items-center gap-1.5 transition" title="Open any note from vault">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-folder-open"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"></path></svg>
            <span class="hidden sm:inline">Open Note</span>
          </button>

          <button id="new-page-btn" class="px-2 py-1 bg-purple-900/40 hover:bg-purple-800/50 text-purple-300 border border-purple-600/30 rounded text-[11px] flex items-center gap-1.5 transition" title="Create a new problem page">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-plus"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M9 15h6"></path><path d="M12 12v6"></path></svg>
            <span class="hidden sm:inline">+ Page</span>
          </button>

          <button class="p-1 hover:text-white hover:bg-[#2b2b36] rounded transition" title="More Options">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-more-horizontal"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
          </button>
        </div>
      </div>

      <!-- WORKSPACE CONTAINER WITH DRAGGABLE SPLITS -->
      <div class="four-quadrant-workspace" id="main-workspace-grid" data-purpose="four-quadrant-workspace">
        
        <!-- ======================================================== -->
        <!-- LEFT COLUMN: Problem & Approach, plus optional Code Area -->
        <!-- ======================================================== -->
        <div class="workspace-col" id="workspace-left-col">
          <!-- QUADRANT 1: Problem & Approach (Question + Thinking) -->
          <section class="workspace-quadrant" id="section-problem">
            <!-- Problem Quadrant Header -->
            <div class="h-10 bg-[#16161c] px-3.5 border-b border-[#262633] flex items-center justify-between flex-shrink-0">
              <div class="flex items-center space-x-2">
                <span id="problem-difficulty-badge" class="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-pointer select-none transition hover:bg-amber-500/20" title="Click to cycle Easy / Medium / Hard">Medium</span>
                <div class="flex items-center group relative" id="problem-title-group">
                  <input
                    id="problem-title-input"
                    type="text"
                    autocomplete="off"
                    class="bg-transparent hover:bg-[#20202c] focus:bg-[#181822] text-white font-semibold text-xs px-2 py-0.5 rounded border border-transparent hover:border-[#38384a] focus:border-purple-500 focus:outline-none transition max-w-[190px] truncate"
                    placeholder="Question # or Title..."
                    value=""
                    title="Type question number or title to search LeetCode"
                  />
                  <button id="rename-title-btn" class="text-[#7c8094] hover:text-purple-300 p-1 rounded transition" title="Search LeetCode questions">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                  </button>

                  <!-- LeetCode Auto-Suggest Dropdown List -->
                  <div id="leetcode-suggest-dropdown" class="leetcode-dropdown-menu hidden" role="listbox">
                    <div class="p-1.5 border-b border-[#2d2d3e] text-[10px] text-[#787b8e] font-mono flex items-center justify-between px-2.5">
                      <span>LeetCode Questions</span>
                      <span id="suggest-count" class="text-purple-400">0 found</span>
                    </div>
                    <div id="suggest-items-container" class="overflow-y-auto max-h-60 py-1"></div>
                  </div>
                </div>

                <!-- Dedicated LeetCode Fetch UI Container -->
                <div class="leetcode-fetch-container flex items-center space-x-1.5 ml-1">
                  <input 
                    type="number" 
                    id="leetcode-id-input" 
                    placeholder="Enter ID (e.g. 1)" 
                    min="1"
                  />
                  <button id="leetcode-fetch-btn" type="button" class="workspace-action-btn workspace-btn-primary">
                    Fetch Data
                  </button>
                </div>
              </div>
              <div class="flex items-center space-x-1.5">
                <div class="flex items-center space-x-1" id="problem-tabs">
                  <button class="tab-btn px-2.5 py-1 rounded-md text-[11px] bg-[#242430] text-purple-300 font-medium shadow-sm transition" data-tab="desc">Description</button>
                  <button class="tab-btn px-2 py-1 rounded-md text-[11px] text-[#7d8095] hover:text-white transition" data-tab="edit">Editorial</button>
                  <button class="tab-btn px-2 py-1 rounded-md text-[11px] text-[#7d8095] hover:text-white transition" data-tab="sub">Submissions</button>
                </div>
                <div class="workspace-dock-group flex items-center space-x-0.5">
                  <button class="section-dock-btn" data-panel="problem" title="Switch Side (Dock to other column)">⇄</button>
                  <div class="section-drag-handle" draggable="true" data-panel="problem" title="Drag to reorder or dock">⋮⋮</div>
                </div>
              </div>
            </div>

            <!-- Divided 2-Part Container: Top is Question, Bottom is Approach -->
            <div class="quadrant-split-container">
              <!-- PART 1: Question Section (Blank & Typable) -->
              <div class="quadrant-split-part bg-[#18181f]" id="question-part">
                <div class="px-3 py-1.5 bg-[#16161c] border-b border-[#242430] flex items-center justify-between flex-shrink-0 text-xs">
                  <div class="flex items-center space-x-2">
                    <span class="font-medium text-[#c0c3cf] flex items-center gap-1.5 text-[11px]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-help-circle text-amber-400"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>
                      Question
                    </span>
                    <span id="question-fetch-loader" class="hidden text-[10.5px] text-purple-400 font-mono animate-pulse">Fetching LeetCode...</span>
                  </div>
                  <div class="flex items-center space-x-2 text-[10px]">
                    <span class="text-[#686a79] font-mono" id="question-char-count">0 chars</span>
                    <button id="toggle-desc-view-btn" class="hidden text-purple-400 hover:text-purple-300 transition">Raw Edit</button>
                    <button id="fetch-question-btn" type="button" title="Fetch LeetCode problem from number in this box">Fetch</button>
                    <button id="clear-question-btn" class="text-[#7d8095] hover:text-white transition">Clear</button>
                  </div>
                </div>
                <div id="description-view" class="workspace-description-view flex-1 overflow-y-auto p-3.5 text-[#c2c5d1] text-xs leading-relaxed select-text" style="display: none;"></div>
                <textarea id="question-input" class="workspace-textarea text-[#c2c5d1]" spellcheck="false" placeholder="Enter LeetCode question number (e.g., 1) and press Enter to fetch, or paste your question here..."></textarea>
              </div>

              <!-- DRAGGABLE RESIZER: Question vs Thinking -->
              <div class="workspace-resizer-horizontal" id="resizer-question-approach" title="Drag to resize Question and Thinking">
                <div class="resizer-grip-h"></div>
              </div>

              <!-- PART 2: Approach Section (Blank & Typable) -->
              <div class="quadrant-split-part bg-[#18181f]" id="approach-part">
                <div class="flex items-center justify-between px-3 py-1.5 bg-[#16161c] border-b border-[#242430] flex-shrink-0 text-xs">
                  <div class="flex items-center space-x-2 text-purple-300 font-semibold text-[11px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bookmark"><path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"></path></svg>
                    <span>Obsidian Intuition Card</span>
                  </div>
                  <div class="flex items-center space-x-2 text-[10px]">
                    <span class="text-[#686a79] font-mono" id="approach-char-count">0 chars</span>
                    <button id="clear-approach-btn" class="text-[#7d8095] hover:text-white transition">Clear</button>
                  </div>
                </div>
                <textarea id="approach-input" class="workspace-textarea text-[#a9acc0]" spellcheck="false" placeholder="Write your intuition, thought process, edge cases, time/space complexity notes here..."></textarea>
              </div>
            </div>
          </section>

          <!-- DRAGGABLE RESIZER: Left Column Row Split -->
          <div class="workspace-resizer-horizontal is-panel-hidden" id="resizer-left-row" title="Drag to resize sections">
            <div class="resizer-grip-h"></div>
          </div>

          <!-- QUADRANT 3: Code Editor & Runner -->
          <section class="workspace-quadrant is-panel-hidden" id="section-editor">
            <div class="h-10 bg-[#16161c] px-3.5 border-b border-[#262633] flex items-center justify-between flex-shrink-0">
              <div class="flex items-center space-x-2.5">
                <select id="lang-select" class="bg-[#20202a] text-purple-300 text-[11px] font-mono rounded-lg px-2.5 py-1 border border-[#333342] focus:outline-none cursor-pointer">
                  <option value="Python 3">Python 3</option>
                  <option value="C++ (clang 17)">C++ (clang 17)</option>
                  <option value="Java 21">Java 21</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript (Node 20)">TypeScript (Node 20)</option>
                  <option value="Rust 1.75">Rust 1.75</option>
                </select>
                <div id="autosave-status" class="flex items-center select-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle text-emerald-400 mr-1"><path d="M21.801 10A10 10 0 1 1 17 3.335"></path><path d="m9 11 3 3L22 4"></path></svg>
                  <span class="text-[#636677] font-mono text-[10.5px]">Auto-saved</span>
                </div>
              </div>
              <div class="flex items-center space-x-1.5">
                <button class="workspace-icon-btn" id="format-code-btn" title="Format Code">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-align-left"><path d="M21 5H3"></path><path d="M15 12H3"></path><path d="M17 19H3"></path></svg>
                </button>
                <button class="workspace-icon-btn" id="reset-code-btn" title="Reset to LeetCode default code definition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
                <div class="workspace-header-separator"></div>
                <button id="run-code-btn" class="workspace-action-btn workspace-btn-secondary" title="Run test cases">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
                  <span>Run</span>
                </button>
                <button id="submit-code-btn" class="workspace-action-btn workspace-btn-primary" title="Submit solution">
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  <span>Submit</span>
                </button>
                <div class="workspace-header-separator"></div>
                <div class="workspace-dock-group flex items-center space-x-0.5">
                  <button class="section-dock-btn" data-panel="editor" title="Switch Side (Dock to other column)">⇄</button>
                  <div class="section-drag-handle" draggable="true" data-panel="editor" title="Drag to reorder or dock">⋮⋮</div>
                </div>
              </div>
            </div>
            <!-- Code Editor Body -->
            <div class="flex-1 overflow-hidden font-mono text-[12px] bg-[#141419] flex" id="editor-body-container" data-purpose="code-editor-lines">
              <div id="code-line-numbers" class="py-3 pl-2.5 pr-2 text-right text-[#56596b] select-none border-r border-[#242430] text-[11.5px] font-mono leading-relaxed min-w-[34px] overflow-hidden">1</div>
              <textarea id="code-editor-input" class="w-full h-full bg-transparent text-[#e0e2ec] font-mono text-[11.5px] p-3 pl-2.5 resize-none focus:outline-none leading-relaxed" spellcheck="false" placeholder="Write or paste your code solution here. Automatically saved to your note..."></textarea>
            </div>

            <!-- DRAGGABLE RESIZER: Code vs Test Runner -->
            <div class="workspace-resizer-horizontal" id="resizer-test-runner" title="Drag to resize Test Cases">
              <div class="resizer-grip-h"></div>
            </div>

            <!-- Test Case Runner Panel -->
            <div class="h-28 bg-[#16161c] border-t border-[#262633] flex flex-col flex-shrink-0" id="test-runner-panel" data-purpose="test-case-runner">
              <div class="h-7 px-3 bg-[#131317] border-b border-[#242430] flex items-center justify-between text-[11px]">
                <div class="flex items-center space-x-2" id="case-tabs">
                  <button class="case-btn px-2.5 py-0.5 rounded-md bg-[#20202a] text-[#a0a3b2] font-semibold border border-[#2d2d3c] flex items-center gap-1.5" data-case="1">
                    Case 1
                  </button>
                  <button class="case-btn px-2 py-0.5 rounded-md text-[#7e8293] hover:text-white transition" data-case="2">Case 2</button>
                  <button class="case-btn-add px-2 py-0.5 rounded-md text-purple-400 hover:text-purple-300 hover:bg-[#20202a] transition flex items-center gap-1" id="add-test-case-btn" title="Add another test case">
                    + Custom Test
                  </button>
                </div>
                <div class="text-[10.5px] text-[#7e8293] font-mono font-medium" id="test-runner-status">Ready to run</div>
              </div>
              <div class="p-2 px-3.5 overflow-y-auto font-mono text-[11px] space-y-1 text-[#babdc9]" id="test-output-panel">
                <span class="text-[#5b5d6e]">Test cases and execution output will appear here.</span>
              </div>
            </div>
          </section>
        </div>

        <!-- DRAGGABLE RESIZER: Left Column vs Right Column -->
        <div class="workspace-resizer-vertical is-panel-hidden" id="resizer-main-col" title="Drag to resize columns">
          <div class="resizer-grip-v"></div>
        </div>

        <!-- ======================================================== -->
        <!-- RIGHT COLUMN: AI Help, Whiteboard Architecture           -->
        <!-- ======================================================== -->
        <div class="workspace-col is-panel-hidden" id="workspace-right-col">
          <!-- QUADRANT 2: AI Help -->
          <section class="workspace-quadrant is-panel-hidden" id="section-copilot">
            <div class="h-10 bg-[#16161c] px-3.5 border-b border-[#262633] flex items-center justify-between flex-shrink-0">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span class="font-semibold text-white text-xs flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles text-purple-400"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
                  AI Help
                </span>
                <!-- Custom API Configuration Button -->
                <button id="copilot-key-btn" class="flex items-center gap-1.5 px-2.5 py-1 text-xs text-[#b8bbce] hover:text-white bg-[#20202a] hover:bg-[#282836] border border-[#343446] rounded-md transition shadow-sm" title="Configure Custom API Key & Model">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key text-purple-400"><circle cx="7.5" cy="15.5" r="5.5"></circle><path d="m21 2-9.6 9.6"></path><path d="m15.5 7.5 3 3L22 7l-3-3"></path></svg>
                  <span class="text-[11px] font-medium">Custom API</span>
                </button>
              </div>
              <div class="flex items-center space-x-1.5 text-[#7e8292]">
                <button class="p-1 hover:text-white hover:bg-[#252530] rounded-md transition" id="clear-chat-btn" title="Clear Context">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
                <button class="p-1 hover:text-white hover:bg-[#252530] rounded-md transition" id="pin-copilot-btn" title="Pin AI notes to markdown note">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pin"><path d="M12 17v5"></path><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"></path></svg>
                </button>
                <div class="workspace-header-separator"></div>
                <div class="workspace-dock-group flex items-center space-x-0.5">
                  <button class="section-dock-btn" data-panel="copilot" title="Switch Side (Dock to other column)">⇄</button>
                  <div class="section-drag-handle" draggable="true" data-panel="copilot" title="Drag to reorder or dock">⋮⋮</div>
                </div>
              </div>
            </div>
            <!-- Quick Prompt Chips -->
            <div class="px-3 py-1.5 bg-[#15151a] border-b border-[#242430] flex items-center space-x-1.5 overflow-x-auto flex-shrink-0" id="prompt-chips">
              <button class="prompt-chip whitespace-nowrap px-2.5 py-1 bg-[#20202a] hover:bg-purple-900/40 text-[11px] text-purple-300 border border-purple-500/20 rounded-full transition flex items-center gap-1" data-prompt="Socratic Hint 1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lightbulb"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>
                Socratic Hint 1
              </button>
              <button class="prompt-chip whitespace-nowrap px-2.5 py-1 bg-[#20202a] hover:bg-[#292936] text-[11px] text-[#9fa2af] rounded-full transition border border-transparent hover:border-[#38384a]" data-prompt="Explain Data Structure">
                Explain Data Structure
              </button>
              <button class="prompt-chip whitespace-nowrap px-2.5 py-1 bg-[#20202a] hover:bg-[#292936] text-[11px] text-[#9fa2af] rounded-full transition border border-transparent hover:border-[#38384a]" data-prompt="Dry run example">
                Dry run example
              </button>
            </div>
            <!-- Chat Messages Container -->
            <div class="flex-1 overflow-y-auto p-3.5 space-y-3" id="chat-messages-container" data-purpose="chat-messages"></div>
            <!-- Chat Input Bar -->
            <div class="p-2.5 bg-[#15151a] border-t border-[#262633] flex-shrink-0">
              <div class="relative flex items-center bg-[#1b1b22] border border-purple-500/30 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/30 transition-all duration-200 px-3 py-1.5 shadow-lg shadow-black/30 rounded-full">
                <span class="text-purple-400 mr-2 flex-shrink-0 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
                </span>
                <input id="chat-input" class="w-full bg-transparent px-1 py-1 text-xs text-white placeholder-[#7c8094] focus:outline-none rounded-full" placeholder="Ask for an intuition clue, edge case test, or complexity note..." type="text">
                <div class="flex items-center space-x-1.5 ml-2 flex-shrink-0">
                  <button id="send-chat-btn" class="h-7 px-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-[11px] transition shadow-md shadow-purple-900/30 flex items-center justify-center gap-1 rounded-full" title="Send message">
                    <span class="text-[10px] hidden sm:inline">Ask</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-send"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- DRAGGABLE RESIZER: Right Column Row Split -->
          <div class="workspace-resizer-horizontal is-panel-hidden" id="resizer-right-row" title="Drag to resize sections">
            <div class="resizer-grip-h"></div>
          </div>

          <!-- QUADRANT 4: Whiteboard Architecture Canvas -->
          <section class="workspace-quadrant relative is-panel-hidden" id="section-canvas">
            <div class="h-10 bg-[#141419] px-3.5 border-b border-[#242430] flex items-center justify-between flex-shrink-0 z-10">
              <div class="flex items-center space-x-2">
                <span class="font-semibold text-white text-xs flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pen-tool text-amber-400"><path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"></path><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"></path><path d="m2.3 2.3 7.286 7.286"></path><circle cx="11" cy="11" r="2"></circle></svg>
                  Whiteboard &amp; Architecture
                </span>
                <span class="text-[10px] text-[#717485] font-mono px-2 py-0.5 bg-[#1e1e26] rounded-full border border-[#2a2a36]">Infinite Canvas</span>
              </div>
              <div class="flex items-center space-x-1.5">
                <div class="workspace-dock-group flex items-center space-x-1 text-[#8b8e9f]">
                  <button class="p-1 hover:text-white bg-[#262633] text-purple-300 rounded-md transition" id="canvas-tool-pen" title="Pen Tool"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg></button>
                  <button class="p-1 hover:text-white hover:bg-[#262633] rounded-md transition" id="canvas-tool-card" title="Add Sticky Card"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sticky-note text-amber-300"><path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"></path><path d="M15 3v5a1 1 0 0 0 1 1h5"></path></svg></button>
                  <button class="p-1 hover:text-white hover:bg-[#262633] rounded-md transition" title="Rectangle"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-square"><rect width="18" height="18" x="3" y="3" rx="2"></rect></svg></button>
                  <button class="p-1 hover:text-white hover:bg-[#262633] rounded-md transition" title="Eraser"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eraser"><path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"></path><path d="m5.082 11.09 8.828 8.828"></path></svg></button>
                  <div class="workspace-header-separator"></div>
                  <button class="p-1 hover:text-red-400 hover:bg-[#262633] rounded-md transition" id="clear-canvas-btn" title="Clear Canvas"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M10 11v6"></path><path d="M14 11v6"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M3 6h18"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </div>
                <div class="workspace-header-separator"></div>
                <div class="workspace-dock-group flex items-center space-x-0.5">
                  <button class="section-dock-btn" data-panel="canvas" title="Switch Side (Dock to other column)">⇄</button>
                  <div class="section-drag-handle" draggable="true" data-panel="canvas" title="Drag to reorder or dock">⋮⋮</div>
                </div>
              </div>
            </div>
            <!-- Clean Canvas Viewport -->
            <div class="flex-1 bg-dot-grid relative overflow-hidden flex items-center justify-center select-none" id="canvas-viewport">
              <div id="canvas-content" class="w-full h-full relative transition-transform duration-200 origin-top-left"></div>
              <!-- Floating Zoom HUD -->
              <div class="absolute bottom-4 right-4 bg-[#1e1e26]/90 backdrop-blur border border-[#343444] rounded-xl shadow-xl flex items-center p-1 space-x-1 text-[#9fa2b4] z-20">
                <button id="zoom-out-btn" class="p-1.5 hover:text-white hover:bg-[#2b2b38] rounded-lg transition" title="Zoom Out">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"></path></svg>
                </button>
                <span id="zoom-text" class="text-[10.5px] font-mono px-2 select-none text-white font-medium">100%</span>
                <button id="zoom-in-btn" class="p-1.5 hover:text-white hover:bg-[#2b2b38] rounded-lg transition" title="Zoom In">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                </button>
                <div class="h-3 w-[1px] bg-[#343444] mx-0.5"></div>
                <button id="zoom-reset-btn" class="p-1.5 hover:text-white hover:bg-[#2b2b38] rounded-lg transition" title="Reset View">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-locate-fixed"><line x1="2" x2="5" y1="12" y2="12"></line><line x1="19" x2="22" y1="12" y2="12"></line><line x1="12" x2="12" y1="2" y2="5"></line><line x1="12" x2="12" y1="19" y2="22"></line><circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>
              <div class="pointer-events-none text-center opacity-30 select-none">
                <div class="text-[12px] text-purple-300 font-medium">Space + Drag to pan canvas</div>
                <div class="text-[10px] text-[#7d8095]">Double-click canvas or click sticky note icon to add card</div>
              </div>
            </div>
          </section>
        </div>

      </div>
      <!-- END: four-quadrant-workspace -->

      <!-- Floating Tooltip Container -->
      <div id="workspace-floating-tooltip" class="workspace-floating-tooltip"></div>

      <!-- Bottom Status Bar -->
      <footer class="h-6 bg-[#161619] border-t border-[#292934] px-3 flex items-center justify-between text-[11px] text-[#777a8a] select-none flex-shrink-0 z-30" data-purpose="status-bar">
        <div class="flex items-center space-x-3">
          <span class="hover:text-white cursor-pointer flex items-center gap-1" id="reveal-note-btn" title="Reveal note in file explorer">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link text-purple-400"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
            <span id="active-note-file-link">LeetCode Workspace.md</span>
          </span>
          <span class="text-[#3b3b4a]">|</span>
          <span id="workspace-word-count">0 Words</span>
          <span class="text-[#3b3b4a]">|</span>
          <span id="save-status-footer" class="text-emerald-400 font-mono">Saved to vault</span>
        </div>
        <div class="flex items-center space-x-3 font-mono text-[10.5px]">
          <span class="text-[#656778]">Spaces: 4</span>
          <span class="text-[#656778]">UTF-8</span>
          <span class="text-emerald-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"></path></svg> Workspace Ready
          </span>
        </div>
      </footer>
    `;

    this.bindEvents(container);
    this.renderTabs();
    this.updateHistoryButtons();

    // Load active tab note
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (activeTab) {
      await this.loadTabNote(activeTab);
    }
  }

  bindEvents(container) {
    // ==========================================
    // 0. WORKSPACE RESIZERS & TOGGLE BUTTONS
    // ==========================================
    this.setupToggleButtons(container);
    this.setupDragAndDropDocking(container);
    this.renderWorkspaceSlots();

    // Setup Resizer: Question vs Thinking (Quadrant 1)
    const qPart = container.querySelector('#question-part');
    const aPart = container.querySelector('#approach-part');
    const resizerQA = container.querySelector('#resizer-question-approach');
    if (resizerQA && qPart && aPart) {
      this.setupDraggableResizer({
        resizerEl: resizerQA,
        firstEl: qPart,
        secondEl: aPart,
        orientation: 'horizontal',
        minPercent: 15,
        maxPercent: 85,
        onResize: (pct) => {
          this.layoutSizes.questionHeight = pct;
          this.layoutSizes.approachHeight = 100 - pct;
        }
      });
    }

    // Setup Resizer: Left Row
    const resizerLeftRow = container.querySelector('#resizer-left-row');
    if (resizerLeftRow) {
      this.setupDraggableResizer({
        resizerEl: resizerLeftRow,
        orientation: 'horizontal',
        minPercent: 15,
        maxPercent: 85,
        onResize: (pct) => {
          this.layoutSizes.leftTopHeight = pct;
        }
      });
    }

    // Setup Resizer: Main Column (Left Col vs Right Col)
    const resizerMainCol = container.querySelector('#resizer-main-col');
    if (resizerMainCol) {
      this.setupDraggableResizer({
        resizerEl: resizerMainCol,
        orientation: 'vertical',
        minPercent: 20,
        maxPercent: 80,
        onResize: (pct) => {
          this.layoutSizes.leftColWidth = pct;
        }
      });
    }

    // Setup Resizer: Right Row
    const resizerRightRow = container.querySelector('#resizer-right-row');
    if (resizerRightRow) {
      this.setupDraggableResizer({
        resizerEl: resizerRightRow,
        orientation: 'horizontal',
        minPercent: 15,
        maxPercent: 85,
        onResize: (pct) => {
          this.layoutSizes.rightTopHeight = pct;
        }
      });
    }

    // Setup Resizer: Code Editor vs Test Case Runner
    const editorBody = container.querySelector('#editor-body-container');
    const testRunner = container.querySelector('#test-runner-panel');
    const resizerTest = container.querySelector('#resizer-test-runner');
    if (resizerTest && editorBody && testRunner) {
      this.setupTestRunnerResizer(resizerTest, editorBody, testRunner);
    }

    // ==========================================
    // 1. TOP TAB BAR ACTIONS
    // ==========================================
    const newTabBtn = container.querySelector('#new-tab-btn');
    const newPageBtn = container.querySelector('#new-page-btn');
    const openVaultNoteBtn = container.querySelector('#open-vault-note-btn');
    const backBtn = container.querySelector('#history-back-btn');
    const forwardBtn = container.querySelector('#history-forward-btn');

    if (newTabBtn) {
      newTabBtn.addEventListener('click', () => this.addNewTab('problem'));
    }

    if (newPageBtn) {
      newPageBtn.addEventListener('click', () => this.addNewTab('problem'));
    }

    if (openVaultNoteBtn) {
      openVaultNoteBtn.addEventListener('click', () => {
        if (obsidian?.FuzzySuggestModal && this.app) {
          const modal = new VaultNoteModal(this.app, (file) => {
            // Check if already open
            const existingTab = this.tabs.find(t => t.filePath === file.path);
            if (existingTab) {
              this.switchTab(existingTab.id);
            } else {
              this.addNewTab('problem', file.basename, file);
            }
          });
          modal.open();
        } else {
          this.addNewTab('problem');
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => this.navigateHistory(-1));
    }

    if (forwardBtn) {
      forwardBtn.addEventListener('click', () => this.navigateHistory(1));
    }

    // ==========================================
    // 2. QUADRANT 1: PROBLEM & APPROACH
    // ==========================================
    const diffBadge = container.querySelector('#problem-difficulty-badge');
    if (diffBadge) {
      diffBadge.addEventListener('click', () => {
        const order = ['Easy', 'Medium', 'Hard'];
        const nextIdx = (order.indexOf(this.currentDifficulty) + 1) % order.length;
        this.updateDifficultyBadge(order[nextIdx]);
        this.queueSave();
        if (obsidian?.Notice) new obsidian.Notice(`Difficulty: ${this.currentDifficulty}`);
      });
    }

    // ==========================================
    // LEETCODE FETCH UI COMPONENT & API LOGIC
    // ==========================================
    const fetchContainer = container.querySelector('.leetcode-fetch-container');
    const numberInput = fetchContainer?.querySelector('input') || container.querySelector('#leetcode-id-input');
    const submitButton = fetchContainer?.querySelector('button') || container.querySelector('#leetcode-fetch-btn');
    const fetchQuestionBtn = container.querySelector('#fetch-question-btn');
    const questionInput = container.querySelector('#question-input');

    const executeFetch = async (questionId) => {
      // 2. Bind the click event to trigger the API logic
      console.log(`Button clicked! Attempting to fetch question ID: ${questionId}`);

      if (isNaN(questionId) || !questionId) {
        console.error("Please enter a valid number.");
        if (obsidian?.Notice) new obsidian.Notice("Please enter a valid number.");
        return;
      }

      const loader = container.querySelector('#question-fetch-loader');
      if (loader) loader.classList.remove('hidden');

      try {
        // 3. Execute the fetch function
        const data = await fetchLeetCodeProblem(questionId);

        // Log the returned payload to the console
        console.log("Successfully fetched data:", data);

        // 4. Update the UI with the fetched data
        if (data) {
          const descriptionContainer = container.querySelector('#description-view');
          const toggleDescBtn = container.querySelector('#toggle-desc-view-btn');
          const questionCount = container.querySelector('#question-char-count');
          const titleInput = container.querySelector('#problem-title-input');
          const topIdInput = container.querySelector('#leetcode-id-input');

          if (topIdInput) topIdInput.value = questionId;

          if (descriptionContainer) {
            descriptionContainer.innerHTML = data.htmlDescription || '<p>No description provided.</p>';
            descriptionContainer.style.display = 'block';
          }
          if (questionInput) {
            questionInput.style.display = 'none';
            questionInput.value = data.htmlDescription || '';
          }
          if (toggleDescBtn) {
            toggleDescBtn.classList.remove('hidden');
            toggleDescBtn.textContent = 'Raw Edit';
          }
          if (questionCount) {
            questionCount.textContent = `${(data.htmlDescription || '').length} chars`;
          }

          // Split and render test cases
          this.renderTestCases(data.testCases);

          // Update starter code in code editor
          const codeEditor = container.querySelector('#code-editor-input');
          const langSelect = container.querySelector('#lang-select');
          const currentLang = langSelect ? langSelect.value : (this.currentLang || 'Python 3');
          const starterCode = getCodeSnippetForLang(data.codeSnippets, currentLang);

          this.activeNote.codeSnippets = data.codeSnippets || [];
          if (codeEditor && starterCode) {
            codeEditor.value = starterCode;
            this.activeNote.code = starterCode;
            this.updateCodeLineNumbers();
          }

          // Update title
          const updatedTitle = `${questionId}. ${data.title}`;
          if (titleInput) {
            titleInput.value = updatedTitle;
          }
          if (data.difficulty) {
            this.updateDifficultyBadge(data.difficulty);
          }

          // Update tab name simultaneously
          const activeTab = this.tabs.find(t => t.id === this.activeTabId);
          if (activeTab) {
            await this.renameTab(activeTab.id, updatedTitle, true);
          }

          this.activeNote.question = data.htmlDescription || '';
          this.activeNote.testCases = data.testCases || '';
          this.updateWordCount();
          this.queueSave();

          console.log("UI updated successfully.");
          if (obsidian?.Notice) new obsidian.Notice(`Loaded LeetCode #${questionId}: ${data.title}`);
        } else {
          console.error(`LeetCode #${questionId} returned no data.`);
          if (obsidian?.Notice) new obsidian.Notice(`LeetCode #${questionId} not found.`);
        }
      } catch (error) {
        console.error("An error occurred during the fetch:", error);
        if (obsidian?.Notice) new obsidian.Notice(`Error fetching LeetCode #${questionId}`);
      } finally {
        if (loader) loader.classList.add('hidden');
      }
    };

    if (submitButton && numberInput) {
      submitButton.addEventListener('click', async () => {
        const questionId = parseInt(numberInput.value);
        await executeFetch(questionId);
      });

      numberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitButton.click();
        }
      });
    }

    if (fetchQuestionBtn) {
      fetchQuestionBtn.addEventListener('click', async () => {
        const val = (questionInput ? questionInput.value : '').trim();
        const match = val.match(/^#?\s*(\d+)/);
        let qId = match ? parseInt(match[1], 10) : null;
        if (!qId && numberInput && numberInput.value) {
          qId = parseInt(numberInput.value, 10);
        }
        if (qId && !isNaN(qId)) {
          await executeFetch(qId);
        } else {
          if (obsidian?.Notice) new obsidian.Notice("Please type a question number in the question box (e.g. 1)");
          questionInput?.focus();
        }
      });
    }

    // Problem Title Input & Manual Renaming
    const titleInput = container.querySelector('#problem-title-input');
    const renameTitleBtn = container.querySelector('#rename-title-btn');

    if (titleInput) {
      titleInput.addEventListener('focus', () => {
        titleInput.select();
      });

      titleInput.addEventListener('input', (e) => {
        const val = e.target.value;
        const displayTitle = val.trim() || 'Untitled';
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
          activeTab.title = displayTitle;
          activeTab.isManuallyNamed = true;
          this.activeNote.title = displayTitle;

          // Simultaneously update the active tab's text in the top tab bar
          const activeTabEl = this.contentEl.querySelector(`.workspace-tab[data-tab-id="${activeTab.id}"] .tab-title-text`)
            || this.contentEl.querySelector('.workspace-tab.active-tab .tab-title-text');
          if (activeTabEl) {
            activeTabEl.textContent = displayTitle;
            activeTabEl.title = displayTitle;
          }

          // Simultaneously update the bottom status bar note link
          const fileLinkEl = this.contentEl.querySelector('#active-note-file-link');
          if (fileLinkEl) {
            fileLinkEl.textContent = `${displayTitle}.md`;
          }

          // Queue debounced file rename & save
          this.queueTitleRename(activeTab.id, displayTitle);

          // Show auto-suggest dropdown list of LeetCode questions
          this.showProblemDropdown(val);
        }
      });

      const commitTitle = async () => {
        const newTitle = titleInput.value.trim() || 'Untitled';
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab) {
          titleInput.value = newTitle;
          await this.commitTitleRename(activeTab.id, newTitle);
        }
      };

      titleInput.addEventListener('keydown', async (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIdx = Math.min(this.suggestHighlightedIndex + 1, this.suggestMatches.length - 1);
          this.highlightDropdownItem(nextIdx);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIdx = Math.max(this.suggestHighlightedIndex - 1, 0);
          this.highlightDropdownItem(prevIdx);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (this.suggestHighlightedIndex >= 0 && this.suggestMatches[this.suggestHighlightedIndex]) {
            await this.selectProblem(this.suggestMatches[this.suggestHighlightedIndex]);
          } else {
            this.hideProblemDropdown();
            titleInput.blur();
            await this.checkAndFetchLeetCode(titleInput.value);
          }
        } else if (e.key === 'Escape') {
          this.hideProblemDropdown();
        }
      });

      titleInput.addEventListener('blur', () => {
        // Delay commit to let click on dropdown register
        setTimeout(() => {
          commitTitle();
        }, 200);
      });
    }

    // Dropdown list click selection
    const dropdown = container.querySelector('#leetcode-suggest-dropdown');
    if (dropdown) {
      dropdown.addEventListener('click', async (e) => {
        const item = e.target.closest('.leetcode-suggest-item');
        if (!item) return;
        const idx = parseInt(item.getAttribute('data-index'), 10);
        if (!isNaN(idx) && this.suggestMatches[idx]) {
          await this.selectProblem(this.suggestMatches[idx]);
        }
      });
    }

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#problem-title-group')) {
        this.hideProblemDropdown();
      }
    });

    if (renameTitleBtn && titleInput) {
      renameTitleBtn.addEventListener('click', () => {
        titleInput.focus();
        titleInput.select();
        this.showProblemDropdown(titleInput.value);
      });
    }

    const approachInput = container.querySelector('#approach-input');
    const questionCount = container.querySelector('#question-char-count');
    const approachCount = container.querySelector('#approach-char-count');
    const clearQuestionBtn = container.querySelector('#clear-question-btn');
    const clearApproachBtn = container.querySelector('#clear-approach-btn');

    if (questionInput) {
      questionInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          const val = questionInput.value.trim();
          const match = val.match(/^#?\s*(\d+)/);
          // If user types just a question ID or short problem title (e.g., "1", "#1", "146")
          if (match && val.length < 60) {
            e.preventDefault();
            const qId = parseInt(match[1], 10);
            console.log(`Enter pressed in question box! Attempting to fetch question ID: ${qId}`);
            await executeFetch(qId);
          }
        }
      });

      questionInput.addEventListener('input', (e) => {
        const val = e.target.value;
        this.activeNote.question = val;
        if (questionCount) questionCount.textContent = `${val.length} chars`;
        this.updateWordCount();

        // Auto-detect question number if not manually named by user
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab && !activeTab.isManuallyNamed) {
          const detected = this.extractQuestionNumberOrTitle(val);
          if (detected && detected !== activeTab.title) {
            this.renameTab(activeTab.id, detected, false);
          }
        }

        this.queueSave();
      });
      this.enableTabIndentation(questionInput);
    }

    if (approachInput) {
      approachInput.addEventListener('input', (e) => {
        this.activeNote.approach = e.target.value;
        if (approachCount) approachCount.textContent = `${e.target.value.length} chars`;
        this.updateWordCount();
        this.queueSave();
      });
      this.enableTabIndentation(approachInput);
    }

    const descView = container.querySelector('#description-view');
    const toggleDescBtn = container.querySelector('#toggle-desc-view-btn');

    if (toggleDescBtn) {
      toggleDescBtn.addEventListener('click', () => {
        if (!descView || !questionInput) return;
        const isDescVisible = descView.style.display !== 'none';
        if (isDescVisible) {
          descView.style.display = 'none';
          questionInput.style.display = 'block';
          toggleDescBtn.textContent = 'Preview';
          questionInput.focus();
        } else {
          descView.innerHTML = questionInput.value;
          descView.style.display = 'block';
          questionInput.style.display = 'none';
          toggleDescBtn.textContent = 'Raw Edit';
        }
      });
    }

    if (clearQuestionBtn && questionInput) {
      clearQuestionBtn.addEventListener('click', () => {
        questionInput.value = '';
        if (descView) {
          descView.innerHTML = '';
          descView.style.display = 'none';
        }
        questionInput.style.display = 'block';
        if (toggleDescBtn) toggleDescBtn.classList.add('hidden');
        this.activeNote.question = '';
        if (questionCount) questionCount.textContent = '0 chars';
        questionInput.focus();
        this.updateWordCount();
        this.queueSave();
      });
    }

    if (clearApproachBtn && approachInput) {
      clearApproachBtn.addEventListener('click', () => {
        approachInput.value = '';
        this.activeNote.approach = '';
        if (approachCount) approachCount.textContent = '0 chars';
        approachInput.focus();
        this.updateWordCount();
        this.queueSave();
      });
    }

    // Problem Tabs (Description / Editorial / Submissions)
    const probTabs = container.querySelectorAll('.tab-btn');
    probTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        probTabs.forEach(b => {
          b.className = 'tab-btn px-2 py-1 rounded-md text-[11px] text-[#7d8095] hover:text-white transition';
        });
        btn.className = 'tab-btn px-2.5 py-1 rounded-md text-[11px] bg-[#242430] text-purple-300 font-medium shadow-sm transition';
      });
    });

    // ==========================================
    // 3. QUADRANT 2: COPILOT CHAT
    // ==========================================
    const chatContainer = container.querySelector('#chat-messages-container');
    const chatInput = container.querySelector('#chat-input');
    const sendBtn = container.querySelector('#send-chat-btn');
    const clearChatBtn = container.querySelector('#clear-chat-btn');
    const pinCopilotBtn = container.querySelector('#pin-copilot-btn');
    const promptChips = container.querySelector('#prompt-chips');
    const copilotKeyBtn = container.querySelector('#copilot-key-btn');

    if (copilotKeyBtn) {
      copilotKeyBtn.addEventListener('click', () => {
        new CopilotApiKeyModal(this.app, this.getPlugin()).open();
      });
    }

    if (clearChatBtn && chatContainer) {
      clearChatBtn.addEventListener('click', () => {
        chatContainer.innerHTML = '';
        this.activeNote.chatHistory = [];
        if (obsidian?.Notice) new obsidian.Notice('Chat context cleared');
      });
    }

    const appendMessage = (sender, text, isAi = false) => {
      if (!chatContainer) return;
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex items-start space-x-2 ${isAi ? '' : 'justify-end'}`;

      if (isAi) {
        msgDiv.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] text-white flex-shrink-0 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          </div>
          <div class="bg-[#20202a] border border-[#2f2f3e] rounded-2xl rounded-tl-sm p-3 max-w-[88%] text-[12px] space-y-2 text-[#caccd9] shadow-sm">
            <p class="font-semibold text-purple-300">AI Help:</p>
            <p class="leading-relaxed text-[#b5b8c5]">${text}</p>
          </div>
        `;
      } else {
        msgDiv.innerHTML = `
          <div class="bg-purple-900/40 border border-purple-600/30 rounded-2xl rounded-tr-sm p-3 max-w-[85%] text-[12px] text-[#ded9f2] shadow-sm">
            <p>${this.escapeHtml(text)}</p>
          </div>
          <div class="w-6 h-6 rounded-full bg-purple-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white shadow">ME</div>
        `;
      }
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    if (pinCopilotBtn) {
      pinCopilotBtn.addEventListener('click', () => {
        if (!chatContainer || !chatContainer.innerText.trim()) {
          if (obsidian?.Notice) new obsidian.Notice('No chat messages to pin.');
          return;
        }
        this.activeNote.copilotNotes = (this.activeNote.copilotNotes ? this.activeNote.copilotNotes + '\n\n' : '') + chatContainer.innerText.trim();
        this.queueSave();
        if (obsidian?.Notice) new obsidian.Notice('Pinned AI discussion to note!');
      });
    }

    const executeChatRequest = async (promptText) => {
      // Add thinking bubble
      const msgDiv = document.createElement('div');
      msgDiv.className = 'flex items-start space-x-2';
      msgDiv.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] text-white flex-shrink-0 shadow">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
        </div>
        <div class="bg-[#20202a] border border-[#2f2f3e] rounded-2xl rounded-tl-sm p-3 max-w-[88%] text-[12px] space-y-2 text-[#caccd9] shadow-sm">
          <p class="font-semibold text-purple-300">AI Help:</p>
          <p class="leading-relaxed text-[#b5b8c5] animate-pulse">Thinking...</p>
        </div>
      `;
      chatContainer.appendChild(msgDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        const activePlugin = this.getPlugin();
        const response = await fetchChatResponse(promptText, activePlugin);
        const pTag = msgDiv.querySelector('.leading-relaxed');
        if (pTag) {
          pTag.classList.remove('animate-pulse');
          pTag.innerHTML = this.escapeHtml(response).replace(/\n/g, '<br/>');
        }
        if (!Array.isArray(this.activeNote.chatHistory)) this.activeNote.chatHistory = [];
        this.activeNote.chatHistory.push({ role: 'user', content: promptText });
        this.activeNote.chatHistory.push({ role: 'assistant', content: response });
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } catch (err) {
        console.error('AI Help request error:', err);
        const pTag = msgDiv.querySelector('.leading-relaxed');
        if (pTag) {
          pTag.classList.remove('animate-pulse');
          pTag.classList.add('text-rose-400');
          pTag.textContent = `Error: ${err.message || 'Failed to connect to AI provider. Check your settings and network.'}`;
        }
      }
    };

    const handleSend = async (customPrompt) => {
      const text = (customPrompt || chatInput?.value || '').trim();
      if (!text) return;

      const plugin = this.getPlugin();
      const settings = await this.getSettings();
      const apiKey = (plugin?.settings?.apiKey || settings?.apiKey || getActiveApiKey(settings) || getActiveApiKey(plugin?.settings) || '').trim();
      const baseUrl = (plugin?.settings?.baseUrl || settings?.baseUrl || '').trim();
      const isLocalModel = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

      appendMessage('ME', text, false);
      if (!customPrompt && chatInput) chatInput.value = '';

      // If no API key configured (and not local model), provide intelligent offline Socratic response with custom API setup
      if (!apiKey && !isLocalModel) {
        let fallbackResponse = '';
        const lower = text.toLowerCase().trim();
        const activeProblem = this.activeNote?.title || 'your problem';

        if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower.length <= 2) {
          fallbackResponse = `Hello! I'm your LeetCode Socratic Mentor. I'm here to guide you step-by-step through **${this.escapeHtml(activeProblem)}** with hints, edge-case breakdowns, and algorithmic intuition!`;
        } else if (lower.includes('hint') || lower.includes('socratic')) {
          fallbackResponse = `Here is a Socratic hint for **${this.escapeHtml(activeProblem)}**:\n1. What are the constraints on the input size?\n2. What data structure allows you to avoid repeated searching (e.g. Hash Map, Two Pointers)?\n3. Before writing code, can you trace the simplest example case?`;
        } else if (lower.includes('data structure') || lower.includes('explain')) {
          fallbackResponse = `When tackling **${this.escapeHtml(activeProblem)}**, common optimal approaches include:\n- **Hash Map / Set**: Instant O(1) lookups.\n- **Two Pointers**: O(N) linear scan on sorted/sequential structures.\n- **Stack / Deque**: Ideal for tracking matching pairs or running min/max.`;
        } else {
          fallbackResponse = `Analyzing your inquiry on **${this.escapeHtml(activeProblem)}**:\n\n**Algorithmic Checklist:**\n- **Edge cases**: Empty inputs, single element, negative numbers, duplicates.\n- **Target Complexity**: Is O(N) or O(N log N) possible?\n- **Space vs Time Tradeoff**: Can an auxiliary array or set speed up lookups?`;
        }

        const promptDiv = document.createElement('div');
        promptDiv.className = 'flex items-start space-x-2';
        promptDiv.innerHTML = `
          <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-[10px] text-white flex-shrink-0 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bot"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
          </div>
          <div class="bg-[#20202a] border border-[#2f2f3e] rounded-2xl rounded-tl-sm p-3 max-w-[88%] text-[12px] space-y-2 text-[#caccd9] shadow-sm">
            <p class="font-semibold text-purple-300">AI Help (Built-in Mentor):</p>
            <p class="leading-relaxed text-[#b5b8c5]">${this.escapeHtml(fallbackResponse).replace(/\n/g, '<br/>')}</p>
            <div style="margin-top: 10px; padding: 8px 12px; background: var(--background-modifier-form-field); border: 1px solid var(--background-modifier-border); border-radius: 8px; font-size: 11px;">
              <span style="color: var(--text-accent); font-weight: 500;">⚡ To unlock live AI responses, configure your Custom API:</span>
              <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
                <button class="quick-enter-key-btn" style="background:var(--interactive-accent);color:var(--text-on-accent, #ffffff);border:none;border-radius:5px;padding:4px 10px;cursor:pointer;font-size:11px;font-weight:600;">Configure Custom API</button>
                <a href="https://aistudio.google.com/apikey" target="_blank" style="background:var(--background-modifier-hover);color:var(--text-accent);border:1px solid var(--background-modifier-border);border-radius:5px;padding:4px 10px;text-decoration:none;font-size:11px;font-weight:500;">Get Free Google Key ↗</a>
              </div>
            </div>
          </div>
        `;
        chatContainer.appendChild(promptDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        const quickBtn = promptDiv.querySelector('.quick-enter-key-btn');
        if (quickBtn) {
          quickBtn.addEventListener('click', () => {
            new CopilotApiKeyModal(this.app, plugin, async (savedKey) => {
              if (savedKey) {
                promptDiv.remove();
                if (obsidian?.Notice) new obsidian.Notice('Custom API configured! Requesting AI response...');
                await executeChatRequest(text);
              }
            }).open();
          });
        }
        return;
      }

      await executeChatRequest(text);
    };

    if (sendBtn) sendBtn.addEventListener('click', () => handleSend());
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }

    if (promptChips) {
      promptChips.querySelectorAll('.prompt-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          const prompt = btn.getAttribute('data-prompt');
          handleSend(prompt);
        });
      });
    }

    // ==========================================
    // 4. QUADRANT 3: CODE EDITOR & RUNNER
    // ==========================================
    const langSelect = container.querySelector('#lang-select');
    const codeEditor = container.querySelector('#code-editor-input');

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.currentLang = e.target.value;
        this.activeNote.language = this.currentLang;

        // Auto-switch code editor text to match the new language's starter code
        if (this.activeNote.codeSnippets && this.activeNote.codeSnippets.length > 0 && codeEditor) {
          const snippet = getCodeSnippetForLang(this.activeNote.codeSnippets, this.currentLang);
          if (snippet) {
            codeEditor.value = snippet;
            this.activeNote.code = snippet;
            this.updateCodeLineNumbers();
          }
        }

        this.queueSave();
        if (obsidian?.Notice) new obsidian.Notice(`Language: ${this.currentLang}`);
      });
    }

    if (codeEditor) {
      codeEditor.addEventListener('input', (e) => {
        this.activeNote.code = e.target.value;
        this.updateCodeLineNumbers();
        this.updateWordCount();
        this.queueSave();
      });
      codeEditor.addEventListener('scroll', () => {
        const lineGutter = container.querySelector('#code-line-numbers');
        if (lineGutter) lineGutter.scrollTop = codeEditor.scrollTop;
      });
      this.enableTabIndentation(codeEditor);
      this.updateCodeLineNumbers();
    }

    const formatBtn = container.querySelector('#format-code-btn');
    if (formatBtn && codeEditor) {
      formatBtn.addEventListener('click', () => {
        if (obsidian?.Notice) new obsidian.Notice('Code formatted');
      });
    }

    const resetCodeBtn = container.querySelector('#reset-code-btn');
    if (resetCodeBtn && codeEditor) {
      resetCodeBtn.addEventListener('click', () => {
        if (this.activeNote.codeSnippets && this.activeNote.codeSnippets.length > 0) {
          const starter = getCodeSnippetForLang(this.activeNote.codeSnippets, this.currentLang);
          if (starter) {
            codeEditor.value = starter;
            this.activeNote.code = starter;
            this.updateCodeLineNumbers();
            this.queueSave();
            if (obsidian?.Notice) new obsidian.Notice('Code reset to LeetCode starter code');
            return;
          }
        }
        if (window.confirm('Reset code editor?')) {
          codeEditor.value = '';
          this.activeNote.code = '';
          this.updateCodeLineNumbers();
          this.queueSave();
        }
      });
    }

    const runBtn = container.querySelector('#run-code-btn');
    const submitBtn = container.querySelector('#submit-code-btn');
    const testStatus = container.querySelector('#test-runner-status');
    const testOutputPanel = container.querySelector('#test-output-panel');

    if (runBtn) {
      runBtn.addEventListener('click', () => {
        this.runCodeTestCases(false);
      });
    }

    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.runCodeTestCases(true);
      });
    }

    // Test case tabs
    const caseTabsContainer = container.querySelector('#case-tabs');
    const addTestCaseBtn = container.querySelector('#add-test-case-btn');

    if (caseTabsContainer) {
      caseTabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.case-btn');
        if (!btn) return;
        caseTabsContainer.querySelectorAll('.case-btn').forEach(b => {
          b.className = 'case-btn px-2 py-0.5 rounded-md text-[#7e8293] hover:text-white transition';
        });
        btn.className = 'case-btn px-2.5 py-0.5 rounded-md bg-[#20202a] text-[#a0a3b2] font-semibold border border-[#2d2d3c] flex items-center gap-1.5';
      });
    }

    if (addTestCaseBtn && caseTabsContainer) {
      addTestCaseBtn.addEventListener('click', () => {
        const input = window.prompt('Enter custom test case argument(s) (e.g. [2,7,11,15]\\n9):');
        if (input !== null && input.trim()) {
          const currentCases = this.activeNote.testCases ? (this.activeNote.testCases + '\n' + input.trim()) : input.trim();
          this.activeNote.testCases = currentCases;
          this.renderTestCases(currentCases);
          this.queueSave();
          if (obsidian?.Notice) new obsidian.Notice('Custom test case added!');
        }
      });
    }

    // ==========================================
    // 5. QUADRANT 4: WHITEBOARD CANVAS
    // ==========================================
    const canvasViewport = container.querySelector('#canvas-viewport');
    const canvasContent = container.querySelector('#canvas-content');
    const zoomText = container.querySelector('#zoom-text');
    const zoomInBtn = container.querySelector('#zoom-in-btn');
    const zoomOutBtn = container.querySelector('#zoom-out-btn');
    const zoomResetBtn = container.querySelector('#zoom-reset-btn');
    const clearCanvasBtn = container.querySelector('#clear-canvas-btn');
    const cardToolBtn = container.querySelector('#canvas-tool-card');

    const updateZoom = (val) => {
      this.currentZoom = Math.max(50, Math.min(200, val));
      if (zoomText) zoomText.textContent = `${this.currentZoom}%`;
      if (canvasContent) canvasContent.style.transform = `scale(${this.currentZoom / 100})`;
    };

    if (zoomInBtn) zoomInBtn.addEventListener('click', () => updateZoom(this.currentZoom + 10));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => updateZoom(this.currentZoom - 10));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => updateZoom(100));

    if (clearCanvasBtn && canvasContent) {
      clearCanvasBtn.addEventListener('click', () => {
        canvasContent.innerHTML = '';
        if (obsidian?.Notice) new obsidian.Notice('Canvas cleared');
      });
    }

    // Add sticky card to canvas
    const addCanvasCard = (x = 30, y = 30) => {
      if (!canvasContent) return;
      const card = document.createElement('div');
      card.className = 'canvas-note-card';
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.innerHTML = `
        <div class="flex items-center justify-between pb-1 border-b border-[#3d3d52] mb-1">
          <span class="text-[10px] text-amber-300 font-mono">Note Card</span>
          <button class="delete-card-btn text-[#777a8c] hover:text-white p-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
          </button>
        </div>
        <textarea placeholder="Write idea, diagram note, or complexity..." spellcheck="false"></textarea>
      `;

      card.querySelector('.delete-card-btn')?.addEventListener('click', () => card.remove());

      // Simple dragging
      let isDragging = false;
      let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

      card.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('button')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = parseInt(card.style.left, 10) || 0;
        initialTop = parseInt(card.style.top, 10) || 0;

        const onMouseMove = (moveEvent) => {
          if (!isDragging) return;
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          card.style.left = `${initialLeft + dx}px`;
          card.style.top = `${initialTop + dy}px`;
        };

        const onMouseUp = () => {
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      canvasContent.appendChild(card);
      card.querySelector('textarea')?.focus();
    };

    if (cardToolBtn) {
      cardToolBtn.addEventListener('click', () => addCanvasCard(40, 40));
    }

    if (canvasViewport) {
      canvasViewport.addEventListener('dblclick', (e) => {
        if (e.target.closest('.canvas-note-card') || e.target.closest('#zoom-text')) return;
        const rect = canvasViewport.getBoundingClientRect();
        addCanvasCard(e.clientX - rect.left - 20, e.clientY - rect.top - 20);
      });
    }

    // ==========================================
    // 6. FOOTER ACTIONS
    // ==========================================
    const revealNoteBtn = container.querySelector('#reveal-note-btn');
    if (revealNoteBtn) {
      revealNoteBtn.addEventListener('click', () => {
        const activeTab = this.tabs.find(t => t.id === this.activeTabId);
        if (activeTab?.filePath && this.app?.workspace) {
          const file = this.app.vault.getAbstractFileByPath(activeTab.filePath);
          if (file) {
            this.app.workspace.getLeaf(true).openFile(file);
          }
        }
      });
    }
  }

  updateWordCount() {
    const q = this.activeNote.question || '';
    const a = this.activeNote.approach || '';
    const c = this.activeNote.code || '';
    const totalWords = (q + ' ' + a + ' ' + c)
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0).length;

    const wordCountEl = this.contentEl.querySelector('#workspace-word-count');
    if (wordCountEl) wordCountEl.textContent = `${totalWords} Words`;

    const fileLinkEl = this.contentEl.querySelector('#active-note-file-link');
    const activeTab = this.tabs.find(t => t.id === this.activeTabId);
    if (fileLinkEl && activeTab) {
      fileLinkEl.textContent = `${activeTab.title}.md`;
    }
  }

  enableTabIndentation(textarea) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + '    ' + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
        textarea.dispatchEvent(new Event('input'));
      }
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async onClose() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    await this.saveActiveNote();
  }
}

class CopilotApiKeyModal extends (obsidian?.Modal || class {}) {
  constructor(app, plugin, onSaved) {
    super(app);
    this.plugin = plugin || app?.plugins?.plugins?.['main-plugin'] || app?.plugins?.getPlugin?.('main-plugin');
    this.onSaved = onSaved;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl('h2', { text: 'Custom AI API Configuration' });
    contentEl.createEl('p', {
      text: 'Configure your custom API key, endpoint base URL, and model ID to chat with AI.',
      cls: 'setting-item-description'
    });

    const activePlugin = this.plugin || this.app?.plugins?.plugins?.['main-plugin'] || this.app?.plugins?.getPlugin?.('main-plugin');
    let currentKey = (activePlugin?.settings?.apiKey || activePlugin?.settings?.geminiApiKey || activePlugin?.settings?.openaiApiKey || '').trim();
    let currentBaseUrl = (activePlugin?.settings?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai').trim();
    let currentModel = (activePlugin?.settings?.model || 'gemini-3.8-flash').trim();

    let keyInput = null;
    let urlInput = null;
    let modelInput = null;

    const doSave = async () => {
      const keyVal = (keyInput?.value !== undefined ? keyInput.value : currentKey).trim();
      const urlVal = (urlInput?.value !== undefined ? urlInput.value : currentBaseUrl).trim();
      const modelVal = (modelInput?.value !== undefined ? modelInput.value : currentModel).trim();

      if (!keyVal && !urlVal.includes('localhost') && !urlVal.includes('127.0.0.1')) {
        if (obsidian?.Notice) new obsidian.Notice('Please enter a valid API key.');
        return;
      }

      const p = activePlugin || this.app?.plugins?.plugins?.['main-plugin'] || this.app?.plugins?.getPlugin?.('main-plugin');
      if (p) {
        if (!p.settings) p.settings = Object.assign({}, DEFAULT_SETTINGS);
        p.settings.apiKey = keyVal;
        p.settings.geminiApiKey = keyVal;
        p.settings.openaiApiKey = keyVal;
        p.settings.baseUrl = urlVal || 'https://generativelanguage.googleapis.com/v1beta/openai';
        p.settings.model = modelVal || 'gemini-3.8-flash';
        if (typeof p.saveSettings === 'function') {
          await p.saveSettings();
        } else if (typeof p.saveData === 'function') {
          await p.saveData(p.settings);
        }
      }

      if (obsidian?.Notice) new obsidian.Notice('Custom API configuration saved successfully!');
      if (this.onSaved) this.onSaved(keyVal);
      this.close();
    };

    if (obsidian?.Setting) {
      new obsidian.Setting(contentEl)
        .setName('API Key')
        .setDesc('Your custom API key (Google Gemini, OpenAI sk-..., DeepSeek, Groq, etc.).')
        .addText(text => {
          keyInput = text.inputEl;
          text.setPlaceholder('Enter your API key...')
            .setValue(currentKey)
            .onChange(val => {
              currentKey = val.trim();
            });
          text.inputEl.type = 'password';
          text.inputEl.style.width = '100%';
          text.inputEl.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              await doSave();
            }
          });
        });

      new obsidian.Setting(contentEl)
        .setName('Base URL')
        .setDesc('API base URL endpoint.')
        .addText(text => {
          urlInput = text.inputEl;
          text.setPlaceholder('https://generativelanguage.googleapis.com/v1beta/openai')
            .setValue(currentBaseUrl)
            .onChange(val => {
              currentBaseUrl = val.trim();
            });
          text.inputEl.style.width = '100%';
        });

      new obsidian.Setting(contentEl)
        .setName('Model ID')
        .setDesc('Custom model identifier.')
        .addText(text => {
          modelInput = text.inputEl;
          text.setPlaceholder('gemini-3.8-flash, gpt-4o, etc.')
            .setValue(currentModel)
            .onChange(val => {
              currentModel = val.trim();
            });
          text.inputEl.style.width = '100%';
        });

      new obsidian.Setting(contentEl)
        .addButton(btn => btn
          .setButtonText('Save Custom API')
          .setCta()
          .onClick(async () => {
            await doSave();
          })
        );
    }
  }

  onClose() {
    this.contentEl.empty();
  }
}

class CopilotSettingTab extends (obsidian?.PluginSettingTab || class {}) {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Custom AI API Settings' });
    containerEl.createEl('p', {
      text: 'Configure your custom API key, endpoint base URL, and model ID to chat with AI.',
      cls: 'setting-item-description'
    });

    if (obsidian?.Setting) {
      new obsidian.Setting(containerEl)
        .setName('API Key')
        .setDesc('Your custom API key (Google Gemini, OpenAI, Claude, DeepSeek, Groq, etc.).')
        .addText(text => {
          text.setPlaceholder('Enter your custom API key...')
            .setValue(this.plugin.settings?.apiKey || '')
            .onChange(async (value) => {
              const val = value.trim();
              this.plugin.settings.apiKey = val;
              this.plugin.settings.geminiApiKey = val;
              this.plugin.settings.openaiApiKey = val;
              await this.plugin.saveSettings();
            });
          text.inputEl.type = 'password';
          text.inputEl.style.width = '100%';
        });

      new obsidian.Setting(containerEl)
        .setName('Base URL')
        .setDesc('Custom API endpoint base URL (e.g. Google Gemini, OpenAI, Ollama).')
        .addText(text => {
          text.setPlaceholder('https://generativelanguage.googleapis.com/v1beta/openai')
            .setValue(this.plugin.settings?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta/openai')
            .onChange(async (value) => {
              this.plugin.settings.baseUrl = value.trim();
              await this.plugin.saveSettings();
            });
          text.inputEl.style.width = '100%';
        });

      new obsidian.Setting(containerEl)
        .setName('Model ID')
        .setDesc('Custom model name or identifier (e.g. gemini-3.8-flash, gpt-4o, deepseek-chat).')
        .addText(text => {
          text.setPlaceholder('gemini-3.8-flash')
            .setValue(this.plugin.settings?.model || 'gemini-3.8-flash')
            .onChange(async (value) => {
              this.plugin.settings.model = value.trim();
              await this.plugin.saveSettings();
            });
          text.inputEl.style.width = '100%';
        });
    }
  }
}

class LeetCodePlugin extends (obsidian?.Plugin || class {}) {
  async onload() {
    await this.loadSettings();

    if (this.addSettingTab) {
      this.addSettingTab(new CopilotSettingTab(this.app, this));
    }

    if (this.registerView) {
      this.registerView(
        VIEW_TYPE_LEETCODE,
        (leaf) => new LeetCodeWorkspaceView(leaf, this)
      );
    }

    if (this.addRibbonIcon) {
      this.addRibbonIcon('code-2', 'Open LeetCode Workspace', () => {
        this.activateView();
      });
    }

    if (this.addCommand) {
      this.addCommand({
        id: 'open-leetcode-workspace',
        name: 'Open LeetCode Workspace',
        callback: () => {
          this.activateView();
        }
      });
    }

    if (this.addStatusBarItem) {
      const statusBarItem = this.addStatusBarItem();
      statusBarItem.setText('LeetCode Sync: Ready');
      statusBarItem.onClickEvent && statusBarItem.onClickEvent(() => {
        this.activateView();
      });
    }
  }

  async loadSettings() {
    const data = (await this.loadData()) || {};
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings || data);
    if (!this.settings.apiKey) {
      this.settings.apiKey = data.geminiApiKey || data.openaiApiKey || data.apiKey || '';
    }
  }

  async saveSettings() {
    const currentData = (await this.loadData()) || {};
    const merged = Object.assign({}, currentData, {
      settings: this.settings,
      activePreset: this.settings.activePreset,
      apiKey: this.settings.apiKey,
      geminiApiKey: this.settings.apiKey,
      openaiApiKey: this.settings.apiKey,
      baseUrl: this.settings.baseUrl,
      model: this.settings.model
    });
    await this.saveData(merged);

    // Update active dropdowns and ensure plugin reference in open workspace views
    const leaves = this.app?.workspace?.getLeavesOfType?.(VIEW_TYPE_LEETCODE) || [];
    for (const leaf of leaves) {
      if (leaf.view) {
        leaf.view.plugin = this;
      }
      const select = leaf.view?.contentEl?.querySelector?.('#copilot-ai-select');
      if (select && select.value !== this.settings.activePreset) {
        select.value = this.settings.activePreset;
      }
    }
  }

  async activateView() {
    if (!this.app || !this.app.workspace) return;
    const { workspace } = this.app;
    let leaf = workspace.getLeavesOfType(VIEW_TYPE_LEETCODE)[0];
    if (!leaf) {
      leaf = workspace.getLeaf(true);
      await leaf.setViewState({
        type: VIEW_TYPE_LEETCODE,
        active: true,
      });
    }
    workspace.revealLeaf(leaf);
  }

  async onunload() {
    if (this.app?.workspace) {
      const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_LEETCODE);
      for (const leaf of leaves) {
        if (leaf.view && typeof leaf.view.saveActiveNote === 'function') {
          await leaf.view.saveActiveNote();
        }
      }
      if (this.app.workspace.detachLeavesOfType) {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_LEETCODE);
      }
    }
  }
}

module.exports = LeetCodePlugin;
module.exports.default = LeetCodePlugin;
module.exports.fetchLeetCodeProblem = fetchLeetCodeProblem;
