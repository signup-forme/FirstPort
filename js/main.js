const header = document.querySelector(".header");
const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const themeToggle = document.querySelector(".theme-toggle");
const scrollTopButton = document.querySelector("#scroll-top");

const projectStatus = document.querySelector("#project-status");
const projectList = document.querySelector("#project-list");

const contactForm = document.querySelector("#contact-form");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");

const nameError = document.querySelector("#name-error");
const emailError = document.querySelector("#email-error");
const messageError = document.querySelector("#message-error");
const formSuccess = document.querySelector("#form-success");


// ========================================
// STATE
// ========================================

const state = {
  theme: localStorage.getItem("theme") === "dark"
    ? "dark"
    : "light",

  menuOpen: false,

  scrollY: window.scrollY,

  projectsStatus: "loading",

  projects: [],

  form: {
    name: "",
    email: "",
    message: "",
    errors: {
      name: "",
      email: "",
      message: ""
    },
    success: ""
  }
};


// ========================================
// THEME RENDER
// ========================================

const renderTheme = () => {
  if (state.theme === "dark") {
    document.body.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️";
    themeToggle.setAttribute("aria-label", "라이트 모드로 변경");
  } else {
    document.body.removeAttribute("data-theme");
    themeToggle.textContent = "🌙";
    themeToggle.setAttribute("aria-label", "다크 모드로 변경");
  }
};


// ========================================
// MENU RENDER
// ========================================

const renderMenu = () => {
  navMenu.classList.toggle("active", state.menuOpen);
  menuToggle.setAttribute("aria-expanded", state.menuOpen);
};


// ========================================
// SCROLL RENDER
// ========================================

const renderScroll = () => {
  header.classList.toggle("scrolled", state.scrollY > 60);
  scrollTopButton.classList.toggle("show", state.scrollY > 300);
};


// ========================================
// PROJECT RENDER
// ========================================

const renderProjects = () => {
  if (state.projectsStatus === "loading") {
    projectStatus.textContent = "프로젝트를 불러오는 중...";
    projectList.innerHTML = "";
    return;
  }

  if (state.projectsStatus === "empty") {
    projectStatus.textContent = "표시할 프로젝트가 없습니다.";
    projectList.innerHTML = "";
    return;
  }

  if (state.projectsStatus === "error") {
    projectStatus.innerHTML = `
      <p>프로젝트를 불러올 수 없습니다.</p>
      <button id="retry-projects" class="button" type="button">
        다시 시도
      </button>
    `;

    projectList.innerHTML = "";

    const retryButton = document.querySelector("#retry-projects");

    if (retryButton) {
      retryButton.addEventListener("click", loadProjects);
    }

    return;
  }

  projectStatus.textContent = "";

  projectList.innerHTML = state.projects
    .map((repo) => {
      const {
        name,
        description,
        html_url,
        language,
        stargazers_count
      } = repo;

      return `
        <article class="project-card">
          <h3>${name}</h3>

          <p>
            ${description || "프로젝트 설명이 없습니다."}
          </p>

          <div class="project-meta">
            <span>${language || "기타"}</span>
            <span>⭐ ${stargazers_count}</span>
          </div>

          <a
            href="${html_url}"
            target="_blank"
            rel="noopener noreferrer"
            class="project-link"
          >
            GitHub에서 보기
          </a>
        </article>
      `;
    })
    .join("");
};


// ========================================
// FORM RENDER
// ========================================

const renderForm = () => {
  nameError.textContent = state.form.errors.name;
  emailError.textContent = state.form.errors.email;
  messageError.textContent = state.form.errors.message;
  formSuccess.textContent = state.form.success;
};


// ========================================
// HAMBURGER MENU
// ========================================

menuToggle.addEventListener("click", () => {
  state.menuOpen = !state.menuOpen;

  renderMenu();
});


// ========================================
// ANCHOR NAVIGATION
// ========================================

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (!targetSection) {
      return;
    }

    event.preventDefault();

    const headerHeight = header.offsetHeight;

    const targetTop =
      targetSection.getBoundingClientRect().top +
      window.scrollY -
      headerHeight -
      10;

    window.scrollTo({
      top: targetTop,
      behavior: "smooth"
    });

    state.menuOpen = false;

    renderMenu();
  });
});


// ========================================
// DARK MODE
// ========================================

themeToggle.addEventListener("click", () => {
  state.theme = state.theme === "dark"
    ? "light"
    : "dark";

  localStorage.setItem("theme", state.theme);

  renderTheme();
});


// ========================================
// SCROLL
// ========================================

window.addEventListener("scroll", () => {
  state.scrollY = window.scrollY;

  renderScroll();
});


// ========================================
// SCROLL TOP
// ========================================

scrollTopButton.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});


// ========================================
// INTERSECTION OBSERVER
// ========================================

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2
  }
);

const revealElements = document.querySelectorAll(".reveal");

revealElements.forEach((element) => {
  observer.observe(element);
});


// ========================================
// GITHUB API
// ========================================

const githubUsername = "signup-forme";

const loadProjects = async () => {
  state.projectsStatus = "loading";
  state.projects = [];

  renderProjects();

  try {
    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API 요청 실패: ${response.status}`
      );
    }

    const repositories = await response.json();

    if (repositories.length === 0) {
      state.projectsStatus = "empty";
      state.projects = [];

      renderProjects();

      return;
    }

    state.projects = repositories;
    state.projectsStatus = "success";

    renderProjects();

  } catch (error) {
    console.error(error);

    state.projectsStatus = "error";
    state.projects = [];

    renderProjects();
  }
};


// ========================================
// FORM VALIDATION
// ========================================

const validateForm = () => {
  const {
    name,
    email,
    message
  } = state.form;

  state.form.errors = {
    name: "",
    email: "",
    message: ""
  };

  let isValid = true;

  if (!name.trim()) {
    state.form.errors.name = "이름을 입력해주세요.";
    isValid = false;
  }

  if (!email.trim()) {
    state.form.errors.email = "이메일을 입력해주세요.";
    isValid = false;
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    state.form.errors.email =
      "올바른 이메일 형식을 입력해주세요.";

    isValid = false;
  }

  if (!message.trim()) {
    state.form.errors.message =
      "메시지를 입력해주세요.";

    isValid = false;
  }

  return isValid;
};


// ========================================
// CONTACT FORM SUBMIT
// ========================================

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  state.form.name = nameInput.value;
  state.form.email = emailInput.value;
  state.form.message = messageInput.value;
  state.form.success = "";

  const isValid = validateForm();

  if (!isValid) {
    renderForm();
    return;
  }

  state.form.success =
    "메시지가 성공적으로 전송되었습니다.";

  state.form.errors = {
    name: "",
    email: "",
    message: ""
  };

  renderForm();

  contactForm.reset();

  state.form.name = "";
  state.form.email = "";
  state.form.message = "";
});


// ========================================
// INPUT EVENT
// ========================================

contactForm.addEventListener("input", (event) => {
  const field = event.target;

  if (field === nameInput) {
    state.form.name = field.value;
    state.form.errors.name = "";
  }

  if (field === emailInput) {
    state.form.email = field.value;
    state.form.errors.email = "";
  }

  if (field === messageInput) {
    state.form.message = field.value;
    state.form.errors.message = "";
  }

  state.form.success = "";

  renderForm();
});


// ========================================
// INITIAL RENDER
// ========================================

renderTheme();
renderMenu();
renderScroll();
renderForm();
loadProjects();
