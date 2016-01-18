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

			goWorkOrder: function(row) {
				console.log("go to workorder", row)
				$state.go(base+'.editworkorder', {id: row.ID})
			},
		})
		
	}])

})();
