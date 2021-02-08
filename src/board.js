
/*****************************VARIABLES****************************************/

// Game started?
var GAME_STARTED = false; 

// Check determine which views the game is in
var ADMIN_VIEW = false;
var BOARD_VIEW = false;
var FAST_MONEY_VIEW = false;

// Is this a a TEST run of the game
var IS_TEST_RUN = false;

// Storing the values of the current card
var CURR_CARD  = "";
var CURR_QUEST = "";

// Game Board variables
var CURR_ROUND = 0;
var CURR_MULTIPLIER = 1;
var CURR_SCORE = 0;
var CURR_WRONG = 0;
var IS_STEAL = false;
var IN_PLAY = false;
var IS_FACEOFF = false;
var TEAM_IN_PLAY = "";

/*****************************GETTING STARTED************************************/

// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	// Set admin path variable if on admin path
	if(path.includes("/admin")){ 
		ADMIN_VIEW = true; 
	}

	// Adds listener for game board
	if(path.includes("/board"))
	{ 

		BOARD_VIEW = true;

		checkTestRun();

		window.addEventListener("beforeunload", onClosePage);
		gameBoardListenerOnKeyUp(); 
		// set default timer time
		Timer.setTimerDefault(10);
		Timer.setTimeUpCallback(function(){
			document.getElementById("duplicate_answer_sound").play();
		});
	}
});



/*****************************GENERAL LISTENERS**********************************/
// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Adds a listener for keystrokes (on keyup);
function gameBoardListenerOnKeyUp(){

	document.addEventListener("keyup", function(event){
		// console.log(event);
		switch(event.code)
		{
			case "Backquote":
				undoWrongAnswer();
				break;
			case "Backslash":
				toggleThemeSong();
				break;
			case "ControlLeft":
			case "ControlRight":
				toggleCountdownTimer();
				break;
			case "Enter":
			case "NumpadEnter":
				if(GAME_STARTED)
				{
					document.getElementById("next_round_button").click();				
				}
				else
				{
					document.getElementById("startGameButton").click();
				}
				break;

			case "Escape":
			case "NumpadSubtract":
				onWrongAnswer();
				break;

			case "Digit1":
			case "Digit2":
			case "Digit3":
			case "Digit4":
			case "Digit5":
			case "Digit6":
			case "Digit7":
			case "Digit8":
			case "Numpad1":
			case "Numpad2":
			case "Numpad3":
			case "Numpad4":
			case "Numpad5":
			case "Numpad6":
			case "Numpad7":
			case "Numpad8":
				onRevealAnswer(event.code);
				break;
				
			default:
				return;
		}
	});	
}

function toggleThemeSong()
{
	theme_song = document.getElementById("theme_song_sound");
	let is_paused = theme_song.paused;
	if(is_paused)
	{
		theme_song.play();
	}
	else
	{
		theme_song.pause();
		theme_song.currentTime = 0;
	}
}


function toggleGameSettings()
{
	// button = document.getElementById("game_settings_button");
	section = document.getElementById("game_settings_section");

	if (section.classList.contains('hidden'))
	{
		// button.classList.remove("hidden");
		// button.innerText = "Close";
		section.classList.remove("hidden");
	}
	else
	{
		// button.innerText = "Game Settings";
		section.classList.add("hidden");
	}
}

/****************************BOARD ACTIONS: QUESTIONS****************************************/


// Sets a flag if this is a TEST RUN
function checkTestRun()
{
	let queryMap = mydoc.get_query_map();
	IS_TEST_RUN = (queryMap != undefined && queryMap.hasOwnProperty("test") && queryMap["test"] == "1")

	if(IS_TEST_RUN)
	{
		mydoc.addTestBanner();

		// Setup the element to be passed through to the next page;
		let links = Array.from(document.querySelectorAll(".pass_through_params"));
		links.forEach(function(obj){
			obj.href += location.search;
		});
	}
}

// Start the game
function onStartGame()
{
	GAME_STARTED = true;
	IS_FACEOFF = true;

	document.getElementById("startGameButton").classList.add("hidden");

	// Hide elements
	mydoc.hideContent(".pregame_action_buttons");

	// Show elements
	mydoc.showContent(".face_off_element");
	mydoc.showContent(".game_action_buttons");
	mydoc.showContent("#game_table_section");
	mydoc.showContent(".current_score_section");
	mydoc.showContent(".team_in_play");

	// document.getElementById("retryButton").classList.remove("hidden");
	onNextRound();
}

