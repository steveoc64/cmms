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
			sortField: 'StockCode',
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
			goAudit: function(row) {
				LxDialogService.close('toolLogDialog')
				$state.go(base+'.edittool',{id:row.RefID})
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
				if (l.length < 1) {
					return vm.logs
				}
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
		['$state','Session','DBComponent','LxNotificationService','$window',
		function($state,Session,DBComponent,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			component: new DBComponent(),
			formFields: getComponentForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.component.$insert(function(newRecord) {
						$state.go(base+'.tools')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Tool - Cancelled')
				$window.history.go(-1)
			}
		})
	}])

	app.controller(base+'EditToolCtrl', 
		['$state','$stateParams','logs','Session','$window','component','$timeout','parts','LxDialogService',
		function($state,$stateParams,logs,Session,$window,component,$timeout,parts,LxDialogService){

		angular.extend(this, {
			session: Session,
			component: component,
			parts: parts,
			logs: logs,
			formFields: getComponentForm(),		
			logClass: logClass,
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },									
			submit: function() {
				this.component._id = $stateParams.id
				this.component.$update(function(newtool) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goPart: function(row) {
				$state.go(base+'.editpart',{id: row.MachineID})
			},
		})

	}])

})();