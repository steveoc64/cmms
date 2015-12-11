;(function() {
	'use strict';

	var base = 'worker'
	var app = angular.module('cmms')

	app.controller(base+'EditToolCtrl', 
		['$state','$stateParams','Session','$window','component','$timeout','parts','LxDialogService',
		function($state,$stateParams,Session,$window,component,$timeout,parts,LxDialogService){

		angular.extend(this, {
			session: Session,
			component: component,
			parts: parts,
			formFields: getComponentForm(),		
			canEdit: function() {
				return false
			},
			submit: function() {
				this.component._id = $stateParams.id
				this.component.$update(function(newtool) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goPart: function(row) {
				$state.go(base+'.editpart',{id: row.PartID})
			},
			partWidth: function() {
				if (parts.length > 0) {
					var percentage = 100 / (parts.length + 1)
					return "" + percentage + "%"
				}
				return "0"
			},
			// Note that offsets are in reverse, as we run from right to left in the display
			partOffset: function(index) {				
				if (parts.length > 0) {
					var useIndex = parts.length - index -1
					var percentage = useIndex * (100 / parts.length)
					return "" + percentage + "%"
				}
				return "0"
			}

		})

	}])

})();