// Start the face off window
function onFaceOff()
{
	let height = window.innerHeight;
	let width = window.innerWidth;

	let team1 = document.querySelector("h1.team_name_box[data-team='team_one']");
	let team2 = document.querySelector("h1.team_name_box[data-team='team_two']");
	
	let team1Name = (mydoc.isValidValue(team1.innerText)) ? team1.innerText : "Team 1";
	let team2Name = (mydoc.isValidValue(team2.innerText)) ? team2.innerText : "Team 2";

	let path = location.href.replace("/board/", `/faceoff/faceoff.html?team1=${team1Name}&team2=${team2Name}`)
	window.open(path, "_blank", `toolbar=yes,scrollbars=yes,resizable=yes,top=10,left=100,width=${width},height=${height}`);
}

// Select question
function onSelectQuestion()
{
	MyTrello.get_cards(MyTrello.pool_list_id, function(data){

		response = JSON.parse(data.responseText);

		if(response.length >= 1)
		{
			rand_id = Math.floor(Math.random()*response.length);
			card = response[rand_id];
			CURR_CARD = card["id"];
			CURR_QUEST = card["name"];
			question = card["name"];
			checklist_id = card["idChecklists"][0];

			// Load the answers into the table
			onLoadAnswers(checklist_id);
		}
		else
		{
			alert("NOT ENOUGH CARDS TO SELECT FROM!");
		}
	});
}

// When nobody got the correct answer
function onNoCorrectAnswers()
{

	let noCorrectAnswers = confirm("CONFIRM: No Correct Answers Were Given?");

	if(noCorrectAnswers)
	{
		// Set pseudo IN PLAY
		TEAM_IN_PLAY = "NOBODY!";
		
		// Make sure the points do not get added
		IN_PLAY = false;
		IS_FACEOFF = false;

		// Hide the play buttons
		mydoc.hideContent(".team_in_play");

		// Hide the Face Off things
		mydoc.hideContent(".face_off_element");
	}


}

// Try another question
function tryAnotherQuestion()
{
	Logger.log("Trying another question");
	cleared = onClearBoard(true);
	if(cleared){
		onSelectQuestion();
	}
}

// Load the answers
function onLoadAnswers(checklist_id)
{
	counter = 0;

	MyTrello.get_checklist(checklist_id,function(data){
		response = JSON.parse(data.responseText);

		checklist_items = response["checkItems"];
		card_id = response["idCard"];

		checklist_items = checklist_items.sort(function(a,b){
			return a.pos - b.pos;
		});

		try 
		{
			checklist_items.forEach(function(obj){
				counter++;
				splits = obj["name"].split("~");
				answer_text = splits[0].trim();
				answer_count = splits[1].trim();
				document.querySelector(`#game_cell_${counter} p.answer`).innerText = answer_text;
				document.querySelector(`#game_cell_count_${counter} p`).innerText = answer_count;

				document.querySelector(`#game_cell_${counter} p.game_cell_number`).classList.remove("hidden");
				document.querySelector(`#game_cell_${counter} p.game_cell_number`).classList.add("circled_number");

				// If admin view -- load the answers immediately on load;
				if(ADMIN_VIEW){
					onRevealAnswer(String(counter));
				}
			});

			if(BOARD_VIEW)
			{
				// Hide the GIF and show the answers
				mydoc.hideContent("#loading_gif");
				mydoc.showContent("#game_table");
			}
			
			// Move the card to the current card; Only if NOT a test run
			if(!IS_TEST_RUN){
				MyTrello.moveCard(card_id, "Current");
			}
		} 
		catch(error) 
		{
			Logger.log(error);
			if(BOARD_VIEW)
			{
				tryAnotherQuestion();
			}
		}
	});
}


