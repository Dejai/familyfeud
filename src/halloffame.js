// VARIABLES
var CARD_ID = undefined;
var QUESTION = undefined;

mydoc.ready(function(){
	checkForGivenCardID();
});

// Check if the card ID is provided;
function checkForGivenCardID()
{
	let value = mydoc.get_query_param("card");
	console.log(value);
	if(value != undefined)
	{
		showEntrySection(value);
	}
	else
	{
		showListOfAnswersSection();
	}
}


function isValidJSON(data)
{
	let isValid = false;
	try
	{
		let value = JSON.parse(data);
		if(value != undefined)
		{
			isValid = true
		}
	}
	catch(error)
	{
		console.log(error);
	}
	return isValid;
}

// Get the question for the single card
function showListOfAnswersSection()
{
	MyTrello.get_card_comments(MyTrello.hall_of_fame_card_id, function(data){
		let response = JSON.parse(data.responseText);
		console.log(response);

		let tableBody = document.getElementById("hof_answers_list");
		let rows = "";

		response.forEach(function(obj){
			hofObj = obj["data"]["text"];
			if(isValidJSON(hofObj))
			{
				let jsonObj = JSON.parse(hofObj);
				let question = jsonObj["Question"];
				let answer = jsonObj["Answer"];
				let person = jsonObj["Person"];
				// rows += `<tr><td>${question}</td><td>${answer}</td><td>${person}</td></tr>`;

				rows += `
							<div class="hall_of_fame_section center_section_50">
								<p>The Question:<br/><br/><span class="hall_of_fame_content">"${question}"</span></p>
								<p>The Answer:<br/><br/><span class="hall_of_fame_content">"${answer}" - ${person} </span></p>
							</div>
						`
			}
		});

		tableBody.innerHTML += rows;

		mydoc.showContent("#hof_answers_list_section");
	});
}

// Show the option to enter a new question
function showEntrySection(cardID)
{
	MyTrello.get_single_card(cardID, function(data){
		let response = JSON.parse(data.responseText);
		console.log(response);
		QUESTION = response["name"];
		questionDisplay = document.querySelector("#new_hall_of_fame_question");
		if(questionDisplay){ questionDisplay.innerText = QUESTION; }

		mydoc.showContent("#hof_enter_answer_section");
	});
}

// Use Trello to set the latest hall of fame answer
function submitHallOfFameAnswer()
{
	var nameInput = document.querySelector("input[name='person']");
	var answerInput = document.querySelector("input[name='answer']");

	if(nameInput && answerInput)
	{
		name = nameInput.value;
		answer = answerInput.value;
		if(name != "" && answer != "")
		{
			var entry = `{"Question":"${QUESTION}","Answer":"${answer}","Person":"${name}"}`;
			MyTrello.create_card_comment(MyTrello.hall_of_fame_card_id,entry, function(data){
				location.href = "../hof";
			});
		}
	}
}