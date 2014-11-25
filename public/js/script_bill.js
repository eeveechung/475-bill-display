$(function() {
	getBills();
	jQuery("#tab1").show()
	jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
 
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });

})

function getBills() {
	console.log("running getBills in script_bill_add.js");
	$.ajax({
		url: "getBills",
		type: "get",
		data: {},
		success: function(bills) {
			if (bills.length == 0){
				message = "There are no bills yet."
				$("#all-bills").html(message)
			} else {
				$.ajax({
					url: "getPays",
					type: "get",
					data: {},
					success: function(pays){
						my_balance = "Balance: $"+pays.balance.toFixed(2)
						console.log(pays)
						pay_to_me = pays.data["pay_to_me"]
						my_payments = pays.data["my_payments"]
						my_past_payments = pays.data["my_past"]
						their_payments = pays.data["their_payments"]
						total_balance = pays.data["total_balance"]
						// console.log("Parsing My ") 
						pay_me_message = parseMyPayments(pay_to_me, bills)
						my_message = parseOwedPayments(my_payments, bills)
						my_past_message = parsePastPayments(my_past_payments, bills)
						their_message = parsePayments(their_payments, bills)

						$("#total-balance").html(total_balance);

						if (pay_me_message != "") {
							$("#pay-to-me").html(pay_me_message);
							console.log("1");
						} else{ 
							$("#pay-to-me").html("You don't have any payments.")
							console.log("2");
						}
						if (my_past_message != "") {
							$("#my-past-payments").html(my_past_message)
							console.log("3");
						} else{ 
							$("#my-past-payments").html("You haven't made any payments.")
							console.log("4");
						}
						if (my_message != "") {
							$("#my-payments").html(my_message)
							console.log("5");
						} else{ 
							$("#my-payments").html("You don't have any bills assigned to you.")
							console.log("6");
						}
						if (their_message != ""){
							$("#their-payments").html(their_message)
							console.log("7");
						} else{
							$("#their-payments").html("No on else has to pay any bills.")
							console.log("8");
						}
					} 
				})
			}
		}
	}); 
	return false;
}



function parsePayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Paid From</center></b></td>'+
		'<td><b><center>Pay To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Hide?</center></b></td>'
		pays.forEach(function(p) {
		bill_name = p.bill_name
		console.log(p)
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name && p.obsolete!="0"){
				date = new Date(bill.date).toDateString()
					message += '<tr><td>'+p.date+'</td><td>'+p.payer+'</td><td>'+p.user_name+'</td><td>$' + p.partial_amount + '</td><td>' + bill.bill_name
					+ '</td>' + '<td><a id="complete-b" href="/hidePay/' + p._id + '">Hide</a>'+'</td></tr>';
			}
		})
	})
	}
	return message
}

function parseMyPayments( pays, bills) {
	console.log("hello");
	var message = ""
	if (pays.length !=0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Lent To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Complete?</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete=="1" && p.check==false){
					date = new Date(bill.date).toDateString()
					message += '<tr><td>'+p.date+'</td><td>'+ p.payer + '</td><td> $' + p.partial_amount + '</td><td>' + bill.bill_name + '</td>'
					+ '<td><a id="complete-b" href="/completePay/' + p._id + '">Complete</a></td>';
				}
			})
		})
	}
	return message
}

function parsePastPayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Paid From</center></b></td>'+
		'<td><b><center>Pay To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Hide?</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete!="0" && (p.check==true||p.completed==true)){
					date = new Date(bill.date).toDateString()
					if(p.completed==true || p.check==true){
						//payments others people have paid me
						if(p.check==true){
							message += '<tr><td>'+p.date+'</td><td>You</td><td>'+p.user_name+'</td><td>$' + p.partial_amount + '</td><td>' + bill.bill_name
							+ '</td>' + '<td><a id="complete-b" href="/hidePay/' + p._id + '">Hide</a>'+'</td></tr>';
						}
						//payments I have made to others
						else{
							message += '<tr><td>'+p.date+'</td><td>'+p.payer+'</td><td>You</td><td>$' + p.partial_amount + '</td><td>' + bill.bill_name
							+ '</td>' + '<td><a id="complete-b" href="/hidePay/' + p._id + '">Hide</a>'+'</td></tr>';
						}

					}
				}
			})
		})
		message += '</table>'	
	}
	
	return message
}

function parseOwedPayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Lent From</center></b></td>'+
		'<td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Complete?</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete=="1"&& p.completed==false) {
					date = new Date(bill.date).toDateString()
					message += '<tr><td>'+p.date+'</td><td>'+ p.user_name + '</td><td> $' + p.partial_amount + '</td><td>' + bill.bill_name + '</td>'
					+ '<td><a id="complete-b" href="/checkPay/' + p._id + '">Complete</a></td>';
				}
			})
		})
		message += '</table>'
	}
	
	return message
}

//jQuery(document).ready(function() {   
//});