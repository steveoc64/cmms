;(function() {
	'use strict';

	angular.module('cmms').controller('adminUserCtrl', function(users){
	
		console.log('.. adminUserCtrl')

		angular.extend(this, {
			users: users,
			getClass: function(u) {
				if (u.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(u) {
				console.log('Clicked on',u.ID, '=',u)
				if (!angular.isDefined(u.selected)) {
					u.selected = false
				}
				u.selected = !u.selected
			},
			clickEdit: function(u) {
				console.log('Edit click for',u.ID)
			}
		})

	})

})();