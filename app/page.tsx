import Link from "next/link";

export default function HomePage() {
  return (
    <div className="grid2">
      <section className="card">
        <h1 className="h1">Танин мэдэхүй-сэтгэл хөдлөлийн зохицуулалтын асуулга (CERQ), Сонгох хариу үйлдлийн хугацаа болон Stroop өнгөний тест</h1>

        <p className="p">
          Энэхүү вэбсайт нь 3 үе шаттай бөгөөд танин мэдэхүй-сэтгэл хөдлөлийн зохицуулалтын
          асуулга, 8 дэд хэсэг бүхий сонгох хариу үйлдлийн хугацааны дасгалууд болон Stroop
          өнгөний дасгалуудаас бүрдэнэ.
        </p>

        <div className="btnRow">
          <Link className="btn btnPrimary" href="/test">Тест эхлэх</Link>
        </div>

        <hr className="hr" />

        <p className="smallNote">
          Хариултыг <span className="kbd">←</span> болон <span className="kbd">→</span> товчоор өгөх
          (эсвэл дэлгэцийн товчлуурууд дээр дарж болно).
        </p>
      </section>

      <aside className="card">
        <h2 className="h2">Юу хэмжигдэх вэ?</h2>

        <p className="p">
          CERQ тест нь яньз бүрийн танин мэдэхүйн зохицуулалтын ашиглан байдалд сэтгэл хөдлөлөө
          хэрхэн үр дүнтэй удирдаж байгааг тодруулах зорилготой.
          Сонгох хариу үйлдлийн хугацаа болон Stroop өнгөний дасгалууд хариу үйлдлийн хугацаа,
          түүний оновчтой байдал зэргийг үнэлэх бөгөөд уг даалгаврыг ажиллахдаа аль болох хурдан
          сонгох нь чухал юм.
        </p>
      </aside>
    </div>
  );
}