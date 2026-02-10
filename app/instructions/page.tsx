export default function InstructionsPage() {
  return (
    <div className="card">
      <h1 className="h1">Заавар</h1>
      <p className="p">
        CRT нь 8 хэсэгтэй. Хэсэг тус бүр нийт 40 өдөөлттэй (20/20 хоёр ангилал).
        Өдөөлт бүр дээр аль болох хурдан бөгөөд зөв хариулна.
      </p>
      <div className="toast">
        Хариултын товч: <span className="kbd">←</span> = Зүүн сонголт, <span className="kbd">→</span> = Баруун сонголт
      </div>

      <hr className="hr" />
      <h2 className="h2">CRT хэсгүүд</h2>
      <ul className="p">
        <li>CRT.1: Үг → Ургамал vs Амьтан</li>
        <li>CRT.2: Үг → Нэг үетэй vs Хоёр үетэй</li>
        <li>CRT.3: 3 оронтой тоо → Тэгш vs Сондгой</li>
        <li>CRT.4: 3 оронтой тоо → 500-с их vs 500-с бага</li>
        <li>CRT.5: Сум → Дээш чиглэсэн vs Доош чиглэсэн (өнцгөөр)</li>
        <li>CRT.6: Сум → Дээд vs Доод (дэлгэцийн аль хагас)</li>
        <li>CRT.7: 3x3 grid → Холбогдсон vs Холбогдоогүй</li>
        <li>CRT.8: 3x3 grid → Босоо тэнхлэг vs Хэвтээ тэнхлэг</li>
      </ul>

      <hr className="hr" />
      <h2 className="h2">Stroop тест</h2>
      <p className="p">
        Үгийн өнгийг нэрлэнэ (үгний утгыг бус). Нийцтэй (congruent), нийцгүй (incongruent), саадгүй (neutral) өдөөлтүүд холилдож гарна.
      </p>
      <div className="toast">
        Stroop дээр мөн <span className="kbd">←</span>/<span className="kbd">→</span> болон дэлгэцийн 4 өнгийн товч ашиглана.
      </div>
    </div>
  );
}
