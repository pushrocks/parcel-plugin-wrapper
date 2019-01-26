const path = require('path');
const fs = require('fs');

const mainExport = bundler => {
  const readAsset = pathArg => {
    try {
      return fs.readFileSync(pathArg, 'utf8');
    } catch (e) {
      console.error('file is invalid');
      throw e;
    }
  };

  const writeAsset = (name, { header = '', footer = '' }) => {
    fs.writeFileSync(
      name,
      `${header}
${readAsset(name)}
${footer}`
    );
  };

  const processAsset = async (bundle, processFn) => {
    const { name } = bundle;
    const wrappingCode = await processFn({ name, bundler });

    if (wrappingCode) {
      writeAsset(name, wrappingCode);
    }

    bundle.childBundles.forEach(function(bundle) {
      processAsset(bundle, processFn);
    });
  };

  bundler.on('bundled', async bundle => {
    try {
      const CWD = process.cwd();
      const processFn = require(path.join(CWD, '.assetWrapper.js'));
      if (processFn && typeof processFn === 'function') {
        await processAsset(bundle, processFn);
      }
    } catch (error) {
      console.warn(
        'parcel-plugin-wrapper cannot work without a .assetWrapper.js in the root of your project!'
      );
    }
  });
};

export default mainExport;