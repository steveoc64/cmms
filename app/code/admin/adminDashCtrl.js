;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'DashCtrl',
		['$state','Session','LxDialogService','LxNotificationService','socket','workorders','DBWorkOrder',
		function($state, Session, LxDialogService, LxNotificationService, socket, workorders, DBWorkOrder){

		// Subscribe to changes in the workorder list
		var vm = this
		socket.on("workorder",function(msg){
			console.log("Work Order Update, reload list", msg)
			vm.workorders = DBWorkOrder.query()
		})

		angular.extend(this, {
			workorders: workorders,

			getWOClass: function(row) {
				// get the date from the row
				var rd = new Date(row.StartDate)
				var now = new Date()
				var age = (now - rd)/(3600000 * 24)
				console.log(rd, age, "hrs")

				if (age < -10) { return "age-10" }
				if (age < -9) { return "age-9" }
				if (age < -8) { return "age-8" }
				if (age < -7) { return "age-7" }
				if (age < -6) { return "age-6" }
				if (age < -5) { return "age-5" }
				if (age < -4) { return "age-4" }
				if (age < -3) { return "age-3" }
				if (age < -2) { return "age-2" }
				if (age < 0) { return "age-1" }
				if (age < 1) { return "age0" }
				if (age < 2) { return "age1" }
				if (age < 3) { return "age2" }
				if (age < 4) { return "age3" }
				if (age < 5) { return "age4" }
				if (age < 6) { return "age5" }
				if (age < 7) { return "age6" }
				if (age < 8) { return "age7" }
				if (age < 9) { return "age8" }
				if (age < 10) { return "age9" }
				return "age10" 
			},
			goWorkOrder: function(row) {
				$state.go(base+'.editworkorder', {id: row.ID})
			},
		})
		
	}])

})();
