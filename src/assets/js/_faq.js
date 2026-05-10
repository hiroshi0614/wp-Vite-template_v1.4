const FAQ_ANIMATION_DURATION = 300;

function slideDown(element, duration = FAQ_ANIMATION_DURATION) {
  element.style.removeProperty("display");
  const display = window.getComputedStyle(element).display;
  if (display === "none") {
    element.style.display = "block";
  }

  const targetHeight = element.scrollHeight;
  element.style.overflow = "hidden";
  element.style.height = "0px";
  element.style.transition = `height ${duration}ms ease`;

  requestAnimationFrame(() => {
    element.style.height = `${targetHeight}px`;
  });

  window.setTimeout(() => {
    element.style.removeProperty("height");
    element.style.removeProperty("overflow");
    element.style.removeProperty("transition");
  }, duration);
}

function slideUp(element, duration = FAQ_ANIMATION_DURATION) {
  const targetHeight = element.scrollHeight;
  element.style.overflow = "hidden";
  element.style.height = `${targetHeight}px`;
  element.style.transition = `height ${duration}ms ease`;

  requestAnimationFrame(() => {
    element.style.height = "0px";
  });

  window.setTimeout(() => {
    element.style.display = "none";
    element.style.removeProperty("height");
    element.style.removeProperty("overflow");
    element.style.removeProperty("transition");
  }, duration);
}

document.addEventListener("DOMContentLoaded", () => {
  const questions = document.querySelectorAll(".js-faq-question");

  if (questions.length === 0) return;

  questions.forEach(question => {
    const answer = question.nextElementSibling;
    if (!(answer instanceof HTMLElement)) return;
    question.classList.remove("is-open");
    answer.style.display = "none";

    const toggleFaq = () => {
      const isOpen = question.classList.contains("is-open");
      question.classList.toggle("is-open", !isOpen);

      if (isOpen) {
        slideUp(answer);
      } else {
        slideDown(answer);
      }
    };

    question.addEventListener("click", toggleFaq);
    answer.addEventListener("click", () => {
      if (!question.classList.contains("is-open")) return;
      toggleFaq();
    });
  });
});
