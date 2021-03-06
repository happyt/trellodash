angular.module("entriesApp", ['ngRoute', 'chart.js', 'ngMdIcons'])
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
                    stats: function(ChartData) {
                        // default board name
     //                   console.log("Here is TS");
                        return ChartData.getCounts("Trello Stats");
                    }
                }
            })
            .when("/chart/:board", {
                controller: "ChartController",
                templateUrl: "chart.html",
                 resolve: {
                    stats: function($route, ChartData) {
//                        console.log($route);
                        return ChartData.getCounts($route.current.params.board);
                    }
                }
            })
            .otherwise({
                redirectTo: "/"
            });
    })
    .service("Entries", function($http) {
        console.log("here")
        this.getEntries = function() {
            return $http.get("/entries").
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding entries.");
                });
        };
        this.createEntry = function(entry) {
            console.log("create " + entry._id);
            return $http.post("/entries", entry).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error creating entry." + response);
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
            console.log("edit " + entry._id);
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
        this.getCounts = function(board) {
            return $http.get("/counts/" + board).
                then(function(response) {
                    return response;
                }, function(response) {
                    alert("Error finding count data: " + board);
                });
        }
    })

    .controller("ChartController", function(stats, $scope) {
    // put into date order
        $scope.counts = stats.data.sort(dynamicSort("_id"));
 
        $scope.chartTitle = stats.data[0].boardName;

        $scope.labels = [];
        var aTarget = [];
        var aDone = [];
        var aTodo = [];
        var aCards = [];
        var lastTime = "";
        var nextTime = "";
 


    //    $scope.labels = ["1", "2", "3", "4", "5", "6", "7"];
        for (var i=0; i< stats.data.length; i++) {

            var thedate = stats.data[i]._id;
            // if daily data, not hourly
            if (thedate.length === 10) {
                // need a week number
                dy = parseInt(thedate.substr(0,4));
                dm = parseInt(thedate.substr(5,2))-1;
                dd = parseInt(thedate.substr(8,2));
                
                var dt = new Date(dy, dm, dd);
                var week =  weekOfYear(dt);
                nextTime = week.toString();   
            }
            else {
            // just display the day, for hourly, or week for daily
                nextTime = stats.data[i]._id.substr(8,2);
            }



            if (nextTime == lastTime) {
                $scope.labels.push("");
            } else {
                $scope.labels.push(nextTime);
            }
            lastTime = nextTime;
            
            aTarget.push(stats.data[i].target);
            aDone.push(stats.data[i].totalDone);
            aTodo.push(stats.data[i].totalTodo);
            aCards.push(stats.data[i].totalCards);
        }
        // extra for space to right
        for (var i=0; i<10; i++) {
            $scope.labels.push("");
        }
        $scope.lineData = [aTarget, aTodo, aDone, aCards];



        //console.log(counts.data.length);

        Chart.defaults.global.colors = [ '#AA5580', '#00ADF9', '#88DC00', '#555555', '#FDB45C', '#949FB1', '#4D5360'];

        $scope.series = ['Target', 'Todo', 'Done', 'Cards'];

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

        // doughnut

        $scope.doughnutLabels = ["Contingency", "To do", "Done"];

        var dnTarget = aTarget[aTarget.length - 1];
        var dnDone = aDone[aTarget.length - 1];
        var dnTodo = aTodo[aTarget.length - 1];
        $scope.doughnutData = [dnTarget-dnTodo, dnTodo - dnDone, dnDone];

        var pc = (dnDone * 100)/(dnTarget);
        var pcRounded = parseFloat(Math.round(pc * 10) / 10).toFixed(1);

// try to add score figure

        var canvas2 = document.getElementById("score");
        var ctx = canvas2.getContext("2d");
        ctx.font = "26px Arial";
        ctx.fillStyle = "blue";
        ctx.stroke.width = 3;

        var boxWidth = canvas2.height * 0.6;
        var boxHeight = canvas2.height * 0.6;
        var boxTop = (canvas2.height - boxHeight) /2;
        var boxLeft = 4;
        ctx.lineWidth="6";
        ctx.strokeStyle="blue";
        ctx.rect(boxLeft, boxTop, boxWidth, boxHeight-6);
        ctx.stroke();
        ctx.lineWidth="2";
        ctx.strokeStyle="red";
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillText(pcRounded + "%", boxLeft + boxWidth/2, boxTop + boxHeight/2); 

        // histos
        $scope.histoLabels = [];
        $scope.histoData = [];

        var lastItem = stats.data[stats.data.length-1];
        var nLists =  lastItem.listOut.length;
        var haCards = [];
        var haDone = [];
        var haTodo = [];

        for (var i=0; i<nLists; i++) {
            $scope.histoLabels.push(lastItem.listOut[i].list);
            haCards.push(lastItem.listOut[i].cards);
            haTodo.push(lastItem.listOut[i].todo - lastItem.listOut[i].done);
            haDone.push(lastItem.listOut[i].done);
        }
        $scope.histoData = [];
        $scope.histoData.push(haCards);
        $scope.histoData.push(haDone);
        $scope.histoData.push(haTodo);
        $scope.histoSeries = ['Cards', 'Done', 'Todo'];
  //      $scope.histoData = [[6,4,3], [12,24,22], [33,21,11]];
  //      $scope.histoLabels = ['Planned', 'In progress', 'Done'];
        $scope.histoOptions = {
            scales: {
            yAxes: [
                {
                id: 'y-axis-1',
                type: 'linear',
                stacked: true
                }
            ],
            xAxes: [
                {
                stacked: true
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
            console.log("save " + entry._id);
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
            console.log("saving...?")
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
};

var weekOfYear = function(date){
    var d = new Date(+date);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};