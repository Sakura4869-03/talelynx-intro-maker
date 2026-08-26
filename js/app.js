/* =========================================================
   Talelynx Intro Maker
   js/app.js
========================================================= */

"use strict";


/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY = "talelynxIntroMakerData";
const MAX_CHARACTERS = 10000;


/* =========================================================
   HELPERS
========================================================= */

/**
 * ID生成
 */
function createId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return (
    "block-" +
    Date.now() +
    "-" +
    Math.random().toString(36).slice(2)
  );
}


/**
 * HTMLエスケープ
 */
function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/**
 * style属性向けに簡易整形
 */
function cleanStyle(style = "") {
  return style
    .replace(/\s+/g, " ")
    .replace(/\s*:\s*/g, ":")
    .replace(/\s*;\s*/g, ";")
    .trim();
}


/**
 * HEXカラーをinput[type=color]で使える形にする
 */
function normalizeColor(color, fallback = "#000000") {
  if (!color) {
    return fallback;
  }

  const value = String(color).trim();

  if (/^#[0-9a-f]{6}$/i.test(value)) {
    return value;
  }

  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return (
      "#" +
      value[1] +
      value[1] +
      value[2] +
      value[2] +
      value[3] +
      value[3]
    );
  }

  return fallback;
}


/**
 * 数値を範囲内に収める
 */
function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}


/**
 * JSONコピー
 */
function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}


/* =========================================================
   THEMES
========================================================= */

const themes = {
  studio: {
    name: "STUDIO",
    accent: "#9b63ff",
    accentLight: "#c79cff",
    background: "#f8f4ed",
    text: "#16131a",
    heroBackground: "#b783f2",
    heroText: "#ffffff"
  },

  dossier: {
    name: "DOSSIER",
    accent: "#73665a",
    accentLight: "#a79888",
    background: "#eee7d8",
    text: "#211d19",
    heroBackground: "#313034",
    heroText: "#f4ecdc"
  },

  academy: {
    name: "ACADEMY",
    accent: "#5670b8",
    accentLight: "#91a4db",
    background: "#f5f6f8",
    text: "#182037",
    heroBackground: "#728ac6",
    heroText: "#ffffff"
  }
};


/* =========================================================
   DEFAULT BLOCKS
========================================================= */

function createDefaultBlocks() {
  return [
    {
      id: createId(),
      type: "hero",

      text: "017",
      subText: "ここに肩書きを入力",

      color: "#ffffff",
      background: "#b783f2",

      fontSize: 64,
      align: "left",
      padding: 20
    },

    {
      id: createId(),
      type: "heading",

      label: "CHARACTER NAME",
      text: "キャラクター名",

      color: "#16131a",
      background: "#f8f4ed",

      fontSize: 35,
      align: "left",
      padding: 20
    },

    {
      id: createId(),
      type: "text",

      text: "ここにキャッチコピーを入力してください。",

      color: "#16131a",
      background: "#f8f4ed",

      fontSize: 14,
      align: "left",
      padding: 20
    },

    {
      id: createId(),
      type: "profile",

      text: "29歳 / 186cm / 12月24日",

      color: "#16131a",
      background: "#f8f4ed",

      fontSize: 14,
      align: "left",
      padding: 20
    },

    {
      id: createId(),
      type: "text",

      text:
        "キャラクターの紹介文を入力してください。\n性格、経歴、能力、関係性などを自由に記載できます。",

      color: "#16131a",
      background: "#f8f4ed",

      fontSize: 14,
      align: "left",
      padding: 20
    }
  ];
}


/* =========================================================
   STATE
========================================================= */

let state = {
  theme: "studio",
  editMode: "direct",
  blocks: createDefaultBlocks()
};

let selectedId = null;


/* =========================================================
   DOM
========================================================= */

const canvas = document.getElementById("canvas");

const inspector = document.getElementById("inspector");
const noSelection = document.getElementById("noSelection");

const textInput = document.getElementById("textInput");

const colorInput = document.getElementById("colorInput");
const colorText = document.getElementById("colorText");

