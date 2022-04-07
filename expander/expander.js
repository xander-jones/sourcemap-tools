// based on original gist: https://gist.github.com/zxbodya/ca6fb758259f6a077de7

var fs = require('fs');
var path = require('path')

if (process.argv.length < 3) {
  console.error("Not enough arguments given, usage: node expander MAPS_TO_EXPAND...")
} else {
  var maps = process.argv.splice(2, process.argv.length)
  console.debug("maps", maps)

  function mapping(name) {
    if (/^webpack:\/\/\/\.\//.test(name)) {
      return 'unpacked/' + name.replace(/^webpack:\/\/\/\.\//, 'app/')
        .replace(/\.(\w+)\?[./]*/, '\.$1');
    } else {
      return "unpacked/" + name
    }
  }

  maps.forEach(function (mainJSON) {
    var main = JSON.parse(fs.readFileSync(mainJSON));

    main.sources.forEach(function (name, i) {
      var dstFile;
      if (dstFile = mapping(name)) {
        if (!fs.existsSync(dstFile)) {
          var dirs = dstFile.split('/');
          dirs.slice(0, -1).reduce(function (acc, di) {
            var dir = acc + di;
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }
            return dir + '/';
          }, './');

          try {
            fs.writeFileSync(dstFile, main.sourcesContent[i]);
          } catch(err) {
            console.error(`An error occurred expanding:\r\n` +
            `    source file:   ${name}\r\n` +
            `    map index:     ${i}\r\n` +
            `    sourceContent: ${main.sourcesContent[i]}\r\n`)
          }
        }
      } else {
        console.log('Mapping missing for filename: ' + name);
      }
    });
  });
}