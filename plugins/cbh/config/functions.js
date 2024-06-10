function imageEmbed1(td){
    const path = td.innerText;
    let link = '<a href="'+ path +'" target="_blank"><img src="'+ path +'" /></a>';
    return link;
}