

class Dataset {
    constructor(title_array, content_array) {
        this.titles = title_array;
        this.content = content_array;
    }


    filterByStringMultiCol(query_string, dataset_titles, exclude, case_sensitive) {
        // Return matching 
        let col_idxs = [];
        for (let i = 0; i < dataset_titles.length; i++) {
            let col_index = this.titles.indexOf(dataset_titles[i]);
            if (col_index == -1)
                return new Dataset(this.titles, []);
            col_idxs.push(col_index);
        }

        let result_rows = []
        for (let i = 0; i < this.content.length; i++) {
            for (let j = 0; j < col_idxs.length; j++) {
                console.log(col_idxs[j]);
                if (case_sensitive && exclude != this.content[i][col_idxs[j]].includes(query_string)){
                    result_rows.push(this.content[i]);
                    break;
                }
                else if (!case_sensitive && exclude != this.content[i][col_idxs[j]].toLowerCase().includes(query_string.toLowerCase())){
                    result_rows.push(this.content[i]);
                    break;
                }
            }

        }
        return new Dataset(this.titles, result_rows);
    }


    filterByString(query_string, dataset_title, exclude, case_sensitive) {
        // Return matching 
        let col_index = this.titles.indexOf(dataset_title);
        if (col_index == -1)
            return new Dataset(this.titles, []);
        let result_rows = []
        for (let i = 0; i < this.content.length; i++) {
            if (case_sensitive && exclude != this.content[i][col_index].includes(query_string))
                result_rows.push(this.content[i]);
            else if (!case_sensitive && exclude != this.content[i][col_index].toLowerCase().includes(query_string.toLowerCase()))
                result_rows.push(this.content[i]);
        }
        return new Dataset(this.titles, result_rows);
    }

    filterByDate(query, dataset_title, exclude, after) {
        console.log("DATE FILTER");
        let query_date = parseDate(query);
        let col_index = this.titles.indexOf(dataset_title);
        if (col_index == -1)
            return new Dataset(this.titles, []);
        let result_rows = []
        for (let i = 0; i < this.content.length; i++) {
            let db_date = new Date(this.content[i][col_index]);
            if (exclude != (after == (query_date <= db_date)))
                result_rows.push(this.content[i]);

        }
        return new Dataset(this.titles, result_rows);
    }

    getDatasetRows() {
        return this.content;
    }

    getDatasetRow(x) {
        return this.content[x];
    }

    getDatasetCell(x, y) {
        return this.content[x][y];
    }

    getEmptyContent() {
        return new Dataset(this.titles, []);
    }

    mergeDataset(otherDataset) {
        return new Dataset(this.titles, this.content.concat(otherDataset.content));
    }

}


class Sheet {
    constructor(sheet_id, sheet_page, loaded_callback) {
        // this.href = "https://spreadsheets.google.com/feeds/list/" + sheet_id + "/default/public/values?alt=json";
        this.href = "https://spreadsheets.google.com/feeds/cells/" + sheet_id + "/" + sheet_page + "/public/full?alt=json";
        // https://spreadsheets.google.com/feeds/cells/1Oo1-3ad5_8srmHnc_sUpxgF11kxsapyGs8ogd5cR46g/2/public/full?alt=json
        this.sheet_json = null;
        this.dataset = null;
        fetch(this.href)
            .then((response) => {
                return response.json();
            })
            .then((myJson) => {
                // console.log(myJson);
                this.buildDatabaseArray(myJson);
                this.sheet_json = myJson;
            })
            .then(() => {
                loaded_callback();
            });
    }

    getDataset() {
        return this.dataset;
    }

    buildDatabaseArray(sheet_json) {
        let entries = sheet_json.feed.entry;

        let db_arr = [];

        let last_y = -1;
        for (let i = 0; i < entries.length; i++) {
            let coord_text = entries[i].title["$t"];
            let [x, y] = textToXYCoords(coord_text);
            if (y != last_y) {
                // Create new row
                last_y = y;
                db_arr.push([]);
            }
            // Push column to current row
            db_arr[last_y].push(entries[i].content["$t"])
            // console.log(entries[i].content["$t"]);
        }

        this.titles = db_arr[0];
        db_arr.shift();
        this.content = db_arr;
        // console.log(this.titles);
        // console.log(this.content);
        this.dataset = new Dataset(this.titles, this.content)
    }

    // getDbRows(){
    //     return this.content;
    // }

    // getDbCell(x, y){
    //     return this.content[x][y];
    // }

    // getDbRow(x){
    //     return this.content[x];
    // }

    // getDbRowsByString(query_string, query_title){
    //     // Return matching 
    //     let col_index = this.titles.indexOf(query_title);
    //     if (col_index == -1)
    //         return [];
    //     let result_rows = []
    //     for(let i=0; i<this.content.length; i++){
    //         if (this.content[i][col_index].includes(query_string))
    //             result_rows.push(this.content[i]);
    //     }
    //     return result_rows;
    // }

};