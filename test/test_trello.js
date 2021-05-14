function test_trello()
{
	let entity = document.getElementById("entity").value;
	let id = document.getElementById("entity_id").value;
	switch(entity)
	{
		case "boards":
			MyTrello.get_boards(print_data)
			break;
		case "custom-fields":
			MyTrello.get_custom_fields(print_data);
			break;
		case "labels":
			MyTrello.get_labels(print_data);
			break;
		case "lists":
			MyTrello.get_lists(print_data);
			break;
		case "list-create":
			MyTrello.create_list("Test Trello List", print_data);
			break;
		case "checklists":
			if(id != undefined && id != "")
			{
				MyTrello.get_checklist(id, print_data);
			} else
			{
				alert("Need Checklist ID");
			}
			break;
		case "cards":
			if(id != undefined && id != "")
			{
				MyTrello.get_cards(id, print_data);
			} else
			{
				alert("Need List ID for card");
			}
			break;
		
		case "card":
			if(id != undefined && id != "")
			{
				MyTrello.get_single_card(id, print_data);
			} else
			{
				alert("Need Card ID");
			}
			break;
		case "card-actions":
			if(id != undefined && id != "")
			{
				MyTrello.get_card_actions(id, print_data);
			} else
			{
				alert("Need Card ID");
			}
			break;
		case "card-create":
			if(id != undefined && id != "")
			{
				MyTrello.list_id = MyTrello.recently_added_list_id;
				MyTrello.create_card("Trello Testing", undefined, print_data);
			} else
			{
				alert("Need List ID");
			}
			break;
		case "card-update":
			if(id != undefined && id != "")
			{
				MyTrello.update_card(id, "Newest Comment", print_data);
			} else
			{
				alert("Need List ID");
			}
			break;
		case "closed-cards":
			MyTrello.get_all_closed_cards(print_data);
			break;
		default:
			alert("Not a valid option");
	}
}

function print_data(data){
	let response = JSON.parse(data.responseText);
	console.log(data);
	console.log(response);

	document.getElementById("test_results").innerHTML = "";

	// console.log(typeof(response));
	let isArray = Array.isArray(response);
	let isObject = (typeof(response) == "object")
	// console.log(isArray);
	if (isArray)
	{
		response.forEach(function(obj){
			let format = `<p>${obj["name"]} -- ( ${obj["id"]} )</p>` ;
			document.getElementById("test_results").innerHTML += format;
		});
	}
	else if (isObject)
	{
		let format = `<p>${response["name"]} -- ( ${response["id"]} )</p>` ;
		document.getElementById("test_results").innerHTML += format;
	}	
}


/********* VARIABLES *******/

var SOURCE = [];
var QUESTIONS = { "season":"", "8":[], "7":[], "6":[], "5":[], "4":[], "fastmoney":[], "ALL":[]};
var SOURCE_QUESTIONS_MAP = {}

var CARDS = [];
var CARDS_MAP = {};

var MISSING = {};
var CREATE_QUEUE = {};

var SEARCH_TYPE = "";

var IS_SOURCE_SEARCH = false;




mydoc.ready(function(){
	setSeasonOptions();
	// console.log(Helper.getCode());
});





// Cleans data to replace common issues
function clean_data(data)
{
	let cleaned_data = "";
	if(data != undefined)
	{
		cleaned_data = data.replaceAll("\"",""); // Replace quotation marks
		cleaned_data = cleaned_data.replaceAll("\&", "AND") // Replace ampersands
		cleaned_data = cleaned_data.replaceAll("NULL", "") // Replace all NULLS
		cleaned_data = cleaned_data.replaceAll(/\s{2,7}/g, " ") // Replace double spaces
		cleaned_data = cleaned_data.replaceAll("... ", "...") // Replace elipses (include a space)
		cleaned_data = cleaned_data.trim();
	}
	return cleaned_data;
}

