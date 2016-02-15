;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'EditWorkorderCtrl', 
		['$state','$stateParams','workorder','Session','$window','LxDialogService',
		'socket','DBDocs','DBDocServer','docs','DBWODocs',
		'LxNotificationService','DBWorkOrder','LxProgressService','Upload',
		function($state,$stateParams,workorder,Session,$window,LxDialogService,
			socket,DBDocs,DBDocServer,docs,DBWODocs,
			LxNotificationService,DBWorkOrder,LxProgressService,Upload){
	
	console.log("here with workorder =",workorder)
	workorder.$promise.then(function(){
		workorder.Time = workorder.StartDate.substr(workorder.StartDate.length - 5)
		var d = new Date(workorder.StartDate)
		workorder.StartDate = d
	})

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
				// TODO    this.workorder.StartDate -> set the time from the time field
				
				this.workorder.$update(function(newworkorder) {
					LxNotificationService.info('Notes Updated')
					vm.workorder = DBWorkOrder.get({id: $stateParams.id})
					// vm.event = DBEvent.get({id: $stateParams.id})
//					$window.history.go(-1)
				})
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function() {
				$state.go(base+'.editmachine', {id: this.workorder.MachineID})
			},
			goTool: function() {
				$state.go(base+'.edittool', {id: this.workorder.ToolID})
			},
			goSite: function() {
				$state.go(base+'.editsite',{id: this.workorder.SiteID})
			},
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },
			getThumbnail: function(doc) {
				var ext = doc.Filename.split('.').pop().toLowerCase()
				// console.log("getThumbnail",doc.Filename,ext)
				switch (ext) {
					case 'jpg':
					case 'png':
					case 'gif':
						return "doc/"+doc.ID
					case 'doc':
					case 'xls':
					case 'odt':
						return "img/doc.png"
					case 'exe':
						return "img/program.png"
					case 'pdf':
						return "img/pdf.png"
					case 'zip':
						return "img/zip.jpg"
					default:
						return "img/data.jpg"
				}
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
            	type: "workorder",
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
      			vm.docs = DBWODocs.query({id: $stateParams.id})
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