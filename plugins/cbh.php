<?php

function getSelectedTable() {
    return isset($_GET["select"]) ? $_GET["select"] : null;
}

/** This plugin allow the customization of the Adminer interface via JavaScript.
 * So you have certain autocomplete and other features that are not available in the default Adminer interface.

 * @author Roy Bellingan
 * @author Isaac Darkwah
 * @license https://www.apache.org/licenses/LICENSE-2.0 Apache License, Version 2.0
 * @license https://www.gnu.org/licenses/gpl-2.0.html GNU General Public License, version 2 (one or other)
 */
class CBH
{


    /**
     * @param array case insensitive database names in values
     */
    function __construct()
    {
    }

    function head()
    {
        $dbName = adminer()->database();
        $table = getSelectedTable();
        $mode = $this->getCurrentPage();
        if (!strlen($dbName) || !$table) {
            //if no db is selected, do not load the plugin
            return;
        }

        //how to access the nonce from the plugin?
        //https://www.adminer.org/en/plugins/#use
        $rev = 1;
        $nonce = nonce();
        $nonceNaked = get_nonce();

        echo <<<EOD
<script $nonce>
let cbhConf = {};
cbhConf.dbName = "$dbName";
cbhConf.table = "$table";
cbhConf.mode = "$mode";

// Function to dynamically load jQuery
    function conditionalJsLoad(url, callback) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.nonce = "$nonceNaked";
        // Append the script to the document
        document.head.appendChild(script);
        
        script.onload = function() {
            if (typeof callback === 'function') {
                callback();
            }
        };
    }
   
    function load_cbh_js(){
        conditionalJsLoad("../plugins/cbh/js/cbh.js");
        conditionalJsLoad("../plugins/cbh/config/functions.js");
        conditionalJsLoad("../plugins/cbh/js/select2_4.1.0.min.js");
    }

// Check if jQuery is already loaded
if (typeof jQuery == 'undefined') {
    conditionalJsLoad("../plugins/cbh/js/jquery-3.7.1.min.js",load_cbh_js);
} 
   
</script>


<link rel="stylesheet" href="../plugins/cbh/css/select2_4.1.0.min.css">
EOD;
    }

    function getCurrentPage() {
        // Check for various URL parameters to determine the current page context
        if (isset($_GET['select'])) {
            return 'SELECT';
        } elseif (isset($_GET['edit'])) {
            return 'EDIT';
        } else {
            return 'OTHER';
        }
    }

}
