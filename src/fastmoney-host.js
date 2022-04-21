/*****************************FAST MONEY VARIABLES **********************************/

// Fast Money variables
var FAST_MONEY_SCORE = 0;
var FAST_MONEY_VIEW = false;

var IS_TEST_RUN = false;

var NUMBER_OF_ANSWERS = 0;
var CURRENT_PLAYER = "one";

var active_element = undefined;
var blinking_interval = undefined;

var LOADING_GIF = `<img src="https://dejai.github.io/scripts/img/loading1.gif">`


/***************************** GETTING STARTED **********************************/

// Once doc is ready
mydoc.ready(function(){

	// Set the board name
	MyTrello.SetBoardName("familyfeud");

	// Load the labels
	getTrelloLabels();

	//Check Test run
	IS_TEST_RUN = checkTestRun();

	// Get the game code from the URL (if available)
	let query_map = mydoc.get_query_map();
	let gameCode = query_map["gamecode"] ?? undefined;

	// Show loading gif while getting things together
	MyNotification.notify("#loadingSection", LOADING_GIF);


	if(gameCode != undefined)
	{

		// Get the set of questions from the current list
		getGameQuestions(gameCode,"fast money",()=>{


			// Show the admin view;
			mydoc.showContent("#back_to_host"); 
			mydoc.showContent("#game_action_buttons .fastmoney_host"); 
			mydoc.showContent(".fastmoney_reveal_answers");
			mydoc.hideContent(".fastmoney_answers");

			// Set the game code where it should be set;
			setGameCode(gameCode);

			// Load the game questions
			loadFastMoneyQuestions()

			// Hide loading;
			MyNotification.clear("#loadingSection");

			// Show game section
			mydoc.showContent("#questionsSection");

		},
		// If not successful
		()=>{
			errMsg = "Could not find a game code: " + gameCode;
			MyNotification.notify("#loadingSection", errMsg);
		});
	}
	else
	{
		MyNotification.notify("#loadingSection", "Cannot load this page without a Game Code");
	}
});

// Load the questions
function loadFastMoneyQuestions()
{

	for(var idx=0; idx < QUESTION_KEYS.length; idx++)
	{
		let question = QUESTIONS[ QUESTION_KEYS[idx] ];

		ctr = idx+1

		let questionText = question["name"];
		let quest_ele = document.querySelector(`#fast_money_question_${ctr} .question`);
		//question = (IS_TEST_RUN) ? Helper.simpleEncode(question) : question; //Adjust question if in TEST mode		
		quest_ele.innerText = questionText;

		let answers_ele = document.querySelector(`#fast_money_question_${ctr} ul.fastmoney_answers`);
		answers = question["checklists"]?.[0]?.checkItems ?? [];
		answers.forEach(function(obj){
			let answer_text = (IS_TEST_RUN) ? Helper.simpleEncode(obj["name"]) : obj["name"]; //Adjust answer if in TEST mode
			answers_ele.innerHTML += `<li>${answer_text}</li>`
		});

	}
}

// Toggle the answers
function onToggleAnswersForHost(event)
{
	var ele = event.target;
	sibling = ele.nextElementSibling;
	
	if(sibling.classList.contains("hidden"))
	{
		sibling.classList.remove("hidden");
		ele.innerText = "Hide Answers";
	}
	else
	{
		sibling.classList.add("hidden");
		ele.innerText = "Reveal Answers";
	}
}






function setGameCode(value)
{
	CURR_GAME_CODE = value.toUpperCase();
	document.getElementById("game_code").innerText = CURR_GAME_CODE;
}