;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'EditToolCtrl', 
		['$state','$stateParams','Session','$window','component','$timeout','parts','LxDialogService','events',
		'Upload','DBDocs','DBDocServer','docs','LxProgressService','DBRaiseToolEvent','machine','LxNotificationService',
		function($state,$stateParams,Session,$window,component,$timeout,parts,LxDialogService,events,
			Upload,DBDocs,DBDocServer,docs,LxProgressService,DBRaiseToolEvent,machine,LxNotificationService){

		angular.extend(this, {
			session: Session,
			component: component,
			parts: parts,
			events: events,
			docs: docs,
			machine: machine,
			formFields: getComponentForm(),		
			alertFields: getComponentAlertForm(),
			haltFields: getComponentHaltForm(),
			clearFields: getComponentClearForm(),
			eventHandler: DBRaiseToolEvent,					
			canEdit: function() {
				return false
			},
			canStop: function() {
				return this.machine.IsRunning
			},
			canClear: function() {
				return this.machine.Status != 'Running'
			},
			submit: function() {
				this.component._id = $stateParams.id
				this.component.$update(function(newtool) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$state.go(base+".editmachine",{id: this.component.MachineID})
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