const bgInput = document.getElementById("bgInput");
const bgText = document.getElementById("bgText");

const sizeInput = document.getElementById("sizeInput");
const sizeValue = document.getElementById("sizeValue");

const alignInput = document.getElementById("alignInput");

const paddingInput = document.getElementById("paddingInput");
const paddingValue = document.getElementById("paddingValue");

const htmlOutput = document.getElementById("htmlOutput");

const charCount = document.getElementById("charCount");
const remaining = document.getElementById("remaining");

const counter = document.getElementById("counter");

const characterProgressBar =
  document.getElementById("characterProgressBar");

const copyButton =
  document.getElementById("copyButton");

const resetButton =
  document.getElementById("resetButton");

const saveStatus =
  document.getElementById("saveStatus");

const formEditMode =
  document.getElementById("formEditMode");

const directEditMode =
  document.getElementById("directEditMode");


/* =========================================================
   LOAD
========================================================= */

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved);

    if (
      parsed &&
      Array.isArray(parsed.blocks)
    ) {
      state = {
        theme:
          themes[parsed.theme]
            ? parsed.theme
            : "studio",

        editMode:
          parsed.editMode === "form"
            ? "form"
            : "direct",

        blocks:
          parsed.blocks.map(normalizeBlock)
      };
    }
  } catch (error) {
    console.warn(
      "保存データを読み込めませんでした。",
      error
    );
  }
}


/**
 * 古い保存データでもある程度動くよう補完
 */
function normalizeBlock(block) {
  return {
    id:
      block.id ||
      createId(),

    type:
      block.type ||
      "text",

    label:
      block.label ||
      "",

    text:
      typeof block.text === "string"
        ? block.text
        : "",

    subText:
      typeof block.subText === "string"
        ? block.subText
        : "",

    color:
      block.color ||
      "#16131a",

    background:
      block.background ||
      "#f8f4ed",

    fontSize:
      Number(block.fontSize) || 14,

    align:
      ["left", "center", "right"].includes(
        block.align
      )
        ? block.align
        : "left",

    padding:
      Number.isFinite(
        Number(block.padding)
      )
        ? Number(block.padding)
        : 20
  };
}


/* =========================================================
   SAVE
========================================================= */

let saveTimer = null;

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );

    showSavedStatus();
  } catch (error) {
    console.warn(
      "自動保存に失敗しました。",
      error
    );
  }
}


function scheduleSave() {
  clearTimeout(saveTimer);

  if (saveStatus) {
    saveStatus.textContent =
      "● 保存中";
  }

  saveTimer = setTimeout(
    saveState,
    250
  );
}


function showSavedStatus() {
  if (!saveStatus) {
    return;
  }

  saveStatus.textContent =
    "● 自動保存";
}


/* =========================================================
   BLOCK HELPERS
========================================================= */

function getSelectedBlock() {
  return state.blocks.find(
    block =>
      block.id === selectedId
  );
}


function getSelectedIndex() {
  return state.blocks.findIndex(
    block =>
      block.id === selectedId
  );
}


/* =========================================================
   EDIT MODE
========================================================= */

function setEditMode(mode) {
  state.editMode =
    mode === "form"
      ? "form"
      : "direct";

  updateModeButtons();
  renderCanvas();
  scheduleSave();
}


function updateModeButtons() {
  if (
    state.editMode === "direct"
  ) {
    directEditMode?.classList.add(
      "active"
    );

    formEditMode?.classList.remove(
      "active"
    );
  } else {
    formEditMode?.classList.add(
      "active"
    );

    directEditMode?.classList.remove(
      "active"
    );
  }
}


formEditMode?.addEventListener(
  "click",
  () => {
    setEditMode("form");
  }
);


directEditMode?.addEventListener(
  "click",
  () => {
    setEditMode("direct");
  }
);


/* =========================================================
   MAIN RENDER
========================================================= */

function render() {
  renderCanvas();
  updateThemeButtons();
  updateModeButtons();
  updateInspector();
  generateHTML();
}


/* =========================================================
   CANVAS
========================================================= */

