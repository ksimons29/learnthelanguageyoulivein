import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SentenceCard } from '@/components/review/sentence-card';

describe('SentenceCard', () => {
  describe('fill_blank exercise - multi-word phrase blanking (Finding #16)', () => {
    it('blanks a single word correctly', () => {
      render(
        <SentenceCard
          sentence="Obrigado pela ajuda"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="obrigado"
        />
      );

      // The blanked word should show underscores, not the actual word
      expect(screen.queryByText('Obrigado')).not.toBeInTheDocument();
      // Check that the sentence still contains the other words
      expect(screen.getByText(/pela/)).toBeInTheDocument();
      expect(screen.getByText(/ajuda/)).toBeInTheDocument();
    });

    it('blanks ALL words in a multi-word phrase like "Bom dia"', () => {
      render(
        <SentenceCard
          sentence="Bom dia, como está?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="Bom dia"
        />
      );

      // Both "Bom" and "dia" should be blanked (not visible as text)
      // This is the fix for Finding #16
      expect(screen.queryByText('Bom')).not.toBeInTheDocument();
      expect(screen.queryByText('dia,')).not.toBeInTheDocument();
      // The other words should still be visible
      expect(screen.getByText(/como/)).toBeInTheDocument();
      expect(screen.getByText(/está/)).toBeInTheDocument();
    });

    it('blanks ALL words in "Quanto custa?" multi-word phrase', () => {
      render(
        <SentenceCard
          sentence="Quanto custa este livro?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="Quanto custa"
        />
      );

      // Both words in the phrase should be blanked
      expect(screen.queryByText('Quanto')).not.toBeInTheDocument();
      expect(screen.queryByText('custa')).not.toBeInTheDocument();
      // Other words visible
      expect(screen.getByText(/este/)).toBeInTheDocument();
      expect(screen.getByText(/livro/)).toBeInTheDocument();
    });

    it('blanks ALL words in "A conta, por favor" multi-word phrase', () => {
      render(
        <SentenceCard
          sentence="A conta, por favor, está aqui."
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="A conta, por favor"
        />
      );

      // All four words should be blanked
      expect(screen.queryByText('A')).not.toBeInTheDocument();
      expect(screen.queryByText('conta,')).not.toBeInTheDocument();
      expect(screen.queryByText('por')).not.toBeInTheDocument();
      expect(screen.queryByText('favor,')).not.toBeInTheDocument();
      // Other words visible
      expect(screen.getByText(/está/)).toBeInTheDocument();
      expect(screen.getByText(/aqui/)).toBeInTheDocument();
    });

    it('handles case-insensitive matching', () => {
      render(
        <SentenceCard
          sentence="BOM DIA, como vai?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="fill_blank"
          blankedWord="bom dia"
        />
      );

      // Should still blank despite case difference
      expect(screen.queryByText('BOM')).not.toBeInTheDocument();
      expect(screen.queryByText('DIA,')).not.toBeInTheDocument();
    });

    it('does not blank words when exerciseType is not fill_blank', () => {
      render(
        <SentenceCard
          sentence="Bom dia, como está?"
          highlightedWords={[]}
          showTranslation={false}
          exerciseType="multiple_choice"
          blankedWord="Bom dia"
        />
      );

      // Words should be visible in multiple_choice mode
      expect(screen.getByText(/Bom/)).toBeInTheDocument();
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

      expect(screen.getByText('Fill in the blank:')).toBeInTheDocument();
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
