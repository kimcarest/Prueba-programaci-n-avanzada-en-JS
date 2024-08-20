
import { Aguila, Serpiente, Oso, Lobo, Leon } from "./animales.js";

const nombreClaseAsociacion = {
  Leon: Leon,
  Lobo: Lobo,
  Oso: Oso,
  Serpiente: Serpiente,
  Aguila: Aguila,
};

let nombreClase = {};

(async function cargarData() {
  try {
    const responseObject = await fetch("./animales.json");
    if (!responseObject.ok) throw new Error("No se pudo cargar los datos.");

    const { animales } = await responseObject.json();
    nombreClase = animales.reduce((acc, elem) => {
      acc[elem.name] = {
        clase: nombreClaseAsociacion[elem.name],
        img: `./assets/imgs/${elem.imagen}`,
        sound: `./assets/sounds/${elem.sonido}`,
      };
      return acc;
    }, {});

    console.log("Datos cargados en nombreClase:", nombreClase); // Verifica que los datos estén cargados
  } catch (error) {
    console.error("Error al cargar los datos:", error);
    mostrarError("No se pudo cargar los datos de los animales. Intenta de nuevo más tarde.");
  }
})();

$(function () {
  const formTag = $("#form");
  const selectAnimal = $("#animal");
  const selectEdad = $("#edad");
  const textAreaComentarios = $("#comentarios");

  formTag.submit(async function (eventObj) {
    eventObj.preventDefault();

    const animalSeleccionado = selectAnimal.val();
    const edad = parseInt(selectEdad.val(), 10);  
    const comentarios = textAreaComentarios.val();

    if (!animalSeleccionado) {
      mostrarError("Por favor, seleccione un animal.");
      return;
    }
    if (isNaN(edad) || edad <= 0) {  
      mostrarError("Por favor, ingrese una edad válida.");
      return;
    }
    if (!comentarios.trim()) {
      mostrarError("Por favor, ingrese comentarios.");
      return;
    }

    try {
      const { clase, img, sound } = nombreClase[animalSeleccionado];
      const objeto = new clase(
        animalSeleccionado,
        edad,
        img,
        comentarios,
        sound
      );

      resetearFormulario();
      const elementoAgregado = mostrarAnimalAgregado(objeto);
      controlEliminarAnimal(elementoAgregado);
      reproducirSonido(elementoAgregado);
      cargarModal(elementoAgregado, objeto);
    } catch (error) {
      console.error("Error al procesar el formulario:", error);
      mostrarError("Error al procesar la información del animal.");
    }
  });

  selectAnimal.change(async function () {
    const animalSeleccionado = selectAnimal.val();
    console.log("Valor seleccionado en el cambio:", animalSeleccionado);
    try {
      const { img } = nombreClase[animalSeleccionado];
      await cargarImagen(img);
    } catch (error) {
      console.error("Error al cambiar la imagen:", error);
      mostrarError("Error al cargar la imagen del animal.");
    }
  });
});

async function cargarImagen(srcImage) {
  return new Promise((resolve, reject) => {
    const img = $("#preview");
    img.attr("src", srcImage);
    img.on("load", () => resolve("Imagen Cargada"));
    img.on("error", () => {
      mostrarError("Error en la carga de la imagen");
      reject("Error en la carga de la imagen");
    });
  });
}

function mostrarAnimalAgregado(objetoAnimal) {
  const contenedorAnimales = $(".contenedor_animales");
  const contenedorAnimal = $("<div>").addClass("animal_insertado");

  contenedorAnimal.html(`
    <div class="animal_insertado_close" title="Haz click aquí para eliminar el elemento">
      <i class="fa-solid fa-circle-xmark"></i>
    </div>
    <img src="${objetoAnimal.img}" alt="${objetoAnimal.nombre}" title="Haz click aquí para mostrar un modal"/>
    <button class="boton_sonido" type="button" title="Haz click aquí para reproducir el sonido" data-sonido="${objetoAnimal.sonido}">
      <i class="fa-solid fa-volume-high"></i>
    </button>
  `);

  contenedorAnimales.append(contenedorAnimal);
  return contenedorAnimal;
}

function reproducirSonido(elementoAgregado) {
  const botonSonido = elementoAgregado.find(".boton_sonido");

  botonSonido.on("click", function () {
    const audioTag = $("#player");
    audioTag.html(`
        <source src="${$(this).attr("data-sonido")}" type="audio/mpeg">
        Tu navegador no soporta la etiqueta de audio.
      `);
    audioTag[0].load();
    audioTag[0].play().catch((error) => {
      mostrarError("No se pudo reproducir el sonido.");
      console.error("Error al reproducir el sonido:", error);
    });
  });
}

function resetearFormulario() {
  $("#form")[0].reset();
  $("#preview").attr("src", "./assets/imgs/lion.svg"); // Ruta por defecto
}

function controlEliminarAnimal(elementoAgregado) {
  const botonClose = elementoAgregado.find(".animal_insertado_close");
  botonClose.on("click", () => elementoAgregado.remove());
}

function cargarModal(elementoAgregado, objeto) {
  const imgTag = elementoAgregado.find("img");
  imgTag.on("click", function () {
    const modalTag = $("#Modal");

    modalTag.find(".modal-body").html(`
      <img src="${imgTag.attr("src")}" alt="imagen animal">
      <p>Edad: ${objeto.edad}</p>
      <h3 class="modal-body_comentarios_titulo">Comentarios</h3>
      <p class="modal-body_comentarios_contenido">${objeto.comentarios}</p>
    `);

    const modalObj = new bootstrap.Modal(modalTag[0]);
    modalObj.show();
  });
}