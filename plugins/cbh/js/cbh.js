class CBH {
    currentDatabase;
    currentTable;
    keyVsId = [];
    idVsKey = [];

    start() {
        $(document).ready(function () {
            //We could inject this from the php ? or is better to load directly from the json file?
            const fetchData = () => fetch("../plugins/cbh/config/" + cbhConf.dbName + ".json").then(res => res.json()).then(res => {
                cbh.handler(res);
            });
            fetchData();

        });
    }

    extractKeyVsId() {
        //This is not ideal, but I have no idea how else to do.
        //We now need to create a map of key vs id  
        let tableHeaderRow = document.querySelectorAll('#table > thead > tr');
        if (tableHeaderRow.length !== 1) {
            return false;
        }
        let headerColumns = tableHeaderRow[0].querySelectorAll('th');
        let id = 0;
        headerColumns.forEach((th) => {
            //0 is a nonce
            // 1 is the column name
            // 2 is the tooltip to sort
            //TODO add the type to properly format ? IE number goes on the right!

            const key = th.children[1].textContent;
            this.keyVsId[key] = id;
            this.idVsKey[id] = key;

            id++;
        });
        return true;
    }

    constructNewUrl(targetTable, filterColumn, filterValue) {
        // Parse the initial URL
        let url = new URL(window.location.href);

        // Extract base URL and query parameters from initial URL
        let baseUrl = url.origin + url.pathname;
        let searchParams = new URLSearchParams(url.search);

        // Construct new query parameters
        searchParams.set('select', targetTable);
        searchParams.set('columns[0][fun]', '');
        searchParams.set('where[0][col]', filterColumn);
        searchParams.set('where[0][op]', '=');
        searchParams.set('where[0][val]', filterValue);

        // Construct the new URL
        let newUrl = baseUrl + '?' + searchParams.toString();

        return newUrl;
    }

    selectMode(tableRewrite) {
        //This section could (should) be done in PHP. But I have no idea how.
        let tableRows = document.querySelectorAll('#table > tbody > tr');
        if (!(tableRows.length > 1)) {
            return false;
        }


        if (!cbh.extractKeyVsId()) {
            return;
        }

        tableRows.forEach((tr) => {
            let tds = tr.querySelectorAll('td');
            //iterate over all the idVsKey
            for (let key in this.keyVsId) {
                if (!tableRewrite[key]) {
                    continue;
                }
                let rewriteRule = tableRewrite[key];

                //there is a ghost column at the beginning
                let td = tds[this.keyVsId[key] + 1];
                //if the rewrite element is present
                if (rewriteRule["rewrite"]) {
                    td.textContent = rewriteRule["rewrite"](td);
                } else {
                    let targetTable = rewriteRule["table"];
                    let filterColumn = rewriteRule["column"];
                    let filterValue = td.innerText;
                    let target = this.constructNewUrl(targetTable, filterColumn, filterValue);
                    td.innerHTML = '<a target="_blank" href="' + target + '">' + td.innerText + '</a>';
                }
            }

        });
    }

    dropdownMode(tableRewrite) {
        let tableRows = document.querySelectorAll('#form > table > tbody > tr');
        if (!(tableRows.length > 1)) {
            return false;
        }
        //first is a TH with the column name, FIRST TD is the operator, second TD is the value
        tableRows.forEach((tr) => {
            let key = tr.querySelectorAll('th')[0].innerText;
            
            if (!tableRewrite[key]) {
                return;
            }
            let rewriteRule = tableRewrite[key];
            if (!rewriteRule["dropdown"]) {
                return;
            }
            let tds = tr.querySelectorAll('td');
            let td = tds[1];
            let old = td.children[0];
            let oldValue = old.innerText; 

            let neu = document.createElement("select");
            $(neu).attr('name', old.getAttribute('name'));
            neu.style = "width:100%";
            $(neu).append($('<option selected="selected"> ').attr('value',old.value).text(old.value));
            //set the current value as as the default selection
            while (td.firstChild) {
                td.removeChild(td.firstChild);
            }
            td.appendChild(neu);

            let url = new URL(window.location.href);
    
            // Extract base URL and query parameters from initial URL
            let baseUrl = url.origin + url.pathname;
            let original = new URLSearchParams(url.search);
            let searchParams = new URLSearchParams();

            // Construct new query parameters
            searchParams.set('server', original.get('server'));
            searchParams.set('username', original.get('username'));

            searchParams.set('db', cbhConf.dbName);
            searchParams.set('table', rewriteRule.table);
            searchParams.set('download', '1');
            searchParams.set('format', "select2");
    
            // Construct the new URL
            let newUrl = baseUrl + '?' + searchParams.toString();

            //deep copy the ingredientsList
            const param = JSON.parse(JSON.stringify(rewriteRule["dropdown"]));
            
            $(neu).select2({
                ajax: {
                    delay: 400,
                    url: newUrl,
                    dataType: 'json',
                    data: function (params) {
			            param.q = params.term;
                        return param;
                    }

                }
            });
            

        });
    }


    handler(jsonData) {
        this.currentDatabase = cbhConf.dbName;
        this.currentTable = cbhConf.table;

        if (!jsonData[this.currentTable]) {
            return;
        }
        const tableRewrite = jsonData[this.currentTable];

        //do we have something to do for this mode ?
        switch (cbhConf.mode) {
            case 'SELECT':
                this.selectMode(tableRewrite);
                break;
            case 'EDIT':
                this.dropdownMode(tableRewrite);
                break;
        }
    }
}

let cbh = new CBH();
cbh.start();

