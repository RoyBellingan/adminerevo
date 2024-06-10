class CBH {
    currentDatabase;
    currentTable;
    keyVsId = [];
    idVsKey = [];

    start() {
        $(document).ready(function () {
            //We could inject this from the php ? or is better to load directly from the json file?
            const fetchData = () => fetch("../plugins/cbh/config/" + cbhConf.dbName + ".json").then(res => res.json()).then(res => {
                switch(cbhConf.mode){
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
        headerColumns.forEach((th)  => {
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

    skipMe4Select(rewriteRule){
        let skipMe   = ['dropdown', 'readonly'];
        for (let i = 0; i < skipMe.length; i++) {
            // Check if the current entity is present in the arrayToSearch
            if (rewriteRule.includes(entities[i])) {
                return true; // Return true if a match is found
            }
        }
        return false;
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

        if(!cbh.extractKeyVsId()){
            return;
        }

        let tableRows = document.querySelectorAll('#table > tbody > tr');
        if (tableRows.length !== 1) {
            return false;
        }

        let id = 0;
        tableRows.forEach((tr) => {
            let td = tr.querySelectorAll('td');
            let key = this.idVsKey[id];
            if (!tableRewrite[key]) {
                return;
            }
            let rewriteRule = tableRewrite[key];
            if(skipMe4Select(rewriteRule)){
                return;
            }
            //if the rewrite element is present
            if (rewriteRule["rewrite"]) {
                td.children[1].textContent = rewriteRule["rewrite"](td);
            }else{
                //this is not handled there
            }

            
            

            id++;
        });

    }
}

let cbh = new CBH();
cbh.start();