// Set which team is in play
function setTeamInPlay(team)
{
	// If team already in play, don't do anything
	let in_play_already = document.querySelectorAll(".in_play");
	if(in_play_already.length > 0){ return; }

	// Set IN_PLAY to true and IS_FACEOFF to false
	IN_PLAY = true; 
	IS_FACEOFF = false;

	// Set global team in play;
	TEAM_IN_PLAY = team;

	identifier = `#team_${team} .team_name_box`;
	team_name = document.querySelector(identifier);
	team_name.classList.add("in_play");

	// Clear wrong answer count if any
	clearWrongAnswerCount();

	// Hide the PLAY buttons & Face Off things
	mydoc.hideContent(".team_in_play"); 
	mydoc.hideContent(".face_off_element");
}

// Set the countdown timer
function toggleCountdownTimer(forceHide=false)
{
	let timeView = document.querySelector("#time_view");

	let isHidden = (timeView.classList.contains("hidden")) ? true : false;

	if(isHidden)
	{
		timeView.classList.remove("hidden");
		Timer.startTimer();
	}
	if (!isHidden || forceHide)
	{
		timeView.classList.add("hidden");
		Timer.resetTimer();
	}
}

/****************************BOARD ACTIONS: ANSWERS****************************************/

// Indicates wrong answer
function onWrongAnswer()
{
	let wrongAnswerSound = document.getElementById("wrong_answer_sound");
	
	CURR_WRONG++;
	let img = "";

	let amount = (CURR_WRONG > 3 || IS_FACEOFF ) ? 1: CURR_WRONG;

	for(var idx = 0; idx < amount; idx++)
	{
		img += `<img class="wrong_answer_img" src="../assets/img/wrong_answer.png" alt="WRONG"/>`;
	}
	
	// Play the wrong answer sound
	wrongAnswerSound.play();

	// Force stop the timer
	toggleCountdownTimer(true);


	// setTimeout(function(){
	document.getElementById("wrong_answer_section").innerHTML = img;

	// Update "steal" bool if 3 wrong
	if(IN_PLAY && CURR_WRONG == 3){ 
		IS_STEAL = true;
		setStealOpportunity();
	}

	// Update in-play if steal was wrong too;
	if (IN_PLAY && CURR_WRONG > 3){ 
		IN_PLAY = false; 
		clearSteal();
	}

	// Check to assign score even after wrong answers
	checkToAssignScore(false);

	// },1000);
}

// Undo a wrong answer set
function undoWrongAnswer()
{
	console.log("Undo wrong answer");
	console.log(CURR_WRONG);
	if(CURR_WRONG > 0)
	{
		CURR_WRONG-=1;
	}
	console.log(CURR_WRONG);

	let img = "";

	for(var idx = 0; idx < CURR_WRONG; idx++)
	{
		img += `<img class="wrong_answer_img" src="../assets/img/wrong_answer.png" alt="WRONG"/>`;
	}

	document.getElementById("wrong_answer_section").innerHTML = img;

	if(IS_STEAL && CURR_WRONG == 2)
	{
		clearSteal();
	}
}

// Set the steal opportunity
function setStealOpportunity()
{
	let team_in_play = document.querySelector(".in_play");

	if(team_in_play != undefined)
	{
		let team_name = team_in_play.getAttribute("data-team");
		opposite_team = (team_name == "team_one") ? "team_two" : "team_one";

		let steal_phrase = document.querySelector(`#${opposite_team} span.can_steal`);
		steal_phrase.classList.remove("hidden");

	}
}

// Reveals an answer
function onRevealAnswer(value)
{	
	let digit = value.replace("Digit","").replace("Numpad","");

	// Make sure admin can no longer use the No Answers optio
	mydoc.hideContent("#no_correct_answers");

	// The right sound element;
	let rightSound = document.getElementById("right_answer_sound");

	let number = document.querySelector(`#game_cell_${digit} p.game_cell_number`);
	let cell = document.querySelector(`#game_cell_${digit} p.answer`);
	let count = document.querySelector(`#game_cell_count_${digit}`);
	let count_val = document.querySelector(`#game_cell_count_${digit} p`);

	let revealed = document.querySelectorAll(".answer.revealed");
	if(BOARD_VIEW && revealed.length >=2 && TEAM_IN_PLAY === "")
	{
		alert("Cannot reveal another answer until a team is selected to \"Play\"");
		return;
	}

	// Criteria for showing a value
	let is_hidden = Array.from(count_val.classList).includes("hidden");
	let has_value = (cell.innerText != "" && cell.innerText != undefined);

	if(is_hidden && has_value)
	{
		if(BOARD_VIEW)
		{
			rightSound.play(); 
			toggleCountdownTimer(true);

			number.classList.add("hidden");
			number.classList.remove("circled_number");
		}
		// Reveal the content
		cell.classList.remove("hidden");
		cell.classList.add("revealed");
		count_val.classList.remove("hidden");
		count.classList.remove("unseen");

		if(BOARD_VIEW){
			onUpdateScore(count_val.innerText);

			checkToAssignScore(true);
		}
	}
}

