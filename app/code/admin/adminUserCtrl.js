;(function() {
	'use strict';

var base = 'admin'

	var app = angular.module('cmms')

	app.controller(base+'UserCtrl', function($state, users, Session, LxDialogService, logs){
	
		angular.extend(this, {
			users: users,
			session: Session,
			logs: logs,
			logClass: logClass,
			getClass: function(row) {
				if (row.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(row) {
				//console.log('Clicked on',u.ID, '=',u)
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
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

	app.controller(base+'NewUserCtrl', function($state,Session,DBUsers,LxNotificationService,sites,skills){
	
		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			sites: sites,
			skills: skills,
			formFields: getUserForm({},sites,skills),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.user.$insert(function(newRecord) {
						$state.go(base+'.users')
					})					
				} else {
					LxNotificationService.error('Please select a Role for this user')
				}
			},
			abort: function() {
				LxNotificationService.warning('New User - Cancelled')
				$state.go(base+'.users')
			}
		})
	})

	app.controller(base+'EditUserCtrl', function($state,$stateParams,user,logs,Session,sites,skills){

		angular.extend(this, {
			session: Session,
			user: user,
			logs: logs,
			sites: sites,
			skills: skills,
			formFields: getUserForm({},sites,skills),		
			logClass: logClass,
			submit: function() {
				this.user._id = $stateParams.id
				this.user.$update(function(newuser) {
					$state.go(base+'.users')
				})					
			},
			abort: function() {
				$state.go(base+'.users')
			}
		})
	})

})();