;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'UserCtrl', 
		['$state','users','Session','LxDialogService','logs','LxNotificationService',
		function($state, users, Session, LxDialogService, logs, LxNotificationService){
	
		angular.extend(this, {
			users: users,
			session: Session,
			logs: logs,
			logClass: logClass,
			sortField: 'UserName',
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
			},
			clickedRow: function(row) {
				//console.log('Clicked on',u.ID, '=',u)
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goAudit: function(row) {
				LxDialogService.close('userLogDialog')
				switch(row.Type) {
					case 'Vendor':
						$state.go(base+'.editvendor',{id: row.RefID})
						break
					case 'Machine':
						$state.go(base+'.editmachine',{id: row.RefID})
						break
					case 'Parts':
						$state.go(base+'.editpart',{id: row.RefID})
						break
					case 'Tool':
					case 'Tools':
						$state.go(base+'.edittool',{id: row.RefID})
						break
					case 'Sites':
						$state.go(base+'.editsite',{id: row.RefID})
						break
					case 'Skills':
						$state.go(base+'.editskill',{id: row.RefID})
						break
					default:
						$state.go(base+'.edituser',{id: row.UserID})
						break
				}
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})
			},
			showLogs: function() {
				LxDialogService.open('userLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.users, function(vv,kk){
						if (vv.selected && (v.RefID == vv.ID || v.UserID == vv.ID)) {
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
				LxNotificationService.confirm('Delete Users',
					'Do you want to delete all the selected users ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.users, function(v,k){
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

	app.controller(base+'NewUserCtrl', 
		['$state','Session','DBUser','LxNotificationService','$window',
		function($state,Session,DBUser,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			user: new DBUser(),
			formFields: getUserForm(true),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.user.$insert(function(newRecord) {
						$state.go(base+'.users')
					})					
				} else {
					LxNotificationService.error('Please select a Role for this user')
				}
			},
			abort: function() {
				LxNotificationService.warning('New User - Cancelled')
				$window.history.go(-1)
				//$state.go(base+'.users')
			}
		})
	}])

	app.controller(base+'EditUserCtrl', 
		['$state','$stateParams','user','logs','Session','$window','LxDialogService',
		'Upload','LxProgressService','docs','DBDocServer','DBDocs',
		function($state,$stateParams,user,logs,Session,$window,LxDialogService,
			Upload,LxProgressService,docs,DBDocServer,DBDocs){

 		LxProgressService.circular.hide()

		angular.extend(this, {
			session: Session,
			user: user,
			logs: logs,
			uploadProgress: '',
			docs: docs,
			doc: '',
			formFields: getUserForm(false),		
			logClass: logClass,
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
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