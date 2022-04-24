
/*****************************VARIABLES****************************************/

// Game started?
var GAME_STARTED = false; 
var CURR_GAME_CODE = undefined;

// Is this a a TEST run of the game
var IS_TEST_RUN = false;
var NEXT_ROUND_BUTTON_STATE = "disabled";

// Game Board variables
var CURR_ROUND = 0;
var CURR_MULTIPLIER = 1;
var CURR_SCORE = 0;
var CURR_WRONG = 0;
var CURR_TARGET_SCORE = 300;

// Flags to indicate game state
var IS_STEAL = false;
var IN_PLAY = false;
var IS_FACEOFF = false;
var TEAM_IN_PLAY = "";
var HAS_WINNER = false;

// Loading GIF
var LOADING_GIF = `<img src="https://dejai.github.io/scripts/img/loading1.gif">`

var WRONG_ANSWER_IMG = `<span style="display:inline-block; margin-right:2%;">
							<img class="wrong_answer_img" src="../assets/img/wrong_answer.png" alt="WRONG"/>
							<br/>
							<span onclick="undoWrongAnswer()" style="color:gray;" class="pointer">undo</span>
						</span>`;

/*****************************GETTING STARTED************************************/

// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	// Set the board name
	MyTrello.SetBoardName("familyfeud");

	// Load the labels
	getTrelloLabels();

	let gameCode = mydoc.get_query_param("gamecode");

	IS_TEST_RUN = checkTestRun();

	// Adds listener for game board
	if(gameCode != undefined)
	{ 

		setGameCode(gameCode);

		loading = `<img src="https://dejai.github.io/scripts/img/loading1.gif" style="width:5%;height:5%;">`
		boardNotification(loading);

		// Get the set of questions from the
		getGameQuestions(gameCode,"round",()=>{
			// Clear notificiation
			boardNotification("");

			// window.addEventListener("beforeunload", onClosePage);

			// set default timer time
			Timer.setTimerDefault(10);
			Timer.setTimeUpCallback(function(){
				document.getElementById("duplicate_answer_sound").play();
			});

			// Hide start game section
			mydoc.hideContent("#startGameSection");
			
			// Show the section to set family names
			mydoc.showContent("#enterFamilyNamesSection");

		},
		// If not successful
		()=>{
			errMsg = "Could not find a game code: " + gameCode;
			boardNotification(errMsg);
		});
	}
	else
	{
		mydoc.showContent("#startGameSection");
	}
});

// Get and map the labels available on this board
// function onGetTrelloLabels()
// {
// 	MyTrello.get_labels((data)=>{
// 		let resp = myajax.GetJSON(data.responseText);
// 		resp.forEach( (obj)=>{
// 			let labelID = obj["id"];
// 			let labelName = obj["name"];
// 			TRELLO_LABELS[labelName] = labelID;
// 		});
// 		console.log(TRELLO_LABELS);
// 	});
// }

// Set the family team names
function onSetFamilyNames()
{
	
	let fname1 = mydoc.getContent("#enterFamilyName1")?.value ?? "";
	let fname2 = mydoc.getContent("#enterFamilyName2")?.value ?? "";

	if(fname1 != "" && fname2 != "")
	{
		// Clear any messages
		boardNotification("");

		// Add the listeners
		gameBoardListenerOnKeyUp();

		// Hide the section set family names
		mydoc.hideContent("#enterFamilyNamesSection");

		// Set the team names
		mydoc.loadContent(fname1,"teamOneName");
		mydoc.loadContent(fname2, "teamTwoName");
		mydoc.showContent(".team_name_box");

		// Show the team name sections
		mydoc.showContent(".team_score");

		// Show action buttons
		mydoc.showContent(".game_action_buttons");

		// Enable the next round button
		toggleNextRoundButton('enable');

		// Show the theme song icon
		mydoc.removeClass("#themeSongIcon", "invisible");

		// Show current score section
		mydoc.showContent("#current_score_label");
		mydoc.showContent("#current_score");

	}
	else
	{
		errMsg = "Please enter a family name for both families."
		boardNotification(errMsg);
	}

}

