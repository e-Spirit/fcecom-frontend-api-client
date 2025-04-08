import { mock } from 'jest-mock-extended';
import { RemoteService } from '../../api/RemoteService';
import { FindPageItem } from '../../api/Remoteservice.meta';
import { TPPService } from '../../api/TPPService';
import { HookService } from '../../../connect/HookService';
import { EcomHooks } from '../../../connect/HookService.meta';
import { SlotParser } from './SlotParser';
import { FsDrivenPageTarget, ShopDrivenPageTarget } from '../../api/TPPService.meta';

const mockRemoteService = mock<RemoteService>();
const mockTppService = mock<TPPService>();

jest.mock('../dom/addContentElement/addContentElement', () => ({
  addContentButton: () => document.createElement('button'),
}));
let parser: SlotParser;
describe('SlotParser', () => {
  beforeEach(() => {
    parser = new SlotParser(mockRemoteService, mockTppService);
    document.body.innerHTML = `
      <div data-fcecom-slot-name="SLOTNAME"></div>
      <div data-fcecom-slot-name="SLOTNAME2"></div>
    `;
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });
  describe('RERENDER_VIEW hook', () => {
    it('sets up buttons again if hook was triggered and content was set before', async () => {
      // Arrange
      let addContentCb: (params: any) => void;
      jest.spyOn(HookService.getInstance(), 'addHook').mockImplementation((name, cb) => {
        if (name === EcomHooks.RERENDER_VIEW) {
          addContentCb = cb;
        }
      });
      const page = {
        previewId: 'testPreviewId',
        children: [],
      } as FindPageItem;
      mockRemoteService.findPage.mockResolvedValue(page);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;
      // Act
      parser = new SlotParser(mockRemoteService, mockTppService);
      await parser.parseSlots(params, page);
      // @ts-ignore - Will be set during constructor callback
      addContentCb({ content: null });
      // Assert
      const { id, type } = params;
      expect(mockRemoteService.findPage.mock.calls[0][0].id).toEqual(id);
      expect(mockRemoteService.findPage.mock.calls[0][0].type).toEqual(type);
    });
  });
  describe('CONTENT_CHANGED hook', () => {
    it('payload.content = null: sets up buttons again if hook was triggered and content was set before', async () => {
      // Arrange
      let addContentCb: (params: any) => void;
      jest.spyOn(HookService.getInstance(), 'addHook').mockImplementation((name, cb) => {
        if (name === EcomHooks.CONTENT_CHANGED) {
          addContentCb = cb;
        }
      });
      const page = {
        previewId: 'testPreviewId',
        children: [],
      } as FindPageItem;
      mockRemoteService.findPage.mockResolvedValue(page);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;
      // Act
      parser = new SlotParser(mockRemoteService, mockTppService);
      await parser.parseSlots(params, page);
      // @ts-ignore - Will be set during constructor callback
      addContentCb({ content: null });
      // Assert
      const { id, type } = params;
      expect(mockRemoteService.findPage.mock.calls[0][0].id).toEqual(id);
      expect(mockRemoteService.findPage.mock.calls[0][0].type).toEqual(type);
    });
    it('payload.content = "": logs warning', async () => {
      // Arrange
      let addContentCb: (params: any) => void;
      jest.spyOn(HookService.getInstance(), 'addHook').mockImplementation((name, cb) => {
        if (name === EcomHooks.CONTENT_CHANGED) {
          addContentCb = cb;
        }
      });
      const page = {
        previewId: 'testPreviewId',
        children: [],
      } as FindPageItem;
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;
      // Act
      parser = new SlotParser(mockRemoteService, mockTppService);
      await parser.parseSlots(params, page);
      const spy = (parser['logger'].warn = jest.fn());
      // @ts-ignore - Will be set during constructor callback
      addContentCb({ content: '' });
      // Assert
      expect(mockRemoteService.findPage.mock.calls.length).toEqual(0);
      expect(spy.mock.calls[0][0]).toBe('Retrieved empty content in CONTENT_CHANGED hook');
    });
  });
  describe('parseSlots', () => {
    it('sets up add content buttons for each section if page does not already exist', async () => {
      // Arrange
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;
      // Act
      await parser.parseSlots(params, null);
      // Assert
      expect(document.querySelector('fcecom-add-content-button-wrapper')).toBeDefined();
    });
    it('sets preview ids for each section if shop driven page already exists', async () => {
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
      mockRemoteService.findPage.mockResolvedValue(page);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;

      // Act
      await parser.parseSlots(params, page);
      // Assert
      expect(document.querySelector(`[data-fcecom-slot-name="${page.children[0].name}"][data-preview-id="${page.children[0].previewId}"]`)).toBeDefined();
      expect(document.querySelector(`[data-fcecom-slot-name="${page.children[1].name}"][data-preview-id="${page.children[1].previewId}"]`)).toBeDefined();
    });
  });
  it('sets preview ids for each section if fs driven page already exists', async () => {
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
    const params = {
      fsPageTemplate: 'FSTEMPLATE',
      fsPageId: 'ID',
      type: 'content',
      isFsDriven: true,
    } as FsDrivenPageTarget;

    // Act
    await parser.parseSlots(params, page);
    // Assert
    expect(document.querySelector(`[data-fcecom-slot-name="${page.children[0].name}"][data-preview-id="${page.children[0].previewId}"]`)).toBeDefined();
    expect(document.querySelector(`[data-fcecom-slot-name="${page.children[1].name}"][data-preview-id="${page.children[1].previewId}"]`)).toBeDefined();
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
      mockRemoteService.findPage.mockResolvedValue(page);
      const params = {
        fsPageTemplate: 'FSTEMPLATE',
        id: 'ID',
        type: 'content',
      } as ShopDrivenPageTarget;
      await parser.parseSlots(params, page);
      // Act
      parser.clear();
      // Assert
    });
  });
});
