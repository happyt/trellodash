angular.module("entriesApp", ['ngRoute'])
    .config(function($routeProvider) {
        $routeProvider
            .when("/", {
                templateUrl: "list.html",
                controller: "ListController",
                resolve: {
                    entries: function(Entries) {
                        return Entries.getEntries();
                    }
                }
            })
            .when("/new/entry", {
                controller: "NewEntryController",
                templateUrl: "entry-form.html"
            })
            .when("/entry/:entryId", {
                controller: "EditEntryController",
                templateUrl: "entry.html"
            })
            .when("/chart", {
                controller: "ChartController",
                templateUrl: "chart.html",
                 resolve: {
                    counts: function(ChartData) {
                        return ChartData.getCounts();
                    }
                }
            })
            .otherwise({
                redirectTo: "/"
            })
    })
    .service("Entries", function($http) {
        this.getEntries = function() {
            return $http.get("/entries").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding entries.");
                });
        }
        this.createEntry = function(entry) {
            return $http.post("/entries", entry).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating entry.");
                });
        }
        this.getEntry = function(entryId) {
            var url = "/entries/" + entryId;
            return $http.get(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding this entry.");
                });
        }
        this.editEntry = function(entry) {
            var url = "/entries/" + entry._id;
            console.log(entry._id);
            return $http.put(url, entry).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error editing this entry.");
                    console.log(response);
                });
        }
        this.deleteEntry = function(entryId) {
            var url = "/entries/" + entryId;
            return $http.delete(url).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error deleting this entry.");
                    console.log(response);
                });
        }
    })

    .service("ChartData", function($http) {
        this.getCounts = function() {
            return $http.get("/counts/Trello%20Stats").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding count data.");
                });
        }
    })

    .controller("ChartController", function(counts, $scope) {
        $scope.counts = counts.data;
    })

    .controller("ListController", function(entries, $scope) {
        $scope.entries = entries.data;
    })
    .controller("NewEntryController", function($scope, $location, Entries) {
        $scope.back = function() {
            $location.path("#/");
        }

        $scope.saveEntry = function(entry) {
            Entries.createEntry(entry).then(function(doc) {
                var entryUrl = "/entry/" + doc.data._id;
                $location.path(entryUrl);
            }, function(response) {
                alert(response);
            });
        }
    })
    .controller("EditEntryController", function($scope, $routeParams, Entries) {
        Entries.getEntry($routeParams.entryId).then(function(doc) {
            $scope.entry = doc.data;
        }, function(response) {
            alert(response);
        });

        $scope.toggleEdit = function() {
            $scope.editMode = true;
            $scope.entryFormUrl = "entry-form.html";
        }

        $scope.back = function() {
            $scope.editMode = false;
            $scope.entryFormUrl = "";
        }

        $scope.saveEntry = function(entry) {
            Entries.editEntry(entry);
            $scope.editMode = false;
            $scope.entryFormUrl = "";
        }

        $scope.deleteEntry = function(entryId) {
            Entries.deleteEntry(entryId);
        }
    });