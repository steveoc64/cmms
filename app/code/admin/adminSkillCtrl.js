;(function() {
	'use strict';

	var base = 'admin'
	var app = angular.module('cmms')

	app.controller(base+'SkillCtrl', 
		['$state','skills','Session','LxDialogService','logs','LxNotificationService',
		function($state, skills, Session, LxDialogService, logs,LxNotificationService){
	
		angular.extend(this, {
			skills: skills,
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
			},
			clickedRow: function(row) {
				if (!angular.isDefined(row.selected)) {
					row.selected = false
				}
				row.selected = !row.selected
			},
			clickEdit: function(row) {
				$state.go(base+'.editskill',{id: row.ID})
			},
			goAudit: function(row) {
				LxDialogService.close('skillLogDialog')
				$state.go(base+'.editskill',{id: row.RefID})
			},
			showLogs: function() {
				LxDialogService.open('skillLogDialog')
			},
			getSelectedLogs: function() {
				var l = []
				var vm = this
				angular.forEach (vm.logs, function(v,k){
					angular.forEach(vm.skills, function(vv,kk){
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
				LxNotificationService.confirm('Delete Skills',
					'Do you want to delete all the selected skills ?',
					{cancel: 'No',ok:'Yes, delete them all !'},
					function(answer){
						if (answer) {
							angular.forEach (vm.skills, function(v,k){
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

	app.controller(base+'NewSkillCtrl', 
		['$state','Session','DBSkill','LxNotificationService','$window',
		function($state,Session,DBSkill,LxNotificationService,$window){
	
		angular.extend(this, {
			session: Session,
			skill: new DBSkill(),
			formFields: getSkillForm(),
			logClass: logClass,
			submit: function() {
				if (this.form.$valid) {
					this.skill.$insert(function(newRecord) {
						$state.go(base+'.skills')
					})					
				}
			},
			abort: function() {
				LxNotificationService.warning('New Skill - Cancelled')
				$window.history.go(-1)
				//$state.go(base+'.skills')
			}
		})
	}])

	app.controller(base+'EditSkillCtrl', 
		['$state','$stateParams','skill','logs','Session','users','$window','LxDialogService',
		'LxProgressService','Upload','DBDocs',
		function($state,$stateParams,skill,logs,Session,users,$window,LxDialogService,
			LxProgressService,Upload,DBDocs){

		angular.extend(this, {
			session: Session,
			skill: skill,
			users: users,
			logs: logs,
			formFields: getSkillForm(),		
			logClass: logClass,
      showChange: function(c) {
      	this.Audit = c
      	this.Before = c.Before.split('\n')
      	this.After = c.After.split('\n')
				LxDialogService.open('changeDialog')
      },						
			submit: function() {
				this.skill._id = $stateParams.id
				this.skill.$update(function(newskill) {
					$window.history.go(-1)
				})					
			},
			abort: function() {
				$window.history.go(-1)
			},
			goUser: function(row) {
				$state.go(base+'.edituser',{id: row.ID})
			},
			goSite: function(row) {
				$state.go(base+'.editsite',{id: row.SiteId})				
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
            	type: "skill",
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
     				vm.docs = DBDocs.query({type: 'skill', id: $stateParams.id})		    		
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