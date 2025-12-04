import * as assert from 'assert';
import { getNextEdit } from '../src/animator-logic';

describe('getNextEdit', () => {
    it('should return null if strings are identical', () => {
        const current = 'abc';
        const target = 'abc';
        const edit = getNextEdit(current, target, 5);
        assert.strictEqual(edit, null);
    });

    it('should return insert operation for added text', () => {
        const current = 'ab';
        const target = 'abc';
        const edit = getNextEdit(current, target, 5);
        assert.deepStrictEqual(edit, { type: 'insert', position: 2, text: 'c' });
    });

    it('should return delete operation for removed text', () => {
        const current = 'abc';
        const target = 'ab';
        const edit = getNextEdit(current, target, 5);
        assert.deepStrictEqual(edit, { type: 'delete', position: 2, length: 1 });
    });

    it('should respect charsPerChange for insertions', () => {
        const current = 'a';
        const target = 'abcdef';
        const edit = getNextEdit(current, target, 2);
        assert.deepStrictEqual(edit, { type: 'insert', position: 1, text: 'bc' });
    });

    it('should handle changes in the middle', () => {
        const current = 'ac';
        const target = 'abc';
        const edit = getNextEdit(current, target, 5);
        assert.deepStrictEqual(edit, { type: 'insert', position: 1, text: 'b' });
    });
});
