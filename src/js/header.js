import Swiper from 'swiper';
import {
  Mousewheel,
  FreeMode,
  Keyboard,
  EffectCoverflow,
} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const appsLinks = [
  {
    title: 'Bookmark Saver',
    href: './1-bookmark-saver.html',
    tag: 'Save links',
  },
  {
    title: 'Color Palette Generator',
    href: './2-color-generation.html',
    tag: 'Colors',
  },
  {
    title: 'Expense Tracker',
    href: './3-expense-tracker.html',
    tag: 'Finance',
  },
  { title: 'ToDo App', href: './4-todo-app.html', tag: 'Tasks' },
  {
    title: 'Password Generator',
    href: './5-pass-generator.html',
    tag: 'Security',
  },
  { title: 'Kanban Board', href: './6-kanban-board.html', tag: 'Workflow' },
  { title: 'Validation Form', href: './7-validation-form.html', tag: 'Forms' },
  { title: 'Quiz Game', href: './8-quiz-game.html', tag: 'Game' },
  { title: 'Contact Form', href: './9-contact-form.html', tag: 'Contact' },
  { title: 'Pricing Cards', href: './10-pricing-cards.html', tag: 'Pricing' },
  { title: 'Team Members', href: './11-team-members.html', tag: 'Team' },
  { title: 'Recipe Finder', href: './12-recipe-finder.html', tag: 'Food' },
];

function createSlide({ title, href, tag }, index) {
  return `
    <li class="swiper-slide panorama-slide">
      <a class="app-card" href="${href}">
        <span class="app-card-top">
          <span class="app-card-index">${String(index + 1).padStart(2, '0')}</span>
          <span class="app-card-tag">${tag}</span>
        </span>
        <strong class="app-card-title">${title}</strong>
        <span class="app-card-bottom">
          <span class="app-card-line"></span>
          <span class="app-card-link">Open app →</span>
        </span>
      </a>
    </li>
  `;
}

function initHeader() {
  const sliderList = document.querySelector('.js-apps-slider');
  const sliderEl = document.querySelector('.panorama-swiper');

  if (!sliderList || !sliderEl) return;

  sliderList.innerHTML = appsLinks.map(createSlide).join('');

  new Swiper(sliderEl, {
    modules: [Mousewheel, FreeMode, Keyboard, EffectCoverflow],

    effect: 'coverflow',
    slidesPerView: 'auto',
    loop: true,
    spaceBetween: 40,
    speed: 500,
    grabCursor: true,
    watchOverflow: true,
    simulateTouch: true,
    slideToClickedSlide: false,
    centeredSlides: true,
    centeredSlidesBounds: false,

    slidesOffsetBefore: 160,
    slidesOffsetAfter: 160,

    preventClicks: true,
    preventClicksPropagation: false,

    coverflowEffect: {
      rotate: 18,
      stretch: -70,
      depth: 140,
      modifier: 1,
      scale: 0.9,
      slideShadows: false,
    },

    freeMode: {
      enabled: true,
      momentum: true,
      momentumRatio: 0.75,
      sticky: true,
    },

    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    mousewheel: {
      enabled: true,
      forceToAxis: false,
      sensitivity: 0.3,
      releaseOnEdges: false,
      eventsTarget: '.panorama-swiper',
    },
  });
}

document.addEventListener('DOMContentLoaded', initHeader);
