"use strict";


/* =========================================================
   CONSTANTS
========================================================= */

const STORAGE_KEY =
  "talelynxPartsBuilderV21";

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
   BLOCK META
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
  },


  profile: {
    label: "プロフィール",
    contentFields: []
  },


  toggle: {
    label: "トグル",

    contentFields: [
      {
        key: "summary",
        label: "トグルタイトル",
        type: "text"
      }
    ]
  }

};


/* =========================================================
   PROFILE TEMPLATE
========================================================= */

const PROFILE_TEMPLATE = [

  {
    id: "name",
    label: "NAME",
    value: "名前を入力",
    enabled: true
  },

  {
    id: "alias",
    label: "ALIAS",
    value: "呼び名を入力",
    enabled: false
  },

  {
    id: "age",
    label: "AGE",
    value: "年齢を入力",
    enabled: true
  },

  {
    id: "height",
    label: "HEIGHT",
    value: "身長を入力",
    enabled: true
  },

  {
    id: "birthday",
    label: "BIRTHDAY",
    value: "誕生日を入力",
    enabled: false
  },

  {
    id: "occupation",
    label: "JOB",
    value: "職業を入力",
    enabled: true
  },

  {
    id: "affiliation",
    label: "AFFILIATION",
    value: "所属を入力",
    enabled: false
  },

  {
    id: "relationship",
    label: "RELATIONSHIP",
    value: "関係性を入力",
    enabled: false
  },

  {
    id: "description",
    label: "PROFILE",
    value: "プロフィール文を入力",
    enabled: false
  }

];


const MINI_PARTS = [

  ["neonTitle", "タイトル"],
  ["messageBox", "メッセージ"],
  ["sectionText", "セクション"],
  ["card", "カード"],
  ["image", "画像"],
  ["profile", "プロフィール"],
  ["notice", "注意"],
  ["tags", "タグ"],
  ["divider", "区切り"],
  ["button", "CTA"],
  ["toggle", "トグル"]

];


/* =========================================================
   STATE
========================================================= */

let state = {

  theme: "cyber",

  uiMode: "edit",

  blocks: []

};


let selectedId = null;

let openInserterKey = null;

let dragBlockId = null;

let imageUploadTargetId = null;


/*
 * 画像そのものは保存しない。
 * ページを開いている間だけ保持。
 */
const previewImages =
  new Map();


/* =========================================================
   DOM
========================================================= */

const canvas =
  document.getElementById("canvas");

const inspector =
  document.getElementById("inspector");

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

