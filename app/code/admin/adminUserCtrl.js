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
				console.log('Edit click for',u.ID)
				$state.go('admin.edituser',{id: u.ID})
			}
		})
	})

	app.controller('adminNewUserCtrl', function($state,Session,DBUsers,LxNotificationService){
	
		console.log('.. adminNewUserCtrl')

		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			roles: ['Public','Worker','Vendor','Service Contractor','Site Mananger','Admin'],
			addUser: function(form) {
				if (form.$valid) {
					// convert the SMS into a string
					user.SMS = ' '+user.SMS
					this.user.$insert(function(somevalue) {
						console.log('insert returned with',somevalue)
						$state.go('admin.users')
					})					
				} else {
					LxNotificationService.error('Field Errors')
				}
			},
			abort: function() {
				LxNotificationService.warning('New User - Cancelled')
				$state.go('admin.users')
			}
		})
	})

	app.controller('adminEditUserCtrl', function($state,user,Session){
	
		console.log('.. adminEditUserCtrl', user)

		angular.extend(this, {
			session: Session,
			Username: '',
			Passwd: '',
			Name: '',
			Email: '',
			Address: '',
			SMS: '',
			SideId: 0,
			Role: 'public',
			roles: ['Public','Worker','Vendor','Service Contractor','Site Mananger','Admin'],
			addUser: function() {
				console.log('save user')
			},
			abort: function() {
				console.log('abort')
				$state.go('admin.users')
			}
		})
	})

})();