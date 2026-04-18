/* ═══════════════════════════════════════════════════════════════════════════════
   CSS ESPECÍFICO PARA GLOW VIOLETA + TRANSPARENCIA + LOGO
   
   IMPORTANTE: Todo este CSS ya está aplicado en src/styles/App.css
   Este archivo es solo para REFERENCIA y DEBUGGING
   ═══════════════════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   PARTE 1: CONTENEDOR DEL FORMULARIO CON GLOW
   ───────────────────────────────────────────────────────────────────────────── */

.form-container {
  /* TRANSPARENCIA MEJORADA: 50% para ver el mapa de fondo */
  background: rgba(17, 17, 17, 0.5);
  
  /* BORDE VIOLETA 2px: Color característico de La Libertad Avanza */
  border: 2px solid #7B2CBF;
  
  /* Border radius minimalista */
  border-radius: 6px;
  
  /* Padding interno */
  padding: 1.5rem;
  
  /* Efecto cristal: blur del fondo */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  
  /* ✨ EFECTO GLOW VIOLETA - 3 CAPAS ✨
     Capa 1: Glow cercano (20px) - Más opaco
     Capa 2: Glow expandido (40px) - Menos opaco
     Capa 3: Glow interno (inset) - Sutil, crea profundidad
  */
  box-shadow: 
    0 0 20px rgba(123, 44, 191, 0.4),      /* 0 0 20px con 40% opacidad */
    0 0 40px rgba(123, 44, 191, 0.2),      /* 0 0 40px con 20% opacidad */
    inset 0 0 20px rgba(123, 44, 191, 0.05); /* Interno con 5% opacidad */
  
  /* Transición suave para el efecto hover */
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
  
  position: relative;
}

/* ESTADO HOVER: Intensificar el glow */
.form-container:hover {
  /* El glow se vuelve más intenso */
  box-shadow: 
    0 0 30px rgba(123, 44, 191, 0.5),      /* 30px con 50% opacidad */
    0 0 60px rgba(123, 44, 191, 0.3),      /* 60px con 30% opacidad */
    inset 0 0 20px rgba(123, 44, 191, 0.08); /* Interior con 8% opacidad */
  
  /* Border también cambia a un violeta más claro */
  border-color: #9D4EDD;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTE 2: LOGO DE LA LIBERTAD AVANZA
   ───────────────────────────────────────────────────────────────────────────── */

/* Contenedor del logo - CENTRADO */
.form-logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  
  /* Separador visual sutil en violeta */
  border-bottom: 1px solid rgba(123, 44, 191, 0.2);
}

/* Imagen del logo */
.form-logo {
  max-width: 80px;              /* Desktop size */
  width: 100%;
  height: auto;
  object-fit: contain;
  
  /* Drop-shadow violeta para destacar sobre fondo transparente */
  filter: drop-shadow(0 0 8px rgba(123, 44, 191, 0.3));
  
  /* Transición suave para efectos */
  transition: filter 0.3s ease, transform 0.3s ease;
}

