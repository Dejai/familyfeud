/*****************************FAST MONEY VARIABLES **********************************/

// Fast Money variables
var FAST_MONEY_SCORE = 0;
var FAST_MONEY_VIEW = false;

var IS_TEST_RUN = false;

var NUMBER_OF_ANSWERS = 0;
var CURRENT_PLAYER = "one";

var blinking_interval = undefined;

var LOADING_GIF = `<img src="https://dejai.github.io/scripts/img/loading1.gif">`


/***************************** GETTING STARTED **********************************/

// Once doc is ready
mydoc.ready(function(){

	//Check Test run
	IS_TEST_RUN = checkTestRun();

	// Get the game code from the URL (if available)
	let gamecode = mydoc.get_query_param('gamecode') ?? "";
	setGameCode(gamecode);

	// Add the fast money listeners;
	fastMoneyListenerOnKeyUp();
});

// Adds a listener for keystrokes (on keyup);
function fastMoneyListenerOnKeyUp()
{

	document.addEventListener("keydown", function(event){
		// console.log(event);
		switch(event.code)
		{
			case "Backslash":
				toggleThemeSong();
				break;
			case "ControlLeft":
			case "ControlRight":
				if(Timer.countdown_timer == undefined){
					Timer.startTimer();
				} else {
					Timer.resetTimer();
				}
				break;
			case "Escape":
				onDuplicateAnswer();
				break;
			case "Enter":
				var activeElement = document.activeElement;
				if (activeElement.classList.contains("game_cell"))
				{
					event.preventDefault();
					event.stopPropagation();
					activeElement.blur();
					onFastMoneyAnswerNextFocus(event.target);
				}
				else if (activeElement.classList.contains("fast_money_points"))
				{
					activeElement.blur();
				}
			default:
				return;
		}
	});	
}

/*****************************FAST MONEY LISTENERS**********************************/
// Prevent the page accidentally closing
function onFastMoneyClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Go to the next possible answer question that is available
function onFastMoneyAnswerNextFocus(currentElement)
{
	let nextSibling = currentElement?.parentElement?.nextElementSibling ?? undefined
	let sourceDocument = (nextSibling != undefined) ? nextSibling : document;
	let nextCell = sourceDocument.querySelector(".game_cell[contenteditable='true']");
	if(nextCell != undefined)
	{
		nextCell.focus();		
	}
}

// Hide the answer after entering
function onFastMoneyAnswerBlur(event)
{
	let ele = event.srcElement;
	value = ele.innerText ?? "";
	cleanValue = value.replace("\n","").replace("\t","").trim();

	if(cleanValue.length > 1)
	{
		ele.setAttribute("data-answer", cleanValue);
		ele.innerText = "ANSWERED";

		// Increment # of answers & check if all entered
		NUMBER_OF_ANSWERS++;
		checkAnswersAndTimer();

		// Make it no longer editable
		ele.contentEditable = false;

		ele.classList.add("fastmoney_hidden");
		ele.addEventListener("click", onFastMoneyRevealAnswer);
	}
	else
	{
		ele.innerText = "... add answer ...";
	}
}

// Empty the answer placeholder on focus
function onFastMoneyAnswerFocus(event)
{
	let ele = event.srcElement;
	ele.innerText = "";
}

// Reveal the answer
function onFastMoneyRevealAnswer(event)
{
	let ele = event.srcElement;
	
	let is_hidden = ele.classList.contains("fastmoney_hidden");
	if(is_hidden)
	{

		answer = ele.getAttribute("data-answer");

		// Set the answer;
		ele.innerText = answer.toUpperCase();

		let sibling = ele.nextElementSibling;
		sibling.contentEditable = true;

		document.getElementById("fast_money_answer").play();
		ele.classList.remove("fastmoney_hidden");
		// Add the listener to the answer section
		sibling.addEventListener("focus", blinkingFastMoneyScore);
		sibling.addEventListener("blur", onFastMoneyRevealScore);
		// Focus into the answer element
		sibling.focus();
	}	
}

/***************** THE SCORES FOR ANSWERS **********************************/

// Update the fast money total score
function onFastMoneyRevealScore(event)
{
	let ele = event.srcElement;
	value = Number(ele.innerText.replaceAll("&nbsp;", "~").replaceAll("<br/>",""));

	console.log(value);
	ele.innerHTML = value;

	let has_space = ele.innerHTML.includes("&nbsp;");
	let is_empty = (ele.innerText == "");
	// let value = Number(ele.innerText.replaceAll("&nbsp;", "~"));

	if(!isNaN(value))
	{
		ele.style.color = "white";
		ele.contentEditable = false;
		
		// Play the sounds for answer
		playSoundOnRevealScore(value);
		
		// Stop the blinking
		clearInterval(blinking_interval);
		ele.classList.remove("blinking");

		ele.addEventListener("click", onFastMoneyEditScore);

		updateFastMoneyScore(value);
	}
	else
	{
		clearInterval(blinking_interval);
		alert("Enter a valid number, with no alphabet characters or spaces.");
	}
}

function onFastMoneyEditScore(event)
{
	let isEdit = confirm("Are you sure you want to edit this score?");
	if(isEdit)
	{
		let ele = event.srcElement;
		let score = Number(ele.innerText.replaceAll("&nbsp;", "~").replaceAll("<br/>",""));

		let newValue = prompt("What is the new value?");
		let new_score = Number(newValue);

		if(!isNaN(new_score))
		{
			playSoundOnRevealScore(new_score);
			updateFastMoneyScore(-score);
			updateFastMoneyScore(new_score);
			ele.innerHTML = new_score;
		}
		else
		{
			alert("Enter a valid number, with no alphabet characters or spaces.");
		}

	}
}


