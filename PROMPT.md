# Prompt inicial para Claude en VS Code

Copia y pega esto en Claude (Opus) dentro de VS Code con la carpeta gitbento abierta.

---

## PROMPT — Pégalo tal cual:

```
Lee el archivo CLAUDE.md completo antes de hacer cualquier cosa.

Vamos a construir gitbento: un generador de tarjetas bento aesthetic para perfiles de GitHub. Es una single-page app en HTML + CSS + JS puro, sin frameworks, sin build tools, sin backend.

Quiero que hagas lo siguiente en orden:

1. PLAN: Escribe un plan detallado paso a paso de todo lo que vas a crear antes de escribir código. Lista cada archivo, cada función, cada endpoint de la API que vas a usar.

2. GENERA TODOS LOS ARCHIVOS de una vez siguiendo exactamente la estructura del CLAUDE.md:
   - index.html (completo, con meta tags SEO, og:image, favicon emoji ✨)
   - style.css (completo, con el tema Aurora por defecto, glassmorphism, animación aurora)
   - app.js (completo, fetch a GitHub API, render del bento, descarga PNG con html2canvas)
   - themes/aurora.css
   - themes/midnight.css  
   - themes/sunset.css
   - README.md (con badges, instrucciones claras, sección "Add to your profile")

3. DETALLES DE DISEÑO que debes cumplir sí o sí:
   - Fondo de página: #0a0a0f (casi negro)
   - La tarjeta bento tiene backdrop-filter: blur(12px) y border: 1px solid rgba(255,255,255,0.08)
   - El gradiente aurora está animado con @keyframes rotando detrás de la tarjeta
   - Font: Inter de Google Fonts
   - Bento grid de 3 columnas en desktop, 1 columna en móvil
   - Celdas del bento: avatar grande + nombre, stats de stars, stats de forks, repos count, languages con barras de progreso, "coding since XXXX"
   - Botón "Download PNG" usa html2canvas para exportar solo la tarjeta en 2x resolution
   - Botón "Copy for README" copia el embed en markdown
   - Loading skeleton animado mientras carga
   - Error state si el usuario no existe
   - Si hay ?user=username en la URL, genera la tarjeta automáticamente

4. CALIDAD DEL CÓDIGO:
   - CSS custom properties para TODOS los colores
   - async/await con try/catch en todos los fetches
   - Handle del rate limit de GitHub (mostrar mensaje amigable)
   - Sin comentarios obvios, solo los necesarios
   - Código limpio y legible

5. AL TERMINAR: dime exactamente cómo subir esto a GitHub Pages en 5 pasos.

No me preguntes nada, ejecuta todo de una. Si tienes dudas sobre algo, toma la decisión más aesthetic y funcional y sigue adelante.
```

---

## Después del primer prompt, si algo falta:

**Para pedir correcciones de diseño:**
```
El diseño necesita estos cambios: [describe qué no te gusta visualmente]
No toques la lógica, solo el CSS.
```

**Para pedir una nueva feature:**
```
Añade [feature] al proyecto. Sigue las convenciones del código existente.
No rompas nada de lo que ya funciona.
```

**Para depurar un error:**
```
Tengo este error en la consola del navegador: [pega el error]
El archivo donde ocurre es [archivo]. Arréglalo sin cambiar más cosas de las necesarias.
```

---

## Cómo abrir el proyecto correctamente en VS Code

1. Abre VS Code
2. Archivo → Abrir Carpeta → selecciona `Descargas/gitbento`
3. Asegúrate de tener Claude Code (Opus) activo
4. Abre el chat de Claude y pega el prompt de arriba
5. Espera a que genere todos los archivos
6. Para ver el resultado: clic derecho en `index.html` → "Open with Live Server" (instala la extensión Live Server si no la tienes)

---

## Checklist antes de subir a GitHub

- [ ] La tarjeta se genera con tu propio username de GitHub
- [ ] El botón Download PNG descarga la imagen correctamente
- [ ] El botón Copy for README copia el texto
- [ ] Los 3 temas (Aurora, Midnight, Sunset) funcionan
- [ ] La página se ve bien en móvil (Chrome DevTools → responsive mode)
- [ ] No hay errores en la consola del navegador
- [ ] El README tiene una captura de pantalla real de la tarjeta

---

## Subir a GitHub Pages (5 pasos)

1. Crea repo en github.com/new con nombre `gitbento` (público, sin README)
2. En la terminal de VS Code:
   ```bash
   git init
   git add .
   git commit -m "feat: initial launch of gitbento"
   git remote add origin https://github.com/TU-USERNAME/gitbento.git
   git push -u origin main
   ```
3. Ve a tu repo → Settings → Pages
4. Source: Deploy from branch → main → / (root) → Save
5. En 2 minutos tu app estará en `https://TU-USERNAME.github.io/gitbento`
