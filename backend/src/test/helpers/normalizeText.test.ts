import { expect } from 'chai';
import { normalizeText } from '../../helpers/normalizeText.helper.js';

describe('normalizeText Helper', () => {
    describe('normalizeText', () => {
        it('debería normalizar texto con tildes', () => {
            expect(normalizeText('Administración')).to.equal('administracion');
            expect(normalizeText('Tecnología')).to.equal('tecnologia');
            expect(normalizeText('Comunicación')).to.equal('comunicacion');
        });

        it('debería convertir a minúsculas', () => {
            expect(normalizeText('ADMINISTRACION')).to.equal('administracion');
            expect(normalizeText('Tecnologia')).to.equal('tecnologia');
        });

        it('debería manejar texto sin tildes', () => {
            expect(normalizeText('Administracion')).to.equal('administracion');
            expect(normalizeText('Tecnologia')).to.equal('tecnologia');
        });

        it('debería manejar texto vacío', () => {
            expect(normalizeText('')).to.equal('');
            expect(normalizeText(null as any)).to.equal('');
            expect(normalizeText(undefined as any)).to.equal('');
        });

        it('debería eliminar espacios extra', () => {
            expect(normalizeText('  Administración  ')).to.equal('administracion');
        });

        it('debería manejar caracteres especiales', () => {
            expect(normalizeText('Área de Tecnología')).to.equal('area de tecnologia');
            expect(normalizeText('Recursos Humanos')).to.equal('recursos humanos');
        });
    });
}); 