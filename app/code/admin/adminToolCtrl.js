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
		'events','machine','Upload','LxProgressService','docs','DBDocs','DBDocServer','DBRaiseToolEvent',
		'LxNotificationService',
		function($state,$stateParams,logs,Session,$window,component,$timeout,parts,LxDialogService,
			events,machine,Upload,LxProgressService,docs,DBDocs,DBDocServer,DBRaiseToolEvent,
			LxNotificationService){

		angular.extend(this, {
			session: Session,
			component: component,
			machine: machine,
			parts: parts,
			logs: logs,
			docs: docs,
			events: events,
			formFields: getComponentForm(),		
			logClass: logClass,
			alertFields: getComponentAlertForm(),
			haltFields: getComponentHaltForm(),
			clearFields: getComponentClearForm(),
			eventHandler: DBRaiseToolEvent,				
			canEdit: function() {
				return true
			},
			canStop: function() {
				return this.machine.IsRunning
			},
			canClear: function() {
				return this.component.Status != 'Running'
			},							
			getPanelClass: function() {
				switch(this.machine.Status) {
					case 'Needs Attention':
						return 'svg-tool-panel-attn'
					case 'Stopped':
						return 'svg-tool-panel-stopped'
					case 'Maintenance Pending':
						return 'svg-tool-panel-pending'
					default:
						return 'svg-tool-panel'
				}
			},
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
			getDoc: function(row) {
				console.log('Get document',row.ID)
				var adoc = DBDocServer.get({id: row.ID})
			},
    	upload: function (file) {
    		LxProgressService.circular.show('green','#upload-progress')
    		var vm = this
        Upload.upload({
            url: 'upload',
            data: {
            	file: file, 
            	desc: this.doc,
            	type: "tool",
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
     				vm.docs = DBDocs.query({type: 'tool', id: $stateParams.id})
        	}
        }, function (resp) {
            console.log('Error status: ' + resp.status + ' ' + resp.data);
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()

        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
        })
      },
			clearIssue: function() {
				LxDialogService.open('clearIssueDialog')
			},
			raiseIssue: function() {
				LxDialogService.open('raiseIssueDialog')
			},
			submitClear: function() {
				if (this.eventFields.ClearDescr.length > 0) {
					var vm = this
					var q = this.eventHandler.raise({
						tool: $stateParams.id,
						action: 'Clear',
						descr: this.eventFields.ClearDescr
					}).$promise.then(function(){
						LxDialogService.close('clearIssueDialog')
						LxNotificationService.info('Issues Cleared')
						$state.go(base+'.editmachine',{id: vm.component.MachineID})					
					})
				} else {
					LxNotificationService.error('Please Enter Description')
				}
			},
			submitAlert: function() {
				if (this.eventFields.AlertDescr.length > 0) {
					var vm = this
					var q = this.eventHandler.raise({
						tool: $stateParams.id,
						action: 'Alert',
						descr: this.eventFields.AlertDescr
					}).$promise.then(function(){
						LxDialogService.close('raiseIssueDialog')
						LxNotificationService.info('New Issue Raised')
						$state.go(base+'.editmachine',{id: vm.component.MachineID})					
					})
				} else {
					LxNotificationService.error('Please Enter Description')
				}
			},
			submitHalt: function() {
				if (this.eventFields.HaltDescr.length > 0) {
					var vm = this
					this.eventHandler.raise({
						tool: $stateParams.id,
						action: 'Halt',
						descr: this.eventFields.HaltDescr
					}).$promise.then(function(){
						LxDialogService.close('raiseIssueDialog')
						LxNotificationService.error('Machine Halted')						
						$state.go(base+'.editmachine',{id: vm.component.MachineID})					
					})
				} else {
					LxNotificationService.error('Please Enter Description')
				}
			},			



		})

	}])

})();