function renderCanvas() {
  if (!canvas) {
    return;
  }

  canvas.innerHTML = "";

  state.blocks.forEach(
    block => {
      const element =
        renderBlock(block);

      canvas.appendChild(element);
    }
  );
}


/* =========================================================
   BLOCK RENDERER
========================================================= */

function renderBlock(block) {
  const wrapper =
    document.createElement("div");

  wrapper.className =
    "editor-block";

  wrapper.dataset.id =
    block.id;

  wrapper.dataset.typeLabel =
    getBlockLabel(block.type);

  if (
    block.id === selectedId
  ) {
    wrapper.classList.add(
      "selected"
    );
  }

  wrapper.style.color =
    block.color;

  wrapper.style.background =
    block.background;

  wrapper.style.fontSize =
    `${block.fontSize}px`;

  wrapper.style.textAlign =
    block.align;

  wrapper.style.padding =
    `${block.padding}px`;


  /* -----------------------------------------------------
     SELECT
  ----------------------------------------------------- */

  wrapper.addEventListener(
    "click",
    event => {
      event.stopPropagation();

      selectBlock(
        block.id
      );
    }
  );


  /* -----------------------------------------------------
     HERO
  ----------------------------------------------------- */

  if (block.type === "hero") {
    wrapper.classList.add("hero");

    const heroTop =
      document.createElement("div");

    heroTop.className =
      "hero-top editable";

    heroTop.textContent =
      block.text;

    setupEditable(
      heroTop,
      block,
      "text"
    );


    const heroCenter =
      document.createElement("div");

    heroCenter.className =
      "hero-center";

    heroCenter.textContent =
      "✦";


    const caption =
      document.createElement("div");

    caption.className =
      "hero-caption";


    const captionText =
      document.createElement("span");

    captionText.className =
      "editable";

    captionText.textContent =
      block.subText;

    setupEditable(
      captionText,
      block,
      "subText"
    );

    caption.appendChild(
      captionText
    );

    wrapper.append(
      heroTop,
      heroCenter,
      caption
    );

    return wrapper;
  }


  /* -----------------------------------------------------
     HEADING
  ----------------------------------------------------- */

  if (
    block.type === "heading"
  ) {
    const label =
      document.createElement("div");

    label.className =
      "heading-label";

    label.textContent =
      block.label ||
      "SECTION TITLE";


    const text =
      document.createElement("div");

    text.className =
      "heading-text editable";

    text.textContent =
      block.text;

    setupEditable(
      text,
      block,
      "text"
    );

    wrapper.append(
      label,
      text
    );

    return wrapper;
  }


  /* -----------------------------------------------------
     IMAGE
  ----------------------------------------------------- */

  if (
    block.type === "image"
  ) {
    const placeholder =
      document.createElement("div");

    placeholder.className =
      "image-placeholder";

    const inner =
      document.createElement("div");


    const title =
      document.createElement("div");

    title.textContent =
      "IMAGE AREA";


    const imageCode =
      document.createElement("strong");

    imageCode.textContent =
      `{{img:${block.text || "main"}}}`;

    inner.append(
      title,
      document.createElement("br"),
      imageCode
    );

    placeholder.appendChild(
      inner
    );

    wrapper.appendChild(
      placeholder
    );

    return wrapper;
  }


  /* -----------------------------------------------------
     PROFILE
  ----------------------------------------------------- */

  if (
    block.type === "profile"
  ) {
    renderProfileBlock(
      wrapper,
      block
    );

    return wrapper;
  }


  /* -----------------------------------------------------
     TEXT
  ----------------------------------------------------- */

  const text =
    document.createElement("div");

  text.className =
    "editable";

  text.textContent =
    block.text;

  text.style.whiteSpace =
    "pre-wrap";

  text.style.lineHeight =
    "1.8";

  setupEditable(
    text,
    block,
    "text"
  );

  wrapper.appendChild(text);

  return wrapper;
}


/* =========================================================
   PROFILE RENDER
========================================================= */

