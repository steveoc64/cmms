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
				$state.go(base+'.editevent',{id: row.ID})
			},
			goMachine: function(row) {
				if (row.RefId != 0) {
					$state.go(base+'.editmachine',{id: row.RefId})
				}
			},
			goSite: function(row) {
				if (row.SiteId != 0) {
					$state.go(base+'.editsite',{id: row.SiteId})
				}
			}
		})
	}])

})();