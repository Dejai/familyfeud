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



var CARDS = [];

function clean_data(data)
{
	let cleaned_data = "";
	if(data != undefined)
	{
		cleaned_data = data.replaceAll("\"","").replaceAll("\&","AND").replaceAll("NULL", "");
	}
	return cleaned_data;
}

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


// Validate the recently added cards
function validateNewlyAddedCards()
{
	document.getElementById("test_results2").innerHTML = "";

	let cards = [];
	let card_map = {};
	MyTrello.get_cards(MyTrello.recently_added_list_id, function(data){
		response = JSON.parse(data.responseText)
		response.forEach(function(obj){
			cardID = obj["id"];
			name = obj["name"];
			checklist_id = obj["idChecklists"][0];

			card_obj = {"card_name": name, "checklist_id":checklist_id};
			cards.push(card_obj);
			card_map[cardID] = name;
		});
		checkDuplicates(cards);
		checkBadChecklists(cards, card_map);
		console.log(cards);
		document.getElementById("test_results2").innerHTML += `<p>DONE</p>`;
	});
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