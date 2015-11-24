;(function() {
	'use strict';

	angular.module('cmms').controller('adminUserCtrl', function(users, Session){
	
		console.log('.. adminUserCtrl')

		angular.extend(this, {
			label: 'adminUserCtrl',
			users: users,
			session: Session,
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