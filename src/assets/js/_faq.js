document.addEventListener('DOMContentLoaded', () => {
  const questions = document.querySelectorAll('.js-faq-question');

  if (questions.length === 0) return;

  questions.forEach((question) => {
    const answer = question.nextElementSibling;
    if (!(answer instanceof HTMLElement) || !answer.classList.contains('p-faq-list__item-answer')) {
      return;
    }

    const inner = answer.querySelector('.p-faq-list__item-answer-inner');
    if (!(inner instanceof HTMLElement)) return;

    const openAnswer = () => {
      question.classList.add('is-open');
      answer.classList.add('is-open');
      answer.style.maxHeight = `${inner.scrollHeight}px`;
    };

    const closeAnswer = () => {
      answer.style.maxHeight = `${answer.scrollHeight}px`;

      requestAnimationFrame(() => {
        answer.style.maxHeight = '0px';
      });

      question.classList.remove('is-open');
      answer.classList.remove('is-open');
    };

    const toggleFaq = () => {
      if (question.classList.contains('is-open')) {
        closeAnswer();
      } else {
        openAnswer();
      }
    };

    answer.style.maxHeight = '0px';

    question.addEventListener('click', toggleFaq);
    answer.addEventListener('click', () => {
      if (question.classList.contains('is-open')) {
        toggleFaq();
      }
    });
  });
});
