// =========================
// DOM Elements
// =========================

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const themeToggle = document.querySelector(".theme-toggle");

const header = document.querySelector(".header");

const scrollTopButton =
  document.querySelector("#scroll-top");

const navLinks =
  document.querySelectorAll(".nav-menu a");

const revealElements =
  document.querySelectorAll(".reveal");

const projectStatus =
  document.querySelector("#project-status");

const projectList =
  document.querySelector("#project-list");

const contactForm =
  document.querySelector("#contact-form");


// =========================
// Mobile Menu
// =========================

menuToggle.addEventListener("click", () => {

  navMenu.classList.toggle("active");

});


// 메뉴를 클릭하면 모바일 메뉴 닫기
navLinks.forEach((link) => {

  link.addEventListener("click", () => {

    navMenu.classList.remove("active");

  });

});


// =========================
// Smooth Scroll
// =========================

navLinks.forEach((link) => {

  link.addEventListener("click", (event) => {

    event.preventDefault();

    const targetId =
      link.getAttribute("href");

    const target =
      document.querySelector(targetId);

    if (target) {

      target.scrollIntoView({
        behavior: "smooth"
      });

    }

  });

});


// =========================
// Dark Mode
// =========================

const savedTheme =
  localStorage.getItem("theme");


// 저장된 테마 불러오기
if (savedTheme === "dark") {

  document.documentElement
    .setAttribute("data-theme", "dark");

  themeToggle.textContent = "☀️";

}


// 테마 변경
themeToggle.addEventListener("click", () => {

  const currentTheme =
    document.documentElement
      .getAttribute("data-theme");

  if (currentTheme === "dark") {

    document.documentElement
      .removeAttribute("data-theme");

    localStorage.setItem(
      "theme",
      "light"
    );

    themeToggle.textContent = "🌙";

  } else {

    document.documentElement
      .setAttribute("data-theme", "dark");

    localStorage.setItem(
      "theme",
      "dark"
    );

    themeToggle.textContent = "☀️";

  }

});


// =========================
// Scroll Event
// =========================

window.addEventListener("scroll", () => {

  const scrollY = window.scrollY;


  // 60px 이상 스크롤하면 Header 변경
  if (scrollY >= 60) {

    header.classList.add("scrolled");

  } else {

    header.classList.remove("scrolled");

  }


  // 300px 이상 스크롤하면
  // Scroll Top 버튼 표시
  if (scrollY >= 300) {

    scrollTopButton.classList.add("show");

  } else {

    scrollTopButton.classList.remove("show");

  }

});


// =========================
// Scroll Top Button
// =========================

scrollTopButton.addEventListener(
  "click",
  () => {

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// =========================
// Intersection Observer
// =========================

const observerOptions = {

  threshold: 0.2

};


const observer =
  new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add(
            "visible"
          );

          observer.unobserve(
            entry.target
          );

        }

      });

    },
    observerOptions
  );


revealElements.forEach((element) => {

  observer.observe(element);

});


// =========================
// GitHub API
// =========================

const githubUsername =
  "signup-forme";


const loadProjects = async () => {

  // 로딩 상태
  projectStatus.textContent =
    "프로젝트를 불러오는 중...";

  projectList.innerHTML = "";


  try {

    const response = await fetch(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=12`
    );


    // HTTP 에러 확인
    if (!response.ok) {

      throw new Error(
        `GitHub API Error: ${response.status}`
      );

    }


    const repositories =
      await response.json();


    // 빈 상태
    if (repositories.length === 0) {

      projectStatus.textContent =
        "표시할 프로젝트가 없습니다.";

      return;

    }


    // 성공 상태
    projectStatus.textContent =
      "";


    // map을 이용해서
    // GitHub 데이터를 HTML 카드로 변환
    const projectHTML =
      repositories
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

              <h3>
                ${name}
              </h3>

              <p>
                ${description || "프로젝트 설명이 없습니다."}
              </p>

              <p>
                언어:
                ${language || "알 수 없음"}
              </p>

              <p>
                ⭐ ${stargazers_count}
              </p>

              <a
                href="${html_url}"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub에서 보기 →
              </a>

            </article>
          `;

        })
        .join("");


    projectList.innerHTML =
      projectHTML;


  } catch (error) {

    console.error(
      "GitHub 프로젝트 로딩 실패:",
      error
    );


    // 에러 상태
    projectStatus.innerHTML = `
      <p>
        프로젝트를 불러올 수 없습니다.
      </p>

      <button
        id="retry-projects"
        class="button"
        type="button"
      >
        다시 시도
      </button>
    `;


    const retryButton =
      document.querySelector(
        "#retry-projects"
      );


    retryButton.addEventListener(
      "click",
      loadProjects
    );

  }

};


// 페이지가 로드되면 GitHub API 호출
loadProjects();


// =========================
// Contact Form
// =========================

const validateEmail = (email) => {

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailPattern.test(email);

};


contactForm.addEventListener(
  "submit",
  (event) => {

    event.preventDefault();


    const name =
      document.querySelector("#name");

    const email =
      document.querySelector("#email");

    const message =
      document.querySelector("#message");


    const nameError =
      document.querySelector("#name-error");

    const emailError =
      document.querySelector("#email-error");

    const messageError =
      document.querySelector("#message-error");

    const formSuccess =
      document.querySelector("#form-success");


    // 이전 메시지 초기화
    nameError.textContent = "";
    emailError.textContent = "";
    messageError.textContent = "";
    formSuccess.textContent = "";


    let isValid = true;


    // 이름 검사
    if (name.value.trim() === "") {

      nameError.textContent =
        "이름을 입력해주세요.";

      isValid = false;

    }


    // 이메일 검사
    if (email.value.trim() === "") {

      emailError.textContent =
        "이메일을 입력해주세요.";

      isValid = false;

    } else if (
      !validateEmail(email.value.trim())
    ) {

      emailError.textContent =
        "올바른 이메일 형식을 입력해주세요.";

      isValid = false;

    }


    // 메시지 검사
    if (message.value.trim() === "") {

      messageError.textContent =
        "메시지를 입력해주세요.";

      isValid = false;

    }


    // 유효성 검사 실패
    if (!isValid) {

      return;

    }


    // 성공 상태
    formSuccess.textContent =
      "메시지가 정상적으로 작성되었습니다!";


    // 실제 서버 전송은 하지 않고
    // 폼 내용 초기화
    contactForm.reset();

  }
);


// =========================
// Input Event
// =========================

const formInputs =
  contactForm.querySelectorAll(
    "input, textarea"
  );


formInputs.forEach((input) => {

  input.addEventListener(
    "input",
    () => {

      const errorElement =
        document.querySelector(
          `#${input.id}-error`
        );

      if (
        errorElement &&
        input.value.trim() !== ""
      ) {

        errorElement.textContent = "";

      }

      const formSuccess =
        document.querySelector(
          "#form-success"
        );

      formSuccess.textContent = "";

    }
  );

});