function renderProfileBlock(
  wrapper,
  block
) {
  const values =
    parseProfileValues(
      block.text
    );

  const profileGrid =
    document.createElement("div");

  profileGrid.className =
    "profile-grid";


  const profileData = [
    {
      label: "AGE",
      value:
        values[0] || "--"
    },

    {
      label: "HEIGHT",
      value:
        values[1] || "---cm"
    },

    {
      label: "BIRTHDAY",
      value:
        values[2] || "--月--日"
    }
  ];


  profileData.forEach(
    (item, index) => {
      const profileItem =
        document.createElement(
          "div"
        );

      profileItem.className =
        "profile-item";


      const label =
        document.createElement(
          "div"
        );

      label.className =
        "profile-label";

      label.textContent =
        item.label;


      const value =
        document.createElement(
          "div"
        );

      value.className =
        "profile-value editable";

      value.textContent =
        item.value;


      if (
        state.editMode ===
        "direct"
      ) {
        value.contentEditable =
          "true";

        value.spellcheck =
          false;


        value.addEventListener(
          "focus",
          () => {
            selectBlock(
              block.id,
              false
            );
          }
        );


        value.addEventListener(
          "input",
          () => {
            const current =
              parseProfileValues(
                block.text
              );

            current[index] =
              value.innerText;

            block.text =
              current.join(" / ");

            updateInspectorText();
            updateOutputOnly();
          }
        );
      }


      profileItem.append(
        label,
        value
      );

      profileGrid.appendChild(
        profileItem
      );
    }
  );

  wrapper.appendChild(
    profileGrid
  );
}


/* =========================================================
   CONTENTEDITABLE
========================================================= */

function setupEditable(
  element,
  block,
  property = "text"
) {
  if (
    state.editMode !== "direct"
  ) {
    element.contentEditable =
      "false";

    return;
  }

  element.contentEditable =
    "true";

  element.spellcheck =
    false;


  element.addEventListener(
    "focus",
    () => {
      selectBlock(
        block.id,
        false
      );
    }
  );


  element.addEventListener(
    "keydown",
    event => {
      /*
       * HEROの大きい番号や
       * headingはEnterで改行させない
       */
      if (
        (
          block.type === "hero" ||
          block.type === "heading"
        ) &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        element.blur();
      }
    }
  );


  element.addEventListener(
    "input",
    () => {
      block[property] =
        element.innerText;

      updateInspectorText();
      updateOutputOnly();
    }
  );
}


/* =========================================================
   BLOCK LABEL
========================================================= */

function getBlockLabel(type) {
  const labels = {
    hero: "HERO",
    heading: "TITLE",
    text: "TEXT",
    image: "IMAGE",
    profile: "PROFILE"
  };

  return labels[type] || "BLOCK";
}


/* =========================================================
   SELECT BLOCK
========================================================= */

function selectBlock(
  id,
  refreshInspector = true
) {
  selectedId = id;


  document
    .querySelectorAll(
      ".editor-block"
    )
    .forEach(element => {
      element.classList.toggle(
        "selected",
        element.dataset.id === id
      );
    });


  if (
    refreshInspector
  ) {
    updateInspector();
  }
}


/**
 * キャンバス余白クリックで選択解除
 */
canvas?.addEventListener(
  "click",
  event => {
    if (
      event.target !== canvas
    ) {
      return;
    }

    clearSelection();
  }
);


function clearSelection() {
  selectedId = null;

  document
    .querySelectorAll(
      ".editor-block"
    )
    .forEach(element => {
      element.classList.remove(
        "selected"
      );
    });

  updateInspector();
}


/* =========================================================
   INSPECTOR
========================================================= */

function updateInspector() {
  const block =
    getSelectedBlock();

  if (!block) {
    if (inspector) {
      inspector.hidden = true;
    }

    if (noSelection) {
      noSelection.hidden = false;
    }

    return;
  }


  if (inspector) {
    inspector.hidden = false;
  }

  if (noSelection) {
    noSelection.hidden = true;
  }


  textInput.value =
    block.text || "";

  colorInput.value =
    normalizeColor(
      block.color,
      "#16131a"
    );

  colorText.value =
    block.color;

  bgInput.value =
    normalizeColor(
      block.background,
      "#f8f4ed"
    );

  bgText.value =
    block.background;

  sizeInput.value =
    clamp(
      Number(block.fontSize) ||
      14,
      10,
      72
    );

  sizeValue.textContent =
    sizeInput.value;

  alignInput.value =
    block.align;

  paddingInput.value =
    clamp(
      Number(block.padding) ||
      0,
      0,
      60
    );

  paddingValue.textContent =
    paddingInput.value;
}


