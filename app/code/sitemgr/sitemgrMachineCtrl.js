;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'MachineCtrl', 
		['$scope','$state','machines','Session','LxDialogService','LxNotificationService','socket','DBMachine',
		function($scope,$state, machines, Session, LxDialogService, LxNotificationService,socket,DBMachine){
	
		// Subscribe to changes in the machine list	
		var vm = this
		socket.on("machine",function(msg){
			console.log("Machine event - reload full list",msg)
			vm.machines = DBMachine.query()					
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
		'docs','DBDocServer','Upload','LxProgressService','events','socket',
		'DBMachine','DBMachineComponents','DBMachineParts','DBMachineEvents','DBSysLog','DBDocs',
		function($state,$stateParams,machine,Session,$window,components,$timeout,LxDialogService,parts,
			docs,DBDocServer,Upload,LxProgressService, events,socket,
			DBMachine,DBMachineComponents,DBMachineParts,DBMachineEvents,DBSysLog,DBDocs){


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

		angular.extend(this, {
			session: Session,
			machine: machine,
			parts: parts,
			docs: docs,
			events: events,
			components: components,
			formFields: getMachineForm(),	
			getSVGClass: function() {
				switch (this.machine.Status) {
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
			canClear: function() {
				switch (this.machine.Status) {
					case 'Stopped':
					case 'Needs Attention':
					case 'Maintenance Pending':
						return true
					default: 
						return false
				}
			},
			Clear: function() {
				console.log('Clearing machine ....',$stateParams.id)
				DBMachine.clear({id: $stateParams.id})
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
			getDoc: function(row) {
				console.log('Get document',row.ID)
				var adoc = DBDocServer.get({id: row.ID})
				console.log('adoc = ',adoc)
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
            /*
            if (evt.config.data.file) {
            	console.log(this.uploadProgress + ' ' + evt.config.data.file.name);
          	}
          	*/
        })
      },			

			
		})

	}])

})();