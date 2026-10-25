/**
 * github.js
 * Parses GitHub repository URLs and fetches repo metadata, file tree, and file content
 * using the public GitHub REST API.
 */

const ALLOWED_EXTENSIONS = ['.js', '.dart', '.html', '.py', '.java', '.ts', '.css'];
const MAX_FILE_SIZE_BYTES = 50 * 1024; // 50KB limit

/**
 * Parses a GitHub repository URL into owner and repo.
 * Supports:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/
 * @param {string} urlString 
 * @returns {{ owner: string, repo: string }}
 * @throws {Error} with friendly message if invalid
 */
export function parseGitHubUrl(urlString) {
  if (!urlString || typeof urlString !== 'string') {
    throw new Error('Please enter a valid GitHub repository URL.');
  }

  const trimmed = urlString.trim();
  const match = trimmed.match(/^https?:\/\/github\.com\/([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+?)(?:\.git|\/)?$/);

  if (!match) {
    throw new Error('Invalid GitHub URL. Must be in the format: https://github.com/owner/repository');
  }

  const owner = match[1];
  let repo = match[2];

  // Clean trailing .git if still present
  if (repo.endsWith('.git')) {
    repo = repo.slice(0, -4);
  }

  return { owner, repo };
}

/**
 * Checks if a given file path is an eligible source code file.
 * @param {string} path 
 * @returns {boolean}
 */
export function isEligibleCodeFile(path) {
  if (!path) return false;
  const lower = path.toLowerCase();

  // Exclude unwanted directories and lock/build files
  if (
    lower.includes('node_modules/') ||
    lower.includes('build/') ||
    lower.includes('dist/') ||
    lower.includes('.git/') ||
    lower.endsWith('.lock') ||
    lower.endsWith('.min.js') ||
    lower.endsWith('.min.css')
  ) {
    return false;
  }

  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Fetches repository metadata to obtain the actual default branch.
 * @param {string} owner 
 * @param {string} repo 
 * @returns {Promise<{ defaultBranch: string, description: string, stars: number }>}
 */
export async function fetchRepoMetadata(owner, repo) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  
  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
  } catch (err) {
    throw new Error('Network error connecting to GitHub. Please check your internet connection.');
  }

  if (res.status === 404) {
    throw new Error('Repository not found or is private. Make sure the URL is spelled correctly and the repo is public.');
  }

  if (res.status === 403) {
    throw new Error('GitHub API rate limit reached (unauthenticated requests are limited to 60/hr). Please wait a few minutes and try again.');
  }

  if (!res.ok) {
    throw new Error(`GitHub returned an error (HTTP ${res.status}). Please try again.`);
  }

  const data = await res.json();
  return {
    defaultBranch: data.default_branch || 'main',
    description: data.description || '',
    stars: data.stargazers_count || 0
  };
}

/**
 * Fetches the recursive file tree for the default branch and filters for code files.
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} defaultBranch 
 * @returns {Promise<Array<{ path: string, size: number }>>}
 */
export async function fetchRepoFileTree(owner, repo, defaultBranch) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
  } catch (err) {
    throw new Error('Network error while fetching repository file tree.');
  }

  if (res.status === 403) {
    throw new Error('GitHub API rate limit reached (60 req/hr). Please try again in a few minutes.');
  }

  if (!res.ok) {
    throw new Error(`Failed to load file tree (HTTP ${res.status}).`);
  }

  const data = await res.json();
  if (!data.tree || !Array.isArray(data.tree)) {
    throw new Error('Could not parse repository files.');
  }

  // Filter only eligible blob files
  const filtered = data.tree
    .filter((item) => item.type === 'blob' && isEligibleCodeFile(item.path))
    .map((item) => ({
      path: item.path,
      size: item.size || 0
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  if (filtered.length === 0) {
    throw new Error('No eligible code files (.js, .dart, .html, .py, .java, .ts, .css) found in this repository.');
  }

  return filtered;
}

/**
 * Fetches the raw text content of a single file from GitHub.
 * @param {string} owner 
 * @param {string} repo 
 * @param {string} path 
 * @returns {Promise<{ content: string, size: number, path: string }>}
 */
export async function fetchFileContent(owner, repo, path) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`;

  let res;
  try {
    res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
  } catch (err) {
    throw new Error('Network error while retrieving file content.');
  }

  if (res.status === 403) {
    throw new Error('GitHub API rate limit reached. Please wait a few minutes.');
  }

  if (res.status === 404) {
    throw new Error('The selected file could not be found.');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch file content (HTTP ${res.status}).`);
  }

  const data = await res.json();

  if (data.size > MAX_FILE_SIZE_BYTES) {
    const sizeKb = Math.round(data.size / 1024);
    throw new Error(`File is too large (${sizeKb}KB). Maximum allowed size is 50KB to keep interview grilling focused.`);
  }

  if (!data.content) {
    throw new Error('File content is empty or could not be read.');
  }

  // Safely decode UTF-8 from Base64
  const decodedContent = decodeBase64Utf8(data.content);

  return {
    content: decodedContent,
    size: data.size,
    path
  };
}

/**
 * Decodes base64 string to a UTF-8 string safely.
 * @param {string} base64Str 
 * @returns {string}
 */
function decodeBase64Utf8(base64Str) {
  const clean = base64Str.replace(/\s/g, '');
  const binaryString = atob(clean);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
