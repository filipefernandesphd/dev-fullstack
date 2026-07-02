import { describe, it, expect } from 'vitest';

describe('Ambiente de testes', () => {
    it('deve somar dois números corretamente', ()=>{
        const somar = 1 + 1;
        expect(somar).toBe(2);
    })
});