// Loads All Cards ever created
function getAllCards()
{

	mydoc.showContent("#loading_gif");

	document.getElementById("loadAllCardsButton").disabled = true;


	var closedLists = []
	// First, get all the closed lists
	MyTrello.get_closed_lists(function(data){

		lists = JSON.parse(data.responseText);
		lists.forEach(function(obj){
			closedLists.push(obj["id"])
		});


		// Then get all the cards
		MyTrello.get_all_cards(function(data){
			response = JSON.parse(data.responseText);
			

			openCount = 0;
			fastMoneyCount = 0;
			closedCount = 0;

			// Set the cards map
			response.forEach(function(card){
				cardName = clean_data(card["name"]);
				listID = card["idList"];
				labels = card["idLabels"]
				
				let isClosed = closedLists.includes(listID) || card["closed"];
				let isFastMoney = labels.includes(MyTrello.label_fast_money);
				openCount += (!isClosed && !isFastMoney) ? 1 : 0;
				fastMoneyCount += (!isClosed && isFastMoney) ? 1 : 0;
				closedCount += (isClosed) ? 1 : 0;

				CARDS.push(cardName);
				CARDS_MAP[cardName] = card;
			});

			// Set the labels
			document.getElementById("total_games_count").innerText = `${lists.length}`;

			let openCardsLabel = document.getElementById("open_cards_count");
			if(openCardsLabel){	openCardsLabel.innerHTML = `${openCount}`; }

			let fastMoneyCardsLabel = document.getElementById("open_fastmoney_count");
			if(fastMoneyCardsLabel){ fastMoneyCardsLabel.innerHTML = `${fastMoneyCount}`; }

			let closedCardsLabel = document.getElementById("closed_cards_count");
			if(closedCardsLabel){ closedCardsLabel.innerHTML = `${closedCount}`; }

			let totalCardsLabel = document.getElementById("total_cards_count");
			if(totalCardsLabel){ totalCardsLabel.innerHTML = `${response.length}`; }

			// Hide loading gif
			mydoc.hideContent("#loading_gif");

			// Show loading gif
			mydoc.showContent("#select_season_subsection");
			mydoc.showContent("#search_cards_subsection");

		});
	});
}


// Get the set of cards from the Question Bank list
function setSeasonOptions()
{
	let seasonSelect = document.querySelector("select[name='season']");

	if(seasonSelect)
	{
		MyTrello.get_cards(MyTrello.question_bank_list_id, function(data){
			var response = JSON.parse(data.responseText);

			response.forEach(function(card){
				let id = card["id"];
				let name = card["name"];
				let season = name.split(" ")[1];
				if(name.includes("Season")){
					seasonSelect.innerHTML += `<option value='${id}' data-season='${season}'>${name}</option>`;				
				}
			});
		});
	}
}

function getSelectedSeason()
{

	var selectedSeason = undefined;

	let seasonSelect = document.querySelector("select[name='season']");
	let optionSelect = document.querySelector("select[name='season'] option:checked");
	
	if(seasonSelect && seasonSelect.value != '' && optionSelect)
	{
		selectedSeason = optionSelect.getAttribute("data-season");
	}

	return selectedSeason;
}


// Get attachment(s) from card - based on selected season
function getAttachmentsFromCard()
{
	mydoc.showContent("#loading_gif");

	let seasonSelect = document.querySelector("select[name='season']");
	let optionSelect = document.querySelector("select[name='season'] option:checked");
	if(seasonSelect != undefined && seasonSelect.value != '' && optionSelect)
	{

		// Clear out the previous table values
		let cells = Array.from(document.querySelectorAll(".question_bank_table_cell"))

		if(cells)
		{
			cells.forEach(function(cell){
				cell.innerText = "";
			});
		}

		let cardID = seasonSelect.value;
		var seasonNum = optionSelect.getAttribute("data-season");
		// QUESTIONS["season"] = seasonNum;

		MyTrello.get_card_attachments(cardID, function(data){
			var response = JSON.parse(data.responseText);
			response.forEach(function(attachment){
				let numAnswers = attachment["name"].split("_")[1];
				let attachmentURL = attachment["url"];
				loadQuestionsFromCSV(numAnswers, seasonNum, attachmentURL);
			});

			// Hide the gif
			mydoc.hideContent("#loading_gif");

			// Show the results
			mydoc.showContent("#season_results_subsection");

		});

	}
}

