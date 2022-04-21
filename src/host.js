
/*****************************VARIABLES****************************************/

// Game started?
var CURR_GAME_CODE = undefined;

// Is this a a TEST run of the game
var IS_TEST_RUN = false;

// Storing the values of the current card
var CURR_CARD  = "";
var CURR_QUEST = "";

var CURR_ROUND = 0;

var LOADING_GIF = `<img src="https://dejai.github.io/scripts/img/loading1.gif">`


/*****************************GETTING STARTED************************************/

// Once doc is ready
mydoc.ready(function(){

	// Set the board name
	MyTrello.SetBoardName("familyfeud");

	// Load the labels
	getTrelloLabels();

	IS_TEST_RUN = checkTestRun();

	// Get the game code from the URL (if available)
	let query_map = mydoc.get_query_map();
	let gameCode = query_map["gamecode"] ?? undefined;

	if(gameCode != undefined)
	{
		// Show loading gif while getting things together
		MyNotification.notify("#loadingSection", LOADING_GIF);

		// Get the set of questions from the
		getGameQuestions(gameCode,"round",()=>{

			// Set the game code where it should be set;
			setGameCode(gameCode);

			// Hide loading;
			MyNotification.clear("#loadingSection");

			// Show game section
			mydoc.hideContent("#game_code_section");
			mydoc.showContent("#host_view_section");
		},
		// If not successful
		()=>{
			errMsg = "Could not find a game code: " + gameCode;
			MyNotification.notify("#loadingSection", errMsg);
		});
	}
	else
	{
		// Show the admin how many questions are left
		mydoc.showContent("#game_code_section");
	}
});

/***************************** LISTENERS**********************************/

function onEnterGame()
{


	var ele = document.querySelector("#game_code_section input");
	let entered_code = ele.value.toUpperCase();

	// Show loading GIF
	MyNotification.notify("#loadingSection", LOADING_GIF);


	let errMsg = "Could not find game code: " + entered_code;

	MyTrello.get_list_by_name(entered_code, (listData)=>{
		let resp = myajax.GetJSON(listData.responseText);

		console.log(resp);
		if(resp.length > 0)
		{
			location.href = location + "?gamecode="+entered_code.toUpperCase();
		}
		else
		{
			MyNotification.notify("#loadingSection", errMsg);
		}
	},()=>{
		MyNotification.notify("#loadingSection", errMsg);
	});

	// if(entered_code == "TEST")
	// {
	// 	// mydoc.addTestBanner();
	// 	mydoc.setPassThroughParameters(".pass_through_params", "test", "1");
	// }

	// MyTrello.get_lists(function(data){
	// 	response = JSON.parse(data.responseText);

	// 	var game_found;
	// 	for(var idx = 0; idx < response.length; idx++)
	// 	{
	// 		var obj = response[idx];
	// 		let list_name = obj["name"].toUpperCase();
	// 		let list_id = obj["id"];

	// 		if(list_name == entered_code)
	// 		{
	// 			game_found = true;
	// 			CURR_GAME_CODE = list_name;
	// 			MyTrello.setCurrentGameListID(list_id);
	// 			mydoc.setPassThroughParameters(".pass_through_params", "listid", list_id);	
	// 			setGameCode(list_name);
	// 			showHostSection();
	// 			break;
	// 		}
	// 	}
	// 	if(!game_found)
	// 	{
	// 		alert("Game Not Found with Given Game Code!");
	// 	}
	// });
}

// Going to the next round;
function onNextRound(increment=1)
{

	Logger.log("Going to Next Round");

	// Increment round
	CURR_ROUND += increment;
	
	// Display round information
	nextRound = "Round #" + (CURR_ROUND);
	CURR_MULTIPLIER = (CURR_ROUND <= 1) ? 1 : (CURR_ROUND - 1);
	phrase = CURR_MULTIPLIER > 1 ? `<br/><span class="multiplier_phrase">(${CURR_MULTIPLIER}x points)</span>` : "";
	document.getElementById("round_name").innerHTML = nextRound + phrase;

	if(CURR_ROUND > 0 )
	{
		mydoc.loadContent(`NEXT ROUND`, "nextRoundButton");
		mydoc.showContent("#playFastMoneyLink");
	}

	// Load the next question
	loadNextQuestion();

	// Hide/show the next/prev round buttons accordingly. 
	let prevButtonState = (CURR_ROUND > 1) ? mydoc.showContent("#prevRoundButton") : mydoc.hideContent("#prevRoundButton");
	let nextButtonState = (CURR_ROUND < 4) ? mydoc.showContent("#nextRoundButton") : mydoc.hideContent("#nextRoundButton");
}


/**************************** LOAD ****************************************/

// Load the specific card id;
function loadNextQuestion()
{
	let nextQuestion  = getNextQuestion(CURR_ROUND);

	if(nextQuestion != undefined)
	{

		// Set the question text;
		let questionText = nextQuestion["name"] ?? "N/A";
		// question = (IS_TEST_RUN) ? Helper.simpleEncode(question) : question; //Adjust question if in TEST mode
		mydoc.loadContent(questionText, "current_question");
	}
}


/*****************************CLEAR/RESET*******************************************/
function setGameCode(value)
{
	CURR_GAME_CODE = value.toUpperCase();
	document.getElementById("game_code").innerText = CURR_GAME_CODE;
	mydoc.showContent("#game_code_label_section");

	// Set the code in the link to play fast money
	let fastMoneyLink = document.getElementById("playFastMoneyLink");
	fastMoneyLink.href += `&gamecode=${CURR_GAME_CODE}`;
}

function setQuestion(value)
{
	CURR_QUEST = value;
	document.getElementById("current_question").innerText = CURR_QUEST;
}