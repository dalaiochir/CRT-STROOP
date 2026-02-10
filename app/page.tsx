import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid2">
      <section className="card">
        <h1 className="h1">CRT дасгал + Stroop тест</h1>
        <p className="p">
          Энэ вэбсайт нь 2 үе шаттай: эхлээд CRT.1–CRT.8, дараа нь хэсэг хугацааны завсарлага аваад Stroop тест эхэлнэ.
        </p>
        <div className="btnRow">
          <Link className="btn btnPrimary" href="/test">Тест эхлэх</Link>
          <Link className="btn" href="/instructions">Заавар унших</Link>
          <Link className="btn" href="/history">Түүх харах</Link>
        </div>
        <hr className="hr" />
        <p className="smallNote">
          Хариултыг <span className="kbd">←</span> болон <span className="kbd">→</span> товчоор өгөх (эсвэл дэлгэцийн товчлуурууд дээр дарж болно).
        </p>
      </section>

      <aside className="card">
        <h2 className="h2">Юу хэмжигдэх вэ?</h2>
        <p className="p">
          Өдөөлт гарснаас хойш хариу өгөх хүртэлх хугацаа (RT) ба зөв/буруу хариултын үзүүлэлт хадгалагдана.
        </p>
        <div className="toast">
          Түүх (History) хуудас нь таны төхөөрөмжийн <span className="mono">localStorage</span>-д хадгалсан үр дүнг харуулна.
        </div>
      </aside>
    </div>
  );
}
