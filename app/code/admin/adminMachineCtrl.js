;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'MachineCtrl', 
		['$scope','$state','machines','Session','LxDialogService','logs','LxNotificationService',
		function($scope,$state, machines, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			machines: machines,
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
				$state.go(base+'.editmachine',{id: row.ID})
			},
			goSite: function(row) {
				if (row.SiteId != 0) {
					$state.go(base+'.editsite',{id: row.SiteId})
				}
			},
			showLogs: function() {
				LxDialogService.open('machineLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.machines, function(vv,kk){
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
				LxNotificationService.confirm('Delete Machines',
					'Do you want to delete all the selected machines ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.machines, function(v,k){
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

	app.controller(base+'NewMachineCtrl', 
		['$state','Session','DBMachine','LxNotificationService','$window','sites',
		function($state,Session,DBMachine,LxNotificationService,$window,sites){
	
		angular.extend(this, {
			session: Session,
			machine: new DBMachine(),
			sites: sites,
			formFields: getMachineForm(sites),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.machine.$insert(function(newRecord) {
						$state.go(base+'.machines')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Machine - Cancelled')
				$window.history.go(-1)
			}
		})
	}])

	app.controller(base+'EditMachineCtrl', 
		['$state','$stateParams','machine','logs','Session','$window','sites','components','$timeout',
		function($state,$stateParams,machine,logs,Session,$window,sites,components,$timeout){

		angular.extend(this, {
			session: Session,
			machine: machine,
			logs: logs,
			sites: sites,
			components: components,
			formFields: getMachineForm(sites),		
			logClass: logClass,
			submit: function() {
				this.machine._id = $stateParams.id				
				if (angular.isDefined(this.machine.Site)) {
					this.machine.SiteId = this.machine.Site.ID
				} else {
					this.machine.SiteId = 0
				}
				this.machine.$update(function(newmachine) {
					$state.go(base+'.machines')
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.editmachine',{id: row.ID})
			},
		})

		var vm = this
		$timeout(function() {
			vm.machine.Site = vm.machine.SiteName
		}, 200);

	}])

})();