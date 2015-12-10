;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'EditPartCtrl', 
		['$state','$stateParams','part','Session','$window','components','LxDialogService','vendors',
		function($state,$stateParams,part,Session,$window,components,LxDialogService,vendors){

		angular.extend(this, {
			session: Session,
			part: part,
			components: components,
			vendors: vendors,
			formFields: getPartForm(),		
			canEdit: function() {
				return false
			},
			submit: function() {
				this.part._id = $stateParams.id
				this.part.$update(function(newpart) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine',{id: row.MachineID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteID})
			},
			goTool: function(row) {
				$state.go(base+".edittool",{id: row.ComponentID})
			}
		})
	}])

})();