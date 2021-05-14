
/*********************************************************************************
	MyTrello: Custom API wrapper for Trello
**********************************************************************************/ 

const MyTrello = {

	endpoint: "https://api.trello.com/1",
	key: "78824f4a41b17e3ab87a2934fd5e9fbb",
	token: "18616dd5585620de70fae4d1b6a4463a553581ec9aa7e211aaac45ec1d2707a3",


	board_id: "5fe228fd89219f2ac208819c",
	hall_of_fame_card_id: "604564744449155af0b9742e",
	recently_added_list_id: "5fec7615af83ed36f2de6ea6",
	to_be_fixed_list_id: "5fe77933034d92360d6a3af3",
	pool_list_id: "5fe22904a09947446a263ccc",
	fast_money_pool_list_id: "5fede51f5c34c27bba689873",
	question_bank_list_id: "604536df3814495d4e950456",
	
	current_card_list_id: "5fe2290943c8477eac558482",
	played_list_id: "5fe2290b8b5e07528c4ffda7",
	list_id: "5fe22904a09947446a263ccc",


	test_list_id: "5fe2290b8b5e07528c4ffda7",
	curr_game_list_id: undefined,

	label_eight_answers: "5fe228fd86c6bc9cc5e54510",
	label_seven_answers: "5fe228fd86c6bc9cc5e54511",
	label_six_answers: "5fe228fd86c6bc9cc5e54515",
	label_five_answers: "5fe228fd86c6bc9cc5e54516",
	label_fast_money: "5fe228fd86c6bc9cc5e54518",

	custom_field_season: "604537f6a9a22e86f2e4fcc7",

	list_of_labels: [ 
						{"8 answers": this.label_eight_answers},
						{"7 answers": this.label_seven_answers},
						{"6 answers": this.label_six_answers},
						{"5 answers": this.label_five_answers},
						{"Fast Money": this.label_fast_money}
					],

	/**** Calls that are mor admin calls, and not used much on the game board ****/

	// Get list of boards
	get_boards: function(successCallback){
		let trello_path = `${this.endpoint}/members/me/boards?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	get_labels: function(successCallback){
		let trello_path = `${this.endpoint}/boards/${this.board_id}/labels?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},


	delete_card:function(cardID, successCallback){
		let trello_path = `${this.endpoint}/cards/${cardID}?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "DELETE", path:trello_path, success:successCallback, failure:Logger.errorHandler});
	},

	check_cards_without_season: function(successCallback){
		let trello_path = `${this.endpoint}/boards/${this.board_id}?fields=name&cards=visible&card_fields=name&customFields=true&card_customFieldItems=true&key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path:trello_path, success:successCallback, failure:Logger.errorHandler});
	},



	/**** Helper Calls ****/
	// Gets the label ID list based on label value
	get_label_id: function(label){
		var label_id = ""
		switch(label)
		{
			case "8":
				label_id = `${this.label_eight_answers}`;
				break;
			case "7":
				label_id = `${this.label_seven_answers}`;
				break;
			case "6":
				label_id = `${this.label_six_answers}`;
				break;
			case "5":
				label_id = `${this.label_five_answers}`;
				break;
			case "fastmoney":
			case "fast money":
				label_id = `${this.label_fast_money}`;
				break;
			default:
				label_id = "";
		}
		return label_id;
	},


	__getLabel: function(label){
		label_id = "idLabels="
		switch(label)
		{
			case "8":
				label_id = `idLabels=${this.label_eight_answers}`;
				break;
			case "7":
				label_id = `idLabels=${this.label_seven_answers}`;
				break;
			case "6":
				label_id = `idLabels=${this.label_six_answers}`;
				break;
			case "5":
				label_id = `idLabels=${this.label_five_answers}`;
				break;
			case "10":
				label_id = `idLabels=${this.label_fast_money}`;
				break;
			default:
				label_id = "";
		}
		return label_id;
	},

	setCurrentGameListID: function(id){
		this.curr_game_list_id = id;
	},

	moveCard: function(cardID, toList, successCallback=undefined){
		let list_id = this.current_card_list_id;

		// Set a default successCallback if none is defined;
		if(successCallback == undefined)
		{
			successCallback = function(data){
				if(Logger!=undefined)
				{
					Logger.log("Card moved to list! Action = " + toList);
				} else {
					console.log("Card moved to list! Action = " + toList);
				}
			}
		}

		// Switch on the actions
		switch(toList)
		{
			case "Current":
			case "CurrentGame":
				list_id = this.curr_game_list_id;
				// list_id = this.current_card_list_id;
				break;
			case "Played":
				list_id = this.played_list_id;
				break;
			case "Fix":
				list_id = this.to_be_fixed_list_id;
				break;
			case "Pool":
				list_id = this.pool_list_id;
				break;
			case "FastMoneyPool":
			case "Fast Money Pool":
				list_id = this.fast_money_pool_list_id;
				break;
			
				break;
			default:
				Logger.log("No selected moveCard value");
		} 

		// Move the card to the current Game List
		this.update_card_list(cardID, list_id, successCallback);
	},


	// Move all the cards from the current game to a separate list
	archiveGame: function(list_id, successCallback){

		this.curr_game_list_id = list_id; 

		MyTrello.get_cards(list_id, function(data){

			response = JSON.parse(data.responseText);
			if(response.length > 0)
			{
				response.forEach(function(obj){
					MyTrello.moveCard(obj["id"], "CurrentGame"); 
				});

				successCallback(list_id);
			}
		});
	},

	/**** API Call Wrappers ***/

	get_all_cards: function(successCallback){
		let filter = `filter=all`;
		// let filter = `filter=visible`;
		let trello_path = `${this.endpoint}/boards/${this.board_id}/cards/?key=${this.key}&token=${this.token}&${filter}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	get_all_closed_cards: function(successCallback){
		let filter = `filter=closed`;
		let trello_path = `${this.endpoint}/boards/${this.board_id}/cards/?key=${this.key}&token=${this.token}&${filter}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Get a list of Trello Cards
	get_cards: function(list_id, successCallback){
		let trello_path = `${this.endpoint}/lists/${list_id}/cards?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Gets a single trello cards
	get_card_comments: function(card_id, successCallback){
		let param="filter=commentCard";
		let trello_path = `${this.endpoint}/cards/${card_id}/actions?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	
	get_closed_lists: function(successCallback){
		let filter = `filter=closed`;
		let trello_path = `${this.endpoint}/boards/${this.board_id}/lists/?key=${this.key}&token=${this.token}&${filter}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Gets a single trello cards
	get_single_card: function(card_id, successCallback){
		let param="checklists=all";
		let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Get a specific checklist
	get_checklist: function(checklist_id, successCallback){
		let trello_path = `${this.endpoint}/checklists/${checklist_id}/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},
	
	// Gets a single trello cards
	get_card_actions: function(card_id, successCallback){
		let trello_path = `${this.endpoint}/cards/${card_id}/actions/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Gets a single trello card's actions
	get_card_attachments: function(card_id, successCallback){
		let trello_path = `${this.endpoint}/cards/${card_id}/attachments/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path:trello_path, success: successCallback, failure:Logger.errorHandler});
	},

	get_card_custom_fields: function(card_id, successCallback){
		let trello_path = `${this.endpoint}/cards/${card_id}/customFieldItems/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path:trello_path, success: successCallback, failure:Logger.errorHandler});
	},

	// Get Custom Fields;
	get_custom_fields: function(successCallback){
		let trello_path = `${this.endpoint}/boards/${this.board_id}/customFields?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path:trello_path, success: successCallback, failure:Logger.errorHandler});
	},

	// Get a single attachment
	get_attachment: function(card_id, attachment_id, successCallback){	
		let trello_path = `${this.endpoint}/cards/${card_id}/attachments/${attachment_id}/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path:trello_path, success: successCallback, failure:Logger.errorHandler});
	},


	// Gets the set of Trello Lists
	get_lists: function(successCallback){
		let param="filter=open";
		let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	get_card_by_name(cardName, successCallback){
		let param=`name=${cardName}`;
		let trello_path = `${this.endpoint}/search/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},



	// Creates a new Trello Card
	create_card: function(team_name, label=undefined, successCallback){
		let idLabels = `idLabels=${label}`
		let params = `name=${team_name}&idList=${this.recently_added_list_id}&pos=top&${idLabels}`;
		let trello_path = `${this.endpoint}/cards/?key=${this.key}&token=${this.token}&${params}`
		myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
	},

	// Create a comment for a card
	create_card_comment: function(card_id, comment){
		let param = `text=${comment}`;
		let trello_path = `${this.endpoint}/cards/${card_id}/actions/comments?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "POST", path : trello_path, data:"", failure : Logger.errorHandler});
	},


	// Create a checklist
	create_checklist: function(card_id, successCallback){
		let params = `idCard=${card_id}&name=Checklist`;
		let trello_path = `${this.endpoint}/checklists/?key=${this.key}&token=${this.token}&${params}`;
		myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
	},	

	// Create an item in the checklist
	create_checklist_item: function(checklist_id, checklist_item, position, successCallback){
		let params = `name=${checklist_item}&pos=${position}`;
		let trello_path = `${this.endpoint}/checklists/${checklist_id}/checkItems/?key=${this.key}&token=${this.token}&${params}`;
		myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
	},	

	// Create a new list
	create_list: function(listName,successCallback){
		let param = `name=${listName}`
		let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}&${param}`
		myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
	},



	// Update a single card
	update_card: function(card_id, new_desc){
		let param = `desc=${new_desc}`;
		let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "PUT", path : trello_path, failure : Logger.errorHandler});
	},

	update_card_custom_field: function(card_id, field_id, new_value){
		var obj = { "value":{ "text":new_value } };
		var encoded = JSON.stringify(obj);
		let trello_path = `${this.endpoint}/cards/${card_id}/customField/${field_id}/item/?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "PUT", path:trello_path, data:encoded, contentType:"JSON", failure:Logger.errorHandler});
	},


	// Update the Card's list
	update_card_list: function(card_id, new_list_id, successCallback){
		let param = `idList=${new_list_id}&pos=top`;
		let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "PUT", path : trello_path, success:successCallback, failure : Logger.errorHandler});
	},


	// Update a single card
	update_card_wager: function(card_id, wager){
		let param = `text=${wager}`;
		let trello_path = `${this.endpoint}/cards/${card_id}/actions/comments?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method: "POST", path : trello_path, data:"", failure : Logger.errorHandler});
	},


	update_list_name_and_close: function(list_id, new_name, successCallback){
		let param = `name=${new_name}&closed=true`;
		let trello_path = `${this.endpoint}/lists/${list_id}/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method:"PUT", path:trello_path, success:successCallback, failure:Logger.errorHandler});
	},
	// Update list to be archived
	update_list_to_archive: function(list_id, successCallback){
		let param = `closed=true`;
		let trello_path = `${this.endpoint}/lists/${list_id}/?key=${this.key}&token=${this.token}&${param}`;
		myajax.AJAX({ method:"PUT", path:trello_path, success:successCallback, failure:Logger.errorHandler});
	},
}