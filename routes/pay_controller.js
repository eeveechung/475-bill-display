var Database = require('../models/mymongo.js'),
	Pay = require('../models/pay.js'),
	this_user = require('../models/auth').this_user


exports.asgnExistingBill = function(req, res) {
	var newPay = {
		bill_name: req.body.bill_name,
		user_name: req.body.user_name,
		payer: req.body.payer,
		partial_amount: req.body.partial_amount,
		obsolete: "1",
		complete: false,
		check: false
	};
	Database.insert(
		"housemates",
		"pays",
		newPay,
		function(model) {
			res.redirect('bills');
		}
	);
};

exports.getPays = function(req, res) {
	console.log("GETTING ALL PAYMENTS..");
	var my_balance = 0
	var data = {
		pay_to_me : [], //what people owe me
        my_payments : [], //what i am owed
        my_past : [], //what i used to owe
        their_payments : [] //what other people owe me or each other
    };
	my_name = this_user.name
	Database.find("housemates","pays","", function(model) {
		model.forEach(function(pay) {
			console.log("pay_controler line 37, pay..", pay);
			if(pay.obsolete == "1"){
				if(pay.payer == my_name || pay.user_name == my_name){
					if(pay.complete == false && pay.payer == my_name){
						data["my_payments"].push(pay);
						my_balance -= pay.partial_amount;
					}
					if(pay.check == false && pay.user_name == my_name){
						data["pay_to_me"].push(pay);
						my_balance += pay.partial_amount;
					}
					if(pay.check==true || pay.complete == true){
						data["my_past"].push(pay);
					}
				}
				else{
					data["their_payments"].push(pay);
				}
			}
			// if(pay.complete==false && pay.obsolete=="1" && pay.check==false){
			// 	if (pay.payer == my_name || pay.user_name == my_name){
			// 		if(pay.payer == my_name){
			// 			my_balance -= pay.partial_amount
			// 			data["my_payments"].push(pay)
			// 			console.log(my_balance)
			// 		}
			// 		else{
			// 			my_balance += pay.partial_amount
			// 			data["pay_to_me"].push(pay)
			// 			console.log(my_balance)
			// 		}
			// 	} else{
			// 	data["their_payments"].push(pay)
			// 	}
			// }
			// else if (pay.complete == true && pay.obsoluete == "1" && pay.check == false && (pay.payer == my_name||pay.user_){
			// 	//my past payments
			// 	data["my_past"].push(pay)
			// }

		})
		res.send({data:data, balance:my_balance})
	})
	console.log(my_balance)
}

exports.completePay = function(req, res) {
	console.log("********");
	console.log(req.params.id);
	console.log("********");
	Pay.findByIdAndUpdate(
		{_id: req.params.id}, {complete:true}, function(err, docs){
		if(err)
			res.json(err);
		else{
			req.params.id
			console.log(docs);
			res.redirect('bills');
		}
	});
}

exports.checkPay = function(req, res) {
	console.log("********");
	console.log(req.params.id);
	console.log("********");
	Pay.findByIdAndUpdate(
		{_id: req.params.id}, {check:true}, function(err, docs){
		if(err)
			res.json(err);
		else{
			req.params.id
			console.log(docs);
			res.redirect('bills');
		}
	});
}

exports.hidePay = function(req, res) {
	console.log("********");
	console.log(req.params.id);
	console.log("********");
	Pay.findByIdAndUpdate(
		{_id: req.params.id}, {obsolete:"0"}, function(err, docs){
		if(err)
			res.json(err);
		else{
			req.params.id
			console.log(docs);
			res.redirect('bills');
		}
	});
}