function updateInspectorText() {
  const block =
    getSelectedBlock();

  if (
    !block ||
    !textInput
  ) {
    return;
  }

  textInput.value =
    block.text || "";
}


/* =========================================================
   INSPECTOR EVENTS
========================================================= */

textInput?.addEventListener(
  "input",
  () => {
    const block =
      getSelectedBlock();

    if (!block) {
      return;
    }

    block.text =
      textInput.value;

    renderCanvas();
    updateOutputOnly();
  }
);


/* ---------------------------------------------------------
   TEXT COLOR
--------------------------------------------------------- */

colorInput?.addEventListener(
  "input",
  () => {
    colorText.value =
      colorInput.value;

    updateSelectedStyle(
      "color",
      colorInput.value
    );
  }
);


colorText?.addEventListener(
  "change",
  () => {
    const color =
      normalizeColor(
        colorText.value,
        getSelectedBlock()?.color ||
          "#16131a"
      );

    colorText.value =
      color;

    colorInput.value =
      color;

    updateSelectedStyle(
      "color",
      color
    );
  }
);


/* ---------------------------------------------------------
   BACKGROUND
--------------------------------------------------------- */

bgInput?.addEventListener(
  "input",
  () => {
    bgText.value =
      bgInput.value;

    updateSelectedStyle(
      "background",
      bgInput.value
    );
  }
);


bgText?.addEventListener(
  "change",
  () => {
    const color =
      normalizeColor(
        bgText.value,
        getSelectedBlock()
          ?.background ||
          "#f8f4ed"
      );

    bgText.value =
      color;

    bgInput.value =
      color;

    updateSelectedStyle(
      "background",
      color
    );
  }
);


/* ---------------------------------------------------------
   FONT SIZE
--------------------------------------------------------- */

sizeInput?.addEventListener(
  "input",
  () => {
    const value =
      Number(sizeInput.value);

    sizeValue.textContent =
      value;

    updateSelectedStyle(
      "fontSize",
      value
    );
  }
);


/* ---------------------------------------------------------
   ALIGN
--------------------------------------------------------- */

alignInput?.addEventListener(
  "change",
  () => {
    updateSelectedStyle(
      "align",
      alignInput.value
    );
  }
);


/* ---------------------------------------------------------
   PADDING
--------------------------------------------------------- */

paddingInput?.addEventListener(
  "input",
  () => {
    const value =
      Number(
        paddingInput.value
      );

    paddingValue.textContent =
      value;

    updateSelectedStyle(
      "padding",
      value
    );
  }
);


function updateSelectedStyle(
  property,
  value
) {
  const block =
    getSelectedBlock();

  if (!block) {
    return;
  }

  block[property] = value;

  renderCanvas();
  updateOutputOnly();
}


/* =========================================================
   ADD BLOCKS
========================================================= */

document
  .querySelectorAll(
    "[data-add]"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const type =
          button.dataset.add;

        const newBlock =
          createBlock(type);

        const selectedIndex =
          getSelectedIndex();


        /*
         * 選択中パーツがあれば
         * その直後に追加
         */
        if (
          selectedIndex >= 0
        ) {
          state.blocks.splice(
            selectedIndex + 1,
            0,
            newBlock
          );
        } else {
          state.blocks.push(
            newBlock
          );
        }

        selectedId =
          newBlock.id;

        render();
        scheduleSave();
      }
    );
  });


