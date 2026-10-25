import { pathToFileURL } from "node:url";

const DATA_FILES = new Map([
  ["agent-trains", "public/data/trains.json"],
  ["agent-lunch", "public/data/lunch.json"],
]);
const ACCEPTED_STATUSES = ["modified", "added"];
const GIT_MODES = new Map([
  ["100644", "file"],
  ["100755", "executable"],
  ["120000", "symlink"],
  ["160000", "submodule"],
]);
const REQUIRED_ENV = ["GITHUB_REPOSITORY", "GITHUB_TOKEN", "HEAD_REF", "PR_NUMBER", "HEAD_SHA"];

const fail = (reason) => {
  return { ok: false, reason };
};

export const dataFileFor = (headRef) => {
  return DATA_FILES.get(headRef);
};

const checkFile = (headRef, path, file, contentType) => {
  if (file.filename !== path) {
    return fail(`${headRef} may change only ${path}, it changes ${file.filename}`);
  }
  if (!ACCEPTED_STATUSES.includes(file.status)) {
    return fail(`${path} must be modified or added, it is ${file.status}`);
  }
  if (file.previous_filename !== undefined) {
    return fail(`${path} must not come from another file, it was ${file.previous_filename}`);
  }
  if (contentType !== "file") {
    return fail(`${path} must be a regular file, it is a ${contentType}`);
  }
  return { ok: true, path };
};

export const checkDataPr = (headRef, files, contentType) => {
  const path = dataFileFor(headRef);
  if (path === undefined) {
    return fail(`unknown data branch ${headRef}: only agent-trains and agent-lunch publish data`);
  }
  if (files.length !== 1) {
    const names = files.map((file) => file.filename).join(", ") || "nothing";
    return fail(`${headRef} must change exactly one file, ${path}; it changes ${names}`);
  }
  return checkFile(headRef, path, files[0], contentType);
};

const githubGet = async (url, token) => {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub answered HTTP ${response.status} for ${url}`);
  }
  return response;
};

const nextPage = (link) => {
  return link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
};

const pullFiles = async (url, token, collected = []) => {
  const response = await githubGet(url, token);
  const files = [...collected, ...(await response.json())];
  const next = nextPage(response.headers.get("link"));
  return next === undefined ? files : pullFiles(next, token, files);
};

const contentTypeAt = async (repoUrl, path, sha, token) => {
  const response = await githubGet(`${repoUrl}/git/trees/${sha}?recursive=1`, token);
  const tree = await response.json();
  if (tree.truncated) {
    throw new Error(`the tree of ${sha} is too large to list`);
  }
  const entry = tree.tree.find((item) => item.path === path);
  return entry === undefined ? "missing" : (GIT_MODES.get(entry.mode) ?? entry.mode);
};

const readEnv = (env) => {
  const missing = REQUIRED_ENV.filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`missing environment: ${missing.join(", ")}`);
  }
  return Object.fromEntries(REQUIRED_ENV.map((name) => [name, env[name]]));
};

const run = async (env) => {
  const { GITHUB_REPOSITORY, GITHUB_TOKEN, HEAD_REF, PR_NUMBER, HEAD_SHA } = readEnv(env);
  const repoUrl = `${env.GITHUB_API_URL ?? "https://api.github.com"}/repos/${GITHUB_REPOSITORY}`;
  const files = await pullFiles(`${repoUrl}/pulls/${PR_NUMBER}/files?per_page=100`, GITHUB_TOKEN);
  const path = dataFileFor(HEAD_REF);
  const contentType =
    path === undefined ? "missing" : await contentTypeAt(repoUrl, path, HEAD_SHA, GITHUB_TOKEN);
  return checkDataPr(HEAD_REF, files, contentType);
};

const isEntryPoint = () => {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isEntryPoint()) {
  run(process.env)
    .then((result) => {
      if (!result.ok) {
        console.log(result.reason);
        process.exit(1);
      }
      console.log(`ok ${result.path}`);
    })
    .catch((error) => {
      console.log(`data-scope could not run: ${error.message}`);
      process.exit(1);
    });
}
