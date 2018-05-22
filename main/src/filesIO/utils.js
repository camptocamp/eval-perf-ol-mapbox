const fs = require('fs');

function outputJSON(object, filename, path) {
  fs.writeFile(
    `${path}${filename}`,
    JSON.stringify(object),
    (err) => {
      if (err) {
        console.error(err);
      }
    },
  );
}

export { outputJSON };