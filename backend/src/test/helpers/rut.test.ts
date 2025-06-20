import { expect } from 'chai';
import { validateRut, formatRut } from '../../helpers/rut.helper.js';

describe('RUT Helper Functions', () => {
    describe('validateRut', () => {
        it('should validate correct RUTs', () => {
            expect(validateRut('11.111.111-1')).to.equal(true);
            expect(validateRut('22.222.222-2')).to.equal(true);
            expect(validateRut('33.333.333-3')).to.equal(true);
            expect(validateRut('44.444.444-4')).to.equal(true);
            expect(validateRut('55.555.555-5')).to.equal(true);
        });

        it('should validate RUTs without dots', () => {
            expect(validateRut('11111111-1')).to.equal(true);
            expect(validateRut('22222222-2')).to.equal(true);
            expect(validateRut('33333333-3')).to.equal(true);
        });

        it('should validate RUTs with K as verifier', () => {
            expect(validateRut('12.345.678-K')).to.equal(true);
            expect(validateRut('12345678-K')).to.equal(true);
        });

        it('should reject invalid RUTs', () => {
            expect(validateRut('11.111.111-2')).to.equal(false); // Wrong verifier
            expect(validateRut('22.222.222-3')).to.equal(false); // Wrong verifier
            expect(validateRut('33.333.333-4')).to.equal(false); // Wrong verifier
        });

        it('should reject malformed RUTs', () => {
            expect(validateRut('')).to.equal(false);
            expect(validateRut('not a rut')).to.equal(false);
            expect(validateRut('1111111')).to.equal(false);
            expect(validateRut('11.111.111')).to.equal(false);
            expect(validateRut('11111111')).to.equal(false);
            expect(validateRut('11.111.111-')).to.equal(false);
            expect(validateRut('-1')).to.equal(false);
        });

        it('should handle edge cases', () => {
            expect(validateRut('1-9')).to.equal(false); // Too short
            expect(validateRut('999999999-9')).to.equal(false); // Too long
            expect(validateRut('11.111.111-X')).to.equal(false); // Invalid verifier
            expect(validateRut('11.111.111-10')).to.equal(false); // Invalid verifier format
        });
    });

    describe('formatRut', () => {
        it('should format RUTs correctly', () => {
            expect(formatRut('11111111-1')).to.equal('11.111.111-1');
            expect(formatRut('222222222')).to.equal('22.222.222-2');
            expect(formatRut('12345678K')).to.equal('12.345.678-K');
        });

        it('should handle RUTs with existing format', () => {
            expect(formatRut('11.111.111-1')).to.equal('11.111.111-1');
            expect(formatRut('22.222.222-2')).to.equal('22.222.222-2');
        });

        it('should handle RUTs with mixed format', () => {
            expect(formatRut('11.111111-1')).to.equal('11.111.111-1');
            expect(formatRut('22222.222-2')).to.equal('22.222.222-2');
        });

        it('should handle RUTs with spaces', () => {
            expect(formatRut(' 11111111-1 ')).to.equal('11.111.111-1');
            expect(formatRut(' 22.222.222-2 ')).to.equal('22.222.222-2');
        });

        it('should convert lowercase K to uppercase', () => {
            expect(formatRut('12345678k')).to.equal('12.345.678-K');
            expect(formatRut('12.345.678-k')).to.equal('12.345.678-K');
        });
    });
}); 