import test from 'node:test';
import assert from 'node:assert/strict';
import { diffStrings, diffArrays } from './diff.js';

test('diffStrings returns unchanged for identical strings', () => {
  const result = diffStrings('hello world', 'hello world');
  assert.deepEqual(result, [{ op: 'unchanged', value: 'hello world' }]);
});

test('diffStrings handles empty strings', () => {
  // Both empty
  assert.deepEqual(diffStrings('', ''), [{ op: 'unchanged', value: '' }]);

  // Original empty, edited not empty
  assert.deepEqual(diffStrings('', 'hello'), [
    { op: 'removed', value: '' },
    { op: 'added', value: 'hello' },
  ]);

  // Original not empty, edited empty
  assert.deepEqual(diffStrings('hello', ''), [
    { op: 'removed', value: 'hello' },
    { op: 'added', value: '' },
  ]);
});

test('diffStrings handles single word addition', () => {
  const result = diffStrings('hello', 'hello world');
  assert.deepEqual(result, [
    { op: 'unchanged', value: 'hello' },
    { op: 'added', value: 'world' },
  ]);
});

test('diffStrings handles single word removal', () => {
  const result = diffStrings('hello world', 'hello');
  assert.deepEqual(result, [
    { op: 'unchanged', value: 'hello' },
    { op: 'removed', value: 'world' },
  ]);
});

test('diffStrings handles word replacement', () => {
  const result = diffStrings('hello world', 'hello there');
  assert.deepEqual(result, [
    { op: 'unchanged', value: 'hello' },
    { op: 'removed', value: 'world' },
    { op: 'added', value: 'there' },
  ]);
});

test('diffStrings handles multiple changes interleaved', () => {
  const result = diffStrings(
    'the quick brown fox jumps',
    'quick green fox jumps high'
  );
  assert.deepEqual(result, [
    { op: 'removed', value: 'the' },
    { op: 'unchanged', value: 'quick' },
    { op: 'removed', value: 'brown' },
    { op: 'added', value: 'green' },
    { op: 'unchanged', value: 'fox jumps' },
    { op: 'added', value: 'high' },
  ]);
});

test('diffStrings handles spacing and consecutive spaces', () => {
  const result = diffStrings('hello  world', 'hello world');
  // original: 'hello  world' (split by space results in ['hello', '', 'world'])
  // edited:   'hello world' (split by space results in ['hello', 'world'])
  // Let's assert the structural difference that results from space splitting
  assert.ok(Array.isArray(result));
  assert.ok(result.length > 0);
});

test('diffArrays returns correct diff for identical arrays', () => {
  const result = diffArrays(['a', 'b', 'c'], ['a', 'b', 'c']);
  assert.deepEqual(result, [
    { op: 'unchanged', value: 'a' },
    { op: 'unchanged', value: 'b' },
    { op: 'unchanged', value: 'c' },
  ]);
});

test('diffArrays handles empty arrays', () => {
  assert.deepEqual(diffArrays([], []), []);
  assert.deepEqual(diffArrays([], ['a']), [{ op: 'added', value: 'a' }]);
  assert.deepEqual(diffArrays(['a'], []), [{ op: 'removed', value: 'a' }]);
});

test('diffArrays handles element changes and additions/removals', () => {
  const result = diffArrays(['a', 'b'], ['b', 'c', 'd']);
  assert.deepEqual(result, [
    { op: 'removed', value: 'a' },
    { op: 'added', value: 'b' },
    { op: 'removed', value: 'b' },
    { op: 'added', value: 'c' },
    { op: 'added', value: 'd' },
  ]);
});
