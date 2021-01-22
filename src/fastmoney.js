
// Fast Money variables
var FAST_MONEY_SCORE = 0;

// Once doc is ready
mydoc.ready(function(){

	let path = location.pathname;

	// Set fast money path variable
	if(path.includes("/fastmoney")){ 
		FAST_MONEY_VIEW = true;
		window.addEventListener("beforeunload", onFastMoneyClosePage);
		fastMoneyListenerOnKeyUp();
	};

	// Set default time
	Timer.resetTimer();
});

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


/*****************************FAST MONEY LISTENERS**********************************/
// Prevent the page accidentally closing
function onFastMoneyClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

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

	// Set the time based on the player
	setTimeForFastMoneyPlayer(player);

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
	let time = (player == "two") ? 25 : Timer.timer_default;
	Timer.setTimerSeconds(time);
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