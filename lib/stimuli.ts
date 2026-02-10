import { CRTStage, StroopCondition } from "./types";

export type CRTStimulus =
  | { type: "word"; text: string; correct: string }
  | { type: "number"; text: string; correct: string }
  | { type: "arrowAngle"; angleDeg: number; correct: string }
  | { type: "arrowPos"; angleDeg: number; y: "top" | "bottom"; correct: string }
  | { type: "grid"; cells: boolean[]; correct: string; kind: "connected" | "symmetry" };


  
export type StroopStimulus = {
  word: string;         // "УЛААН"
  ink: string;          // css color string
  inkName: string;      // "Улаан"
  condition: StroopCondition;
};



/**
 * CRT1: Ургамал vs Амьтан (20/20), no repeats, randomized order.
 * CRT2: Нэг үетэй vs Хоёр үетэй (20/20), no repeats, randomized order.
 *
 * Word lists are fixed here for reproducibility. You can freely replace with your validated lists.
 */
const CRT1_PLANTS = [
  "Нарс","Хус","Гацуур","Бургас","Улиас","Хайлаас","Сөөг","Багваахай","Наранцэцэг","Төмс",
  "Сонгино","Сармис","Буудай","Арвай","Овъёос","Хөвөн","Улаанбуудай","Ногоон вандуй","Лууван","Өргөст хэмх"
];
const CRT1_ANIMALS = [
  "Нохой","Муур","Үхэр","Хонь","Ямаа","Тэмээ","Морь","Буга","Чоно","Үнэг",
  "Баавгай","Туулай","Хулгана","Бүргэд","Тахиа","Гахай","Мэлхий","Загас","Яст мэлхий","Арслан"
];

const CRT2_ONE_SYLL = [
  "нар","сар","уул","гол","шар","хар","цас","зам","аж","хүн",
  "ном","гар","морь","буу","сум","шаг","бор","шүд","ус","мод"
];
const CRT2_TWO_SYLL = [
  "нохой","мууртай","цагаан","бороо","хавар","өвөл","сайхан","хичээл","цонхоо","далай",
  "цаасан","утас","багш","гэрэл","жолоо","эмнэлэг","засал","хөгжим","ногоо","сүүдэр"
];

// --- helpers
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueNumbers(count: number, predicate: (n: number) => boolean): number[] {
  const set = new Set<number>();
  while (set.size < count) {
    const n = 100 + Math.floor(Math.random() * 900);
    if (!predicate(n)) continue;
    set.add(n);
  }
  return [...set];
}

// Connectivity (4-neighbor) on 3x3
function isConnected(cells: boolean[]): boolean {
  const filled = cells
    .map((v, i) => (v ? i : -1))
    .filter((i) => i !== -1);
  if (filled.length <= 1) return true;
  const set = new Set(filled);
  const q: number[] = [filled[0]];
  const seen = new Set<number>([filled[0]]);
  const nbrs = (idx: number) => {
    const r = Math.floor(idx / 3), c = idx % 3;
    const out: number[] = [];
    if (r > 0) out.push((r - 1) * 3 + c);
    if (r < 2) out.push((r + 1) * 3 + c);
    if (c > 0) out.push(r * 3 + (c - 1));
    if (c < 2) out.push(r * 3 + (c + 1));
    return out;
  };
  while (q.length) {
    const cur = q.shift()!;
    for (const n of nbrs(cur)) {
      if (!set.has(n) || seen.has(n)) continue;
      seen.add(n);
      q.push(n);
    }
  }
  return seen.size === set.size;
}

function mirrorVertical(cells: boolean[]): boolean[] {
  // mirror left-right
  const out = [...cells];
  for (let r = 0; r < 3; r++) {
    out[r * 3 + 0] = cells[r * 3 + 2];
    out[r * 3 + 2] = cells[r * 3 + 0];
    out[r * 3 + 1] = cells[r * 3 + 1];
  }
  return out;
}

function mirrorHorizontal(cells: boolean[]): boolean[] {
  // mirror top-bottom
  const out = [...cells];
  for (let c = 0; c < 3; c++) {
    out[0 * 3 + c] = cells[2 * 3 + c];
    out[2 * 3 + c] = cells[0 * 3 + c];
    out[1 * 3 + c] = cells[1 * 3 + c];
  }
  return out;
}

