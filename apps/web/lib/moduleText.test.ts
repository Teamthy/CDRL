import { describe, expect, it } from 'vitest';
import { inlineTokens, parseModuleText, youtubeId } from './moduleText';

describe('parseModuleText', () => {
    it('splits paragraphs on blank lines', () => {
        const blocks = parseModuleText('First para.\n\nSecond para.');
        expect(blocks).toEqual([
            { kind: 'paragraph', text: 'First para.' },
            { kind: 'paragraph', text: 'Second para.' },
        ]);
    });

    it('parses headings', () => {
        expect(parseModuleText('## Objectives')[0]).toEqual({ kind: 'heading', level: 2, text: 'Objectives' });
        expect(parseModuleText('### Fine detail')[0]).toEqual({ kind: 'heading', level: 3, text: 'Fine detail' });
    });

    it('groups consecutive dash lines into one list', () => {
        const blocks = parseModuleText('- one\n- two\n- three');
        expect(blocks).toEqual([{ kind: 'list', items: ['one', 'two', 'three'] }]);
    });

    it('a bare YouTube URL becomes an embed', () => {
        expect(youtubeId('https://www.youtube.com/watch?v=abc123XYz')).toBe('abc123XYz');
        expect(youtubeId('https://youtu.be/abc123XYz')).toBe('abc123XYz');
        expect(youtubeId('see https://youtu.be/abc123XYz here')).toBeNull();
        const blocks = parseModuleText('https://www.youtube.com/watch?v=abc123XYz');
        expect(blocks[0]).toEqual({ kind: 'youtube', videoId: 'abc123XYz' });
    });

    it('empty input yields no blocks', () => {
        expect(parseModuleText('   \n\n  ')).toEqual([]);
    });
});

describe('inlineTokens', () => {
    it('parses bold', () => {
        expect(inlineTokens('a **b** c')).toEqual([
            { kind: 'text', text: 'a ' },
            { kind: 'bold', text: 'b' },
            { kind: 'text', text: ' c' },
        ]);
    });

    it('parses links and keeps text around them', () => {
        expect(inlineTokens('read [the guide](https://example.com/x) now')).toEqual([
            { kind: 'text', text: 'read ' },
            { kind: 'link', text: 'the guide', href: 'https://example.com/x' },
            { kind: 'text', text: ' now' },
        ]);
    });

    it('plain text passes through', () => {
        expect(inlineTokens('nothing here')).toEqual([{ kind: 'text', text: 'nothing here' }]);
    });

    it('ignores non-http(s) link targets', () => {
        expect(inlineTokens('[x](javascript:alert(1))')).toEqual([{ kind: 'text', text: '[x](javascript:alert(1))' }]);
    });
});
