(function () {
    'use strict';

    angular
        .module('admin')
        .controller('EditEventController', EditEventController);

    EditEventController.$inject = ['$scope', '$state', '$stateParams', 'EventFormFields', 'Event', 'event', 'EventService', 'SweetAlert'];
    function EditEventController($scope, $state, $stateParams, EventFormFields, Event, event, EventService, SweetAlert) {
        var vm = this;

        event.$promise.then(function(r) {
            angular.forEach(vm.event.images, function (file, index) {
                var mockFile = {
                    id: file.id,
                    name: file.name,
                    size: file.size,
                    path: file.uri,
                    accepted: true
                };

                vm.dropzone.emit("addedfile", mockFile);
                vm.dropzone.createThumbnailFromUrl(mockFile, mockFile.path);
                vm.dropzone.files.push(mockFile);
                vm.dropzone.emit("complete", mockFile);
            }, vm.dropzone);
            vm.initMap(vm.event);
        });

        vm.event = event;
        vm.eventFormFields = EventFormFields;

        vm.editEvent = editEvent;
        vm.initMap = initMap;

        vm.dropzoneConfig = {
            'options': {
                url: "/app_dev.php/api/secure/events/" + $stateParams.eventSlug + "/files",
                maxFilesize: 100,
                paramName: "uploadfile",
                addRemoveLinks: true,
                maxThumbnailFilesize: 5,
                autoProcessQueue: true,
                maxFiles: 10,
                parallelUploads: 10,
                init: function () {
                    vm.dropzone = this;
                }
            },
            'eventHandlers': {
                'sending': function (file, xhr, formData) {
                    formData.append("_token", angular.element.find('meta[name="csrf-token"]')[0].content);
                },
                'success': function (file, response) {
                    vm.event.images = vm.event.images || [];
                    vm.event.images.push(response);
                },
                'maxfilesexceeded': function (file) {
                    this.removeFile(file);
                },
                'removedfile': function (file) {
                    if (file.id) {
                        Event.removeFile({eventSlug: $stateParams.eventSlug, fileId: file.id}, function sc(response) {
                            SweetAlert.swal({
                                title: "Success!",
                                text: "File was fuckin deleted.",
                                timer: 1500,
                                showConfirmButton: true
                            })
                        })
                    }
                }
            }
        }

        function editEvent(goToListing) {
            Event.edit({eventSlug: vm.event.slug}, EventService.formatEventToEdit(vm.event), function sc(response) {
                vm.eventForm = undefined;
                if (goToListing) {
                    $state.go('event.list')
                } else {
                    SweetAlert.swal({
                        title: "Success!",
                        text: "Event was edited successfully.",
                        timer: 1500,
                        showConfirmButton: true
                    })
                }
            });
        }

        function initMap(place) {
            var placeLocation = new google.maps.LatLng(place.latitude, place.longitude),
                infowindow = new google.maps.InfoWindow(),
                mapElement = document.getElementById('map'),
                input = document.getElementById('pac-input');

            var map = new google.maps.Map(mapElement, {
                center: placeLocation,
                zoom: 15
            });

            map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

            var marker = new google.maps.Marker({
                map: map,
                position: placeLocation
            });

            var autocomplete = new google.maps.places.Autocomplete(input);
            autocomplete.bindTo('bounds', map);

            google.maps.event.addListener(marker, 'click', function () {
                infowindow.open(map, this);
            });

            autocomplete.addListener('place_changed', function () {
                infowindow.close();
                marker.setVisible(false);
                var place = autocomplete.getPlace();
                if (!place.geometry) {
                    window.alert("Autocomplete's returned place contains no geometry");
                    return;
                }
                console.log(place);

                // If the place has a geometry, then present it on a map.
                if (place.geometry.viewport) {
                    map.fitBounds(place.geometry.viewport);
                } else {
                    map.setCenter(place.geometry.location);
                    map.setZoom(17);  // Why 17? Because it looks good.
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