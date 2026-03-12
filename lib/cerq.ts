// lib/cerq.ts
export type CerqAnswer = 1 | 2 | 3 | 4 | 5;

export const CERQ_SCALE_LABELS = [
  "Өөрийгөө буруутгах",
  "Хүлээн зөвшөөрөх байдал",
  "Эргэцүүлж тунгаан бодох",
  "Дахин эергээр анхаарлаа төвлөрүүлэх",
  "Дахин анхаарал хандуулан төлөвлөх",
  "Эерэг дахин үнэлгээ",
  "Өөрийгөө оронд нь тавих",
  "Сүйтгэх хэв шинж",
  "Бусдыг буруутгах",
] as const;

export const CERQ_QUESTIONS: string[] = [
  "Өөрийгөө буруутай гэж мэдэрдэг",
  "Болсон үйл явдлын хариуцлагыг би хүлээх ёстой мэт санагддаг",
  "Миний гаргасан алдаа одоогийн үйл явдлуудад хамаатай гэж боддог",
  "Асуудлын гол шалтгаан нь би өөрийгөө гэж боддог",
  "Өнгөрсөн зүйлсийг хүлээн зөвшөөрөх хэрэгтэй гэж би боддог",
  "Ямар ч нөхцөл байдлыг хүлээн зөвшөөрөх ёстой гэж би боддог",
  "Юуг ч өөрчилж чадахгүй гэж би боддог",
  "Амьдрахын тулд суралцах ёстой гэж би боддог",
  "Туулсан зүйлийнхээ талаар юу мэдэрч байгаагаа үргэлж боддог",
  "Туулсан зүйлийнхээ талаар юу бодож, мэдэрч байгаадаа санаа зовж, автдаг",
  "Туулсан зүйлийнхээ талаар яагаад ингэж мэдэрч байгаагаа ойлгохыг хүсдэг",
  "Нөхцөл байдлаас болж надад төрсөн мэдрэмжийг би бодсоор байдаг",
  "Туулсан зүйлсээсээ илүү өөр сайхан зүйлсийн талаар боддог",
  "Ямар ч хамааралгүй тааламжтай зүйлсийн талаар бодож төсөөлдөг",
  "Болсон үйл явдлыг бодохын оронд ямар нэг өөр таатай зүйлсийн талаар боддог",
  "Би өөрт тохиолдсон тааламжтай, сайхан үйл явдлуудын талаар боддог",
  "Би юуг хамгийн сайн хийж чадах талаараа боддог",
  "Би нөхцөл байдлыг хэрхэн хамгийн сайнаар даван туулах вэ гэж боддог",
  "Би нөхцөл байдлыг хэрхэн өөрчлөх тухай боддог",
  "Хамгийн сайн хийж чадах зүйлсийнхээ талаар төлөвлөж, боддог",
  "Тохиолдсон зүйлсээс ямар нэгэн зүйлийг сурч чадна гэж би боддог",
  "Болсон үйл явдлын үр дүнд би илүү хүчирхэг хүн болж чадна гэж би боддог",
  "Таагүй нөхцөлд ч мөн адил эерэг талууд байгаа гэж боддог",
  "Би асуудлын эерэг талыг илүү хайж, эрэлхийлдэг",
  "Энэ бүхэн үүнээс ч илүү дор, муу байж болох байсан гэж боддог",
  "Бусад хүмүүс үүнээс илүү хэцүү зүйлсийг даван, туулдаг",
  "Бусад зүйлстэй харьцуулахад энэ тийм ч муу байгаагүй гэж би боддог",
  "Амьдралд үүнээс ч илүү хэцүү зүйлс байгаа гэж би өөртөө хэлдэг",
  "Миний туулсан зүйлс бусдын туулж өнгөрүүлснээс илүү хэцүү",
  "Миний туулсан зүйлс ямар хэцүү, аймшигтай байсан талаар би үргэлж боддог",
  "Надад тохиолдсон зүйл хүнд тохиолдож болох хамгийн муу зүйл гэж боддог",
  "Нөхцөл байдал ямар аймшигтай, хэцүү байсан тухай би тасралтгүй боддог",
  "Бусад хүмүүс үүнд буруутай гэж мэдэрдэг",
  "Болсон үйл явдалд бусад хүмүүс хариуцлага хүлээх ёстой гэж би боддог",
  "Бусдын гаргасан алдаатай үйлдлүүд үүнд хамаатай гэж би боддог",
  "Ерөнхийдөө шалтгаан нь бусад хүмүүсээс болсон, тэдэнтэй холбоотой гэж боддог",
];

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
}

// PDF "Боловсруулалт" mapping: 1-4, 5-8, ..., 33-36 :contentReference[oaicite:2]{index=2}
const IDX = {
  self_blame: [0, 1, 2, 3],
  acceptance: [4, 5, 6, 7],
  rumination: [8, 9, 10, 11],
  positive_refocusing: [12, 13, 14, 15],
  refocus_planning: [16, 17, 18, 19],
  positive_reappraisal: [20, 21, 22, 23],
  putting_perspective: [24, 25, 26, 27],
  catastrophizing: [28, 29, 30, 31],
  blaming_others: [32, 33, 34, 35],
} as const;

export type CerqScores = {
  selfBlameMean: number;
  acceptanceMean: number;
  ruminationMean: number;
  positiveRefocusingMean: number;
  refocusPlanningMean: number;
  positiveReappraisalMean: number;
  puttingPerspectiveMean: number;
  catastrophizingMean: number;
  blamingOthersMean: number;
  adaptiveMean: number;     // 2-6-7-8-9? биш; PDF дээр adaptive/maladaptive ангилал өгсөн :contentReference[oaicite:3]{index=3}
  maladaptiveMean: number;
};

export function computeCerqScores(answers: CerqAnswer[]): CerqScores {
  if (answers.length !== 36) throw new Error("CERQ requires 36 answers");

  const pick = (arr: readonly number[]) => arr.map((i) => answers[i]);

  const selfBlameMean = mean(pick(IDX.self_blame));
  const acceptanceMean = mean(pick(IDX.acceptance));
  const ruminationMean = mean(pick(IDX.rumination));
  const positiveRefocusingMean = mean(pick(IDX.positive_refocusing));
  const refocusPlanningMean = mean(pick(IDX.refocus_planning));
  const positiveReappraisalMean = mean(pick(IDX.positive_reappraisal));
  const puttingPerspectiveMean = mean(pick(IDX.putting_perspective));
  const catastrophizingMean = mean(pick(IDX.catastrophizing));
  const blamingOthersMean = mean(pick(IDX.blaming_others));

  // PDF дээрх ангилал: Adaptive = Acceptance, Positive refocusing, Refocus on planning, Positive reappraisal, Putting into perspective
  // Maladaptive = Self-blame, Rumination, Catastrophizing, Blaming others :contentReference[oaicite:4]{index=4}
  const adaptiveMean = mean([
    acceptanceMean,
    positiveRefocusingMean,
    refocusPlanningMean,
    positiveReappraisalMean,
    puttingPerspectiveMean,
  ]);
  const maladaptiveMean = mean([
    selfBlameMean,
    ruminationMean,
    catastrophizingMean,
    blamingOthersMean,
  ]);

  return {
    selfBlameMean,
    acceptanceMean,
    ruminationMean,
    positiveRefocusingMean,
    refocusPlanningMean,
    positiveReappraisalMean,
    puttingPerspectiveMean,
    catastrophizingMean,
    blamingOthersMean,
    adaptiveMean,
    maladaptiveMean,
  };
}