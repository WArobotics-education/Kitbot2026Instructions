import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { clampStepIndex, getStepFromHash, getProgressPercent } from './script.js';

test('clampStepIndex keeps requested step inside available range', () => {
  assert.equal(clampStepIndex(-1, 5), 0);
  assert.equal(clampStepIndex(2, 5), 2);
  assert.equal(clampStepIndex(99, 5), 4);
});

test('getStepFromHash converts one-based step hash to zero-based index', () => {
  assert.equal(getStepFromHash('#step-1', 8), 0);
  assert.equal(getStepFromHash('#step-3', 8), 2);
  assert.equal(getStepFromHash('#step-99', 8), 7);
  assert.equal(getStepFromHash('#bad', 8), 0);
});

test('getProgressPercent reports completion by current step', () => {
  assert.equal(getProgressPercent(0, 4), 25);
  assert.equal(getProgressPercent(1, 4), 50);
  assert.equal(getProgressPercent(3, 4), 100);
});

test('home page links to the material cut list with button styling', async () => {
  const html = await readFile(new URL('./index.html', import.meta.url), 'utf8');

  assert.match(html, /href="cut-list\.html"/);
  assert.match(html, /class="nav-button"/);
  assert.match(html, /Material cut list/);
});

test('cut list page contains all required material lengths', async () => {
  const html = await readFile(new URL('./cut-list.html', import.meta.url), 'utf8');
  const pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  assert.match(html, /class="cut-list boxed-list"/);
  assert.match(html, /class="cut-card boxed-card"/);

  for (const text of [
    'RHS cut list',
    '2x 125mm',
    '1x 525mm',
    '1x 700mm',
    '2x 625mm',
    '1x 200mm',
    'SHS cut list',
    '2x 675mm',
    'Hex',
    '4x 110mm',
    '2x 95mm',
    '4x 600mm',
    'M8 threaded rod',
    '3x 600mm',
  ]) {
    assert.ok(pageText.includes(text), `Expected cut-list.html to include ${text}`);
  }
});
