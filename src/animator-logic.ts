import * as jsdiff from 'diff';

export type EditOperation =
  | { type: 'insert'; position: number; text: string }
  | { type: 'delete'; position: number; length: number };

export function getNextEdit(
  current: string,
  target: string,
  charsPerChange: number,
): EditOperation | null {
  const diffs = jsdiff.diffChars(current, target);
  let cursor = 0;

  for (const diff of diffs) {
    if (diff.added) {
      const change = diff.value.substring(0, charsPerChange);
      return { type: 'insert', position: cursor, text: change };
    } else if (diff.removed) {
      return { type: 'delete', position: cursor, length: diff.value.length };
    } else {
      cursor += diff.value.length;
    }
  }

  return null;
}
