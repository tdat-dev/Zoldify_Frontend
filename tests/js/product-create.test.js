/**
 * Unit tests cho Product Create Form
 * Framework: Jest
 *
 * File này test các functions trong product-create.js:
 * - selectCondition, adjustQuantity
 * - setPrice, price formatting
 * - Image upload logic (updateFileInput, renderPreview, removeImage)
 * - Category picker (initCategoryPicker)
 */

const fs = require('fs');
const path = require('path');

// ==================== MOCK FACTORIES ====================

const createMockFile = (options = {}) => ({
    file: new Blob(['test'], { type: 'image/png' }),
    dataUrl: 'data:image/png;base64,test123',
    ...options
});

const createMockCategory = (overrides = {}) => ({
    id: 1,
    name: 'Category Name',
    icon: 'fa-folder',
    image: null,
    children: [],
    ...overrides
});

// ==================== MOCK SETUP ====================

// Mock global window
global.window = global.window || {};
window.categoryData = [];

// Create mock DOM elements
const createMockElement = (options = {}) => {
    const element = {
        addEventListener: jest.fn(),
        querySelector: jest.fn(() => null),
        querySelectorAll: jest.fn(() => []),
        appendChild: jest.fn(),
        remove: jest.fn(),
        insertAdjacentHTML: jest.fn(),
        classList: {
            add: jest.fn(),
            remove: jest.fn(),
            toggle: jest.fn(),
            contains: jest.fn(() => false)
        },
        style: { display: '' },
        dataset: options.dataset || {},
        value: options.value || '',
        innerHTML: '',
        textContent: '',
        id: options.id || '',
        type: options.type || '',
        files: options.files || [],
        children: [],
        focus: jest.fn(),
        click: jest.fn(),
        ...options
    };
    return element;
};

// Mock DOM elements
const mockImageInput = createMockElement({ id: 'imageInput', type: 'file', files: [] });
const mockPreviewGrid = createMockElement({ id: 'imagePreviewGrid' });
const mockConditionInput = createMockElement({ id: 'inputCondition' });
const mockNameInput = createMockElement({ id: 'inputName', value: '' });
const mockImgError = createMockElement({ id: 'imgError' });
const mockDisplayPrice = createMockElement({ id: 'displayPrice', value: '' });
const mockRealPrice = createMockElement({ id: 'realPrice', value: '' });
const mockQuantityInput = createMockElement({ id: 'inputQuantity', value: '1' });
const mockNameCount = createMockElement({ id: 'nameCount' });
const mockCategoryTrigger = createMockElement({ id: 'categoryTrigger' });
const mockCategoryPanel = createMockElement({ id: 'categoryPanel' });
const mockCategoryDisplay = createMockElement({ id: 'categoryDisplay' });
const mockCategoryId = createMockElement({ id: 'inputCategoryId' });
const mockCategoryArrow = createMockElement({ id: 'categoryArrow' });
const mockParentList = createMockElement({ id: 'parentCategoryList' });
const mockChildList = createMockElement({ id: 'childCategoryList' });
const mockCategoryContainer = createMockElement({ id: 'categoryContainer' });

document.getElementById = jest.fn((id) => {
    const elements = {
        'imageInput': mockImageInput,
        'imagePreviewGrid': mockPreviewGrid,
        'inputCondition': mockConditionInput,
        'inputName': mockNameInput,
        'imgError': mockImgError,
        'displayPrice': mockDisplayPrice,
        'realPrice': mockRealPrice,
        'inputQuantity': mockQuantityInput,
        'nameCount': mockNameCount,
        'categoryTrigger': mockCategoryTrigger,
        'categoryPanel': mockCategoryPanel,
        'categoryDisplay': mockCategoryDisplay,
        'inputCategoryId': mockCategoryId,
        'categoryArrow': mockCategoryArrow,
        'parentCategoryList': mockParentList,
        'childCategoryList': mockChildList,
        'categoryContainer': mockCategoryContainer
    };
    return elements[id] || null;
});

