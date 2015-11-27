;(function() {
	'use strict';

	var app = angular.module('cmms')

	app.controller('adminSitesCtrl', function($state, sites, Session, LxDialogService, logs){
	
		console.log('.. adminSitesCtrl')

		angular.extend(this, {
			sites: sites,
			session: Session,
			logs: logs,
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
				$state.go('admin.editsite',{id: u.ID})
			},
			showLogs: function() {
				LxDialogService.open('siteLogDialog')
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

	app.controller('adminNewSiteCtrl', function($state,Session,DBSites,LxNotificationService){
	
		console.log('.. adminNewSiteCtrl')

		angular.extend(this, {
			session: Session,
			site: new DBSites(),
			formFields: getSiteForm(),
			addSite: function() {
				if (this.form.$valid) {
					this.site.$insert(function(newsite) {
						$state.go('admin.sites')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Site - Cancelled')
				$state.go('admin.sites')
			}
		})
	})

	app.controller('adminEditSiteCtrl', function($state,$stateParams,site,logs,Session){
	
		console.log('.. adminEditSiteCtrl', site, $stateParams,$stateParams.id)

		angular.extend(this, {
			session: Session,
			site: site,
			logs: logs,
			formFields: getSiteForm(),		
			submit: function() {
				this.site._id = $stateParams.id
				this.site.$update(function(newsite) {
					$state.go('admin.sites')
				})					
			},
			abort: function() {
				$state.go('admin.sites')
			}
		})
	})


})();