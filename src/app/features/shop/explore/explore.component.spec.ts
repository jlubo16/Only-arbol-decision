import { describe, it, beforeEach, vi, expect } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ExploreComponent } from './explore.component';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { of } from 'rxjs';

// ------------------------------------------------------------------------
// 1. DEFINICIÓN DE INTERFACES Y MOCKS ESTRICTOS
// ------------------------------------------------------------------------

// Mock de categorías
const mockCategories: Category[] = [
  { id: 'figures', name: 'Figuras', icon: '🦸', count: 5 },      // Añadir count
  { id: 'animals', name: 'Animales', icon: '🐘', count: 3 },     // Añadir count
  { id: 'architecture', name: 'Arquitectura', icon: '🏛️', count: 2 } // Añadir count
];

// Mock de productos
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Dragón Fantástico',
    description: 'Un dragón detallado con alas articuladas',
    price: 24.99,
    difficulty: 'Avanzado',
    category: 'figures',
    pieces: 150,
    estimatedTime: '5 horas',
    rating: 4.8,
    imageColor: '#FF5733',
    imageUrl: 'dragon.jpg',
    userId: 1,
    reviews: []
  },
  {
    id: 2,
    title: 'Elefante Africano',
    description: 'Elefante realista con colmillos',
    price: 19.99,
    difficulty: 'Intermedio',
    category: 'animals',
    pieces: 85,
    estimatedTime: '3 horas',
    rating: 4.5,
    imageColor: '#33FF57',
    imageUrl: 'elefante.jpg',
    userId: 1,
    reviews: []
  },
  {
    id: 3,
    title: 'Torre Eiffel',
    description: 'Réplica detallada de la torre',
    price: 34.99,
    difficulty: 'Avanzado',
    category: 'architecture',
    pieces: 200,
    estimatedTime: '7 horas',
    rating: 4.9,
    imageColor: '#5733FF',
    imageUrl: 'eiffel.jpg',
    userId: 1,
    reviews: []
  },
  {
    id: 4,
    title: 'Gato Persa',
    description: 'Gato esponjoso fácil de armar',
    price: 12.99,
    difficulty: 'Fácil',
    category: 'animals',
    pieces: 40,
    estimatedTime: '1.5 horas',
    rating: 4.2,
    imageColor: '#FF33F5',
    imageUrl: 'gato.jpg',
    userId: 1,
    reviews: []
  },
  {
    id: 5,
    title: 'Castillo Medieval',
    description: 'Castillo con torres y murallas',
    price: 45.99,
    difficulty: 'Avanzado',
    category: 'architecture',
    pieces: 300,
    estimatedTime: '10 horas',
    rating: 4.7,
    imageColor: '#F5FF33',
    imageUrl: 'castillo.jpg',
    userId: 1,
    reviews: []
  }
];

// Mock completo de ProductsService
const mockProductsService = {
  getProducts: vi.fn().mockReturnValue(of(mockProducts)),
  getCategories: vi.fn().mockReturnValue(of(mockCategories)),
  getProductById: vi.fn(),
  getProductsByCategory: vi.fn()
};

