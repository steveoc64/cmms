// Code generated by codegen from SQL table vendor
;(function(){

getVendorFields = function() {

  return [{
      name: 'vendor.Name',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Name',
        templateOptions: {
          type: 'text',
          label: 'Name',
          required: true,
        }
      }
    },{
      name: 'vendor.Descr',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Descr',
        templateOptions: {
          type: 'text',
          label: 'Description',
        }
      }
    },{
      name: 'vendor.Address',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Address',
        templateOptions: {
          type: 'text',
          label: 'Address',
          required: true,
        }
      }
    },{
      name: 'vendor.Phone',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Phone',
        templateOptions: {
          type: 'text',
          label: 'Phone',
          required: true,
        }
      }
    },{
      name: 'vendor.Fax',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Fax',
        templateOptions: {
          type: 'text',
          label: 'Fax',
        }
      }
    },{
      name: 'vendor.ContactName',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'ContactName',
        templateOptions: {
          type: 'text',
          label: 'Contact Name',
          required: true,
        }
      }
    },{
      name: 'vendor.ContactEmail',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'ContactEmail',
        templateOptions: {
          type: 'email',
          label: 'Contact Email',
          required: true,
        }
      }
    },{
      name: 'vendor.OrdersEmail',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'OrdersEmail',
        templateOptions: {
          type: 'email',
          label: 'Orders Email',
        }
      }
    },{
      name: 'vendor.Rating',
      extends: 'lx-input',
      wrapper: 'lx-wrapper-errors',
      defaultOptions: {
        key: 'Rating',
        templateOptions: {
          type: 'text',
          label: 'Rating',
        }
      }
  }] // end fields

} // getVendorFields

getVendorForm = function(isNew) {

  return [{
    type: 'lx-flex',
    templateOptions: {
      flex: { container: "row", item: "6"},
      fields: [
        {type: 'vendor.Name'},
        {type: 'vendor.Rating'},
      ]
    }
  },{
    type: 'lx-flex',
    templateOptions: {
      flex: { container: "row", item: "12"},
      fields: [
        {type: 'vendor.Descr'},
      ]
    }
  },{
    type: 'lx-flex',
    templateOptions: {
      flex: { container: "row", item: "12"},
      fields: [
        {type: 'vendor.Address'},
      ]
    }
  },{
    type: 'lx-flex',
    templateOptions: {
      flex: { container: "row", item: "6"},
      fields: [
        {type: 'vendor.Phone'},
        {type: 'vendor.Fax'},
      ]
    }
  },{
    type: 'lx-flex',
    templateOptions: {
      flex: { container: "row", item: "4"},
      fields: [
        {type: 'vendor.ContactName'},
        {type: 'vendor.ContactEmail'},
        {type: 'vendor.OrdersEmail'},
      ]
    }
  }]
} // getVendorForm

})();
