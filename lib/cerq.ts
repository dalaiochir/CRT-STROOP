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
  "Өөрийгөө ямар нэгэн зүйлд буруутай гэж боддог",
  "Аль хэдийн болсон үйл явдлын хариуцлагыг хүлээх ёстой гэж боддог",
  "Миний гаргасан алдаа үүнд хамаатай гэж боддог",
  "Миний өөртөө худлаа хэлж байгаагийн гол шалтгаан би өөрөө гэж боддог",
  "Ийм зүйл болсон гэдгийг хүлээн зөвшөөрөх хэрэгтэй гэж боддог",
  "Ямар нэгэн нөхцөл байдлыг хүлээн зөвшөөрөх ёстой гэж боддог",
  "Юуг ч өөрчилж чадахгүй гэж би боддог",
  "Амьдрахын тулд суралцах ёстой гэж би боддог",
  "Туулж өнгөрүүлсэн зүйлийнхээ талаар юу мэдэрч байгаагаа үргэлж боддог",
  "Туулж өнгөрүүлсэн зүйлийнхээ талаар юу бодож, мэдэрч байгаадаа санаа зовдог",
  "Туулж өнгөрүүлсэн зүйлийнхээ тухай яагаад ингэж мэдэрч байгаагаа ойлгохыг хүсдэг",
  "Нөхцөл байдлаас үүдэлтэй надад төрүүлсэн мэдрэмжүүдэд би анхаарал хандуулдаг",
  "Туулж өнгөрүүлсэн зүйлсээсээ илүү сайхан зүйлсийн талаар боддог",
  "Ямар ч хамааралгүй тааламжтай зүйлсийн талаар бодож төсөөлдөг",
  "Аль хэдийн болсон үйл явдлын оронд сайхан зүйлсийн талаар боддог",
  "Туулж өнгөрүүлсэн таатай үйл явдлын талаар боддог",
  "Юуг хамгийн сайн хийж чаддаг талаараа боддог",
  "Нөхцөл байдлыг хэрхэн хамгийн сайнаараа даван туулах талаар боддог",
  "Нөхцөл байдлыг хэрхэн өөрчлөх тухай боддог",
  "Хамгийн сайн хийж чадах зүйлсийнхээ талаар төлөвлөж, боддог",
  "Нөхцөл байдлаас ямар нэгэн зүйлийг сурч чадна гэж боддог",
  "Аль хэдийн болсон үйл явдлын үр дүнд илүү хүчирхэг хүн болж чадна гэж боддог",
  "Нөхцөл байдал мөн адил эерэг талтай гэж боддог",
  "Би юмсын эерэг талыг илүү эрэлхийлдэг",
  "Үүнээс ч илүү дор байж болох байсан гэж боддог",
  "Бусад хүмүүс илүү хэцүү зүйлсийг даван, туулсан гэж би боддог",
  "Бусад зүйлстэй харьцуулахад энэ тийм ч муу байгаагүй гэж би боддог",
  "Амьдралд үүнээс ч илүү хэцүү зүйлс байгаа гэж би өөртөө хэлдэг",
  "Миний туулсан зүйлс бусдын туулж өнгөрүүлснөөс илүү хэцүү гэж боддог",
  "Миний туулсан зүйлс ямар аймшигтай, хэцүү байсан талаар бодсон хэвээр байна",
  "Надад тохиолдсон зүйл хүнд тохиолдож болох хамгийн муу зүйл гэж боддог",
  "Нөхцөл байдал ямар аймшигтай, хэцүү байсан тухай би бодсон хэвээр байна",
  "Бусад хүмүүс буруутай гэж би боддог",
  "Аль хэдийн болсон үйл явдалд бусад хүмүүс хариуцлага хүлээх ёстой гэж боддог",
  "Бусдын гаргасан алдаатай үйлдлүүд үүнд хамаатай гэж боддог",
  "Ерөнхийдөө шалтгаан нь бусад хүмүүсээс болсон, холбоотой гэж боддог",
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