// Loads the set of questions from the CSV attachment
function loadQuestionsFromCSV(numAnswers, seasonNum, attachmentURL)
{

	myajax.AJAX({
		method:"GET",
		path: attachmentURL,
		success: function(data){
			card_data = data.responseText;

			rows = card_data.split("\n");

			let cards_list = []

			rows.forEach(function(obj, idx){

				if(idx != 0 && obj != "") 
				{

					splits = obj.split(",");

					question = clean_data(splits[0]);

					let a1 = clean_data(splits[1] ?? undefined);
					let c1 = clean_data(splits[2] ?? undefined);
					let item1 = a1 + " ~ " + c1;

					let a2 = clean_data(splits[5] ?? undefined);
					let c2 = clean_data(splits[6] ?? undefined);
					let item2 = a2 + " ~ " + c2;

					
					let a3 = clean_data(splits[9] ?? undefined);
					let c3 = clean_data(splits[10] ?? undefined);
					let item3 = a3 + " ~ " + c3;


					let a4 = clean_data(splits[13] ?? undefined);
					let c4 = clean_data(splits[14] ?? undefined);
					let item4 = a4 + " ~ " + c4;

					let a5 = clean_data(splits[3] ?? undefined);
					let c5 = clean_data(splits[4] ?? undefined);
					let item5 = a5 + " ~ " + c5;

					let a6 = clean_data(splits[7] ?? undefined);
					let c6 = clean_data(splits[8] ?? undefined);
					let item6 = a6 + " ~ " + c6;

					let a7 = clean_data(splits[11] ?? undefined);
					let c7 = clean_data(splits[12] ?? undefined);
					let item7 = a7 + " ~ " + c7;

					let a8 = clean_data(splits[15] ?? undefined);
					let c8 = clean_data(splits[16] ?? undefined);
					let item8 = a8 + " ~ " + c8;


					let items = [item1, item2, item3, item4, item5, item6, item7, item8];

					card_obj = { 
									"question": question, 
									"answers" : items,
									"label": MyTrello.get_label_id(numAnswers),
									"season": seasonNum
								};

					cards_list.push(card_obj);

					// Add this card to the full list of of source questions
					SOURCE_QUESTIONS_MAP[question] = card_obj;
				}
			});

			if(QUESTIONS.hasOwnProperty(numAnswers))
			{
				QUESTIONS[numAnswers] = cards_list;
				let countCell = document.querySelector(`#top_${numAnswers}_count`);
				if(countCell)
				{
					button = `<button onclick="compareToCards('${numAnswers}')">Compare</button>`;
					countCell.innerHTML = `${cards_list.length} questions ${button}`;
				}

			}
		}
	});
}

function compareToCards(key)
{
	element = document.querySelector(`#top_${key}_card_count`);
	countAdded = 0;
	element2 = document.querySelector(`#top_${key}_card_missing`);
	countMissing = 0;

	// idList = [];

	questions = QUESTIONS[key];
	if(questions && questions.length > 0)
	{
		questions.forEach(function(obj){
			question = clean_data(obj["question"]);
			cardExists = CARDS.includes(question);
			if(cardExists)
			{
				countAdded++;
			}
			else 
			{
				countMissing++;
				results = document.querySelector("#cards_not_found");
				let createButton = `<button class="addToQueueButton" data-question="${question}" onclick="addToCreateQueue(event)">Add to Queue</button>`
				results.innerHTML += `<p><span>${question}</span>${createButton}</p>`
				MISSING[question] = obj;
			}
		});
	}
	element.innerHTML = `${countAdded} cards`;
	element2.innerHTML = `${countMissing} cards`;

	// // TEMPORARY: season setting
	// var cards_without_season = [];

	// MyTrello.check_cards_without_season(function(data){
	// 	response = JSON.parse(data.responseText);
	// 	cards = response["cards"];
	// 	all_questions_map = {};

	// 	// Create map of all cards in deck that are missing cust field.
	// 	cards.forEach(function(obj){
	// 		question = obj["name"].trim();
	// 		custField = obj["customFieldItems"];
	// 		cardID = obj["id"];

	// 		if(custField.length < 1)
	// 		{
	// 			console.log("Adding")
	// 			console.log(obj);
	// 			cards_without_season.push(cardID);
	// 		}
	// 	});

	// 	updateSeason3(idList, cards_without_season);

	// });

	mydoc.hideContent("#loading_gif");
}

