(function () {
    'use strict';

    angular
        .module('admin')
        .controller('CreateEventController', CreateEventController);

    CreateEventController.$inject = ['$scope', 'EventFormFields', 'Event', 'EventService'];
    function CreateEventController($scope, EventFormFields, Event, EventService) {
        var vm = this;

        vm.event = {};

        vm.eventFormFields = EventFormFields;

        vm.submitEvent = submitEvent;
        vm.initMap = initMap;

        vm.dropzoneConfig = {
            'options': {
                url: "/app_dev.php/api/secure/events/files",
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
                    vm.event.images = vm.event.images || [];

                    vm.event.images.push(response);

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

        function submitEvent(goToListing) {
            var event = new Event(EventService.formatEventToEdit(vm.event));
            event.$save(function sc(response) {
                if (goToListing) {
                    $state.go('event.list');
                } else {
                    vm.options.resetModel();
                    vm.dropzone.removeAllFiles(true);
                    vm.event = {};
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

                vm.event.address = place.formatted_address;
                vm.event.latitude = place.geometry.location.lat();
                vm.event.longitude = place.geometry.location.lng();
                $scope.$apply();
            });
        }
    }
})();