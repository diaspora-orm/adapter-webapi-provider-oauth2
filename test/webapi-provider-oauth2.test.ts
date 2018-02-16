import DummyClass from '../src/webapi-provider-oauth2';

/**
 * Dummy test
 */
describe('Dummy test', () => {
	it('works if true is truthy', () => {
		expect(true).toBeTruthy();
	});

	it('DummyClass is instantiable', () => {
		expect(new DummyClass()).toBeInstanceOf(DummyClass);
	});
});
