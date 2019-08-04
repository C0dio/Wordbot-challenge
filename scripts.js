const API_BASE = 'https://api.noopschallenge.com';
let numberOfFailedGuesses = 0;

/* Modified function provided by the Wordbot developers to get a sequence of Words */
function NOOPBOT_FETCH(options, onComplete) {
  if (!options.API) {
    console.error('API not set');
    return;
  }

  if (!onComplete) {
    console.warn('onComplete not set, nothing will happen.');
  }

  let params = [];
  Object.keys(options).forEach(key => params.push(`${key}=${options[key]}`))
  let url = `${API_BASE}/${options.API}?` + params.join('&');

  // run the API for Wordbot
  window.fetch(url)
    .then(function(response) {
      return response.json();
    }).then(function(responseJson) {
      onComplete(responseJson);
    });
}

/* The main function */
function main() {
  let modal = document.getElementById("myModal");
  // When the user clicks on <span> (x), close the options modal
  document.getElementsByClassName("close")[0].onclick = function() {
    modal.style.display = "none";
  }
  // When the user clicks anywhere outside of the options modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // When the user clicks the "Apply" button from the options
  document.getElementById("apply").onclick = function() {
    let filter = document.getElementsByTagName("select")[0].value;
    resetPage();
    generateWord(filter);
    modal.style.display = "none";
  }

  // Generate any word
  generateWord("all");
}

/* Generate a word */
function generateWord(filter) {
  NOOPBOT_FETCH({
    API: 'wordbot',
    count: 1,
    set: filter,
  }, draw);
  document.getElementById("currentCategory").innerHTML = "Category: " + filter;
}

/* Reset the page */
function resetPage() {
  // Change the background to white incase they won & reset the count
  numberOfFailedGuesses = 0;
  document.body.style.backgroundColor = "white";
  // Remove the letters
  let letters = document.getElementById("wordContainer");
  let child = letters.lastElementChild;
  while (child) {
    letters.removeChild(child);
    child = letters.lastElementChild;
  }

  // Reset the wrong letters
  document.getElementById("guesses").innerHTML = "";

  // Remove the crosses
  let crosses = document.getElementById("lives");
  child = crosses.lastElementChild;
  while (child) {
    crosses.removeChild(child);
    child = crosses.lastElementChild;
  }
}

/* When the user guesses a letter */
function listener(e) {
  // Check if input is Enter & reset page
  if (e.keyCode == 13) {
    let filter = document.getElementsByTagName("select")[0].value;
    document.getElementById("myModal").style.display = "none";
    resetPage();
    generateWord(filter);
    return;
  }
  // Check input is a letter
  if (!(/^[a-z\-]$/i.test(e.key))) {
    return;
  }

  // Check if this guess has been made and ignore it
  let guessTag = document.getElementById("guesses");
  if (guessTag.innerHTML.includes(e.key)) {
    return;
  }

  // Get letters
  let articles = document.getElementsByTagName("article");
  let inWord = false;
  let correctWords = 0;
  // Check if the letter guessed is in our word
  for (var i = 0; i < articles.length; i++) {
    let letterTag = articles[i].firstChild;
    if (letterTag.innerHTML === e.key.toLowerCase()) {
      letterTag.style.visibility = "visible";
      inWord = true;
    }
    if (letterTag.style.visibility === "visible") {
      correctWords++;
    }
  }

  // Check if they have won
  if (correctWords >= articles.length && correctWords != 0) {
    document.body.style.backgroundColor = "Lightgreen";
    alert("You Win! To play again refresh the page or press Enter.");
    return;
  }

  // If the user made a incorrect guess
  if (!inWord) {
    // Add the letter to the incorrect pile
    let guessText = document.createTextNode(e.key);
    guessTag.appendChild(guessText);
    document.body.appendChild(guessTag);

    // If they made a bad guess, generate a cross tag
    let crosses = document.getElementById("lives");
    let crossTag = document.createElement("h1");
    crossTag.innerHTML = "&#10060;";
    crosses.appendChild(crossTag);

    // Increment counter and check if the game is lost
    numberOfFailedGuesses++;
    if (numberOfFailedGuesses > 5) {
      // Make all letters visible
      for (var i = 0; i < articles.length; i++) {
        let letterTag = articles[i].firstChild;
        letterTag.style.visibility = "visible";
      }
      // Alert the user
      document.body.style.backgroundColor = "#fa6464";
      alert("Bad luck. To play again refresh the page or press Enter.");
      return;
    }

  }
}

/* Create a container and append the related information */
function draw(response) {
  // Store the words
  let { words } = response;
  let word = words[0].toLowerCase();
  let wordContainer = document.getElementById("wordContainer");

  console.log(word);

  for (var i = 0; i < word.length; i++) {
    // create a word div and append to existing word container section
    let letterTag = document.createElement("h2");
    let letterText = document.createTextNode(/^\s+$/.test(word.charAt(i)) ? "/" : word.charAt(i));
    letterTag.appendChild(letterText);
    // Add to article
    let wordTag = document.createElement("article");
    wordTag.appendChild(letterTag);
    wordContainer.appendChild(wordTag);
    // Check for spaces
    if (letterText.data === "/") {
      letterTag.style.visibility = "visible";
      wordTag.style.borderBottom = "none";
    }
  }
}

// Open the Options modal
function optionsClick(event) {
  document.getElementById("myModal").style.display = "block";
}
