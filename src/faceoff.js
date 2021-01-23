
mydoc.ready(function(){

	// Load the voice options once page loaded
	Speaker.loadVoiceOptions();

	// Set the button height
	setButtonHeight();

	// Set the team names
	setTeamNames();

	// Set listener ups
	faceOffListenerOnKeyUp();

});

function setButtonHeight()
{
	let innerHeight = window.innerHeight;
	let half = innerHeight / 2;
	Array.from(document.querySelectorAll(".face_off_section")).forEach(function(obj){
		obj.style.height = half + "px";
	});
}

function faceOffListenerOnKeyUp()
{
	document.addEventListener("keyup", function(event){
		switch(event.code)
		{
			case "ShiftRight":
				document.getElementById("player_two").click();
				break;
			case "ShiftLeft":
				document.getElementById("player_one").click();
				break;
			default:
				return;
		}
	});	
}

// Adds a listener for keystrokes (on keyup);
function gameBoardListenerOnKeyUp(){

	document.addEventListener("keyup", function(event){
		// console.log(event);
		switch(event.code)
		{
			case "Enter":
			case "NumpadEnter":
				if(GAME_STARTED)
				{
					document.getElementById("next_round_button").click();				
				}
				else
				{
					document.getElementById("startGameButton").click();
				}
				break;

			case "Escape":
			case "NumpadSubtract":
				onWrongAnswer();
				break;

			case "Digit1":
			case "Digit2":
			case "Digit3":
			case "Digit4":
			case "Digit5":
			case "Digit6":
			case "Digit7":
			case "Digit8":
			case "Numpad1":
			case "Numpad2":
			case "Numpad3":
			case "Numpad4":
			case "Numpad5":
			case "Numpad6":
			case "Numpad7":
			case "Numpad8":
				onRevealAnswer(event.code);
				break;
				
			default:
				return;
		}
	});	
}

function cleanTeamName(value)
{
	let cleanName = value.replaceAll("+", " ");
	return cleanName
}

function setTeamNames()
{
	let searchString = location.search;

	let queryMap = mydoc.get_query_map();

	let teamOne = (queryMap["team1"] != undefined) ? queryMap["team1"] : "Player One";
	let teamTwo = (queryMap["team2"] != undefined) ? queryMap["team2"] : "Player Two";

	document.getElementById("player_one").innerText = cleanTeamName(teamOne);
	document.getElementById("player_two").innerText = cleanTeamName(teamTwo);

}

var FACE_OFF_WINNER = false;
function face_off_winner(player, name)
{
	// If already a winner, return;
	if(FACE_OFF_WINNER){ return; }

	FACE_OFF_WINNER = true; 
	document.getElementById(player).classList.add("face_off_winner");
	// Play sound;
	document.getElementById("face_off_buzzer_sound").play();

	// Indicate player by voice
	setTimeout(function(){
		Speaker.speakText(name);
	}, 1200);

	setTimeout(function(){
		FACE_OFF_WINNER = false; 
		document.getElementById(player).classList.remove("face_off_winner");
	}, 5000);
}