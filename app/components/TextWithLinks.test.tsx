import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { expect, test } from 'vitest';
import { TextWithLinks } from './TextWithLinks';

test('TextWithLinks renders plain text without links', () => {
  render(<TextWithLinks text="Hello world" />);
  expect(screen.getByText('Hello world')).toBeInTheDocument();
});

test('TextWithLinks renders multiple links', () => {
  render(
    <TextWithLinks text="Visit [Google](https://google.com) or [GitHub](https://github.com) to learn more" />,
  );
  const googleLink = screen.getByRole('link', { name: 'Google' });
  const githubLink = screen.getByRole('link', { name: 'GitHub' });

  expect(googleLink).toHaveAttribute('href', 'https://google.com');
  expect(githubLink).toHaveAttribute('href', 'https://github.com');

  expect(screen.getByText('Visit')).toBeInTheDocument();
  expect(screen.getByText('or')).toBeInTheDocument();
  expect(screen.getByText('to learn more')).toBeInTheDocument();
});
