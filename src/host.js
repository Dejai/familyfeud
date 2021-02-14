
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
	checkTestRun();
});

// Sets a flag if this is a TEST RUN
function checkTestRun()
{
	let queryMap = mydoc.get_query_map();
	IS_TEST_RUN = (queryMap != undefined && queryMap.hasOwnProperty("test") && queryMap["test"] == "1")

	if(IS_TEST_RUN)
	{
		indicateTestRun();
	}
}

function indicateTestRun()
{
	mydoc.addTestBanner();

	// Setup the element to be passed through to the next page;
	let links = Array.from(document.querySelectorAll(".pass_through_params"));
	links.forEach(function(obj){
		obj.href += location.search;
	});
}

/***************************** LISTENERS**********************************/

function onEnterGame()
{

	var ele = document.querySelector("#game_code_section input");
	let entered_code = ele.value.toUpperCase();

	if(entered_code == "TEST")
	{
		indicateTestRun();
	}

	MyTrello.get_lists(function(data){
		response = JSON.parse(data.responseText);

		var game_found;
		for(var idx = 0; idx < response.length; idx++)
		{
			var obj = response[idx];
			let list_name = obj["name"].toUpperCase();
			let card_id = obj["id"];

			if(list_name == entered_code)
			{
				game_found = true;
				CURR_GAME_CODE = list_name;
				MyTrello.setCurrentGameListID(card_id);
				showHostSection();
				break;
			}
		}
		if(!game_found)
		{
			alert("Game Not Found with Given Game Code!");
		}
	});
}

// Get the card that is currently selected
function onGetCurrentCard()
{

	// Reset the question
	setQuestion("");
	
	// Get the current card
	MyTrello.get_cards(MyTrello.curr_game_list_id, function(data){

		response = JSON.parse(data.responseText);

		console.log(response);

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


/**************************** LOAD ****************************************/


function loadCurrentQuestion(cardId)
{
	MyTrello.get_single_card(cardId, function(data){

		response = JSON.parse(data.responseText);

		console.log(response);

		question = response["name"];
		CURR_CARD = cardId;
		CURR_ANSWERS = response["checklists"][0].checkItems;

		// Set the question:
		setQuestion(question)
	});	
}

function showHostSection()
{
	mydoc.hideContent("#game_code_section");
	mydoc.showContent("#host_view_section");
}


/*****************************CLEAR/RESET*******************************************/


function setQuestion(value)
{
	CURR_QUEST = value;
	document.getElementById("current_question").innerText = CURR_QUEST;
}