/* jshint undef: true, unused: true, strict: false */
/* globals $ */
/* globals myIntranetApps */
/* globals console */
/* globals ApexCharts */
/* globals Twig */
/* globals sprintf */
/* globals moment */

$(document).ready(function () {

    // fetch data for each panel
    myIntranetApps.fetchData({item: 'profile'}, function (data) {

        if (data !== null && data.profile !== null) {
            var profile = data.profile;

            var contentTemplate = Twig.twig({
                data: '<div class="card">' +
                    '<div class="card-body">' +
                    '<h4 class="card-title">Information</h4>\n' +
                    '<table class="factTable">' +
                    '<tr><td>Legal Name</td><td>{{ company_legal_name }}</td></tr>\n' +
                    '<tr><td>Business Number</td><td>{{ business_number }}</td></tr>\n' +
                    '<tr><td>Website</td><td><a target="_blank" href="{{ website }}">{{ website }}</a></td></tr>' +
                    '{% if cash_flow_forecast_file is not empty %}<tr><td>Cash Flow Forecast</td><td><a href="/apps/company/get.php?account={{ account }}&file={{ cash_flow_forecast_file }}&name={{ cash_flow_forecast }}"><i class="zmdi zmdi-file"></i> Download</a></td></tr>{% endif%} \n' +
                    '</table>' +
                    '</div></div>'
            });

            var content = contentTemplate.render({
                account: myIntranetApps.insight.accountKey,
                company_legal_name: profile.company_legal_name,
                business_number: profile.business_number,
                website: profile.website,
                cash_flow_forecast: profile.cashflow_forecast.name,
                cash_flow_forecast_file: profile.cashflow_forecast.file
            });

            $('#zone-left').append(content);
        }
    });

    function snapshotItemContent(value, label, status) {
        var snapshotItemContent = '';
        if (value === null) {
            snapshotItemContent = '<div class="snapshotItem col-4 text-lightgrey"><i class="zmdi zmdi-refresh-sync-alert display-4" title="no data"></i><h4><b class="h4">N/A</b></h4><h6>' + label + '</h6></div>';
        } else {
            switch (status){
                case 'green':
                    snapshotItemContent = '<div class="snapshotItem col-4 text-green"><i class="zmdi zmdi-check-circle display-4"></i><h4><b class="h4">' + value + '</b></h4><h6>' + label + '</h6></div>';
                    break;
                case 'orange':
                    snapshotItemContent = '<div class="snapshotItem col-4 text-orange"><i class="zmdi zmdi-alert-triangle display-4"></i><h4><b class="h4">' + value + '</b></h4><h6>' + label + '</h6></div>';
                    break;
                case 'red':
                    snapshotItemContent = '<div class="snapshotItem col-4 text-red"><i class="zmdi zmdi-alert-octagon display-4"></i><h4><b class="h4">' + value + '</b></h4><h6>' + label + '</h6></div>';
                    break;
                default:
                    break;
            }
        }
        return snapshotItemContent;
    }

    var snapshotContent = ' <div class="card snapshotCard">\n' +
        '                                    <div class="card-body">\n' +
        '                                        <h4 class="card-title">Financial Snapshot</h4>\n' +
        '                                        <h6 class="card-subtitle">key ratios as at: (unreconciled)</h6>\n' +
        '                                        <div class="row" id="snapshotItems" class="snapshotTable">\n' +

        '                                        </div>\n' +
        '                                    </div>\n' +
        '\n' +
        '                                </div>';
    $('#zone-left').append(snapshotContent);

    myIntranetApps.fetchData({item: 'balance-sheet'}, function (data) {

        var refreshBalanceSheet = function(forceRefresh){
            var newBalanceSheetDate = $('#asOfBalanceSheet').periodpicker('value');
            if(typeof newBalanceSheetDate[0] == 'object') {
                var newAsOf = newBalanceSheetDate[0].getUTCFullYear() + '-' + (newBalanceSheetDate[0].getUTCMonth() + 1) + '-' + newBalanceSheetDate[0].getUTCDate();
                var url = '/apps/dashboard/data.php?item=balance-sheet&account=' + myIntranetApps.insight.accountKey + '&asOf=' + newAsOf + ((forceRefresh === true)?'&refresh':'');
                $.getJSON(url, function (data) {
                    $('#balanceSheetTable tr td').html(data.hasCompleteData ? data.balance_sheet : 'insufficient data for selected date');
                }).always(function() {
                    $('#syncBalanceSheet').attr('disabled',false);
                });
            }
        };

        $('#snapshotItems').append(snapshotItemContent( (typeof data.debt_asset_ratio === 'number' && isFinite(data.debt_asset_ratio))?(Math.round((data.debt_asset_ratio + Number.EPSILON) * 100) / 100):null, 'Debt/Asset', 'green'));
        $('#snapshotItems').append(snapshotItemContent( (typeof data.cash_ebitda === 'number' && isFinite(data.cash_ebitda))?(Math.round((data.cash_ebitda + Number.EPSILON) * 100) / 100):null, 'Cash/EBITDA', 'green'));
        $('#snapshotItems').append(snapshotItemContent( (typeof data.current_ratio === 'number' && isFinite(data.current_ratio))?(Math.round((data.current_ratio + Number.EPSILON) * 100) / 100):null, 'Current Ratio', 'green'));
        $('div.snapshotCard h6.card-subtitle').html('Data as of: '+data.asOf + ' ');

        var content = '<div class="card">' +
            '<div class="card-body">' +
            '\n' +
            '<div style="width:100%">\n' +
            '            <div style="float:right;">\n' +
            '                <input type="text" value="'+data.asOf+'" id="asOfBalanceSheet">\n' +
            ' <button class="sync btn btn-sm" id="syncBalanceSheet"><img src="/img/icons/sync.png"></button> ' +
            ' <button class="full btn btn-sm" id="downloadBalanceSheet"><i class="zmdi zmdi-download"></i></button> ' +
            '            </div>\n' +
            '        </div>' +
            '<h4 class="card-title">Balance Sheet</h4><span id=""></span><hr class="card-title-rule">\n' +
            '<table class="insightTable" id="balanceSheetTable"><tr><td>' + (data.hasCompleteData ? data.balance_sheet : 'insufficient data for selected date') + '</td></tr></table>' +
            '</div></div>';

        $('#zone-center').append(content);

        var optionsDateBalanceSheet = {
            timepicker: false,
            tabIndex: 0,
            formatDate: 'YYYY-MM-DD',
            formatDateTime: 'YYYY-MM-DD',
            norange: true,
            cells: [1, 3],
            animation: false,
            lang: "en",
            clearButtonInButton: true,
            todayButton:true,
            onOkButtonClick:function(){
                refreshBalanceSheet();
            }
        };
        $('#asOfBalanceSheet').periodpicker(optionsDateBalanceSheet);
        $('#syncBalanceSheet').on('click', function(){
            $('#syncBalanceSheet').attr('disabled',true);
            refreshBalanceSheet(true);
        });
        $('#downloadBalanceSheet').on('click', function(){
            window.location = '/apps/dashboard/export.php?item=balance-sheet-series&account='+myIntranetApps.insight.accountKey;
        });


    });

    myIntranetApps.fetchData({item: 'metrics', selected: 'all'}, function (data) {


        $('#snapshotItems').append(snapshotItemContent( (typeof data.metrics.dscr === 'number' && isFinite(data.metrics.dscr))?(Math.round((data.metrics.dscr + Number.EPSILON) * 100) / 100):null, 'Debt Service Coverage Ratio', 'green'));

    });


    myIntranetApps.fetchData({item: 'profit-loss'}, function (data) {

        /* START PROFIT LOSS REPORT */
        var refreshProfitLoss = function(forceRefresh){
            var newPeriod = $('#startProfitLoss').periodpicker('value');
            if(typeof newPeriod[0] == 'object' && typeof newPeriod[1] == 'object') {
                var newStart = newPeriod[0].getUTCFullYear() + '-' + (newPeriod[0].getUTCMonth() + 1) + '-' + newPeriod[0].getUTCDate();
                var newEnd = newPeriod[1].getUTCFullYear() + '-' + (newPeriod[1].getUTCMonth() + 1) + '-' + newPeriod[1].getUTCDate();
                var url = '/apps/dashboard/data.php?item=profit-loss&account=' + myIntranetApps.insight.accountKey + '&start=' + newStart + '&end=' + newEnd + ((forceRefresh === true)?'&refresh':'');
                $.getJSON(url, function (data) {
                    $('#profitLossTable tr td').html(data.hasCompleteData ? data.profit_loss : 'insufficient data for selected date range');
                }).always(function() {
                    $('#syncProfitLoss').attr('disabled',false);
                });
            }
        };

        $('#snapshotItems').append(snapshotItemContent( (typeof data.yoy_sales_growth === 'number' && isFinite(data.yoy_sales_growth))?(Math.round(data.yoy_sales_growth + Number.EPSILON) + '%'):null, 'Year Over Year Sales Growth', 'green'));

        var contentProfitLoss = '<div class="card">' +
            '<div class="card-body">' +
            '\n' +
            '<div style="width:100%">\n' +
            '            <div style="float:right;">\n' +
            '                <input type="text" value="'+data.start+'" id="startProfitLoss"><input type="text" value="'+data.end+'" id="endProfitLoss">\n' +
            ' <button class="sync btn btn-sm" id="syncProfitLoss"><img src="/img/icons/sync.png"></button> ' +
            ' <button class="full btn btn-sm" id="fullProfitLoss"><img src="/img/icons/full.png"></button> ' +
            ' <button class="full btn btn-sm" id="downloadProfitLoss"><i class="zmdi zmdi-download"></i></button> ' +
            '            </div>\n' +
            '        </div>' +
            '<!--<p>Between: ' + data.start + ' and ' + data.end + ' </p>-->' +
            '<h4 class="card-title">Profit and Loss</h4><hr class="card-title-rule"><table class="insightTable" id="profitLossTable"><tr><td>' + (data.hasCompleteData ? data.profit_loss : 'insufficient data for selected date range') + '</td></tr></table>' +
            '</div></div>';

        // generate list of accounts, with
        //var balanceSeries = [];
        var g,h,formatPrefix,formatPostfix;
        var balanceSeries = Object.create(null);
        for(g = 0; g < data.periods.length; g++)
        {
            for(h = 0; h < data.periods[g].details.length; h++)
            {
                if(typeof balanceSeries['id-'+data.periods[g].details[h].id] == 'undefined')
                {
                    balanceSeries['id-'+data.periods[g].details[h].id] = {name:data.periods[g].details[h].name, mapping:data.periods[g].details[h].mapping, row:Object.create(null)};

                }
                balanceSeries['id-'+data.periods[g].details[h].id].row['period-'+data.periods[g].start] = data.periods[g].details[h].value ;

            }
        }

        // build data table
        var fullProfitLossHTML = '<table id="profitLossMonthlyTable" class="hidden">';
        fullProfitLossHTML += '<thead><tr><th>Account</th><th>Mapping</th>';

        for(g = 0; g < data.periods.length; g++)
        {
            var monthName = moment(data.periods[g].start, 'YYYY-MM-DD').format('MMM YY');
            fullProfitLossHTML += '<th class="period">'+monthName+'</th>';
        }
        fullProfitLossHTML += '</tr></thead><tbody>';

        $.each(balanceSeries, function(index, value){
            fullProfitLossHTML+='<tr><th>'+value.name+'</th><td>'+value.mapping+'</td>';

            for(g = 0; g < data.periods.length; g++)
            {
                if(typeof value.row['period-'+data.periods[g].start] !== 'undefined')
                {
                    fullProfitLossHTML += '<td class="money">'+$.fn.dataTable.render.number(',', '.', 2).display(value.row['period-'+data.periods[g].start])+'</td>';
                }else {
                    fullProfitLossHTML += '<td class="money">0.00</td>';
                }

            }
            fullProfitLossHTML+='</tr>';
        });

        fullProfitLossHTML += '</tbody>';
        fullProfitLossHTML += '<tfoot><tr><th>Net Profit</th><th></th>';
        for(g = 0; g < data.periods.length; g++)
        {
            formatPrefix = (data.periods[g].totals.profit < 0)?'(':'';
            formatPostfix = (data.periods[g].totals.profit < 0)?')':'';
            fullProfitLossHTML += '<th class="money">'+$.fn.dataTable.render.number(',', '.', 2, formatPrefix, formatPostfix).display( (data.periods[g].totals.profit<0)?-data.periods[g].totals.profit:data.periods[g].totals.profit )+'</th>';
        }
        fullProfitLossHTML += '</tr></tfoot>';
        fullProfitLossHTML += '</table>';

        $('#zone-center').append(contentProfitLoss + fullProfitLossHTML);

        var optionsRangeProfitLoss = {
            timepicker: false,
            tabIndex: 0,
            formatDate: 'YYYY-MM-DD',
            formatDateTime: 'YYYY-MM-DD',
            norange: false,
            cells: [1, 3],
            animation: false,
            lang: "en",
            clearButtonInButton: true,
            todayButton:true,
            end:'#endProfitLoss',
            onOkButtonClick:function(){
                refreshProfitLoss();
            }
        };
        $('#startProfitLoss').periodpicker(optionsRangeProfitLoss);
        $('#syncProfitLoss').on('click', function(){
            $('#syncProfitLoss').attr('disabled',true);
            refreshProfitLoss(true);
        });
        $('#downloadProfitLoss').on('click', function(){
            window.location = '/apps/dashboard/export.php?item=profit-loss-series&account='+myIntranetApps.insight.accountKey+'&start='+data.start+'&end='+data.end;
        });
        $('#fullProfitLoss').on('click', function(){
            var profitLossTableHTML = '<table id="monthlyProfitLossModalTable" style="width:100%;">'+$('#profitLossMonthlyTable').html()+'</table>';

            $('#contentModalContainer').html(profitLossTableHTML);
            $('#contentModal .modal-title').html('Profit and Loss - Ending '+data.end);



            $('#contentModal').modal({
                backdrop: false,
                keyboard: true,
                show:true
            });

            var modalTableButtons = '<div class="dataTables_buttons hidden-sm-down actions">' +
                '<span class="actions__item zmdi zmdi-print" data-table-action="print" title="Print" />' +
                '<span class="actions__item zmdi zmdi-fullscreen" data-table-action="fullscreen" title="Full Screen" />' +
                '<div class="dropdown actions__item">' +
                '<i data-toggle="dropdown" class="zmdi zmdi-download" title="Download" />' +
                '<ul class="dropdown-menu dropdown-menu-right">' +
                '<a class="dropdown-item" data-table-action="excel">Excel (.xlsx)</a>' +
                '<a class="dropdown-item" data-table-action="csv">CSV (.csv)</a>' +
                '</ul>' +
                '</div>' +
                '</div>';

            var modalTable = $('#monthlyProfitLossModalTable').DataTable({
                dom: 'Blfrtip',

                "initComplete": function (settings, json) {
                    $(this).closest('.dataTables_wrapper').prepend(modalTableButtons);
                },

                paging:false,

                searching:false,
                info: false,
                lengthMenu: false,
                orderFixed: [1, 'desc'],
                rowGroup: {
                    dataSrc: 1,
                    endRender: function ( rows, group ) {
                        var numMonthCols = rows.nodes().data()[0].length - 2;
                        var sumOfMonth = 0;
                        var totalRowHTML = '<tr class="group"><th>Total '+group+'</th>';
                        for(var g=0; g<numMonthCols; g++)
                        {
                            sumOfMonth = rows.data().pluck(g+2).reduce(function(a,b){return a + b.replace(/[^\d]/g, '')*1;},0) / 100;
                            totalRowHTML += '<td class="money">'+$.fn.dataTable.render.number(',', '.', 2).display(sumOfMonth)+'</td>';
                        }
                        totalRowHTML += '</tr>';
                        return $(totalRowHTML);
                    },
                },
                "columnDefs": [
                    {
                        "targets": [ 1 ],
                        "visible": false,
                        "searchable": false
                    }
                ]
            });
            $('#monthlyProfitLossModalTable tbody')
                .on( 'mouseenter', 'td', function () {
                    var cellIdx = modalTable.cell(this).index();
                    if(typeof cellIdx !== 'undefined')
                    {
                        var colIdx = cellIdx.column;

                        $( modalTable.cells().nodes() ).removeClass( 'highlight' );
                        $( modalTable.column( colIdx ).nodes() ).addClass( 'highlight' );
                    }

                } );
        });
        /* END PROFIT LOSS REPORT */

        /* START INCOME/EXPENSES CHART */
        if (data !== null && data.timestamp !== null) {
            var content = '<div class="card"><div class="card-body"><div id="chartIncome"></div></div></div>';

            $('#zone-right').append(content);

            var optionsIncome = {
                chart:{
                    height: 300,
                    toolbar:{
                        tools: {
                            download: true,
                            selection: true,
                            zoom: true,
                            zoomin: false,
                            zoomout: false,
                            pan: false,
                            reset: true,
                            customIcons: [{
                                icon: '<img src="/img/icons/sync.png" width="16">',
                                index: 3,
                                title: 'Sync',
                                class: 'custom-icon',
                                click: function (chart, options, e) {

                                    chart.updateSeries([]);
                                    chart.clearAnnotations(); // @todo this is not clearning annotations set in the initial chart options
                                    var url = '/apps/dashboard/data.php?item=profit-loss&refresh&account='+myIntranetApps.insight.accountKey;

                                    $.getJSON(url, function(data) {
                                        chart.updateSeries([{
                                            name: 'Inflow',
                                            type: 'column',
                                            data: data.series.inflow
                                        },{
                                            name: 'Outflow',
                                            type: 'column',
                                            data: data.series.outflow
                                        },{
                                            name: 'Net Change',
                                            type: 'line',
                                            data: data.series.net
                                        }]);

                                        chart.addXaxisAnnotation(

                                            {
                                                x: data.lastReconciledLabel,
                                                strokeDashArray: 0,
                                                borderColor: '#775DD0',
                                                label: {
                                                    borderColor: '#775DD0',
                                                    style: {
                                                        color: '#fff',
                                                        background: '#775DD0',
                                                    },
                                                    text: 'Reconciled',
                                                }
                                            }

                                        );

                                    });

                                }
                            }]
                        }
                    },
                },
                annotations:{
                    xaxis:[
                        {
                            x: data.lastReconciledLabel,
                            strokeDashArray: 0,
                            borderColor: '#775DD0',
                            label: {
                                borderColor: '#775DD0',
                                style: {
                                    color: '#fff',
                                    background: '#775DD0',
                                },
                                text: 'Reconciled',
                            }
                        }
                    ]
                },
                series: [
                    {
                        name: 'Inflow',
                        type: 'column',
                        data: data.series.inflow
                    },
                    {
                        name: "Outflow",
                        type: 'column',
                        data: data.series.outflow
                    },
                    {
                        name: "Net Change",
                        type: 'line',
                        data: data.series.net
                    },
                ],
                xaxis: {
                    categories: data.series.series_labels
                },
                title: {
                    text: 'INCOME/EXPENSES: ' + data.start + ' TILL ' + data.end
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return "$ " + val.toFixed(1) + "k";
                        }
                    }
                }

            };



            var chartIncome = new ApexCharts(document.querySelector("#chartIncome"), $.extend(true, {}, myIntranetApps.insightOptions.cashFlow, optionsIncome));
            chartIncome.render();
        } else {
            $('#zone-right').append('<div class="card"><div class="card-body">no profit/loss data</div></div>');
        }
        /* END INCOME/EXPENSES CHART */

        /* START EARNINGS CHART */
        if (data !== null && data.timestamp !== null) {
            var contentEarnings = '<div class="card"><div class="card-body"><div id="chartEarnings"></div></div></div>';

            $('#zone-right').append(contentEarnings);

            var optionsEarnings = {
                annotations:{
                    xaxis:[
                        {
                            x: data.lastReconciledLabel,
                            strokeDashArray: 0,
                            borderColor: '#775DD0',
                            label: {
                                borderColor: '#775DD0',
                                style: {
                                    color: '#fff',
                                    background: '#775DD0',
                                },
                                text: 'Reconciled',
                            }
                        }
                    ]
                },
                series: [{
                    name: 'Earnings',
                    data: data.series.net
                }, {
                    name: 'EBIT',
                    data: data.series.ebit
                }, {
                    name: 'EBITDA',
                    data: data.series.ebitda
                }],
                chart: {
                    height: 300,
                    type: 'bar'
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '55%',
                        endingShape: 'flat' // rounded
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 2,
                    colors: ['transparent']
                },
                xaxis: {
                    categories: data.series.series_labels,
                },
                yaxis: {
                    labels: {
                        formatter: function (y) {
                            return '$' + y.toFixed(1) + "k";
                        }
                    }
                },
                fill: {
                    opacity: 1
                },
                title: {
                    text: 'EARNINGS: ' + data.start + ' TILL ' + data.end
                },
                tooltip: {
                    y: {
                        formatter: function (val) {
                            return "$ " + val + " thousands";
                        }
                    }
                }
            };


            var chartEarnings = new ApexCharts(document.querySelector("#chartEarnings"), $.extend(true, {}, myIntranetApps.insightOptions.cashFlow, optionsEarnings));
            chartEarnings.render();
        } else {
            $('#zone-right').append('<div class="card"><div class="card-body">no earnings data</div></div>');
        }


    });


});
