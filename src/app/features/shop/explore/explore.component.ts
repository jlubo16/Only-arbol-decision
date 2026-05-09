import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { Product } from '../../../core/models/product.model';
import { Category } from '../../../core/models/category.model';
import { ProductsService } from '../../../core/services/products.service';
import { PurchaseAssistantComponent } from '../components/purchase-assistant/purchase-assistant.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent, PurchaseAssistantComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  // --- COLECCIONES DE DATOS ---
  allProducts: Product[] = [];
  categories: Category[] = [];
  filteredProducts: Product[] = [];

  // --- ESTADO DE FILTROS ---
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedDifficulty: string = '';
  maxPrice: number = 20;
  sortBy: string = 'popular';
  selectedPiecesCount: string = '';
  selectedPieceSize: string = '';

  // --- CONTROL DE PAGINACIÓN ---
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;
  totalProducts: number = 0;

  navigationMode: 'classic' | 'assistant' = 'classic';

  difficulties = [
    { id: 'easy', label: 'Fácil' },
    { id: 'intermediate', label: 'Intermedio' },
    { id: 'advanced', label: 'Avanzado' }
  ];

  constructor(private productsService: ProductsService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.productsService.getCategories().subscribe(data => {
      this.categories = data;
    });

    this.productsService.getProducts().subscribe({
      next: (data) => {
        this.allProducts = data.map(product => ({
          ...product,
          category: product.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        }));
        this.applyFilters();
      },
      error: (err) => console.error('Error cargando catálogo:', err)
    });
  }

  applyFilters() {
    let filtered = [...this.allProducts];

    console.log('📊 Productos totales:', filtered.length);

    // 1. Filtrado por texto (búsqueda)
    if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.subcategory?.toLowerCase().includes(query) ||
            p.category?.toLowerCase().includes(query)
        );
        console.log('🔍 Después de búsqueda:', filtered.length);
    }

    // 2. Filtrado por categoría
    if (this.selectedCategory) {
        filtered = filtered.filter(p => 
            p.category === this.selectedCategory ||
            p.subcategory === this.selectedCategory ||
            p.originalCategory === this.selectedCategory
        );
        console.log('📁 Después de categoría:', filtered.length);
    }

    // 3. Filtrar por cantidad de piezas
    if (this.selectedPiecesCount) {
        filtered = filtered.filter(p => p.piecesCount === this.selectedPiecesCount);
        console.log('🔢 Después de piecesCount:', filtered.length);
    }

    // 4. Filtrar por tamaño de pieza
    if (this.selectedPieceSize) {
        filtered = filtered.filter(p => p.pieceSize === this.selectedPieceSize);
        console.log('📏 Después de pieceSize:', filtered.length);
    }

    // 5. Filtrado por dificultad
    if (this.selectedDifficulty) {
        const diffMap: Record<string, string> = { 
            easy: 'Fácil', intermediate: 'Intermedio', advanced: 'Avanzado' 
        };
        filtered = filtered.filter(p => p.difficulty === diffMap[this.selectedDifficulty]);
        console.log('⭐ Después de dificultad:', filtered.length);
    }

    // 6. Filtrado por precio
    filtered = filtered.filter(p => p.price <= this.maxPrice);
    console.log('💰 Después de precio:', filtered.length);

    // 7. Ordenamiento
    filtered = this.sortProducts(filtered);

    this.totalProducts = filtered.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;
    this.applyPagination(filtered);
  }

  applyPagination(filtered: Product[]) {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.filteredProducts = filtered.slice(start, end);
  }

  sortProducts(products: Product[]): Product[] {
    const sorted = [...products];
    switch (this.sortBy) {
      case 'price_asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price_desc': return sorted.sort((a, b) => b.price - a.price);
      case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
      default: return sorted.sort((a, b) => b.id - a.id);
    }
  }

  toggleCategory(categoryId: string) {
    const categoryMap: Record<string, string> = {
        'animals': 'figures',
        'architecture': 'decoration',
        'robots': 'figures',
        'fantasy': 'figures',
        'vehicles': 'figures',
        'decoration': 'decoration',
        'functional': 'functional'
    };
    
    const newCategory = categoryMap[categoryId] || categoryId;
    this.selectedCategory = this.selectedCategory === newCategory ? '' : newCategory;
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleDifficulty(difficultyId: string) {
    this.selectedDifficulty = this.selectedDifficulty === difficultyId ? '' : difficultyId;
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedDifficulty = '';
    this.selectedPiecesCount = '';
    this.selectedPieceSize = '';
    this.maxPrice = 20;
    this.sortBy = 'popular';
    this.currentPage = 1;
    this.applyFilters();
  }

  get showingStart(): number { 
    return this.totalProducts === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1; 
  }
  
  get showingEnd(): number { 
    return Math.min(this.currentPage * this.pageSize, this.totalProducts); 
  }
  
  getCategoryName(id: string) { 
    return this.categories.find(c => c.id === id)?.name || id; 
  }
  
  getProductCountForCategory(id: string) { 
    return this.allProducts.filter(p => p.category === id).length; 
  }

  getPageNumbers(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.applyFilters();
  }

  nextPage() { 
    if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); 
  }
  
  prevPage() { 
    if (this.currentPage > 1) this.goToPage(this.currentPage - 1); 
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.icon : '📦';
  }

  onAssistantProductsSelected(filters: any) {
    console.log('Filtros del asistente:', filters);
    this.applyAssistantFilters(filters);
  }
  
  // ✅ MÉTODO CORREGIDO - No sobrescribe searchQuery
  applyAssistantFilters(filters: any) {
    console.log('⚙️ Aplicando:', filters);

    if (filters.category) {
        this.selectedCategory = filters.category;
        console.log('📁 Categoría:', this.selectedCategory);
    }
    
    if (filters.subcategory) {
        this.searchQuery = filters.subcategory;  // ← SOLO UNA VEZ
        console.log('🔍 Subcategoría:', this.searchQuery);
    }
    
    if (filters.pieces) {
        this.selectedPiecesCount = filters.pieces;
        console.log('🔢 Piezas:', this.selectedPiecesCount);
    }
    
    if (filters.pieceSize) {
        this.selectedPieceSize = filters.pieceSize;
        console.log('📏 Tamaño:', this.selectedPieceSize);
    }

    this.currentPage = 1;
    this.applyFilters();
    console.log('📊 Resultados:', this.filteredProducts.length);
    
    this.navigationMode = 'classic';
  }
}