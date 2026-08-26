"use strict";


/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY =
  "talelynxPartsBuilderV2";

const MAX_CHARACTERS =
  10000;


/* =========================================================
   THEMES
========================================================= */

const THEMES = {

  cyber: {
    canvas: "#08101a",

    background: "#0b121a",
    surface: "#0d151d",

    text: "#dceef2",
    muted: "#7697a0",

    accent: "#34ffe2",

    border: "#28e9d2",

    glow: "#28ffe1"
  },


  romance: {
    canvas: "#fff7fb",

    background: "#fffafc",
    surface: "#fff1f7",

    text: "#5b4050",
    muted: "#9a7488",

    accent: "#e278a5",

    border: "#efb4cc",

    glow: "#f2a1c3"
  },


  noir: {
    canvas: "#111113",

    background: "#17171a",
    surface: "#202024",

    text: "#ededed",
    muted: "#98989e",

    accent: "#d9b875",

    border: "#58534a",

    glow: "#d9b875"
  },


  minimal: {
    canvas: "#f4f4f2",

    background: "#ffffff",
    surface: "#f5f5f3",

    text: "#202020",
    muted: "#777777",

    accent: "#282828",

    border: "#d0d0cd",

    glow: "#999999"
  }

};


/* =========================================================
   BLOCK DEFINITIONS
========================================================= */

const BLOCK_META = {

  neonTitle: {
    label: "タイトル",

    contentFields: [
      {
        key: "kicker",
        label: "小見出し",
        type: "text"
      },

      {
        key: "title",
        label: "タイトル",
        type: "text"
      },

      {
        key: "subtitle",
        label: "サブタイトル",
        type: "text"
      }
    ]
  },


  messageBox: {
    label: "メッセージ",

    contentFields: [
      {
        key: "kicker",
        label: "ラベル",
        type: "text"
      },

      {
        key: "body",
        label: "本文",
        type: "textarea"
      },

      {
        key: "footer",
        label: "補足",
        type: "text"
      }
    ]
  },


  sectionText: {
    label: "セクション",

    contentFields: [
      {
        key: "kicker",
        label: "小見出し",
        type: "text"
      },

      {
        key: "heading",
        label: "見出し",
        type: "text"
      },

      {
        key: "body",
        label: "本文",
        type: "textarea"
      }
    ]
  },


  card: {
    label: "カード",

    contentFields: [
      {
        key: "kicker",
        label: "ラベル",
        type: "text"
      },

      {
        key: "heading",
        label: "カードタイトル",
        type: "text"
      },

      {
        key: "body",
        label: "本文",
        type: "textarea"
      }
    ]
  },


  image: {
    label: "画像",

    contentFields: [
      {
        key: "imageKey",
        label: "Talelynx画像キー",
        type: "text"
      },

      {
        key: "caption",
        label: "キャプション",
        type: "text"
      }
    ]
  },


  notice: {
    label: "注意書き",

    contentFields: [
      {
        key: "heading",
        label: "見出し",
        type: "text"
      },

      {
        key: "body",
        label: "本文",
        type: "textarea"
      }
    ]
  },


  tags: {
    label: "タグ",

    contentFields: [
      {
        key: "items",
        label: "タグ",
        type: "tags"
      }
    ]
  },


  divider: {
    label: "区切り",

    contentFields: [
      {
        key: "label",
        label: "中央テキスト",
        type: "text"
      }
    ]
  },


  button: {
    label: "CTA",

    contentFields: [
      {
        key: "label",
        label: "ボタンテキスト",
        type: "text"
      }
    ]
  }

};


/* =========================================================
   STATE
========================================================= */

let state = {

  theme:
    "cyber",

  uiMode:
    "edit",

  blocks:
    []
};


let selectedId =
  null;


let openInserterId =
  null;


let dragBlockId =
  null;


/* =========================================================
   DOM
========================================================= */

const canvas =
  document.getElementById(
    "canvas"
  );


const inspector =
  document.getElementById(
    "inspector"
  );


const inspectorEmpty =
  document.getElementById(
    "inspectorEmpty"
  );


const inspectorFields =
  document.getElementById(
    "inspectorFields"
  );


const htmlOutput =
  document.getElementById(
    "htmlOutput"
  );


const charCount =
  document.getElementById(
    "charCount"
  );


const remaining =
  document.getElementById(
    "remaining"
  );


const counter =
  document.getElementById(
    "counter"
  );


const progressBar =
  document.getElementById(
    "progressBar"
  );


const copyButton =
  document.getElementById(
    "copyButton"
  );


const saveStatus =
  document.getElementById(
    "saveStatus"
  );


/* =========================================================
   HELPERS
========================================================= */

function createId() {

  if (
    crypto?.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    "block-" +
    Date.now() +
    "-" +
    Math.random()
      .toString(36)
      .slice(2)
  );
}


function escapeHTML(
  value = ""
) {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}


function lineBreaks(
  value = ""
) {

  return escapeHTML(value)
    .replace(
      /\n/g,
      "<br>"
    );
}


function deepClone(value) {

  return JSON.parse(
    JSON.stringify(value)
  );
}


