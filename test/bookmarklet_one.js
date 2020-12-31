// Use this script for the following seasons = { 16, }
// Used for seasons = {16}
function mytest(){
	let centered = document.querySelectorAll("center");

	let CSV = "Question,A1,C1,A5,C5,A2,C2,A6,C6,A3,C3,A7,C7,A4,C4,A8,C8";

	console.log(centered);

	let questions = [];

	let curr_obj = {};

	for(var cidx = 0; cidx < centered.length; cidx++){
		obj = centered[cidx];

		counter = cidx+1;
		modulo = counter % 4;

		if(modulo == 1){
			value = obj.querySelector("font").innerText.replaceAll("\n", "").replaceAll(",", " ")
			CSV += `\n"${value}"`;
		}

		if(modulo == 2){
			console.log("Skipping this centered object");
		}

		if (modulo == 3){
			answer_cells = Array.from(obj.querySelectorAll("p[align='CENTER']"));
			
			answer_cells.forEach(function(obj){
				text = obj.querySelector("b");
				text = (text !=undefined) ? text.innerText.replaceAll("\n").replaceAll(",", " ") : "NULL";
				CSV += `,"${text}"`;
			});
		}
	}

	console.log(CSV);
}






javascript:(function(){
	let centered = document.querySelectorAll("center");

	let CSV = "Question,A1,C1,A5,C5,A2,C2,A6,C6,A3,C3,A7,C7,A4,C4,A8,C8";

	console.log(centered);

	let questions = [];

	let curr_obj = {};

	for(var cidx = 0; cidx < centered.length; cidx++){
		obj = centered[cidx];

		counter = cidx+1;
		modulo = counter % 4;

		if(modulo == 1){
			ele = obj.querySelector("font");
			text = "";
			if(ele != undefined){
				value = ele.innerText.replaceAll("\n", "").replaceAll(",", " ").replaceAll("\"","\'");
				text = `\n"${value}"`;
			}
			else{
					text = `\n""`;
			}
			CSV += `${text}`;
		}

		if(modulo == 2){
			console.log("Skipping this centered object");
		}

		if (modulo == 3){
			answer_cells = Array.from(obj.querySelectorAll("p[align='CENTER']"));
			
			answer_cells.forEach(function(obj){
				ele = obj.querySelector("b");
				text = "";
				if(ele != undefined)
				{
					value = ele.innerText.replaceAll("\n").replaceAll(",", " ");
					text = `,"${value}"`;
				}
				else
				{
					text = `,"",""`;
				}
				CSV += `${text}`;
			});
		}
	}

	console.log(CSV);
})();