/* Efecto hover en el logo */
.form-logo:hover {
  filter: drop-shadow(0 0 12px rgba(123, 44, 191, 0.5));
  transform: scale(1.05);
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTE 3: MAIN-CONTENT PARA SCROLL EN MÓVILES
   ───────────────────────────────────────────────────────────────────────────── */

.main-content {
  flex: 1;
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  
  display: flex;
  align-items: center;        /* Vertical: CENTER en desktop */
  justify-content: center;    /* Horizontal: center */
  
  position: relative;
  z-index: 20;
  
  /* ✨ PERMITIR SCROLL EN MÓVILES ✨ */
  min-height: auto;
  overflow-y: auto;              /* Permite scrollbar vertical */
  -webkit-overflow-scrolling: touch; /* Smooth scroll en iOS */
}

/* ─────────────────────────────────────────────────────────────────────────────
   PARTE 4: MEDIA QUERIES PARA RESPONSIVE
   ───────────────────────────────────────────────────────────────────────────── */

/* MÓVILES PEQUEÑOS: < 480px (iPhone SE, Galaxy S21, etc) */
@media (max-width: 480px) {
  .form-logo {
    max-width: 50px;
  }

  .btn-enviar {
    width: 100%;
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .btn-geo {
    width: 100%;
  }
}

/* TABLETS Y MÓVILES MEDIANOS: 480px - 640px */
@media (max-width: 640px) {
  .main-content {
    /* En móvil: NO centrar verticalmente, permitir scroll */
    align-items: flex-start;
    padding-bottom: 1.5rem; /* Espacio extra abajo para scroll */
    
    /* Permitir scroll */
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .form-container {
    width: 100%;
    padding: 1rem;
    margin-bottom: 1rem;
    
    /* Glow ligeramente reducido para pantallas pequeñas */
    box-shadow: 
      0 0 15px rgba(123, 44, 191, 0.3),
      0 0 30px rgba(123, 44, 191, 0.15),
      inset 0 0 15px rgba(123, 44, 191, 0.03);
  }

  .form-logo {
    max-width: 60px;
  }
}

/* TABLETS: 641px - 1024px */
@media (min-width: 641px) and (max-width: 1024px) {
  .form-container {
    width: 90%;
    max-width: 600px;
    margin: 0 auto;
  }

  .form-logo {
    max-width: 70px;
  }
}

/* DESKTOP: > 1025px */
@media (min-width: 1025px) {
  .main-content {
    /* Desktop: centrar verticalmente */
    align-items: center;
    justify-content: center;
  }

  .form-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .form-logo {
    max-width: 80px;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════════
   EXPLICACIÓN DE VALORES RGBA Y BOX-SHADOW
   ═══════════════════════════════════════════════════════════════════════════════

   📌 COLOR VIOLETA BASE: #7B2CBF
      RGB: 123, 44, 191
      En notación rgba: rgba(123, 44, 191, opacity)

   📌 OPACIDADES EN EL GLOW:
      - 0.4 (40%): Glow cercano, más visible
      - 0.2 (20%): Glow expandido, difuso
      - 0.05 (5%): Glow interno, apenas visible
      - 0.08 (8%): Glow interno hover, un poco más visible

   📌 SINTAXIS DE BOX-SHADOW:
      box-shadow: offsetX offsetY blurRadius spreadRadius color;
      
      Ejemplo: 0 0 20px rgba(123, 44, 191, 0.4)
      - offsetX: 0 (sin desplazamiento horizontal)
      - offsetY: 0 (sin desplazamiento vertical)
      - blurRadius: 20px (cuánto se extiende/difumina)
      - color: rgba(123, 44, 191, 0.4) (color violeta con 40% opacidad)
      
      Resultado: Un glow difuso centrado en el elemento

   📌 INSET vs OUTSET:
      - Omitido (default): Sombra externa (outer glow)
      - inset: Sombra interna (inner glow)

   📌 POR QUÉ 3 CAPAS?
      1. Primera capa (20px, 0.4): Define el borde glow principal
      2. Segunda capa (40px, 0.2): Expande y suaviza el glow
      3. Tercera capa (inset): Agrega profundidad hacia adentro

   ═══════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════
   DEBUGGING: ¿POR QUÉ NO SE VE EL GLOW?
   ═══════════════════════════════════════════════════════════════════════════════

   ❌ PROBLEMA: No veo el glow violeta
   
   ✓ SOLUCIÓN 1: Verifica que el background sea transparente
      - Current: rgba(17, 17, 17, 0.5) ← CORRECTO
      - Si es rgba(17, 17, 17, 0.95) ← MUY OPACO, el glow se ve menos
   
   ✓ SOLUCIÓN 2: Aumenta los valores de box-shadow
      - Aumenta de 0.4 a 0.6 en el primer valor rgba
      - Aumenta de 20px a 30px en el primer blurRadius
      
   ✓ SOLUCIÓN 3: Verifica que no haya overflow: hidden en padres
      - El overflow: hidden puede recortar el glow
   
   ✓ SOLUCIÓN 4: Verifica que el browser sea moderno
      - box-shadow se soporta en: IE9+, Chrome, Firefox, Safari, Edge
      - En navegadores muy antiguos no funcionaría

   ═══════════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════════
   PERSONALIZACIÓN: CÓMO AJUSTAR EL GLOW
   ═══════════════════════════════════════════════════════════════════════════════

   🎨 SI QUIERES MÁS GLOW (más intenso):
      box-shadow: 
        0 0 30px rgba(123, 44, 191, 0.6),    ← Aumenta 30 y 0.6
        0 0 50px rgba(123, 44, 191, 0.4),    ← Aumenta 50 y 0.4
        inset 0 0 20px rgba(123, 44, 191, 0.1); ← Aumenta 0.1

   🎨 SI QUIERES MENOS GLOW (más sutil):
      box-shadow: 
        0 0 10px rgba(123, 44, 191, 0.2),    ← Reduce a 10 y 0.2
        0 0 20px rgba(123, 44, 191, 0.1),    ← Reduce a 20 y 0.1
        inset 0 0 10px rgba(123, 44, 191, 0.02); ← Reduce a 10 y 0.02

   🎨 SI QUIERES OTRO COLOR (ej. rosa):
      Reemplaza rgba(123, 44, 191, ...) con rgba(255, 105, 180, ...)
      O busca el color en formato RGB y reemplaza los números

   🎨 PARA ANIMAR EL GLOW (efecto pulsante):
      @keyframes glow-pulse {
        0% {
          box-shadow: 
            0 0 20px rgba(123, 44, 191, 0.4),
            0 0 40px rgba(123, 44, 191, 0.2),
            inset 0 0 20px rgba(123, 44, 191, 0.05);
        }
        50% {
          box-shadow: 
            0 0 30px rgba(123, 44, 191, 0.6),
            0 0 60px rgba(123, 44, 191, 0.4),
            inset 0 0 20px rgba(123, 44, 191, 0.1);
        }
        100% {
          box-shadow: 
            0 0 20px rgba(123, 44, 191, 0.4),
            0 0 40px rgba(123, 44, 191, 0.2),
            inset 0 0 20px rgba(123, 44, 191, 0.05);
        }
      }
      
      .form-container {
        animation: glow-pulse 2s ease-in-out infinite;
      }

   ═══════════════════════════════════════════════════════════════════════════════ */
