var Database = require('../models/mymongo.js'),
	Pay = require('../models/pay.js'),
	this_user = require('../models/auth').this_user


exports.asgnExistingBill = function(req, res) {
	var newPay = {
		bill_name: req.body.bill_name,
		user_name: req.body.user_name,
		payer: req.body.payer,
		partial_amount: req.body.partial_amount,
		date: req.body.date,
		obsolete: "1",
		completed: false,
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
        their_payments : [], //what other people owe me or each other
        total_balance : []
    };

	my_name = this_user.name

	Database.find("housemates","pays","", function(model) {
		model.forEach(function(pay) {
			console.log("pay_controler line 37, pay..", pay);
			if(pay.obsolete == "1"){
				if(pay.payer == my_name || pay.user_name == my_name){
					if(pay.completed == false && pay.payer == my_name){
						data["my_payments"].push(pay);
						my_balance -= pay.partial_amount;
					}
					if(pay.check == false && pay.user_name == my_name){
						data["pay_to_me"].push(pay);
						my_balance += pay.partial_amount;
					}
					if(pay.check==true || pay.completed == true){
						data["my_past"].push(pay);
					}
				}
				else{
					data["their_payments"].push(pay);
				}
			}
		})
		for(var i=0; i<this_user.members.length; i++){
			individual_balance = []
			console.log(this_user.members[i])
			findbalance(this_user.members[i], function(b){
				individual_balance.push(this_user.members[i])
				individual_balance.push(b)
			})
			data["total_balance"].push(individual_balance)
		}
		console.log("line 60: data....",data)
		data["my_payments"].sort(compare_date);
		data["pay_to_me"].sort(compare_date);
		data["my_past"].sort(compare_date);

		res.send({data:data, balance:my_balance})
	})
	console.log(my_balance)
}

//for checking off payments I owed
exports.completePay = function(req, res) {
	console.log("********");
	console.log(req.params.id);
	console.log("********");
	Pay.findByIdAndUpdate(
		{_id: req.params.id}, {completed:true}, function(err, docs){
		if(err)
			res.json(err);
		else{
			req.params.id
			console.log(docs);
			res.redirect('bills');
		}
	});
}

//for checking off payments others paid
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

function findbalance(person, callback){
	var person_balance = 0;
	Database.find("housemates","pays","", function(model) {
		model.forEach(function(pay) {
			if(pay.obsolete == "1"){
				if(pay.check == false && pay.user_name==person){
					person_balance += pay.partial_amount;
					console.log(person, person_balance)
				}
				if(pay.completed == false && pay.payer==person){
					person_balance -= pay.partial_amount;
					console.log(person, person_balance)

				}
			}

		})
		console.log("lastlog", person, person_balance)
	})
	callback(person_balance);
}

function compare_date(a,b) {
  if (a.date< b.date)
     return -1;
  if (a.date > b.date)
    return 1;
  return 0;
}