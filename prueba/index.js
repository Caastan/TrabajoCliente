var ciudades = [];
var inputElem = null;
var resultsElem = null;
var buttonElem = null;
var poblacion = [];
var latitud = [];
var longitud = [];
var population = 0;
var latitude = 0;
var longitude = 0;
var ciudad = null;
var activeIndex = 0;
var filteredResults = [];
var lista = "";
var map;

//Primera petición GET para que me de todos las dotos que quiero de la ciudad en concreto.
function initBuscador() {
  //Guardo en varables los input y ul para saber el valor del input y para poder printar la lista.
  inputElem = document.querySelector("input"); 
  resultsElem = document.querySelector("ul");
  buttonElem = document.querySelector("button");

  //Evento para que cuando haga click el usuario me guarde todas las variables que quiero.
  resultsElem.addEventListener("click", (event) => {
    handleResultClick(event);
  });

  //Evento para que me autocmplete el input y salga la lista
  inputElem.addEventListener("input", (event) => {
    //Pongo esta variable en blanco para que se resetee cada vez que se ejecute la función
    lista = "";
    autocomplete();
  });

  //Evento para que cuando pulse una tecla el usuario por ejemplo el enter se esconda la lista de recomendados.
  inputElem.addEventListener("keyup", (event) => {
    handleResultKeyDown(event);
  });

}

function autocomplete(){
  // Verificar si se han realizado búsquedas previas para este prefijo
  var cachedResult = localStorage.getItem(inputElem.value);
  if (cachedResult !== null) {
    // Si hay resultados en caché, mostrarlos
    resultsElem.innerHTML = cachedResult;
    resultsElem.classList.remove("hidden");
    return;
  }

  // Inicializar el objeto XMLHttpRequest para hacer la petición al servidor
  var response = new XMLHttpRequest();

  // Hacer la petición al servidor con el prefijo proporcionado por el usuario
  response.open(
    "GET",
    "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=ES&languageCode=ES&namePrefix=" +
      inputElem.value,
    true
  );
  response.setRequestHeader(
    "X-RapidAPI-Key",
    "cf9f7b5797msh5d2987647ab6472p11c3aajsn077638b1ea7a"
  );
  response.setRequestHeader(
    "X-RapidAPI-Host",
    "wft-geo-db.p.rapidapi.com"
  );
  
  response.send();

  // Manejar la respuesta del servidor
  response.onreadystatechange = function () {
    if (this.readyState == 4) {
      if (this.status == 200) {
        // Parsear la respuesta JSON y verificar que contiene la propiedad "data"
        var responseJson = JSON.parse(response.responseText);
        if (responseJson.hasOwnProperty("data")) {
          // Iterar sobre los resultados y guardarlos en variables
          var nombres = responseJson.data;
          var lista = "";
          for (let index = 0; index <= 4 && index < nombres.length; index++) {
            lista +=
              "<li role='option'> " +
              nombres[index]["name"] +
              " </li>";
            ciudades[index] = nombres[index]["name"];
            poblacion[index] = nombres[index]["population"];
            latitud[index] = nombres[index]["latitude"];
            longitud[index] = nombres[index]["longitude"];
          }

          // Mostrar los resultados y guardarlos en caché
          resultsElem.innerHTML = lista;
          resultsElem.classList.remove("hidden");
          localStorage.setItem(inputElem.value, lista);
        } else {
          // La respuesta no contiene la propiedad "data"
          console.log("La respuesta del servidor es inválida");
        }
      } else if (this.status == 429) {
        console.log("Demasiadas solicitudes");
      } else {
        console.log("Error al realizar la solicitud");
      }
    }
  };
}
      

//Metodo para que cuando el usuario haga click llame a otro para guardar las variables de la ciudad.
function handleResultClick() {
  //Condición para que sea el item selecciona de la lista 
  if (event.target && event.target.nodeName === "LI") {
      selectItem(event.target);
  }
}

//Método para que cuando el usuario presione una tecla tenga funcionalidades espcíficas
function handleResultKeyDown(event) {
  const { key } = event;
  const activeItem = this.getItemAt(activeIndex);
  if (activeItem) {
   activeItem.classList.remove('selected');
   activeItem.setAttribute('aria-selected', 'false');
  }
  //Con el espacio lo que hace es que refresque otra vez y busque ciudades con espacio.
  switch (key) {
    case "Backspace":
      return;
    case "Escape":
      hideResults();
      inputElem.value = "";
      return;
    case "ArrowUp": {
      if (activeIndex === 0) {
        activeIndex = filteredResults.length - 1;
      }
      activeIndex--;
      break;
    }
    case "ArrowDown": {
      if (activeIndex === filteredResults.length - 1) {
        activeIndex = 0;
      }
      activeIndex++;
      break;
    }
    default:
      selectFirstResult();
  }
  //Se llama a esta función para seleccionar el resultado.
  selectResult();
}
//Funcion para poner el index otra vez en 0
function selectFirstResult() {
  activeIndex = 0;
}

//Funcion para esconder la lista.
function hideResults() {
  this.resultsElem.innerHTML = "";
  this.resultsElem.classList.add("hidden");
}


//Funcion para que cuando el usuario seleccione el resultado llame a otra que guarde las variables.
function selectResult() {
  //Hace que la función compruebe el item para poder vincularlo a cuando el usuario presiona una tecla
  const value = inputElem.value;
  const autocompleteValue = filteredResults[activeIndex];
  const activeItem = this.getItemAt(activeIndex);
  if (activeItem) {
   activeItem.classList.add('selected');
   activeItem.setAttribute('aria-selected', 'true');
  }
  if (!value || !autocompleteValue) {
    return;
  }
  if (value !== autocompleteValue) {
    inputElem.value = autocompleteValue;
    inputElem.setSelectionRange(value.length, autocompleteValue.length);
  }
}

//Función para saber cual es el item seleccionado y guardar las variables necesarias.
function selectItem(node) {
  if (node) {
    console.log(node);
    inputElem.value = node.innerText;
    ciudad = inputElem.value;
    hideResults();
  }

  //En este for comparo a ver si la ciudad seleccionada en el input es la misma y si lo es me guarda en otra variable los datos
  
    if (inputElem.value == ciudades[index]){
        population = poblacion[index];
        latitude = latitud[index];
        longitude = longitud[index];
        
    
  } 

  console.log(latitude,longitude)
  initMap(latitude,longitude);
}


//Funcion para saber en que item estamos al seleccionar
function getItemAt(index) {
  return this.resultsElem.querySelector(`#autocomplete-result-${index}`)
}

initBuscador();
 
   function initMap(latitude,longitude) {
      map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: latitude, lng: longitude},
        zoom: 13,
      });
      var marker = new google.maps.Marker({
        position: {lat: latitude, lng: longitude},
        map: map,
      title: 'Acuario de Gijón'
      });
      
    }