angular.module("entriesApp", ['ngRoute', 'chart.js'])
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
        $scope.counts = counts.data.sort(dynamicSort("_id"));;

     //   $scope.data = [];
        $scope.labels = [];
        var aTarget = [];
        var aDone = [];
        var aTodo = [];
        var aCards = [];
        var myData = [aTarget, aTodo, aDone, aCards];

    //    $scope.labels = ["1", "2", "3", "4", "5", "6", "7"];
        for (var i=0; i< counts.data.length; i++) {
            $scope.labels.push(i.toString());
            aTarget.push(counts.data[i].target);
            aDone.push(counts.data[i].totalDone);
            aTodo.push(counts.data[i].totalTodo);
            aCards.push(counts.data[i].totalCards);
        }
        //console.log(counts.data.length);

        $scope.data = myData;
 //       ChartJsProvider.setOptions({ colors : [ '#AA5580', '#00ADF9', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });

        $scope.series = ['Target', 'Todo', 'Done', 'Cards'];
        // $scope.data = [
        //     [65, 59, 80, 121, 56, 55, 40],
        //     [28, 48, 40, 19, 86, 27, 90],
        //     [2,   4,  5, 18, 7,   9, 16],
        //     [52, 32, 12, 22, 67, 23, 40]
        // ];
        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
        $scope.options = {
            scales: {
            yAxes: [
                {
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
                }
            ]
            }
        };
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

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

(function (ChartJsProvider) {
  ChartJsProvider.setOptions({ colors : [ '#800000', '#999999', '#DCDCDC', '#46BFBD', '#FDB45C', '#949FB1', '#4D5360'] });
});