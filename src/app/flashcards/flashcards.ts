import { Component, computed, signal } from '@angular/core';
import { BOOKS } from '../data/vocabulary';

@Component({
  selector: 'app-flashcards',
  templateUrl: './flashcards.html',
  styleUrl: './flashcards.css',
})
export class Flashcards {
  protected readonly books = BOOKS;
  protected readonly currentBookIndex = signal(0);
  protected readonly currentLessonIndex = signal(0);
  protected readonly flipped = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly skipTransition = signal(false);

  protected readonly currentBook = computed(() => this.books[this.currentBookIndex()]);
  protected readonly currentLesson = computed(
    () => this.currentBook().lessons[this.currentLessonIndex()]
  );
  protected readonly cards = computed(() => this.currentLesson().cards);
  protected readonly currentCard = computed(() => this.cards()[this.currentCardIndex()]);
  protected readonly currentCardIndex = signal(0);
  protected readonly totalCards = computed(() => this.cards().length);

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  selectBook(index: number) {
    this.switchCard(() => {
      this.currentBookIndex.set(index);
      this.currentLessonIndex.set(0);
      this.currentCardIndex.set(0);
    });
    this.menuOpen.set(false);
  }

  selectLesson(index: number) {
    this.switchCard(() => {
      this.currentLessonIndex.set(index);
      this.currentCardIndex.set(0);
    });
    this.menuOpen.set(false);
  }

  toggleFlip() {
    this.flipped.update((v) => !v);
  }

  prevCard() {
    if (this.currentCardIndex() > 0) {
      this.switchCard(() => this.currentCardIndex.update((i) => i - 1));
    }
  }

  nextCard() {
    if (this.currentCardIndex() < this.totalCards() - 1) {
      this.switchCard(() => this.currentCardIndex.update((i) => i + 1));
    }
  }

  jumpCards(amount: number) {
    const newIndex = this.currentCardIndex() + amount;
    if (newIndex >= 0 && newIndex < this.totalCards()) {
      this.switchCard(() => this.currentCardIndex.set(newIndex));
    }
  }

  jumpToCard(event: Event) {
    const input = event.target as HTMLInputElement;
    const cardNumber = parseInt(input.value, 10);
    if (!isNaN(cardNumber) && cardNumber >= 1 && cardNumber <= this.totalCards()) {
      this.switchCard(() => this.currentCardIndex.set(cardNumber - 1));
    } else {
      // Reset input to current card if invalid
      input.value = (this.currentCardIndex() + 1).toString();
    }
  }

  selectCard(index: number) {
    if (index >= 0 && index < this.totalCards()) {
      this.switchCard(() => this.currentCardIndex.set(index));
    }
  }

  private switchCard(changeFn: () => void) {
    this.skipTransition.set(true);
    this.flipped.set(false);
    changeFn();
    requestAnimationFrame(() => this.skipTransition.set(false));
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.prevCard();
        break;
      case 'ArrowRight':
        this.nextCard();
        break;
      case ' ':
      case 'Enter':
        event.preventDefault();
        this.toggleFlip();
        break;
      case 'Escape':
        this.menuOpen.set(false);
        break;
    }
  }
}
