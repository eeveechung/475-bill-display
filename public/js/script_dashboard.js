$(document).ready(function(){
	console.log("In dashboard_script.js")
	updateDashboardGroceries()
	updateDashboardBills()
	updateDashboardChores()
});

function updateDashboardGroceries(){
	console.log("----  IN Get Groceries SCRIPT---- ")
	$.ajax({
			url: "getGroceryListNotBought",
			type: "get",
			data: {},
			success: function(data) {
				message = data
				$('#grocery-not-bought').html(message);
				updateDashboardChores()
			}
	});
	
	return false;
}

function updateDashboardBills(){
	console.log("---- IN Get Bills SCRIPT---- ")
	$.ajax({
		url: "getBills",
		type: "get",
		data: {},
		success: function(bills) {
			if (bills.length == 0) {
				message1 = "You currently don't owe any money."
				$("#my-payments").html(message1);
				message2 = "No one owes you any bill payments."
				$("#pay-to-me").html(message2);
			} else {
				console.log(bills)
				$.ajax({
					url: "getPays",
					type: "get",
					data: {},
					success: function(pays){
						console.log(pays)
						my_payments = pays.data["my_payments"]
						pay_to_me = pays.data["pay_to_me"]
						my_message = parseMyPayments(my_payments, bills)
						ptm_message = parsePTMPayments(pay_to_me, bills)
						if (my_message.length != "") {
							$("#my-payments").html(my_message)
						}else{
							$("#my-payments").html("You currently don't owe any money.")
						}
						if (ptm_message.length != ""){
							$("#pay-to-me").html(ptm_message)
						} else{
							$("#pay-to-me").html("No one owes you any bill payments.")
						}
					}
				})
			}
		}
	}); 
	return false;
}

function updateDashboardChores(){
	console.log("----  IN Get Chores SCRIPT---- ")
	$.ajax({
			url: "getChores",
			type: "get",
			data: {},
			success: function(chores) {
				console.log(chores)
				if (chores.length == 0){
					$("#my-chores").html("There are currently no chores for you to do. Celebrate with some TV.")
				}
				else{
					$.ajax({
					url: "getAssigns",
					type:"get",
					data:{},
					success: function(assigns){
						console.log(assigns)
						my_assignments = assigns["my_assignments"]
						console.log("Parsing My ")
						my_message = parseAssignments(my_assignments, chores)
						
						if (my_message.length != ""){
							$("#my-chores").html(my_message)
						} else{ $("#my-chores").html("You don't have any chores assigned to you.")}
						
					}
					})

					// message = ""
					// data.forEach(function(d){
					// 	due = new Date(d.due_date)
					// 	message += d.chore_name +" is due on " + due.toDateString() + "<br>"
					// })
					
					// $("#my-chores").html(message)
				}
			}
	});
	return false;
};

function parseAssignments( assigns , chores ){
	message = "" 
	console.log(chores)
	assigns.forEach(function(a){
		chore_name = a.chore_name
		console.log(a)
		chores.forEach(function(chore){
			if (chore.chore_name == chore_name ){
				due_date = new Date(chore.due_date).toDateString()
				message += "You are assigned to do " + chore.chore_name + " due on " + due_date + "<br>"
			}
		})
	})
	return message
}

function parseMyPayments( pays, bills) {
	message2 = ""
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				message2 += "You owe " + bill.user_name + " $" + p.partial_amount + " for " + bill.bill_name + " bill <br>"
			}
		})
	})
	return message2
}

function parsePTMPayments( pays, bills) {
	message2 = ""
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				message2 += p.payer +" owes you $" + p.partial_amount + " for " + bill.bill_name + " bill <br>"
			}
		})
	})
	return message2
}