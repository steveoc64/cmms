;(function() {
	'use strict';

	var base = 'sitemgr'
	var app = angular.module('cmms')

	app.controller(base+'UserCtrl', 
		['$state','users','Session','LxDialogService','LxNotificationService',
		function($state, users, Session, LxDialogService,  LxNotificationService){
	
		angular.extend(this, {
			users: users,
			session: Session,
			sortField: 'UserName',
			sortDir: false,
			setSort: function(field) {
				if (this.sortField == field) {
					this.sortDir = !this.sortDir
				}
				this.sortField = field
			},					
			clickEdit: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
		})
	}])


	app.controller(base+'EditUserCtrl', 
		['$state','$stateParams','user','Session','$window','LxDialogService',
		'LxProgressService','DBDocs','DBDocServer','docs','Upload',
		function($state,$stateParams,user,Session,$window,LxDialogService,
			LxProgressService,DBDocs,DBDocServer,docs,Upload){

		angular.extend(this, {
			session: Session,
			user: user,
			docs: docs,
			formFields: getUserViewForm(),		
			canEdit: function() {
				return false
			},
			submit: function() {
				this.user._id = $stateParams.id
				this.user.$update(function(newuser) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
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
            	type: "user",
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
		    		vm.docs = DBDocs.query({type: 'user', id: $stateParams.id})
        	}
        }, function (resp) {
            console.log('Error status: ' + resp.status + ' ' + resp.data);
		    		vm.uploadProgress = 'Error ! ' + resp.data
		    		LxProgressService.circular.hide()

        }, function (evt) {
            vm.uploadProgress = '' + parseInt(100.0 * evt.loaded / evt.total) + '%';
        })
      },			

		})

	}])

})();