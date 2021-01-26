
// Fast Money variables
var FAST_MONEY_SCORE = 0;
var FAST_MONEY_VIEW = false;

var NUMBER_OF_ANSWERS = 0;

var active_element = undefined;
var blinking_interval = undefined;

// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	// Set fast money path variable
	if(path.endsWith("fastmoney") || path.endsWith("fastmoney/")){ 
		FAST_MONEY_VIEW = true;
		window.addEventListener("beforeunload", onFastMoneyClosePage);
		fastMoneyListenerOnKeyUp();

		// Set default time & buzzer sound
		Timer.resetTimer();
		if(Timer)
		{
			Timer.resetTimer();			
			Timer.setTimeUpCallback(function(){
				document.getElementById("wrong_answer_sound").play();
			});
		}
	};
});

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

/*****************************FAST MONEY LISTENERS**********************************/
// Prevent the page accidentally closing
function onFastMoneyClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

// Clear the current list of fast money questions
function clearFastMoneyQuestions()
{
	Array.from(document.querySelectorAll(".question_section")).forEach(function(obj){
		obj.querySelector(".question").innerText = "";
		obj.querySelector("ul").innerHTML = "";
	});
}

function sortFastMoneyQuestions(list)
{
	list
}

// Select fast money questions
function selectFastMoneyQuestions()
{
	// Clear the current list
	MyTrello.clearCurrentCardList();

	// Disable button
	document.getElementById("load_fast_money_questions").disabled = true;

	// Show loading gif
	mydoc.show_section("loading_gif");
	
	MyTrello.get_cards(MyTrello.fast_money_pool_list_id, function(data){
		response = JSON.parse(data.responseText);
		if(response.length >= 5)
		{
			// Load 5 questions
			for(var idx = 0; idx < 5; idx++)
			{
				rand_id = Math.floor(Math.random()*response.length);
				card = response[rand_id];
				card_id  = card["id"];
				// Move card to current list
				MyTrello.moveCard(card_id, "Current");
			}

			setTimeout(function(){ loadFastMoneyQuestions(); }, 1500);
		}
		else
		{
			alert("SORRY! Not Enough Cards to Select From. The Admin needs to add more!");
		}
	});
}

// Load the questions (make sure they are sorted)
function loadFastMoneyQuestions()
{
	// Clear the question on the board;
	clearFastMoneyQuestions();

	MyTrello.get_cards(MyTrello.current_card_list_id, function(data){
		response = JSON.parse(data.responseText);

		let idx = 1;

		console.log(response);

		response = response.sort(function(a,b){
			return a.pos - b.pos;
		});
		console.log(response);

		response.forEach(function(card){

			console.log(card["pos"]);

			let isFastMoneyCard = card["idLabels"].includes(MyTrello.label_fast_money);

			if(isFastMoneyCard)
			{
				let question = card["name"];
				let checklist_id = card["idChecklists"][0];

				let quest_ele = document.querySelector(`#fast_money_question_${idx} .question`);
				quest_ele.innerText = question;

				loadFastMoneyAnswers(checklist_id, idx);

				idx++; //increment counter;
			}
		});
		
		// Hide the loading gif once done;
		mydoc.hide_section("loading_gif");
	});
}

// Load the fast money checklist answers based on given checklist ID
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
function setCurrentPlayer(event, player)
{

	// Indicate the current fast money player;
	indicateFastMoneyPlayer(event.srcElement);

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

// Sets the time based on the player
function setTimeForFastMoneyPlayer(player)
{
	let time = (player == "two") ? 25 : 20;
	Timer.setTimerDefault(time);
	mydoc.show_section("time_view");
}

function toggleFastMoneyTimer(forceStop=false)
{
	if(Timer.countdown_timer == undefined)
	{
		mydoc.show_section("time_view");
		Timer.startTimer();
	} 
	if(Timer.countdown_timer || forceStop) 
	{
		mydoc.hide_section("time_view");
		Timer.resetTimer();
	}
}

// If all answers entered, stop the timer
function checkAnswersAndTimer()
{
	if(NUMBER_OF_ANSWERS == 5)
	{
		toggleFastMoneyTimer(true);
	}
}

/***** Fast Money Listeners for Answers *****/
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
		if(value > 0){ document.getElementById("fast_money_points").play(); }
		if(value == 0){ document.getElementById("fast_money_zero").play(); }
		// Stop the blinking
		clearInterval(blinking_interval);
		ele.classList.remove("blinking");
		updateFastMoneyScore(value);
	}
	else
	{
		alert("Enter a valid number, with no alphabet characters or spaces.");
	}
}

// Update the fast money total score
function updateFastMoneyScore(value)
{
	FAST_MONEY_SCORE += Number(value);
	document.getElementById("fast_money_total_score").innerText = FAST_MONEY_SCORE;
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