function clamp(
  value,
  min,
  max
) {

  return Math.min(
    Math.max(value, min),
    max
  );
}


function getTheme() {

  return (
    THEMES[
      state.theme
    ] ||
    THEMES.cyber
  );
}


function getSelectedBlock() {

  return state.blocks.find(
    block =>
      block.id ===
      selectedId
  );
}


function getSelectedIndex() {

  return state.blocks.findIndex(
    block =>
      block.id ===
      selectedId
  );
}


/* =========================================================
   DEFAULT BLOCK
========================================================= */

function createBlock(type) {

  const theme =
    getTheme();


  const base = {

    id:
      createId(),

    type,

    content:
      {},

    style: {

      textColor:
        theme.text,

      backgroundColor:
        theme.background,

      accentColor:
        theme.accent,

      borderColor:
        theme.border,

      glowColor:
        theme.glow,

      fontSize:
        34,

      padding:
        24,

      radius:
        8,

      borderWidth:
        1,

      align:
        "left",

      letterSpacing:
        0,

      glowSize:
        18,

      opacity:
        1
    },

    effect: {

      preset:
        "none",

      animation:
        "none"
    }
  };


  switch (type) {


    case "neonTitle":

      base.content = {

        kicker:
          "INTRODUCTION",

        title:
          "タイトルを入力",

        subtitle:
          "サブタイトルを入力"
      };

      base.style.align =
        "center";

      base.style.fontSize =
        48;

      base.style.padding =
        34;

      base.style.borderWidth =
        1;

      base.effect.preset =
        "neon";

      return base;


    case "messageBox":

      base.content = {

        kicker:
          "MESSAGE",

        body:
          "メッセージ本文を入力してください。",

        footer:
          "補足テキストを入力"
      };

      base.style.padding =
        28;

      base.effect.preset =
        "glow";

      return base;


    case "sectionText":

      base.content = {

        kicker:
          "SECTION",

        heading:
          "見出しを入力",

        body:
          "説明文を入力してください。"
      };

      base.style.fontSize =
        26;

      return base;


    case "card":

      base.content = {

        kicker:
          "CARD",

        heading:
          "カードタイトルを入力",

        body:
          "カードの説明文を入力してください。"
      };

      base.style.backgroundColor =
        theme.surface;

      base.style.fontSize =
        24;

      return base;


    case "image":

      base.content = {

        imageKey:
          "画像キーを入力",

        caption:
          "キャプションを入力"
      };

      base.style.backgroundColor =
        theme.surface;

      return base;


    case "notice":

      base.content = {

        heading:
          "注意事項",

        body:
          "注意書きを入力してください。"
      };

      base.style.fontSize =
        20;

      return base;


    case "tags":

      base.content = {

        items: [
          "タグを入力",
          "タグを入力"
        ]
      };

      base.style.backgroundColor =
        "transparent";

      base.style.borderWidth =
        0;

      base.style.padding =
        4;

      return base;


    case "divider":

      base.content = {

        label:
          "SECTION"
      };

      base.style.backgroundColor =
        "transparent";

      base.style.borderWidth =
        1;

      base.style.padding =
        10;

      return base;


    case "button":

      base.content = {

        label:
          "ボタンテキストを入力"
      };

      base.style.align =
        "center";

      base.style.backgroundColor =
        theme.accent;

      base.style.textColor =
        state.theme ===
        "minimal"
          ? "#ffffff"
          : theme.background;

      base.style.padding =
        15;

      base.style.radius =
        8;

      return base;
  }


  return base;
}


/* =========================================================
   STORAGE
========================================================= */

let saveTimer =
  null;


function scheduleSave() {

  clearTimeout(
    saveTimer
  );


  if (saveStatus) {

    saveStatus.textContent =
      "● 保存中";

  }


  saveTimer =
    setTimeout(
      saveState,
      250
    );
}


function saveState() {

  try {

    localStorage.setItem(

      STORAGE_KEY,

      JSON.stringify({
        theme:
          state.theme,

        blocks:
          state.blocks
      })
    );


    if (saveStatus) {

      saveStatus.textContent =
        "● 自動保存";

    }

  } catch (error) {

    console.warn(
      error
    );
  }
}


function loadState() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {
      return;
    }


    const parsed =
      JSON.parse(saved);


    if (
      parsed &&
      Array.isArray(
        parsed.blocks
      )
    ) {

      state.theme =
        THEMES[
          parsed.theme
        ]
          ? parsed.theme
          : "cyber";


      state.blocks =
        parsed.blocks;
    }

  } catch (error) {

    console.warn(
      error
    );
  }
}


/* =========================================================
   BLOCK STYLE
========================================================= */

function blockStyleVariables(
  block
) {

  const s =
    block.style;


  return `
    --block-text:${s.textColor};
    --block-bg:${s.backgroundColor};
    --block-accent:${s.accentColor};
    --block-border:${s.borderColor};
    --block-glow:${s.glowColor};
    --block-font-size:${s.fontSize}px;
    --block-padding:${s.padding}px;
    --block-radius:${s.radius}px;
    --block-border-width:${s.borderWidth}px;
    --block-align:${s.align};
    --block-letter-spacing:${s.letterSpacing}px;
    --block-glow-size:${s.glowSize}px;
    --block-opacity:${s.opacity};
  `
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}


