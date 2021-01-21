
/*****************************VARIABLES****************************************/

	// Game started?
	var GAME_STARTED = false; 

	// Check determine which views the game is in
	var ADMIN_VIEW = false;
	var BOARD_VIEW = false;
	var FAST_MONEY_VIEW = false;


	// Storing the values of the current card
	var CURR_CARD  = "";
	var CURR_QUEST = "";

	// Fast Money variables
	var FAST_MONEY_SCORE = 0;
	var countdown_timer = undefined;
	var TIMER_DEFAULT = 20;	

	// Game Board variables
	var CURR_ROUND = 0;
	var CURR_SCORE = 0;
	var CURR_WRONG = 0;
	var IS_STEAL = false;
	var IN_PLAY = false;
	var IS_FACEOFF = false;

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
		window.addEventListener("beforeunload", onClosePage);
		gameBoardListenerOnKeyUp(); 
	}

	// Set fast money path variable
	if(path.includes("/fastmoney")){ 
		FAST_MONEY_VIEW = true;
		window.addEventListener("beforeunload", onClosePage);
		fastMoneyListenerOnKeyUp();
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
			case "Enter":
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

// Adds a listener for keystrokes (on keyup);
function fastMoneyListenerOnKeyUp(){

	document.addEventListener("keyup", function(event){
		// console.log(event);
		switch(event.code)
		{
			case "Escape":
				onDuplicateAnswer();
				break;
			default:
				return;
		}
	});	
}



/****************************BOARD ACTIONS: QUESTIONS****************************************/

// Start the game
function onStartGame()
{
	GAME_STARTED = true;
	IS_FACEOFF = true;

	document.getElementById("startGameButton").classList.add("hidden");
	document.getElementById("pre_game_instructions").classList.add("hidden");

	// Show elements
	mydoc.show_section("face_off");

	document.getElementById("next_round_button").classList.remove("hidden");
	document.getElementById("fast_money_button").classList.remove("hidden");
	document.getElementById("game_table_section").classList.remove("hidden");
	document.getElementById("current_score_label").classList.remove("hidden");
	document.getElementById("current_score").classList.remove("hidden");
	document.getElementById("teamOnePlayButton").classList.remove("hidden");
	document.getElementById("teamTwoPlayButton").classList.remove("hidden");
	
	// Show

	// document.getElementById("retryButton").classList.remove("hidden");
	onNextRound();
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
			card = response[0]; //TEMP
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
		} catch(error) 
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

	// Hide the face off 

	identifier = `#team_${team} h2`;
	team_name = document.querySelector(`#team_${team} h2`);
	team_name.classList.add("in_play");

	// Clear wrong answer count if any
	clearWrongAnswerCount();

	// Show the Assign Score Buttons
	document.querySelector("#team_one button.assign_score").classList.remove("hidden");
	document.querySelector("#team_two button.assign_score").classList.remove("hidden");

	// Hide the Play buttons
	document.querySelector("#team_one button.team_in_play").classList.add("hidden");
	document.querySelector("#team_two button.team_in_play").classList.add("hidden");
	mydoc.hide_section("face_off");

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

	setTimeout(function(){
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
	},1000);
}

