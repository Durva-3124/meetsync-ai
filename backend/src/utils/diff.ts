export type DiffHunk =
  | { op: 'unchanged'; value: string }
  | { op: 'removed'; value: string }
  | { op: 'added'; value: string };

/**
 * Word-level diff between two strings.
 * Returns an array of hunks tagged added / removed / unchanged.
 */
export function diffStrings(original: string, edited: string): DiffHunk[] {
  if (original === edited) return [{ op: 'unchanged', value: original }];

  const a = original.split(' ');
  const b = edited.split(' ');

  // Build LCS table
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack
  const hunks: DiffHunk[] = [];
  let i = m,
    j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      hunks.unshift({ op: 'unchanged', value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      hunks.unshift({ op: 'added', value: b[j - 1] });
      j--;
    } else {
      hunks.unshift({ op: 'removed', value: a[i - 1] });
      i--;
    }
  }

  // Merge consecutive same-op hunks into single tokens
  return hunks.reduce<DiffHunk[]>((acc, h) => {
    const last = acc[acc.length - 1];
    if (last && last.op === h.op) {
      last.value += ' ' + h.value;
      return acc;
    }
    acc.push({ ...h });
    return acc;
  }, []);
}

/**
 * Diff two string arrays element-by-element (for agenda, keyPoints, etc.).
 * Each element is tagged with its source op.
 */
export function diffArrays(original: string[], edited: string[]): DiffHunk[] {
  const hunks: DiffHunk[] = [];
  const maxLen = Math.max(original.length, edited.length);
  for (let i = 0; i < maxLen; i++) {
    const o = original[i];
    const e = edited[i];
    if (o === undefined) {
      hunks.push({ op: 'added', value: e });
    } else if (e === undefined) {
      hunks.push({ op: 'removed', value: o });
    } else if (o === e) {
      hunks.push({ op: 'unchanged', value: o });
    } else {
      hunks.push({ op: 'removed', value: o });
      hunks.push({ op: 'added', value: e });
    }
  }
  return hunks;
}
