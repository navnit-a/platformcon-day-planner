import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

const SCRIPT = resolve("scripts/check-data-pr.sh");
const TRAINS = "public/data/trains.json";
const LUNCH = "public/data/lunch.json";

const gitAvailable = (() => {
  try {
    execFileSync("git", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
})();

const gitEnv = {
  ...process.env,
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "test",
  GIT_AUTHOR_EMAIL: "test@example.com",
  GIT_COMMITTER_NAME: "test",
  GIT_COMMITTER_EMAIL: "test@example.com",
};

const repos: string[] = [];

const git = (repo: string, ...args: string[]) => {
  return execFileSync("git", args, { cwd: repo, env: gitEnv, encoding: "utf8" });
};

const write = (repo: string, path: string, content: string) => {
  mkdirSync(dirname(join(repo, path)), { recursive: true });
  writeFileSync(join(repo, path), content);
};

const baseRepo = () => {
  const repo = mkdtempSync(join(tmpdir(), "check-data-pr-"));
  repos.push(repo);
  git(repo, "init", "-q", "-b", "main");
  write(repo, TRAINS, "{}\n");
  write(repo, LUNCH, "{}\n");
  write(repo, "src/App.tsx", "export {};\n");
  git(repo, "add", ".");
  git(repo, "commit", "-q", "-m", "base");
  return repo;
};

const branch = (head: string, change: (repo: string) => void) => {
  const repo = baseRepo();
  git(repo, "checkout", "-q", "-b", head);
  change(repo);
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", "change");
  return repo;
};

const check = (repo: string, head: string) => {
  try {
    const output = execFileSync("bash", [SCRIPT, head, "main"], {
      cwd: repo,
      env: gitEnv,
      encoding: "utf8",
    });
    return { status: 0, output };
  } catch (error) {
    const failed = error as { status: number; stdout: string };
    return { status: failed.status, output: failed.stdout };
  }
};

afterEach(() => {
  repos.splice(0).forEach((repo) => {
    rmSync(repo, { recursive: true, force: true });
  });
});

describe.skipIf(!gitAvailable)("check-data-pr.sh", () => {
  test("accepts the trains file alone", () => {
    const repo = branch("agent-trains", (r) => write(r, TRAINS, '{"status":"normal"}\n'));
    expect(check(repo, "agent-trains")).toEqual({ status: 0, output: `ok ${TRAINS}\n` });
  });

  test("accepts the lunch file alone", () => {
    const repo = branch("agent-lunch", (r) => write(r, LUNCH, '{"picks":[]}\n'));
    expect(check(repo, "agent-lunch")).toEqual({ status: 0, output: `ok ${LUNCH}\n` });
  });

  test("rejects a second file", () => {
    const repo = branch("agent-trains", (r) => {
      write(r, TRAINS, '{"status":"normal"}\n');
      write(r, LUNCH, '{"picks":[]}\n');
    });
    const result = check(repo, "agent-trains");
    expect(result.status).toBe(1);
    expect(result.output).toContain(LUNCH);
  });

  test("rejects a source file", () => {
    const repo = branch("agent-lunch", (r) => write(r, "src/App.tsx", "export const x = 1;\n"));
    const result = check(repo, "agent-lunch");
    expect(result.status).toBe(1);
    expect(result.output).toContain("src/App.tsx");
  });

  test("rejects an unknown agent branch", () => {
    const repo = branch("agent-weather", (r) => write(r, TRAINS, '{"status":"normal"}\n'));
    const result = check(repo, "agent-weather");
    expect(result.status).toBe(1);
    expect(result.output).toContain("agent-weather");
  });

  test("rejects a symlink in place of the file", () => {
    const repo = branch("agent-trains", (r) => {
      rmSync(join(r, TRAINS));
      symlinkSync("../../src/App.tsx", join(r, TRAINS));
    });
    const result = check(repo, "agent-trains");
    expect(result.status).toBe(1);
    expect(result.output).toContain("120000");
  });

  test("rejects a deleted file", () => {
    const repo = branch("agent-lunch", (r) => rmSync(join(r, LUNCH)));
    const result = check(repo, "agent-lunch");
    expect(result.status).toBe(1);
    expect(result.output).toContain(LUNCH);
  });
});
