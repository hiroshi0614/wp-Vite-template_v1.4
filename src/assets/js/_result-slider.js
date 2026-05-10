import Splide from "@splidejs/splide";

const resultSlider = document.querySelector(".js-result-splide");

if (resultSlider) {
  new Splide(".js-result-splide", {
    type: "loop",
    perPage: 1,
    perMove: 1,
    arrows: true,
    pagination: false,
    drag: true,
    mediaQuery: "min",
    breakpoints: {
      768: {
        perPage: 3,
        gap: "2.1875rem",
      },
    },
  }).mount();
}
