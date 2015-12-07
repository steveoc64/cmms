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
			sortField: 'Name',
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
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.editsite',{id: row.ID})
			},
			goParent: function(row) {
				if (row.ParentSite != 0) {
					$state.go(base+'.editsite',{id: row.ParentSite})
				}
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
				if (l.length < 1) {
					return vm.logs
				}
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
			},
			getMapURI: function(m) {
        return "https://www.google.com/maps?q="+encodeURIComponent(m)
      },

		})
	}])

	app.controller(base+'NewSiteCtrl', 
		['$state','Session','DBSite','LxNotificationService','$window',
		function($state,Session,DBSite,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			site: new DBSite(),
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
		['$state','$stateParams','site','logs','Session','$window','users','$timeout','machines',
		function($state,$stateParams,site,logs,Session,$window,users,$timeout,machines){
	
		angular.extend(this, {
			session: Session,
			site: site,
			logs: logs,
			users: users,
			machines: machines,
			logClass: logClass,
			formFields: getSiteForm(),		
			submit: function() {
				this.site._id = $stateParams.id
				if (angular.isDefined(this.site.ParentSite) && this.site.ParentSite) {
					this.site.ParentSite = this.site.ParentSite.ID
				} else {
					this.site.ParentSite = 0
				}
				this.site.$update(function(newsite) {
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
				$state.go(base+'.editmachine', {id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
			getMapURI: function(m) {
        return "https://www.google.com/maps?q="+encodeURIComponent(m)
      },
			getMachineClass: function(row) {
				if (row.selected) {
					return "data-table__selectable-row--is-selected"
				}
				switch (row.Status) {
					case 'Running':
						return "machine__running"
						break
					case 'Needs Attention':
						return "machine__attention"
						break
					case 'Stopped':
						return "machine__stopped"
						break
					case 'Maintenance Pending':
						return "machine__pending"
						break
					case 'New':
						return "machine__new"
						break
				} // switch
			},
			
		})
/*
		var vm = this
		$timeout(function() {
			vm.site.ParentSite = vm.site.ParentSiteName			
		}, 200);
*/

	}])

})();