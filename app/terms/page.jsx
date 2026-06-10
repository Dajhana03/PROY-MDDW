"use client";

import Link from "next/link";
import styles from "./terms.module.css";

export default function TermsAndConditions() {
  const sections = [
    {
      id: 1,
      title: "1. Aceptación de los Términos",
      icon: "/svg/checkCircleOut.svg",
      paragraphs: [
        "Al acceder y utilizar la plataforma ECO CANJE, usted acepta quedar vinculado por estos Términos y Condiciones, así como por nuestra Política de Privacidad. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestra plataforma.",
        "Estos términos se aplican a todos los usuarios de la plataforma, incluyendo donantes, solicitantes y visitantes."
      ]
    },
    {
      id: 2,
      title: "2. Descripción del Servicio",
      icon: "/svg/email.svg",
      paragraphs: [
        "ECO CANJE es una plataforma universitaria sin fines de lucro que facilita el intercambio solidario de artículos entre miembros de la comunidad universitaria. La plataforma permite publicar donaciones, solicitar artículos y acumular puntos canjeables por beneficios.",
        "El servicio incluye: publicación de donaciones, sistema de puntos y recompensas, comunidad y foro, blog educativo sobre sostenibilidad y acceso a beneficios exclusivos.",
        "ECO CANJE actúa únicamente como intermediario entre donantes y receptores, sin responsabilidad directa sobre el estado, calidad o entrega de los artículos donados."
      ]
    },
    {
      id: 3,
      title: "3. Requisitos y Registro de Usuario",
      icon: "/svg/userGroup.svg",
      paragraphs: [
        "Para utilizar las funcionalidades completas de ECO CANJE, debe ser miembro activo de la comunidad universitaria (estudiante, docente o personal administrativo) y registrarse proporcionando información veraz y actualizada.",
        "Al registrarse, usted es responsable de mantener la confidencialidad de su cuenta y contraseña, así como de todas las actividades realizadas bajo su cuenta.",
        "ECO CANJE se reserva el derecho de suspender o eliminar cuentas que proporcionen información falsa o que incumplan estos términos.",
        "Está prohibido crear múltiples cuentas, usar cuentas de terceros o suplantar la identidad de otros usuarios."
      ]
    },
    {
      id: 4,
      title: "4. Normas para Donaciones",
      icon: "/svg/refresh.svg",
      paragraphs: [
        "Los usuarios que publiquen donaciones declaran ser propietarios legítimos de los artículos Copyrigth ofrecidos y que estos no están sujetos a disputas legales, deudas o restricciones de propiedad.",
        "Están prohibidas las publicaciones de: artículos ilegales, peligrosos o que infrinjan derechos de autor; alimentos perecederos o con fecha de vencimiento próxima; artículos en condiciones insalubres; objetos de valor comercial excesivo que desvirtúen el espíritu solidario.",
        "ECO CANJE se reserva el derecho de eliminar cualquier publicación que no cumpla con las normas de la comunidad, sin previo aviso.",
        "Los donantes se comprometen a entregar los artículos en las condiciones descritas en la publicación, coordinando la entrega de manera directa y respetuosa con el receptor."
      ]
    },
    {
      id: 5,
      title: "5. Sistema de Puntos y Beneficios",
      icon: "/svg/security.svg",
      paragraphs: [
        "El sistema de puntos de ECO CANJE es un programa de reconocimiento sin valor monetario. Los puntos se otorgan por actividades dentro de la plataforma y pueden canjearse exclusivamente por los beneficios disponibles en el catálogo.",
        "ECO CANJE se reserva el derecho de modificar, suspender o cancelar el sistema de puntos en cualquier momento, con o sin previo aviso.",
        "Los puntos no son transferibles entre usuarios, no tienen valor monetario, no son reembolsables y caducan si la cuenta permanece inactiva por más de 12 meses.",
        "El uso fraudulento del sistema de puntos (mediante actividades ficticias, bots u otros medios) resultará en la cancelación inmediata de la cuenta y la pérdida de todos los puntos acumulados."
      ]
    },
    {
      id: 6,
      title: "6. Privacidad y Protección de Datos",
      icon: "/svg/lock.svg",
      paragraphs: [
        "ECO CANJE recopila y procesa datos personales de acuerdo con la legislación vigente en materia de protección de datos. Al registrarse, usted consiente el tratamiento de sus datos con los fines descritos en nuestra Política de Privacidad.",
        "Sus datos personales serán utilizados exclusivamente para gestionar su cuenta, facilitar transacciones de donación y mejorar la experiencia en la plataforma. No compartiremos su información con terceros con fines comerciales.",
        "Usted tiene derecho a acceder, rectificar y suprimir sus datos personales en cualquier momento a través de la configuración de su cuenta o contactando con nuestro equipo de soporte.",
        "ECO CANJE intenta implementar medidas técnicas y organizativas razonables para proteger sus datos, aunque no puede garantizar la seguridad absoluta de la información transmitida por internet."
      ]
    },
    {
      id: 7,
      title: "7. Conducta del Usuario",
      icon: "/svg/warning.svg",
      paragraphs: [
        "Los usuarios se comprometen a utilizar la plataforma de manera respetuosa y acorde con los valores de sostenibilidad, solidaridad y comunidad universitaria que inspiran ECO CANJE.",
        "Está estrictamente prohibido: publicar contenido ofensivo, discriminatorio o difamatorio; acosar o intimidar a otros usuarios; usar la plataforma con fines comerciales o de lucro personal; realizar actividades que puedan dañar la infraestructura técnica de la plataforma.",
        "ECO CANJE podrá suspender o eliminar cuentas que incumplan estas normas de conducta, sin que ello genere derecho a compensación alguna."
      ]
    },
    {
      id: 8,
      title: "8. Limitación de Responsabilidad",
      icon: "/svg/warning.svg",
      paragraphs: [
        "ECO CANJE no asume responsabilidad por los artículos donados, su estado, calidad, adecuación o cualquier daño derivado de su uso. Las transacciones se realizan directamente entre usuarios bajo su propia responsabilidad.",
        "La plataforma se proporciona 'tal como está', sin garantías de disponibilidad ininterrumpida, libre de errores o adaptada a fines específicos. ECO CANJE no será responsable por pérdidas o daños derivados del uso o imposibilidad de uso de la plataforma.",
        "En ningún caso ECO CANJE será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos derivados del uso de la plataforma."
      ]
    },
    {
      id: 9,
      title: "9. Modificaciones de los Términos",
      icon: "/svg/refresh.svg",
      paragraphs: [
        "ECO CANJE se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la plataforma.",
        "El uso continuado de la plataforma tras la publicación de modificaciones implica la aceptación de los nuevos términos. Le recomendamos revisar periódicamente esta página para mantenerse informado.",
        "Para cambios sustanciales, ECO CANJE notificará a los usuarios registrados mediante correo electrónico o notificación en la plataforma con al menos 7 días de antelación."
      ]
    },
    {
      id: 10,
      title: "10. Contacto",
      icon: "/svg/email.svg",
      paragraphs: [
        "Si tiene preguntas, dudas o sugerencias sobre estos Términos y Condiciones, puede contactarnos a través del formulario de contacto disponible en nuestra plataforma o enviando un correo electrónico a legal@ecocanje.edu.",
        "Para ejercer sus derechos de protección de datos o reportar un incumplimiento de estos términos, contáctenos en privacidad@ecocanje.edu."
      ]
    }
  ];

  return (
    /* 1. pageContainer: Pinta el degradado de fondo en toda la pantalla de lado a lado */
    <div className={styles.pageContainer}>
      
      {/* 2. contentWrapper: Mantiene el bloque de tarjetas alineado y centrado en el medio */}
      <div className={styles.contentWrapper}>
        
        {/* Icono de escudo superior */}
        <div className={styles.topShieldArea}>
          <div className={styles.shieldCircle}>
            <img src="/svg/security.svg" alt="" className={styles.mainShieldIcon} />
          </div>
        </div>

        <h1 className={styles.mainTitle}>Términos y Condiciones</h1>
        <p className={styles.mainSubtitle}>
          Por favor, lee detenidamente estos términos antes de usar ECO CANJE.
        </p>

        {/* Etiqueta de última actualización */}
        <div className={styles.updateBadge}>
          <span>Última actualización: 9 de junio de 2026</span>
        </div>

        {/* Tarjeta de Bienvenida */}
        <div className={styles.welcomeCard}>
          <p>
            Bienvenido a <strong>ECO CANJE</strong>, la plataforma universitaria de donaciones solidarias comprometida con la sostenibilidad y el reciclaje. Al acceder a nuestros servicios, aceptas los siguientes términos y condiciones. Te invitamos a leerlos con atención para conocer tus derechos y responsabilidades como miembro de nuestra comunidad.
          </p>
        </div>

        {/* Índice de Contenidos */}
        <div className={styles.indexCard}>
          <h2 className={styles.indexTitle}>Índice de Contenidos</h2>
          <div className={styles.indexGrid}>
            {sections.map((sec) => (
              <a href={`#section-${sec.id}`} key={sec.id} className={styles.indexLink}>
                <img src={sec.icon} alt="" className={styles.indexIcon} />
                <span>{sec.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Mapeo de las 10 Secciones */}
        <div className={styles.sectionsContainer}>
          {sections.map((sec) => (
            <div key={sec.id} id={`section-${sec.id}`} className={styles.sectionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>
                  <img src={sec.icon} alt="" className={styles.cardIconImg} />
                </div>
                <h2 className={styles.cardTitle}>{sec.title}</h2>
              </div>
              <div className={styles.cardBody}>
                {sec.paragraphs.map((para, idx) => (
                  <p key={idx} className={styles.cardParagraph}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Banner de Soporte Inferior */}
        <div className={styles.ctaBanner}>
          <div className={styles.ctaCheckIconWrap}>
            <img src="/svg/checkCircle.svg" alt="" className={styles.ctaCheckIcon} />
          </div>
          <h3 className={styles.ctaTitle}>¿Tienes alguna pregunta?</h3>
          <p className={styles.ctaSubtitle}>
            Si no encuentras respuesta a tus dudas sobre estos términos, nuestro equipo de soporte está disponible para ayudarte.
          </p>
          
          <Link href="/contact" className={styles.ctaButton}>
            <img src="/svg/email.svg" alt="" className={styles.btnIcon} />
            Contactar Soporte
          </Link>
        </div>

      </div>
    </div>
  );
}