function createBlock(type) {
  const theme =
    themes[state.theme] ||
    themes.studio;


  const base = {
    id: createId(),

    type,

    label: "",

    text: "",

    subText: "",

    color:
      theme.text,

    background:
      theme.background,

    fontSize: 14,

    align: "left",

    padding: 20
  };


  switch (type) {
    case "heading":
      return {
        ...base,

        label:
          "SECTION TITLE",

        text:
          "新しいタイトル",

        fontSize: 30
      };


    case "image":
      return {
        ...base,

        text: "main",

        padding: 12
      };


    case "profile":
      return {
        ...base,

        text:
          "29歳 / 186cm / 12月24日"
      };


    case "hero":
      return {
        ...base,

        text: "017",

        subText:
          "ここに肩書きを入力",

        color:
          theme.heroText,

        background:
          theme.heroBackground,

        fontSize: 64
      };


    case "text":
    default:
      return {
        ...base,

        text:
          "新しいテキストを入力してください。"
      };
  }
}


/* =========================================================
   MOVE BLOCK
========================================================= */

document
  .getElementById(
    "moveUp"
  )
  ?.addEventListener(
    "click",
    () => {
      const index =
        getSelectedIndex();

      if (index <= 0) {
        return;
      }

      [
        state.blocks[index - 1],
        state.blocks[index]
      ] = [
        state.blocks[index],
        state.blocks[index - 1]
      ];

      renderCanvas();
      updateOutputOnly();
    }
  );


document
  .getElementById(
    "moveDown"
  )
  ?.addEventListener(
    "click",
    () => {
      const index =
        getSelectedIndex();

      if (
        index < 0 ||
        index >=
          state.blocks.length - 1
      ) {
        return;
      }

      [
        state.blocks[index],
        state.blocks[index + 1]
      ] = [
        state.blocks[index + 1],
        state.blocks[index]
      ];

      renderCanvas();
      updateOutputOnly();
    }
  );


/* =========================================================
   DUPLICATE
========================================================= */

document
  .getElementById(
    "duplicate"
  )
  ?.addEventListener(
    "click",
    () => {
      const block =
        getSelectedBlock();

      const index =
        getSelectedIndex();

      if (
        !block ||
        index < 0
      ) {
        return;
      }

      const copy =
        deepClone(block);

      copy.id =
        createId();

      state.blocks.splice(
        index + 1,
        0,
        copy
      );

      selectedId =
        copy.id;

      render();
      scheduleSave();
    }
  );


/* =========================================================
   DELETE
========================================================= */

document
  .getElementById(
    "deleteBlock"
  )
  ?.addEventListener(
    "click",
    () => {
      const index =
        getSelectedIndex();

      if (index < 0) {
        return;
      }

      state.blocks.splice(
        index,
        1
      );


      /*
       * 削除後は近いブロックを選択
       */
      if (
        state.blocks.length > 0
      ) {
        const nextIndex =
          Math.min(
            index,
            state.blocks.length - 1
          );

        selectedId =
          state.blocks[
            nextIndex
          ].id;
      } else {
        selectedId = null;
      }

      render();
      scheduleSave();
    }
  );


/* =========================================================
   PRESETS
========================================================= */

document
  .querySelectorAll(
    ".preset"
  )
  .forEach(button => {
    button.addEventListener(
      "click",
      () => {
        const themeName =
          button.dataset.theme;

        applyTheme(
          themeName
        );
      }
    );
  });


function applyTheme(themeName) {
  const theme =
    themes[themeName];

  if (!theme) {
    return;
  }

  state.theme =
    themeName;


  /*
   * CSS側のアクセントも変更
   */
  document.documentElement
    .style.setProperty(
      "--accent",
      theme.accent
    );

  document.documentElement
    .style.setProperty(
      "--accent-light",
      theme.accentLight
    );


  /*
   * ブロックの色もプリセット化
   */
  state.blocks.forEach(
    block => {
      if (
        block.type ===
        "hero"
      ) {
        block.color =
          theme.heroText;

        block.background =
          theme.heroBackground;
      } else {
        block.color =
          theme.text;

        block.background =
          theme.background;
      }
    }
  );

  updateThemeButtons();
  renderCanvas();
  updateInspector();
  updateOutputOnly();
}


