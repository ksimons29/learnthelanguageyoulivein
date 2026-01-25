import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentenceCard } from '@/components/review/sentence-card';

describe('SentenceCard', () => {
  describe('fill_blank exercise - word highlighting (Issue #119)', () => {
    // FIX for Issue #119: fill_blank now shows the word highlighted (visible)
    // instead of hidden with underscores. User sees Portuguese word and types English meaning.

    it('shows a single word highlighted (not hidden)', () => {
      const { container } = render(
        <SentenceCard
          sentence="Obrigado pela ajuda"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="obrigado"
        />
      );

      // The word should be visible and highlighted (bold with border)
      expect(screen.getByText('Obrigado')).toBeInTheDocument();

      // Check that it has the special fill_blank styling (bold, with border-b-2)
      const highlightedWord = container.querySelector('.font-bold.border-b-2');
      expect(highlightedWord).toBeInTheDocument();
      expect(highlightedWord?.textContent).toBe('Obrigado');

      // Other words should still be visible normally
      expect(screen.getByText(/pela/)).toBeInTheDocument();
      expect(screen.getByText(/ajuda/)).toBeInTheDocument();
    });

    it('shows ALL words highlighted in a multi-word phrase like "Bom dia"', () => {
      const { container } = render(
        <SentenceCard
          sentence="Bom dia, como está?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="Bom dia"
        />
      );

      // Both "Bom" and "dia" should be visible and highlighted
      expect(screen.getByText('Bom')).toBeInTheDocument();

      // Find all highlighted words (bold with border)
      const highlightedWords = container.querySelectorAll('.font-bold.border-b-2');
      expect(highlightedWords).toHaveLength(2);

      // The other words should still be visible normally
      expect(screen.getByText(/como/)).toBeInTheDocument();
      expect(screen.getByText(/está/)).toBeInTheDocument();
    });

    it('shows ALL words highlighted in "Quanto custa?" multi-word phrase', () => {
      const { container } = render(
        <SentenceCard
          sentence="Quanto custa este livro?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="Quanto custa"
        />
      );

      // Both words in the phrase should be visible and highlighted
      const highlightedWords = container.querySelectorAll('.font-bold.border-b-2');
      expect(highlightedWords).toHaveLength(2);

      // Other words visible normally
      expect(screen.getByText(/este/)).toBeInTheDocument();
      expect(screen.getByText(/livro/)).toBeInTheDocument();
    });

    it('shows ALL words highlighted in "A conta, por favor" multi-word phrase', () => {
      const { container } = render(
        <SentenceCard
          sentence="A conta, por favor, está aqui."
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="A conta, por favor"
        />
      );

      // All four words should be highlighted
      const highlightedWords = container.querySelectorAll('.font-bold.border-b-2');
      expect(highlightedWords).toHaveLength(4);

      // Other words visible normally
      expect(screen.getByText(/está/)).toBeInTheDocument();
      expect(screen.getByText(/aqui/)).toBeInTheDocument();
    });

    it('handles case-insensitive matching for highlighting', () => {
      const { container } = render(
        <SentenceCard
          sentence="BOM DIA, como vai?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="bom dia"
        />
      );

      // Should still highlight despite case difference
      const highlightedWords = container.querySelectorAll('.font-bold.border-b-2');
      expect(highlightedWords).toHaveLength(2);
      expect(highlightedWords[0]?.textContent).toBe('BOM');
    });

    it('does not highlight words when exerciseType is not fill_blank', () => {
      const { container } = render(
        <SentenceCard
          sentence="Bom dia, como está?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="multiple_choice"
          blankedWord="Bom dia"
        />
      );

      // Words should be visible but not with fill_blank styling
      expect(screen.getByText(/Bom/)).toBeInTheDocument();

      // Should not have the fill_blank bold styling
      const boldWords = container.querySelectorAll('.font-bold.border-b-2');
      expect(boldWords).toHaveLength(0);
    });

    it('shows correct prompt for fill_blank exercise', () => {
      render(
        <SentenceCard
          sentence="Obrigado pela ajuda"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="obrigado"
        />
      );

      // Updated prompt for new behavior
      expect(screen.getByText('What does the highlighted word mean?')).toBeInTheDocument();
    });

    it('shows correct prompt for multiple_choice exercise', () => {
      render(
        <SentenceCard
          sentence="Obrigado pela ajuda"
          highlightedWords={['obrigado']}
          showTranslation={false}
          exerciseType="multiple_choice"
        />
      );

      expect(screen.getByText('Choose the correct meaning:')).toBeInTheDocument();
    });
  });

  describe('highlighted words', () => {
    it('highlights single words correctly', () => {
      const { container } = render(
        <SentenceCard
          sentence="Obrigado pela ajuda"
          highlightedWords={['obrigado']}
          showTranslation={false}
          exerciseType="multiple_choice"
        />
      );

      // The highlighted word should have teal background styling
      const highlightedSpan = container.querySelector('[style*="--accent-nav-light"]');
      expect(highlightedSpan).toBeInTheDocument();
    });
  });
});
