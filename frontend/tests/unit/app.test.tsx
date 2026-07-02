import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('<App />', () => {
    it('deve exibir o título da aplicação', () => {
        render(<App />);
        const titulo = screen.getByRole('heading', { level: 1, name: 'MeuPlano.AI'});
        expect(titulo).toBeInTheDocument();
    });
});