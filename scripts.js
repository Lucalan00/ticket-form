document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticket-form");
  const campos = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^\d{10}$/,
    nacimiento: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[012])\/\d{4}$/,
    tarjeta: /^\d{16}$/,
    vencimiento: /^(0[1-9]|1[0-2])\/\d{2}$/,
    cvv: /^\d{3,4}$/,
    nombreTarjeta: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/
  };

  const validarCampo = (id, regex) => {
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
  };

  Object.entries(campos).forEach(([id, regex]) => validarCampo(id, regex));

  // Validación edad mínima
  document.getElementById("nacimiento").addEventListener("input", () => {
    const valor = document.getElementById("nacimiento").value;
    const [dia, mes, año] = valor.split("/");
    const fechaNacimiento = new Date(`${mes}/${dia}/${año}`);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    if (edad < 18) {
      const msg = document.getElementById("msg-nacimiento");
      msg.textContent = "✗ Debes tener al menos 18 años";
      msg.style.color = "red";
      document.getElementById("nacimiento").classList.remove("valid");
      document.getElementById("nacimiento").classList.add("error");
    }
  });

  // Validar cantidad
  document.getElementById("cantidad").addEventListener("input", () => {
    const val = parseInt(document.getElementById("cantidad").value);
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

  // Cargar eventos desde JSON
  fetch("eventos.json")
    .then(res => res.json())
    .then(eventos => {
      const select = document.getElementById("evento");
      eventos.forEach(e => {
        const opt = document.createElement("option");
        opt.value = e.evento;
        opt.textContent = `${e.evento} - ${e.fecha}`;
        opt.dataset.fecha = e.fecha;
        opt.dataset.lugar = `${e.lugar}, ${e.ciudad}`;
        opt.dataset.precio = e.precio;
        select.appendChild(opt);
      });

      select.addEventListener("change", e => {
        const selected = e.target.selectedOptions[0];
        document.getElementById("fecha-evento").value = selected.dataset.fecha;
        document.getElementById("ubicacion-evento").value = selected.dataset.lugar;
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

  // Detectar tarjeta y mostrar logo
  document.getElementById("numero-tarjeta").addEventListener("input", e => {
    const val = e.target.value;
    const logo = document.getElementById("logo-tarjeta");

    if (/^4/.test(val)) logo.src = "images/visa.png";
    else if (/^5[1-5]/.test(val)) logo.src = "images/mastercard.png";
    else if (/^3[47]/.test(val)) logo.src = "images/amex.png";
    else logo.src = "";
  });

  // Actualizar precio
  function actualizarPrecio() {
    const evento = document.getElementById("evento").selectedOptions[0];
    const tipo = document.getElementById("tipo-entrada").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const base = parseInt(evento?.dataset.precio || 0);
    let extra = tipo === "VIP" ? 500 : tipo === "Palco" ? 1000 : 0;
    const total = (base + extra) * (cantidad || 0);
    document.getElementById("precio-total").textContent = `Total: $${total} ARS`;
  }

  document.getElementById("tipo-entrada").addEventListener("change", actualizarPrecio);

  // Validación total
  function validarFormularioCompleto() {
    const camposValidos = [...document.querySelectorAll("input")].every(input => input.classList.contains("valid"));
    const cantidadValida = parseInt(document.getElementById("cantidad").value) >= 1;
    const submitBtn = form.querySelector("button");

    if (camposValidos && cantidadValida) {
      submitBtn.disabled = false;
      document.getElementById("mensaje-formulario").textContent = "";
    } else {
      submitBtn.disabled = true;
      document.getElementById("mensaje-formulario").textContent = "Completa todos los campos correctamente";
      document.getElementById("mensaje-formulario").style.color = "orange";
    }
  }

  // Resumen de compra
  form.addEventListener("submit", e => {
    e.preventDefault();
    const resumen = document.getElementById("resumen-compra");
    resumen.innerHTML = `
      <h3>Resumen de la compra:</h3>
      <p>Nombre: ${document.getElementById("nombre").value}</p>
      <p>Email: ${document.getElementById("email").value}</p>
      <p>Evento: ${document.getElementById("evento").value}</p>
      <p>Ubicación: ${document.getElementById("ubicacion-evento").value}</p>
      <p>Fecha: ${document.getElementById("fecha-evento").value}</p>
      <p>Cantidad: ${document.getElementById("cantidad").value}</p>
      <p>Tipo de entrada: ${document.getElementById("tipo-entrada").value}</p>
      <p>Precio total: ${document.getElementById("precio-total").textContent}</p>
    `;
  });

  // Contador regresivo
  let tiempoRestante = 300;
  const contador = document.getElementById("contador-compra");
  const interval = setInterval(() => {
    if (tiempoRestante > 0) {
      const minutos = Math.floor(tiempoRestante / 60);
      const segundos = tiempoRestante % 60;
      contador.textContent = `⏳ Tiempo restante: ${minutos}:${segundos < 10 ? '0' : ''}${segundos}`;
      tiempoRestante--;
    } else {
      clearInterval(interval);
      contador.textContent = "⏳ Tiempo expirado. Recarga para reiniciar.";
      form.querySelector("button").disabled = true;
    }
  }, 1000);
});