function updateThemeButtons() {
  document
    .querySelectorAll(
      ".preset"
    )
    .forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.theme ===
          state.theme
      );
    });


  const theme =
    themes[state.theme];

  if (!theme) {
    return;
  }

  document.documentElement
    .style.setProperty(
      "--accent",
      theme.accent
    );

  document.documentElement
    .style.setProperty(
      "--accent-light",
      theme.accentLight
    );
}


/* =========================================================
   TALelynx HTML GENERATOR
========================================================= */

function generateHTML() {
  let output = "";

  state.blocks.forEach(
    block => {
      output +=
        generateBlockHTML(block);

      output += "\n";
    }
  );

  output =
    output.trim();

  if (htmlOutput) {
    htmlOutput.value =
      output;
  }

  updateCharacterCounter(
    output.length
  );
}


/* =========================================================
   BLOCK HTML GENERATOR
========================================================= */

function generateBlockHTML(block) {
  const baseStyle =
    cleanStyle(`
      color:${block.color};
      background:${block.background};
      font-size:${block.fontSize}px;
      text-align:${block.align};
      padding:${block.padding}px;
    `);


  /* -----------------------------------------------------
     HERO
  ----------------------------------------------------- */

  if (
    block.type === "hero"
  ) {
    return `<div style="${baseStyle}"><div style="font-size:64px;font-weight:900;line-height:1;">${escapeHTML(
      block.text
    )}</div><div style="text-align:center;font-size:52px;padding:48px 0;">✦</div><div style="text-align:right;"><span style="display:inline-block;background:#19151d;color:#fff;padding:9px 14px;">${escapeHTML(
      block.subText || ""
    )}</span></div></div>`;
  }


  /* -----------------------------------------------------
     HEADING
  ----------------------------------------------------- */

  if (
    block.type === "heading"
  ) {
    const accent =
      themes[state.theme]
        ?.accent ||
      "#9b63ff";

    return `<div style="${baseStyle}"><div style="color:${accent};font-size:10px;font-weight:800;letter-spacing:.16em;">${escapeHTML(
      block.label ||
        "SECTION TITLE"
    )}</div><div style="font-size:${block.fontSize}px;line-height:1.4;">${escapeHTML(
      block.text
    )}</div></div>`;
  }


  /* -----------------------------------------------------
     IMAGE
  ----------------------------------------------------- */

  if (
    block.type === "image"
  ) {
    const imageName =
      String(
        block.text ||
          "main"
      )
        .replace(/[{}]/g, "")
        .trim() ||
      "main";

    return `<div style="${baseStyle}">{{img:${escapeHTML(
      imageName
    )}}}</div>`;
  }


  /* -----------------------------------------------------
     PROFILE
  ----------------------------------------------------- */

  if (
    block.type === "profile"
  ) {
    const profile =
      parseProfileValues(
        block.text
      );

    return `<div style="${baseStyle}"><div style="display:inline-block;width:31%;vertical-align:top;"><span style="font-size:9px;opacity:.6;">AGE</span><br>${escapeHTML(
      profile[0] || "--"
    )}</div><div style="display:inline-block;width:31%;vertical-align:top;"><span style="font-size:9px;opacity:.6;">HEIGHT</span><br>${escapeHTML(
      profile[1] || "---cm"
    )}</div><div style="display:inline-block;width:31%;vertical-align:top;"><span style="font-size:9px;opacity:.6;">BIRTHDAY</span><br>${escapeHTML(
      profile[2] ||
        "--月--日"
    )}</div></div>`;
  }


  /* -----------------------------------------------------
     TEXT
  ----------------------------------------------------- */

  return `<div style="${baseStyle}">${escapeHTML(
    block.text
  ).replace(
    /\n/g,
    "<br>"
  )}</div>`;
}


/* =========================================================
   PROFILE UTIL
========================================================= */

function parseProfileValues(
  text
) {
  const values =
    String(text || "")
      .split("/")
      .map(value =>
        value.trim()
      );

  while (
    values.length < 3
  ) {
    values.push("");
  }

  return values.slice(0, 3);
}


/* =========================================================
   OUTPUT UPDATE
========================================================= */

