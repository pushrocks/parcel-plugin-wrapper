import { expect, tap } from '@pushrocks/tapbundle';
import * as parcelPluginWrapper from '../ts/index';

tap.test('first test', async () => {
  console.log('ok');
});

tap.start();
