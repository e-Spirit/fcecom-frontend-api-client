import { mock } from 'jest-mock-extended';
import { SNAP } from '../core/integrations/tpp/TPPWrapper.meta';
import { Ready } from './HookService';
import { TPPBroker } from './TPPBroker';
import { SNAPButton, SNAPButtonScope, SNAPMoveSectionOptions } from './TPPBroker.meta';

const snap = mock<SNAP>();
describe('TPPBroker', () => {
  describe('execute()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'execute');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.execute('identifier', {}, true);
      // Assert
      expect(spy).toHaveBeenCalledWith('identifier', expect.any(Object), true);
    });
  });
  describe('getElementStatus()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'getElementStatus');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.getElementStatus('previewId');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId');
    });
  });
  describe('getPreviewElement()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'getPreviewElement');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.getPreviewElement();
      // Assert
      expect(spy).toHaveBeenCalledWith();
    });
  });
  describe('moveSection()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'moveSection');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.moveSection('source', 'target', {
        before: true,
        copy: true,
        skipRerenderEvent: true,
      });
      // Assert
      expect(spy).toHaveBeenCalledWith(
        'source',
        'target',
        expect.objectContaining({
          before: true,
          copy: true,
          skipRerenderEvent: true,
        } as SNAPMoveSectionOptions)
      );
    });
  });
  describe('processWorkflow()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'processWorkflow');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.processWorkflow('previewId', 'transition');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId', 'transition');
    });
  });
  describe('registerButton()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'registerButton');
      const tppBroker = TPPBroker.getInstance();
      const isVisible = (scope: SNAPButtonScope) => Promise.resolve(true);
      // Act
      tppBroker.registerButton(
        {
          label: 'label',
          _name: 'name',
          isVisible,
        },
        0
      );
      // Assert
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'label',
          _name: 'name',
          isVisible,
        } as SNAPButton),
        0
      );
    });
  });
  describe('renderElement()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'renderElement');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.renderElement('previewId');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId');
    });
  });
  describe('showEditDialog()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'showEditDialog');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.showEditDialog('previewId');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId');
    });
  });
  describe('showMessage()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'showMessage');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.showMessage('message', 'kind', 'title');
      // Assert
      expect(spy).toHaveBeenCalledWith('message', 'kind', 'title');
    });
  });
  describe('showMetaDataDialog()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'showMetaDataDialog');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.showMetaDataDialog('previewId');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId');
    });
  });
  describe('showQuestion()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'showQuestion');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.showQuestion('message', 'title');
      // Assert
      expect(spy).toHaveBeenCalledWith('message', 'title');
    });
  });
  describe('startWorkflow()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'startWorkflow');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.startWorkflow('previewId', 'workflow');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId', 'workflow');
    });
  });
  describe('triggerChange()', () => {
    it('calls real snap function', () => {
      // Arrange
      Ready.snap = snap;
      const spy = jest.spyOn(snap, 'triggerChange');
      const tppBroker = TPPBroker.getInstance();
      // Act
      tppBroker.triggerChange('previewId', 'content');
      // Assert
      expect(spy).toHaveBeenCalledWith('previewId', 'content');
    });
  });
});