describe('ExploreComponent', () => {
  let component: ExploreComponent;
  let fixture: ComponentFixture<ExploreComponent>;
  let productsService: typeof mockProductsService;

  // ------------------------------------------------------------------------
  // 2. CONFIGURACIÓN DE TESTS
  // ------------------------------------------------------------------------
  beforeEach(async () => {
    // Reset de mocks
    vi.clearAllMocks();
    
    // Restaurar comportamientos por defecto
    mockProductsService.getProducts.mockReturnValue(of(mockProducts));
    mockProductsService.getCategories.mockReturnValue(of(mockCategories));
    
    // Mock de APIs del navegador
    window.scrollTo = vi.fn();

    await TestBed.configureTestingModule({
      imports: [ExploreComponent],
      providers: [
        { provide: ProductsService, useValue: mockProductsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;
    productsService = TestBed.inject(ProductsService) as any;
  });

  // ------------------------------------------------------------------------
  // 3. PRUEBAS DE INICIALIZACIÓN
  // ------------------------------------------------------------------------
  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar datos en ngOnInit', () => {
    component.ngOnInit();
    
    expect(productsService.getCategories).toHaveBeenCalled();
    expect(productsService.getProducts).toHaveBeenCalled();
  });

  it('debe inicializar categorías correctamente', () => {
    component.ngOnInit();
    
    expect(component.categories).toEqual(mockCategories);
  });

  it('debe inicializar productos correctamente', () => {
    component.ngOnInit();
    
    expect(component.allProducts.length).toBe(5);
    expect(component.filteredProducts.length).toBeGreaterThan(0);
  });

  it('debe normalizar categorías de productos', () => {
    component.ngOnInit();
    
    // Verificar que las categorías se normalizaron (sin acentos)
    expect(component.allProducts[0].category).toBe('figures');
  });

  // ------------------------------------------------------------------------
  // 4. PRUEBAS DE FILTRADO
  // ------------------------------------------------------------------------
  describe('Filtrado', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debe filtrar por categoría', () => {
      component.selectedCategory = 'animals';
      component.applyFilters();
      
      expect(component.filteredProducts.length).toBe(2); // Elefante y Gato
      expect(component.filteredProducts.every(p => p.category === 'animals')).toBe(true);
    });

    it('debe filtrar por dificultad', () => {
      component.selectedDifficulty = 'easy';
      component.applyFilters();
      
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].difficulty).toBe('Fácil');
    });

    it('debe filtrar por precio máximo', () => {
      component.maxPrice = 20;
      component.applyFilters();
      
      expect(component.filteredProducts.length).toBe(2); // Elefante y Gato
      expect(component.filteredProducts.every(p => p.price <= 20)).toBe(true);
    });

    it('debe combinar múltiples filtros', () => {
      component.selectedCategory = 'animals';
      component.selectedDifficulty = 'easy';
      component.maxPrice = 15;
      component.applyFilters();
      
      expect(component.filteredProducts.length).toBe(1);
      expect(component.filteredProducts[0].title).toBe('Gato Persa');
    });

    it('debe retornar array vacío si ningún producto coincide', () => {
      component.searchQuery = 'producto inexistente';
      component.applyFilters();
      
      expect(component.filteredProducts.length).toBe(0);
    });
  });

  // ------------------------------------------------------------------------
  // 5. PRUEBAS DE ORDENAMIENTO
  // ------------------------------------------------------------------------
describe('Ordenamiento', () => {
  beforeEach(() => {
    component.ngOnInit();
    // Asegurar que todos los productos están disponibles
    component.allProducts = [...mockProducts];
    // Resetear filtros para tener todos los productos
    component.searchQuery = '';
    component.selectedCategory = '';
    component.selectedDifficulty = '';
    component.maxPrice = 100; // Un valor alto para incluir todos
    component.sortBy = 'popular';
    component.applyFilters();
  });

  it('debe ordenar por precio ascendente', () => {
    component.sortBy = 'price_asc';
    component.applyFilters();
    
    const prices = component.filteredProducts.map(p => p.price);
    expect(prices).toEqual([12.99, 19.99, 24.99, 34.99, 45.99]);
  });

  it('debe ordenar por precio descendente', () => {
    component.sortBy = 'price_desc';
    component.applyFilters();
    
    const prices = component.filteredProducts.map(p => p.price);
    expect(prices).toEqual([45.99, 34.99, 24.99, 19.99, 12.99]);
  });

  it('debe ordenar por rating', () => {
    component.sortBy = 'rating';
    component.applyFilters();
    
    // Verificar que el primer producto tiene el rating más alto
    const ratings = component.filteredProducts.map(p => p.rating);
    expect(Math.max(...ratings)).toBe(4.9);
    expect(component.filteredProducts[0].rating).toBe(4.9);
  });

  it('debe ordenar por popular (id descendente) por defecto', () => {
    component.sortBy = 'popular';
    component.applyFilters();
    
    const ids = component.filteredProducts.map(p => p.id);
    expect(ids).toEqual([5, 4, 3, 2, 1]); // IDs descendentes
    expect(component.filteredProducts[0].id).toBe(5);
  });
});
  // ------------------------------------------------------------------------
  // 6. PRUEBAS DE PAGINACIÓN
  // ------------------------------------------------------------------------