/* =========================================================
   EFFECT CLASS
========================================================= */

function effectClass(
  block
) {

  const preset =
    block.effect
      ?.preset ||
    "none";


  if (
    preset ===
    "none"
  ) {
    return "";
  }


  return (
    "effect-" +
    preset
  );
}


function animationClass(
  block
) {

  const animation =
    block.effect
      ?.animation ||
    "none";


  if (
    animation ===
    "none"
  ) {
    return "";
  }


  return (
    "anim-" +
    animation
  );
}


/* =========================================================
   BLOCK MARKUP
========================================================= */

function renderBlockMarkup(
  block
) {

  const c =
    block.content;


  switch (
    block.type
  ) {


    case "neonTitle":

      return `
        <div class="part-neon-title">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >${escapeHTML(c.kicker)}</div>

          <div
            class="part-main-title"
            data-edit-field="title"
          >${escapeHTML(c.title)}</div>

          <div
            class="part-subtitle"
            data-edit-field="subtitle"
          >${escapeHTML(c.subtitle)}</div>

        </div>
      `;


    case "messageBox":

      return `
        <div class="part-message-box">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >${escapeHTML(c.kicker)}</div>

          <div
            class="message-body"
            data-edit-field="body"
          >${lineBreaks(c.body)}</div>

          <div
            class="message-footer"
            data-edit-field="footer"
          >${escapeHTML(c.footer)}</div>

        </div>
      `;


    case "sectionText":

      return `
        <div class="part-section-text">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >${escapeHTML(c.kicker)}</div>

          <div
            class="part-main-title"
            data-edit-field="heading"
          >${escapeHTML(c.heading)}</div>

          <div
            class="part-body"
            data-edit-field="body"
          >${lineBreaks(c.body)}</div>

        </div>
      `;


    case "card":

      return `
        <div class="part-card">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >${escapeHTML(c.kicker)}</div>

          <div
            class="part-main-title"
            data-edit-field="heading"
          >${escapeHTML(c.heading)}</div>

          <div
            class="part-body"
            data-edit-field="body"
          >${lineBreaks(c.body)}</div>

        </div>
      `;


    case "image":

      return `
        <div class="part-image">

          <div class="image-preview">

            <div>

              IMAGE

              <div
                class="image-code"
                data-edit-field="imageKey"
              >{{img:${escapeHTML(c.imageKey)}}}</div>

            </div>

          </div>

          <div
            class="part-subtitle"
            data-edit-field="caption"
          >${escapeHTML(c.caption)}</div>

        </div>
      `;


    case "notice":

      return `
        <div class="part-notice">

          <div
            class="part-kicker"
            data-edit-field="heading"
          >${escapeHTML(c.heading)}</div>

          <div
            class="part-body"
            data-edit-field="body"
          >${lineBreaks(c.body)}</div>

        </div>
      `;


    case "tags":

      return `
        <div class="tag-list">

          ${c.items
            .map(
              tag =>
                `<span class="tag-chip">#${escapeHTML(tag)}</span>`
            )
            .join("")}

        </div>
      `;


    case "divider":

      return `
        <div class="part-divider">

          <div class="divider-row">

            <span class="divider-line"></span>

            <span
              class="divider-label"
              data-edit-field="label"
            >${escapeHTML(c.label)}</span>

            <span class="divider-line"></span>

          </div>

        </div>
      `;


    case "button":

      return `
        <div class="part-button-box">

          <div
            class="cta-preview"
            data-edit-field="label"
          >${escapeHTML(c.label)}</div>

        </div>
      `;
  }


  return "";
}


/* =========================================================
   BLOCK TOOLBAR
========================================================= */

function toolbarMarkup() {

  return `
    <div class="block-toolbar">

      <div
        class="drag-handle"
        draggable="true"
        data-drag-handle
        title="ドラッグして移動"
      >
        ⠿
      </div>

      <button
        type="button"
        data-canvas-action="duplicate"
      >
        ⧉
      </button>

      <button
        type="button"
        data-canvas-action="delete"
      >
        ×
      </button>

    </div>
  `;
}


/* =========================================================
   INLINE INSERTER
========================================================= */

const MINI_PARTS = [
  ["neonTitle", "タイトル"],
  ["messageBox", "メッセージ"],
  ["sectionText", "セクション"],
  ["card", "カード"],
  ["image", "画像"],
  ["notice", "注意"],
  ["tags", "タグ"],
  ["divider", "区切り"],
  ["button", "CTA"]
];


function renderInserter(
  afterId
) {

  const open =
    openInserterId ===
    afterId;


  return `
    <div
      class="inline-inserter"
      data-after="${afterId}"
    >

      <button
        type="button"
        class="inline-plus"
        data-toggle-inserter="${afterId}"
      >
        ＋
      </button>

      ${
        open
          ? `
            <div class="mini-palette">

              ${MINI_PARTS
                .map(
                  ([type,label]) =>
                    `
                    <button
                      type="button"
                      data-inline-add="${type}"
                      data-after="${afterId}"
                    >
                      ${label}
                    </button>
                    `
                )
                .join("")}

            </div>
          `
          : ""
      }

    </div>
  `;
}


/* =========================================================
   CANVAS RENDER
========================================================= */

function renderCanvas() {

  const theme =
    getTheme();


  canvas.style.background =
    theme.canvas;


  canvas.classList.toggle(
    "edit-mode",
    state.uiMode ===
    "edit"
  );


  document.body.classList.toggle(
    "preview-mode",
    state.uiMode ===
    "preview"
  );


  canvas.innerHTML =
    state.blocks
      .map(
        block => {

          const selected =
            block.id ===
            selectedId
              ? "selected"
              : "";


          return `
            <div
              class="
                builder-block
                ${selected}
                ${effectClass(block)}
                ${animationClass(block)}
              "
              data-block-id="${block.id}"
              style="${blockStyleVariables(block)}"
            >

              ${toolbarMarkup()}

              ${renderBlockMarkup(block)}

            </div>

            ${renderInserter(block.id)}
          `;
        }
      )
      .join("");


  if (
    state.uiMode ===
    "edit"
  ) {

    canvas
      .querySelectorAll(
        "[data-edit-field]"
      )
      .forEach(
        element => {

          element.contentEditable =
            "true";

          element.spellcheck =
            false;
        }
      );
  }
}


/* =========================================================
   SELECT
========================================================= */

function selectBlock(id) {

  selectedId =
    id;

  renderCanvas();
  renderInspector();
}


/* =========================================================
   CANVAS EVENTS
========================================================= */

canvas.addEventListener(
  "click",
  event => {


    const toggle =
      event.target.closest(
        "[data-toggle-inserter]"
      );


    if (toggle) {

      event.stopPropagation();

      const id =
        toggle.dataset
          .toggleInserter;


      openInserterId =
        openInserterId === id
          ? null
          : id;


      renderCanvas();
      return;
    }


    const inlineAdd =
      event.target.closest(
        "[data-inline-add]"
      );


    if (inlineAdd) {

      const type =
        inlineAdd.dataset
          .inlineAdd;


      const after =
        inlineAdd.dataset
          .after;


      insertAfter(
        after,
        type
      );


      return;
    }


    const actionButton =
      event.target.closest(
        "[data-canvas-action]"
      );


    if (actionButton) {

      const blockElement =
        actionButton.closest(
          "[data-block-id]"
        );


      if (!blockElement) {
        return;
      }


      selectedId =
        blockElement
          .dataset
          .blockId;


      runBlockAction(
        actionButton.dataset
          .canvasAction
      );


      return;
    }


    const blockElement =
      event.target.closest(
        "[data-block-id]"
      );


    if (
      blockElement
    ) {

      selectBlock(
        blockElement
          .dataset
          .blockId
      );
    }

  }
);


/* =========================================================
   DIRECT TEXT EDIT
========================================================= */

canvas.addEventListener(
  "input",
  event => {

    const editable =
      event.target.closest(
        "[data-edit-field]"
      );


    if (!editable) {
      return;
    }


    const blockElement =
      editable.closest(
        "[data-block-id]"
      );


    if (!blockElement) {
      return;
    }


    const block =
      state.blocks.find(
        item =>
          item.id ===
          blockElement
            .dataset
            .blockId
      );


    if (!block) {
      return;
    }


    const key =
      editable.dataset
        .editField;


    block.content[key] =
      editable.innerText;


    selectedId =
      block.id;


    generateOutput();
    renderInspector();
    scheduleSave();
  }
);


/* =========================================================
   DRAG & DROP
========================================================= */

canvas.addEventListener(
  "dragstart",
  event => {

    const handle =
      event.target.closest(
        "[data-drag-handle]"
      );


    if (!handle) {
      return;
    }


    const block =
      handle.closest(
        "[data-block-id]"
      );


    if (!block) {
      return;
    }


    dragBlockId =
      block.dataset
        .blockId;


    event.dataTransfer
      .setData(
        "text/plain",
        dragBlockId
      );


    event.dataTransfer
      .effectAllowed =
        "move";
  }
);


canvas.addEventListener(
  "dragover",
  event => {

    const target =
      event.target.closest(
        "[data-block-id]"
      );


    if (
      !target ||
      target.dataset.blockId ===
      dragBlockId
    ) {
      return;
    }


    event.preventDefault();


    canvas
      .querySelectorAll(
        ".drag-over"
      )
      .forEach(
        el =>
          el.classList.remove(
            "drag-over"
          )
      );


    target.classList.add(
      "drag-over"
    );
  }
);


canvas.addEventListener(
  "drop",
  event => {

    const target =
      event.target.closest(
        "[data-block-id]"
      );


    if (
      !target ||
      !dragBlockId
    ) {
      return;
    }


    event.preventDefault();


    const targetId =
      target.dataset
        .blockId;


    reorderBlocks(
      dragBlockId,
      targetId
    );


    dragBlockId =
      null;


    renderAll();
  }
);


canvas.addEventListener(
  "dragend",
  () => {

    dragBlockId =
      null;


    canvas
      .querySelectorAll(
        ".drag-over"
      )
      .forEach(
        el =>
          el.classList.remove(
            "drag-over"
          )
      );
  }
);


function reorderBlocks(
  sourceId,
  targetId
) {

  const sourceIndex =
    state.blocks.findIndex(
      block =>
        block.id ===
        sourceId
    );


  const targetIndex =
    state.blocks.findIndex(
      block =>
        block.id ===
        targetId
    );


  if (
    sourceIndex < 0 ||
    targetIndex < 0
  ) {
    return;
  }


  const [
    moved
  ] =
    state.blocks.splice(
      sourceIndex,
      1
    );


  const newTargetIndex =
    state.blocks.findIndex(
      block =>
        block.id ===
        targetId
    );


  state.blocks.splice(
    newTargetIndex,
    0,
    moved
  );


  scheduleSave();
}


/* =========================================================
   ADD
========================================================= */

document
  .querySelectorAll(
    "[data-add]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          addBlock(
            button.dataset.add
          );
        }
      );
    }
  );


function addBlock(type) {

  const block =
    createBlock(type);


  const index =
    getSelectedIndex();


  if (
    index >= 0
  ) {

    state.blocks.splice(
      index + 1,
      0,
      block
    );

  } else {

    state.blocks.push(
      block
    );
  }


  selectedId =
    block.id;


  openInserterId =
    null;


  renderAll();
}


function insertAfter(
  afterId,
  type
) {

  const index =
    state.blocks.findIndex(
      block =>
        block.id ===
        afterId
    );


  const block =
    createBlock(type);


  if (
    index < 0
  ) {

    state.blocks.push(
      block
    );

  } else {

    state.blocks.splice(
      index + 1,
      0,
      block
    );
  }


  selectedId =
    block.id;


  openInserterId =
    null;


  renderAll();
}


/* =========================================================
   BLOCK ACTIONS
========================================================= */

function runBlockAction(
  action
) {

  const index =
    getSelectedIndex();


  if (
    index < 0
  ) {
    return;
  }


  if (
    action ===
    "moveUp"
  ) {

    if (
      index > 0
    ) {

      [
        state.blocks[index - 1],
        state.blocks[index]
      ] = [
        state.blocks[index],
        state.blocks[index - 1]
      ];
    }

  }


  if (
    action ===
    "moveDown"
  ) {

    if (
      index <
      state.blocks.length - 1
    ) {

      [
        state.blocks[index],
        state.blocks[index + 1]
      ] = [
        state.blocks[index + 1],
        state.blocks[index]
      ];
    }

  }


  if (
    action ===
    "duplicate"
  ) {

    const copy =
      deepClone(
        state.blocks[index]
      );


    copy.id =
      createId();


    state.blocks.splice(
      index + 1,
      0,
      copy
    );


    selectedId =
      copy.id;

  }


  if (
    action ===
    "delete"
  ) {

    state.blocks.splice(
      index,
      1
    );


    if (
      state.blocks.length
    ) {

      selectedId =
        state.blocks[
          Math.min(
            index,
            state.blocks.length - 1
          )
        ].id;

    } else {

      selectedId =
        null;
    }

  }


  renderAll();
}


/* =========================================================
   INSPECTOR CONTENT FIELD
========================================================= */

function contentFieldHTML(
  definition,
  block
) {

  const key =
    definition.key;


  const value =
    block.content[key];


  if (
    definition.type ===
    "textarea"
  ) {

    return `
      <div class="inspector-field">

        <label>
          ${definition.label}
        </label>

        <textarea
          data-content-key="${key}"
        >${escapeHTML(value)}</textarea>

      </div>
    `;
  }


  if (
    definition.type ===
    "tags"
  ) {

    return `
      <div class="inspector-field">

        <label>
          ${definition.label}
        </label>

        <textarea
          data-content-key="${key}"
          data-field-type="tags"
        >${escapeHTML(
          (value || [])
            .join(", ")
        )}</textarea>

      </div>
    `;
  }


  return `
    <div class="inspector-field">

      <label>
        ${definition.label}
      </label>

      <input
        type="text"
        value="${escapeHTML(value)}"
        data-content-key="${key}"
      >

    </div>
  `;
}


/* =========================================================
   COLOR FIELD
========================================================= */

function colorFieldHTML(
  label,
  key,
  value
) {

  return `
    <div class="inspector-field">

      <label>
        ${label}
      </label>

      <div class="color-control">

        <input
          type="color"
          value="${value}"
          data-style-key="${key}"
        >

        <input
          type="text"
          value="${value}"
          data-style-key="${key}"
        >

      </div>

    </div>
  `;
}


/* =========================================================
   RANGE FIELD
========================================================= */

function rangeFieldHTML(
  label,
  key,
  value,
  min,
  max,
  step = 1
) {

  return `
    <div class="inspector-field">

      <label>
        <span>${label}</span>

        <span>
          ${value}
        </span>
      </label>

      <input
        type="range"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${value}"
        data-style-key="${key}"
      >

    </div>
  `;
}


/* =========================================================
   INSPECTOR
========================================================= */

function renderInspector() {

  const block =
    getSelectedBlock();


  if (!block) {

    inspector.hidden =
      true;

    inspectorEmpty.hidden =
      false;

    return;
  }


  inspector.hidden =
    false;

  inspectorEmpty.hidden =
    true;


  const meta =
    BLOCK_META[
      block.type
    ];


  const contentHTML =
    meta.contentFields
      .map(
        field =>
          contentFieldHTML(
            field,
            block
          )
      )
      .join("");


  inspectorFields.innerHTML =
    `

      <div class="inspector-group">

        <div class="inspector-group-title">
          ${meta.label} / CONTENT
        </div>

        ${contentHTML}

      </div>


      <div class="inspector-group">

        <div class="inspector-group-title">
          COLOR
        </div>

        ${colorFieldHTML(
          "文字色",
          "textColor",
          block.style.textColor
        )}

        ${colorFieldHTML(
          "背景色",
          "backgroundColor",
          block.style.backgroundColor
        )}

        ${colorFieldHTML(
          "アクセント",
          "accentColor",
          block.style.accentColor
        )}

        ${colorFieldHTML(
          "枠線",
          "borderColor",
          block.style.borderColor
        )}

        ${colorFieldHTML(
          "グロー",
          "glowColor",
          block.style.glowColor
        )}

      </div>


      <div class="inspector-group">

        <div class="inspector-group-title">
          STYLE
        </div>

        ${rangeFieldHTML(
          "文字サイズ",
          "fontSize",
          block.style.fontSize,
          12,
          72
        )}

        ${rangeFieldHTML(
          "余白",
          "padding",
          block.style.padding,
          0,
          64
        )}

        ${rangeFieldHTML(
          "角丸",
          "radius",
          block.style.radius,
          0,
          32
        )}

        ${rangeFieldHTML(
          "枠線の太さ",
          "borderWidth",
          block.style.borderWidth,
          0,
          5
        )}

        ${rangeFieldHTML(
          "字間",
          "letterSpacing",
          block.style.letterSpacing,
          0,
          12
        )}

        ${rangeFieldHTML(
          "グロー量",
          "glowSize",
          block.style.glowSize,
          0,
          40
        )}


        <div class="inspector-field">

          <label>
            文字揃え
          </label>

          <select
            data-style-key="align"
          >

            <option
              value="left"
              ${
                block.style.align ===
                "left"
                  ? "selected"
                  : ""
              }
            >
              左
            </option>

            <option
              value="center"
              ${
                block.style.align ===
                "center"
                  ? "selected"
                  : ""
              }
            >
              中央
            </option>

            <option
              value="right"
              ${
                block.style.align ===
                "right"
                  ? "selected"
                  : ""
              }
            >
              右
            </option>

          </select>

        </div>

      </div>


      <div class="inspector-group">

        <div class="inspector-group-title">
          EFFECT
        </div>


        <div class="inspector-field">

          <label>
            エフェクト
          </label>

          <select
            data-effect-key="preset"
          >

            ${[
              ["none","なし"],
              ["glow","Glow"],
              ["neon","Neon"],
              ["glass","Glass"],
              ["outline","Outline"],
              ["soft","Soft Shadow"]
            ]
              .map(
                ([value,label]) =>
                  `
                    <option
                      value="${value}"
                      ${
                        block.effect.preset === value
                          ? "selected"
                          : ""
                      }
                    >
                      ${label}
                    </option>
                  `
              )
              .join("")}

          </select>

        </div>


        <div class="inspector-field">

          <label>
            プレビューアニメーション
          </label>

          <select
            data-effect-key="animation"
          >

            ${[
              ["none","なし"],
              ["fade","Fade"],
              ["slide","Slide Up"],
              ["pulse","Pulse"],
              ["flicker","Flicker"]
            ]
              .map(
                ([value,label]) =>
                  `
                    <option
                      value="${value}"
                      ${
                        block.effect.animation === value
                          ? "selected"
                          : ""
                      }
                    >
                      ${label}
                    </option>
                  `
              )
              .join("")}

          </select>

        </div>

      </div>
    `;
}


/* =========================================================
   INSPECTOR INPUT
========================================================= */

inspectorFields.addEventListener(
  "input",
  event => {

    const block =
      getSelectedBlock();


    if (!block) {
      return;
    }


    const contentKey =
      event.target.dataset
        .contentKey;


    const styleKey =
      event.target.dataset
        .styleKey;


    const effectKey =
      event.target.dataset
        .effectKey;


    if (
      contentKey
    ) {

      if (
        event.target.dataset
          .fieldType ===
        "tags"
      ) {

        block.content[
          contentKey
        ] =
          event.target.value

            .split(",")

            .map(
              value =>
                value.trim()
            )

            .filter(Boolean);

      } else {

        block.content[
          contentKey
        ] =
          event.target.value;
      }

    }


    if (
      styleKey
    ) {

      let value =
        event.target.value;


      if (
        event.target.type ===
        "range"
      ) {

        value =
          Number(value);
      }


      block.style[
        styleKey
      ] =
        value;
    }


    if (
      effectKey
    ) {

      block.effect[
        effectKey
      ] =
        event.target.value;
    }


    renderCanvas();
    generateOutput();
    scheduleSave();
  }
);


/* =========================================================
   INSPECTOR CHANGE
========================================================= */

inspectorFields.addEventListener(
  "change",
  event => {

    const block =
      getSelectedBlock();


    if (!block) {
      return;
    }


    const styleKey =
      event.target.dataset
        .styleKey;


    const effectKey =
      event.target.dataset
        .effectKey;


    if (
      styleKey
    ) {

      block.style[
        styleKey
      ] =
        event.target.type ===
        "range"
          ? Number(
              event.target.value
            )
          : event.target.value;
    }


    if (
      effectKey
    ) {

      block.effect[
        effectKey
      ] =
        event.target.value;
    }


    renderCanvas();
    renderInspector();
    generateOutput();
    scheduleSave();
  }
);


/* =========================================================
   INSPECTOR BUTTONS
========================================================= */

document
  .querySelectorAll(
    "[data-block-action]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          runBlockAction(
            button.dataset
              .blockAction
          );
        }
      );
    }
  );


/* =========================================================
   THEMES
========================================================= */

document
  .querySelectorAll(
    "[data-theme]"
  )
  .forEach(
    button => {

      button.addEventListener(
        "click",
        () => {

          applyTheme(
            button.dataset
              .theme
          );
        }
      );
    }
  );


function applyTheme(
  themeName
) {

  if (
    !THEMES[
      themeName
    ]
  ) {
    return;
  }


  state.theme =
    themeName;


  const theme =
    getTheme();


  state.blocks.forEach(
    block => {

      block.style.textColor =
        theme.text;

      block.style.backgroundColor =
        block.type ===
        "card"
          ? theme.surface
          : theme.background;

      block.style.accentColor =
        theme.accent;

      block.style.borderColor =
        theme.border;

      block.style.glowColor =
        theme.glow;


      if (
        block.type ===
        "tags" ||
        block.type ===
        "divider"
      ) {

        block.style.backgroundColor =
          "transparent";
      }


      if (
        block.type ===
        "button"
      ) {

        block.style.backgroundColor =
          theme.accent;
      }

    }
  );


  updateThemeButtons();

  renderAll();
}


function updateThemeButtons() {

  document
    .querySelectorAll(
      "[data-theme]"
    )
    .forEach(
      button => {

        button.classList.toggle(
          "active",
          button.dataset.theme ===
          state.theme
        );
      }
    );


  document.documentElement
    .style.setProperty(
      "--ui-accent",
      getTheme().accent
    );
}


/* =========================================================
   HTML EXPORT
========================================================= */

function exportBaseStyle(
  block
) {

  const s =
    block.style;


  let style =
    [
      `color:${s.textColor}`,
      `background:${s.backgroundColor}`,
      `border:${s.borderWidth}px solid ${s.borderColor}`,
      `border-radius:${s.radius}px`,
      `padding:${s.padding}px`,
      `text-align:${s.align}`,
      `font-size:${s.fontSize}px`
    ];


  if (
    block.effect.preset ===
      "glow" ||
    block.effect.preset ===
      "neon"
  ) {

    style.push(
      `box-shadow:0 0 ${s.glowSize}px ${s.glowColor}`
    );
  }


  return (
    style.join(";") +
    ";"
  );
}


/* =========================================================
   EXPORT BLOCK
========================================================= */

function exportBlockHTML(
  block
) {

  const s =
    block.style;

  const c =
    block.content;

  const base =
    exportBaseStyle(
      block
    );


  const titleShadow =
    (
      block.effect.preset ===
      "neon" ||
      block.effect.preset ===
      "glow"
    )
      ? `text-shadow:0 0 ${s.glowSize}px ${s.glowColor};`
      : "";


  switch (
    block.type
  ) {


    case "neonTitle":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:11px;font-weight:bold;letter-spacing:.16em;">${escapeHTML(c.kicker)}</div>
  <div style="margin-top:10px;font-size:${s.fontSize}px;font-weight:bold;letter-spacing:${s.letterSpacing}px;${titleShadow}">${escapeHTML(c.title)}</div>
  <div style="margin-top:8px;font-size:13px;opacity:.75;">${escapeHTML(c.subtitle)}</div>
</div>
      `.trim();


    case "messageBox":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">${escapeHTML(c.kicker)}</div>
  <div style="margin-top:24px;line-height:1.9;">${lineBreaks(c.body)}</div>
  <div style="margin-top:20px;color:${s.accentColor};font-size:9px;text-align:right;">${escapeHTML(c.footer)}</div>
