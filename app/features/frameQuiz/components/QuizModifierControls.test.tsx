import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { QuizModifierControls } from './QuizModifierControls';

const modifiers = { hideCommand: false, hideVideo: false, hard: false };

test('QuizModifierControls toggles hard mode on block', () => {
  const onToggle = vi.fn();
  render(
    <QuizModifierControls
      modifiers={modifiers}
      onToggle={onToggle}
      frameType="block"
      onFrameTypeChange={() => {}}
    />,
  );

  fireEvent.click(screen.getByRole('switch', { name: /Hard mode/ }));

  expect(onToggle).toHaveBeenCalledExactlyOnceWith('hard');
});

test('QuizModifierControls disables hard mode on hit', () => {
  const onToggle = vi.fn();
  render(
    <QuizModifierControls
      modifiers={{ ...modifiers, hard: true }}
      onToggle={onToggle}
      frameType="hit"
      onFrameTypeChange={() => {}}
    />,
  );

  const hardSwitch = screen.getByRole('switch', { name: /Hard mode/ });
  expect(hardSwitch).toHaveAttribute('aria-disabled', 'true');
  expect(hardSwitch).not.toBeChecked();

  fireEvent.click(hardSwitch);
  expect(onToggle).not.toHaveBeenCalled();
  expect(screen.getByText(/only available on block/)).toBeInTheDocument();
});
