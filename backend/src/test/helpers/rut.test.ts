import { expect } from 'chai';
import { validateRut, formatRut } from '../../helpers/rut.helper.js';

describe('RUT Helper Functions', () => {
    describe('validateRut', () => {
        it('should validate correct RUTs', () => {
            expect(validateRut('12.345.678-5')).to.equal(true);
            expect(validateRut('98.765.432-1')).to.equal(true);
            expect(validateRut('15.487.562-3')).to.equal(true);
            expect(validateRut('20.182.389-4')).to.equal(true);
            expect(validateRut('9.876.543-2')).to.equal(true);
        });

        it('should validate RUTs without dots', () => {
            expect(validateRut('123456785')).to.equal(true);
            expect(validateRut('987654321')).to.equal(true);
            expect(validateRut('154875623')).to.equal(true);
        });

        it('should validate RUTs with K as verifier', () => {
            expect(validateRut('12.345.678-K')).to.equal(true);
            expect(validateRut('12345678-K')).to.equal(true);
        });

        it('should reject invalid RUTs', () => {
            expect(validateRut('12.345.678-9')).to.equal(false); // Wrong verifier
            expect(validateRut('98.765.432-K')).to.equal(false); // Wrong verifier
            expect(validateRut('15.487.562-1')).to.equal(false); // Wrong verifier
        });

        it('should reject malformed RUTs', () => {
            expect(validateRut('')).to.equal(false);
            expect(validateRut('not a rut')).to.equal(false);
            expect(validateRut('1234567')).to.equal(false);
            expect(validateRut('12.345.678')).to.equal(false);
            expect(validateRut('12345678')).to.equal(false);
            expect(validateRut('12.345.678-')).to.equal(false);
            expect(validateRut('-5')).to.equal(false);
        });

        it('should handle edge cases', () => {
            expect(validateRut('1-9')).to.equal(false); // Too short
            expect(validateRut('999999999-9')).to.equal(false); // Too long
            expect(validateRut('12.345.678-X')).to.equal(false); // Invalid verifier
            expect(validateRut('12.345.678-10')).to.equal(false); // Invalid verifier format
        });
    });

    describe('formatRut', () => {
        it('should format RUTs correctly', () => {
            expect(formatRut('123456785')).to.equal('12.345.678-5');
            expect(formatRut('987654321')).to.equal('98.765.432-1');
            expect(formatRut('12345678K')).to.equal('12.345.678-K');
        });

        it('should handle RUTs with existing format', () => {
            expect(formatRut('12.345.678-5')).to.equal('12.345.678-5');
            expect(formatRut('98.765.432-1')).to.equal('98.765.432-1');
        });

        it('should handle RUTs with mixed format', () => {
            expect(formatRut('12.345678-5')).to.equal('12.345.678-5');
            expect(formatRut('98765.432-1')).to.equal('98.765.432-1');
        });

        it('should handle RUTs with spaces', () => {
            expect(formatRut(' 123456785 ')).to.equal('12.345.678-5');
            expect(formatRut(' 98.765.432-1 ')).to.equal('98.765.432-1');
        });

        it('should convert lowercase K to uppercase', () => {
            expect(formatRut('12345678k')).to.equal('12.345.678-K');
            expect(formatRut('12.345.678-k')).to.equal('12.345.678-K');
        });
    });
}); 