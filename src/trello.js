
/*********************************************************************************
	MyTrello: Custom API wrapper for Trello
**********************************************************************************/ 

const MyTrello = {

	endpoint: "https://api.trello.com/1",
	key: "78824f4a41b17e3ab87a2934fd5e9fbb",
	token: "18616dd5585620de70fae4d1b6a4463a553581ec9aa7e211aaac45ec1d2707a3",

	board_id: "5fe228fd89219f2ac208819c",
	pool_list_id: "5fe22904a09947446a263ccc",
	current_card_list_id: "5fe2290943c8477eac558482",
	played_list_id: "5fe2290b8b5e07528c4ffda7",
	list_id: "5fe22904a09947446a263ccc",

	// Get list of boards
	get_boards: function(successCallback){
		let trello_path = `${this.endpoint}/members/me/boards?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Get Custom Fields
	get_custom_fields: function(successCallback){
		let trello_path = `${this.endpoint}//boards/${this.board_id}/customFields?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Get a list of Trello Cards
	get_cards: function(list_id, successCallback){
					// Trello.get("/lists/"+this.list_id+"/cards", successCallback, Logger.errorHandler);
					let trello_path = `${this.endpoint}/lists/${list_id}/cards?key=${this.key}&token=${this.token}`;
					myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
				},

	// Gets a single trello cards
	get_single_card: function(card_id, successCallback){
						let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}`;
						myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
						// Trello.cards.get(card_id, successCallback, Logger.errorHandler);
					},

	// Get a specific checklist
	get_checklist: function(checklist_id, successCallback){
					let trello_path = `${this.endpoint}/checklists/${checklist_id}/?key=${this.key}&token=${this.token}`;
					myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
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

	
	// Gets a single trello cards
	get_card_actions: function(card_id, successCallback){
						let trello_path = `${this.endpoint}/cards/${card_id}/actions/?key=${this.key}&token=${this.token}`;
						myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
						// Trello.cards.get(card_id, successCallback, Logger.errorHandler);
					},

	// Creates a new Trello Card
	create_card: function(team_name, successCallback){
					let params = `name=${team_name}&idList=${this.list_id}&pos=top`;
					let trello_path = `${this.endpoint}/cards/?key=${this.key}&token=${this.token}&${params}`
					myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
					// Trello.post('/cards/', new_team_obj, successCallback);
				},

	// Update a single card
	update_card: function(card_id, new_desc){
					let param = `desc=${new_desc}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "PUT", path : trello_path, failure : Logger.errorHandler});
						// Trello.cards.get(card_id, successCallback, Logger.errorHandler);
					// Trello.put('/cards/'+card_id, {desc: new_desc})
				},

	// Update the Card's list
	update_card_list: function(card_id, new_list_id, successCallback){
					let param = `idList=${new_list_id}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "PUT", path : trello_path, success:successCallback, failure : Logger.errorHandler});
						// Trello.cards.get(card_id, successCallback, Logger.errorHandler);
					// Trello.put('/cards/'+card_id, {desc: new_desc})
				},


	// Update a single card
	update_card_wager: function(card_id, wager){
					let param = `text=${wager}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/actions/comments?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "POST", path : trello_path, data:"", failure : Logger.errorHandler});
				},

	// Get the latest wager (i.e. comment)

	// Gets the set of Trello Lists
	get_lists: function(successCallback){
					let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}`;
					// Trello.get("/boards/"+this.board_id+"/lists", successCallback, Logger.errorHandler);
					// Trello.get(path, successCallback, Logger.errorHandler);
					myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
				},

	// Create a new list
	create_list: function(listName,successCallback){
					let param = `name=${listName}`
					// var new_list_obj = {
					// 	name:listName
					// };
					let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}&${param}`
					myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
					// Trello.post("/boards/"+this.board_id+"/lists", new_list_obj, successCallback);
				},
}

// function trello_api(entity, identifier=undefined){
// 	if (entity.toLowerCase() !== "boards" && identifier == undefined ){
// 		console.error("Could not run a Trello query! No Identifier provided!");
// 	} else {
// 		var apiURI; 
// 		switch(entity){
// 			case "boards":
// 				apiURI = "/members/me/boards";
// 				break;
// 			case "lists":
// 				let boardID = identifier;
// 				apiURI ="/boards/"+boardID+"/lists"; 
// 				break;
// 			case "customFieldsOnBoard":
// 				let boardID2 = identifier;
// 				apiURI = "/boards/"+boardID2+"/customFields"; 
// 				break;
// 			case "cards":
// 				let listID = identifier; 
// 				apiURI ="/lists/"+listID+"/cards"; 
// 				// Trello.get("/lists/"+idVal+"/cards?fields=name&customFieldItems=true", print);
// 				break;
// 			case "customFieldsOnCards":
// 				let cardID2 = identifier; 
// 				apiURI = "/cards/"+cardID2+"/?fields=name&customFieldItems=true";
// 				break;
// 			default:
// 				console.error("Did not get anything! Tried - " + entity);
// 				apiURI = "n/a";
// 		}

// 		//  Return a promise with the results of the API call. 
// 		return Trello.get(apiURI).then( 
// 			function(payload){ return payload }, 
// 			function(error){ return error; } 
// 		);
// 	}
// 		}