</div>
      `.trim();


    case "sectionText":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">${escapeHTML(c.kicker)}</div>
  <div style="margin-top:8px;font-size:${s.fontSize}px;font-weight:bold;${titleShadow}">${escapeHTML(c.heading)}</div>
  <div style="margin-top:12px;font-size:14px;line-height:1.9;">${lineBreaks(c.body)}</div>
</div>
      `.trim();


    case "card":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">${escapeHTML(c.kicker)}</div>
  <div style="margin-top:8px;font-size:${s.fontSize}px;font-weight:bold;">${escapeHTML(c.heading)}</div>
  <div style="margin-top:12px;font-size:14px;line-height:1.8;">${lineBreaks(c.body)}</div>
</div>
      `.trim();


    case "image":

      return `
<div style="${base}">
  {{img:${cleanImageKey(c.imageKey)}}}
  <div style="margin-top:8px;font-size:11px;opacity:.7;">${escapeHTML(c.caption)}</div>
</div>
      `.trim();


    case "notice":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;">${escapeHTML(c.heading)}</div>
  <div style="margin-top:8px;font-size:13px;line-height:1.8;">${lineBreaks(c.body)}</div>
</div>
      `.trim();


    case "tags":

      return `
<div style="${base}">
${c.items
  .map(
    tag =>
      `  <span style="display:inline-block;margin:3px;padding:5px 9px;border:1px solid ${s.borderColor};border-radius:999px;color:${s.accentColor};font-size:11px;">#${escapeHTML(tag)}</span>`
  )
  .join("\n")}
