import * as assert from 'assert';
import { parseSteps } from '../src/steps';


describe('parseSteps', () => {
    it('should parse valid steps', () => {
        const json = JSON.stringify([
            { file: 'file1.ts', content: 'content1.ts' },
            { file: 'file2.ts', content: 'content2.ts', charsPerChange: 10 },
        ]);
        const steps = parseSteps(json);
        assert.strictEqual(steps.length, 2);
        assert.strictEqual(steps[0].file, 'file1.ts');
        assert.strictEqual(steps[1].charsPerChange, 10);
    });

    it('should throw error for invalid JSON', () => {
        const json = '{ invalid json }';
        assert.throws(() => parseSteps(json), /Invalid steps.json/);
    });

    it('should throw error for empty array', () => {
        const json = '[]';
        assert.throws(() => parseSteps(json), /steps.json must contain at least one step/);
    });

    it('should throw error for invalid schema', () => {
        const json = JSON.stringify([{ file: 'file1.ts' }]); // missing content
        assert.throws(() => parseSteps(json), /Invalid steps.json/);
    });
});
