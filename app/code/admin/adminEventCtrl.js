;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'EventCtrl', 
		['$state','events','Session','LxDialogService','logs','LxNotificationService',
		function($state, events, Session, LxDialogService, logs, LxNotificationService){
	
		angular.extend(this, {
			events: events,
			session: Session,
			logs: logs,
			logClass: logClass,
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
			goAudit: function(row) {
				LxDialogService.close('siteLogDialog')
				$state.go(base+'.editsite',{id: row.RefID})
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
			getMapURI: function(addr) {
			  return "https://www.google.com/maps?q="+encodeURIComponent(addr)
			},

		})
	}])

})();