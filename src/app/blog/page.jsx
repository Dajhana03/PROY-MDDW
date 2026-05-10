import styles from "./blog.module.css";
export default function Blog() {
  return (
  <div className={styles.container}>

  {/* TITULO */}
  
  <h1 className={styles.titulo}>
    Blog ECO CANJE
  </h1>

  <p className={styles.subtexto}>
    Artículos, consejos e historias
  </p>

  {/* LAYOUT */}

  <div className={styles.layout}>

    {/* IZQUIERDA */}

    <div className={styles.leftContent}>
      
      {/* HERO */}
      
      <div className={styles.heroCard}>
      </div>

      {/* GRID POSTS */}

      <div className={styles.postsGrid}>
      </div>

    </div>

    {/* SIDEBAR */}

    <div className={styles.sidebar}>
    </div>

  </div>

</div>
  );
}