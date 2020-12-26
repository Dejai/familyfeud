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
				MyTrello.list_id = id;
				MyTrello.create_card("Trello Testing", print_data);
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


function getCardData()
{
	myajax.AJAX({
		method:"GET",
		path: "./create_cards.csv",
		success: function(data){
			card_data = data.responseText;

			rows = card_data.split("\n");

			let starting_idx_ele = document.getElementById("starting_index")
			console.log(starting_idx_ele)
			starting_index = Number(starting_idx_ele.value)
			console.log("Starting Index : " + starting_index);

			rows.forEach(function(obj, idx){
				if(idx != 0) {

					splits = obj.split(",");

					question = splits[0].replaceAll("\"","");

					let a1 = splits[1].replaceAll("\"","");
					let c1 = splits[2].replaceAll("\"","");
					let item1 = a1 + " ~ " + c1;

					let a2 = splits[5].replaceAll("\"","");
					let c2 = splits[6].replaceAll("\"","");
					let item2 = a2 + " ~ " + c2;

					
					let a3 = splits[9].replaceAll("\"","");
					let c3 = splits[10].replaceAll("\"","");
					let item3 = a3 + " ~ " + c3;


					let a4 = splits[13].replaceAll("\"","");
					let c4 = splits[14].replaceAll("\"","");
					let item4 = a4 + " ~ " + c4;

					let a5 = splits[3].replaceAll("\"","");
					let c5 = splits[4].replaceAll("\"","");
					let item5 = a5 + " ~ " + c5;

					let a6 = splits[7].replaceAll("\"","");
					let c6 = splits[8].replaceAll("\"","");
					let item6 = a6 + " ~ " + c6;

					let a7 = splits[11].replaceAll("\"","");
					let c7 = splits[12].replaceAll("\"","");
					let item7 = a7 + " ~ " + c7;

					let a8 = splits[15].replaceAll("\"","");
					let c8 = splits[16].replaceAll("\"","");
					let item8 = a8 + " ~ " + c8;


					let items = [item1, item2, item3, item4, item5, item6, item7, item8];

					card_obj = { 
									"question": encodeURIComponent(question), 
									"answers" : items
								};

					CARDS.push(card_obj);
				}
			});

			console.log(CARDS);
			document.getElementById("total").innerText = CARDS.length;
		}
	});
}

function automateClick()
{
	setInterval(function(){
		document.getElementById("addCardButton").click();
	}, 3000);
}


function createIndividualCard(){

	document.getElementById("addCardButton").disabled = true;
	document.getElementById("test_results2").innerHTML = "";


	value = document.getElementById("curr").innerText;
	idx  = Number(value);

	card_data = CARDS[idx];

	title = card_data["question"];



	MyTrello.create_card(title, function(data){
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


function getDuplicates()
{
	frequency = [];
	MyTrello.get_cards(MyTrello.played_list_id, function(data){
		response = JSON.parse(data.responseText)
		response.forEach(function(obj){
			name = obj["name"];
			if(frequency.includes(name))
			{
				document.getElementById("test_results2").innerHTML += `<p>${name}</p>`;
			}
			else {
				frequency.push(name);
			}
		});
	});
	document.getElementById("test_results2").innerHTML += `<p>DONE</p>`;

}

function getBadChecklists()
{
	MyTrello.get_cards(MyTrello.played_list_id, function(data){
		response = JSON.parse(data.responseText)
		response.forEach(function(obj){
			cardID = obj["id"];
			name = obj["name"];
			checklist_id = obj["idChecklists"][0];

			MyTrello.get_checklist(checklist_id,function(data){

				response = JSON.parse(data.responseText);
				checklist_items = response["checkItems"];

				checklist_items = checklist_items.sort(function(a,b){
					return a.pos - b.pos;
				});
				console.log(checklist_items);

				checklist_items.forEach(function(obj){
					value = obj["name"];
					if(!value.includes("~"))
					{
						document.getElementById("test_results2").innerHTML += `<p>${name}</p>`;
					}
					else
					{
						
						// Move the card to the current Game List
						MyTrello.update_card_list(cardID, MyTrello.current_card_list_id, function(data){
							Logger.log("Card List ID updated");
						});
					}
				});			
			});
		});
	});
	document.getElementById("test_results2").innerHTML += `<p>DONE</p>`;
}