document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticket-form");

  // Expresiones regulares de validación
  const campos = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^\d{10}$/,
    nacimiento: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
    tarjeta: /^\d{16}$/,
    vencimiento: /^(0[1-9]|1[0-2])\/\d{2}$/,
    cvv: /^\d{3,4}$/,
    nombreTarjeta: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/
  };

  // Función genérica para validar un campo
  function validarCampo(id, regex) {
    const input = document.getElementById(id);
    const msg = document.getElementById("msg-" + id);
    input.addEventListener("input", () => {
      if (regex.test(input.value)) {
        input.classList.add("valid");
        input.classList.remove("error");
        msg.textContent = "✓ Campo válido";
        msg.style.color = "green";
      } else {
        input.classList.add("error");
        input.classList.remove("valid");
        msg.textContent = "✗ Verifica el campo";
        msg.style.color = "red";
      }
      validarFormularioCompleto();
    });
  }

  // Aplicar validación a cada campo
  validarCampo("nombre", campos.nombre);
  validarCampo("email", campos.email);
  validarCampo("telefono", campos.telefono);
  validarCampo("nacimiento", campos.nacimiento);
  validarCampo("numero-tarjeta", campos.tarjeta);
  validarCampo("vencimiento", campos.vencimiento);
  validarCampo("cvv", campos.cvv);
  validarCampo("nombre-tarjeta", campos.nombreTarjeta);

  // Validar edad mínima (18 años)
  document.getElementById("nacimiento").addEventListener("input", () => {
    const valor = document.getElementById("nacimiento").value;
    const [d, m, y] = valor.split("/");
    const fechaNac = new Date(`${m}/${d}/${y}`);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    const msg = document.getElementById("msg-nacimiento");
    if (edad < 18) {
      msg.textContent = "✗ Debes tener al menos 18 años";
      msg.style.color = "red";
      document.getElementById("nacimiento").classList.add("error");
      document.getElementById("nacimiento").classList.remove("valid");
    }
    validarFormularioCompleto();
  });

  // Validar cantidad de entradas (1–6)
  document.getElementById("cantidad").addEventListener("input", () => {
    const val = +document.getElementById("cantidad").value;
    const msg = document.getElementById("msg-cantidad");
    if (val >= 1 && val <= 6) {
      msg.textContent = "✓ Cantidad válida";
      msg.style.color = "green";
    } else {
      msg.textContent = "✗ Mínimo 1, máximo 6 entradas";
      msg.style.color = "red";
    }
    actualizarPrecio();
    validarFormularioCompleto();
  });

  // Cargar eventos desde JSON local
  fetch("eventos.json")
    .then(res => res.json())
    .then(eventos => {
      const select = document.getElementById("evento");
      eventos.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.evento;
        opt.textContent = `${e.evento} — ${e.fecha}`;
        opt.dataset.fecha = e.fecha;
        opt.dataset.lugar = `${e.lugar}, ${e.ciudad}`;
        opt.dataset.precio = e.precio;
        select.appendChild(opt);
      });
      select.addEventListener("change", () => {
        const sel = select.selectedOptions[0];
        document.getElementById("fecha-evento").value = sel.dataset.fecha;
        document.getElementById("ubicacion-evento").value = sel.dataset.lugar;
        actualizarPrecio();
      });
    });

  // Cargar países desde API externa
  fetch("https://gist.githubusercontent.com/eduardolat/b2a252d17b17363fab0974bb0634d259/raw/")
    .then(res => res.json())
    .then(paises => {
      const select = document.getElementById("pais");
      paises.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.name;
        opt.textContent = p.name;
        select.appendChild(opt);
      });
    });

  // Detectar tipo de tarjeta y mostrar logo
  document.getElementById("numero-tarjeta").addEventListener("input", e => {
    const val = e.target.value;
    const logo = document.getElementById("logo-tarjeta");
    if (/^4/.test(val)) logo.src = "images/visa.png";
    else if (/^5[1-5]/.test(val)) logo.src = "images/mastercard.png";
    else if (/^3[47]/.test(val)) logo.src = "images/amex.png";
    else logo.src = "";
  });

  // Calcular precio total dinámico
  function actualizarPrecio() {
    const ev = document.getElementById("evento").selectedOptions[0];
    const tipo = document.getElementById("tipo-entrada").value;
    const cant = +document.getElementById("cantidad").value;
    const base = +ev?.dataset.precio || 0;
    const extra = tipo === "VIP" ? 500 : tipo === "Palco" ? 1000 : 0;
    const total = (base + extra) * (cant || 0);
    document.getElementById("precio-total").textContent = `Total: $${total} ARS`;
  }
  document.getElementById("tipo-entrada").addEventListener("change", actualizarPrecio);

  // Habilitar/deshabilitar botón de envío
  function validarFormularioCompleto() {
    const inputs = [...document.querySelectorAll("input")];
    const todosValidos = inputs.every(i => i.classList.contains("valid"));
    const cantidadValida = +document.getElementById("cantidad").value >= 1;
    const btn = form.querySelector("button");
    if (todosValidos && cantidadValida && document.getElementById("evento").value) {
      btn.disabled = false;
      document.getElementById("mensaje-formulario").textContent = "";
    } else {
      btn.disabled = true;
      document.getElementById("mensaje-formulario").textContent =
        "Completa todos los campos correctamente";
    }
  }

  // Mostrar resumen de compra
  form.addEventListener("submit", e => {
    e.preventDefault();
    const res = document.getElementById("resumen-compra");
    res.innerHTML = `
      <h3>Resumen de la compra:</h3>
      <p>Nombre: ${document.getElementById("nombre").value}</p>
      <p>Email: ${document.getElementById("email").value}</p>
      <p>Evento: ${document.getElementById("evento").value}</p>
      <p>Ubicación: ${document.getElementById("ubicacion-evento").value}</p>
      <p>Fecha: ${document.getElementById("fecha-evento").value}</p>
      <p>Cantidad: ${document.getElementById("cantidad").value}</p>
      <p>Tipo: ${document.getElementById("tipo-entrada").value}</p>
      <p>Precio total: ${document.getElementById("precio-total").textContent}</p>
    `;
  });

  // Contador regresivo (5 minutos)
  let tiempo = 300;
  const cont = document.getElementById("contador-compra");
  const intervalo = setInterval(() => {
    if (tiempo > 0) {
      const m = Math.floor(tiempo / 60);
      const s = tiempo % 60;
      cont.textContent = `⏳ Tiempo restante: ${m}:${s < 10 ? "0" : ""}${s}`;
      tiempo--;
    } else {
      clearInterval(intervalo);
      cont.textContent = "⏳ Tiempo expirado. Recarga para reiniciar.";
      form.querySelector("button").disabled = true;
    }
  }, 1000);
});