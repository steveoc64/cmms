;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'SitesCtrl', 
		['$state','sites','Session','LxDialogService','logs','LxNotificationService',
		function($state, sites, Session, LxDialogService, logs, LxNotificationService){
	
		angular.extend(this, {
			sites: sites,
			session: Session,
			logs: logs,
			logClass: logClass,
			getClass: function(s) {
				if (s.selected) {
					return "data-table__selectable-row--is-selected"
				}
			},
			clickedRow: function(s) {
				if (!angular.isDefined(s.selected)) {
					s.selected = false
				}
				s.selected = !s.selected
			},
			clickEdit: function(s) {
				$state.go(base+'.editsite',{id: s.ID})
			},
			showLogs: function() {
				LxDialogService.open('siteLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.sites, function(vv,kk){
						if (vv.selected && v.RefID == vv.ID) {
							l.push(v)
						}
					})
				})
				// l now contains filtered logs
				return l
			},
			deleteSelected: function() {
				var vm = this
				LxNotificationService.confirm('Delete Sites',
					'Do you want to delete all the selected sites ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.sites, function(v,k){
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

	app.controller(base+'NewSiteCtrl', 
		['$state','Session','DBSites','LxNotificationService','$window',
		function($state,Session,DBSites,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			site: new DBSites(),
			formFields: getSiteForm(),
			submit: function() {
				if (this.form.$valid) {
					this.site.$insert(function(newsite) {
						$state.go(base+'.sites')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Site - Cancelled')
				$window.history.go(-1)
				//$state.go(base+'.sites')
			}
		})
	}])

	app.controller(base+'EditSiteCtrl', 
		['$state','$stateParams','site','logs','Session','$window',
		function($state,$stateParams,site,logs,Session,$window){
	
		angular.extend(this, {
			session: Session,
			site: site,
			logs: logs,
			logClass: logClass,
			formFields: getSiteForm(),		
			submit: function() {
				this.site._id = $stateParams.id
				this.site.$update(function(newsite) {
					$state.go(base+'.sites')
				})					
			},
			abort: function() {
				$window.history.go(-1)
				//$state.go(base+'.sites')
			}
		})
	}])


})();