// TEMPORARY: Updating the season for those that didn't have it
function updateSeason3(idList, comparisonList)
{
	console.log("Checking cards = " + idList.length);
	if(idList.length == 0)
	{
		return undefined;
	}
	season = getSelectedSeason();
	cardID = idList.pop();
	if(comparisonList.includes(cardID))
	{
		console.log("Updating Card to Season: " + season);
		MyTrello.update_card_custom_field(cardID, MyTrello.custom_field_season, season);
		setTimeout(function(){
			updateSeason3(idList, comparisonList);
		}, 2000);
	}
	else
	{
		updateSeason3(idList, comparisonList);
	}
	
}

// TEMPORARY: Used to set the season for all the old cards
function updateSeason2()
{
	MyTrello.check_cards_without_season(function(data){
		response = JSON.parse(data.responseText);
		cards = response["cards"];
		all_questions_map = {};

		console.log("How Many Cards With No Season?");
		howMany = 0;
		// Create map of all cards in deck that are missing cust field.
		cards.forEach(function(obj){
			question = obj["name"].trim();
			custField = obj["customFieldItems"];
			cardID = obj["id"];

			if(custField.length < 1)
			{
				howMany++;
				console.log(obj);
			}
		});

		console.log(howMany);

		// console.log("All the ones with no custom field");
		// console.log(all_questions_map)

		// source_keys = Object.keys(SOURCE_QUESTIONS_MAP);
		// source_keys.forEach(function(key){
		// 	obj = SOURCE_QUESTIONS_MAP[key];
		// 	if(all_questions_map.hasOwnProperty(obj["question"]))
		// 	{
		// 		// console.log(obj);
		// 		console.log("")
		// 	}
		// 	else
		// 	{
		// 		console.log(key)
		// 	}
		// });

			// if(custField.length == 0)
			// {
			// 	console.log(question);
			// 	Object.keys(SOURCE_QUESTIONS_MAP).forEach(function(key){
			// 		if(key.includes(question.substring(10)))
			// 		{
			// 			console.log(key);
			// 		}
			// 	});
			// 	console.log("");
		// 	// }
		// 	sourceQuestion = SOURCE_QUESTIONS_MAP[question];
		// 	if(!sourceQuestion && custField.length == 0)
		// 	{
		// 		console.log(question);
		// 	}
		// 	else if(sourceQuestion && custField.length == 0)
		// 	{
		// 		console.log("To be fixed");
		// 		console.log(sourceQuestion);
		// 		season = sourceQuestion["season"];
		// 		MyTrello.update_card_custom_field(cardID, MyTrello.custom_field_season, season);
		// 	}
		// 	// if()
		// 	// {
		// 	// 	
		// 	// }

		// });
	});
}

function updateSeason(key)
{
	let selectedSeason = getSelectedSeason();
	questions = QUESTIONS[key];

	queue_to_fix = []

	questions.forEach(function(obj){
		question = obj["question"];
		card = CARDS_MAP[question];
		cardID = card["id"];
		MyTrello.get_card_custom_fields(cardID, function(data){
			response = JSON.parse(data.responseText);
			if(response.length == 0)
			{
				console.log(response);
				console.log(card);
				console.log("Queue to add Season: " + selectedSeason);
				queue_to_fix.push(cardID);
			}
			else
			{
				console.log("Has Season");
			}
		});
	});

	console.log("Waiting 10 seconds");
	// Add all the ones in the queue
	setTimeout(function(){
		queue_to_fix.forEach(function(cardID){
			MyTrello.update_card_custom_field(cardID, MyTrello.custom_field_season, selectedSeason);
		});
	}, 10000);
}


/***** CREATING NEW CARDS ******/

function addAllToCreateQueue()
{
	let allButtons = Array.from(document.querySelectorAll(".addToQueueButton"));
	allButtons.forEach(function(button){
		button.click();
	});
}

function addToCreateQueue(event)
{
	let ele = event.target;
	let question = ele.getAttribute("data-question");
	mydoc.showContent("#create_card_section");

	CREATE_QUEUE[question] = MISSING[question];
	let queue_count = Object.keys(CREATE_QUEUE).length;

	document.querySelector("#to_be_created_count").innerText = queue_count;

	// Remove from list once it has been added to queue
	ele.parentElement.remove();
}