function checkToAssignScore(isCorrect)
{

	let hidden_cells = document.querySelectorAll("p.circled_number");

	Logger.log("IN_PLAY: " + IN_PLAY);
	Logger.log("IS_STEAL: " + IS_STEAL);
	Logger.log("isCorrect: " + isCorrect);
	Logger.log("Hidden Cells: " + hidden_cells.length);

	let assigne_to_team = "";
	let delay = 2000;  // delay for 3 seconds

	if(!IN_PLAY && IS_STEAL && isCorrect)
	{
		let opposite_team = (TEAM_IN_PLAY == "one") ? "two" : "one";
		setTimeout(function(){onAssignScore(opposite_team)}, delay);
	}
	else if(IN_PLAY && hidden_cells.length == 0)
	{
		setTimeout(function(){onAssignScore(TEAM_IN_PLAY)}, delay);
	}
	else if(!IN_PLAY && CURR_WRONG > 3)
	{
		setTimeout(function(){onAssignScore(TEAM_IN_PLAY)}, delay);
	}
}


/**********************BOARD ACTIONS: SCORING*******************************/

// Update the score
function onUpdateScore(value){
	if(IN_PLAY || IS_FACEOFF)
	{
		CURR_SCORE += (Number(value) * CURR_MULTIPLIER);
		document.getElementById("current_score").innerText = CURR_SCORE;
		
		// Don't add score for any remaining if steal was successful and still on board
		if (CURR_WRONG == 3){ IN_PLAY = false; }
	}
}

// Give score to a certain team
function onAssignScore(team)
{
	// alert("Assigning Team Score");
	// Make sure no more values are calculated
	IN_PLAY = false;
	IS_STEAL = false;

	identifier = `team_${team}_score`;

	try
	{
		team_ele = document.getElementById(identifier);
		existing_score = Number(team_ele.innerText);
		team_ele.innerText = Number(existing_score + CURR_SCORE)

		// Clear the score keeper
		CURR_SCORE = 0;
		document.getElementById("current_score").innerText = "0";

		clearWrongAnswerCount();
	}
	catch(error)
	{
		Logger.log(error);
	}
}



/**********************ADMIN/BACK END ACTIONS*******************************/
// Get the card that is currently selected
function onGetCurrentQuestion()
{

	// Clear the cells on the board;
	clearCellsOnBoard();
	
	// Get the current card
	MyTrello.get_cards(MyTrello.current_card_list_id, function(data){

		response = JSON.parse(data.responseText);

		if(response.length == 1)
		{
			rand_id = Math.floor(Math.random()*response.length);
			card = response[rand_id];
			CURR_CARD = card["id"];
			CURR_QUEST = card["name"];
			question = card["name"];
			checklist_id = card["idChecklists"][0];

			// Set the current question:
			document.getElementById("current_question").innerText = CURR_QUEST;

			// Load the answers into the table; Pass true for admin view
			onLoadAnswers(checklist_id);
		}
		else
		{
			msg = "ERROR: Something went wrong;";
			if(response.length == 0){
				msg = "A card has not been selected yet; Use the game board to select the next one";
			}
			if (response.length > 1)
			{
				msg = "Too many cards in the list; Should only be one;"
			}
			alert(msg);
		}
	});
}

