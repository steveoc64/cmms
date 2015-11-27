;(function() {
	'use strict';

	var app = angular.module('cmms')

	app.controller('sitemgrUserCtrl', function($state, users, Session, LxDialogService, logs){
	
		angular.extend(this, {
			users: users,
			session: Session,
			logs: logs,
			logClass: logClass,
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
				$state.go('sitemgr.edituser',{id: u.ID})
			},
			showLogs: function() {
				LxDialogService.open('userLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.users, function(vv,kk){
						if (vv.selected && v.Ref == vv.ID) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			}
		})
	})

	app.controller('sitemgrNewUserCtrl', function($state,Session,DBUsers,LxNotificationService){
	
		console.log('.. sitemgrNewUserCtrl')

		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			formFields: getUserForm(),
			addUser: function() {
				if (this.form.$valid) {
					this.user.$insert(function(newuser) {
						$state.go('sitemgr.users')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New User - Cancelled')
				$state.go('sitemgr.users')
			}
		})
	})

	app.controller('sitemgrEditUserCtrl', function($state,$stateParams,user,logs,Session){
	
		console.log('.. sitemgrEditUserCtrl', user, $stateParams,$stateParams.id)

		angular.extend(this, {
			session: Session,
			user: user,
			logs: logs,
			logClass: logClass,
			formFields: getUserForm(),		
			submit: function() {
				this.user._id = $stateParams.id
				this.user.$update(function(newuser) {
					$state.go('sitemgr.users')
				})					
			},
			abort: function() {
				$state.go('sitemgr.users')
			}
		})
	})

})();