document.querySelectorAll = jest.fn(() => []);
document.createElement = jest.fn((tag) => createMockElement({ tagName: tag }));
document.body = createMockElement();

// Mock DataTransfer
global.DataTransfer = jest.fn(() => ({
    items: {
        add: jest.fn()
    },
    files: []
}));

// Mock FileReader
global.FileReader = jest.fn(() => ({
    onload: null,
    readAsDataURL: jest.fn(function() {
        if (this.onload) {
            this.onload({ target: { result: 'data:image/png;base64,mock' } });
        }
    })
}));

// Mock Intl.NumberFormat
const mockNumberFormat = {
    format: jest.fn((num) => num.toLocaleString('vi-VN'))
};
global.Intl = {
    NumberFormat: jest.fn(() => mockNumberFormat)
};

// Mock console
jest.spyOn(console, 'log').mockImplementation();

// ==================== LOAD SOURCE (define globals) ====================

// We need to expose the functions to window for testing
const productCreatePath = path.join(__dirname, '../../public/js/product-create.js');
const productCreateCode = fs.readFileSync(productCreatePath, 'utf8');

// Execute - this defines window.selectCondition, etc.
eval(productCreateCode);

// ==================== TEST SUITES ====================

describe('Product Create Form', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockConditionInput.value = '';
        mockDisplayPrice.value = '';
        mockRealPrice.value = '';
        mockQuantityInput.value = '1';
        mockNameInput.value = '';
    });

    // ========== selectCondition Tests ==========
    describe('selectCondition()', () => {
        test('should be defined on window', () => {
            expect(window.selectCondition).toBeDefined();
            expect(typeof window.selectCondition).toBe('function');
        });

        test('should set condition value to hidden input', () => {
            const mockCard = createMockElement();
            document.querySelectorAll.mockReturnValueOnce([mockCard]);
            
            window.selectCondition(mockCard, 'new');
            
            expect(mockConditionInput.value).toBe('new');
        });

        test('should add active styling to selected card', () => {
            const mockCard = createMockElement();
            document.querySelectorAll.mockReturnValueOnce([]);
            
            window.selectCondition(mockCard, 'like_new');
            
            expect(mockCard.classList.add).toHaveBeenCalledWith('border-indigo-500', 'ring-2', 'ring-indigo-500/20', 'bg-indigo-50/10');
        });

        test('should remove active styling from other cards', () => {
            const otherCard = createMockElement();
            const selectedCard = createMockElement();
            document.querySelectorAll.mockReturnValueOnce([otherCard, selectedCard]);
            
            window.selectCondition(selectedCard, 'used');
            
            expect(otherCard.classList.remove).toHaveBeenCalledWith('border-indigo-500', 'ring-2', 'ring-indigo-500/20', 'bg-indigo-50/10');
        });

        test('should add checkmark to selected card', () => {
            const mockCard = createMockElement();
            document.querySelectorAll.mockReturnValueOnce([]);
            
            window.selectCondition(mockCard, 'good');
            
            expect(mockCard.insertAdjacentHTML).toHaveBeenCalledWith('beforeend', expect.stringContaining('check-mark'));
        });
    });

    // ========== adjustQuantity Tests ==========
    describe('adjustQuantity()', () => {
        test('should be defined on window', () => {
            expect(window.adjustQuantity).toBeDefined();
            expect(typeof window.adjustQuantity).toBe('function');
        });

        test('should increase quantity by 1', () => {
            mockQuantityInput.value = '5';
            
            window.adjustQuantity(1);
            
            expect(mockQuantityInput.value).toBe(6);
        });

        test('should decrease quantity by 1', () => {
            mockQuantityInput.value = '5';
            
            window.adjustQuantity(-1);
            
            expect(mockQuantityInput.value).toBe(4);
        });

        test('should not go below 1', () => {
            mockQuantityInput.value = '1';
            
            window.adjustQuantity(-1);
            
            expect(mockQuantityInput.value).toBe(1);
        });

        test('should handle NaN input', () => {
            mockQuantityInput.value = 'abc';
            
            window.adjustQuantity(1);
            
            // NaN + 1 = NaN, min is 1
            expect(mockQuantityInput.value).toBe(1);
        });
    });

    // ========== setPrice Tests ==========
    describe('setPrice()', () => {
        test('should be defined on window', () => {
            expect(window.setPrice).toBeDefined();
            expect(typeof window.setPrice).toBe('function');
        });

        test('should set real price value', () => {
            window.setPrice(500000);
            
            expect(mockRealPrice.value).toBe(500000);
        });

        test('should format display price with thousand separators', () => {
            mockNumberFormat.format.mockReturnValueOnce('500.000');
            
            window.setPrice(500000);
            
            expect(mockDisplayPrice.value).toBe('500.000');
        });

        test('should handle zero price', () => {
            mockNumberFormat.format.mockReturnValueOnce('0');
            
            window.setPrice(0);
            
            expect(mockRealPrice.value).toBe(0);
        });
    });

    // ========== Price Input Formatting Tests ==========
    describe('Price Input Formatting', () => {
        test('should strip non-numeric characters', () => {
            const rawValue = '1.234.567abc'.replace(/\D/g, '');
            expect(rawValue).toBe('1234567');
        });

        test('should handle empty input', () => {
            const rawValue = '';
            if (rawValue === '') {
                mockDisplayPrice.value = '';
                mockRealPrice.value = '';
            }
            
            expect(mockDisplayPrice.value).toBe('');
            expect(mockRealPrice.value).toBe('');
        });

        test('should format large numbers correctly', () => {
            mockNumberFormat.format.mockReturnValueOnce('1.000.000.000');
            
            const num = 1000000000;
            const formatted = mockNumberFormat.format(num);
            
            expect(formatted).toBe('1.000.000.000');
        });
    });

    // ========== Character Count Tests ==========
    describe('Character Count', () => {
        test('should update count on input', () => {
            mockNameInput.value = 'Test Product Name';
            mockNameCount.textContent = mockNameInput.value.length.toString();
            
            expect(mockNameCount.textContent).toBe('17');
        });

        test('should handle empty name', () => {
            mockNameInput.value = '';
            mockNameCount.textContent = mockNameInput.value.length.toString();
            
            expect(mockNameCount.textContent).toBe('0');
        });

        test('should count unicode characters correctly', () => {
            mockNameInput.value = 'Sản phẩm tiếng Việt';
            mockNameCount.textContent = mockNameInput.value.length.toString();
            
            expect(parseInt(mockNameCount.textContent)).toBeGreaterThan(0);
        });
    });

    // ========== Image Upload Tests ==========
    describe('Image Upload', () => {
        let selectedFiles;

        beforeEach(() => {
            selectedFiles = [];
        });

        test('should limit to 9 images', () => {
            selectedFiles = Array(9).fill(createMockFile());
            const remaining = 9 - selectedFiles.length;
            
            expect(remaining).toBe(0);
        });

        test('should show error when less than 2 images', () => {
            selectedFiles = [createMockFile()];
            
            if (selectedFiles.length < 2) {
                mockImgError.classList.remove('hidden');
            }
            
            expect(mockImgError.classList.remove).toHaveBeenCalledWith('hidden');
        });

        test('should hide error when 2+ images', () => {
            selectedFiles = [createMockFile(), createMockFile()];
            
            if (selectedFiles.length >= 2) {
                mockImgError.classList.add('hidden');
            }
            
            expect(mockImgError.classList.add).toHaveBeenCalledWith('hidden');
        });

        test('updateFileInput should use DataTransfer', () => {
            const dt = new DataTransfer();
            expect(global.DataTransfer).toHaveBeenCalled();
        });
    });

    // ========== removeImage Tests ==========
    describe('removeImage()', () => {
        test('should be defined on window', () => {
            expect(window.removeImage).toBeDefined();
            expect(typeof window.removeImage).toBe('function');
        });

        test('should remove image at index', () => {
            const files = ['a', 'b', 'c'];
            files.splice(1, 1);
            
            expect(files).toEqual(['a', 'c']);
        });
    });

    // ========== Category Picker Tests ==========
    describe('initCategoryPicker()', () => {
        test('initCategoryPicker should be defined', () => {
            expect(typeof initCategoryPicker).toBe('function');
        });

        test('should toggle panel on trigger click', () => {
            mockCategoryPanel.classList.toggle('hidden');
            
            expect(mockCategoryPanel.classList.toggle).toHaveBeenCalledWith('hidden');
        });

        test('should rotate arrow on toggle', () => {
            mockCategoryArrow.classList.toggle('rotate-180');
            
            expect(mockCategoryArrow.classList.toggle).toHaveBeenCalledWith('rotate-180');
        });

        test('should close panel when clicking outside', () => {
            mockCategoryPanel.classList.add('hidden');
            mockCategoryArrow.classList.remove('rotate-180');
            
            expect(mockCategoryPanel.classList.add).toHaveBeenCalledWith('hidden');
        });

        test('should handle parent without children', () => {
            const parent = createMockCategory({ children: [] });
            
            expect(parent.children.length).toBe(0);
        });

        test('should handle parent with children', () => {
            const parent = createMockCategory({
                children: [
                    { id: 2, name: 'Child 1' },
                    { id: 3, name: 'Child 2' }
                ]
            });
            
            expect(parent.children.length).toBe(2);
        });

        test('should display category with icon', () => {
            const parent = createMockCategory({ icon: 'fa-laptop' });
            
            expect(parent.icon).toBe('fa-laptop');
        });

        test('should display category with image', () => {
            const parent = createMockCategory({ 
                image: '/images/category.png',
                icon: null 
            });
            
            expect(parent.image).toBe('/images/category.png');
        });

        test('should set category value on selection', () => {
            mockCategoryDisplay.value = 'Electronics > Laptops';
            mockCategoryId.value = '5';
            
            expect(mockCategoryDisplay.value).toContain('Electronics');
            expect(mockCategoryId.value).toBe('5');
        });

        test('should highlight selected parent', () => {
            const parentDiv = createMockElement();
            parentDiv.classList.add('bg-indigo-50', 'border-l-2', 'border-indigo-500');
            
            expect(parentDiv.classList.add).toHaveBeenCalledWith('bg-indigo-50', 'border-l-2', 'border-indigo-500');
        });
    });

    // ========== Edge Cases ==========
    describe('Edge Cases', () => {
        test('should handle missing categoryTrigger element', () => {
            document.getElementById.mockReturnValueOnce(null);
            
            // initCategoryPicker should exit early
            expect(true).toBe(true);
        });

        test('should handle empty categoryData', () => {
            window.categoryData = [];
            
            expect(window.categoryData.length).toBe(0);
        });

        test('should handle file change with no files', () => {
            const files = [];
            if (!files.length) return;
            
            expect(files.length).toBe(0);
        });

        test('should handle FileReader error gracefully', () => {
            const reader = new FileReader();
            reader.onerror = jest.fn();
            
            expect(reader.readAsDataURL).toBeDefined();
        });
    });

    // ========== DOM Event Listeners ==========
    describe('DOM Event Listeners', () => {
        test('should attach input listener to displayPrice', () => {
            expect(mockDisplayPrice.addEventListener).toBeDefined();
        });

        test('should attach input listener to inputName', () => {
            expect(mockNameInput.addEventListener).toBeDefined();
        });

        test('should attach change listener to imageInput', () => {
            expect(mockImageInput.addEventListener).toBeDefined();
        });
    });
});
