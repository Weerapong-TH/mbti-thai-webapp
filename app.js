const app = document.getElementById("app");

const state = {
  questionBank: [],
  questions: [],
  results: [],
  currentIndex: 0,
  answers: {}
};

const scoreOptions = [
  { id: "a2", label: "A มาก", helper: "ตรงกับฝั่ง A ชัดเจน", side: "A", score: 2 },
  { id: "a1", label: "A นิดหน่อย", helper: "เอนเอียงไปทาง A", side: "A", score: 1 },
  { id: "neutral", label: "ก้ำกึ่ง", helper: "ใกล้เคียงกันทั้งสองฝั่ง", side: "N", score: 0 },
  { id: "b1", label: "B นิดหน่อย", helper: "เอนเอียงไปทาง B", side: "B", score: 1 },
  { id: "b2", label: "B มาก", helper: "ตรงกับฝั่ง B ชัดเจน", side: "B", score: 2 }
];

const typePairs = [
  ["E", "I"],
  ["S", "N"],
  ["T", "F"],
  ["J", "P"]
];
const dimensionOrder = ["EI", "SN", "TF", "JP"];
const questionsPerDimension = 4;
const recentQuestionStorageKey = "mbtiThaiQuiz.lastQuestionIds";
let pendingRenderTimer = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  renderLoading();

  try {
    const [questionText, resultText] = await Promise.all([
      loadCSV("questions.csv"),
      loadCSV("results.csv")
    ]);

    state.questionBank = parseCSV(questionText);
    state.results = parseCSV(resultText);

    if (!state.questionBank.length || !state.results.length) {
      throw new Error("ไม่พบข้อมูลคำถามหรือผลลัพธ์ใน CSV");
    }

    renderStartScreen();
  } catch (error) {
    renderError(error);
  }
}

async function loadCSV(path) {
  const response = await fetch(path, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`โหลดไฟล์ ${path} ไม่สำเร็จ`);
  }

  return response.text();
}