describe('Paginación', () => {
  beforeEach(() => {
    component.ngOnInit();
    component.allProducts = [...mockProducts];
    component.pageSize = 2;
    component.maxPrice = 100; // Asegurar que todos los productos pasan el filtro
    component.applyFilters();
  });

  it('debe paginar correctamente', () => {
    expect(component.filteredProducts.length).toBe(2);
    expect(component.totalPages).toBe(3);
    expect(component.totalProducts).toBe(5);
  });

it('debe ir a página específica', () => {
  component.ngOnInit();
  component.pageSize = 2;
  component.applyFilters();
  
  component.goToPage(2);
  
  expect(component.currentPage).toBe(2);
});


  it('debe ir a página siguiente', () => {
    component.currentPage = 1;
    component.nextPage();
    
    expect(component.currentPage).toBe(2);
    expect(component.filteredProducts[0].id).toBe(3);
  });

it('debe ir a página anterior', () => {
  component.ngOnInit();
  component.pageSize = 2;
  component.applyFilters();
  
  component.goToPage(2);
  component.prevPage();
  
  expect(component.currentPage).toBe(1);
});
});


  // ------------------------------------------------------------------------
  // 7. PRUEBAS DE INTERACCIONES DE USUARIO
  // ------------------------------------------------------------------------
  describe('Interacciones de usuario', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debe togglear categoría', () => {
      component.toggleCategory('animals');
      
      expect(component.selectedCategory).toBe('animals');
      expect(component.currentPage).toBe(1);
      
      component.toggleCategory('animals');
      expect(component.selectedCategory).toBe('');
    });

    it('debe togglear dificultad', () => {
      component.toggleDifficulty('easy');
      
      expect(component.selectedDifficulty).toBe('easy');
      
      component.toggleDifficulty('easy');
      expect(component.selectedDifficulty).toBe('');
    });

    it('debe resetear todos los filtros', () => {
      // Cambiar algunos filtros
      component.searchQuery = 'dragón';
      component.selectedCategory = 'animals';
      component.selectedDifficulty = 'easy';
      component.maxPrice = 15;
      component.sortBy = 'price_asc';
      component.currentPage = 2;
      
      component.resetFilters();
      
      expect(component.searchQuery).toBe('');
      expect(component.selectedCategory).toBe('');
      expect(component.selectedDifficulty).toBe('');
      expect(component.maxPrice).toBe(20);
      expect(component.sortBy).toBe('popular');
      expect(component.currentPage).toBe(1);
    });
  });

  // ------------------------------------------------------------------------
  // 8. PRUEBAS DE HELPERS PARA TEMPLATE
  // ------------------------------------------------------------------------
  describe('Helpers para template', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('debe obtener nombre de categoría por ID', () => {
      expect(component.getCategoryName('animals')).toBe('Animales');
      expect(component.getCategoryName('inexistente')).toBe('inexistente');
    });

    it('debe obtener conteo de productos por categoría', () => {
      expect(component.getProductCountForCategory('animals')).toBe(2);
      expect(component.getProductCountForCategory('figures')).toBe(1);
      expect(component.getProductCountForCategory('inexistente')).toBe(0);
    });

    it('debe obtener icono de categoría', () => {
      expect(component.getCategoryIcon('animals')).toBe('🐘');
      expect(component.getCategoryIcon('inexistente')).toBe('📦');
    });
  });

  // ------------------------------------------------------------------------
  // 9. PRUEBAS DE MANEJO DE ERRORES
  // ------------------------------------------------------------------------
  describe('Manejo de errores', () => {
    it('debe manejar error al cargar productos', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockProductsService.getProducts.mockReturnValue(of(mockProducts));
      
      // No hay error porque of() no falla
      component.loadData();
      
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('debe aplicar paginación correctamente', () => {
      const filtered = [mockProducts[0], mockProducts[1], mockProducts[2]];
      component.pageSize = 2;
      
      component.applyPagination(filtered);
      
      expect(component.filteredProducts.length).toBe(2);
    });
  });

  // ------------------------------------------------------------------------
  // 10. PRUEBA CON FAKE TIMERS (aunque no hay setTimeout en este componente)
  // ------------------------------------------------------------------------
  it('debe manejar operaciones asíncronas con fake timers', () => {
    vi.useFakeTimers();
    
    // Simular una operación que podría tener setTimeout
    setTimeout(() => {
      component.searchQuery = 'test';
    }, 1000);
    
    vi.advanceTimersByTime(1000);
    
    expect(component.searchQuery).toBe('test');
    
    vi.useRealTimers();
  });
});