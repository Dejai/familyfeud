


mydoc.ready(function(){
	Array.from(document.querySelectorAll(".instruction_block h3")).forEach(function(obj){
		obj.addEventListener("click", onClickDetails);
	});		
});

function hideAllOtherSections()
{
	Array.from(document.querySelectorAll(".mainlist")).forEach(function(obj){
		obj.classList.add("hidden");

		section = obj.parentElement;
		icon = section.querySelector(".icon");
		// Toggle the icons
		icon.classList.remove("fa-chevron-circle-up");
		icon.classList.add("fa-chevron-circle-down");
	});	
}

function onClickDetails(event)
{

	let srcEle 	  = event.srcElement;
	let nodeName  = srcEle.nodeName;
	let section   = (nodeName == "I") ? srcEle.parentElement.parentElement : srcEle.parentElement;

	let icon = section.querySelector(".icon");
	let list = section.querySelector(".mainlist");

	let isHidden = (list.classList.contains("hidden")) ? true : false;

	if(isHidden)
	{
		hideAllOtherSections();

		list.classList.remove("hidden");

		// Toggle the icons
		icon.classList.remove("fa-chevron-circle-down");
		icon.classList.add("fa-chevron-circle-up");
	}
	else
	{
		list.classList.add("hidden");
		// Toggle the icons
		icon.classList.remove("fa-chevron-circle-up");
		icon.classList.add("fa-chevron-circle-down");
	}
}