;(function() {
	'use strict';

	var app = angular.module('cmms')

	app.controller('adminUserCtrl', function($state, users, Session){
	
		console.log('.. adminUserCtrl')

		angular.extend(this, {
			users: users,
			session: Session,
			getClass: function(u) {
				if (u.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(u) {
				//console.log('Clicked on',u.ID, '=',u)
				if (!angular.isDefined(u.selected)) {
					u.selected = false
				}
				u.selected = !u.selected
			},
			clickEdit: function(u) {
				$state.go('admin.edituser',{id: u.ID})
			}
		})
	})

	app.controller('adminNewUserCtrl', function($state,Session,DBUsers,LxNotificationService){
	
		console.log('.. adminNewUserCtrl')

		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			formFields: getUserForm(),
			addUser: function() {
				if (this.form.$valid) {
					this.user.$insert(function(newuser) {
						$state.go('admin.users')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New User - Cancelled')
				$state.go('admin.users')
			}
		})
	})

	app.controller('adminEditUserCtrl', function($state,$stateParams,user,Session){
	
		console.log('.. adminEditUserCtrl', user, $stateParams,$stateParams.id)

		angular.extend(this, {
			session: Session,
			user: user,
			formFields: getUserForm(),		
			submit: function() {
				this.user._id = $stateParams.id
				this.user.$update(function(newuser) {
					$state.go('admin.users')
				})					
			},
			abort: function() {
				$state.go('admin.users')
			}
		})
	})

})();