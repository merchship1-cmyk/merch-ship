const { by, device, element, expect, waitFor } = require('detox');

const email = process.env.TEST_USER_A_EMAIL;
const password = process.env.TEST_USER_A_PASSWORD;

if (!email || !password) {
  throw new Error('TEST_USER_A_EMAIL and TEST_USER_A_PASSWORD are required.');
}

describe('ZENZY Phase 1A gate', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true, newInstance: true });
  });

  it('enforces clarity → acceptance → execution → review', async () => {
    await element(by.id('login-email')).replaceText(email);
    await element(by.id('login-password')).replaceText(password);
    await element(by.id('login-submit')).tap();

    await waitFor(element(by.id('input-textarea')))
      .toBeVisible()
      .withTimeout(30000);

    await element(by.id('input-textarea')).replaceText(
      'I want to make a spooky kids video but I only have 20 minutes.',
    );
    await element(by.id('input-submit')).tap();

    await waitFor(element(by.id('clarity-screen')))
      .toBeVisible()
      .withTimeout(60000);
    await element(by.id('clarity-screen')).scrollTo('bottom');
    await expect(element(by.id('accept-next-move'))).toBeVisible();
    await expect(element(by.id('execution-screen'))).not.toBeVisible();

    await element(by.id('accept-next-move')).tap();

    await waitFor(element(by.id('execution-screen')))
      .toBeVisible()
      .withTimeout(30000);

    for (let index = 0; index < 4; index += 1) {
      await element(by.id('execution-screen')).scrollTo('bottom');
      await element(by.id('transformation-continue')).tap();
    }

    await element(by.id('execution-screen')).scrollTo('bottom');
    await expect(element(by.id('review-outcome'))).toBeVisible();
  });
});
