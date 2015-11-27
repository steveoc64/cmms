;(function() {
	'use strict';

	var app = angular.module('cmms')

	var logClass = function(l) {
				switch (l.Status) {
					case 1:
						return 'syslog-status-1'
						break
					case 2:
						return 'syslog-status-2'
						break
					case 3:
						return 'syslog-status-3'
						break
				}
				return ''
			}

	app.controller('adminUserCtrl', function($state, users, Session, LxDialogService, logs){
	
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
				$state.go('admin.edituser',{id: u.ID})
			},
			showLogs: function() {
				LxDialogService.open('userLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.users, function(vv,kk){
						if (vv.selected && v.RefID == vv.ID) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			}
		})
	})

	app.controller('adminNewUserCtrl', function($state,Session,DBUsers,LxNotificationService){
	
		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			formFields: getUserForm(),
			logClass: logClass,
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

	app.controller('adminEditUserCtrl', function($state,$stateParams,user,logs,Session){

		angular.extend(this, {
			session: Session,
			user: user,
			logs: logs,
			formFields: getUserForm(),		
			logClass: logClass,
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