function createCard()
{

	var results = document.getElementById("test_results2");

	// First check if the CREATE_QUEUE queue has anything
	let numToAdd = Object.keys(CREATE_QUEUE).length;
	document.querySelector("#to_be_created_count").innerText = numToAdd;

	if(numToAdd <= 0)
	{
		mydoc.hideContent("#loading_gif");
		results.innerHTML += "<p>Nothing left to add</p>";
		return -1
	}

	document.getElementById("createCardButton").disabled = true;

	


	// Show Loading GIF
	mydoc.showContent("#loading_gif");

	// Get the single card to work on.
	var listOfKeys = Object.keys(CREATE_QUEUE);
	var singleCardKey = listOfKeys[0];
	var singleCard = CREATE_QUEUE[singleCardKey];

	// Get details from Single Card
	let title = singleCard["question"];
	let labelID = singleCard["label"];
	let seasonNum = singleCard["season"];
	let answers = singleCard["answers"];

	// First level -- creating the actual card
	MyTrello.create_card(title, labelID, function(data){
			
		// response from card getting created
		newCardResponse = JSON.parse(data.responseText);
		newCardID = newCardResponse["id"];


		// Indicate Card Created (after checklist added)
		results.innerHTML += `<p>Card Created Added: ${title}</p>`;

		// Set the custom field
		MyTrello.update_card_custom_field(newCardID, MyTrello.custom_field_season,seasonNum);

		// Create the checklist
		MyTrello.create_checklist(newCardID, function(data){
			
			newChecklistResponse = JSON.parse(data.responseText);
			newChecklistID = newChecklistResponse["id"];

			for(var idx = 0; idx < answers.length; idx++){
				answer = answers[idx];
				position = (idx+1);
				cleanedAnswer = answer.replaceAll(" ", "").replace("~", "")
				if(cleanedAnswer != "")
				{
					MyTrello.create_checklist_item(newChecklistID, answer, position, function(data){
						document.getElementById("test_results2").innerHTML += `<ul><li>Answer Added</li></ul>`;
					});
				}
			}
		});
	});

	// Remove this card once processed
	delete CREATE_QUEUE[singleCardKey];

	// Every 4 seconds, call this function again
	setTimeout(function(){
		createCard();
	}, 4000);
}

// Validate the recently added cards
function validateNewlyAddedCards()
{
	document.getElementById("test_results3").innerHTML = "";

	MyTrello.get_cards(MyTrello.recently_added_list_id, function(data){
		
		response = JSON.parse(data.responseText);

		if(response.length > 0)
		{
			validateListOfCards(response);
		}
		else
		{
			document.getElementById("test_results3").innerHTML += `<p>Nothing to validate</p>`;
		}
	});
}

// Loop through the list of cards to validate
function validateListOfCards(listOfCards)
{
	console.log(listOfCards)
	document.getElementById("to_be_validated_count").innerText = listOfCards.length;
	if(listOfCards.length < 1)
	{
		document.getElementById("test_results3").innerHTML += "<p>Nothing left to validate</p>";
		return;
	}

	var currentCard = listOfCards.pop();
	var cardID = currentCard["id"];
	validateSingleCard(cardID);

	// Every 3 seconds, call this function again
	setTimeout(function(){
		validateListOfCards(listOfCards);
	}, 3000);
}

// Validate an individual card
function validateSingleCard(cardID)
{
	let results = document.getElementById("test_results3");

	MyTrello.get_single_card(cardID, function(data){
		response = JSON.parse(data.responseText)

		var question = response["name"];
		var checklist = response.checklists[0].checkItems;
		var labelID   = response.idLabels[0];
		var isFastMoney = (labelID == MyTrello.label_fast_money) ? true: false;
		var poolName = (isFastMoney) ? "Fast Money Pool" : "Pool"

		var isValidChecklist = validateChecklistSize(checklist, labelID);

		if(isValidChecklist)
		{
			MyTrello.moveCard(cardID,poolName, function(data){
				let paragraph = `<p>Moved card(${question}) to list = ${poolName}</p>`;
				results.innerHTML += paragraph;
			});
		}
		else
		{
			MyTrello.moveCard(cardID, "Fix", function(data){
				let paragraph = `<p>TO BE FIXED: Moved card (${question}) to list = "To Be Fixed"</p>`;
				results.innerHTML += paragraph;
			});
		}
	});
}

