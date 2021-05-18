/**
 * Bright Lend Dashboard
 * hints support markdown
 */

$(document).ready(function () {

    $('body.account-type-standard #navWelcome span').html('Overview');

    var workflow = {
        title: ' ',
        menu: [{
            name: 'Information',
            app: 'company/profile',
            icon: 'account',
            hint: 'Please ensure your legal name matches your application and verify the completeness and accuracy of other fields.'
        },
            {
                name: 'Connect Applications',
                app: 'company/integrations',
                icon: 'widgets',
                hint: 'Please connect your *business* applications and accounts to complete your application. This will only allow us to read your data without any write permission. If you do not use cloud based accounting systems there is an excel form you can fill in on the Upload Files step',
                options: {tags: 'accounting'}
            },
            {
                name: 'Upload Files',
                app: 'company/documents',
                icon: 'cloud-upload',
                hint: 'Optional: If you prefer to manually upload files instead of connecting cloud applications you must upload a copy of your chart of accounts and monthly trial balance files. Please see the *templates* box for examples. After upload you need to select the file, select the document type and choose import. For full instructions see https://bossinsights.atlassian.net/wiki/spaces/CH/pages/179273730/Upload+Financial+Documents',
                options: {docFilter: 'CHART_OF_ACCOUNTS,TRIAL_BALANCE', show: 'templates'}
            },
            {
                name: 'Map Data',
                app: 'company/mapping',
                icon: 'calendar',
                hint: 'Please fill in the information below which will enable the platform to better understand your finances.\n' +
                    'There are four categories to fill in:\n' +
                    '1.    Period Name: This is pre-filled to default period – there is no need to alter this, it is for your reference and useful if you have multiple periods defined\n' +
                    '2.    Accounting Source: Your accounting system will be included in a drop-down menu. For example, if you used QuickBooks, it will be an option for you to select. Please select it.\n' +
                    '3.    Financial Year End: Please enter the year end of your company\n' +
                    '4.    Accounting Source Start Date: Please enter the date that you started using the cloud based accounting system. If you are using an excel file, please enter the date you started using that file (e.g. January 1, 2019)\n' +
                    '5.    Click save, then click *modify chart of accounts* and review the list to ensure each account is mapped correctly'
            },
            {
                name: 'Reconcile',
                app: 'company/reconciliation',
                icon: 'refresh-alt',
                options: {tags: 'accounting'},
                hint: 'When providing new data you should indicate the date it was last reviewed for accuracy, for example you may provide financial information until Apr 20th yet have only verified your accounting transactions up till Mar 31st - in this case you would indicate Mar 31st as the date information can be relied on until'
            },
            {
                name: 'Submit',
                app: 'company/forms',
                icon: 'flag',
                hint: 'Verify the completeness and accuracy of your data before submitting the form below.',
                options: {key:'submit'}
            }
        ]
    };

    myIntranetApps.dashboard.renderCustomWorkflow(workflow);

    /*
    build table of requirements
    show current fullfilment status - from requirements.php
    show actions
     */

    if(myIntranetApps.accountType === 'standard'){
        /* get the current account requirements */
        $.ajax('/apps/company/form-data.php?key=profile&fields', {
            success: function (data) {

                var i,g,len;
                var infoStatementsFieldValues = [];
                var infoStatements = data.data['info-statements'] || [];
                var workflowState = data.data['__state'] || '';

                for (i = 0, len = data.fields.length; i < len; i++) {
                    if(data.fields[i].name === 'info-statements'){
                        infoStatementsFieldValues = data.fields[i].values;
                    }
                }

                /* requirements have a name, status, set of actions to take, whether they are fulfilled (and by which source)  */
                var requirements = [];

                for(i = 0, len = infoStatements.length; i < len; i++)
                {
                    for(g = 0; g < infoStatementsFieldValues.length; g++){

                        if(infoStatements[i] === infoStatementsFieldValues[g].value){

                            // some requirements are custom so we need to figure out manually, others are well-known and can be checked below
                            switch (infoStatementsFieldValues[g].value)
                            {
                                case 'cash_flow_forecast':
                                    requirements.push({
                                        title: infoStatementsFieldValues[g].title,
                                        value: infoStatementsFieldValues[g].value,
                                        status: (data.data['cashflow-forecast'].file || false),
                                        actions: [{icon:'assignment',url:false,title:'Fill Form',item:'company_profile'}],
                                        source: (data.data['cashflow-forecast'].name || 'File'),
                                        who: data.data['__cashflow-forecast'].user,
                                        when: data.data['__cashflow-forecast'].modified
                                    });
                                    break;
                                case 'bank_transfer':
                                    requirements.push({
                                        title: infoStatementsFieldValues[g].title,
                                        value: infoStatementsFieldValues[g].value,
                                        status: (Boolean(data.data['institution-number']) || false),
                                        actions: [{icon:'assignment',url:false,title:'Fill Form',item:'company_profile'}],
                                        source: (data.data['bank-name'] || ''),
                                        who: data.data['__institution-number'].user,
                                        when: data.data['__institution-number'].modified
                                    });
                                    break;
                                case 'irs_1120':
                                    requirements.push({
                                        title: infoStatementsFieldValues[g].title,
                                        value: infoStatementsFieldValues[g].value,
                                        status: ( (typeof data.data['irs_1120'][0] !== 'undefined')? data.data['irs_1120'][0].file : false),
                                        actions: [{icon:'assignment',url:false,title:'Fill Form',item:'company_profile'}],
                                        source: ( (typeof data.data['irs_1120'][0] !== 'undefined')? data.data['irs_1120'][0].name : 'File'),
                                        who: data.data['__irs_1120'].user,
                                        when: data.data['__irs_1120'].modified
                                    });
                                    break;
                                case 'cra_t2':
                                    requirements.push({
                                        title: infoStatementsFieldValues[g].title,
                                        value: infoStatementsFieldValues[g].value,
                                        status: ( (typeof data.data['cra_t2'][0] !== 'undefined')? data.data['cra_t2'][0].file : false),
                                        actions: [{icon:'assignment',url:false,title:'Fill Form',item:'company_profile'}],
                                        source: ( (typeof data.data['cra_t2'][0] !== 'undefined')? data.data['cra_t2'][0].name : 'File'),
                                        who: data.data['__cra_t2'].user,
                                        when: data.data['__cra_t2'].modified
                                    });
                                    break;
                                case 'prepared_financials':
                                    var fsFieldset = Object.values(data.data['financial-statements'] || {});
                                    var fsUploaded = (typeof fsFieldset !== 'undefined') && (typeof fsFieldset[0] !== 'undefined') && (typeof fsFieldset[0]['fs-upload'] !== 'undefined') && fsFieldset[0]['fs-upload'].file.length>0;
                                    requirements.push({
                                        title: infoStatementsFieldValues[g].title,
                                        value: infoStatementsFieldValues[g].value,
                                        status: (fsUploaded),
                                        actions: [{icon:'assignment',url:false,title:'Fill Form',item:'company_profile'}],
                                        source: ( (fsUploaded)?fsFieldset[0]['fs-upload'].name : ''),
                                        who: (fsUploaded)? data.data['__financial-statements'].user : '',
                                        when: (fsUploaded)? data.data['__financial-statements'].modified : ''
                                    });
                                    break;
                                default:
                                    // populate the initial set of requirements objects from those selected in the profile data
                                    requirements.push({title: infoStatementsFieldValues[g].title, value: infoStatementsFieldValues[g].value});
                                    break;
                            }
                        }
                    }
                }
                // fetch and update the status of each well-known requirement
                $.ajax('/apps/company/requirements.php', {
                    type: 'POST',
                    data: {requirements: requirements},
                    success: function(data){

                        for(g=0; g<requirements.length; g++){
                            for(i=0; i<data.requirements.length; i++){
                                if(requirements[g].value == data.requirements[i].value){
                                    requirements[g].status = data.requirements[i].status;
                                    requirements[g].statusMessage = data.requirements[i].statusMessage;
                                    requirements[g].source = data.requirements[i].source;
                                    requirements[g].key = data.requirements[i].key;
                                    requirements[g].who = data.requirements[i].who;
                                    requirements[g].when = data.requirements[i].when;
                                }
                            }
                        }

                        myIntranetApps.dashboard.renderCustomWelcome({'requirements':requirements});
                    }
                });
            }
        });
    }

});