</div>
      `.trim();


    case "divider":

      return `
<div style="padding:${s.padding}px;text-align:center;color:${s.accentColor};font-size:10px;letter-spacing:.16em;">
  <hr style="border:0;border-top:${Math.max(s.borderWidth,1)}px solid ${s.borderColor};">
  ${escapeHTML(c.label)}
</div>
      `.trim();


    case "button":

      return `
<div style="${base};font-weight:bold;">
  ${escapeHTML(c.label)}
</div>
      `.trim();
  }


  return "";
}


function cleanImageKey(
  value
) {

  return String(
    value || "画像キー"
  )
    .replace(
      /[{}<>]/g,
      ""
    )
    .trim();
}


/* =========================================================
   OUTPUT
========================================================= */

function generateOutput() {

  const output =
    state.blocks

      .map(
        exportBlockHTML
      )

      .join("\n\n");


  htmlOutput.value =
    output;


  updateCounter(
    output.length
  );
}


function updateCounter(
  length
) {

  charCount.textContent =
    `${length.toLocaleString()} / 10,000`;


  const rest =
    MAX_CHARACTERS -
    length;


  remaining.textContent =
    rest >= 0
      ? `残り${rest.toLocaleString()}文字`
      : `${Math.abs(rest).toLocaleString()}文字オーバー`;


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
    length >=
    8500
  ) {

    counter.classList.add(
      "warning"
    );
  }


  progressBar.style.width =
    `${clamp(
      length /
      MAX_CHARACTERS *
      100,
      0,
      100
    )}%`;
}


/* =========================================================
   COPY
========================================================= */

copyButton.addEventListener(
  "click",
  async () => {

    const text =
      htmlOutput.value;


    if (!text) {
      return;
    }


    try {

      await navigator
        .clipboard
        .writeText(text);


      const oldText =
        copyButton
          .textContent;


      copyButton.textContent =
        "コピーしました ✓";


      setTimeout(
        () => {

          copyButton.textContent =
            oldText;

        },
        1300
      );

    } catch {

      htmlOutput.select();

      document.execCommand(
        "copy"
      );
    }
  }
);


/* =========================================================
   UI MODE
========================================================= */

document
  .getElementById(
    "editModeButton"
  )
  .addEventListener(
    "click",
    () => {

      state.uiMode =
        "edit";

      updateModeButtons();
      renderCanvas();
    }
  );


document
  .getElementById(
    "previewModeButton"
  )
  .addEventListener(
    "click",
    () => {

      state.uiMode =
        "preview";

      selectedId =
        null;

      updateModeButtons();
      renderCanvas();
      renderInspector();
    }
  );


function updateModeButtons() {

  document
    .getElementById(
      "editModeButton"
    )
    .classList.toggle(
      "active",
      state.uiMode ===
      "edit"
    );


  document
    .getElementById(
      "previewModeButton"
    )
    .classList.toggle(
      "active",
      state.uiMode ===
      "preview"
    );
}


/* =========================================================
   REPLAY
========================================================= */

document
  .getElementById(
    "replayButton"
  )
  .addEventListener(
    "click",
    () => {

      renderCanvas();
    }
  );


/* =========================================================
   RESET
========================================================= */

document
  .getElementById(
    "resetButton"
  )
  .addEventListener(
    "click",
    () => {

      const confirmed =
        confirm(
          "編集内容をすべて初期状態に戻しますか？"
        );


      if (!confirmed) {
        return;
      }


      localStorage.removeItem(
        STORAGE_KEY
      );


      state = {

        theme:
          "cyber",

        uiMode:
          "edit",

        blocks:
          []
      };


      selectedId =
        null;


      renderAll();
      saveState();
    }
  );


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

  updateThemeButtons();
  updateModeButtons();

  renderCanvas();
  renderInspector();

  generateOutput();

  scheduleSave();
}


/* =========================================================
   INITIAL BLOCKS
========================================================= */

function createInitialBlocks() {

  const title =
    createBlock(
      "neonTitle"
    );


  const section =
    createBlock(
      "sectionText"
    );


  state.blocks = [
    title,
    section
  ];
}


/* =========================================================
   INIT
========================================================= */

function init() {

  loadState();


  if (
    state.blocks.length ===
    0
  ) {

    createInitialBlocks();
  }


  updateThemeButtons();
  updateModeButtons();

  renderCanvas();
  renderInspector();
  generateOutput();
}


init();