// Start the game
function onStartGame()
{
	let gameCode = mydoc.getContent("#gameCodeValue")?.value.toUpperCase() ?? "";

	if(gameCode != "")
	{
		location.href = location.origin + location.pathname + "?gamecode="+gameCode.toUpperCase();;
	}
	else 
	{
		errMsg = "Please enter the game code as shown on the Admin page.";
		boardNotification(errMsg);
	}
}

/*****************************GENERAL LISTENERS**********************************/

// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Adds a listener for keystrokes (on keyup);
function gameBoardListenerOnKeyUp()
{
	document.addEventListener("keyup", function(event){
		switch(event.code)
		{
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

/**************************** BOARD ACTIONS: QUESTIONS****************************************/


// Reveal the game table
function showGameTable()
{
	// Hide the GIF and show the table
	mydoc.hideContent("#loading_gif");
	mydoc.showContent("#game_table");
}

// End the game - thus archiving the list
function onEndGame()
{
	let isEndGame = confirm("Are you sure you want to end the game?");
	if(isEndGame )
	{
		if( onClearBoard() )
		{

			if(IS_TEST_RUN)
			{
				alert("Resetting Cards to their Pools");

				console.log("Would move cards to the given lists")
				// MyTrello.get_cards(MyTrello.curr_game_list_id, function(data){

				// 	response = JSON.parse(data.responseText);

				// 	response.forEach(function(obj){
				// 		console.log(obj);
				// 		let card_id = obj["id"];
				// 		let labels = obj["idLabels"];
				// 		if(labels.includes(MyTrello.label_fast_money))
				// 		{
				// 			MyTrello.moveCard(card_id, "FastMoneyPool");
				// 		}
				// 		else
				// 		{
				// 			MyTrello.moveCard(card_id, "Pool");
				// 		}
				// 	});
				// });
			}
			else
			{
				let dateObj = Helper.getDate();
				let dateCode = `${dateObj["year"]}-${dateObj["month"]}-${dateObj["day"]}`;
				let new_name = `${dateCode}__${CURR_GAME_CODE}`;
				console.log("Would archive the game");
				// MyTrello.update_list_name_and_close(MyTrello.curr_game_list_id, new_name, function(data){
				// 	console.log("Game Archived");
				// });
			}
			
			// Reset Round;
			CURR_ROUND = 0;

			// Reset Game Code
			document.getElementById("game_code").innerText = "";
			mydoc.hideContent("#game_code_label_section");

			// Reset Team Scores
			document.getElementById("team_one_score").innerText = "0";
			document.getElementById("team_two_score").innerText = "0";

			// Show Start Elements
			mydoc.showContent("#startGameButton");
			mydoc.showContent(".pregame_action_buttons");

			// Hide Board elements
			mydoc.hideContent(".face_off_element");
			mydoc.hideContent(".game_action_buttons");
			mydoc.hideContent("#game_table_section");
			mydoc.hideContent(".current_score_section");
			mydoc.hideContent(".team_in_play");
		}
	}
}

/**************************** BOARD ACTIONS: LOADING QUESTIONS****************************************/

// Load the specific card id;
function loadNextQuestion()
{

	// Hide the GIF and show the table
	mydoc.hideContent("#loading_gif");
	mydoc.showContent("#game_table");
	mydoc.showContent("#game_table_section");

	if(IS_TEST_RUN)
	{
		mydoc.showContent("#howToRevealInstructions");
	}
	

	console.log("Would load the single card");

	let nextQuestion  = getNextQuestion(CURR_ROUND);
	if(nextQuestion != undefined)
	{
		checklist = nextQuestion["checklists"]?.[0]?.checkItems ?? undefined;
		if(checklist != undefined)
		{
			console.log("Loading answers");
			loadAnswers(checklist);
		}
	}
}

function loadExampleAnswers()
{
	let fakeChecklist = [];

	let count = 0;
	while(count < 8)
	{
		count++;
		let obj = {'pos':count, 'name':`Example #${count} ~ 10`}
		fakeChecklist.push(obj);
	}
	loadAnswers(fakeChecklist);
}

// Load the checklist answers from the card
function loadAnswers(checklist)
{
	try
	{
		counter = 0;

		checklist_items = checklist.sort((a,b)=>{
			return a.pos - b.pos;
		});

		checklist_items.forEach( (obj)=>{
			counter++;
			splits = obj["name"].split("~");
			answer_text = splits[0].trim();
			answer_text = (IS_TEST_RUN) ? simpleEncode(answer_text) : answer_text; //Adjust answer if in TEST mode
			answer_count = splits[1].trim();

			let answer = document.querySelector(`#game_cell_${counter} p.answer`);
			answer.innerText = answer_text;

			let count_val = document.querySelector(`#game_cell_count_${counter} p`);
			count_val.innerText = answer_count;

			let answer_number = document.querySelector(`#game_cell_${counter} p.game_cell_number`);
			answer_number.classList.remove("hidden");
			answer_number.classList.add("circled_number");
		});

		// Show the board once succesfully loaded
		showGameTable();
	} 
	catch(error) 
	{
		boardNotification("Somethign went wrong! Could not load question");
	}
}

// Switch to the next round
function onNextRound()
{
	Logger.log("Going to Next Round");

	if(NEXT_ROUND_BUTTON_STATE == "disabled"){
		return;
	}

	let hidden_cells = document.querySelectorAll("p.circled_number");
	if(hidden_cells.length > 0)
	{
		alert("Cannot go to next round until all answers are revealed!");
		return;
	}

	// Making moves based on type of round
	if(CURR_ROUND == 4 || HAS_WINNER)
	{
		location.href = location.origin + "/fastmoney";
	}
	else
	{
		// Clear the board of current answer
		cleared = onClearBoard();
		if(cleared)
		{
			// Temporarily disable button
			toggleNextRoundButton("disable");

			// Increment round
			CURR_ROUND++;
			
			// Display round information
			nextRound = "Round #" + (CURR_ROUND);
			CURR_MULTIPLIER = (CURR_ROUND <= 1) ? 1 : (CURR_ROUND - 1);
			phrase = CURR_MULTIPLIER > 1 ? `<br/><span class="multiplier_phrase">(${CURR_MULTIPLIER}x points)</span>` : "";
			document.getElementById("round_name").innerHTML = nextRound + phrase;

			if(CURR_ROUND > 0 )
			{
				label = (CURR_ROUND == QUESTION_KEYS.length) ? "FAST MONEY" : "NEXT" 
				mydoc.loadContent(`${label} ROUND`, "nextRoundButton");
			}

			// Load the next question
			loadNextQuestion();
		}
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
		img += WRONG_ANSWER_IMG;
		// `<span>
		// 			<img class="wrong_answer_img" src="../assets/img/wrong_answer.png" alt="WRONG"/>
		// 			<br/>
		// 			<span onclick="undoWrongAnswer()" style="color:gray;">undo</span>
		// 		</span>
		// `;
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

	// If no team has been set to PLAY yet
	if(!TEAM_IN_PLAY)
	{
		mydoc.showContent(".team_in_play");
		// Show the indicators
		mydoc.removeClass(".team_indicators", "invisible");
	}

	if(revealed.length >=2 && TEAM_IN_PLAY === "")
	{
		alert("Cannot reveal another answer until a team is selected to \"Play\"");
		return;
	}

	// Criteria for showing a value
	let is_hidden = Array.from(count_val.classList).includes("hidden");
	let has_value = (cell.innerText != "" && cell.innerText != undefined);

	if(is_hidden && has_value)
	{
		// Play the sound
		rightSound.play();

		// Stop the timer 
		toggleCountdownTimer(true);

		// Remove the number from board;
		number.classList.add("hidden");
		number.classList.remove("circled_number");

		// Reveal the content
		cell.classList.remove("hidden");
		cell.classList.add("revealed");
		count_val.classList.remove("hidden");
		count.classList.remove("unseen");

		// Update score and check to assign 
		onUpdateScore(count_val.innerText);
		checkToAssignScore(true);
	}
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
		// mydoc.hideContent(".team_in_play");

		// Hide the Face Off things
		mydoc.hideContent(".face_off_element");
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

// Set which team is in play
function setTeamInPlay(team)
{
	
	// If team already in play, don't do anything
	let in_play_already = document.querySelectorAll(".in_play");
	// if(in_play_already.length > 0){ return; }

	let canContinue = (in_play_already.length == 0) ? true : confirm("Are you sure you want to switch the team in Play?");

	if(canContinue)
	{

		// Always clear the team in play before setting
		clearInPlay();

		// Set IN_PLAY to true and IS_FACEOFF to false
		IN_PLAY = true; 
		IS_FACEOFF = false;

		// Set global team in play;
		TEAM_IN_PLAY = team;

		teamNameIdentifier = (team == "one") ? "#teamOneName": "#teamTwoName";
		teamIconIdentifier = (team == "one") ? "#teamOneIndicator" : "#teamTwoIndicator";

		// Set team name as in_play
		team_name = document.querySelector(teamNameIdentifier);
		team_name.classList.add("in_play");

		// Set team Icon as in_play
		teamIcon = document.querySelector(teamIconIdentifier);
		teamIcon.classList.add("in_play")

		// Clear wrong answer count if any
		clearWrongAnswerCount();
		// Hide the PLAY buttons & Face Off things
		mydoc.hideContent(".team_in_play"); 
		mydoc.hideContent(".face_off_element");
	}
}

// Set the countdown timer
function toggleCountdownTimer(forceHide=false)
{
	let timeView = document.querySelector("#time_view");

	let isHidden = (timeView.classList.contains("hidden")) ? true : false;

	if(isHidden)
	{
		timeView.classList.remove("hidden");
		mydoc.addClass("#countdownTimerIcon", "invisible");
		Timer.startTimer();
	}
	if (!isHidden || forceHide)
	{
		mydoc.removeClass("#countdownTimerIcon", "invisible");
		timeView.classList.add("hidden");
		Timer.resetTimer();
	}
}

// Undo a wrong answer set
function undoWrongAnswer()
{
	Logger.log("Undo wrong answer");
	if(CURR_WRONG > 0)
	{
		CURR_WRONG-=1;
	}

	let img = "";

	for(var idx = 0; idx < CURR_WRONG; idx++)
	{
		img += WRONG_ANSWER_IMG; 
		// `<img class="wrong_answer_img" src="../assets/img/wrong_answer.png" alt="WRONG"/>`;
	}

	document.getElementById("wrong_answer_section").innerHTML = img;

	if(IS_STEAL && CURR_WRONG == 2)
	{
		clearSteal();
	}
}


/**********************BOARD ACTIONS: SCORING*******************************/

// Update the score
function onUpdateScore(value)
{
	if(IN_PLAY || IS_FACEOFF)
	{
		CURR_SCORE += (Number(value) * CURR_MULTIPLIER);
		document.getElementById("current_score").innerText = CURR_SCORE;
		
		// Don't add score for any remaining if steal was successful and still on board
		if (CURR_WRONG == 3){ IN_PLAY = false; }
	}
}

// Give score to a certain team
function assignScore(team)
{
	// Make sure no more values are calculated
	IN_PLAY = false;
	IS_STEAL = false;
	var identifier = `team_${team}_score`;
	try
	{
		existing_score = mydoc.getContent("#"+identifier)?.innerText; 
		existing_score_num = (existing_score != undefined) ? Number(existing_score) : 0;
		newScore = existing_score_num + CURR_SCORE;
		mydoc.loadContent(newScore,identifier);

		// Clear the score keeper
		CURR_SCORE = 0;
		document.getElementById("current_score").innerText = "0";

		clearWrongAnswerCount();

		// Enable the button to go to next round
		let hidden_cells = document.querySelectorAll("p.circled_number");
		if(hidden_cells.length == 0)
		{
			toggleNextRoundButton('enable');
		}

		// Check to see if winner
		checkForWinner();
	}
	catch(error)
	{
		Logger.log(error);
		console.log(error);
	}
}

// Check who to assign the score too
function checkToAssignScore(isCorrect)
{

	let hidden_cells = document.querySelectorAll("p.circled_number");

	Logger.log("IN_PLAY: " + IN_PLAY);
	Logger.log("IS_STEAL: " + IS_STEAL);
	Logger.log("isCorrect: " + isCorrect);
	Logger.log("Hidden Cells: " + hidden_cells.length);

	let assigne_to_team = "";
	let delay = 2000;  // delay for seconds

	if(!IN_PLAY && IS_STEAL && isCorrect)
	{
		let opposite_team = (TEAM_IN_PLAY == "one") ? "two" : "one";
		setTimeout(function(){assignScore(opposite_team)}, delay);
	}
	else if(IN_PLAY && hidden_cells.length == 0)
	{
		setTimeout(function(){assignScore(TEAM_IN_PLAY)}, delay);
	}
	else if(!IN_PLAY && CURR_WRONG > 3)
	{
		setTimeout(function(){assignScore(TEAM_IN_PLAY)}, delay);
	}
	else if (hidden_cells.length == 0)
	{
		toggleNextRoundButton('enable');
	}	
}

// Check to see if a team has won
function checkForWinner()
{
	let teamOneScore = mydoc.getContent("#team_one_score")?.innerText ?? "0";
	let teamTwoScore = mydoc.getContent("#team_two_score")?.innerText ?? "0";

	HAS_WINNER = (Number(teamOneScore) > CURR_TARGET_SCORE) || (Number(teamTwoScore) > CURR_TARGET_SCORE);

	if(HAS_WINNER)
	{
		mydoc.loadContent(`FAST MONEY ROUND`, "nextRoundButton");
	}
}

/*****************************CLEAR/RESET*******************************************/

// Reset the boards ... clearing all values
function onClearBoard(toBeFixed=false)
{

	Logger.log("Clearing the board!");

	let can_be_cleared = (CURR_SCORE == 0) ? true : false

	if(can_be_cleared)
	{
		// Show the loading GIF and hide the table
		mydoc.hideContent("#game_table");
		mydoc.showContent("#loading_gif");

		// Hide the icons
		mydoc.addClass(".team_indicators", "invisible");

		// Clear/reset the key FLAGS
		clearInPlay();
		clearSteal();
		resetFaceOff();

		// Clear the cells on the board
		clearCellsOnBoard();

		// Clear the wrong answer
		clearWrongAnswerCount();			
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

// Clear the wrong answer count
function clearWrongAnswerCount()
{
	CURR_WRONG = 0;
	document.getElementById("wrong_answer_section").innerText = "";
}

function clearInPlay()
{
	IN_PLAY = false;
	TEAM_IN_PLAY = "";

	//  Clear team name and icon
	curr = Array.from(document.querySelectorAll(".in_play"));
	curr.forEach(function(obj){
		obj.classList.remove("in_play");
	});
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

/*****************************HELPER FUNCTIONS*******************************************/

// Set notifications on the board
function boardNotification(msg)
{
	if(msg != "")
	{
		MyNotification.notify("#notificationMessage", msg);

	}
	else 
	{
		MyNotification.clear("#notificationMessage");
	}
}


function setGameCode(value)
{
	CURR_GAME_CODE = value;
	document.getElementById("game_code").innerText = CURR_GAME_CODE;
	mydoc.showContent("#game_code_label_section");
	// mydoc.setPassThroughParameters(".pass_through_params", "gamecode", value);
}

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

function toggleNextRoundButton(state)
{
	let nextRoundButton = document.getElementById("nextRoundButton");

	if(state == "enable")
	{
		NEXT_ROUND_BUTTON_STATE = "enabled";
		// Temporarily disable button
		nextRoundButton.disabled = false;
		nextRoundButton.classList.add("dlf_button_limegreen");
		nextRoundButton.classList.remove("dlf_button_gray");

		nextRoundButton.classList.add("dlf_button_limegreen");
	}
	else
	{
		NEXT_ROUND_BUTTON_STATE = "disabled";

		// Disable button
		nextRoundButton.disabled = true;
		nextRoundButton.classList.add("dlf_button_gray");
	}
}
