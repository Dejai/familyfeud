
/****************************************************************************
	VARIABLES
****************************************************************************/
	

	// Check determine which views the game is in
	var ADMIN_VIEW = false;
	var BOARD_VIEW = false;


	// Storing the values of the current card
	var CURR_CARD  = "";
	var CURR_QUEST = "";



	var CURR_ROUND = 0;
	var CURR_SCORE = 0;
	var CURR_WRONG = 0;
	var IS_STEAL = false;
	var IN_PLAY = true;

/****************************************************************************
	GETTING STARTED
****************************************************************************/
// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	// Set admin path variable if on admin path
	if(path.includes("/admin")){ ADMIN_VIEW = true; }

	
	// Adds listener for game board
	if(path.includes("/board")){ 
		// Make sure the page doesn't close once the game starts
		window.addEventListener("beforeunload", onClosePage);

		BOARD_VIEW = true;
		listenerOnKeyUp(); 
	}
});

/****************************************************************************
	LISTENERS
****************************************************************************/
// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Adds a listener for keystrokes (on keyup);
function listenerOnKeyUp(){

	document.addEventListener("keyup", function(event){
		// console.log(event);
		switch(event.code)
		{
			case "Enter":
				document.getElementById("next_round_button").click();
				break;
			case "Escape":
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
				onRevealAnswer(event.code);
				break;
			default:
				return;
		}
	});

	
}

/****************************************************************************
	BOARD ACTIONS
****************************************************************************/

// Start the game
function onStartGame()
{
	document.getElementById("startGameButton").classList.add("hidden");
	document.getElementById("next_round_button").classList.remove("hidden");
	document.getElementById("retryButton").classList.remove("hidden");
	onNextRound();
}

// Try another question
function tryAnotherQuestion()
{
	cleared = onClearBoard();
	if(cleared){
		onSelectQuestion();
	}
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

			// Move the card to the current card
			moveCard(CURR_CARD, "Current");
		}
		else
		{
			alert("NOT ENOUGH CARDS TO SELECT FROM!");
		}
		
	});
}

