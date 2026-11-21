import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { AnswerOptionButtons } from './AnswerOptionButtons';

test('AnswerOptionButtons shows a button for each option in order', () => {
  render(
    <AnswerOptionButtons
      options={[{ min: 1 }, { min: -14, max: -12 }, { max: -15 }]}
      onAnswer={() => {}}
    />,
  );

  expect(
    screen.getAllByRole('button').map((button) => button.textContent),
  ).toEqual(['+1 or more', '-12 to -14', '-15 or less']);
});

test('AnswerOptionButtons answers with the range of the clicked button', () => {
  const onAnswer = vi.fn();
  render(
    <AnswerOptionButtons
      options={[{ min: 1 }, { min: -14, max: -12 }]}
      onAnswer={onAnswer}
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: '-12 to -14' }));

  expect(onAnswer).toHaveBeenCalledExactlyOnceWith({ min: -14, max: -12 });
});
