(function () {
  "use strict";

  const STORAGE_KEY = "smh-portfolio-cms-state:v2";
  const ANALYTICS_KEY = "smh-portfolio-analytics:v1";
  const SESSION_KEY = "smh-portfolio-session";
  const app = document.querySelector("#app");
  const editToggle = document.querySelector("#editToggle");
  const closeDrawer = document.querySelector("#closeDrawer");
  const editDrawer = document.querySelector("#editDrawer");
  const modeLabel = document.querySelector("#modeLabel");
  const toast = document.querySelector("#toast");
  const modal = document.querySelector("#projectModal");
  const projectForm = document.querySelector("#projectForm");
  const projectModalTitle = document.querySelector("#projectModalTitle");

  const cssUnits = {
    glassBlur: "px",
    thumbnailOpacity: "",
    fontScale: "x",
    cardSpacing: "px",
    gridDensity: "px",
    animationSpeed: "ms"
  };

  const styleControls = [
    { key: "glassBlur", label: "Glass panel blur", min: 4, max: 28, step: 1 },
    { key: "thumbnailOpacity", label: "Thumbnail clarity", min: 0.58, max: 1, step: 0.02 },
    { key: "fontScale", label: "Font size", min: 0.9, max: 1.14, step: 0.01 },
    { key: "cardSpacing", label: "Card spacing", min: 8, max: 34, step: 1 },
    { key: "gridDensity", label: "Grid density", min: 240, max: 460, step: 10 },
    { key: "animationSpeed", label: "Animation speed", min: 120, max: 720, step: 20 }
  ];

  const sectionLabels = {
    problem: "Problem",
    process: "Process",
    research: "Research",
    ideation: "Ideation",
    prototype: "Prototype",
    result: "Final Result"
  };

  let state = loadState();
  let analytics = loadAnalytics();
  let editMode = false;
  let activeProjectSession = null;
  let editingProjectId = null;
  let pendingMedia = {};
  let toastTimer = null;

  initSession();
  applySettings();
  bindGlobalEvents();
  render();

  function initSession() {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, `session-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    }
  }

  function loadState() {
    const defaults = clone(window.PORTFOLIO_DEFAULTS);
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;

    try {
      const saved = JSON.parse(raw);
      return normalizeState({ ...defaults, ...saved });
    } catch (error) {
      console.warn("Failed to parse saved portfolio state.", error);
      return defaults;
    }
  }

  function normalizeState(value) {
    const defaults = window.PORTFOLIO_DEFAULTS;
    return {
      version: 1,
      profile: { ...defaults.profile, ...(value.profile || {}) },
      settings: { ...defaults.settings, ...(value.settings || {}) },
      projects: Array.isArray(value.projects) ? value.projects.map(normalizeProject) : clone(defaults.projects),
      press: Array.isArray(value.press) ? value.press : clone(defaults.press)
    };
  }

  function normalizeProject(project) {
    return {
      id: project.id || slugify(project.title || "project"),
      title: project.title || "Untitled Project",
      subtitle: project.subtitle || "",
      category: project.category || "",
      year: project.year || "",
      status: project.status || "",
      thumbnail: project.thumbnail || "assets/surface-hero.svg",
      hero: project.hero || project.thumbnail || "assets/surface-hero.svg",
      summary: project.summary || "",
      tags: Array.isArray(project.tags) ? project.tags : toArray(project.tags),
      role: project.role || "",
      sections: { ...emptySections(), ...(project.sections || {}) },
      gallery: Array.isArray(project.gallery) ? project.gallery : toArray(project.gallery),
      storyBlocks: Array.isArray(project.storyBlocks) ? project.storyBlocks.map(normalizeStoryBlock) : null,
      videoUrl: project.videoUrl || "",
      links: Array.isArray(project.links) ? project.links : []
    };
  }

  function normalizeStoryBlock(block) {
    const type = ["image", "spacer"].includes(block.type) ? block.type : "text";
    return {
      id: block.id || `block-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      x: clamp(Number(block.x ?? 8), 0, 92),
      y: Math.max(0, Number(block.y ?? 0)),
      w: clamp(Number(block.w ?? 46), 18, 94),
      text: block.text || "",
      src: block.src || "",
      caption: block.caption || "",
      size: block.size || "medium"
    };
  }

  function emptySections() {
    return {
      problem: "",
      process: "",
      research: "",
      ideation: "",
      prototype: "",
      result: ""
    };
  }

  function loadAnalytics() {
    const empty = { projectStats: {}, recent: [], visits: [] };
    const raw = localStorage.getItem(ANALYTICS_KEY);
    if (!raw) return empty;
    try {
      return { ...empty, ...JSON.parse(raw) };
    } catch (error) {
      console.warn("Failed to parse analytics.", error);
      return empty;
    }
  }

  function persistState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function persistAnalytics() {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
  }

  function bindGlobalEvents() {
    editToggle.addEventListener("click", () => {
      if (editMode && editDrawer.hidden) {
        editDrawer.hidden = false;
        return;
      }
      setEditMode(!editMode);
    });
    closeDrawer.addEventListener("click", () => {
      editDrawer.hidden = true;
    });

    window.addEventListener("hashchange", () => {
      finishActiveProjectSession();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      render();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") finishActiveProjectSession();
    });

    window.addEventListener("beforeunload", finishActiveProjectSession);

    document.querySelectorAll("[data-close-modal]").forEach((node) => {
      node.addEventListener("click", closeProjectModal);
    });

    document.querySelectorAll(".drawer-tab").forEach((button) => {
      button.addEventListener("click", () => activateDrawerPanel(button.dataset.panel));
    });

    document.querySelector("#addProjectButton").addEventListener("click", () => openProjectModal());
    document.querySelector("#sortByClicksButton").addEventListener("click", sortProjectsByClicks);
    document.querySelector("#openAnalyticsButton").addEventListener("click", () => {
      window.location.hash = "#/analytics";
    });
    document.querySelector("#exportButton").addEventListener("click", exportState);
    document.querySelector("#importInput").addEventListener("change", importState);
    document.querySelector("#resetButton").addEventListener("click", resetLocalData);

    projectForm.addEventListener("submit", submitProjectForm);
  }

  function setEditMode(next) {
    editMode = next;
    document.body.classList.toggle("edit-mode", editMode);
    editDrawer.hidden = !editMode;
    editToggle.setAttribute("aria-pressed", String(editMode));
    modeLabel.textContent = editMode ? "Edit Mode" : "View Mode";
    renderAdminList();
    renderStyleControls();
    renderProfileForm();
    render();
  }

  function activateDrawerPanel(panelName) {
    document.querySelectorAll(".drawer-tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.panel === panelName);
    });
    document.querySelectorAll(".drawer-panel").forEach((panel) => {
      panel.classList.toggle("is-active", panel.id === `panel-${panelName}`);
    });
  }

  function applySettings() {
    const root = document.documentElement;
    root.style.setProperty("--glass-blur", `${state.settings.glassBlur}px`);
    root.style.setProperty("--thumb-opacity", state.settings.thumbnailOpacity);
    root.style.setProperty("--font-scale", state.settings.fontScale);
    root.style.setProperty("--card-gap", `${state.settings.cardSpacing}px`);
    root.style.setProperty("--grid-min", `${state.settings.gridDensity}px`);
    root.style.setProperty("--motion-speed", `${state.settings.animationSpeed}ms`);
  }

  function render() {
    applySettings();
    const route = getRoute();
    setActiveNav(route);
    trackPageVisit(route);

    if (route.name !== "project") finishActiveProjectSession();

    if (route.name === "about") renderAbout();
    else if (route.name === "press") renderPress();
    else if (route.name === "analytics") renderAnalytics();
    else if (route.name === "project") renderProject(route.id);
    else renderHome();

    if (editMode) {
      renderAdminList();
      renderStyleControls();
      renderProfileForm();
    }
  }

  function getRoute() {
    const hash = window.location.hash.replace(/^#\/?/, "");
    if (!hash) return { name: "work" };
    const [name, id] = hash.split("/");
    if (name === "project" && id) return { name: "project", id };
    if (["about", "press", "analytics"].includes(name)) return { name };
    return { name: "work" };
  }

  function setActiveNav(route) {
    const section = route.name === "project" ? "work" : route.name;
    document.querySelectorAll("[data-route-link]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.routeLink === section);
    });
  }

  function renderHome() {
    const projectCards = state.projects
      .map(
        (project) => `
          <article class="project-card">
            <a class="project-card-link" href="#/project/${encodeURIComponent(project.id)}" data-project-id="${escapeAttr(
              project.id
            )}" aria-label="${escapeAttr(project.title)} 상세 보기">
              <img src="${escapeAttr(project.thumbnail)}" alt="${escapeAttr(project.title)} 썸네일" loading="lazy" />
              <div class="project-card-content">
                <div class="project-card-meta">
                  <span>${escapeHtml(project.category)}</span>
                  <span>${escapeHtml(project.year)}</span>
                </div>
                <h2>${escapeHtml(project.title)}</h2>
                <p>${escapeHtml(project.subtitle)}</p>
                <span class="project-card-cta">View project</span>
              </div>
            </a>
          </article>
        `
      )
      .join("");

    app.innerHTML = `
      <section class="page home-page">
        <div class="page-inner">
          <div class="work-intro apple-hero">
            <p class="section-kicker">Son Minhyung Portfolio CMS</p>
            <h1>Design work, presented like a product.</h1>
            <p>
              PDF가 잃어버리는 선명도, 영상, 모션, 맥락을 웹에서 직접 보여줍니다.
              프로젝트는 크게 보고, 편집은 빠르게 하고, 반응 데이터는 조용히 기록합니다.
            </p>
            <div class="view-meta">
              <span class="meta-chip">Crisp glass cards</span>
              <span class="meta-chip">Drag story canvas</span>
              <span class="meta-chip">Local CMS</span>
              <span class="meta-chip">GH Pages ready</span>
            </div>
          </div>
          <div class="project-grid">
            ${projectCards || `<div class="empty-state">Edit Mode에서 프로젝트를 추가하세요.</div>`}
          </div>
        </div>
      </section>
    `;

    app.querySelectorAll(".project-card-link").forEach((link) => {
      link.addEventListener("click", () => addProjectClick(link.dataset.projectId));
    });
  }

  function renderProject(projectId) {
    const project = state.projects.find((item) => item.id === projectId);
    if (!project) {
      app.innerHTML = `
        <section class="page locked-panel">
          <div>
            <h1>Project not found</h1>
            <p>프로젝트가 삭제되었거나 주소가 변경되었습니다.</p>
            <a class="link-button" href="#/">Work로 돌아가기</a>
          </div>
        </section>
      `;
      return;
    }

    startProjectSession(project.id);
    const tags = project.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");
    const links = project.links
      .map(
        (link) => `
          <a class="link-button" href="${escapeAttr(link.url)}" target="_blank" rel="noreferrer">
            ${escapeHtml(link.label)}
          </a>
        `
      )
      .join("");
    const storyBlocks = getStoryBlocks(project);

    app.innerHTML = `
      <article class="page project-page">
        <div class="page-inner detail-hero">
          <div class="detail-cover">
            <img src="${escapeAttr(project.hero)}" alt="${escapeAttr(project.title)} 대표 이미지" loading="eager" />
            <div class="detail-glass-card">
              <span>${escapeHtml(project.category)} / ${escapeHtml(project.year)}</span>
              <strong>${escapeHtml(project.title)}</strong>
              <small>${escapeHtml(project.subtitle)}</small>
            </div>
          </div>
          <header class="detail-heading">
            <div>
              <p class="section-kicker">${escapeHtml(project.category)} / ${escapeHtml(project.year)}</p>
              <h1>${escapeHtml(project.title)}</h1>
              <p>${escapeHtml(project.summary)}</p>
            </div>
            <aside class="detail-sidebar" aria-label="프로젝트 메타 정보">
              <div class="detail-stat"><span>Status</span><strong>${escapeHtml(project.status || "Portfolio")}</strong></div>
              <div class="detail-stat"><span>Role</span><strong>${escapeHtml(project.role || "Product Design")}</strong></div>
              <div class="tag-row">${tags}</div>
              <div class="link-row">${links}</div>
            </aside>
          </header>

          ${editMode ? renderStoryToolbar(project) : ""}
          <section class="story-canvas ${editMode ? "is-editable" : ""}" data-story-canvas data-project-id="${escapeAttr(project.id)}">
            ${renderStoryBlocks(storyBlocks)}
          </section>
          <section class="video-section">
            <div>
              <p class="section-kicker">Motion</p>
              <h2>Video</h2>
            </div>
            ${renderVideo(project.videoUrl)}
          </section>
        </div>
      </article>
    `;

    if (editMode) bindStoryEditing(project);
  }

  function getStoryBlocks(project) {
    if (Array.isArray(project.storyBlocks) && project.storyBlocks.length) return project.storyBlocks;
    project.storyBlocks = buildDefaultStoryBlocks(project);
    return project.storyBlocks;
  }

  function buildDefaultStoryBlocks(project) {
    const blocks = [];
    let y = 80;
    Object.entries(sectionLabels).forEach(([key, label], index) => {
      blocks.push(
        normalizeStoryBlock({
          id: `text-${key}`,
          type: "text",
          x: index % 2 === 0 ? 8 : 48,
          y,
          w: 42,
          size: index === 0 ? "large" : "medium",
          text: `${label}\n${project.sections[key] || "Edit Mode에서 내용을 추가하세요."}`
        })
      );
      if (project.gallery[index]) {
        blocks.push(
          normalizeStoryBlock({
            id: `image-${key}`,
            type: "image",
            x: index % 2 === 0 ? 54 : 8,
            y: y + 18,
            w: 38,
            src: project.gallery[index],
            caption: label
          })
        );
      }
      y += 430;
    });
    return blocks;
  }

  function renderStoryToolbar(project) {
    return `
      <div class="story-toolbar" aria-label="상세 페이지 캔버스 편집 도구">
        <div>
          <p class="section-kicker">Behance-style Canvas</p>
          <strong>Drag blocks. Drop images. Edit text in place.</strong>
        </div>
        <div class="story-actions">
          <button class="ghost-button" type="button" data-story-action="add-text" data-project-id="${escapeAttr(project.id)}">Add Text</button>
          <button class="ghost-button" type="button" data-story-action="add-image-url" data-project-id="${escapeAttr(project.id)}">Add Image URL</button>
          <button class="ghost-button" type="button" data-story-action="taller" data-project-id="${escapeAttr(project.id)}">More Space</button>
        </div>
      </div>
    `;
  }

  function renderStoryBlocks(blocks) {
    return blocks.map(renderStoryBlock).join("");
  }

  function renderStoryBlock(block) {
    const style = `left:${block.x}%;top:${block.y}px;width:${block.w}%;`;
    if (block.type === "spacer") {
      return `<div class="story-spacer" style="top:${Math.max(0, block.y)}px" data-block-id="${escapeAttr(block.id)}"></div>`;
    }

    if (block.type === "image") {
      return `
        <figure class="story-block story-image" style="${escapeAttr(style)}" data-block-id="${escapeAttr(block.id)}" draggable="${editMode}">
          ${editMode ? `<button class="block-delete" type="button" data-delete-block="${escapeAttr(block.id)}">Delete</button>` : ""}
          <img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.caption || "Project image")}" loading="lazy" />
          ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ""}
        </figure>
      `;
    }

    return `
      <div class="story-block story-text story-text-${escapeAttr(block.size)}" style="${escapeAttr(style)}" data-block-id="${escapeAttr(
        block.id
      )}" draggable="${editMode}">
        ${editMode ? `<button class="block-delete" type="button" data-delete-block="${escapeAttr(block.id)}">Delete</button>` : ""}
        <div class="story-copy" ${editMode ? "contenteditable=\"true\"" : ""} spellcheck="false">${formatStoryText(block.text)}</div>
      </div>
    `;
  }

  function bindStoryEditing(project) {
    const canvas = app.querySelector("[data-story-canvas]");
    if (!canvas) return;

    app.querySelectorAll("[data-story-action]").forEach((button) => {
      button.addEventListener("click", () => handleStoryAction(project, button.dataset.storyAction));
    });

    app.querySelectorAll("[data-delete-block]").forEach((button) => {
      button.addEventListener("click", () => {
        project.storyBlocks = getStoryBlocks(project).filter((block) => block.id !== button.dataset.deleteBlock);
        persistState();
        renderProject(project.id);
        showToast("블록을 삭제했습니다.");
      });
    });

    app.querySelectorAll(".story-copy").forEach((node) => {
      node.addEventListener("input", () => {
        const block = getStoryBlocks(project).find((item) => item.id === node.closest("[data-block-id]").dataset.blockId);
        if (!block) return;
        block.text = node.innerText.trim();
        persistState();
      });
    });

    app.querySelectorAll(".story-block").forEach((blockNode) => {
      blockNode.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", blockNode.dataset.blockId);
        event.dataTransfer.effectAllowed = "move";
      });
    });

    canvas.addEventListener("dragover", (event) => {
      event.preventDefault();
      canvas.classList.add("is-dragging");
    });

    canvas.addEventListener("dragleave", () => {
      canvas.classList.remove("is-dragging");
    });

    canvas.addEventListener("drop", (event) => {
      event.preventDefault();
      canvas.classList.remove("is-dragging");
      const rect = canvas.getBoundingClientRect();
      const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 82);
      const y = Math.max(0, event.clientY - rect.top + canvas.scrollTop);
      const blockId = event.dataTransfer.getData("text/plain");
      const files = Array.from(event.dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));

      if (files.length) {
        files.forEach((file, index) => addDroppedImage(project, file, x, y + index * 80));
        return;
      }

      const block = getStoryBlocks(project).find((item) => item.id === blockId);
      if (!block) return;
      block.x = Math.round(x);
      block.y = Math.round(y);
      persistState();
      renderProject(project.id);
    });
  }

  function handleStoryAction(project, action) {
    const blocks = getStoryBlocks(project);
    const nextY = Math.max(120, ...blocks.map((block) => block.y + 340));

    if (action === "add-text") {
      blocks.push(
        normalizeStoryBlock({
          id: `text-${Date.now()}`,
          type: "text",
          x: 12,
          y: nextY,
          w: 44,
          text: "New heading\nWrite your project story here.",
          size: "medium"
        })
      );
      persistState();
      renderProject(project.id);
      showToast("텍스트 블록을 추가했습니다.");
    }

    if (action === "add-image-url") {
      const src = window.prompt("이미지 URL을 입력하세요.");
      if (!src) return;
      blocks.push(
        normalizeStoryBlock({
          id: `image-${Date.now()}`,
          type: "image",
          x: 48,
          y: nextY,
          w: 42,
          src,
          caption: "New image"
        })
      );
      persistState();
      renderProject(project.id);
      showToast("이미지 블록을 추가했습니다.");
    }

    if (action === "taller") {
      blocks.push(
        normalizeStoryBlock({
          id: `spacer-${Date.now()}`,
          type: "spacer",
          x: 0,
          y: nextY + 420,
          w: 1,
          text: "",
          size: "small"
        })
      );
      persistState();
      renderProject(project.id);
      showToast("캔버스 아래 공간을 늘렸습니다.");
    }
  }

  function addDroppedImage(project, file, x, y) {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      getStoryBlocks(project).push(
        normalizeStoryBlock({
          id: `image-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          type: "image",
          x,
          y,
          w: 42,
          src: reader.result,
          caption: file.name.replace(/\.[^.]+$/, "")
        })
      );
      persistState();
      renderProject(project.id);
      showToast("드롭한 이미지를 캔버스에 추가했습니다.");
    });
    reader.readAsDataURL(file);
  }

  function formatStoryText(value) {
    const lines = escapeHtml(value || "").split("\n");
    const [first, ...rest] = lines;
    return `<h2>${first || "Untitled block"}</h2>${rest.map((line) => `<p>${line}</p>`).join("")}`;
  }

  function renderVideo(videoUrl) {
    if (!videoUrl) {
      return `<div class="video-placeholder">Edit Mode에서 YouTube embed URL 또는 비디오 URL을 추가하세요.</div>`;
    }

    const normalized = normalizeVideoUrl(videoUrl);
    if (normalized.type === "iframe") {
      return `
        <div class="video-frame">
          <iframe
            src="${escapeAttr(normalized.url)}"
            title="Project video"
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>
      `;
    }

    return `
      <div class="video-frame">
        <video src="${escapeAttr(normalized.url)}" controls preload="metadata"></video>
      </div>
    `;
  }

  function normalizeVideoUrl(url) {
    if (url.includes("youtube.com/embed/")) return { type: "iframe", url };
    const watchMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
    if (watchMatch) return { type: "iframe", url: `https://www.youtube.com/embed/${watchMatch[1]}` };
    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return { type: "iframe", url: `https://www.youtube.com/embed/${shortMatch[1]}` };
    return { type: "video", url };
  }

  function renderAbout() {
    const profile = state.profile;
    app.innerHTML = `
      <section class="page">
        <div class="page-inner about-layout">
          <div class="about-title">
            <p class="section-kicker">${escapeHtml(profile.role)}</p>
            <h1>${escapeHtml(profile.nameEn)}<br />${escapeHtml(profile.nameKo)}</h1>
            <p>${escapeHtml(profile.intro)}</p>
            <div class="contact-grid">
              ${contactItem("LinkedIn", profile.linkedin, "Profile")}
              ${contactItem("Behance", profile.behance, "Works")}
              ${contactItem("Email", `mailto:${profile.email}`, profile.email)}
              ${contactItem("Location", "", profile.location)}
            </div>
          </div>
          <aside class="about-facts" aria-label="프로필 요약">
            ${factBlock("Profile", [
              `Born ${profile.birthYear}`,
              profile.role,
              profile.location,
              profile.phone
            ])}
            ${factBlock("Education", profile.education)}
            ${factBlock("Experience", profile.experience)}
            ${factBlock("Awards", profile.awards)}
            ${factBlock("Tools", profile.tools)}
          </aside>
        </div>
      </section>
    `;
  }

  function contactItem(label, href, value) {
    const content = `<span>${escapeHtml(label)}</span><strong>${escapeHtml(value || "Editable in Edit Mode")}</strong>`;
    if (!href || href === "mailto:Add email in Edit Mode") return `<div class="contact-link">${content}</div>`;
    return `<a class="contact-link" href="${escapeAttr(href)}" target="_blank" rel="noreferrer">${content}</a>`;
  }

  function factBlock(title, items) {
    return `
      <section class="fact-block">
        <h2>${escapeHtml(title)}</h2>
        <ul>${toArray(items).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </section>
    `;
  }

  function renderPress() {
    const cards = state.press
      .map(
        (item) => `
          <article class="press-card">
            <a href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer" aria-label="${escapeAttr(item.title)} 기사 열기">
              <img src="${escapeAttr(item.thumbnail)}" alt="${escapeAttr(item.title)} 썸네일" loading="lazy" />
            </a>
            <div class="press-card-content">
              <div class="source-row">
                <span>${escapeHtml(item.source)}</span>
                <span>${escapeHtml(item.date)}</span>
              </div>
              <h2><a href="${escapeAttr(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.title)}</a></h2>
              <p>${escapeHtml(item.summary)}</p>
            </div>
          </article>
        `
      )
      .join("");

    app.innerHTML = `
      <section class="page">
        <div class="page-inner">
          <header class="press-title">
            <div>
              <p class="section-kicker">Press Archive</p>
              <h1>Articles, awards, and public references.</h1>
              <p>손민형, Ventri, James Dyson Award, CES, 제품 디자인 관련 공개 보도를 정적 데이터로 모아둔 페이지입니다.</p>
            </div>
            <a class="link-button" href="#/">Work 보기</a>
          </header>
          <div class="press-grid">${cards}</div>
        </div>
      </section>
    `;
  }

  function renderAnalytics() {
    if (!editMode) {
      app.innerHTML = `
        <section class="page locked-panel">
          <div>
            <p class="section-kicker">Edit Mode Only</p>
            <h1>Analytics is locked.</h1>
            <p>방문 데이터와 프로젝트 반응은 제작자용 정보입니다. 상단의 Edit 버튼으로 전환하면 로컬 분석 대시보드가 열립니다.</p>
          </div>
        </section>
      `;
      return;
    }

    const report = buildAnalyticsReport();
    const bars = report.projects
      .map(
        (item) => `
          <div class="bar-row">
            <header>
              <strong>${escapeHtml(item.title)}</strong>
              <span>${item.clicks} clicks / ${formatDuration(item.dwellMs)}</span>
            </header>
            <div class="bar-track">
              <div class="bar-fill" style="width:${Math.max(5, item.percent)}%"></div>
            </div>
          </div>
        `
      )
      .join("");

    const recent = analytics.recent
      .slice(0, 10)
      .map(
        (item) => `
          <div class="recent-item">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.type)} / ${formatDate(item.at)}</span>
          </div>
        `
      )
      .join("");

    app.innerHTML = `
      <section class="page">
        <div class="page-inner">
          <header class="analytics-title">
            <div>
              <p class="section-kicker">Local Analytics</p>
              <h1>Portfolio reactions, kept in this browser.</h1>
              <p>백엔드 없이 클릭 수, 체류 시간, 최근 방문을 localStorage에 기록합니다. 공유 링크 전체 방문자를 대표하지는 않지만 편집 테스트와 자기 점검에 바로 쓸 수 있습니다.</p>
            </div>
            <button class="ghost-button" id="clearAnalyticsButton" type="button">Clear Analytics</button>
          </header>
          <div class="analytics-grid">
            ${metricCard("Total Clicks", report.totalClicks)}
            ${metricCard("Avg. Dwell", formatDuration(report.averageDwell))}
            ${metricCard("Top Project", report.topProject)}
            ${metricCard("Visits", analytics.visits.length)}
          </div>
          <div class="analytics-panels">
            <section class="analytics-panel">
              <h2>Project Ranking</h2>
              <div class="bar-list">${bars || "아직 기록된 프로젝트 반응이 없습니다."}</div>
            </section>
            <section class="analytics-panel">
              <h2>Recent Activity</h2>
              <div class="recent-list">${recent || "최근 기록이 없습니다."}</div>
            </section>
          </div>
        </div>
      </section>
    `;

    document.querySelector("#clearAnalyticsButton").addEventListener("click", clearAnalytics);
  }

  function metricCard(label, value) {
    return `<div class="metric-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`;
  }

  function buildAnalyticsReport() {
    const maxClicks = Math.max(
      1,
      ...state.projects.map((project) => getProjectStats(project.id).clicks)
    );
    const projects = state.projects
      .map((project) => {
        const stats = getProjectStats(project.id);
        return {
          id: project.id,
          title: project.title,
          clicks: stats.clicks,
          dwellMs: stats.dwellMs,
          views: stats.views,
          percent: Math.round((stats.clicks / maxClicks) * 100)
        };
      })
      .sort((a, b) => b.clicks - a.clicks || b.dwellMs - a.dwellMs);

    const totalClicks = projects.reduce((sum, item) => sum + item.clicks, 0);
    const totalDwell = projects.reduce((sum, item) => sum + item.dwellMs, 0);
    const totalViews = projects.reduce((sum, item) => sum + item.views, 0);

    return {
      projects,
      totalClicks,
      averageDwell: totalViews ? totalDwell / totalViews : 0,
      topProject: projects[0] && projects[0].clicks ? projects[0].title : "No data"
    };
  }

  function renderAdminList() {
    if (!editMode) return;
    const target = document.querySelector("#projectAdminList");
    target.innerHTML = state.projects
      .map(
        (project, index) => `
          <article class="admin-item">
            <header>
              <div>
                <h3>${escapeHtml(project.title)}</h3>
                <p>${escapeHtml(project.category)} / ${escapeHtml(project.year)}</p>
              </div>
              <span class="meta-chip">${getProjectStats(project.id).clicks} clicks</span>
            </header>
            <div class="mini-actions">
              <button type="button" data-admin-action="up" data-id="${escapeAttr(project.id)}" ${
                index === 0 ? "disabled" : ""
              }>Up</button>
              <button type="button" data-admin-action="down" data-id="${escapeAttr(project.id)}" ${
                index === state.projects.length - 1 ? "disabled" : ""
              }>Down</button>
              <button type="button" data-admin-action="edit" data-id="${escapeAttr(project.id)}">Edit</button>
              <button type="button" data-admin-action="duplicate" data-id="${escapeAttr(project.id)}">Duplicate</button>
              <button class="danger" type="button" data-admin-action="delete" data-id="${escapeAttr(project.id)}">Delete</button>
            </div>
          </article>
        `
      )
      .join("");

    target.querySelectorAll("[data-admin-action]").forEach((button) => {
      button.addEventListener("click", () => handleAdminAction(button.dataset.adminAction, button.dataset.id));
    });
  }

  function handleAdminAction(action, id) {
    const index = state.projects.findIndex((project) => project.id === id);
    if (index < 0) return;

    if (action === "up" && index > 0) {
      [state.projects[index - 1], state.projects[index]] = [state.projects[index], state.projects[index - 1]];
      saveAndRender("프로젝트 순서를 변경했습니다.");
    } else if (action === "down" && index < state.projects.length - 1) {
      [state.projects[index], state.projects[index + 1]] = [state.projects[index + 1], state.projects[index]];
      saveAndRender("프로젝트 순서를 변경했습니다.");
    } else if (action === "edit") {
      openProjectModal(state.projects[index]);
    } else if (action === "duplicate") {
      const copy = clone(state.projects[index]);
      copy.id = uniqueId(`${copy.id}-copy`);
      copy.title = `${copy.title} Copy`;
      state.projects.splice(index + 1, 0, copy);
      saveAndRender("프로젝트를 복제했습니다.");
    } else if (action === "delete") {
      const confirmed = window.confirm(`${state.projects[index].title} 프로젝트를 삭제할까요?`);
      if (!confirmed) return;
      state.projects.splice(index, 1);
      saveAndRender("프로젝트를 삭제했습니다.");
    }
  }

  function renderStyleControls() {
    if (!editMode) return;
    const target = document.querySelector("#styleControls");
    target.innerHTML = styleControls
      .map((control) => {
        const value = state.settings[control.key];
        return `
          <div class="control-field">
            <label for="${control.key}">${control.label}</label>
            <input
              id="${control.key}"
              type="range"
              min="${control.min}"
              max="${control.max}"
              step="${control.step}"
              value="${escapeAttr(value)}"
              data-style-key="${control.key}"
            />
            <output for="${control.key}">${formatControlValue(control.key, value)}</output>
          </div>
        `;
      })
      .join("");

    target.querySelectorAll("[data-style-key]").forEach((input) => {
      input.addEventListener("input", () => {
        const key = input.dataset.styleKey;
        const numericValue = Number(input.value);
        state.settings[key] = numericValue;
        input.nextElementSibling.textContent = formatControlValue(key, numericValue);
        applySettings();
        persistState();
      });
    });
  }

  function renderProfileForm() {
    if (!editMode) return;
    const form = document.querySelector("#profileForm");
    const profile = state.profile;
    const fields = [
      ["nameKo", "Korean name", "input"],
      ["nameEn", "English name", "input"],
      ["birthYear", "Birth year", "input"],
      ["role", "Role", "input"],
      ["location", "Location", "input"],
      ["email", "Email", "input"],
      ["phone", "Phone", "input"],
      ["linkedin", "LinkedIn URL", "input"],
      ["behance", "Behance URL", "input"],
      ["intro", "Intro", "textarea"],
      ["education", "Education", "textarea", true],
      ["experience", "Experience", "textarea", true],
      ["awards", "Awards", "textarea", true],
      ["tools", "Tools", "textarea", true]
    ];

    form.innerHTML = fields
      .map(([key, label, type, isArray]) => formField(label, key, isArray ? toArray(profile[key]).join("\n") : profile[key], type, isArray))
      .join("");

    form.querySelectorAll("[data-profile-key]").forEach((input) => {
      input.addEventListener("change", () => {
        const key = input.dataset.profileKey;
        state.profile[key] = input.dataset.array === "true" ? toArray(input.value) : input.value;
        persistState();
        showToast("프로필을 저장했습니다.");
        if (getRoute().name === "about") renderAbout();
      });
    });
  }

  function formField(label, key, value, type = "input", isArray = false) {
    if (type === "textarea") {
      return `
        <div class="form-field">
          <label for="profile-${key}">${escapeHtml(label)}</label>
          <textarea id="profile-${key}" data-profile-key="${escapeAttr(key)}" data-array="${isArray}">${escapeHtml(
            value || ""
          )}</textarea>
        </div>
      `;
    }

    return `
      <div class="form-field">
        <label for="profile-${key}">${escapeHtml(label)}</label>
        <input id="profile-${key}" data-profile-key="${escapeAttr(key)}" data-array="${isArray}" value="${escapeAttr(
          value || ""
        )}" />
      </div>
    `;
  }

  function openProjectModal(project) {
    editingProjectId = project ? project.id : null;
    pendingMedia = {};
    const value = normalizeProject(project || {});
    projectModalTitle.textContent = project ? "Edit Project" : "Add Project";
    projectForm.innerHTML = projectFormMarkup(value);
    bindProjectMediaInputs();
    modal.hidden = false;
    projectForm.querySelector("input")?.focus();
  }

  function closeProjectModal() {
    modal.hidden = true;
    editingProjectId = null;
    pendingMedia = {};
  }

  function projectFormMarkup(project) {
    const sections = project.sections || emptySections();
    return `
      <div class="form-grid">
        ${projectInput("title", "Title", project.title)}
        ${projectInput("category", "Category", project.category)}
        ${projectInput("year", "Year", project.year)}
        ${projectInput("status", "Status", project.status)}
      </div>
      ${projectTextarea("subtitle", "One-line description", project.subtitle)}
      ${projectTextarea("summary", "Project introduction", project.summary)}
      ${projectInput("role", "Role", project.role)}
      ${projectInput("thumbnail", "Thumbnail URL or Data URL", project.thumbnail)}
      ${mediaInput("thumbnailFile", "Upload thumbnail")}
      ${projectInput("hero", "Hero image URL or Data URL", project.hero)}
      ${mediaInput("heroFile", "Upload hero image")}
      ${projectInput("tags", "Tags, comma separated", project.tags.join(", "))}
      ${projectTextarea("gallery", "Gallery image URLs, one per line", project.gallery.join("\n"))}
      ${mediaInput("galleryFile", "Add gallery image")}
      ${projectInput("videoUrl", "Video URL, YouTube embed URL, or MP4 URL", project.videoUrl)}
      ${projectTextarea("problem", "Problem", sections.problem)}
      ${projectTextarea("process", "Process", sections.process)}
      ${projectTextarea("research", "Research", sections.research)}
      ${projectTextarea("ideation", "Ideation", sections.ideation)}
      ${projectTextarea("prototype", "Prototype", sections.prototype)}
      ${projectTextarea("result", "Final Result", sections.result)}
      ${projectTextarea(
        "links",
        "Links, one per line as Label | URL",
        project.links.map((link) => `${link.label} | ${link.url}`).join("\n")
      )}
      <div class="form-actions">
        <button class="ghost-button" type="button" data-close-modal>Cancel</button>
        <button class="primary-button" type="submit">Save Project</button>
      </div>
    `;
  }

  function projectInput(name, label, value) {
    return `
      <div class="form-field">
        <label for="project-${name}">${escapeHtml(label)}</label>
        <input id="project-${name}" name="${escapeAttr(name)}" value="${escapeAttr(value || "")}" />
      </div>
    `;
  }

  function projectTextarea(name, label, value) {
    return `
      <div class="form-field">
        <label for="project-${name}">${escapeHtml(label)}</label>
        <textarea id="project-${name}" name="${escapeAttr(name)}">${escapeHtml(value || "")}</textarea>
      </div>
    `;
  }

  function mediaInput(name, label) {
    return `
      <label class="file-button">
        ${escapeHtml(label)}
        <input name="${escapeAttr(name)}" type="file" accept="image/*" data-media-input="${escapeAttr(name)}" />
      </label>
    `;
  }

  function bindProjectMediaInputs() {
    projectForm.querySelectorAll("[data-media-input]").forEach((input) => {
      input.addEventListener("change", () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.addEventListener("load", () => {
          pendingMedia[input.dataset.mediaInput] = reader.result;
          if (input.dataset.mediaInput === "thumbnailFile") {
            projectForm.elements.thumbnail.value = reader.result;
          } else if (input.dataset.mediaInput === "heroFile") {
            projectForm.elements.hero.value = reader.result;
          } else if (input.dataset.mediaInput === "galleryFile") {
            const current = projectForm.elements.gallery.value.trim();
            projectForm.elements.gallery.value = `${current}${current ? "\n" : ""}${reader.result}`;
          }
          showToast("이미지를 로컬 데이터로 불러왔습니다.");
        });
        reader.readAsDataURL(file);
      });
    });

    projectForm.querySelectorAll("[data-close-modal]").forEach((button) => {
      button.addEventListener("click", closeProjectModal);
    });
  }

  function submitProjectForm(event) {
    event.preventDefault();
    const formData = new FormData(projectForm);
    const title = String(formData.get("title") || "Untitled Project").trim();
    const existing = editingProjectId ? state.projects.find((project) => project.id === editingProjectId) : null;
    const project = normalizeProject({
      id: existing ? existing.id : uniqueId(slugify(title)),
      title,
      subtitle: formData.get("subtitle"),
      category: formData.get("category"),
      year: formData.get("year"),
      status: formData.get("status"),
      thumbnail: formData.get("thumbnail"),
      hero: formData.get("hero") || formData.get("thumbnail"),
      summary: formData.get("summary"),
      tags: toArray(formData.get("tags")),
      role: formData.get("role"),
      sections: {
        problem: formData.get("problem"),
        process: formData.get("process"),
        research: formData.get("research"),
        ideation: formData.get("ideation"),
        prototype: formData.get("prototype"),
        result: formData.get("result")
      },
      storyBlocks: existing ? existing.storyBlocks : null,
      gallery: toArray(formData.get("gallery")),
      videoUrl: formData.get("videoUrl"),
      links: parseLinks(formData.get("links"))
    });

    if (existing) {
      const index = state.projects.findIndex((item) => item.id === existing.id);
      state.projects[index] = project;
    } else {
      state.projects.push(project);
    }

    closeProjectModal();
    saveAndRender("프로젝트를 저장했습니다.");
  }

  function parseLinks(value) {
    return toArray(value)
      .map((line) => {
        const [label, url] = line.split("|").map((part) => part.trim());
        return label && url ? { label, url } : null;
      })
      .filter(Boolean);
  }

  function saveAndRender(message) {
    persistState();
    render();
    showToast(message);
  }

  function sortProjectsByClicks() {
    state.projects.sort((a, b) => getProjectStats(b.id).clicks - getProjectStats(a.id).clicks);
    saveAndRender("클릭 수 기준으로 프로젝트를 정렬했습니다.");
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "son-minhyung-portfolio-data.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importState(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = normalizeState(parsed);
        persistState();
        render();
        showToast("JSON 데이터를 불러왔습니다.");
      } catch (error) {
        showToast("JSON 파일을 읽지 못했습니다.");
      }
    });
    reader.readAsText(file);
    event.target.value = "";
  }

  function resetLocalData() {
    const confirmed = window.confirm("로컬에 저장된 CMS 데이터와 분석 데이터를 모두 초기화할까요?");
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ANALYTICS_KEY);
    state = clone(window.PORTFOLIO_DEFAULTS);
    analytics = loadAnalytics();
    render();
    showToast("로컬 데이터를 초기화했습니다.");
  }

  function trackPageVisit(route) {
    const path = route.name === "project" ? `project:${route.id}` : route.name;
    const last = analytics.visits[0];
    const now = Date.now();
    if (last && last.path === path && now - last.at < 2000) return;
    analytics.visits.unshift({ path, at: now });
    analytics.visits = analytics.visits.slice(0, 80);
    persistAnalytics();
  }

  function addProjectClick(projectId) {
    const project = state.projects.find((item) => item.id === projectId);
    if (!project) return;
    const stats = getProjectStats(projectId);
    stats.clicks += 1;
    addRecent("Project click", project.title);
    persistAnalytics();
  }

  function startProjectSession(projectId) {
    if (activeProjectSession && activeProjectSession.id === projectId) return;
    finishActiveProjectSession();
    activeProjectSession = { id: projectId, start: Date.now() };
    const stats = getProjectStats(projectId);
    stats.views += 1;
    persistAnalytics();
  }

  function finishActiveProjectSession() {
    if (!activeProjectSession) return;
    const elapsed = Date.now() - activeProjectSession.start;
    const project = state.projects.find((item) => item.id === activeProjectSession.id);
    if (elapsed > 900 && project) {
      const stats = getProjectStats(activeProjectSession.id);
      stats.dwellMs += elapsed;
      addRecent(`Dwell ${formatDuration(elapsed)}`, project.title);
      persistAnalytics();
    }
    activeProjectSession = null;
  }

  function getProjectStats(projectId) {
    if (!analytics.projectStats[projectId]) {
      analytics.projectStats[projectId] = { clicks: 0, dwellMs: 0, views: 0 };
    }
    return analytics.projectStats[projectId];
  }

  function addRecent(type, title) {
    analytics.recent.unshift({
      type,
      title,
      at: Date.now(),
      session: sessionStorage.getItem(SESSION_KEY)
    });
    analytics.recent = analytics.recent.slice(0, 40);
  }

  function clearAnalytics() {
    const confirmed = window.confirm("이 브라우저의 분석 데이터를 초기화할까요?");
    if (!confirmed) return;
    analytics = { projectStats: {}, recent: [], visits: [] };
    persistAnalytics();
    renderAnalytics();
    showToast("분석 데이터를 초기화했습니다.");
  }

  function formatDuration(ms) {
    if (!ms) return "0s";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const rest = seconds % 60;
    return `${minutes}m ${rest}s`;
  }

  function formatDate(timestamp) {
    return new Intl.DateTimeFormat("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function formatControlValue(key, value) {
    const unit = cssUnits[key] || "";
    if (key === "thumbnailOpacity" || key === "fontScale") return `${Number(value).toFixed(2)}${unit}`;
    return `${value}${unit}`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  function uniqueId(base) {
    let candidate = base || "project";
    let count = 2;
    while (state.projects.some((project) => project.id === candidate)) {
      candidate = `${base}-${count}`;
      count += 1;
    }
    return candidate;
  }

  function slugify(value) {
    return String(value || "project")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9가-힣]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function toArray(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    return String(value || "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }
})();