const previewFileInput =
  document.getElementById(
    "previewFileInput"
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
    Math.max(
      value,
      min
    ),
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


function cloneProfileFields() {

  return deepClone(
    PROFILE_TEMPLATE
  );

}


function cleanImageKey(value) {

  return String(
    value ||
    "画像キー"
  )
    .replace(
      /[{}<>]/g,
      ""
    )
    .trim();

}


/* =========================================================
   COPY BLOCK
========================================================= */

function refreshIds(block) {

  block.id =
    createId();


  if (
    Array.isArray(
      block.children
    )
  ) {

    block.children
      .forEach(
        refreshIds
      );

  }


  return block;

}


/* =========================================================
   CREATE BLOCK
========================================================= */

function createBaseBlock(type) {

  const theme =
    getTheme();


  return {

    id:
      createId(),

    type,

    content: {},

    children: [],

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

}


function createBlock(type) {

  const block =
    createBaseBlock(type);


  const theme =
    getTheme();


  switch (type) {


    case "neonTitle":

      block.content = {

        kicker:
          "INTRODUCTION",

        title:
          "タイトルを入力",

        subtitle:
          "サブタイトルを入力"

      };


      block.style.align =
        "center";


      block.style.fontSize =
        48;


      block.style.padding =
        34;


      block.effect.preset =
        "neon";

      break;


    case "messageBox":

      block.content = {

        kicker:
          "MESSAGE",

        body:
          "メッセージ本文を入力してください。",

        footer:
          "補足テキストを入力"

      };


      block.style.padding =
        28;


      block.effect.preset =
        "glow";

      break;


    case "sectionText":

      block.content = {

        kicker:
          "SECTION",

        heading:
          "見出しを入力",

        body:
          "説明文を入力してください。"

      };


      block.style.fontSize =
        26;

      break;


    case "card":

      block.content = {

        kicker:
          "CARD",

        heading:
          "カードタイトルを入力",

        body:
          "カードの説明文を入力してください。"

      };


      block.style
        .backgroundColor =
        theme.surface;


      block.style.fontSize =
        24;

      break;


    case "image":

      block.content = {

        imageKey:
          "画像キーを入力",

        caption:
          "キャプションを入力",

        fit:
          "cover",

        previewHeight:
          320,

        profileEnabled:
          false,

        profileColumns:
          2,

        profileFields:
          cloneProfileFields()

      };


      block.style
        .backgroundColor =
        theme.surface;

      break;


    case "profile":

      block.content = {

        heading:
          "PROFILE",

        columns:
          2,

        fields:
          cloneProfileFields()

      };


      block.style
        .backgroundColor =
        theme.surface;


      block.style.fontSize =
        22;

      break;


    case "notice":

      block.content = {

        heading:
          "注意事項",

        body:
          "注意書きを入力してください。"

      };


      block.style.fontSize =
        20;

      break;


    case "tags":

      block.content = {

        items: [
          "タグを入力",
          "タグを入力"
        ]

      };


      block.style
        .backgroundColor =
        "transparent";


      block.style
        .borderWidth =
        0;


      block.style.padding =
        4;

      break;


    case "divider":

      block.content = {

        label:
          "SECTION"

      };


      block.style
        .backgroundColor =
        "transparent";


      block.style.padding =
        10;

      break;


    case "button":

      block.content = {

        label:
          "ボタンテキストを入力"

      };


      block.style.align =
        "center";


      block.style
        .backgroundColor =
        theme.accent;


      block.style
        .textColor =
        state.theme ===
        "minimal"
          ? "#ffffff"
          : theme.background;


      block.style.padding =
        15;

      break;


    case "toggle":

      block.content = {

        summary:
          "トグルタイトルを入力",

        defaultOpen:
          true

      };


      block.style
        .backgroundColor =
        theme.surface;


      block.style.padding =
        14;

      break;

  }


  return block;

}


/* =========================================================
   NORMALIZE OLD SAVE DATA
========================================================= */

function normalizeBlock(block) {

  const base =
    createBlock(
      block.type ||
      "sectionText"
    );


  const normalized = {

    ...base,

    ...block,

    content: {

      ...base.content,

      ...(
        block.content ||
        {}
      )

    },

    style: {

      ...base.style,

      ...(
        block.style ||
        {}
      )

    },

    effect: {

      ...base.effect,

      ...(
        block.effect ||
        {}
      )

    },

    children:
      Array.isArray(
        block.children
      )
        ? block.children
            .map(
              normalizeBlock
            )
        : []

  };


  if (
    normalized.type ===
    "image"
  ) {

    normalized.content
      .profileFields =
      Array.isArray(
        normalized.content
          .profileFields
      )
        ? normalized.content
            .profileFields
        : cloneProfileFields();

  }


  if (
    normalized.type ===
    "profile"
  ) {

    normalized.content
      .fields =
      Array.isArray(
        normalized.content
          .fields
      )
        ? normalized.content
            .fields
        : cloneProfileFields();

  }


  return normalized;

}


/* =========================================================
   RECURSIVE BLOCK SEARCH
========================================================= */

function findBlockLocation(
  id,
  blocks = state.blocks,
  parentId = null
) {

  for (
    let i = 0;
    i < blocks.length;
    i++
  ) {

    const block =
      blocks[i];


    if (
      block.id === id
    ) {

      return {

        block,

        index: i,

        container:
          blocks,

        parentId

      };

    }


    if (
      Array.isArray(
        block.children
      ) &&
      block.children.length
    ) {

      const found =
        findBlockLocation(
          id,
          block.children,
          block.id
        );


      if (found) {
        return found;
      }

    }

  }


  return null;

}


function getSelectedBlock() {

  return (
    findBlockLocation(
      selectedId
    )?.block ||
    null
  );

}


function getContainer(
  parentId
) {

  if (
    !parentId ||
    parentId ===
    "root"
  ) {

    return state.blocks;

  }


  const parent =
    findBlockLocation(
      parentId
    )?.block;


  return (
    parent?.children ||
    null
  );

}


/* =========================================================
   STORAGE
========================================================= */

let saveTimer = null;


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

    console.warn(error);

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
        parsed.blocks
          .map(
            normalizeBlock
          );

    }

  } catch (error) {

    console.warn(error);

  }

}


/* =========================================================
   CSS VARIABLES
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


function effectClass(block) {

  const preset =
    block.effect?.preset;


  if (
    !preset ||
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
      ?.animation;


  if (
    !animation ||
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
   PROFILE MARKUP
========================================================= */

function profileMarkup(
  fields,
  columns = 2,
  source = "self"
) {

  const enabled =
    (fields || [])
      .filter(
        field =>
          field.enabled
      );


  if (
    !enabled.length
  ) {

    return `
      <div class="profile-empty">
        表示するプロフィール項目を選択してください
      </div>
    `;

  }


  return `
    <div
      class="
        profile-grid
        profile-cols-${columns}
      "
    >

      ${enabled
        .map(
          field =>
            `
              <div class="profile-cell">

                <div class="profile-label">
                  ${escapeHTML(field.label)}
                </div>

                <div
                  class="profile-value"
                  data-profile-field="${field.id}"
                  data-profile-source="${source}"
                >
                  ${escapeHTML(field.value)}
                </div>

              </div>
            `
        )
        .join("")}

    </div>
  `;

}


/* =========================================================
   IMAGE
========================================================= */

function imageMarkup(block) {

  const c =
    block.content;


  const src =
    previewImages.get(
      block.id
    );


  let imageArea;


  if (src) {

    imageArea = `
      <div
        class="image-preview has-image"
        style="
          height:${c.previewHeight}px;
        "
      >

        <img
          src="${src}"
          alt="プレビュー画像"
          style="
            object-fit:${c.fit};
          "
        >

        <button
          type="button"
          class="image-change-button"
          data-image-pick="${block.id}"
        >
          画像を変更
        </button>

      </div>
    `;

  } else {

    imageArea = `
      <div
        class="image-preview"
        style="
          height:${c.previewHeight}px;
        "
      >

        <button
          type="button"
          class="image-upload-button"
          data-image-pick="${block.id}"
        >

          <span class="image-upload-plus">
            ＋
          </span>

          <strong>
            プレビュー画像を選ぶ
          </strong>

          <small>
            端末内だけで使用します
          </small>

        </button>


        <div class="image-code">
          {{img:${escapeHTML(c.imageKey)}}}
        </div>

      </div>
    `;

  }


  const profile =
    c.profileEnabled
      ? `
          <div class="embedded-profile">

            ${profileMarkup(
              c.profileFields,
              c.profileColumns,
              "embedded"
            )}

          </div>
        `
      : "";


  return `
    <div class="part-image">

      ${imageArea}

      <div
        class="part-subtitle"
        data-edit-field="caption"
      >
        ${escapeHTML(c.caption)}
      </div>

      ${profile}

    </div>
  `;

}


