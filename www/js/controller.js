var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday"];

/**
 * Return a function that stores it's first argument in obj[key].
 *
 * @param obj {object} Target
 * @param key {string} Property of obj
 * @return {function}
 */
function storeIn(obj, key) {
    return function(result) {
        return obj[key] = result;
    }
}

/**
 * Return a function that stores an error in the given property of obj.
 *
 * @param obj {object} Target
 * @param key {string} Property of obj
 * @param message {string} Optional message describing the error
 * @return {function}
 */
function storeErrorIn(obj, key, message) {
    return function(result) {
        console.log("Error: " + message + " " + JSON.stringify(result));
        return obj[key] = result.statusText || message
            || "Failed to load shifts.";
    }
}

angular.module("BFRMobile.controllers", ["BFRMobile.api"])
    .controller("BfrAppCtrl", ['$scope', 'bfrApi',
        function($scope, bfrApi) {
            $scope.signOut = bfrApi.signOut;
        }])

    .controller("UpcomingCtrl", ['$scope', '$q', 'bfrApi', 'bfrLogUtils',
        function($scope, $q, bfrApi, bfrLogUtils) {
            bfrApi.call("/logs/mine_upcoming.json")
                .map(function(result) {
                    return $q.all(result.map(function(item){
                        return bfrApi.logById(item)
                            .then(bfrApi.loadLocationDetail)
                    }))
                })
                .then(storeIn($scope, 'upcomingShifts'))
                .catch(storeErrorIn($scope, 'errorMsg'));

            $scope.addCalendarEvent = function(item) {
                var startTime = new Date(item.schedule.detailed_start_time);
                var stopTime = new Date(item.schedule.detailed_stop_time);

                var title = item.log.donor.name + " to " +
                    item.log.recipients.map(function(recipient) {
                        return recipient.name;
                    }).join(',');

                window.plugins.calendar.createEventInteractively(
                    title, item.log.donor.address, item.schedule.public_notes,
                    bfrLogUtils.nextDate(startTime, item.schedule.day_of_week),
                    bfrLogUtils.nextDate(stopTime, item.schedule.day_of_week),
                    function() {
                        console.log("Added calendar event", item);
                    }, storeErrorIn($scope, 'errorMsg'));
            }
        }])

    .controller("PickUpCtrl", ['$scope', '$q', '$route', 'bfrApi',
        function($scope, $q, $route, bfrApi) {
            $scope.open = bfrApi.call("/logs/open.json")
                .map(function(result) {
                    return $q.all(result.map(function(item){
                        return bfrApi.logById(item)
                            .then(bfrApi.loadLocationDetail)
                    }))
                })
                .then(storeIn($scope, 'openShifts'))
                .catch(storeErrorIn($scope, 'errorMsg'));

            /**
             * Take a shift.
             */
            $scope.take = function(id) {
                bfrApi.call("/logs/" + id + "/take.json")
                    .then(function(response) {
                        alert(response.message);
                        $route.reload();
                    }, storeErrorIn($scope, 'errorMsg'));
            }
        }])

    /*.controller("InfoCtrl", ['$scope', '$q', 'bfrApi', function($scope, $q, bfrApi) {
        $scope.open = bfrApi.call("/logs/open.json")
            .map(function(result) {
                return $q.all(result.map(function(item){
                    return bfrApi.logById(item)
                        .then(bfrApi.loadLocationDetail)
                }))
            })
            .then(function(result){
                console.log(result);
                return result;
            })
            .then(storeIn($scope, 'openShifts'))
            .catch(storeErrorIn($scope, 'errorMsg'));
    }])*/

    .controller("PastCtrl", ['$scope', '$q', 'bfrApi', function($scope, $q, bfrApi) {
        bfrApi.call("/logs/mine_past.json")
            .map(function(result) {
                return $q.all(result.map(function(item){
                    return bfrApi.logById(item)
                        .then(bfrApi.loadLocationDetail)
                }))
            })
            .then(function(result){
                console.log(result);
                return result;
            })
            .then(storeIn($scope, 'pastShifts'))
            .catch(storeErrorIn($scope, 'errorMsg'));
    }])

    .controller("ReportCtrl", [
        '$scope', '$routeParams', '$location', 'bfrApi',
        function($scope, $routeParams, $location, bfrApi) {
            

            $scope.$watch('item.log_parts[null]', function(last) {
                if (last.type && last.name && last.weight) {
                    $scope.item.log_parts[null]={};
                }
            }, true);

            /*$scope.$watch('shiftItems[shiftItems.length-1]', function(last) {
                if (last.type && last.name &&last.weight) {
                    $scope.shiftItems.push({});
                }
            }, true);*/

            bfrApi.call("/food_types.json")
                .then(storeIn($scope, 'foodTypes'));
            bfrApi.call("/scale_types.json")
                .then(storeIn($scope, 'scaleTypes'));
            bfrApi.call("/transport_types.json")
                .then(storeIn($scope, 'transportTypes'));

            bfrApi.logById($routeParams.logId)
                .then(bfrApi.loadLocationDetail)
                .then(storeIn($scope, 'item'))
                .catch(storeErrorIn($scope, 'errorMsg'));

            console.log($scope);

            $scope.submit = function() {
                bfrApi.updateLog($scope.item)
                    .then(function(result) {
                        alert(result.message);
                        $location.path('/report');
                    })
                    .catch(storeErrorIn($scope, 'errorMsg'));
            };
        }])

    /*.controller("ReportCtrl", [
        '$scope', '$routeParams', 'bfrApi',
        function($scope, $routeParams, bfrApi) {*/
            //$scope.shiftItems = [{}];

            /*$scope.$watch('shiftItems[shiftItems.length-1]', function(last) {
                if (last.type && last.name &&last.weight) {
                    $scope.shiftItems.push({});
                }
            }, true);*/

            /*bfrApi.call("/food_types.json")
                .then(storeIn($scope, 'foodTypes'));
            bfrApi.call("/scale_types.json")
                .then(storeIn($scope, 'scaleTypes'));
            bfrApi.call("/transport_types.json")
                .then(storeIn($scope, 'transportTypes'));

            bfrApi.logById($routeParams.logId)
                .then(bfrApi.loadLocationDetail)
                .then(storeIn($scope, 'item'))
                .catch(storeErrorIn($scope, 'errorMsg'));

            console.log($scope);

            $scope.submit = function() {
                bfrApi.updateLog($scope.item)
                    .catch(storeErrorIn($scope, 'errorMsg'));
            };
        }])*/
    
    .controller("SettingsCtrl", ['$scope','$location', function($scope, $location) {
        $scope.pageSwipe = function (page) {        
            $location.url(page);
        };
    }])

    .controller("DetailCtrl", [
        '$scope', '$routeParams', 'bfrApi',
        function($scope, $routeParams, bfrApi) {
            bfrApi.logById($routeParams.logId)
                .then(bfrApi.loadLocationDetail)
                .then(function(shift) {
                    $scope.shift = shift;
                    $scope.locations = [shift.log.donor];
                    shift.log.donor.type = 'Donor';

                    shift.log.recipients.forEach(function(recipient) {
                        recipient.type = 'Recipient';
                        $scope.locations.push(recipient);
                    });
                })
        }]);
