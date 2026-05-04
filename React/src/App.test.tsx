import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

// --- DevExtreme component mocks -----------------------------------------------
// These prevent jsdom from trying to run the real DevExtreme runtime (which
// requires a browser canvas + license token) while still exercising our own
// component logic and verifying rendered output.

vi.mock('devextreme-react/html-editor', () => {
  const HtmlEditor = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Toolbar = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  const Item = ({ name, options }: { name?: string; options?: { text?: string } }) => (
    <button type="button">{options?.text ?? name ?? 'item'}</button>
  );
  return { default: HtmlEditor, Item, Toolbar };
});

vi.mock('devextreme-react/button', () => ({
  default: ({ text }: { text?: string }) => <button type="button">{text}</button>,
}));

vi.mock('devextreme-react/file-uploader', () => ({
  default: () => <div />,
}));

vi.mock('devextreme-react/popup', () => ({
  default: ({ children, visible }: { children?: ReactNode; visible?: boolean }) =>
    visible ? <div>{children}</div> : null,
}));

vi.mock('devextreme-react/popover', () => ({
  default: ({ children, visible }: { children?: ReactNode; visible?: boolean }) =>
    visible ? <div>{children}</div> : null,
}));

vi.mock('devextreme-react/text-box', () => ({
  default: () => <input aria-label="mock-textbox" />,
}));

// --- Tests --------------------------------------------------------------------

import App from './App.tsx';

test('renders markup action button', () => {
  render(<App />);
  const markupButton = screen.getByText(/display markup/i);
  expect(markupButton).toBeInTheDocument();
});

test('renders emoji toolbar button', () => {
  render(<App />);
  expect(screen.getByText('😀')).toBeInTheDocument();
});

test('renders standard toolbar items', () => {
  render(<App />);
  expect(screen.getByText('undo')).toBeInTheDocument();
  expect(screen.getByText('redo')).toBeInTheDocument();
  expect(screen.getByText('bold')).toBeInTheDocument();
  expect(screen.getByText('italic')).toBeInTheDocument();
  expect(screen.getByText('strike')).toBeInTheDocument();
  expect(screen.getByText('underline')).toBeInTheDocument();
});

test('renders alignment toolbar items', () => {
  render(<App />);
  expect(screen.getByText('alignLeft')).toBeInTheDocument();
  expect(screen.getByText('alignCenter')).toBeInTheDocument();
  expect(screen.getByText('alignRight')).toBeInTheDocument();
  expect(screen.getByText('alignJustify')).toBeInTheDocument();
});

test('popups are hidden by default', () => {
  render(<App />);
  expect(screen.queryByText('Insert')).not.toBeInTheDocument();
  expect(screen.queryByText('Insert Video')).not.toBeInTheDocument();
});

test('renders multiple separator items', () => {
  render(<App />);
  const separators = screen.getAllByText('separator');
  expect(separators.length).toBeGreaterThanOrEqual(4);
});