// Compare a cards checklist size to its label
function validateChecklistSize(checklist, labelID)
{
	// First confirm the label number
	var numAnswers = "0";
	let checklistSize = checklist.length;

	let isValidSize = false;

	switch(labelID)
	{
		case MyTrello.label_eight_answers:
			isValidSize = (checklistSize == 8);
			break;
		case MyTrello.label_seven_answers:
			isValidSize = (checklistSize == 7);
			break;
		case MyTrello.label_six_answers:
			isValidSize = (checklistSize == 6);
			break;
		case MyTrello.label_five_answers:
			isValidSize = (checklistSize == 5);
			break;
		case MyTrello.label_fast_money:
			isValidSize = (checklistSize == 4 || checklistSize == 5);
			break;
		default:
			isValidSize = false;
			break;
	}
	return isValidSize;
}


function checkForDuplicates()
{
	
	frequency = {};

	CARDS.forEach(function(obj){

		console.log(obj);
		let keysList = Object.keys(frequency);
		let key = obj.replaceAll(/[^A-z0-9]/g, "");

		if(!keysList.includes(key))
		{
			frequency[key] = obj;
		}
		else
		{
			document.getElementById("searchResults").innerHTML += `<p>DUPLICATE: ${obj}</p>`;
		}
	});

	document.getElementById("searchResults").innerHTML += `<p>DONE</p>`;
}


function setSearchType()
{
	let searchTypeEle = document.querySelector("#search_type");
	if(searchTypeEle)
	{
		SEARCH_TYPE = searchTypeEle.value ?? "Cards";

		IS_SOURCE_SEARCH = (searchTypeEle.value == "Source")

		if(SEARCH_TYPE == "Cards")
		{
			mydoc.showContent("#checkForDuplicates");
		}
	}
}

// Search through the cards that have been loaded
function searchList()
{
	input = document.querySelector("#search_cards");
	results = document.querySelector("#searchResults");

	if(input && input != "" && results)
	{
		results.innerHTML = "";
		let searchValue = input.value;

		let searchMap = (SEARCH_TYPE == "Source") ? SOURCE_QUESTIONS_MAP : CARDS_MAP;

		Object.keys(searchMap).forEach(function(value){

			if(value && value.includes(searchValue))
			{
				results.innerHTML += `<div>
										<p>${value}</p>
										<button data-question="${value}" onclick="loadQuestionDetails(event)">Details</button>
									</div>`;
				// console.log(value);
				// console.log(searchMap[value]);
			}
		});
	}
}

function loadQuestionDetails(event)
{
	let detailsEle = document.querySelector("#resultDetails");
	let targetEle = event.target;
	if(!targetEle){ detailsEle.innerHTML("Could not load details"); return; }
	
	let question = event.target.getAttribute("data-question");
	if(IS_SOURCE_SEARCH)
	{
		obj = SOURCE_QUESTIONS_MAP[question];
		console.log(obj);
		let questionP = `<p>${obj["question"]}</p>`
		let answersUL = ""
		obj["answers"].forEach(function(val){
			answersUL += `<ul><li>${val}</li></ul>`;
		});
		detailsEle.innerHTML = questionP + answersUL
	}
	else
	{
		obj = CARDS_MAP[question];
		console.log(obj);
	}
}



/*****
	
	ADD TO THE QUESTION/ANSWER OBJECT FOR CREATING THE CAARD
		-- Add a key for the label
		-- Add a key for the season
	
	Then, when each card that is queued to be created is processed
		... the label is pulled from it
		... And the season is pulled from it to send in a subsequent call to update custom field (after card is created)

****/















/********** THE OLD DATA!!1 ***************/


