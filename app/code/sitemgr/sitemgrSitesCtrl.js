;(function() {
	'use strict';

	var app = angular.module('cmms')

	app.controller('sitemgrSitesCtrl', function($state, sites, Session, LxDialogService, logs){
	
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
				$state.go('sitemgr.editsite',{id: s.ID})
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
			}
		})
	})

	app.controller('sitemgrNewSiteCtrl', function($state,Session,DBSites,LxNotificationService){
	
		angular.extend(this, {
			session: Session,
			site: new DBSites(),
			formFields: getSiteForm(),
			addSite: function() {
				if (this.form.$valid) {
					this.site.$insert(function(newsite) {
						$state.go('sitemgr.sites')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Site - Cancelled')
				$state.go('sitemgr.sites')
			}
		})
	})

	app.controller('sitemgrEditSiteCtrl', function($state,$stateParams,site,logs,Session){
	
		angular.extend(this, {
			session: Session,
			site: site,
			logs: logs,
			logClass: logClass,
			formFields: getSiteForm(),		
			submit: function() {
				this.site._id = $stateParams.id
				this.site.$update(function(newsite) {
					$state.go('sitemgr.sites')
				})					
			},
			abort: function() {
				$state.go('sitemgr.sites')
			}
		})
	})


})();