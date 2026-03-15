export type TemperamentCode =
  | "P1" | "P2" | "P3" | "P4" | "P5" | "P6"
  | "M1" | "M2" | "M3" | "M4" | "M5" | "M6"
  | "S1" | "S2" | "S3" | "S4" | "S5" | "S6"
  | "C1" | "C2" | "C3" | "C4" | "C5" | "C6";

export type TemperamentQuestion = {
  id: number;
  text: string;
  code: TemperamentCode;
};

export const TEMPERAMENT_QUESTIONS: TemperamentQuestion[] = [
  { id: 1, text: "Би бараг л уурладаггүй", code: "P1" },
  { id: 2, text: "Хүмүүс намайг шүүмжлэхэд төдийлөн тоодоггүй", code: "M1" },
  { id: 3, text: "Би бараг л гунигладаггүй", code: "M2" },
  { id: 4, text: "Би олны дунд чөлөөтэй байж чаддаг", code: "S1" },
  { id: 5, text: "Би өөртөө сэтгэл хангалуун байдаг", code: "M3" },
  { id: 6, text: "Хүмүүс надтай дайсагнаж байгаа мэт санагддаг", code: "M4" },
  { id: 7, text: "Би амархан уурладаг", code: "C1" },
  { id: 8, text: "Би маш өөдрөг үзэлтэй", code: "S2" },
  { id: 9, text: "Би бусдаас илүү байхыг хичээдэг", code: "C2" },
  { id: 10, text: "Би тайван байдаг", code: "P2" },
  { id: 11, text: "Би хүмүүсийг хүлээн зөвшөөрдөг", code: "S3" },
  { id: 12, text: "Би бусадтай амархан найзалдаг", code: "S4" },
  { id: 13, text: "Би найзтайгаа зөрчилдөж, хэрэлддэг", code: "P3" },
  { id: 14, text: "Би олон зүйлсийг хүлээн зөвшөөрдөг", code: "S5" },
  { id: 15, text: "Би бусдыг удирдахыг маш их хүсдэг", code: "C3" },
  { id: 16, text: "Түгшүүртэй мэдрэмж төрөх үед биеэ барьж чаддаггүй", code: "M5" },
  { id: 17, text: "Намайг уурлуулах тийм ч амархан биш", code: "P4" },
  { id: 18, text: "Амар амгалан байх нь хамгийн сайхан амьдрал", code: "P5" },
  { id: 19, text: "Ганцаараа байх үедээ бүжиглэдэг", code: "S6" },
  { id: 20, text: "Бусдыг баярлуулж, таалагдахыг хичээдэг", code: "C4" },
  { id: 21, text: "Ямар ч найдваргүй мэт санагддаг", code: "M6" },
  { id: 22, text: "Би бусдыг захирах дуртай", code: "C5" },
  { id: 23, text: "Би сэтгэл хөдлөлдөө захирагддаг", code: "P6" },
  { id: 24, text: "Хүмүүс надаас айхад би дуртай", code: "C6" },
];

export function shuffleQuestions<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}