// Get the card data as formulated in the CSV; Store in local JS Object
function getCardData()
{

	let numAnswersValue = document.getElementById("number_of_answers").value;

	if(numAnswersValue != undefined && Number(numAnswersValue) > 0)
	{
		document.getElementById("addCardButton").disabled = false;
		document.getElementById("addCardAutomatedButton").disabled = false;

		myajax.AJAX({
			method:"GET",
			path: "./create_cards.csv",
			success: function(data){
				card_data = data.responseText;

				rows = card_data.split("\n");

				rows.forEach(function(obj, idx){

					if(idx != 0 && obj != "") 
					{

						splits = obj.split(",");

						question = clean_data(splits[0]);

						let a1 = clean_data(splits[1]);
						let c1 = clean_data(splits[2]);
						let item1 = a1 + " ~ " + c1;

						let a2 = clean_data(splits[5]);
						let c2 = clean_data(splits[6]);
						let item2 = a2 + " ~ " + c2;

						
						let a3 = clean_data(splits[9]);
						let c3 = clean_data(splits[10]);
						let item3 = a3 + " ~ " + c3;


						let a4 = clean_data(splits[13]);
						let c4 = clean_data(splits[14]);
						let item4 = a4 + " ~ " + c4;

						let a5 = clean_data(splits[3]);
						let c5 = clean_data(splits[4]);
						let item5 = a5 + " ~ " + c5;

						let a6 = clean_data(splits[7]);
						let c6 = clean_data(splits[8]);
						let item6 = a6 + " ~ " + c6;

						let a7 = clean_data(splits[11]);
						let c7 = clean_data(splits[12]);
						let item7 = a7 + " ~ " + c7;

						let a8 = clean_data(splits[15]);
						let c8 = clean_data(splits[16]);
						let item8 = a8 + " ~ " + c8;


						let items = [item1, item2, item3, item4, item5, item6, item7, item8];

						card_obj = { 
										"question": question, 
										"answers" : items
									};

						CARDS.push(card_obj);
					}
				});

				console.log(CARDS);
				document.getElementById("total1").innerText = CARDS.length + " Questions";
				document.getElementById("total2").innerText = CARDS.length;
			}
		});
	}
	else
	{
		document.getElementById("addCardButton").disabled = true;
		document.getElementById("addCardAutomatedButton").disabled = true;

		alert("Please enter valid Number of Answers");
	}
}

// Automate the clicking of the add card button
function automateClick()
{
	setInterval(function(){
		document.getElementById("addCardButton").click();
	}, 3000);
}

// Creates an individual card -- along with Checklist and answers
function createIndividualCard()
{

	document.getElementById("addCardButton").disabled = true;
	document.getElementById("test_results2").innerHTML = "";

	// The number of answers expected
	let numAnswersValue = document.getElementById("number_of_answers").value;


	value = document.getElementById("curr").innerText;
	idx  = Number(value);

	card_data = CARDS[idx];

	title = encodeURIComponent(card_data["question"]);

	MyTrello.create_card(title, numAnswersValue, function(data){
		response1 = JSON.parse(data.responseText);
		card_id = response1["id"];

		// createChecklist(card_id, question, answers)
		MyTrello.create_checklist(card_id, function(data){
			response = JSON.parse(data.responseText);
			checklist_id = response["id"];

			// Indicate Card Created (after checklist added)
			document.getElementById("test_results2").innerHTML += `<p>Card Created Added: ${title}</p>`;

			// Get answers
			answers = card_data["answers"];

			for(var idx = 0; idx < answers.length; idx++){
				answer = answers[idx];
				position = (idx+1);
				cleanedAnswer = answer.replaceAll(" ", "").replace("~", "")
				// alert("cleanedAnswer");
				if(cleanedAnswer != "")
				{
					MyTrello.create_checklist_item(checklist_id, answer, position, function(data){
						document.getElementById("test_results2").innerHTML += `<ul><li>Answer Added: ${checklist_id}</li></ul>`;
					});
				}
			}
		});
	});

	// Remove the disabled button after 3 seconds
	setTimeout(function(){
		document.getElementById("addCardButton").disabled = false
	}, 5000);

	// Increment the counter once done
	document.getElementById("curr").innerText = (idx+1);
}