// Play duplicate sound
function onDuplicateAnswer()
{
	let duplicateAnswerSound = document.getElementById("duplicate_answer_sound");
	// Play the wrong answer sound
	duplicateAnswerSound.play();
}

/***************************** HELPER FUNCTIONS **********************************/

// Blinking score before reveal
function blinkingFastMoneyScore(event)
{
	let ele = event.srcElement;
	blinking_interval = setInterval(function(){
		let has_class = ele.classList.contains("blinking");
		if(!has_class)
		{ 
			ele.classList.add("blinking");
		}
		else
		{
			ele.classList.remove("blinking");
		}
	}, 400);
}


// If all answers entered, stop the timer
function checkAnswersAndTimer()
{
	if(NUMBER_OF_ANSWERS == 5)
	{
		toggleFastMoneyTimer(true);
		if(CURRENT_PLAYER == "one")
		{
			mydoc.showContent("#hide_player_one");
			document.getElementById("player_two_button").disabled = false;
		}
	}
}

// Indicate the current fast money player
function indicateFastMoneyPlayer(element)
{
	let alreadySet = Array.from(document.querySelectorAll(".fastmoney_curr_player"));
	alreadySet.forEach(function(obj){
		obj.classList.remove("fastmoney_curr_player")
	});

	mydoc.removeClass(".fastmoney_curr_player", "fastmoney_curr_player");

	// Add it to the clicked element;
	element.classList.add("fastmoney_curr_player");
}


function playSoundOnRevealScore(score)
{
	// Play the sounds for answer
	if(score > 0){ document.getElementById("fast_money_points").play(); }
	if(score == 0){ document.getElementById("fast_money_zero").play(); }
}

// Listeners for fast money
function setCurrentPlayer(event, player)
{

	let ele = event.srcElement; 
	ele.disabled = true; // Prevent someone from pressing the button again; 

	// Current Player variable:
	CURRENT_PLAYER = player;

	// Indicate the current fast money player;
	indicateFastMoneyPlayer(ele);

	// Set the time based on the player
	setTimeForFastMoneyPlayer(player);

	// Reset count for number of answers
	NUMBER_OF_ANSWERS = 0;

	// Get the appropriate cells
	let identifier = `fast_money_player_${player}`
	let cells = Array.from(document.querySelectorAll(`#${identifier} .game_cell`));

	if(cells != undefined)
	{
		cells.forEach(function(obj){
			obj.contentEditable = true;
			obj.innerText = "... add answer ...";
			obj.addEventListener("focus", onFastMoneyAnswerFocus);
			obj.addEventListener("blur", onFastMoneyAnswerBlur);
		});
	}
}

// Sets the time based on the player
function setTimeForFastMoneyPlayer(player)
{
	let time = (player == "two") ? 25 : 20;
	Timer.setTimerDefault(time);
	mydoc.showContent("#time_view");
}

function setGameCode(value)
{
	if(value != "")
	{
		CURR_GAME_CODE = value.toUpperCase();
		mydoc.setContent("#game_code", {"innerText": value});
	}
}

function toggleFastMoneyTimer(forceStop=false)
{
	if(Timer.countdown_timer == undefined)
	{
		mydoc.showContent("#time_view");
		Timer.startTimer();
	} 
	if(Timer.countdown_timer || forceStop) 
	{
		mydoc.hideContent("#time_view");
		Timer.resetTimer();
	}
}


// Toggle answers in batch
function toggleFastMoneyAnswers(action)
{
	p1s = Array.from(document.querySelectorAll(`#fast_money_player_one .game_cell`));

	// Hide all answers
	if(p1s != undefined && action == "hide")
	{
		p1s.forEach(function(obj){
			obj.classList.add("fastmoney_hide_player1");
			let sibling = obj.nextElementSibling;
			sibling.classList.add("fastmoney_hide_player1");
		});

		document.getElementById("hide_player_one").classList.add("hidden");
		document.getElementById("show_player_one").classList.remove("hidden");
	}

	// Show all answers again
	if(p1s != undefined && action == "show")
	{
		p1s.forEach(function(obj){
			obj.classList.remove("fastmoney_hide_player1");
			let sibling = obj.nextElementSibling;
			sibling.classList.remove("fastmoney_hide_player1");
		});
		document.getElementById("hide_player_one").classList.remove("hidden");
		document.getElementById("show_player_one").classList.add("hidden");

	}
}

// Toggle the theme song
function toggleThemeSong()
{
	theme_song = document.getElementById("theme_song_sound");
	let is_paused = theme_song.paused;
	if(is_paused)
	{
		theme_song.play();
		mydoc.removeClass("#themeSongIcon", "themeSongPaused");
		mydoc.addClass("#themeSongIcon", "themeSongPlaying");
	}
	else
	{
		theme_song.pause();
		theme_song.currentTime = 0;
		mydoc.removeClass("#themeSongIcon", "themeSongPlaying");
		mydoc.addClass("#themeSongIcon", "themeSongPaused");

	}
}

// Update the fast money total score
function updateFastMoneyScore(value)
{
	FAST_MONEY_SCORE += Number(value);
	document.getElementById("fast_money_total_score").innerText = FAST_MONEY_SCORE;
}