/* =========================================================
   BLOCK CONTENT
========================================================= */

function blockContentMarkup(
  block,
  depth = 0
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
          >
            ${escapeHTML(c.kicker)}
          </div>

          <div
            class="part-main-title"
            data-edit-field="title"
          >
            ${escapeHTML(c.title)}
          </div>

          <div
            class="part-subtitle"
            data-edit-field="subtitle"
          >
            ${escapeHTML(c.subtitle)}
          </div>

        </div>
      `;


    case "messageBox":

      return `
        <div class="part-message-box">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >
            ${escapeHTML(c.kicker)}
          </div>

          <div
            class="message-body"
            data-edit-field="body"
          >
            ${lineBreaks(c.body)}
          </div>

          <div
            class="message-footer"
            data-edit-field="footer"
          >
            ${escapeHTML(c.footer)}
          </div>

        </div>
      `;


    case "sectionText":

      return `
        <div class="part-section-text">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >
            ${escapeHTML(c.kicker)}
          </div>

          <div
            class="part-main-title"
            data-edit-field="heading"
          >
            ${escapeHTML(c.heading)}
          </div>

          <div
            class="part-body"
            data-edit-field="body"
          >
            ${lineBreaks(c.body)}
          </div>

        </div>
      `;


    case "card":

      return `
        <div class="part-card">

          <div
            class="part-kicker"
            data-edit-field="kicker"
          >
            ${escapeHTML(c.kicker)}
          </div>

          <div
            class="part-main-title"
            data-edit-field="heading"
          >
            ${escapeHTML(c.heading)}
          </div>

          <div
            class="part-body"
            data-edit-field="body"
          >
            ${lineBreaks(c.body)}
          </div>

        </div>
      `;


    case "image":

      return imageMarkup(
        block
      );


    case "profile":

      return `
        <div class="part-profile">

          <div
            class="part-kicker"
            data-edit-field="heading"
          >
            ${escapeHTML(c.heading)}
          </div>

          ${profileMarkup(
            c.fields,
            c.columns,
            "self"
          )}

        </div>
      `;


    case "notice":

      return `
        <div class="part-notice">

          <div
            class="part-kicker"
            data-edit-field="heading"
          >
            ${escapeHTML(c.heading)}
          </div>

          <div
            class="part-body"
            data-edit-field="body"
          >
            ${lineBreaks(c.body)}
          </div>

        </div>
      `;


    case "tags":

      return `
        <div class="tag-list">

          ${c.items
            .map(
              tag =>
                `
                  <span class="tag-chip">
                    #${escapeHTML(tag)}
                  </span>
                `
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
            >
              ${escapeHTML(c.label)}
            </span>

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
          >
            ${escapeHTML(c.label)}
          </div>

        </div>
      `;


    case "toggle":

      return `
        <details
          class="toggle-preview"
          ${
            c.defaultOpen
              ? "open"
              : ""
          }
        >

          <summary>

            <span class="toggle-arrow">
              ▼
            </span>

            <span
              data-edit-field="summary"
            >
              ${escapeHTML(c.summary)}
            </span>

          </summary>


          <div class="toggle-children">

            ${
              !block.children.length
                ? renderInserter(
                    block.id,
                    "start"
                  )
                : ""
            }

            ${renderChildren(
              block.children,
              block.id,
              depth + 1
            )}

          </div>

        </details>
      `;

  }


  return "";

}


/* =========================================================
   TOOLBAR
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
   INSERTER
========================================================= */

function inserterKey(
  parentId,
  afterId
) {

  return (
    (
      parentId ||
      "root"
    ) +
    "::" +
    (
      afterId ||
      "start"
    )
  );

}


function renderInserter(
  parentId = "root",
  afterId = "start"
) {

  const key =
    inserterKey(
      parentId,
      afterId
    );


  const open =
    openInserterKey ===
    key;


  return `
    <div
      class="inline-inserter"
      data-parent-id="${parentId}"
      data-after-id="${afterId}"
    >

      <button
        type="button"
        class="inline-plus"
        data-toggle-inserter="${key}"
      >
        ＋
      </button>


      ${
        open
          ? `
              <div class="mini-palette">

                ${MINI_PARTS
                  .map(
                    ([type, label]) =>
                      `
                        <button
                          type="button"
                          data-inline-add="${type}"
                          data-parent-id="${parentId}"
                          data-after-id="${afterId}"
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
   BLOCK RENDER
========================================================= */

function renderBlock(
  block,
  parentId = "root",
  depth = 0
) {

  const selected =
    block.id ===
    selectedId
      ? "selected"
      : "";


  const nested =
    depth > 0
      ? "nested-block"
      : "";


  return `
    <div
      class="
        builder-block
        ${nested}
        ${selected}
        ${effectClass(block)}
        ${animationClass(block)}
      "
      data-block-id="${block.id}"
      data-parent-id="${parentId}"
      style="${blockStyleVariables(block)}"
    >

      ${toolbarMarkup()}

      ${blockContentMarkup(
        block,
        depth
      )}

    </div>
  `;

}


function renderChildren(
  blocks,
  parentId = "root",
  depth = 0
) {

  return blocks
    .map(
      block =>
        `
          ${renderBlock(
            block,
            parentId,
            depth
          )}

          ${renderInserter(
            parentId,
            block.id
          )}
        `
    )
    .join("");

}


/* =========================================================
   CANVAS
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


  document.body
    .classList.toggle(
      "preview-mode",
      state.uiMode ===
      "preview"
    );


  canvas.innerHTML =
    state.blocks.length
      ? `
          ${renderInserter(
            "root",
            "start"
          )}

          ${renderChildren(
            state.blocks,
            "root",
            0
          )}
        `
      : renderInserter(
          "root",
          "start"
        );


  if (
    state.uiMode ===
    "edit"
  ) {

    canvas
      .querySelectorAll(
        `
          [data-edit-field],
          [data-profile-field]
        `
      )
      .forEach(
        element => {

          element
            .contentEditable =
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
   CANVAS CLICK
========================================================= */

canvas.addEventListener(
  "click",
  event => {


    /* IMAGE PICK */

    const pick =
      event.target.closest(
        "[data-image-pick]"
      );


    if (pick) {

      event.stopPropagation();


      imageUploadTargetId =
        pick.dataset.imagePick;


      previewFileInput
        ?.click();


      return;

    }


    /* INSERTER */

    const toggle =
      event.target.closest(
        "[data-toggle-inserter]"
      );


    if (toggle) {

      event.stopPropagation();


      const key =
        toggle.dataset
          .toggleInserter;


      openInserterKey =
        openInserterKey === key
          ? null
          : key;


      renderCanvas();

      return;

    }


    /* INLINE ADD */

    const inlineAdd =
      event.target.closest(
        "[data-inline-add]"
      );


    if (inlineAdd) {

      event.stopPropagation();


      insertBlock(

        inlineAdd.dataset
          .parentId,

        inlineAdd.dataset
          .afterId,

        inlineAdd.dataset
          .inlineAdd

      );


      return;

    }


    /* ACTION */

    const actionButton =
      event.target.closest(
        "[data-canvas-action]"
      );


    if (actionButton) {

      event.stopPropagation();


      const blockEl =
        actionButton.closest(
          "[data-block-id]"
        );


      if (!blockEl) {
        return;
      }


      selectedId =
        blockEl.dataset
          .blockId;


      runBlockAction(
        actionButton.dataset
          .canvasAction
      );


      return;

    }


    /* SELECT BLOCK */

    const blockEl =
      event.target.closest(
        "[data-block-id]"
      );


    if (blockEl) {

      selectBlock(
        blockEl.dataset
          .blockId
      );

    }

  }
);


/* =========================================================
   DIRECT EDIT
========================================================= */

canvas.addEventListener(
  "input",
  event => {


    const blockEl =
      event.target.closest(
        "[data-block-id]"
      );


    if (!blockEl) {
      return;
    }


    const block =
      findBlockLocation(
        blockEl.dataset
          .blockId
      )?.block;


    if (!block) {
      return;
    }


    /* NORMAL TEXT */

    const editable =
      event.target.closest(
        "[data-edit-field]"
      );


    if (editable) {

      block.content[
        editable.dataset
          .editField
      ] =
        editable.innerText;


      selectedId =
        block.id;


      generateOutput();

      renderInspector();

      scheduleSave();

      return;

    }


    /* PROFILE */

    const profileValue =
      event.target.closest(
        "[data-profile-field]"
      );


    if (profileValue) {

      const source =
        profileValue.dataset
          .profileSource;


      const fields =
        source ===
        "embedded"
          ? block.content
              .profileFields
          : block.content
              .fields;


      const field =
        fields?.find(
          item =>
            item.id ===
            profileValue.dataset
              .profileField
        );


      if (field) {

        field.value =
          profileValue
            .innerText;

      }


      selectedId =
        block.id;


      generateOutput();

      renderInspector();

      scheduleSave();

    }

  }
);


/* =========================================================
   LOCAL PREVIEW IMAGE
========================================================= */

previewFileInput
  ?.addEventListener(
    "change",
    () => {


      const file =
        previewFileInput
          .files?.[0];


      if (
        !file ||
        !imageUploadTargetId
      ) {
        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        () => {


          previewImages.set(
            imageUploadTargetId,
            reader.result
          );


          renderCanvas();

          renderInspector();

        };


      reader.readAsDataURL(
        file
      );


      previewFileInput.value =
        "";

    }
  );


/* =========================================================
   DRAG
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
      block.dataset.blockId;


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


    const sourceLoc =
      findBlockLocation(
        dragBlockId
      );


    const targetLoc =
      findBlockLocation(
        target.dataset.blockId
      );


    /*
     * 今回は同じ階層内だけ
     * ドラッグ並び替え可能。
     */
    if (
      !sourceLoc ||
      !targetLoc ||
      sourceLoc.parentId !==
      targetLoc.parentId
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


    const sourceLoc =
      findBlockLocation(
        dragBlockId
      );


    const targetLoc =
      findBlockLocation(
        target.dataset.blockId
      );


    if (
      !sourceLoc ||
      !targetLoc ||
      sourceLoc.parentId !==
      targetLoc.parentId
    ) {
      return;
    }


    const [
      moved
    ] =
      sourceLoc.container
        .splice(
          sourceLoc.index,
          1
        );


    const newTargetIndex =
      targetLoc.container
        .findIndex(
          block =>
            block.id ===
            target.dataset
              .blockId
        );


    targetLoc.container
      .splice(
        newTargetIndex,
        0,
        moved
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


/* =========================================================
   INSERT BLOCK
========================================================= */

function insertBlock(
  parentId,
  afterId,
  type
) {

  const container =
    getContainer(
      parentId
    );


  if (!container) {
    return;
  }


  const block =
    createBlock(type);


  if (
    afterId ===
    "start"
  ) {

    container.unshift(
      block
    );

  } else {

    const index =
      container
        .findIndex(
          item =>
            item.id ===
            afterId
        );


    if (
      index < 0
    ) {

      container.push(
        block
      );

    } else {

      container.splice(
        index + 1,
        0,
        block
      );

    }

  }


  selectedId =
    block.id;


  openInserterKey =
    null;


  renderAll();

}


/* =========================================================
   LEFT ADD
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


          const selectedLoc =
            findBlockLocation(
              selectedId
            );


          if (selectedLoc) {

            insertBlock(

              selectedLoc.parentId ||
              "root",

              selectedId,

              button.dataset.add

            );

          } else {

            insertBlock(

              "root",

              state.blocks
                .at(-1)
                ?.id ||
              "start",

              button.dataset.add

            );

          }

        }
      );

    }
  );


/* =========================================================
   BLOCK ACTION
========================================================= */

function runBlockAction(
  action
) {

  const loc =
    findBlockLocation(
      selectedId
    );


  if (!loc) {
    return;
  }


  const {
    container,
    index,
    block
  } = loc;


  if (
    action ===
    "moveUp" &&
    index > 0
  ) {

    [
      container[index - 1],
      container[index]
    ] = [
      container[index],
      container[index - 1]
    ];

  }


  if (
    action ===
    "moveDown" &&
    index <
    container.length - 1
  ) {

    [
      container[index],
      container[index + 1]
    ] = [
      container[index + 1],
      container[index]
    ];

  }


  if (
    action ===
    "duplicate"
  ) {

    const copy =
      refreshIds(
        deepClone(block)
      );


    container.splice(
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

    container.splice(
      index,
      1
    );


    previewImages.delete(
      block.id
    );


    selectedId =
      container[
        Math.min(
          index,
          container.length - 1
        )
      ]?.id ||
      null;

  }


  renderAll();

}


/* =========================================================
   INSPECTOR BASIC FIELD
========================================================= */

function contentFieldHTML(
  definition,
  block
) {

  const value =
    block.content[
      definition.key
    ];


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
          data-content-key="${definition.key}"
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
          data-content-key="${definition.key}"
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
        data-content-key="${definition.key}"
      >

    </div>
  `;

}


/* =========================================================
   COLOR
========================================================= */

function colorFieldHTML(
  label,
  key,
  value
) {

  const safe =
    /^#[0-9a-f]{6}$/i
      .test(value)
        ? value
        : "#000000";


  return `
    <div class="inspector-field">

      <label>
        ${label}
      </label>

      <div class="color-control">

        <input
          type="color"
          value="${safe}"
          data-style-key="${key}"
        >

        <input
          type="text"
          value="${escapeHTML(value)}"
          data-style-key="${key}"
        >

      </div>

    </div>
  `;

}


/* =========================================================
   RANGE
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

        <span>
          ${label}
        </span>

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


function rangeContentFieldHTML(
  label,
  key,
  value,
  min,
  max
) {

  return `
    <div class="inspector-field">

      <label>

        <span>
          ${label}
        </span>

        <span>
          ${value}px
        </span>

      </label>

      <input
        type="range"
        min="${min}"
        max="${max}"
        step="10"
        value="${value}"
        data-content-number="${key}"
      >

    </div>
  `;

}


/* =========================================================
   PROFILE INSPECTOR
========================================================= */

function profileEditorHTML(
  fields,
  source,
  columns
) {

  return `
    <div class="inspector-group">

      <div class="inspector-group-title">
        PROFILE ITEMS
      </div>


      <div class="inspector-field">

        <label>
          列数
        </label>

        <select
          data-profile-columns="${source}"
        >

          <option
            value="1"
            ${
              columns === 1
                ? "selected"
                : ""
            }
          >
            1列
          </option>

          <option
            value="2"
            ${
              columns === 2
                ? "selected"
                : ""
            }
          >
            2列
          </option>

          <option
            value="3"
            ${
              columns === 3
                ? "selected"
                : ""
            }
          >
            3列
          </option>

        </select>

      </div>


      <div class="profile-editor-list">

        ${fields
          .map(
            field =>
              `
                <div class="profile-editor-row">

                  <label class="profile-check">

                    <input
                      type="checkbox"
                      data-profile-source="${source}"
                      data-profile-id="${field.id}"
                      data-profile-prop="enabled"
                      ${
                        field.enabled
                          ? "checked"
                          : ""
                      }
                    >

                    <span>
                      ${escapeHTML(field.label)}
                    </span>

                  </label>


                  <input
                    type="text"
                    value="${escapeHTML(field.label)}"
                    data-profile-source="${source}"
                    data-profile-id="${field.id}"
                    data-profile-prop="label"
                    aria-label="項目名"
                  >


                  <input
                    type="text"
                    value="${escapeHTML(field.value)}"
                    data-profile-source="${source}"
                    data-profile-id="${field.id}"
                    data-profile-prop="value"
                    aria-label="内容"
                  >

                </div>
              `
          )
          .join("")}

      </div>

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


  let contentHTML =
    (
      meta.contentFields ||
      []
    )
      .map(
        field =>
          contentFieldHTML(
            field,
            block
          )
      )
      .join("");


  /* IMAGE OPTIONS */

  if (
    block.type ===
    "image"
  ) {

    contentHTML += `

      <div class="inspector-field">

        <label>
          プレビュー画像
        </label>

        <button
          type="button"
          class="inspector-upload-button"
          data-inspector-image-pick="${block.id}"
        >
          ${
            previewImages.has(
              block.id
            )
              ? "画像を変更"
              : "プレビュー画像を選ぶ"
          }
        </button>


        ${
          previewImages.has(
            block.id
          )
            ? `
                <button
                  type="button"
                  class="inspector-remove-image"
                  data-remove-preview="${block.id}"
                >
                  プレビュー画像を削除
                </button>
              `
            : ""
        }


        <small class="inspector-note">
          端末内プレビュー専用です。
          Talelynx出力には画像キーが使われます。
        </small>

      </div>


      <div class="inspector-field">

        <label>
          画像の表示方法
        </label>

        <select
          data-content-key="fit"
        >

          <option
            value="cover"
            ${
              block.content.fit ===
              "cover"
                ? "selected"
                : ""
            }
          >
            切り抜いて表示
          </option>

          <option
            value="contain"
            ${
              block.content.fit ===
              "contain"
                ? "selected"
                : ""
            }
          >
            全体を表示
          </option>

        </select>

      </div>


      ${rangeContentFieldHTML(
        "プレビュー高さ",
        "previewHeight",
        block.content
          .previewHeight,
        160,
        700
      )}


      <div class="inspector-field">

        <label class="toggle-setting">

          <input
            type="checkbox"
            data-content-checkbox="profileEnabled"
            ${
              block.content
                .profileEnabled
                  ? "checked"
                  : ""
            }
          >

          <span>
            画像ブロック内にプロフィールを表示
          </span>

        </label>

      </div>


      ${
        block.content
          .profileEnabled
            ? profileEditorHTML(
                block.content
                  .profileFields,
                "embedded",
                Number(
                  block.content
                    .profileColumns
                ) ||
                2
              )
            : ""
      }

    `;

  }


  /* PROFILE */

  if (
    block.type ===
    "profile"
  ) {

    contentHTML +=
      profileEditorHTML(

        block.content
          .fields,

        "self",

        Number(
          block.content
            .columns
        ) ||
        2

      );

  }


  /* TOGGLE */

  if (
    block.type ===
    "toggle"
  ) {

    contentHTML += `

      <div class="inspector-field">

        <label class="toggle-setting">

          <input
            type="checkbox"
            data-content-checkbox="defaultOpen"
            ${
              block.content
                .defaultOpen
                  ? "checked"
                  : ""
            }
          >

          <span>
            最初から開いた状態にする
          </span>

        </label>

      </div>


      <div class="inspector-note-box">
        トグル内の「＋」から、
        プロフィール・画像・カードなど
        別パーツを追加できます。
      </div>

    `;

  }


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
          block.style
            .textColor
        )}

        ${colorFieldHTML(
          "背景色",
          "backgroundColor",
          block.style
            .backgroundColor
        )}

        ${colorFieldHTML(
          "アクセント",
          "accentColor",
          block.style
            .accentColor
        )}

        ${colorFieldHTML(
          "枠線",
          "borderColor",
          block.style
            .borderColor
        )}

        ${colorFieldHTML(
          "グロー",
          "glowColor",
          block.style
            .glowColor
        )}

      </div>


      <div class="inspector-group">

        <div class="inspector-group-title">
          STYLE
        </div>


        ${rangeFieldHTML(
          "文字サイズ",
          "fontSize",
          block.style
            .fontSize,
          12,
          72
        )}


        ${rangeFieldHTML(
          "余白",
          "padding",
          block.style
            .padding,
          0,
          64
        )}


        ${rangeFieldHTML(
          "角丸",
          "radius",
          block.style
            .radius,
          0,
          32
        )}


        ${rangeFieldHTML(
          "枠線の太さ",
          "borderWidth",
          block.style
            .borderWidth,
          0,
          5
        )}


        ${rangeFieldHTML(
          "字間",
          "letterSpacing",
          block.style
            .letterSpacing,
          0,
          12
        )}


        ${rangeFieldHTML(
          "グロー量",
          "glowSize",
          block.style
            .glowSize,
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

            ${
              [
                ["none", "なし"],
                ["glow", "Glow"],
                ["neon", "Neon"],
                ["glass", "Glass"],
                ["outline", "Outline"],
                ["soft", "Soft Shadow"]
              ]

                .map(
                  ([value, label]) =>
                    `
                      <option
                        value="${value}"
                        ${
                          block.effect
                            .preset ===
                          value
                            ? "selected"
                            : ""
                        }
                      >
                        ${label}
                      </option>
                    `
                )

                .join("")
            }

          </select>

        </div>


        <div class="inspector-field">

          <label>
            プレビューアニメーション
          </label>

          <select
            data-effect-key="animation"
          >

            ${
              [
                ["none", "なし"],
                ["fade", "Fade"],
                ["slide", "Slide Up"],
                ["pulse", "Pulse"],
                ["flicker", "Flicker"]
              ]

                .map(
                  ([value, label]) =>
                    `
                      <option
                        value="${value}"
                        ${
                          block.effect
                            .animation ===
                          value
                            ? "selected"
                            : ""
                        }
                      >
                        ${label}
                      </option>
                    `
                )

                .join("")
            }

          </select>

        </div>

      </div>

    `;

}


/* =========================================================
   INSPECTOR BUTTONS
========================================================= */

inspectorFields
  .addEventListener(
    "click",
    event => {


      const pick =
        event.target.closest(
          "[data-inspector-image-pick]"
        );


      if (pick) {

        imageUploadTargetId =
          pick.dataset
            .inspectorImagePick;


        previewFileInput
          ?.click();


        return;

      }


      const remove =
        event.target.closest(
          "[data-remove-preview]"
        );


      if (remove) {

        previewImages.delete(
          remove.dataset
            .removePreview
        );


        renderCanvas();

        renderInspector();

      }

    }
  );


/* =========================================================
   INSPECTOR CHANGES
========================================================= */

function handleInspectorChange(
  event
) {

  const block =
    getSelectedBlock();


  if (!block) {
    return;
  }


  const contentKey =
    event.target.dataset
      .contentKey;


  const contentNumber =
    event.target.dataset
      .contentNumber;


  const contentCheckbox =
    event.target.dataset
      .contentCheckbox;


  const styleKey =
    event.target.dataset
      .styleKey;


  const effectKey =
    event.target.dataset
      .effectKey;


  /* CONTENT */

  if (contentKey) {

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


  /* NUMBER */

  if (contentNumber) {

    block.content[
      contentNumber
    ] =
      Number(
        event.target.value
      );

  }


  /* CHECKBOX */

  if (contentCheckbox) {

    block.content[
      contentCheckbox
    ] =
      event.target.checked;

  }


  /* STYLE */

  if (styleKey) {

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


  /* EFFECT */

  if (effectKey) {

    block.effect[
      effectKey
    ] =
      event.target.value;

  }


  /* PROFILE */

  const profileSource =
    event.target.dataset
      .profileSource;


  const profileId =
    event.target.dataset
      .profileId;


  const profileProp =
    event.target.dataset
      .profileProp;


  if (
    profileSource &&
    profileId &&
    profileProp
  ) {

    const fields =
      profileSource ===
      "embedded"
        ? block.content
            .profileFields
        : block.content
            .fields;


    const field =
      fields?.find(
        item =>
          item.id ===
          profileId
      );


    if (field) {

      field[
        profileProp
      ] =
        profileProp ===
        "enabled"
          ? event.target.checked
          : event.target.value;

    }

  }


  /* PROFILE COLUMNS */

  const profileColumns =
    event.target.dataset
      .profileColumns;


  if (profileColumns) {

    if (
      profileColumns ===
      "embedded"
    ) {

      block.content
        .profileColumns =
        Number(
          event.target.value
        );

    } else {

      block.content
        .columns =
        Number(
          event.target.value
        );

    }

  }


  renderCanvas();

  generateOutput();

  scheduleSave();

}


inspectorFields
  .addEventListener(
    "input",
    handleInspectorChange
  );


inspectorFields
  .addEventListener(
    "change",
    event => {

      handleInspectorChange(
        event
      );

      renderInspector();

    }
  );


/* =========================================================
   RIGHT BLOCK ACTIONS
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


  function apply(blocks) {

    blocks.forEach(
      block => {


        block.style
          .textColor =
          theme.text;


        block.style
          .backgroundColor =
          (
            block.type ===
            "card" ||
            block.type ===
            "profile" ||
            block.type ===
            "toggle"
          )
            ? theme.surface
            : theme.background;


        block.style
          .accentColor =
          theme.accent;


        block.style
          .borderColor =
          theme.border;


        block.style
          .glowColor =
          theme.glow;


        if (
          [
            "tags",
            "divider"
          ].includes(
            block.type
          )
        ) {

          block.style
            .backgroundColor =
            "transparent";

        }


        if (
          block.type ===
          "button"
        ) {

          block.style
            .backgroundColor =
            theme.accent;

        }


        if (
          block.children
            ?.length
        ) {

          apply(
            block.children
          );

        }

      }
    );

  }


  apply(
    state.blocks
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

        button.classList
          .toggle(
            "active",
            button.dataset
              .theme ===
            state.theme
          );

      }
    );


  document
    .documentElement
    .style
    .setProperty(
      "--ui-accent",
      getTheme()
        .accent
    );

}


/* =========================================================
   EXPORT BASE
========================================================= */

function exportBaseStyle(
  block
) {

  const s =
    block.style;


  const parts = [

    `color:${s.textColor}`,

    `background:${s.backgroundColor}`,

    `border:${s.borderWidth}px solid ${s.borderColor}`,

    `border-radius:${s.radius}px`,

    `padding:${s.padding}px`,

    `text-align:${s.align}`,

    `font-size:${s.fontSize}px`

  ];


  if (
    [
      "glow",
      "neon"
    ].includes(
      block.effect
        .preset
    )
  ) {

    parts.push(
      `box-shadow:0 0 ${s.glowSize}px ${s.glowColor}`
    );

  }


  return (
    parts.join(";") +
    ";"
  );

}


/* =========================================================
   EXPORT PROFILE
========================================================= */

function exportProfileHTML(
  fields,
  columns,
  style
) {

  const enabled =
    (fields || [])
      .filter(
        field =>
          field.enabled
      );


  if (
    !enabled.length
  ) {
    return "";
  }


  let width =
    "100%";


  if (
    columns === 2
  ) {
    width = "48%";
  }


  if (
    columns === 3
  ) {
    width = "31%";
  }


  return enabled

    .map(
      field =>
        `
<div style="display:inline-block;width:${width};vertical-align:top;margin:0 1% 12px 0;">
  <div style="color:${style.accentColor};font-size:9px;letter-spacing:.12em;">
    ${escapeHTML(field.label)}
  </div>
  <div style="margin-top:4px;line-height:1.6;">
    ${lineBreaks(field.value)}
  </div>
</div>
        `.trim()
    )

    .join("");

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
      block.effect
        .preset ===
      "neon" ||
      block.effect
        .preset ===
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
  <div style="color:${s.accentColor};font-size:11px;font-weight:bold;letter-spacing:.16em;">
    ${escapeHTML(c.kicker)}
  </div>
  <div style="margin-top:10px;font-size:${s.fontSize}px;font-weight:bold;letter-spacing:${s.letterSpacing}px;${titleShadow}">
    ${escapeHTML(c.title)}
  </div>
  <div style="margin-top:8px;font-size:13px;opacity:.75;">
    ${escapeHTML(c.subtitle)}
  </div>
</div>
      `.trim();


    case "messageBox":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">
    ${escapeHTML(c.kicker)}
  </div>
  <div style="margin-top:24px;line-height:1.9;">
    ${lineBreaks(c.body)}
  </div>
  <div style="margin-top:20px;color:${s.accentColor};font-size:9px;text-align:right;">
    ${escapeHTML(c.footer)}
  </div>
</div>
      `.trim();


    case "sectionText":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">
    ${escapeHTML(c.kicker)}
  </div>
  <div style="margin-top:8px;font-size:${s.fontSize}px;font-weight:bold;${titleShadow}">
    ${escapeHTML(c.heading)}
  </div>
  <div style="margin-top:12px;font-size:14px;line-height:1.9;">
    ${lineBreaks(c.body)}
  </div>
</div>
      `.trim();


    case "card":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;">
    ${escapeHTML(c.kicker)}
  </div>
  <div style="margin-top:8px;font-size:${s.fontSize}px;font-weight:bold;">
    ${escapeHTML(c.heading)}
  </div>
  <div style="margin-top:12px;font-size:14px;line-height:1.8;">
    ${lineBreaks(c.body)}
  </div>
</div>
      `.trim();


    case "image":

      return `
<div style="${base}">
  {{img:${cleanImageKey(c.imageKey)}}}

  <div style="margin-top:8px;font-size:11px;opacity:.7;">
    ${escapeHTML(c.caption)}
  </div>

  ${
    c.profileEnabled
      ? `
          <div style="margin-top:16px;">
            ${exportProfileHTML(
              c.profileFields,
              Number(
                c.profileColumns
              ) ||
              2,
              s
            )}
          </div>
        `
      : ""
  }

</div>
      `.trim();


    case "profile":

      return `
<div style="${base}">

  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;letter-spacing:.14em;margin-bottom:12px;">
    ${escapeHTML(c.heading)}
  </div>

  ${exportProfileHTML(
    c.fields,
    Number(
      c.columns
    ) ||
    2,
    s
  )}

</div>
      `.trim();


    case "notice":

      return `
<div style="${base}">
  <div style="color:${s.accentColor};font-size:10px;font-weight:bold;">
    ${escapeHTML(c.heading)}
  </div>
  <div style="margin-top:8px;font-size:13px;line-height:1.8;">
    ${lineBreaks(c.body)}
  </div>
</div>
      `.trim();


    case "tags":

      return `
<div style="${base}">
  ${c.items
    .map(
      tag =>
        `
          <span style="display:inline-block;margin:3px;padding:5px 9px;border:1px solid ${s.borderColor};border-radius:999px;color:${s.accentColor};font-size:11px;">
            #${escapeHTML(tag)}
          </span>
        `
    )
    .join("")}
</div>
      `.trim();


    case "divider":

      return `
<div style="padding:${s.padding}px;text-align:center;color:${s.accentColor};font-size:10px;letter-spacing:.16em;">
  <hr style="border:0;border-top:${Math.max(
    s.borderWidth,
    1
  )}px solid ${s.borderColor};">
  ${escapeHTML(c.label)}
</div>
      `.trim();


    case "button":

      return `
<div style="${base};font-weight:bold;">
  ${escapeHTML(c.label)}
</div>
      `.trim();


    case "toggle":

      const children =
        (
          block.children ||
          []
        )
          .map(
            exportBlockHTML
          )
          .filter(Boolean)
          .join("\n");


      return `
<details
  ${
    c.defaultOpen
      ? "open"
      : ""
  }
  style="${base}"
>

  <summary style="cursor:pointer;font-weight:bold;color:${s.accentColor};">
    ${escapeHTML(c.summary)}
  </summary>

  <div style="margin-top:14px;">
    ${children}
  </div>

</details>
      `.trim();

  }


  return "";

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

      .filter(Boolean)

      .join(
        "\n\n"
      );


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


      copyButton.textContent =
        "コピーしました ✓";


      setTimeout(
        () => {

          copyButton.textContent =
            "HTMLをコピー";

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
   MODE
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
    renderCanvas
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


      if (
        !confirm(
          "編集内容をすべて初期状態に戻しますか？"
        )
      ) {
        return;
      }


      localStorage.removeItem(
        STORAGE_KEY
      );


      previewImages.clear();


      state = {

        theme:
          "cyber",

        uiMode:
          "edit",

        blocks: []

      };


      selectedId =
        null;


      createInitialBlocks();

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

  state.blocks = [

    createBlock(
      "neonTitle"
    ),

    createBlock(
      "sectionText"
    )

  ];

}


/* =========================================================
   INIT
========================================================= */

function init() {

  loadState();


  if (
    !state.blocks.length
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
