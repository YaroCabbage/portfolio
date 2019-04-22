var minify = require('html-minifier').minify;
var fs = require('fs');
var url = './html/index-dev.html';
var sec_url = './html/index.html';

var contents = fs.readFileSync(url, 'utf8');
console.log(contents);
var result = minify(contents, {
    removeAttributeQuotes: true,
    useShortDoctype: true,


    removeTagWhitespace: true,
    removeStyleLinkTypeAttributes: true,
    removeScriptTypeAttributes: true,
    removeRedundantAttributes: true,
    removeOptionalTags: true,

    removeEmptyAttributes: true,
    removeComments: true,


    minifyURLs: true,
    minifyJS: true,
    minifyCSS: true,

    collapseWhitespace: true

});


fs.writeFile(sec_url, result, function (err) {
    if (err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