function sameArray(a: boolean[], b: boolean[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function encodeCells(cells: boolean[]): string {
  return cells.map((v) => (v ? "1" : "0")).join("");
}

function genConnectedPatterns(n: number): boolean[][] {
  const out: boolean[][] = [];
  const used = new Set<string>();
  while (out.length < n) {
    // choose 3..6 filled cells
    const filledCount = 3 + Math.floor(Math.random() * 4);
    const cells = Array(9).fill(false) as boolean[];
    const idxs = shuffle([...Array(9).keys()]).slice(0, filledCount);
    for (const i of idxs) cells[i] = true;
    if (!isConnected(cells)) continue;
    const key = encodeCells(cells);
    if (used.has(key)) continue;
    used.add(key);
    out.push(cells);
  }
  return out;
}

function genDisconnectedPatterns(n: number): boolean[][] {
  const out: boolean[][] = [];
  const used = new Set<string>();
  while (out.length < n) {
    const filledCount = 3 + Math.floor(Math.random() * 4);
    const cells = Array(9).fill(false) as boolean[];
    const idxs = shuffle([...Array(9).keys()]).slice(0, filledCount);
    for (const i of idxs) cells[i] = true;
    if (isConnected(cells)) continue;
    const key = encodeCells(cells);
    if (used.has(key)) continue;
    used.add(key);
    out.push(cells);
  }
  return out;
}

function genVerticalSymPatterns(n: number): boolean[][] {
  const out: boolean[][] = [];
  const used = new Set<string>();
  while (out.length < n) {
    const base = Array(9).fill(false) as boolean[];
    // define left half (col 0 and 1) randomly
    for (let r = 0; r < 3; r++) {
      base[r * 3 + 0] = Math.random() < 0.5;
      base[r * 3 + 1] = Math.random() < 0.5;
      base[r * 3 + 2] = base[r * 3 + 0]; // mirror
    }
    // ensure at least 2 cells filled
    if (base.filter(Boolean).length < 2) continue;
    const key = encodeCells(base);
    if (used.has(key)) continue;
    used.add(key);
    out.push(base);
  }
  return out;
}

function genHorizontalSymPatterns(n: number): boolean[][] {
  const out: boolean[][] = [];
  const used = new Set<string>();
  while (out.length < n) {
    const base = Array(9).fill(false) as boolean[];
    // define top half (row 0 and 1) randomly
    for (let c = 0; c < 3; c++) {
      base[0 * 3 + c] = Math.random() < 0.5;
      base[1 * 3 + c] = Math.random() < 0.5;
      base[2 * 3 + c] = base[0 * 3 + c]; // mirror
    }
    if (base.filter(Boolean).length < 2) continue;
    const key = encodeCells(base);
    if (used.has(key)) continue;
    used.add(key);
    out.push(base);
  }
  return out;
}

/**
 * Generate 40 unique stimuli per CRT stage, with 20 per category.
 * NOTE: CRT.5 angle logic follows the doc: Up is 300°–60°. Down is around 120°–240° by default.
 * If you must match a narrower down-range (e.g., 120°–140°), change DOWN_RANGE here.
 */
const UP_RANGES: Array<[number, number]> = [[300, 360], [0, 60]];
const DOWN_RANGE: [number, number] = [120, 240]; // change to [120,140] if needed

function randomAngleFromRanges(ranges: Array<[number, number]>): number {
  const total = ranges.reduce((acc, [a, b]) => acc + (b - a), 0);
  let pick = Math.random() * total;
  for (const [a, b] of ranges) {
    const span = b - a;
    if (pick <= span) return a + Math.random() * span;
    pick -= span;
  }
  return ranges[0][0];
}

export function makeCRT(stage: CRTStage): CRTStimulus[] {
  if (stage === "CRT1") {
    const plants = shuffle(CRT1_PLANTS).slice(0, 20).map((w) => ({ type:"word" as const, text:w, correct:"Ургамал" }));
    const animals = shuffle(CRT1_ANIMALS).slice(0, 20).map((w) => ({ type:"word" as const, text:w, correct:"Амьтан" }));
    return shuffle([...plants, ...animals]);
  }
  if (stage === "CRT2") {
    const one = shuffle(CRT2_ONE_SYLL).slice(0, 20).map((w) => ({ type:"word" as const, text:w, correct:"Нэг үетэй" }));
    const two = shuffle(CRT2_TWO_SYLL).slice(0, 20).map((w) => ({ type:"word" as const, text:w, correct:"Хоёр үетэй" }));
    return shuffle([...one, ...two]);
  }
  if (stage === "CRT3") {
    const evens = uniqueNumbers(20, (n) => n % 2 === 0).map((n) => ({ type:"number" as const, text:String(n), correct:"Тэгш" }));
    const odds = uniqueNumbers(20, (n) => n % 2 === 1).map((n) => ({ type:"number" as const, text:String(n), correct:"Сондгой" }));
    return shuffle([...evens, ...odds]);
  }
  if (stage === "CRT4") {
    const gt = uniqueNumbers(20, (n) => n > 500).map((n) => ({ type:"number" as const, text:String(n), correct:"500-с их" }));
    const lt = uniqueNumbers(20, (n) => n < 500).map((n) => ({ type:"number" as const, text:String(n), correct:"500-с бага" }));
    return shuffle([...gt, ...lt]);
  }
  if (stage === "CRT5") {
    // 20 up, 20 down. Ensure no exact angle duplicates (rounded to 1 dec).
    const used = new Set<string>();
    const up: CRTStimulus[] = [];
    const down: CRTStimulus[] = [];
    while (up.length < 20) {
      const a = randomAngleFromRanges(UP_RANGES);
      const key = a.toFixed(1);
      if (used.has(key)) continue;
      used.add(key);
      up.push({ type:"arrowAngle", angleDeg:a, correct:"Дээш чиглэсэн" });
    }
    while (down.length < 20) {
      const a = DOWN_RANGE[0] + Math.random() * (DOWN_RANGE[1] - DOWN_RANGE[0]);
      const key = a.toFixed(1);
      if (used.has(key)) continue;
      used.add(key);
      down.push({ type:"arrowAngle", angleDeg:a, correct:"Доош чиглэсэн" });
    }
    return shuffle([...up, ...down]);
  }
  if (stage === "CRT6") {
    // y position: top vs bottom half, 20/20
    const used = new Set<string>();
    const top: CRTStimulus[] = [];
    const bottom: CRTStimulus[] = [];
    while (top.length < 20) {
      const a = randomAngleFromRanges([[0, 360]]);
      const key = `${a.toFixed(1)}_top`;
      if (used.has(key)) continue;
      used.add(key);
      top.push({ type:"arrowPos", angleDeg:a, y:"top", correct:"Дээд" });
    }
    while (bottom.length < 20) {
      const a = randomAngleFromRanges([[0, 360]]);
      const key = `${a.toFixed(1)}_bottom`;
      if (used.has(key)) continue;
      used.add(key);
      bottom.push({ type:"arrowPos", angleDeg:a, y:"bottom", correct:"Доод" });
    }
    return shuffle([...top, ...bottom]);
  }
  if (stage === "CRT7") {
    const con = genConnectedPatterns(20).map((cells) => ({ type:"grid" as const, cells, correct:"Холбогдсон", kind:"connected" as const }));
    const dis = genDisconnectedPatterns(20).map((cells) => ({ type:"grid" as const, cells, correct:"Холбогдоогүй", kind:"connected" as const }));
    return shuffle([...con, ...dis]);
  }
    // CRT8
  // 3x3 grid дээр зөвхөн:
  // - нэг БАГАНА (3 нүд) эсвэл
  // - нэг МӨР (3 нүд)
  // харагдана. Хэрэглэгч нь босоо (багана) эсвэл хэвтээ (мөр) тэнхлэгийг аль болох хурдан сонгоно.

  function gridForColumn(col: number): boolean[] {
    const cells = Array(9).fill(false) as boolean[];
    for (let r = 0; r < 3; r++) cells[r * 3 + col] = true;
    return cells;
  }
  function gridForRow(row: number): boolean[] {
    const cells = Array(9).fill(false) as boolean[];
    for (let c = 0; c < 3; c++) cells[row * 3 + c] = true;
    return cells;
  }

  // 20 босоо (column) + 20 хэвтээ (row), balanced, randomized.
  const colChoices = shuffle(
    Array.from({ length: 20 }, (_, i) => i % 3)
  );
  const rowChoices = shuffle(
    Array.from({ length: 20 }, (_, i) => i % 3)
  );

  const vert = colChoices.map((c) => ({
    type: "grid" as const,
    cells: gridForColumn(c),
    correct: "Босоо тэнхлэг",
    kind: "symmetry" as const,
  }));
  const horiz = rowChoices.map((r) => ({
    type: "grid" as const,
    cells: gridForRow(r),
    correct: "Хэвтээ тэнхлэг",
    kind: "symmetry" as const,
  }));

  // Note: 3x3 дээр бүтэн мөр/багана нь нийт 6 л боломжтой тул 40 trial-д давталт зайлшгүй гарна.
  // Гэхдээ balanced + random хийж өгсөн.
  return shuffle([...vert, ...horiz]);
}

export const STROOP_COLORS = [
  { name: "Улаан", css: "#ff4d4d" },
  { name: "Цэнхэр", css: "#4d7cff" },
  { name: "Ногоон", css: "#4dff88" },
  { name: "Шар", css: "#ffd24d" },
] as const;

export const STROOP_WORDS = ["УЛААН","ЦЭНХЭР","НОГООН","ШАР"] as const;


//aa
//export const STROOP_WORDS = ["УЛААН","ЦЭНХЭР","НОГООН","ШАР"] as const;

export function makeStroopTrials(total: number = 60): StroopStimulus[] {
  // 50% congruent, 50% incongruent
  const half = Math.floor(total / 2);
  const out: StroopStimulus[] = [];

  // congruent
  for (let i = 0; i < half; i++) {
    const idx = Math.floor(Math.random() * STROOP_COLORS.length);
    out.push({
      word: STROOP_COLORS[idx].name.toUpperCase(),
      ink: STROOP_COLORS[idx].css,
      inkName: STROOP_COLORS[idx].name,
      condition: "congruent",
    });
  }

  // incongruent
  for (let i = 0; i < total - half; i++) {
    const wordIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    let inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    while (inkIdx === wordIdx) inkIdx = Math.floor(Math.random() * STROOP_COLORS.length);
    out.push({
      word: STROOP_WORDS[wordIdx],
      ink: STROOP_COLORS[inkIdx].css,
      inkName: STROOP_COLORS[inkIdx].name,
      condition: "incongruent",
    });
  }

  return shuffle(out);
}

