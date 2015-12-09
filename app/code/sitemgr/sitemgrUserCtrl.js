;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'UserCtrl', 
		['$state','users','Session','LxDialogService','LxNotificationService',
		function($state, users, Session, LxDialogService,  LxNotificationService){
	
		angular.extend(this, {
			users: users,
			session: Session,
			sortField: 'UserName',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},					
			clickEdit: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
		})
	}])


	app.controller(base+'EditUserCtrl', 
		['$state','$stateParams','user','Session','$window','LxDialogService',
		function($state,$stateParams,user,Session,$window,LxDialogService){

		angular.extend(this, {
			session: Session,
			user: user,
			formFields: getUserViewForm(),		
			canEdit: function() {
				return false
			},
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