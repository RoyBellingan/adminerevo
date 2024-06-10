class CBH {
    currentDatabase;
    currentTable;
    keyVsId = [];
    idVsKey = [];

    start() {
        $(document).ready(function () {
            //We could inject this from the php ? or is better to load directly from the json file?
            const fetchData = () => fetch("../plugins/cbh/config/" + cbhConf.dbName + ".json").then(res => res.json()).then(res => {
                switch (cbhConf.mode) {
                    case "SELECT":
                        cbh.selectMode(res);
                        return;

                    case "EDIT":
                        cbh.editMode(res);
                        return;
                }

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

    skipMe4Select(rewriteRule) {
        let skipMe = ['dropdown', 'readonly'];
        for (let i = 0; i < skipMe.length; i++) {
            // Check if the current entity is present in the arrayToSearch
            if (rewriteRule.hasOwnProperty(skipMe[i])) {
                return true; // Return true if a match is found
            }
        }
        return false;
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


    selectMode(jsonData) {
        this.currentDatabase = cbhConf.dbName;
        this.currentTable = cbhConf.table;

        //check if exists something for the SELECT stage
        if (!jsonData["SELECT"]) {
            return;
        }

        if (!jsonData["SELECT"][this.currentTable]) {
            return;
        }
        const tableRewrite = jsonData["SELECT"][this.currentTable];

        if (!cbh.extractKeyVsId()) {
            return;
        }

        let tableRows = document.querySelectorAll('#table > tbody > tr');
        if (!(tableRows.length > 1)) {
            return false;
        }

        tableRows.forEach((tr) => {
            let tds = tr.querySelectorAll('td');
            //iterate over all the idVsKey
            for (let key in this.keyVsId) {
                if (!tableRewrite[key]) {
                    continue;
                }
                let rewriteRule = tableRewrite[key];
                if (this.skipMe4Select(rewriteRule)) {
                    continue;
                }
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
}

let cbh = new CBH();
cbh.start();

