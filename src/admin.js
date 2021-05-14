
/*****************************VARIABLES****************************************/

// Game started?
var CURR_GAME_CODE = undefined;

// Is this a a TEST run of the game
var IS_TEST_RUN = false;

// Storing the values of the current card
var CURR_CARD  = "";
var CURR_QUEST = "";

/*****************************GETTING STARTED************************************/

// Once doc is ready
mydoc.ready(function(){

	IS_TEST_RUN = checkTestRun();
});

/***************************** ENTERING GAME **********************************/

// Prevent the page accidentally closing
function onClosePage(event)
{
	event.preventDefault();
	event.returnValue='';
}

function onEnterGame()
{

	var ele = document.querySelector("#game_code_section input");
	let entered_code = ele.value.toUpperCase();

	if(entered_code == "TEST")
	{
		// mydoc.addTestBanner();
		mydoc.setPassThroughParameters(".pass_through_params", "test", "1");
	}

	MyTrello.get_lists(function(data){
		response = JSON.parse(data.responseText);

		var game_found;
		for(var idx = 0; idx < response.length; idx++)
		{
			var obj = response[idx];
			let list_name = obj["name"].toUpperCase();
			let list_id = obj["id"];

			if(list_name == entered_code)
			{
				game_found = true;
				CURR_GAME_CODE = list_name;
				MyTrello.setCurrentGameListID(list_id);
				setGameListId(list_id);
				setGameCode(list_name);
				showAdminSection();

				break;
			}
		}
		if(!game_found)
		{
			alert("Game Not Found with Given Game Code!");
		}
	});
}

function onExistingGame()
{

	mydoc.hideContent("#create_game_section");
	mydoc.showContent("#game_code_section");
}


/**************************** LOAD ****************************************/


// Get the card that is currently selected
function onGetCurrentCard()
{

	// Reset the question
	setQuestion("");

	// Clear the cells on the board;
	clearCellsOnBoard();
	
	// Get the current card
	MyTrello.get_cards(MyTrello.curr_game_list_id, function(data){

		response = JSON.parse(data.responseText);

		if(response.length >= 1)
		{
			card = response[0];
			card_id = card["id"];
			loadCurrentQuestion(card_id);
		}
		else
		{
			msg = "ERROR: Something went wrong;";
			if(response.length == 0){
				msg = "A card has not been selected yet; Use the game board to select the next one";
			}
			alert(msg);
		}
	});
}

// Load the Current Question from Trello
function loadCurrentQuestion(cardId)
{
	MyTrello.get_single_card(cardId, function(data){

		response = JSON.parse(data.responseText);

		question = response["name"];
		question = (IS_TEST_RUN) ? Helper.simpleEncode(question) : question; //Adjust question if in TEST mode

		CURR_CARD = cardId;
		setHallOfFameLink(CURR_CARD)
		CURR_ANSWERS = response["checklists"][0].checkItems;

		// Set the question:
		setQuestion(question);

		// Load the answers into the table; Pass true for admin view
		loadAdminAnswers(CURR_ANSWERS);
	});	
}

// Load the answers
function loadAdminAnswers(checklist)
{
	counter = 0;

	checklist_items = checklist.sort(function(a,b){
		return a.pos - b.pos;
	});

	checklist_items.forEach(function(obj){
		counter++;
		splits = obj["name"].split("~");
		answer_text = splits[0].trim();
		answer_text = (IS_TEST_RUN) ? Helper.simpleEncode(answer_text) : answer_text; //Adjust answer if in TEST mode
		answer_count = splits[1].trim();


		let answer = document.querySelector(`#game_cell_${counter} p.answer`);
		answer.innerText = answer_text;
		answer.classList.remove("hidden");
		answer.classList.add("revealed");

		let answer_number = document.querySelector(`#game_cell_${counter} p.game_cell_number`);
		answer_number.classList.remove("hidden");
		answer_number.classList.add("circled_number");

		let count_cell = document.querySelector(`#game_cell_count_${counter}`);
		count_cell.classList.remove("unseen");

		let count_val = document.querySelector(`#game_cell_count_${counter} p`);
		count_val.innerText = answer_count;
		count_val.classList.remove("hidden");
	});
}

function showAdminSection()
{
	mydoc.hideContent("#create_game_section");
	mydoc.hideContent("#game_code_section");
	mydoc.showContent("#admin_game_section");
}


/*****************************CLEAR/RESET*******************************************/
function setGameCode(value)
{
	CURR_GAME_CODE = value.toUpperCase();
	document.getElementById("game_code").innerText = CURR_GAME_CODE;
	mydoc.showContent("#game_code_label_section");
	mydoc.setPassThroughParameters(".pass_through_params", "gamecode", CURR_GAME_CODE);
}

function setGameListId(listID)
{
	CURR_GAME_LIST_ID = listID
	let links = Array.from(document.querySelectorAll(".pass_through_params"));
	console.log(links);
	links.forEach(function(obj){
		let query = (obj.href.includes("?")) ? `&listid=${listID}` : `?listid=${listID}`;
		obj.href += query;
	});	
}

function setHallOfFameLink(cardID)
{
	let link = document.querySelector("#enter_hall_of_fame");
	if(link)
	{
		mydoc.showContent("#enter_hall_of_fame");
		link.href = link.href += `?card=${cardID}`;
	}
}

function setQuestion(value)
{
	CURR_QUEST = value;
	document.getElementById("current_question").innerText = CURR_QUEST;
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


