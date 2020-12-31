
/*********************************************************************************
	MyTrello: Custom API wrapper for Trello
**********************************************************************************/ 

const MyTrello = {

	endpoint: "https://api.trello.com/1",
	key: "78824f4a41b17e3ab87a2934fd5e9fbb",
	token: "18616dd5585620de70fae4d1b6a4463a553581ec9aa7e211aaac45ec1d2707a3",


	board_id: "5fe228fd89219f2ac208819c",
	recently_added_list_id: "5fec7615af83ed36f2de6ea6",
	to_be_fixed_list_id: "5fe77933034d92360d6a3af3",
	pool_list_id: "5fe22904a09947446a263ccc",
	fast_money_pool_list_id: "5fede51f5c34c27bba689873",
	current_card_list_id: "5fe2290943c8477eac558482",
	played_list_id: "5fe2290b8b5e07528c4ffda7",
	list_id: "5fe22904a09947446a263ccc",

	label_eight_answers: "5fe228fd86c6bc9cc5e54510",
	label_seven_answers: "5fe228fd86c6bc9cc5e54511",
	label_six_answers: "5fe228fd86c6bc9cc5e54515",
	label_five_answers: "5fe228fd86c6bc9cc5e54516",
	label_fast_money: "5fe228fd86c6bc9cc5e54518",

	// Get list of boards
	get_boards: function(successCallback){
		let trello_path = `${this.endpoint}/members/me/boards?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Get Custom Fields
	get_custom_fields: function(successCallback){
		let trello_path = `${this.endpoint}/boards/${this.board_id}/customFields?key=${this.key}&token=${this.token}`
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	get_labels: function(successCallback){
		let trello_path = `${this.endpoint}/boards/${this.board_id}/labels?key=${this.key}&token=${this.token}`;
		myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
	},

	// Gets the label ID list based on label value
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



	// Get a list of Trello Cards
	get_cards: function(list_id, successCallback){
					let trello_path = `${this.endpoint}/lists/${list_id}/cards?key=${this.key}&token=${this.token}`;
					myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
				},

	// Gets a single trello cards
	get_single_card: function(card_id, successCallback){
						let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}`;
						myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
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
					},

	// Creates a new Trello Card
	create_card: function(team_name, label=undefined, successCallback){
					let idLabels = this.__getLabel(label)
					let params = `name=${team_name}&idList=${this.recently_added_list_id}&pos=top&${idLabels}`;
					let trello_path = `${this.endpoint}/cards/?key=${this.key}&token=${this.token}&${params}`
					myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
				},

	// Update a single card
	update_card: function(card_id, new_desc){
					let param = `desc=${new_desc}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "PUT", path : trello_path, failure : Logger.errorHandler});
				},

	// Update the Card's list
	update_card_list: function(card_id, new_list_id, successCallback){
					let param = `idList=${new_list_id}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "PUT", path : trello_path, success:successCallback, failure : Logger.errorHandler});
				},


	// Update a single card
	update_card_wager: function(card_id, wager){
					let param = `text=${wager}`;
					let trello_path = `${this.endpoint}/cards/${card_id}/actions/comments?key=${this.key}&token=${this.token}&${param}`;
					myajax.AJAX({ method: "POST", path : trello_path, data:"", failure : Logger.errorHandler});
				},

	// Gets the set of Trello Lists
	get_lists: function(successCallback){
					let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}`;
					myajax.AJAX({ method: "GET", path : trello_path, success: successCallback, failure : Logger.errorHandler});
				},

	// Create a new list
	create_list: function(listName,successCallback){
					let param = `name=${listName}`
					let trello_path = `${this.endpoint}/boards/${this.board_id}/lists?key=${this.key}&token=${this.token}&${param}`
					myajax.AJAX({ method: "POST", path : trello_path, data:"", success: successCallback, failure : Logger.errorHandler});
				}
}