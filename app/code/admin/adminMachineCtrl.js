;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'MachineCtrl', 
		['$scope','$state','machines','Session','LxDialogService','logs','LxNotificationService','socket','DBMachine',
		function($scope,$state, machines, Session, LxDialogService, logs,LxNotificationService,socket,DBMachine){

		// Subscribe to changes in the machine list	
		var vm = this
		socket.on("machine",function(msg){
			console.log("Machine event - reload full list",msg)
			vm.machines = DBMachine.query()					
		})

		angular.extend(this, {
			machines: machines,
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
			clickedRow: function(row) {
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.editmachine',{id: row.ID})
			},
			goAudit: function(row) {
				LxDialogService.close('machineLogDialog')
				$state.go(base+'.editmachine',{id: row.RefID})
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
				if (l.length < 1) {
					return vm.logs
				}
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
		['$state','Session','DBMachine','LxNotificationService','$window',
		function($state,Session,DBMachine,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			machine: new DBMachine(),
			formFields: getMachineForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.machine.Status = 'New - to be Installed'
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
		['$state','$stateParams','machine','logs','Session','$window','components','$timeout','LxDialogService','parts','events','docs',
		'DBDocServer','LxProgressService','Upload','socket','DBDocs',
		'DBMachine','DBMachineComponents','DBMachineParts','DBMachineEvents','DBSysLog',
		'tasks','DBRaiseMachineEvent','DBComponentEvents','DBEventDocs',
		function($state,$stateParams,machine,logs,Session,$window,components,$timeout,LxDialogService,parts,events,docs,
			DBDocServer,LxProgressService,Upload,socket,DBDocs,
			DBMachine,DBMachineComponents,DBMachineParts,DBMachineEvents,DBSysLog,
			tasks,DBRaiseMachineEvent,DBComponentEvents,DBEventDocs){

		// Subscribe to changes for just this machine
		{
			var vm = this
			var machineID = $stateParams.id
			socket.on("machine",function(id){
				if (id == machineID) {
					console.log("Machine event for ",machineID,"reload details")
					vm.machine = DBMachine.get({id: machineID})
					vm.components = DBMachineComponents.query({id: machineID})
					vm.parts = DBMachineParts.query({id: machineID})
					vm.events = DBMachineEvents.query({id: machineID})
					vm.logs = DBSysLog.query({
						RefType: 'M',
						RefID: machineID,
						Limit: 100
					})
				} // message matches this machine
			}) // socket.on
		}

console.log("tasks =",tasks)
		angular.extend(this, {
			session: Session,
			machine: machine,
			logs: logs,
			parts: parts,
			tasks: tasks,
			events: events,
			docs: docs,
			baseComponents: components,
			components: components,
			formFields: getMachineForm(),		
			logClass: logClass,
			alertFields: getMachineAlertForm(),		
			eventHandler: DBRaiseMachineEvent,	
			eventFields: {
				machineName: "",
				machineID: 0,
				toolID: 0,
				toolName: "",
				type: "Tool",
				status: "",
			},			
			eventHistory: {
				Status: "",
				Startdate: "",
				Username: "",
				Notes: "",
				Docs: [],
			},
			calcBaseComponents: function() {
				this.baseComponents = []
				for (var i = 0; i < this.components.length; i++) {
					if (this.components[i].ZIndex == 0) {
						this.baseComponents.push(this.components[i])
					}
				};
				console.log("base components = ", this.baseComponents)
			},
			getSVGClass: function() {
				switch (this.machine.Status) {
					case 'Stopped':
						return "svg-panel stopped"
					case 'Needs Attention':
						return "svg-panel attn"
					case 'Maintenance Pending':
						return "svg-panel pending"
					default: 
						return "svg-panel"
				}
			},
			submit: function() {				
				this.machine._id = $stateParams.id				
				this.machine.$update(function(newmachine) {
					$window.history.go(-1)
				})					
			},
			getDoc: function(row) {
				console.log('Get document',row.ID)
				var adoc = DBDocServer.get({id: row.ID})
			},			
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
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
			goEvent: function(row) {
				$state.go(base+'.editevent',{id: row.ID})
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
			getToolClass: function(row) {
				switch(row.Status) {
					case 'Needs Attention':
						return 'tool-svg-attention'
					case 'Maintenance Pending':
						return 'tool-svg-pending'
					case 'Stopped':
						return 'tool-svg-stopped'
					default:
						return 'tool-svg'
				}
			},
			toolFill: function(row) {
				switch(row.Status) {
					case 'Needs Attention':
						return '#fff176'
					case 'Maintenance Pending':
						return '#9e9d24'
					case 'Stopped':
						return '#ff7043'
					default:
						return 'white'
				}
			},
			nonToolFill: function(comp,def) {
				switch(comp) {
					case "Electrical":
						if (this.machine.Electrical == "Needs Attention") {
							return "#fff176"		
						} 
						return "url(#bgrad)"
					case "Hydraulic":
						if (this.machine.Hydraulic == "Needs Attention") {
							return "#fff176"		
						} 
						return "url(#bgrad)"
					case "Lube":
						if (this.machine.Lube == "Needs Attention") {
							return "#fff176"		
						} 
						return "url(#bgrad)"
					case "Printer":
						if (this.machine.Printer == "Needs Attention") {
							return "#fff176"		
						} 
						return "url(#bgrad)"
					case "Console":
						if (this.machine.Console == "Needs Attention") {
							return "#fff176"		
						} 
						return "url(#bgrad)"
					case "Uncoiler":
						if (this.machine.Uncoiler == "Needs Attention") {
							return "#fff176"		
						} 
						return "#eee"
					case "Rollbed":
						if (this.machine.Rollbed == "Needs Attention") {
							return "#fff176"		
						} 
						return "#eee"
				}
			},										
			toolWidth: function() {
				if (this.baseComponents.length > 0) {
					var percentage = 80 / (this.baseComponents.length + 1)
					return "" + percentage + "%"
				}
				return "0"
			},
			// Note that offsets are in reverse, as we run from right to left in the display
			toolOffset: function(index) {				
				if (this.baseComponents.length > 0) {
					var useIndex = (this.baseComponents.length + 4) - index -1
					//console.log(index,"=",useIndex)
					var percentage = useIndex * (80 / this.baseComponents.length)
					return "" + percentage + "%"
				}
				return "0"
			},
    	upload: function (file) {
    		LxProgressService.circular.show('green','#upload-progress')
    		var vm = this
        Upload.upload({
            url: 'upload',
            data: {
            	file: file, 
            	desc: this.doc,
            	type: "machine",
            	ref_id: $stateParams.id,
            	worker: "true",
            	sitemgr: "true",
            	contractor: "true"
            }
        }).then(function (resp) {
        	if (resp.config.data.file) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
		    		LxProgressService.circular.hide()
		    		vm.uploadProgress = 'Success !'
		    		vm.doc = ''
     				vm.docs = DBDocs.query({type: 'machine', id: $stateParams.id})
        	}
        }, function (resp) {
            console.log('Error status: ' + resp.status + ' ' + resp.data);
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()

        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
        })
      },			
			raiseIssue: function(comp,id,type) {
				var machine = this.machine
				console.log("we are here with comp ",comp,"and need to decide which dialog to raise",type)
				if (comp == 0) {
					console.log("we are looking at the",type,"on the",machine.Descr,machine)
					comp = {}
					this.eventFields.machineName = machine.Name
					this.eventFields.type = type
					this.eventFields.toolID = 0		
					this.eventFields.toolName = ""
					this.eventFields.machineID = machine.ID
					this.eventFields.type = type
					this.eventFields.tool = comp

					switch(type) {
						case "Electrical":
							this.eventFields.status = machine.Electrical
							break
						case "Hydraulic":
							this.eventFields.status = machine.Hydraulic
							break
						case "Lube":
							this.eventFields.status = machine.Lube
							break
						case "Printer":
							this.eventFields.status = machine.Printer
							break
						case "Console":
							this.eventFields.status = machine.Console
							break
						case "Uncoiler":
							this.eventFields.status = machine.Uncoiler
							break
						case "Rollbed":
							this.eventFields.status = machine.Rollbed
							break
					}
					this.eventHistory.Status = this.eventFields.status

					if (this.eventFields.status == "Running") {
						console.log("this bit is running, so raise new issue")
						LxDialogService.open('raiseIssueDialog')			
					} else {
						console.log("this bit is not running - show last event")
						var q = DBMachineCompEvents.query({id: machine.ID, type: type})
						var vm = this
						q.$promise.then(function(){
							console.log("machine events = ", q)
							var evt = q[0]
							vm.eventHistory.StartDate = evt.StartDate
							vm.eventHistory.Username = evt.Username
							vm.eventHistory.Notes = evt.Notes
							vm.eventHistory.Docs = DBEventDocs.query({id: evt.ID})
							vm.eventHistory.Docs.$promise.then(function(){
								console.log("docs for this machine event", evt.ID, vm.eventHistory.Docs)
							})
						})
						LxDialogService.open('showStatusDialog')									
					}

					return
				}

				if (comp.Status == "Running") {
					this.eventFields.machineName = machine.Name
					this.eventFields.toolName = comp.Name
					this.eventFields.toolID = id
					this.eventFields.machineID = machine.ID
					this.eventFields.type = type
					this.eventFields.tool = comp
					this.eventFields.status = comp.Status
					// console.log(machine,comp,this.eventFields)
					LxDialogService.open('raiseIssueDialog')			
				} else {
					this.eventFields.machineName = machine.Name
					this.eventFields.toolName = comp.Name
					this.eventFields.toolID = id
					this.eventFields.machineID = machine.ID
					this.eventFields.type = type
					this.eventFields.tool = comp
					this.eventFields.status = comp.Status
					this.eventHistory.Status = comp.Status
					// console.log(machine,comp,this.eventFields)
					// Get most recent event for this machine
					var q = DBComponentEvents.query({id: comp.ID})
					var vm = this
					q.$promise.then(function(){
						console.log("comp events = ", q)
						var evt = q[0]
						vm.eventHistory.StartDate = evt.StartDate
						vm.eventHistory.Username = evt.Username
						vm.eventHistory.Notes = evt.Notes
						vm.eventHistory.Docs = DBEventDocs.query({id: evt.ID})
						vm.eventHistory.Docs.$promise.then(function(){
							console.log("docs for this event", evt.ID, vm.eventHistory.Docs)
						})
					})
					LxDialogService.open('showStatusDialog')			
				}
			},      
			submitAlert: function() {
				var vm = this
				this.eventHandler.raise({
					machineID: this.eventFields.machineID,
					toolID: this.eventFields.toolID,
					type: this.eventFields.type,
					action: 'Alert',
					descr: this.eventFields.AlertDescr
				}).$promise.then(function(){
					vm.eventFields.AlertDescr = ""
				})
				LxDialogService.close('raiseIssueDialog')
			},

		})

		{
			var vm = this
			components.$promise.then(function(){
				vm.calcBaseComponents()
			})
		}


	}])

})();