;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'EditWorkorderCtrl', 
		['$state','$stateParams','workorder','Session','$window','LxDialogService',
		'socket','DBDocs','DBDocServer','docs',
		'LxNotificationService','DBWorkOrder',
		function($state,$stateParams,workorder,Session,$window,LxDialogService,
			socket,DBDocs,DBDocServer,docs,
			LxNotificationService,DBWorkOrder){
	
		angular.extend(this, {
			session: Session,
			docs: docs,
			formFields: getWorkOrderForm(),		
			workOrderService: DBWorkOrder,
			workorder: workorder,
			canEdit: function() {
				return true
			},
			submit: function() {
				var vm = this
				console.log('before',this.workorder)
				this.workorder._id = $stateParams.id
				this.workorder.$update(function(newworkorder) {
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