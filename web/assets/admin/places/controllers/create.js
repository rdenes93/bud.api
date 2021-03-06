(function () {
    'use strict';

    angular
        .module('admin')
        .controller('CreatePlaceController', CreatePlaceController);

    CreatePlaceController.$inject = ['$scope', '$state', 'PlaceFormFields', 'Place', 'PlaceService'];
    function CreatePlaceController($scope, $state, PlaceFormFields, Place, PlaceService) {
        var vm = this;

        vm.place = {};

        vm.placeFormFields = PlaceFormFields;

        vm.submitPlace = submitPlace;
        vm.initMap = initMap;

        vm.dropzoneConfig = {
            'options': {
                url: "/app_dev.php/api/secure/places/files",
                maxFilesize: 100,
                paramName: "uploadfile",
                maxThumbnailFilesize: 5,
                autoProcessQueue: true,
                maxFiles: 10,
                parallelUploads: 10,
                init: function() {
                    vm.dropzone = this;
                },
                thumbnailWidth: 160,
                thumbnailHeight: 90
            },
            'eventHandlers': {
                'sending': function (file, xhr, formData) {
                    formData.append("_token", angular.element.find('meta[name="csrf-token"]')[0].content);
                },
                'success': function(file, response) {
                    vm.place.images = vm.place.images || [];

                    vm.place.images.push(response);

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

        function submitPlace(goToListing) {
            var newPlace = new Place(PlaceService.formatPlaceToSubmit(vm.place));
            newPlace.$save(function sc(response) {
                vm.placeForm = undefined;
                if (goToListing) {
                    $state.go('place.list');
                } else {
                    vm.options.resetModel();
                    vm.dropzone.removeAllFiles(true);
                    vm.newCategory = {};
                }
            });
        }

        function initMap() {
            var map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: -33.8688, lng: 151.2195},
                zoom: 13
            });
            var input = document.getElementById('pac-input');

            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);

            var infowindow = new google.maps.InfoWindow();
            var marker = new google.maps.Marker({
                map: map,
                anchorPoint: new google.maps.Point(0, -29)
            });

            autocomplete.addListener('place_changed', function() {
                infowindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();

                console.log(place);
                if (!place.geometry) {
                    window.alert("Autocomplete's returned place contains no geometry");
                    return;
                }

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(13);
                }
                marker.setIcon(/** @type {google.maps.Icon} */({
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(35, 35)
                }));
                marker.setPosition(place.geometry.location);
                marker.setVisible(true);

                var address = '';
                if (place.address_components) {
                    address = [
                        (place.address_components[0] && place.address_components[0].short_name || ''),
                        (place.address_components[1] && place.address_components[1].short_name || ''),
                        (place.address_components[2] && place.address_components[2].short_name || '')
                    ].join(' ');
                }

                infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
                infowindow.open(map, marker);

                vm.place.name = place.name;
                vm.place.address = place.formatted_address;
                vm.place.phonenumber = place.international_phone_number;
                vm.place.website = place.website;
                vm.place.latitude = place.geometry.location.lat();
                vm.place.longitude = place.geometry.location.lng();
                vm.place.googleID = place.place_id;
                $scope.$apply();
            });
        }
    }
})();