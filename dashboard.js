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

});

