import { mock } from 'jest-mock-extended';
import { RemoteService } from '../../api/RemoteService';
import { FindPageItem, FindPageResponse } from '../../api/Remoteservice.meta';
import { TPPService } from '../../api/TPPService';
import { SetElementParams } from '../../api/TPPService.meta';
import { HookService } from './HookService';
import { EcomHooks } from './HookService.meta';
import { SlotParser } from './SlotParser';

const mockRemoteService = mock<RemoteService>();
const mockTppService = mock<TPPService>();
const mockHookService = mock<HookService>();

jest.mock('../dom/addContentElement/addContentElement', () => {
  return {
    addContentButton: () => document.createElement('button')
  };
});
let parser: SlotParser;
describe('SlotParser', () => {
  beforeEach(() => {
    jest.spyOn(mockTppService, 'getHookService').mockReturnValue(mockHookService);
    parser = new SlotParser(mockRemoteService, mockTppService);
    document.body.innerHTML = `
      <div data-fcecom-slot-name="SLOTNAME"></div>
      <div data-fcecom-slot-name="SLOTNAME2"></div>
    `;
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });
  describe('CONTENT_CHANGED hook', () => {
    it('sets up buttons again if hook was triggered and content was set before', async () => {
      // Arrange
      let addContentCb: (params: any) => void;
      jest.spyOn(mockHookService, 'addHook').mockImplementation((name, cb) => {
        if (name === EcomHooks.CONTENT_CHANGED) {
          addContentCb = cb;
        }
      });
      mockRemoteService.findPage.mockResolvedValue({
        items: [],
      } as FindPageResponse);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as SetElementParams;
      // Act
      parser = new SlotParser(mockRemoteService, mockTppService);
      await parser.parseSlots(params);
      // @ts-ignore - Will be set during constructor callback
      addContentCb({ content: null });
      // Assert
      expect(mockRemoteService.findPage.mock.calls[0][0].id).toEqual(params.id);
      expect(mockRemoteService.findPage.mock.calls[0][0].type).toEqual(params.type);
      expect(mockRemoteService.findPage.mock.calls[1][0].id).toEqual(params.id);
      expect(mockRemoteService.findPage.mock.calls[1][0].type).toEqual(params.type);
      // TODO: Add assertion for buttons
    });
  });
  describe('parseSlots', () => {
    it('sets up add content buttons for each section if page does not already exist', async () => {
      // Arrange
      mockRemoteService.findPage.mockResolvedValue({
        items: [],
      } as FindPageResponse);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as SetElementParams;
      // Act
      await parser.parseSlots(params);
      // Assert
      expect(mockRemoteService.findPage.mock.calls[0][0].id).toEqual(params.id);
      expect(mockRemoteService.findPage.mock.calls[0][0].type).toEqual(params.type);
      // TODO: Add assertion for buttons
    });
    it('sets preview ids for each section if page already exists', async () => {
      // Arrange
      const page = {
        previewId: 'PREVIEWID',
        children: [
          {
            name: 'SLOTNAME',
            previewId: 'PREVIEWID',
          },
          {
            name: 'SLOTNAME2',
            previewId: 'PREVIEWID2',
          },
        ],
      } as FindPageItem;
      mockRemoteService.findPage.mockResolvedValue({
        items: [page],
      } as FindPageResponse);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as SetElementParams;

      // Act
      await parser.parseSlots(params);
      // Assert
      expect(mockRemoteService.findPage.mock.calls[0][0].id).toEqual(params.id);
      expect(mockRemoteService.findPage.mock.calls[0][0].type).toEqual(params.type);
      expect(document.querySelector(`[data-fcecom-slot-name="${page.children[0].name}"][data-preview-id="${page.children[0].previewId}"]`)).toBeDefined();
      expect(document.querySelector(`[data-fcecom-slot-name="${page.children[1].name}"][data-preview-id="${page.children[1].previewId}"]`)).toBeDefined();
      // TODO: Add assertion for buttons
    });
  });
  describe('clear', () => {
    it('clears the DOM', async () => {
      // Arrange
      const page = {
        previewId: 'PREVIEWID',
        children: [
          {
            name: 'SLOTNAME',
            previewId: 'PREVIEWID',
          },
          {
            name: 'SLOTNAME2',
            previewId: 'PREVIEWID2',
          },
        ],
      } as FindPageItem;
      mockRemoteService.findPage.mockResolvedValue({
        items: [page],
      } as FindPageResponse);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as SetElementParams;
      await parser.parseSlots(params);
      // Act
      parser.clear();
      // Assert
      // TODO: Add assertion for buttons
    });
  });
});