// Find any duplicates in the "played_list_id"
function checkDuplicates(cardsList)
{
	frequency = [];
	cardsList.forEach(function(obj){
		name = obj["card_name"];
		if(frequency.includes(name))
		{
			document.getElementById("test_results2").innerHTML += `<p>DUPLICATE: ${name}</p>`;
		}
		else {
			frequency.push(name);
		}
	});
}

// Check for bad checklists
function checkBadChecklists(cardsList, cardMap)
{
	cardsList.forEach(function(obj){
		name = obj["card_name"];
		checklist_id = obj["checklist_id"]
		MyTrello.get_checklist(checklist_id,function(data){
			response = JSON.parse(data.responseText);
			checklist_items = response["checkItems"];
			card_id = response["idCard"];
			checklist_items.forEach(function(obj){
				value = obj["name"];
				if(!value.includes("~"))
				{
					// console.log(response);
					card_name = cardMap[card_id];
					document.getElementById("test_results2").innerHTML += `<p>BAD CHECKLIST: ${card_name}</p>`;
					// obj = {"card": card_name, "value": value, "og": checklist_items};
					// console.log(obj);
				}
			});			
		});
	});
}

function checkCardsToBeFixed()
{
	document.getElementById("test_results2").innerHTML = "";

	let to_be_fixed = [];

	let checklists_to_review = [];

	// MyTrello.get_cards(MyTrello.to_be_fixed_list_id, function(data){
	// MyTrello.get_cards(MyTrello.pool_list_id, function(data){
	MyTrello.get_cards(MyTrello.fast_money_pool_list_id, function(data){
		response = JSON.parse(data.responseText);
		console.log(response);
		response.forEach(function(obj){
			cardID = obj["id"];
			name = obj["name"];
			to_be_fixed.push(name);
			checklists_to_review.push(obj["idChecklists"][0]);
		});

		// Compare to be fixed list with list of loaded cards
		CARDS.forEach(function(obj){
			name2 = obj["question"];
			console.log(name2);
			if(to_be_fixed.includes(name2))
			{
				document.getElementById("test_results2").innerHTML += `<p>TO BE FIXED: ${name2}</p>`;
				obj["answers"].forEach(function(obj){
					document.getElementById("test_results2").innerHTML += `<li>${obj}</li>`;
				});
			}
		});

		document.getElementById("test_results2").innerHTML += `<p>DONE</p>`;

		// Review checklists
		reviewChecklists(to_be_fixed, checklists_to_review);
	});

}

function reviewChecklists(cardnames, checklists)
{
	// console.log(cardnames);
	// console.log(checklists);

	var checklistIsBad = false;

	start = 100;
	end   = start+50;


	document.getElementById("test_results2").innerHTML = "";

	for(var i = start; i <= end; i++){

		console.log("COUNTER = " + i);
		card_name = cardnames[i];
		checklist_id = checklists[i];

		// console.log(card_name);
		// console.log(checklist_id);

		MyTrello.get_checklist(checklist_id, function(data){
			response = JSON.parse(data.responseText);

			checklistIsBad = false;
			let idCard = response["idCard"];

			let items = response["checkItems"];
			items.forEach(function(item){

				// console.log(item["name"]);

				if(!item["name"].includes("~"))
				{
					console.log(response);
					document.getElementById("test_results2").innerHTML += `<p>TO BE FIXED (bad checklist): ${idCard}</p>`;
					checklistIsBad = true;
				}
			});
		});
	}



	// checklists_sub = checklists

	// var card_name = "";
	// var checklistIsBad = false;

	// for( [key,value] of Object.entries(checklists)){

	// 	card_name = key;
	// 	let checklist_id = value;
	// 	MyTrello.get_checklist(checklist_id, function(data){
	// 		response = JSON.parse(data.responseText);

	// 		let items = response["checkItems"];
	// 		items.forEach(function(item){

	// 			console.log(item["name"]);

	// 			if(!item["name"].includes("~"))
	// 			{
	// 				checklistIsBad = true;
	// 			}
	// 		});

	// 		// Update checklist if bad
	// 		if(checklistIsBad){
	// 			document.getElementById("test_results2").innerHTML = "";
	// 			document.getElementById("test_results2").innerHTML += `<p>TO BE FIXED (bad checklist): ${card_name}</p>`;
	// 		}
	// 	});
	// };
}