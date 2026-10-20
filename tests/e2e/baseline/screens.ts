import { ACCESS_SCREENS } from './screens/acesso';
import { BIBLIOTECA_SCREENS } from './screens/biblioteca';
import { PUBLIC_SCREENS } from './screens/publicas';
import { SECRETARIA_SCREENS } from './screens/secretaria';
import { TESOURARIA_SCREENS } from './screens/tesouraria';
import type { RepresentativeScreen } from './types';

export const REPRESENTATIVE_SCREENS: readonly RepresentativeScreen[] = [
	...ACCESS_SCREENS,
	...BIBLIOTECA_SCREENS,
	...SECRETARIA_SCREENS,
	...TESOURARIA_SCREENS,
	...PUBLIC_SCREENS,
];

export const EXPECTED_CAPTURE_COUNT = 152;
export const EXPECTED_INVENTORY_COUNT = 49;