function parseCSV(text) {
  const rows = [];
  let field = "";
  let row = [];
  let insideQuotes = false;

  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const nextChar = normalized[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      field += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if (char === "\n" && !insideQuotes) {
      row.push(field);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.trim()) || [];
  return rows.map((values) => {
    return headers.reduce((item, header, index) => {
      item[header] = (values[index] || "").trim();
      return item;
    }, {});
  });
}

function renderLoading() {
  app.innerHTML = `
    <section class="mx-auto max-w-xl rounded-lg border border-stone-200 bg-white p-8 text-center shadow-soft fade-in">
      <div class="mx-auto mb-5 h-12 w-12 rounded-full border-4 border-indigo-100 border-t-primary animate-spin"></div>
      <p class="font-display text-2xl font-bold">กำลังเตรียมแบบทดสอบ</p>
      <p class="mt-2 text-sm text-textMuted">กำลังโหลดคลังคำถามและชุดผลลัพธ์</p>
    </section>
  `;
}

function renderStartScreen() {
  state.currentIndex = 0;

  app.innerHTML = `
    <section class="mx-auto max-w-5xl fade-in">
      <div class="grid items-center gap-6 rounded-lg border border-stone-200 bg-white p-6 shadow-soft sm:p-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p class="mb-3 inline-flex rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-primary">
            แบบทดสอบบุคลิกภาพภาษาไทย
          </p>
          <h1 class="font-display text-4xl font-bold leading-tight tracking-normal text-textDark sm:text-6xl">
            MBTI Thai Quiz
          </h1>
          <p class="mt-5 max-w-xl text-lg leading-8 text-textMuted">
            ตอบคำถามสั้น ๆ เพื่อดูแนวโน้ม MBTI ของคุณ พร้อมสรุปจุดแข็ง สิ่งที่ควรระวัง และบทบาทที่อาจเข้ากับคุณ
          </p>

          <div class="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="rounded-lg bg-primary px-7 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 sm:min-w-64"
              onclick="startQuiz()"
            >
              เริ่มทำแบบทดสอบ
            </button>
            <p class="text-sm leading-6 text-textMuted">
              ใช้เวลาประมาณ 5 นาที
            </p>
          </div>

          <p class="mt-5 max-w-xl text-sm leading-7 text-stone-500">
            ผลลัพธ์เป็นแนวทางชวนสำรวจตัวเอง ไม่ใช่การวินิจฉัยหรือข้อสรุปถาวร
          </p>
        </div>

        <div class="rounded-lg border border-stone-200 bg-stone-50 p-5">
          <div class="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
            <span class="font-display text-xl font-bold text-textDark">สิ่งที่คุณจะได้เห็น</span>
            <span class="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-tertiary">16 ข้อ</span>
          </div>
          <div class="grid gap-3">
            <div class="rounded-md bg-white p-4">
              <p class="font-semibold text-textDark">ประเภท MBTI</p>
              <p class="mt-1 text-sm leading-6 text-textMuted">สรุปเป็น 4 ตัวอักษร เช่น INFJ, ENTP, ISTJ</p>
            </div>
            <div class="rounded-md bg-white p-4">
              <p class="font-semibold text-textDark">คะแนนรายมิติ</p>
              <p class="mt-1 text-sm leading-6 text-textMuted">ดูแนวโน้ม E/I, S/N, T/F และ J/P แยกกัน</p>
            </div>
            <div class="rounded-md bg-white p-4">
              <p class="font-semibold text-textDark">คำอธิบายที่เอาไปใช้ต่อได้</p>
              <p class="mt-1 text-sm leading-6 text-textMuted">อ่านจุดแข็ง ข้อควรระวัง และบทบาทที่เหมาะกับคุณ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function startQuiz() {
  state.questions = selectQuizQuestions(state.questionBank);
  state.currentIndex = 0;
  state.answers = {};
  rememberQuestionIds(state.questions);
  renderQuestion(true);
}

function selectQuizQuestions(questionBank) {
  const recentIds = readRecentQuestionIds();
  const selected = dimensionOrder.flatMap((dimension) => {
    const group = questionBank.filter((question) => question.dimension === dimension);
    return pickQuestions(group, questionsPerDimension, recentIds);
  });

  return shuffle(selected);
}

function pickQuestions(questions, count, recentIds) {
  const preferred = questions.filter((question) => !recentIds.includes(question.id));
  const chosen = sample(preferred, count);

  if (chosen.length >= count) {
    return chosen;
  }

  const chosenIds = chosen.map((question) => question.id);
  const fallback = questions.filter((question) => !chosenIds.includes(question.id));
  return chosen.concat(sample(fallback, count - chosen.length));
}

function sample(items, count) {
  return shuffle(items).slice(0, count);
}

function shuffle(items) {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function readRecentQuestionIds() {
  try {
    if (typeof localStorage === "undefined") {
      return [];
    }

    return JSON.parse(localStorage.getItem(recentQuestionStorageKey) || "[]");
  } catch {
    return [];
  }
}

function rememberQuestionIds(questions) {
  try {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(recentQuestionStorageKey, JSON.stringify(questions.map((question) => question.id)));
  } catch {
    // localStorage can be unavailable in private or restricted browser modes.
  }
}

function renderQuestion(animate = false) {
  const question = state.questions[state.currentIndex];
  const answer = state.answers[question.id];
  const progress = ((state.currentIndex + 1) / state.questions.length) * 100;
  const animationClass = animate ? "fade-in" : "";

  renderApp(`
    <section class="mx-auto flex h-[calc(100svh-1rem)] w-full max-w-4xl flex-col overflow-hidden sm:h-auto sm:max-h-[calc(100svh-2rem)] ${animationClass}">
      <div class="mb-2 flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 pb-2 sm:mb-3 sm:pb-3">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Active thread</p>
          <h1 class="font-display text-xl font-bold text-textDark sm:mt-0.5 sm:text-3xl">MBTI Thai Quiz</h1>
        </div>
        <span class="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary sm:px-4 sm:py-2 sm:text-sm">${question.dimension}</span>
      </div>

      <div class="thread-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-stone-200 bg-white p-3 shadow-soft sm:p-5">
        <div class="relative mb-3 shrink-0 pl-8 sm:mb-4 sm:pl-12">
          <span class="thread-dot absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white sm:h-10 sm:w-10 sm:text-sm">${state.currentIndex + 1}</span>
          <div class="mb-2 flex items-center justify-between gap-3 text-xs font-semibold text-textMuted sm:text-sm">
            <span>ข้อ ${state.currentIndex + 1} / ${state.questions.length}</span>
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-stone-100 sm:h-2.5">
            <div class="h-full rounded-full bg-primary transition-all duration-300" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="relative mb-3 shrink-0 pl-8 sm:mb-4 sm:pl-12">
          <span class="thread-dot absolute left-2 top-2 h-4 w-4 rounded-full border-4 border-white bg-secondary sm:left-3 sm:h-5 sm:w-5"></span>
          <h2 class="font-display text-lg font-bold leading-7 text-textDark sm:text-2xl sm:leading-9">${escapeHTML(question.question)}</h2>
        </div>

        <div class="relative mb-3 grid shrink-0 grid-cols-2 gap-2 pl-8 sm:mb-4 sm:gap-3 sm:pl-12">
          <div class="rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary sm:text-xs">A</p>
            <p class="mt-1 text-xs leading-5 text-textDark sm:mt-1.5 sm:text-sm sm:leading-6">${escapeHTML(question.a_text)}</p>
          </div>
          <div class="rounded-lg border border-stone-200 bg-stone-50 p-2.5 sm:p-3">
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-tertiary sm:text-xs">B</p>
            <p class="mt-1 text-xs leading-5 text-textDark sm:mt-1.5 sm:text-sm sm:leading-6">${escapeHTML(question.b_text)}</p>
          </div>
        </div>

        <fieldset class="relative mb-3 min-h-0 flex-1 pl-8 sm:mb-4 sm:pl-12">
          <legend class="mb-2 text-sm font-semibold text-textMuted">เลือกคำตอบที่ใกล้กับคุณที่สุด</legend>
          <div class="grid grid-cols-5 gap-1.5 sm:gap-2">
            ${scoreOptions.map((option) => renderAnswerOption(option, answer)).join("")}
          </div>
        </fieldset>

        <div class="relative grid shrink-0 grid-cols-2 gap-2 pl-8 sm:flex sm:flex-row sm:items-center sm:justify-between sm:pl-12">
          ${state.currentIndex === 0 ? "<span></span>" : `
            <button
              type="button"
              class="rounded-lg border border-stone-200 bg-white px-5 py-2.5 font-semibold text-textDark transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-stone-200"
              onclick="goBack()"
            >
              ย้อนกลับ
            </button>
          `}
          <button
            type="button"
            class="rounded-lg bg-primary px-6 py-2.5 font-semibold text-white transition enabled:hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500 focus:outline-none focus:ring-4 focus:ring-indigo-200"
            onclick="goNext()"
            ${answer ? "" : "disabled"}
          >
            ${state.currentIndex === state.questions.length - 1 ? "ดูผลลัพธ์" : "ถัดไป"}
          </button>
        </div>
      </div>
    </section>
  `, animate);
}

function renderAnswerOption(option, answer) {
  const selected = answer?.optionId === option.id;

  return `
    <button
      type="button"
      class="rounded-lg border px-1.5 py-2 text-center transition focus:outline-none focus:ring-4 focus:ring-indigo-100 sm:px-3 sm:py-2.5 ${
        selected
          ? "border-primary bg-indigo-50 text-textDark shadow-sm"
          : "border-stone-200 bg-white text-textDark hover:border-indigo-200 hover:bg-stone-50"
      }"
      onclick="saveAnswer('${option.id}')"
      aria-pressed="${selected}"
    >
      <span class="block text-[11px] font-semibold leading-4 sm:text-sm">${option.label}</span>
      <span class="sr-only">${option.helper}</span>
    </button>
  `;
}

function saveAnswer(optionId) {
  const question = state.questions[state.currentIndex];
  const option = scoreOptions.find((item) => item.id === optionId);

  state.answers[question.id] = {
    optionId: option.id,
    side: option.side,
    score: option.score
  };

  renderQuestion(false);
}

function goBack() {
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    renderQuestion(true);
  }
}

function goNext() {
  if (!state.answers[state.questions[state.currentIndex].id]) {
    return;
  }

  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion(true);
    return;
  }

  renderResult(true);
}

function calculateScore() {
  const scores = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0
  };

  state.questions.forEach((question) => {
    const answer = state.answers[question.id];

    if (!answer || answer.side === "N") {
      return;
    }

    const type = answer.side === "A" ? question.a_type : question.b_type;
    scores[type] += answer.score;
  });

  return scores;
}

function getMBTIType(scores) {
  return typePairs.map(([left, right]) => {
    if (scores[left] === scores[right]) {
      return right;
    }

    return scores[left] > scores[right] ? left : right;
  }).join("");
}

function renderResult(animate = false) {
  const scores = calculateScore();
  const type = getMBTIType(scores);
  const result = state.results.find((item) => item.type === type) || createFallbackResult(type);
  const animationClass = animate ? "fade-in" : "";

  renderApp(`
    <section class="mx-auto max-w-5xl ${animationClass}">
      <div class="mb-4 flex items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Thread summary</p>
          <h1 class="mt-1 font-display text-3xl font-bold text-textDark">ผลลัพธ์ของคุณ</h1>
        </div>
      </div>

      <div class="thread-panel rounded-lg border border-stone-200 bg-white p-5 shadow-soft sm:p-8">
        <div class="relative mb-8 border-b border-stone-200 pb-7 pl-10 sm:pl-14">
          <span class="thread-dot absolute left-0 top-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">MBTI</span>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 class="font-display text-6xl font-bold tracking-normal text-textDark">${type}</h2>
              <p class="mt-2 text-2xl font-semibold text-textDark">${escapeHTML(result.title)}</p>
            </div>
            <button
              type="button"
              class="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              onclick="restartQuiz()"
            >
              ทำแบบทดสอบใหม่
            </button>
          </div>
          <p class="mt-5 max-w-3xl text-base leading-8 text-textMuted">${escapeHTML(result.summary)}</p>
        </div>

        <div class="grid gap-5 pl-10 sm:pl-14 lg:grid-cols-[1fr_1.2fr]">
          <section class="rounded-lg border border-stone-200 p-5">
            <h3 class="mb-4 font-display text-xl font-bold">คะแนนแต่ละมิติ</h3>
            <div class="grid gap-4">
              ${typePairs.map((pair) => renderScorePair(pair, scores)).join("")}
            </div>
          </section>

          <section class="grid gap-5">
            ${renderListSection("จุดแข็ง", result.strengths)}
            ${renderListSection("จุดที่ควรระวัง", result.cautions)}
            ${renderListSection("งานหรือบทบาทที่เหมาะสม", result.career_fit)}
          </section>
        </div>
      </div>
    </section>
  `, animate);
}

function renderScorePair(pair, scores) {
  const [left, right] = pair;
  const total = scores[left] + scores[right];
  const leftPercent = total === 0 ? 50 : (scores[left] / total) * 100;

  return `
    <div>
      <div class="mb-2 flex items-center justify-between text-sm font-semibold text-textDark">
        <span>${left} ${scores[left]} / ${right} ${scores[right]}</span>
        <span class="text-textMuted">${scores[left] >= scores[right] ? left : right}</span>
      </div>
      <div class="flex h-3 overflow-hidden rounded-full bg-stone-100">
        <div class="bg-primary" style="width: ${leftPercent}%"></div>
        <div class="bg-amber-200" style="width: ${100 - leftPercent}%"></div>
      </div>
    </div>
  `;
}

function renderListSection(title, value) {
  const items = value.split(/[|,]/).map((item) => item.trim()).filter(Boolean);

  return `
    <div class="rounded-lg border border-stone-200 p-5">
      <h3 class="mb-3 font-display text-xl font-bold">${title}</h3>
      <ul class="grid gap-2 text-sm leading-6 text-textMuted sm:grid-cols-2">
        ${items.map((item) => `<li class="rounded-md bg-stone-50 px-3 py-2">${escapeHTML(item)}</li>`).join("")}
      </ul>
    </div>
  `;
}

function restartQuiz() {
  startQuiz();
}

function renderApp(markup, animate = false) {
  clearTimeout(pendingRenderTimer);

  if (!animate || !app.innerHTML.trim()) {
    app.innerHTML = markup;
    return;
  }

  app.classList.add("smooth-view", "is-leaving");
  pendingRenderTimer = setTimeout(() => {
    app.innerHTML = markup;
    app.classList.remove("is-leaving");
    app.classList.add("smooth-view");
  }, 150);
}

function renderError(error) {
  app.innerHTML = `
    <section class="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-soft fade-in sm:p-8">
      <p class="mb-3 text-sm font-semibold text-red-600">โหลดข้อมูลไม่สำเร็จ</p>
      <h1 class="text-2xl font-bold text-textDark">ไม่สามารถเปิดแบบทดสอบได้</h1>
      <p class="mt-4 leading-7 text-textMuted">${escapeHTML(error.message)}</p>
      <div class="mt-5 rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-700">
        หากเปิดไฟล์จากเครื่องโดยตรงแล้ว browser บล็อกการโหลด CSV ให้รันผ่าน local server เช่น VS Code Live Server หรือคำสั่ง <code class="rounded bg-white px-1.5 py-0.5">python -m http.server 8000</code>
      </div>
      <button
        type="button"
        class="mt-6 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
        onclick="init()"
      >
        ลองโหลดใหม่
      </button>
    </section>
  `;
}

function createFallbackResult(type) {
  return {
    type,
    title: "ผลลัพธ์ MBTI",
    summary: "ยังไม่มีคำอธิบายสำหรับประเภทนี้ใน results.csv",
    strengths: "มีรูปแบบการคิดเฉพาะตัว|เรียนรู้ตัวเองได้ดี",
    cautions: "ควรอ่านผลลัพธ์เป็นแนวทางเบื้องต้น",
    career_fit: "เลือกบทบาทที่สอดคล้องกับจุดแข็งของตัวเอง"
  };
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
