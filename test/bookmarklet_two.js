// Use this script for the following seasons = { 5, }

javascript:(function(){
	let CSV = "Question,A1,C1,A5,C5,A2,C2,A6,C6,A3,C3,A7,C7,A4,C4,A8,C8";

	questions = document.querySelectorAll("table[bgcolor='#808080']");
	answers = document.querySelectorAll("table[bgcolor='#FF8A33']");
	console.log(questions);
	console.log(answers);

	if(questions.length == answers.length)
	{
		console.log("Same amount of questions and answers");

		for(var cidx = 0; cidx < questions.length; cidx++){

			curr_question = questions[cidx].querySelector("td").innerText;
			curr_question = curr_question.replaceAll("\n", "").replaceAll(",", " ");
			CSV += `\n"${curr_question}"`;

			curr_answers  = Array.from(answers[cidx].querySelectorAll("table[bgcolor='#000000'] center"));

			curr_answers.forEach(function(obj){
				text = obj.querySelector("b");
				text = (text !=undefined) ? text.innerText.replaceAll("\n").replaceAll(",", " ") : "NULL,NULL";
				CSV += `,"${text}"`;
			});
		}
	}

	console.log(CSV);
})();