// Set the steal opportunity
function setStealOpportunity()
{
	let team_in_play = document.querySelector(".in_play");
	console.log(team_in_play)

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
	let rightSound = document.getElementById("right_answer_sound");
	let digit = value.replace("Digit","");

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


/**********************BOARD ACTIONS: SCORING*******************************/

// Update the score
function onUpdateScore(value){
	if(IN_PLAY || IS_FACEOFF)
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



/**********************ADMIN/BACK END ACTIONS*******************************/
// Get the card that is currently selected
function onGetCurrentQuestion()
{

	// Clear the board first
	// onClearBoard();

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
		case "Fix":
			list_id = MyTrello.to_be_fixed_list_id;
			// CURR_CARD = "";
			break;
		default:
			Logger.log("No selected moveCard value");

	} 

	// Move the card to the current Game List
	MyTrello.update_card_list(cardID, list_id, function(data){
		Logger.log("Card was moved to list = " + toList);
	});
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

/*****************************CLEAR/RESET*******************************************/


// Reset the boards ... clearing all values
function onClearBoard(toBeFixed=false)
{
	let can_be_cleared = (CURR_SCORE == 0) ? true : false

	if(can_be_cleared)
	{
		
		if(BOARD_VIEW){
			// Clear current team in play
			clearInPlay();

			// Show the Face Off Section again
			mydoc.show_section("face_off");


			// Clear the steal opportunity
			clearSteal();
		}

		if(BOARD_VIEW || FAST_MONEY_VIEW){
			// Clear the current card list
			clearCurrentCardList(toBeFixed);
		}
		
		// Reset in-play and is-steal and is
		IN_PLAY = false;
		IS_STEAL = false;
		IS_FACEOFF = true;

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
		clearWrongAnswerCount();
	}
	else
	{
		alert("Cannot clear board until the current points are assigned to a team!");
	}

	return can_be_cleared;
}

// Clear the wrong answer count
function clearWrongAnswerCount()
{
	if(BOARD_VIEW){
		CURR_WRONG = 0;
		document.getElementById("wrong_answer_section").innerText = "";
	}
}

// Clear the current list if it ever has anything in it
function clearCurrentCardList(toBeFixed=false)
{
	let action = (toBeFixed) ? "Fix" : "Played";

	MyTrello.get_cards(MyTrello.current_card_list_id, function(data){
		response = JSON.parse(data.responseText);
		if(response.length > 0)
		{
			response.forEach(function(obj){
				moveCard(obj["id"], action); 
			});
		}
	});
}


function clearInPlay()
{
	curr = Array.from(document.querySelectorAll(".in_play"));
	curr.forEach(function(obj){
		obj.classList.remove("in_play");
	});

	// Hide the Assign Score Buttons
	document.querySelector("#team_one button.assign_score").classList.add("hidden");
	document.querySelector("#team_two button.assign_score").classList.add("hidden");

	// Show the Play buttons
	document.querySelector("#team_one button.team_in_play").classList.remove("hidden");
	document.querySelector("#team_two button.team_in_play").classList.remove("hidden");
}

function clearSteal()
{
	curr = Array.from(document.querySelectorAll(".can_steal"));
	curr.forEach(function(obj){
		if(!obj.classList.contains("hidden"))
		{
			obj.classList.add("hidden");
		}
	});
	
}


/*****************************FAST MONEY LISTENERS**********************************/

// Select fast money questions
function getFastMoneyQuestions()
{
	// set fast money view
	let selected_questions = [];
	let cleared = onClearBoard();
	if(cleared)
	{
		MyTrello.get_cards(MyTrello.fast_money_pool_list_id, function(data){
			response = JSON.parse(data.responseText);
			if(response.length >= 1)
			{
				// Select 5 questions
				while(selected_questions.length < 5)
				{
					rand_id = Math.floor(Math.random()*response.length);
					card = response[rand_id];

					card_id  = card["id"];
					question = card["name"];
					checklist_id = card["idChecklists"][0];

					if(!selected_questions.includes(question))
					{
						selected_questions.push(question);

						idx = selected_questions.length;
						let quest_ele = document.querySelector(`#fast_money_question_${idx} .question`);
						quest_ele.innerText = question;

						loadFastMoneyAnswers(checklist_id, idx);

						// Move card to current list
						moveCard(card_id, "Current");
					}
				}
			}
			else
			{
				alert("NOT ENOUGH CARDS TO SELECT FROM!");
			}
		});
	}
}

// Load the fast money questions
function loadFastMoneyAnswers(checklist_id, idx)
{
	MyTrello.get_checklist(checklist_id,function(data){
		response = JSON.parse(data.responseText);
		checklist_items = response["checkItems"];

		checklist_items = checklist_items.sort(function(a,b){
			return a.pos - b.pos;
		});
		
		let answers_ele = document.querySelector(`#fast_money_question_${idx} ul`);

		checklist_items.forEach(function(obj){
			answers_ele.innerHTML += `<li>${obj["name"]}</li>`
		})
	});
}

// Listeners for fast money
function addFastMoneyListeners(event, player)
{

	// Indicate the current fast money player;
	indicateFastMoneyPlayer(event.srcElement);

	// Get the appropriate cells
	let identifier = `fast_money_player_${player}`
	let cells = Array.from(document.querySelectorAll(`#${identifier} .game_cell`));

	if(cells != undefined)
	{
		cells.forEach(function(obj){
			obj.contentEditable = true;
			// obj.classList.add("fastmoney_editable");
			obj.innerText = "... add answer ...";
			obj.addEventListener("focus", onFastMoneyFocus);
			obj.addEventListener("blur", onFastMoneyBlur);
		});

		if(player == "one")
		{
			document.getElementById("hide_player_one").classList.remove("hidden");
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

	// Add it to the clicked element;
	element.classList.add("fastmoney_curr_player");
}


// Empty the answer placeholder on focus
function onFastMoneyFocus(event)
{
	let ele = event.srcElement;
	ele.innerText = "";
}

// Hide the answer after entering
function onFastMoneyBlur(event)
{
	let ele = event.srcElement;
	value = ele.innerText;
	if(value != undefined && value != "")
	{
		ele.setAttribute("data-answer", value); 
		ele.innerText = "ANSWERED";
		// ("data-answer", value); 
		ele.contentEditable = false;
		// ele.classList.remove("fastmoney_editable");
		ele.classList.add("fastmoney_hidden");
		ele.addEventListener("click", onFastMoneyReveal);
	}
	else
	{
		ele.innerText = "... add answer ...";
	}
}

// Reveal the answer
function onFastMoneyReveal(event)
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

		ele.classList.remove("fastmoney_hidden");
		// Update the total score after entered
		sibling.addEventListener("blur", updateFastMoneyScore);
		// Focus into the answer element
		sibling.focus();
	}	
}

// Update the fast money total score
function updateFastMoneyScore(event)
{
	let ele = event.srcElement;

	let has_space = ele.innerHTML.includes("&nbsp;");
	let is_empty = ele.innerText == "";
	let value = Number(ele.innerText.replaceAll("&nbsp;", "~"));

	if(!has_space && !is_empty && !isNaN(value))
	{
		FAST_MONEY_SCORE += Number(value);
		document.getElementById("fast_money_total_score").innerText = FAST_MONEY_SCORE;
		ele.contentEditable = false;
	}
	else
	{
		alert("Enter a valid number, with no alphabet characters or spaces.");
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


// Play duplicate sound
function onDuplicateAnswer()
{
	let duplicateAnswerSound = document.getElementById("duplicate_answer_sound");
	// Play the wrong answer sound
	duplicateAnswerSound.play();
}

/*****TIMER FUNCTIONS******/

//Start the timer
function onStartTimer()
{
	toggleTimerButtons("start");

	if(!countdown_timer)
	{
		countdown_timer = setInterval(function(){
			time_ele 	= document.getElementById("timer_second");
			time_ele.contentEditable = false;
			time 		= time_ele.innerHTML;
			time 		= time.replace(" ", "");
			time 		= Number(time);
			time 		-= 1;

			// Return withot doing anything if there is an unacceptable value to display
			if (isNaN(time) || time == undefined || time == -1){ 
				// stopInterval(); 
				resetTimer();
				toggleTimerButtons("timeup");
				return; 
			} 
			new_time 	= (time < 10) ? "0" + time : time;
			time_ele.innerHTML = new_time;
			if(time == 1)
			{
				let wrongAnswerSound = document.getElementById("wrong_answer_sound");
				wrongAnswerSound.play();
			}
			if (time == 0)
			{
				setTimeColor("red");
				toggleTimerButtons("timeup");
				stopInterval();
			}
		}, 1100);
	}		
}

//Stop the timer
function onStopTimer()
{
	if(countdown_timer)
	{
		toggleTimerButtons("stop");
		stopInterval();
	}
}

function setTimeColor(color)
{
	// document.getElementById("timer_minute").style.color = color;
	document.getElementById("timer_second").style.color = color;
}

function toggleTimerButtons(state)
{
	let start = document.getElementById("timer_start");
	let stop  = document.getElementById("timer_stop");
	let reset = document.getElementById("timer_reset");

	switch(state)
	{
		case "start":
			start.style.display = "none";
			stop.style.display = "inline";
			reset.style.display = "none";
			break;
		case "timeup":
			start.style.display = "none";
			stop.style.display = "none";
			reset.style.display = "inline";
			break;
		case "stop":
			start.style.display = "inline";
			stop.style.display = "none";
			reset.style.display = "inline";
			break;
		case "reset":
			start.style.display = "inline";
			stop.style.display = "none";
			reset.style.display = "none";
			break;
		default:
			start.style.display = "inline";
			stop.style.display = "none";
			reset.style.display = "none";
	}
}

function onResetTimer(){ resetTimer(); }


function resetTimer()
{
	stopInterval();
	countdown_timer = undefined;
	toggleTimerButtons("reset");
	setTimeColor("white");
	document.getElementById("timer_second").innerHTML = TIMER_DEFAULT;
}

function stopInterval()
{
	if(countdown_timer)
	{
		clearInterval(countdown_timer);
		countdown_timer = undefined;
	}
	document.getElementById("timer_second").contentEditable = true;
}




