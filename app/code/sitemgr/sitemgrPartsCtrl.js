;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'EditPartCtrl', 
		['$state','$stateParams','part','Session','$window','components','LxDialogService','vendors',
		'docs','LxProgressService','DBDocs','DBDocServer','Upload',
		function($state,$stateParams,part,Session,$window,components,LxDialogService,vendors,
			docs,LxProgressService,DBDocs,DBDocServer,Upload){

		angular.extend(this, {
			session: Session,
			part: part,
			components: components,
			vendors: vendors,
			docs: docs,
			formFields: getPartForm(),		
			canEdit: function() {
				return false
			},
			submit: function() {
				this.part._id = $stateParams.id
				this.part.$update(function(newpart) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goMachine: function(row) {
				$state.go(base+'.editmachine',{id: row.MachineID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteID})
			},
			goTool: function(row) {
				$state.go(base+".edittool",{id: row.ComponentID})
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
            	type: "part",
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
		    		vm.docs = DBDocs.query({type: 'part', id: $stateParams.id})
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