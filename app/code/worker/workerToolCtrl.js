;(function() {
	'use strict';

	var base = 'worker'
	var app = angular.module('cmms')

	app.controller(base+'EditToolCtrl', 
		['$state','$stateParams','Session','$window','component','machine','$timeout','parts','LxDialogService','DBRaiseToolEvent','events','LxNotificationService',
		function($state,$stateParams,Session,$window,component,machine,$timeout,parts,LxDialogService,DBRaiseToolEvent,events,LxNotificationService){

		angular.extend(this, {
			session: Session,
			component: component,
			parts: parts,
			machine: machine,
			events: events,
			formFields: getComponentWorkerForm(),		
			alertFields: getComponentAlertForm(),
			haltFields: getComponentHaltForm(),
			eventHandler: DBRaiseToolEvent,		
			canEdit: function() {
				return false
			},
			canStop: function() {
				return this.machine.IsRunning
			},
			submit: function() {
				this.component._id = $stateParams.id
				this.component.$update(function(newtool) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$state.go(base+'.editmachine',{id: this.machine.ID})
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goPart: function(row) {
				$state.go(base+'.editpart',{id: row.PartID})
			},
			partWidth: function() {
				if (parts.length > 0) {
					var percentage = 100 / (parts.length + 1)
					return "" + percentage + "%"
				}
				return "0"
			},
			// Note that offsets are in reverse, as we run from right to left in the display
			partOffset: function(index) {				
				if (parts.length > 0) {
					var useIndex = parts.length - index -1
					var percentage = useIndex * (100 / parts.length)
					return "" + percentage + "%"
				}
				return "0"
			},
			raiseIssue: function() {
				LxDialogService.open('raiseIssueDialog')
			},
			submitAlert: function(opt) {
				console.log('eventFields=',this.eventFields)
				if (this.eventFields.AlertDescr.length > 0) {
					var vm = this
					this.eventHandler.raise({
						tool: $stateParams.id,
						action: 'Alert',
						descr: this.eventFields.AlertDescr
					})
					LxDialogService.close('raiseIssueDialog')
					LxNotificationService.info('New Issue Raised')
					$timeout(function(){
						$state.go(base+'.editmachine',{id: vm.component.MachineID})					
					}, 600)					
				} else {
					LxDialogService.close('raiseIssueDialog')
				}
			},
			submitHalt: function() {
				if (this.eventFields.HaltDescr.length > 0) {
					var vm = this
					this.eventHandler.raise({
						tool: $stateParams.id,
						action: 'Halt',
						descr: this.eventFields.HaltDescr
					})
					LxDialogService.close('raiseIssueDialog')
					LxNotificationService.error('Machine Halted')
					$timeout(function(){
						$state.go(base+'.editmachine',{id: vm.component.MachineID})					
					}, 600)					
				} else {
					LxDialogService.close('raiseIssueDialog')					
				}
			}


		})

	}])

})();