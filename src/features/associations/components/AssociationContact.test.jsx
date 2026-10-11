// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import i18n from '../../../i18n';
import AssociationContact from './AssociationContact';

beforeAll(async () => {
  await i18n.changeLanguage('es');
});

afterEach(cleanup);

describe('AssociationContact', () => {
  it('enlaza al WhatsApp de la asociación', () => {
    render(<AssociationContact number="+51 987 654 321" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://wa.me/51987654321');
  });

  it('no muestra nada si la asociación no publicó número', () => {
    const { container } = render(<AssociationContact number={null} />);
    expect(container.firstChild).toBeNull();
  });
});
