(function () {
    'use strict';

    angular
        .module('admin')
        .controller('CreateCategoryController', CreateCategoryController);

    CreateCategoryController.$inject = ['$scope', '$state', 'CategoryFormFields', 'Category'];
    function CreateCategoryController($scope, $state, CategoryFormFields, Category) {
        var vm = this;

        vm.newCategory = {};

        vm.categoryFormFields = CategoryFormFields;

        vm.submitCategory = submitCategory;

        vm.dropzoneConfig = {
            'options': {
                url: "/app_dev.php/api/secure/categories/files",
                maxFilesize: 100,
                paramName: "uploadfile",
                maxThumbnailFilesize: 5,
                autoProcessQueue: true,
                maxFiles: 1,
                parallelUploads: 1,
                init: function() {
                    vm.dropzone = this;
                },
                dictDefaultMessage: "<strong class=\"text-uppercase\"><i class=\"fa fa-upload\"></i> Drop a file to attach, or <a href=\"#\" class=\"text-green\">browse</a></strong>",
                thumbnailWidth: 160,
                thumbnailHeight: 90
            },
            'eventHandlers': {
                'sending': function (file, xhr, formData) {
                    formData.append("_token", angular.element.find('meta[name="csrf-token"]')[0].content);
                },
                'success': function(file, response) {
                    vm.newCategory.coverImage = response.file_id;
                    $scope.$apply();
                },
                'maxfilesexceeded': function(file){
                    this.removeFile(file);
                },
                'addedfile' : function(file) {
                    $scope.$digest();
                }
            }
        };

        function submitCategory(goToListing) {
            var newCategory = new Category({'category': vm.newCategory});
            newCategory.$save(function sc(response) {
                if (goToListing) {
                    $state.go('category.list');
                } else {
                    vm.options.resetModel();
                    vm.dropzone.removeAllFiles(true);
                    vm.newCategory = {};
                }
            });
        }
    }
})();