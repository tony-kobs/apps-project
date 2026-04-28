import Swiper from 'swiper';
import { Mousewheel, FreeMode, Keyboard } from 'swiper/modules';
import Atropos from 'atropos';

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
  { title: 'Pricing Cards', href: './10-pricing-cards.html', tag: 'UI Cards' },
  { title: 'Team Members', href: './11-team-members.html', tag: 'People' },
  {
    title: 'Recipe Finder App',
    href: './12-recipe-finder.html',
    tag: 'API App',
  },
];

const sliderList = document.querySelector('.js-apps-slider');

if (sliderList) {
  sliderList.innerHTML = appsLinks
    .map(
      ({ title, href, tag }, index) => `
        <li class="swiper-slide panorama-slide">
          <div class="atropos app-atropos">
            <div class="atropos-scale">
              <div class="atropos-rotate">
                <div class="atropos-inner app-card-inner">
                  <a class="app-card" href="${href}">
                    <span class="app-card-bg" data-atropos-offset="-5"></span>
                    <span class="app-card-index" data-atropos-offset="2">
                      ${String(index + 1).padStart(2, '0')}
                    </span>
                    <span class="app-card-tag" data-atropos-offset="4">${tag}</span>
                    <span class="app-card-title" data-atropos-offset="8">${title}</span>
                    <span class="app-card-link" data-atropos-offset="10">Open app ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </li>
      `
    )
    .join('');

  document.querySelectorAll('.app-atropos').forEach(card => {
    Atropos({
      el: card,
      activeOffset: 22,
      shadow: true,
      shadowScale: 1.02,
      highlight: true,
      rotateXMax: 5,
      rotateYMax: 7,
      rotateTouch: false,
      duration: 260,
    });
  });

  new Swiper('.panorama-swiper', {
    modules: [Mousewheel, FreeMode, Keyboard],

    direction: 'horizontal',
    loop: true,
    slidesPerView: 'auto',
    centeredSlides: true,
    spaceBetween: 28,
    speed: 700,
    grabCursor: true,
    watchSlidesProgress: true,
    slideToClickedSlide: true,

    freeMode: {
      enabled: true,
      sticky: false,
      momentum: true,
      momentumRatio: 0.85,
      momentumVelocityRatio: 0.55,
    },

    mousewheel: {
      enabled: true,
      forceToAxis: false,
      sensitivity: 'auto',
      releaseOnEdges: true,
      thresholdDelta: 4,
    },

    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },

    on: {
      progress(swiper) {
        swiper.slides.forEach(slide => {
          const progress = slide.progress;
          const abs = Math.abs(progress);

          const rotateY = progress * -13;
          const translateX = progress * -18;
          const translateZ = -Math.min(abs * 85, 170);
          const scale = 1 - Math.min(abs * 0.08, 0.18);
          const opacity = 1 - Math.min(abs * 0.14, 0.38);

          slide.style.transform = `
            translate3d(${translateX}px, 0, ${translateZ}px)
            rotateY(${rotateY}deg)
            scale(${scale})
          `;

          slide.style.opacity = String(opacity);
          slide.style.zIndex = String(100 - Math.round(abs * 12));
        });
      },

      setTransition(swiper, duration) {
        swiper.slides.forEach(slide => {
          slide.style.transitionDuration = `${duration}ms`;
        });
      },
    },
  });
}
