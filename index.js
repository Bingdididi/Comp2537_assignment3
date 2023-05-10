const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []


const fetchTypes = async () => {
  const response = await axios.get('https://pokeapi.co/api/v2/type');
  const types = response.data.results;

  types.forEach((type) => {
    $('#type-filter').append(`
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="${type.name}" id="${type.name}">
        <label class="form-check-label" for="${type.name}">
          ${type.name}
        </label>
      </div>
    `);
  });
};

const filterPokemonsByType = async () => {
  const selectedTypes = [];
  $('input[type=checkbox]:checked').each(function () {
    selectedTypes.push($(this).val());
  });

  const filteredPokemons = [];
  for (const pokemon of pokemons) {
    const res = await axios.get(pokemon.url);
    const types = res.data.types.map((type) => type.type.name);

    if (selectedTypes.every((type) => types.includes(type))) {
      filteredPokemons.push(pokemon);
    }
  }

  paginate(currentPage, PAGE_SIZE, filteredPokemons);
   // Update pagination after filtering
   const numPages = Math.ceil(filteredPokemons.length / PAGE_SIZE);
   updatePaginationDiv(currentPage, numPages);
};







const updatePaginationDiv = (currentPage, numPages) => {
  $('#pagination').empty()

  if (currentPage > 1) {
    $('#pagination').append(`<button class="btn btn-primary prev ml-1">Prev</button>`)
  }

  let startPage = currentPage - 2;
  let endPage = currentPage + 2;

  if (startPage < 1) {
    endPage += Math.abs(startPage) + 1;
    startPage = 1;
  }

  if (endPage > numPages) {
    startPage -= endPage - numPages;
    endPage = numPages;
  }

  startPage = Math.max(startPage, 1);

  for (let i = startPage; i <= endPage; i++) {
    const buttonClass = i === currentPage ? "btn-primary" : "btn-secondary";
    $('#pagination').append(`
    <button class="btn ${buttonClass} page ml-1 numberedButtons" value="${i}">${i}</button>
    `)
  }

  if (currentPage < numPages) {
    $('#pagination').append(`<button class="btn btn-primary next ml-1">Next</button>`)
  }
// Add button to go to the last page
if (currentPage !== numPages) {
  $('#pagination').append(`<button class="btn btn-primary last ml-1">Last</button>`)
}
}



const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
   // Display the range of Pokémons being displayed and the total number of Pokémons
   const start = (currentPage - 1) * PAGE_SIZE + 1;
   const end = Math.min(currentPage * PAGE_SIZE, pokemons.length);
   $('#display-info').html(`<p>Displaying ${start} to ${end} of ${pokemons.length} Pokémons</p>`);
}

const setup = async () => {
  // test out poke api using axios here
  await fetchTypes();
  $('body').on('change', 'input[type=checkbox]', filterPokemonsByType);

  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

 // Event listener for numbered pagination buttons
 $('body').on('click', ".numberedButtons", async function (e) {
  currentPage = Number(e.target.value);
  paginate(currentPage, PAGE_SIZE, pokemons);

  // Update pagination buttons
  updatePaginationDiv(currentPage, numPages);
});

// Add event listener to "Prev" button
$('body').on('click', '.prev', async function (e) {
  currentPage -= 1;
  paginate(currentPage, PAGE_SIZE, pokemons);

  // Update pagination buttons
  updatePaginationDiv(currentPage, numPages);
});

// Add event listener to "Next" button
$('body').on('click', '.next', async function (e) {
  currentPage += 1;
  paginate(currentPage, PAGE_SIZE, pokemons);
   // Update pagination buttons
   updatePaginationDiv(currentPage, numPages);
  });

// Add event listener to "Last" button
$('body').on('click', '.last', async function (e) {
  currentPage = numPages;
  paginate(currentPage, PAGE_SIZE, pokemons);

  // Update pagination buttons
  updatePaginationDiv(currentPage, numPages);
});
}

$(document).ready(setup);