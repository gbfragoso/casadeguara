import type { Window as HappyDomWindow } from 'happy-dom';

const PHONE_VIEWPORT = { width: 390, height: 844 };
const DEFAULT_VIEWPORT = { width: 1024, height: 768 };

const happyDom = () => (window as unknown as HappyDomWindow).happyDOM;

export const usePhoneViewport = () => happyDom().setViewport(PHONE_VIEWPORT);

export const restoreDefaultViewport = () => happyDom().setViewport(DEFAULT_VIEWPORT);
