;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'EventCtrl', 
		['$state','events','Session','LxDialogService','logs','LxNotificationService','socket','DBEvent',
		function($state, events, Session, LxDialogService, logs, LxNotificationService,socket,DBEvent){
	
		// Subscribe to changes in the machine list	
		var vm = this
		socket.on("event",function(msg){
			console.log("Event update - reload full list",msg)
			vm.events = DBEvent.query()					
		})

		angular.extend(this, {
			events: events,
			session: Session,
			logs: logs,
			logClass: logClass,
			getClass: function(row) {
				switch (row.Type) {
					case 'Halt':
						return "machine__stopped"
					case 'Alert':
						return "machine__attention"
					case 'Running':
						return "machine__running"
					case 'Pending':
						return "machine__pending"
				}
			},
			clickEdit: function(row) {
				$state.go(base+'.editevent',{id: row.ID})					
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine',{id: row.MachineId})
			},
			goSite: function(row) {
				if (row.SiteId != 0) {
					$state.go(base+'.editsite',{id: row.SiteId})
				}
			}
		})
	}])

	app.controller(base+'EditEventCtrl', 
		['$state','$stateParams','event','logs','Session','$window','LxDialogService',
		'socket','Upload','LxProgressService','DBDocs','DBDocServer','docs','workorders',
		'LxNotificationService','DBEvent','DBEventCost','DBWorkOrder',
		function($state,$stateParams,event,logs,Session,$window,LxDialogService,
			socket,Upload,LxProgressService,DBDocs,DBDocServer,docs,workorders,
			LxNotificationService,DBEvent,DBEventCost,DBWorkOrder){
	
		angular.extend(this, {
			session: Session,
			event: event,
			logs: logs,
			docs: docs,
			logClass: logClass,
			formFields: getEventForm(),		
			costFields: getEventCostForm(),
			workOrderFields: getEventWorkOrderForm(),
			completeFields: getEventCompleteForm(),
			costAdder: DBEventCost,
			workOrderService: DBWorkOrder,
			workorders: workorders,
			costs: {
				Descr: '',
				LabourCost: 0.0,
				MaterialCost: 0.0,
				OtherCost: 0.0,
			},
			workOrderData: {
				Descr: '',
			},
			completion: {
				Descr: '',
			},
			canEdit: function() {
				return true
			},
			canCost: function() {
				return true
			},
			canOrder: function() {
				return true
			},
			canComplete: function() {
				return true
			},
			submit: function() {
				var vm = this
				console.log('before',this.event)
				this.event._id = $stateParams.id
				this.event.$update(function(newevent) {
					LxNotificationService.info('Notes Updated')
					vm.event = DBEvent.get({id: $stateParams.id})
//					$window.history.go(-1)
				})
			},
			submitCosts: function() {
				var vm = this
				this.costs.id = $stateParams.id
				console.log('adding cost fields',this.costs)
				this.costAdder.add(this.costs).$promise.then(function(){
						LxDialogService.close('costDialog')
						LxNotificationService.info('Added Costs')					
						vm.event = DBEvent.get({id: $stateParams.id})
				})
			},
			submitComplete: function() {
				console.log('completion fields',this.completion)
				/*
				Are there any workorders outstanding ?
					Y - ask if user wants to close them off, else dont close the ewent yet
					N - close off the event

							Mark tool as OK
							Are there any uncleared events on other tools on the same machine ?
								Y - ask if user wants to clear these as well
								N - mark machine as good to go
				*/
			},
			submitWorkOrder: function() {
				this.workOrderData.EventID = $stateParams.id
				console.log('workorder fields',this.workOrderData)				
				this.workOrderService.insert(this.workOrderData).$promise.then(function(){
					LxDialogService.close('workOrderDialog')
					LxNotificationService.info('New WorkOrder Created')
				})
			},
			costItem: function() {
				LxDialogService.open('costDialog')
			},
			workOrder: function() {
				LxDialogService.open('workOrderDialog')
			},
			markComplete: function() {
				LxDialogService.open('completeDialog')
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function() {
				$state.go(base+'.editmachine', {id: this.event.MachineId})
			},
			goTool: function() {
				$state.go(base+'.edittool', {id: this.event.ToolId})
			},
			goSite: function() {
				$state.go(base+'.editsite',{id: this.event.SiteId})
			},
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },
			getMachineClass: function(row) {
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
				} // switch
			},
			getMapURI: function(addr) {
			  return "https://www.google.com/maps?q="+encodeURIComponent(addr)
			},
			getDoc: function(row) {
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
            	type: "event",
            	ref_id: $stateParams.id,
            	worker: "true",
            	sitemgr: "true",
            	contractor: "true"
            }
        }).then(function (resp) {
        	if (resp.config.data.file) {
		    		LxProgressService.circular.hide()
		    		vm.uploadProgress = 'Success !'
		    		vm.doc = ''
		    		vm.docs = DBDocs.query({type: 'event', id: $stateParams.id})
						LxNotificationService.info('Document Added')
        	}
        }, function (resp) {
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()
        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
        })
      },
			
		})

	}])


})();