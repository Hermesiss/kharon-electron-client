const path = require("path");

const yaml = require("js-yaml")
const fs = require("fs");

const removePublishers = async (context) => {
  const filePath = path.join(path.join(context.appOutDir, 'resources'), 'app-update.yml');

  try {
    const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));

    delete doc['publisherName']
    delete doc['token']
    const edited = yaml.dump(doc);

    fs.writeFileSync(filePath, edited);
  } catch (e) {
    console.error(e);
  }
}


exports.default = removePublishers
