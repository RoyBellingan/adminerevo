/*
this will replace the content of the cell with an image,
the webpath will be the same value in the cell
You can use a preview, but you will have to handle yourself the logic
 */
function imageEmbed1(td){
    const path = td.innerText;
    let link = '<a href="'+ path +'" target="_blank"><img src="'+ path +'" /></a>';
    return link;
}

/*
This is used to be able to have a link to multiple place
 */
function multiLink1(td){

}