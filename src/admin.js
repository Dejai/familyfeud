
/*****************************VARIABLES****************************************/

// Game started?
var CURR_GAME_CODE = undefined;

// Is this a a TEST run of the game
var IS_TEST_RUN = false;

// Storing the values of the current card
var CURR_CARD  = "";
var CURR_QUEST = "";

var CURR_ROUND = 0;

// The loading gif
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
			mydoc.showContent("#admin_game_section");
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
		mydoc.showContent("#newGameSection");
		getCountOfCardsAvailable();
	}

});

/***************************** ENTERING GAME **********************************/

// Get the total amount of cards available to play with
function getCountOfCardsAvailable()
{
	// Get count of regular questions
	getPoolQuestions("Pool", (response)=>{
		mydoc.loadContent(response.length, "regularQuestionsAvailable");
		QUESTION_POOL["regular"] = response;

		if(QUESTION_POOL["fastMoney"].length > 0)
		{
			mydoc.showContent("#newGameButton");
		}
	});

	// Get count of fast money questions
	getPoolQuestions("Fast Money Pool", (response)=>{
		mydoc.loadContent(response.length, "fastMoneyQuestionsAvailable");
		QUESTION_POOL["fastMoney"] = response;

		if(QUESTION_POOL["regular"].length > 0)
		{
			mydoc.showContent("#newGameButton");
		}
	});
}

// Create a new game - including setting up a new list
function onNewGame()
{
	// First setup a new list
	let gameCode = Helper.getCode(4);
	console.log("Game Code: " + gameCode);

	let regularQuestions = selectRandomPoolQuestions("regular",4);
	let fastMoneyQuestions = selectRandomPoolQuestions("fastMoney",5);

	let allQuestions = regularQuestions.concat(fastMoneyQuestions);

	// Show loading gif
	MyNotification.notify("#loadingSection", LOADING_GIF);

	MyTrello.create_list(gameCode, (newListData)=>{
		
		let newListResp = myajax.GetJSON(newListData.responseText);
		newListID = newListResp?.id

		if(newListID != undefined)
		{

			let cardsMoved = 0;

			allQuestions.forEach((card)=>{
				MyTrello.update_card_list(card.id, newListID, (data)=>{

					cardsMoved += 1;

					if(cardsMoved == allQuestions.length)
					{
						location.href = location + "?gamecode="+gameCode.toUpperCase();
					}
				});
			});
		}
	});
}

// Going to the next round;
function onNextRound(increment=1)
{

	Logger.log("Going to Next Round");

	// Clear the board of current answer
	cleared = onClearBoard();

	if(cleared)
	{
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
}

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

		// Setup the Hall of Fame answer option;
		CURR_CARD = nextQuestion["id"] ?? undefined;
		setHallOfFameLink(CURR_CARD);


		// Load the answers (already visible);
		checklist = nextQuestion["checklists"]?.[0]?.checkItems ?? undefined;
		if(checklist != undefined)
		{
			console.log("Loading answers");
			loadAdminAnswers(checklist);
		}

		// Show the section
		mydoc.showContent("#gameQuestionAndAnswerSection");

		// If not the first round, show previous round button

	}
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

/*****************************CLEAR/RESET*******************************************/
function setGameCode(value)
{
	CURR_GAME_CODE = value.toUpperCase();
	
	mydoc.loadContent(CURR_GAME_CODE, "game_code");
	mydoc.showContent("#game_code_label_section");

	// Set the code in the link to play fast money
	let fastMoneyLink = document.getElementById("playFastMoneyLink");
	fastMoneyLink.href += `&gamecode=${CURR_GAME_CODE}`;
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
		link.href = `../hof/?card=${cardID}`;
	}
}

// Clear the cells on the board
function onClearBoard()
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

	return true;
}


