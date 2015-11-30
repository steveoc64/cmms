;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'UserCtrl', 
		['$state','users','Session','LxDialogService','logs','LxNotificationService',
		function($state, users, Session, LxDialogService, logs, LxNotificationService){
	
		angular.extend(this, {
			users: users,
			session: Session,
			logs: logs,
			logClass: logClass,
			sortField: 'UserName',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},					
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
						if (vv.selected && (v.RefID == vv.ID || v.UserID == vv.ID)) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			},
			deleteSelected: function() {
				var vm = this
				LxNotificationService.confirm('Delete Users',
					'Do you want to delete all the selected users ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.users, function(v,k){
								if (v.selected) {
									v.$delete({id: v.ID})
								}
							})
							// Now refresh the users list
							$state.reload()
						}
					})
			}
		})
	}])

	app.controller(base+'NewUserCtrl', 
		['$state','Session','DBUsers','LxNotificationService','sites','skills','$window',
		function($state,Session,DBUsers,LxNotificationService,sites,skills,$window){
	
		angular.extend(this, {
			session: Session,
			user: new DBUsers(),
			sites: sites,
			skills: skills,
			formFields: getUserForm(sites,skills),
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
				$window.history.go(-1)
				//$state.go(base+'.users')
			}
		})
	}])

	app.controller(base+'EditUserCtrl', 
		['$state','$stateParams','user','logs','Session','sites','skills','$window',
		function($state,$stateParams,user,logs,Session,sites,skills,$window){

		angular.extend(this, {
			session: Session,
			user: user,
			logs: logs,
			sites: sites,
			skills: skills,
			formFields: getUserForm(sites,skills),		
			logClass: logClass,
			submit: function() {
				this.user._id = $stateParams.id
				this.user.$update(function(newuser) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
//				$state.go(base+'.users')
			}
		})

	}])

})();