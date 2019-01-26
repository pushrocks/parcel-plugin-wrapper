import * as plugins from './parcel-plugin-wrapper.plugins';
import '@gitzone/tsrun';

module.exports = bundler => {
  const readAsset = pathArg => {
    try {
      return plugins.fs.readFileSync(pathArg, 'utf8');
    } catch (e) {
      console.error('file is invalid');
      throw e;
    }
  };

  const writeAsset = (name, { header = '', footer = '' }) => {
    plugins.fs.writeFileSync(
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

    bundle.childBundles.forEach((bundleArg) => {
      processAsset(bundleArg, processFn);
    });
  };

  bundler.on('bundled', async bundleArg => {
    try {
      const CWD = process.cwd();
      const processFn = require(plugins.path.join(CWD, '.assetWrapper.ts'));
      if (processFn && typeof processFn === 'function') {
        await processAsset(bundleArg, processFn);
      }
    } catch (error) {
      console.warn(
        'parcel-plugin-wrapper cannot work without a .assetWrapper.js in the root of your project!'
      );
    }
  });
};
