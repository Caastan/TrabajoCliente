var ciudades = [];
var inputElem = null;
var resultsElem = null;
var activeIndex = 0;
var filteredResults = [];
const data = null;

function init() { 
  var response = new XMLHttpRequest();
  

  response.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
      // La respuesta, aunque sea JSON, viene en formato texto, por lo que tendremos que hace run parse
      console.log(JSON.parse(response.responseText));
    }
  }
  
  response.open("GET", "https://wft-geo-db.p.rapidapi.com/v1/geo/cities?countryIds=es&namePrefix= "+data+"&languageCode=es  ",true);

  

  response.setRequestHeader("X-RapidAPI-Key", "cf9f7b5797msh5d2987647ab6472p11c3aajsn077638b1ea7a");
  response.setRequestHeader("X-RapidAPI-Host", "wft-geo-db.p.rapidapi.com");
  
  resultsElem = document.querySelector("ul");
  inputElem = document.querySelector("input");

  resultsElem.addEventListener("click", (event) => {  
    data = handleResultClick(event);
  });
  
  inputElem.addEventListener("input", (event) => {
    autocomplete(event);
  });
  inputElem.addEventListener("keyup", (event) => {
    handleResultKeyDown(event);
  });
  response.send(null);
}

function autocomplete(event) {
  const value = inputElem.value;
  if (!value) {
    hideResults();
    inputElem.value = "";
    return;
  }
  filteredResults = ciudades.filter((ciudades) => {
    return ciudades.data.name.toLowerCase().startsWith(value.toLowerCase());
  }).slice(0,5);

  resultsElem.innerHTML = filteredResults
    .map((result, index) => {
      const isSelected = index === 0;
      return `
        <li
          id='autocomplete-result-${index}'
          class='autocomplete-result${isSelected ? " selected" : ""}'
          role='option'
          ${isSelected ? "aria-selected='true'" : ""}
        >
          ${result.name.common}
        </li>
      `;
    })
    .join("");
  resultsElem.classList.remove("hidden");
}

function handleResultClick() {
  if (event.target && event.target.nodeName === "LI") {
    selectItem(event.target);
  }
}
function handleResultKeyDown(event) {
  const { key } = event;
  const activeItem = this.getItemAt(activeIndex);
  if (activeItem) {
   activeItem.classList.remove('selected');
   activeItem.setAttribute('aria-selected', 'false');
  }
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
  console.log(activeIndex);
  selectResult();
}
function selectFirstResult() {
  activeIndex = 0;
}

function selectResult() {
  const value = inputElem.value;
  const autocompleteValue = filteredResults[activeIndex].name.common;
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
function selectItem(node) {
  if (node) {
    console.log(node);
    inputElem.value = node.innerText;
    hideResults();
  }
}



function getItemAt(index) {
  return this.resultsElem.querySelector(`#autocomplete-result-${index}`)
}

init();