// Switch to the next round
function onNextRound()
{
	let nextRoundButton = document.getElementById("next_round_button");

	if(nextRoundButton.disabled){
		return;
	}

	let hidden_cells = document.querySelectorAll("p.circled_number");
	if(hidden_cells.length > 0)
	{
		alert("Cannot go to next round until all answers are revealed!");
		return;
	}

	cleared = onClearBoard(); //Clear the board of current answer
	if(cleared)
	{
		// Temporarily disable button
		nextRoundButton.disabled = true;

		onSelectQuestion(); // Select the next option
		CURR_ROUND++;
		nextRound = "Round #" + (CURR_ROUND);
		CURR_MULTIPLIER = (CURR_ROUND <= 1) ? 1 : (CURR_ROUND - 1);
		phrase = CURR_MULTIPLIER > 1 ? `<br/><span class="multiplier_phrase">(${CURR_MULTIPLIER}x points)</span>` : "";
		document.getElementById("round_name").innerHTML = nextRound + phrase;
	}

	setTimeout(function(){
		nextRoundButton.disabled = false;
	},5000);
}

/*****************************CLEAR/RESET*******************************************/

// Reset the boards ... clearing all values
function onClearBoard(toBeFixed=false)
{

	Logger.log("Clearing the board!");

	let can_be_cleared = (CURR_SCORE == 0) ? true : false

	if(can_be_cleared)
	{

		if(BOARD_VIEW || FAST_MONEY_VIEW){
			// Clear the current card list
			let action = (toBeFixed) ? "Fix" : "Played";
			MyTrello.clearCurrentCardList(action);
		}

		if(BOARD_VIEW)
		{
			// Show the loading GIF and hide the table
			mydoc.hideContent("#game_table");
			mydoc.showContent("#loading_gif");

			// Clear/reset the key FLAGS
			clearInPlay();
			clearSteal();
			resetFaceOff();

			// Clear the cells on the board
			clearCellsOnBoard();

			// Clear the wrong answer
			clearWrongAnswerCount();			
		}
	}
	else
	{
		alert("Cannot go to the next round until points are assigned!");
	}
	return can_be_cleared;
}

// Clear the cells on the board
function clearCellsOnBoard()
{
	// Only the board view and admin view have the cells
	if(BOARD_VIEW || ADMIN_VIEW)
	{
		// Reset aswer cells;
		cells = document.querySelectorAll(".game_cell p.answer");
		cells.forEach(function(obj){
			obj.classList.add("hidden");
			obj.classList.remove("revealed");
			obj.innerText = "";
		});

		// Reset count cells
		counts = document.querySelectorAll(".game_cell_count p");
		counts.forEach(function(obj){
			obj.classList.add("hidden");
			obj.innerText = "";
		});

		// Reset game_cell_number cells;
		numbers = document.querySelectorAll(".game_cell p.game_cell_number");
		numbers.forEach(function(obj){
			obj.classList.add("hidden");
			obj.classList.remove("circled_number");
		});

		countsCells = document.querySelectorAll(".game_cell_count");
		countsCells.forEach(function(obj){
			obj.classList.add("unseen");
		});
	}

}

// Clear the wrong answer count
function clearWrongAnswerCount()
{
	if(BOARD_VIEW){
		CURR_WRONG = 0;
		document.getElementById("wrong_answer_section").innerText = "";
	}
}

function clearInPlay()
{
	IN_PLAY = false;
	curr = Array.from(document.querySelectorAll(".in_play"));
	curr.forEach(function(obj){
		obj.classList.remove("in_play");
	});

	TEAM_IN_PLAY = "";

	// Hide the Assign Score Buttons
	// document.querySelector("#team_one button.assign_score").classList.add("hidden");
	// document.querySelector("#team_two button.assign_score").classList.add("hidden");

	// Show the Play buttons
	document.querySelector("#team_one button.team_in_play").classList.remove("hidden");
	document.querySelector("#team_two button.team_in_play").classList.remove("hidden");
}

function clearSteal()
{
	IS_STEAL = false;
	curr = Array.from(document.querySelectorAll(".can_steal"));
	curr.forEach(function(obj){
		if(!obj.classList.contains("hidden"))
		{
			obj.classList.add("hidden");
		}
	});	
}

function resetFaceOff()
{
	// Show the Face Off Section again
	IS_FACEOFF = true;
	mydoc.showContent(".face_off_element");
}
