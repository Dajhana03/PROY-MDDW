import styles from "./blog.module.css";

export default function Blog() {
  return (
    <div className={styles.container}>
      <h1 className={styles.titulo}>Blog ECO CANJE</h1>

      <p className={styles.subtexto}>
        Artículos, consejos e historias sobre sostenibilidad y solidaridad
        universitaria
      </p>

      <div className={styles.layout}>
        {/* LEFT */}

        <div className={styles.leftContent}>
          {/* HERO */}

          <div className={styles.heroCard}>
            <img
              src="/images/bucket.webp"
              alt="bucket"
              className={styles.heroImage}
            />

            <div className={styles.overlay}></div>

            <div className={styles.heroContent}>
              <div className={styles.tags}>
                <span>Sostenibilidad</span>
                <span>Universidad</span>
                <span>Innovación</span>
              </div>

              <h2>El Futuro de la Sostenibilidad Universitaria</h2>

              <p>
                Cómo las nuevas generaciones están revolucionando el reciclaje y
                las donaciones en los campus...
              </p>

              <div className={styles.heroMeta}>
                <span>Equipo ECO CANJE</span>

                <span>5 Mayo 2026</span>
              </div>
            </div>
          </div>

          {/* POSTS */}

          <div className={styles.postsGrid}>
            <div className={styles.card}>
              <img src="/images/recyclingTools.webp" alt="recycling tools" />

              <div className={styles.cardContent}>
                <div className={styles.smallTags}>
                  <span>Tips</span>
                  <span>Reciclaje</span>
                </div>

                <h3>10 Consejos para Maximizar tu Impacto Ecológico</h3>

                <p>
                  Pequeñas acciones que generan grandes cambios en tu día a día
                  universitario...
                </p>

                <div className={styles.cardMeta}>
                  <span>Ana Rodríguez</span>

                  <span>3 Mayo 2026</span>
                </div>

                <div className={styles.bottomRow}>
                  <span>23 comentarios</span>

                  <a href="#">Leer más →</a>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <img src="/images/donations.webp" alt="donations" />

              <div className={styles.cardContent}>
                <div className={styles.smallTags}>
                  <span>Donaciones</span>
                  <span>Comunidad</span>
                </div>

                <h3>Cómo Organizar una Campaña de Donación Exitosa</h3>

                <p>
                  Guía paso a paso para crear eventos que realmente marquen la
                  diferencia...
                </p>

                <div className={styles.cardMeta}>
                  <span>Carlos Méndez</span>

                  <span>1 Mayo 2026</span>
                </div>

                <div className={styles.bottomRow}>
                  <span>18 comentarios</span>

                  <a href="#">Leer más →</a>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <img src="/images/socialWork.webp" alt="social Work" />

              <div className={styles.cardContent}>
                <div className={styles.smallTags}>
                  <span>Impacto</span>
                  <span>Datos</span>
                </div>

                <h3>El Impacto Real: Números que Inspiran</h3>

                <p>
                  Estadísticas sobre cómo ECO CANJE ha transformado la comunidad
                  universitaria...
                </p>

                <div className={styles.cardMeta}>
                  <span>María González</span>

                  <span>28 Abril 2026</span>
                </div>

                <div className={styles.bottomRow}>
                  <span>31 comentarios</span>

                  <a href="#">Leer más →</a>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <img src="/images/trash.webp" alt="trash" />

              <div className={styles.cardContent}>
                <div className={styles.smallTags}>
                  <span>Economía Circular</span>
                </div>

                <h3>Economía Circular en el Campus</h3>

                <p>
                  Cómo dar nueva vida a objetos y reducir residuos en tu
                  universidad...
                </p>

                <div className={styles.cardMeta}>
                  <span>Juan Pérez</span>

                  <span>25 Abril 2026</span>
                </div>

                <div className={styles.bottomRow}>
                  <span>15 comentarios</span>

                  <a href="#">Leer más →</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}

        <div className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3>Buscar Artículos</h3>

            <input type="text" placeholder="Buscar..." />
          </div>

          <div className={styles.sideCard}>
            <h3>Categorías</h3>

            <div className={styles.category}>
              <span>Sostenibilidad</span>
              <span>(45)</span>
            </div>

            <div className={styles.category}>
              <span>Donaciones</span>

              <span>(32)</span>
            </div>

            <div className={styles.category}>
              <span>Reciclaje</span>

              <span>(28)</span>
            </div>

            <div className={styles.category}>
              <span>Comunidad</span>

              <span>(24)</span>
            </div>

            <div className={styles.category}>
              <span>Tips</span>

              <span>(19)</span>
            </div>
          </div>

          <div className={styles.newsletter}>
            <h3>Newsletter Semanal</h3>

            <p>Recibe los mejores artículos directamente en tu correo</p>

            <input type="email" placeholder="tu@email.com" />

            <button>Suscribirme</button>
          </div>

          <div className={styles.sideCard}>
            <h3>Artículos Populares</h3>

            <div className={styles.popularItem}>
              <div className={styles.thumb}></div>

              <div>
                <h4>Artículo Popular 1</h4>

                <span>7 Mayo 2026</span>
              </div>
            </div>

            <div className={styles.popularItem}>
              <div className={styles.thumb}></div>

              <div>
                <h4>Artículo Popular 2</h4>

                <span>7 Mayo 2026</span>
              </div>
            </div>

            <div className={styles.popularItem}>
              <div className={styles.thumb}></div>

              <div>
                <h4>Artículo Popular 3</h4>

                <span>7 Mayo 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
