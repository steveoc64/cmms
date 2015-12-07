
          .state('vendor',{
            url: '/vendor',
            acl: 'ACL', // TODO ... declare ACLs for this route
            cache: false,
            templateUrl: 'html/vendor.list.html',
            controller: 'VendorCtrl as Vendor',
            resolve: {
              vendors: function(DBVendor) {
                return DBVendor.query()
              },
              logs: function(DBSysLog) {
                return DBSysLog.query({RefType: 'X', Limit: 100})  // TODO ... set the SysLog type for this table
              }
            }
          })
            .state('editvendor',{
              url: '/vendor/edit/:id',
              acl: 'ACL',
              templateUrl: 'html/vendor.edit.html',
              controller: 'EditVendorCtrl as editVendor',
              resolve: {
                vendor: function(DBVendor,$stateParams) {
                  return DBVendor.get({id: $stateParams.id})
                },
                logs: function(DBSysLog,$stateParams) {
                  return DBSysLog.query({
                    RefType: 'X',   // TODO ... set the SysLog ref type
                    RefID: $stateParams.id,
                    Limit: 100})
                }
              }
            })
            .state('newvendor',{
              url: '/newvendor',
              acl: 'ACL',
              templateUrl: 'html/vendor.new.html',
              controller: 'adminNewVendorCtrl as newVendor',
            })