// Get the card that is 
function onGetCurrentQuestion()
{

	// Clear the board first
	onClearBoard();

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

			// Immediately show answers
			// Move the card to the current card
			// moveCard(CURR_CARD, "Current");
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

// Move Card between lists
function moveCard(cardID, toList)
{
	let list_id = MyTrello.current_card_list_id;
	switch(toList)
	{
		case "Current":
			list_id = MyTrello.current_card_list_id;
			break;
		case "Played":
			list_id = MyTrello.played_list_id;
			// CURR_CARD = "";
			break;
		default:
			Logger.log("No selected moveCard value");

	} 

	// Move the card to the current Game List
	MyTrello.update_card_list(cardID, list_id, function(data){
		Logger.log("Card List ID updated");
	});
}

// Load the answers
function onLoadAnswers(checklist_id)
{
	counter = 0;

	MyTrello.get_checklist(checklist_id,function(data){
		response = JSON.parse(data.responseText);
		checklist_items = response["checkItems"];

		checklist_items = checklist_items.sort(function(a,b){
			return a.pos - b.pos;
		});
		console.log(checklist_items);

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
		// onLoadAnswers(checklist_items);
	});
}

// Indicates wrong answer
function onWrongAnswer()
{
	let wrongAnswerSound = document.getElementById("wrong_answer_sound");
	
	CURR_WRONG++;
	let img = "";

	let amount = (CURR_WRONG > 3 ) ? 1: CURR_WRONG;

	// Play the wrong answer sound
	wrongAnswerSound.play();

	for(var idx = 0; idx < amount; idx++)
	{
		// img += `<div class="wrong_answer">X</div>`
		img += `<img class="wrong_answer_img" src="../assets/img/wrong_answer3.png" alt="WRONG"/>`;
	}

	setTimeout(function(){
		document.getElementById("wrong_answer_section").innerHTML = img;
	},1000)

	// Update "steal" bool if 3 wrong
	if(CURR_WRONG == 3){ IS_STEAL = true; }

	// Update in-play if steal was wrong too;
	if (CURR_WRONG > 3){ IN_PLAY = false; }
}

// Reveals an answer
function onRevealAnswer(value)
{	
	let rightSound = document.getElementById("right_answer_sound");
	let digit = value.replace("Digit","");
	// alert("Reveal answer = " + answer);
	let number = document.querySelector(`#game_cell_${digit} p.game_cell_number`);
	let cell = document.querySelector(`#game_cell_${digit} p.answer`);
	let count = document.querySelector(`#game_cell_count_${digit}`);
	let count_val = document.querySelector(`#game_cell_count_${digit} p`);

	// Criteria
	let is_hidden = Array.from(count_val.classList).includes("hidden");
	let has_value = (cell.innerText != "" && cell.innerText != undefined);

	let show_value = (is_hidden && has_value)

	if(show_value)
	{
		if(BOARD_VIEW){
			rightSound.play(); 
		}

		setTimeout(function(){

			if(BOARD_VIEW){
				number.classList.add("hidden");
				number.classList.remove("circled_number");
			}
			
			cell.classList.remove("hidden");

			count_val.classList.remove("hidden");

			if(BOARD_VIEW){
				onUpdateScore(count_val.innerText);
			}

			count.classList.remove("unseen");
		},600)
		

	}
}

// Switch to the next round
function onNextRound()
{
	let nextRoundButton = document.getElementById("next_round_button");

	if(nextRoundButton.disabled){
		return;
	}

	cleared = onClearBoard(); //Clear the board of current answer
	if(cleared)
	{
		// Temporarily disable button
		nextRoundButton.disabled = true;

		onSelectQuestion(); // Select the next option
		nextRound = "Round #" + (CURR_ROUND+1);
		CURR_ROUND++;
		phrase = CURR_ROUND > 1 ? `<br/><span class="multiplier_phrase">(${CURR_ROUND}x points)</span>` : "";
		document.getElementById("round_name").innerHTML = nextRound + phrase;
	}

	setTimeout(function(){
		nextRoundButton.disabled = false;
	},5000);
}

// Reset the boards ... clearing all values
function onClearBoard()
{
	let can_be_cleared = (CURR_SCORE == 0) ? true : false

	if(can_be_cleared)
	{
		// Clear current team in play
		clearInPlay();

		if(BOARD_VIEW){
			clearCurrentCardList();
		}
		
		// Reset in-play and is-steal
		IN_PLAY = true;
		IS_STEAL = false;

		// Reset aswer cells;
		cells = document.querySelectorAll(".game_cell p.answer");
		cells.forEach(function(obj){
			obj.classList.add("hidden");
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

		// Clear the wrong answer
		if(BOARD_VIEW){
			CURR_WRONG = 0;
			document.getElementById("wrong_answer_section").innerText = "";
		}
		
	}
	else
	{
		alert("Cannot clear board until the current points are assigned to a team!");
	}

	return can_be_cleared;
}


// Clear the current list if it ever has anything in it
function clearCurrentCardList()
{
	MyTrello.get_cards(MyTrello.current_card_list_id, function(data){
		response = JSON.parse(data.responseText);
		if(response.length > 0)
		{
			response.forEach(function(obj){
				moveCard(obj["id"], "Played"); 
			});
		}
	});
}


// Update the score
function onUpdateScore(value){
	if(IN_PLAY)
	{
		CURR_SCORE += Number(value) * CURR_ROUND;
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

	team_ele = document.getElementById(identifier);
	existing_score = Number(team_ele.innerText);
	team_ele.innerText = Number(existing_score + CURR_SCORE)

	// Clear the score keeper
	CURR_SCORE = 0;
	document.getElementById("current_score").innerText = "0";
}

// Set which team is in play
function setTeamInPlay(team)
{
	identifier = `#team_${team} h2`;
	box = document.querySelector(identifier)
	box.classList.add("in_play");
}

function clearInPlay()
{
	curr = Array.from(document.querySelectorAll(".in_play"));
	curr.forEach(function(obj){
		obj.classList.remove("in_play");
	});

}

