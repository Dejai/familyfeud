/*****************************FAST MONEY VARIABLES **********************************/

// Fast Money variables
var FAST_MONEY_SCORE = 0;
var FAST_MONEY_VIEW = false;

var IS_TEST_RUN = false;

var NUMBER_OF_ANSWERS = 0;
var CURRENT_PLAYER = "one";

var active_element = undefined;
var blinking_interval = undefined;


/***************************** GETTING STARTED **********************************/

// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	let query_map = mydoc.get_query_map();
	
	
	// Check if admin
	checkAdmin(query_map)

	// Check for the game code
	checkGameCode();


	// Set fast money path variable
	if(path.endsWith("fastmoney") || path.endsWith("fastmoney/")){ 
		FAST_MONEY_VIEW = true;
		window.addEventListener("beforeunload", onFastMoneyClosePage);
		fastMoneyListenerOnKeyUp();

		checkTestRun();

		// Set default time & buzzer sound
		Timer.resetTimer();
		if(Timer)
		{
			Timer.resetTimer();			
			Timer.setTimeUpCallback(function(){
				document.getElementById("wrong_answer_sound").play();
			});
		}
	}
	else 
	{
		checkGameListID();
	}
});

// Check if admin or host
function checkAdmin(query_map)
{
	let is_admin = (query_map.hasOwnProperty("admin") && query_map["admin"] == 1);

	if(is_admin)
	{ 
		mydoc.showContent("#back_to_admin"); 
		mydoc.showContent("#game_action_buttons .fastmoney_admin"); 
		mydoc.showContent(".fastmoney_answers");
	}
	else 
	{ 
		mydoc.showContent("#back_to_host"); 
		mydoc.showContent("#game_action_buttons .fastmoney_host"); 
		mydoc.showContent(".fastmoney_reveal_answers");
	}
}

// Check the query param for game code
function checkGameCode()
{
	let query_map = mydoc.get_query_map();
	if(query_map.hasOwnProperty("gamecode"))
	{
		setGameCode(query_map["gamecode"]);
	}
	else
	{
		alert("Game Code not provided. :( ");
	}
}

// Checks if the game list ID is set
function checkGameListID()
{
	let query_map = mydoc.get_query_map();
	if(query_map.hasOwnProperty("listid"))
	{
		MyTrello.curr_game_list_id = query_map["listid"];
	}
	else
	{
		alert("Game ID not provided. :( ");
	}
}

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

// Adds a listener for keystrokes (on keyup);
function fastMoneyListenerOnKeyUp()
{

	document.addEventListener("keyup", function(event){
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
				if(active_element)
				{
					event.preventDefault();
					active_element.blur();
					active_element = undefined;
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

// Hide the answer after entering
function onFastMoneyAnswerBlur(event)
{
	let ele = event.srcElement;
	value = ele.innerText;
	if(value != undefined && value != "")
	{
		ele.setAttribute("data-answer", value); 
		ele.innerText = "ANSWERED";
		// Increment # of answers & check if all entered
		NUMBER_OF_ANSWERS++;
		checkAnswersAndTimer();

		// ("data-answer", value); 
		ele.contentEditable = false;
		// ele.classList.remove("fastmoney_editable");
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
		// Update the total score after entered
		sibling.addEventListener("focus", blinkingFastMoneyScore);
		sibling.addEventListener("blur", onFastMoneyRevealScore);
		// Focus into the answer element
		sibling.focus();
	}	
}


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

/***************************** LOADING QUESTIONS / ANSWERS **********************************/

// Select fast money questions
function selectFastMoneyQuestions(idx=0)
{
	console.log(idx);
	if(idx == 5)
	{
		setTimeout(function(){
			loadFastMoneyQuestions()
			mydoc.hideContent("#loading_gif");
			return;
		}, 2000);
	}
	else
	{
		mydoc.showContent("#loading_gif");

		MyTrello.get_cards(MyTrello.fast_money_pool_list_id, function(data){

			console.log(data)

			response = JSON.parse(data.responseText);

			rand_id = Math.floor(Math.random()*response.length);
			card = response[rand_id];
			console.log(card);
			card_id  = card["id"];
			MyTrello.moveCard(card_id, "Current");

			selectFastMoneyQuestions(idx+1);
		});
	}
}

function loadFastMoneyQuestions()
{
	// Clear the current list first (if any)
	clearFastMoneyQuestions();

	MyTrello.get_cards(MyTrello.curr_game_list_id, function(data){

		console.log("Loading Questions");

		response = JSON.parse(data.responseText);
		if(response.length >= 5)
		{
			for(var idx = 0; idx < 5; idx++)
			{
				card = response[idx];
				card_id = card["id"];
				loadCard(card_id, idx+1);
			}
			// Hide the loading gif
			mydoc.hideContent("#loading_gif");
		}
	});
}

function loadCard(card_id, idx)
{
	MyTrello.get_single_card(card_id, function(data){

		response = JSON.parse(data.responseText);

		question = response["name"];
		answers = response["checklists"][0].checkItems;
		answers = answers.sort(function(a,b){
			return a.pos - b.pos;
		});
		
		let quest_ele = document.querySelector(`#fast_money_question_${idx} .question`);
		quest_ele.innerText = question;

		let answers_ele = document.querySelector(`#fast_money_question_${idx} ul.fastmoney_answers`);
		answers.forEach(function(obj){
			answers_ele.innerHTML += `<li>${obj["name"]}</li>`
		});


	});
}

function onShowAnswersForHost(event)
{
	var ele = event.target;
	console.log(ele);
	sibling = ele.nextElementSibling;
	sibling.classList.remove("hidden");

}

/***************************** HELPER FUNCTIONS **********************************/

// Blinking score before reveal
function blinkingFastMoneyScore(event)
{
	let ele = event.srcElement;
	active_element = ele; 
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


// Clear the current list of fast money questions
function clearFastMoneyQuestions()
{
	Array.from(document.querySelectorAll(".question_section")).forEach(function(obj){
		obj.querySelector(".question").innerText = "";
		obj.querySelector("ul").innerHTML = "";
	});
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
			// obj.classList.add("fastmoney_editable");
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
	CURR_GAME_CODE = value.toUpperCase();
	document.getElementById("game_code").innerText = CURR_GAME_CODE;
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

// Update the fast money total score
function updateFastMoneyScore(value)
{
	FAST_MONEY_SCORE += Number(value);
	document.getElementById("fast_money_total_score").innerText = FAST_MONEY_SCORE;
}
