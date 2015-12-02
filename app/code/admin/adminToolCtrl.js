;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'ToolCtrl', 
		['$scope','$state','components','Session','LxDialogService','logs','LxNotificationService',
		function($scope,$state, components, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			components: components,
			session: Session,
			logs: logs,
			logClass: logClass,
			search: '',
			sortField: 'Name',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},		
			newSearch: function() {
				console.log('New Search', this.search)
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
				$state.go(base+'.edittool',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine',{id: row.MachineID})
			},
			showLogs: function() {
				LxDialogService.open('toolLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.components, function(vv,kk){
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
				LxNotificationService.confirm('Delete Tools',
					'Do you want to delete all the selected tools ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.components, function(v,k){
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

	app.controller(base+'NewToolCtrl', 
		['$state','Session','DBPart','LxNotificationService','$window',
		function($state,Session,DBPart,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			part: new DBPart(),
			formFields: getPartForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.part.$insert(function(newRecord) {
						$state.go(base+'.parts')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Part - Cancelled')
				$window.history.go(-1)
			}
		})
	}])

	app.controller(base+'EditToolCtrl', 
		['$state','$stateParams','logs','Session','$window','component',
		function($state,$stateParams,logs,Session,$window,component){

		angular.extend(this, {
			session: Session,
			component: component,
			logs: logs,
			formFields: getPartForm(),		
			logClass: logClass,
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
			}
		})
	}])

})();