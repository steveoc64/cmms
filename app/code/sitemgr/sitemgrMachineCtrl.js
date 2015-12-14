;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'MachineCtrl', 
		['$scope','$state','machines','Session','LxDialogService','LxNotificationService','socket','DBMachine',
		function($scope,$state, machines, Session, LxDialogService, LxNotificationService,socket,DBMachine){
	
			var vm = this
			socket.ws.onMessage(function(msg){
				console.log("Rx Msg",msg)
				if (msg.data == "machine") {
					vm.machines = DBMachine.query()					
				}
			})

		angular.extend(this, {
			machines: machines,
			session: Session,
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
				}
			},
			clickEdit: function(row) {
				$state.go(base+'.editmachine',{id: row.ID})
			},
			goSite: function(row) {
				if (row.SiteId != 0) {
					$state.go(base+'.editsite',{id: row.SiteId})
				}
			}
		})

	}])

	app.controller(base+'EditMachineCtrl', 
		['$state','$stateParams','machine','Session','$window','components','$timeout','LxDialogService','parts',
		function($state,$stateParams,machine,Session,$window,components,$timeout,LxDialogService,parts){

		angular.extend(this, {
			session: Session,
			machine: machine,
			parts: parts,
			components: components,
			formFields: getMachineForm(),	
			getSVGClass: function() {
				switch (machine.Status) {
					case 'Stopped':
						return "machine-svg-stopped"
					case 'Needs Attention':
						return "machine-svg-attn"
					case 'Maintenance Pending':
						return "machine-svg-pending"
					default: 
						return "machine-svg"
				}
			},			
			canEdit: function() {
				return false
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.editmachine',{id: row.ID})
			},
			goTool: function(row) {
				$state.go(base+'.edittool',{id: row.ID})
			},
			goPart: function(row) {
				$state.go(base+'.editpart',{id: row.ID})
			},
			getToolArray: function(row) {
				// dynamically create an array of the same tool
				var tools = []
				tools.push(row)
				for (var i = 2; i < row.Qty; i++) {
					tools.push(angular.copy(row))
				}
				return tools
			},
			toolWidth: function() {
				if (components.length > 0) {
					var percentage = 100 / (components.length + 1)
					return "" + percentage + "%"
				}
				return "0"
			},
			// Note that offsets are in reverse, as we run from right to left in the display
			toolOffset: function(index) {				
				if (components.length > 0) {
					var useIndex = components.length - index -1
					var percentage = useIndex * (100 / components.length)
					return "" + percentage + "%"
				}
				return "0"
			}
		})

	}])

})();