function updateOutputOnly() {
  generateHTML();
  scheduleSave();
}


/* =========================================================
   CHARACTER COUNTER
========================================================= */

function updateCharacterCounter(
  length
) {
  const remainingCount =
    MAX_CHARACTERS - length;


  if (charCount) {
    charCount.textContent =
      `${length.toLocaleString()} / ${MAX_CHARACTERS.toLocaleString()}`;
  }


  if (remaining) {
    remaining.textContent =
      remainingCount >= 0
        ? `残り${remainingCount.toLocaleString()}文字`
        : `${Math.abs(
            remainingCount
          ).toLocaleString()}文字オーバー`;
  }


  if (counter) {
    counter.classList.remove(
      "warning",
      "danger"
    );

    if (
      length >=
      MAX_CHARACTERS
    ) {
      counter.classList.add(
        "danger"
      );
    } else if (
      length >= 8500
    ) {
      counter.classList.add(
        "warning"
      );
    }
  }


  if (
    characterProgressBar
  ) {
    const percentage =
      clamp(
        (
          length /
          MAX_CHARACTERS
        ) *
          100,
        0,
        100
      );

    characterProgressBar.style.width =
      `${percentage}%`;
  }
}


/* =========================================================
   COPY
========================================================= */

copyButton?.addEventListener(
  "click",
  async () => {
    const text =
      htmlOutput?.value || "";

    if (!text) {
      return;
    }

    try {
      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {
        await navigator.clipboard.writeText(
          text
        );
      } else {
        fallbackCopy(text);
      }

      showCopySuccess();
    } catch (error) {
      console.warn(
        "コピーに失敗しました。",
        error
      );

      fallbackCopy(text);
      showCopySuccess();
    }
  }
);


function fallbackCopy(text) {
  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.value =
    text;

  textarea.style.position =
    "fixed";

  textarea.style.opacity =
    "0";

  textarea.style.pointerEvents =
    "none";

  document.body.appendChild(
    textarea
  );

  textarea.select();

  document.execCommand(
    "copy"
  );

  textarea.remove();
}


function showCopySuccess() {
  if (!copyButton) {
    return;
  }

  const original =
    copyButton.textContent;

  copyButton.textContent =
    "コピーしました ✓";

  copyButton.disabled =
    true;

  setTimeout(() => {
    copyButton.textContent =
      original;

    copyButton.disabled =
      false;
  }, 1400);
}


/* =========================================================
   RESET
========================================================= */

resetButton?.addEventListener(
  "click",
  () => {
    const confirmed =
      window.confirm(
        "編集内容をすべて初期状態に戻しますか？"
      );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      STORAGE_KEY
    );

    state = {
      theme: "studio",
      editMode: "direct",
      blocks:
        createDefaultBlocks()
    };

    selectedId = null;

    render();
    saveState();
  }
);


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  "keydown",
  event => {
    const activeElement =
      document.activeElement;


    /*
     * 入力中はショートカット無効
     */
    const isTyping =
      activeElement &&
      (
        activeElement.tagName ===
          "INPUT" ||
        activeElement.tagName ===
          "TEXTAREA" ||
        activeElement.tagName ===
          "SELECT" ||
        activeElement
          .isContentEditable
      );

    if (isTyping) {
      return;
    }


    /*
     * Deleteキー
     */
    if (
      event.key ===
        "Delete" &&
      selectedId
    ) {
      const index =
        getSelectedIndex();

      if (index >= 0) {
        state.blocks.splice(
          index,
          1
        );

        selectedId =
          null;

        render();
        scheduleSave();
      }
    }


    /*
     * Escapeで選択解除
     */
    if (
      event.key ===
      "Escape"
    ) {
      clearSelection();
    }
  }
);


/* =========================================================
   BEFORE UNLOAD
========================================================= */

window.addEventListener(
  "beforeunload",
  () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    } catch (error) {
      /* 何もしない */
    }
  }
);


/* =========================================================
   INITIALIZE
========================================================= */

function init() {
  loadState();

  updateThemeButtons();
  updateModeButtons();

  render();
}


/* Start */
init();