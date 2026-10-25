import { pathToFileURL } from "node:url";

const DATA_FILES = new Map([
  ["agent-trains", "public/data/trains.json"],
  ["agent-lunch", "public/data/lunch.json"],
]);
const BASE_BRANCH = "main";
const ACCEPTED_STATUSES = ["modified", "added"];
const COMMIT_SHA = /^[0-9a-f]{40}$/;
const GIT_MODES = new Map([
  ["100644", "file"],
  ["100755", "executable"],
  ["120000", "symlink"],
  ["160000", "submodule"],
]);
const REQUIRED_ENV = [
  "GITHUB_REPOSITORY",
  "GITHUB_TOKEN",
  "HEAD_REF",
  "HEAD_SHA",
  "BASE_REF",
  "BASE_SHA",
];

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

export const checkDataPr = (headRef, baseRef, files, contentType) => {
  const path = dataFileFor(headRef);
  if (path === undefined) {
    return fail(`unknown data branch ${headRef}: only agent-trains and agent-lunch publish data`);
  }
  if (baseRef !== BASE_BRANCH) {
    return fail(`${headRef} must merge into ${BASE_BRANCH}, it targets ${baseRef || "nothing"}`);
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

const changedFiles = async (repoUrl, baseSha, headSha, token) => {
  const response = await githubGet(`${repoUrl}/compare/${baseSha}...${headSha}`, token);
  const comparison = await response.json();
  return comparison.files ?? [];
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
  const shas = [env.HEAD_SHA, env.BASE_SHA];
  if (!shas.every((sha) => COMMIT_SHA.test(sha))) {
    throw new Error("HEAD_SHA and BASE_SHA must be full commit hashes");
  }
  return Object.fromEntries(REQUIRED_ENV.map((name) => [name, env[name]]));
};

const run = async (env) => {
  const { GITHUB_REPOSITORY, GITHUB_TOKEN, HEAD_REF, HEAD_SHA, BASE_REF, BASE_SHA } = readEnv(env);
  const repoUrl = `${env.GITHUB_API_URL ?? "https://api.github.com"}/repos/${GITHUB_REPOSITORY}`;
  const files = await changedFiles(repoUrl, BASE_SHA, HEAD_SHA, GITHUB_TOKEN);
  const path = dataFileFor(HEAD_REF);
  const contentType =
    path === undefined ? "missing" : await contentTypeAt(repoUrl, path, HEAD_SHA, GITHUB_TOKEN);
  return checkDataPr(HEAD_REF, BASE_REF, files, contentType);
};

const singleLine = (text) => {
  return text.replace(/[\r\n]+/g, " ");
};

export const report = (result) => {
  return result.ok ? `ok ${result.path}` : singleLine(result.reason);
};

const isEntryPoint = () => {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
};

if (isEntryPoint()) {
  run(process.env)
    .then((result) => {
      console.log(report(result));
      process.exitCode = result.ok ? 0 : 1;
    })
    .catch((error) => {
      console.log(singleLine(`data-scope could not run: ${error.message}`));
      process.exitCode = 1;
    });
}
