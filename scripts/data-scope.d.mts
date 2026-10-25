export type PullFile = { filename: string; status: string; previous_filename?: string };

export type DataScopeResult = { ok: true; path: string } | { ok: false; reason: string };

export function dataFileFor(headRef: string): string | undefined;

export function checkDataPr(
  headRef: string,
  files: readonly PullFile[],
  contentType: string,
): DataScopeResult;
