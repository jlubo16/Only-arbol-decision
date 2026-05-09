// src/app/core/services/decision-tree.service.ts
import { Injectable } from '@angular/core';

export class DecisionNode {
  id: string;
  question: string;
  options: Map<string, DecisionNode> = new Map();
  isLeaf: boolean = false;
  filters?: any;
  parent: DecisionNode | null = null;  // Para navegación bidireccional

  constructor(id: string, question: string, isLeaf: boolean = false, parent: DecisionNode | null = null) {
    this.id = id;
    this.question = question;
    this.isLeaf = isLeaf;
    this.parent = parent;
  }

  addOption(answer: string, node: DecisionNode): void {
    node.parent = this;
    this.options.set(answer, node);
  }

  getNextNode(answer: string): DecisionNode | undefined {
    return this.options.get(answer);
  }

  getParent(): DecisionNode | null {
    return this.parent;
  }
}

@Injectable({ providedIn: 'root' })
export class DecisionTreeService {
  private root!: DecisionNode;
  private currentNode: DecisionNode | null = null;
  private selections: Map<string, { answer: string; node: DecisionNode }> = new Map();

  constructor() {
    this.buildPureTree();
    this.reset();
  }

private buildPureTree(): void {
  // ==================== NIVEL 1: TIPO DE PRODUCTO ====================
  const root = new DecisionNode('type', '¿Qué tipo de producto buscas?');
  
  // ==================== NIVEL 2: CANTIDAD DE PIEZAS ====================
  const digitalNode = new DecisionNode('pieces_digital', '¿Cuántas piezas tendrá tu proyecto?');
  const kitNode = new DecisionNode('pieces_kit', '¿Cuántas piezas tendrá tu proyecto?');
  
  root.addOption('digital', digitalNode);
  root.addOption('kit', kitNode);
  
  // ==================== NIVEL 3: TAMAÑO DE PIEZAS ====================
  const fewDigitalNode = new DecisionNode('size_few_digital', '¿Qué tamaño tendrán las piezas?');
  const manyDigitalNode = new DecisionNode('size_many_digital', '¿Qué tamaño tendrán las piezas?');
  const fewKitNode = new DecisionNode('size_few_kit', '¿Qué tamaño tendrán las piezas?');
  const manyKitNode = new DecisionNode('size_many_kit', '¿Qué tamaño tendrán las piezas?');
  
  digitalNode.addOption('few', fewDigitalNode);
  digitalNode.addOption('many', manyDigitalNode);
  kitNode.addOption('few', fewKitNode);
  kitNode.addOption('many', manyKitNode);
  
  // ==================== NIVEL 4: CATEGORÍA (ÁRBOL PURO) ====================
  
  // RAMA DIGITAL - FEW (pocas piezas)
  const catDigFewSmall = new DecisionNode('cat_dig_few_small', '¿Qué categoría te interesa?');
  const catDigFewLarge = new DecisionNode('cat_dig_few_large', '¿Qué categoría te interesa?');
  fewDigitalNode.addOption('small', catDigFewSmall);
  fewDigitalNode.addOption('large', catDigFewLarge);
  
  // RAMA DIGITAL - MANY (muchas piezas)
  const catDigManySmall = new DecisionNode('cat_dig_many_small', '¿Qué categoría te interesa?');
  const catDigManyLarge = new DecisionNode('cat_dig_many_large', '¿Qué categoría te interesa?');
  manyDigitalNode.addOption('small', catDigManySmall);
  manyDigitalNode.addOption('large', catDigManyLarge);
  
  // RAMA KIT - FEW (pocas piezas)
  const catKitFewSmall = new DecisionNode('cat_kit_few_small', '¿Qué categoría te interesa?');
  const catKitFewLarge = new DecisionNode('cat_kit_few_large', '¿Qué categoría te interesa?');
  fewKitNode.addOption('small', catKitFewSmall);
  fewKitNode.addOption('large', catKitFewLarge);
  
  // RAMA KIT - MANY (muchas piezas)
  const catKitManySmall = new DecisionNode('cat_kit_many_small', '¿Qué categoría te interesa?');
  const catKitManyLarge = new DecisionNode('cat_kit_many_large', '¿Qué categoría te interesa?');
  manyKitNode.addOption('small', catKitManySmall);
  manyKitNode.addOption('large', catKitManyLarge);
  
  // ==================== NIVEL 5: SUBCATEGORÍAS (HOJAS) ====================
  
  // Cada rama tiene sus propias subcategorías (independientes)
  this.addSubcategoryLeaves(catDigFewSmall, 'dig_few_small');
  this.addSubcategoryLeaves(catDigFewLarge, 'dig_few_large');
  this.addSubcategoryLeaves(catDigManySmall, 'dig_many_small');
  this.addSubcategoryLeaves(catDigManyLarge, 'dig_many_large');
  this.addSubcategoryLeaves(catKitFewSmall, 'kit_few_small');
  this.addSubcategoryLeaves(catKitFewLarge, 'kit_few_large');
  this.addSubcategoryLeaves(catKitManySmall, 'kit_many_small');
  this.addSubcategoryLeaves(catKitManyLarge, 'kit_many_large');
  
  this.root = root;
}
  private addSubcategoryLeaves(parentNode: DecisionNode, prefix: string): void {
    // Subcategoría: FIGURAS
    const figuresNode = new DecisionNode(
      `${prefix}_figures`, 
      '¿Qué tipo de figuras te gustan?',
      false,
      parentNode
    );
    
    // Hojas de FIGURAS
    const figuresAnimals = new DecisionNode(
      `${prefix}_figures_animals`,
      'Recomendaciones para ti',
      true,
      figuresNode
    );
    figuresAnimals.filters = { 
      category: 'figures', 
      subcategory: 'animals',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const figuresCharacters = new DecisionNode(
      `${prefix}_figures_characters`,
      'Recomendaciones para ti',
      true,
      figuresNode
    );
    figuresCharacters.filters = { 
      category: 'figures', 
      subcategory: 'characters',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const figuresObjects = new DecisionNode(
      `${prefix}_figures_objects`,
      'Recomendaciones para ti',
      true,
      figuresNode
    );
    figuresObjects.filters = { 
      category: 'figures', 
      subcategory: 'objects',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    figuresNode.addOption('animals', figuresAnimals);
    figuresNode.addOption('characters', figuresCharacters);
    figuresNode.addOption('objects', figuresObjects);
    
    // Subcategoría: DECORACIÓN
    const decorationNode = new DecisionNode(
      `${prefix}_decoration`,
      '¿Qué tipo de decoración buscas?',
      false,
      parentNode
    );
    
    // Hojas de DECORACIÓN
    const decorationChristmas = new DecisionNode(
      `${prefix}_decoration_christmas`,
      'Recomendaciones para ti',
      true,
      decorationNode
    );
    decorationChristmas.filters = { 
      category: 'decoration', 
      subcategory: 'christmas',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const decorationRoom = new DecisionNode(
      `${prefix}_decoration_room`,
      'Recomendaciones para ti',
      true,
      decorationNode
    );
    decorationRoom.filters = { 
      category: 'decoration', 
      subcategory: 'room',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const decorationEvents = new DecisionNode(
      `${prefix}_decoration_events`,
      'Recomendaciones para ti',
      true,
      decorationNode
    );
    decorationEvents.filters = { 
      category: 'decoration', 
      subcategory: 'events',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    decorationNode.addOption('christmas', decorationChristmas);
    decorationNode.addOption('room', decorationRoom);
    decorationNode.addOption('events', decorationEvents);
    
    // Subcategoría: FUNCIONAL
    const functionalNode = new DecisionNode(
      `${prefix}_functional`,
      '¿Qué tipo de objeto funcional necesitas?',
      false,
      parentNode
    );
    
    // Hojas de FUNCIONAL
    const functionalBoxes = new DecisionNode(
      `${prefix}_functional_boxes`,
      'Recomendaciones para ti',
      true,
      functionalNode
    );
    functionalBoxes.filters = { 
      category: 'functional', 
      subcategory: 'boxes',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const functionalOrganizers = new DecisionNode(
      `${prefix}_functional_organizers`,
      'Recomendaciones para ti',
      true,
      functionalNode
    );
    functionalOrganizers.filters = { 
      category: 'functional', 
      subcategory: 'organizers',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    const functionalLamps = new DecisionNode(
      `${prefix}_functional_lamps`,
      'Recomendaciones para ti',
      true,
      functionalNode
    );
    functionalLamps.filters = { 
      category: 'functional', 
      subcategory: 'lamps',
      productType: prefix.includes('digital') ? 'digital' : 'kit',
      size: prefix.includes('small') ? 'small' : 'large'
    };
    
    functionalNode.addOption('boxes', functionalBoxes);
    functionalNode.addOption('organizers', functionalOrganizers);
    functionalNode.addOption('lamps', functionalLamps);
    
    // Conectar todo al padre
    parentNode.addOption('figures', figuresNode);
    parentNode.addOption('decoration', decorationNode);
    parentNode.addOption('functional', functionalNode);
  }

  getCurrentQuestion(): string {
    return this.currentNode?.question || '';
  }

  getCurrentOptions(): { id: string; label: string; icon: string }[] {
    if (!this.currentNode || this.currentNode.isLeaf) return [];

    const optionMap: Record<string, { label: string; icon: string }> = {
      'digital': { label: 'Solo plantilla digital', icon: '📱' },
      'kit': { label: 'Kit con materiales', icon: '📦' },
      'few': { label: 'Pocas piezas (menos de 50)', icon: '🔢' },
      'many': { label: 'Muchas piezas (más de 50)', icon: '🧩' },
      'small': { label: 'Piezas pequeñas (< 5cm)', icon: '✨' },
      'large': { label: 'Piezas grandes (> 5cm)', icon: '📐' },
      'figures': { label: 'Figuras', icon: '🦊' },
      'decoration': { label: 'Decoración', icon: '🎄' },
      'functional': { label: 'Funcional', icon: '🔧' },
      'animals': { label: 'Animales', icon: '🐘' },
      'characters': { label: 'Personajes', icon: '👤' },
      'objects': { label: 'Objetos', icon: '⚽' },
      'christmas': { label: 'Navidad', icon: '🎄' },
      'room': { label: 'Habitación', icon: '🏠' },
      'events': { label: 'Eventos', icon: '🎉' },
      'boxes': { label: 'Cajas', icon: '📦' },
      'organizers': { label: 'Organizadores', icon: '🗄️' },
      'lamps': { label: 'Lámparas', icon: '💡' }
    };

    const options: { id: string; label: string; icon: string }[] = [];

    for (const [key] of this.currentNode.options) {
      const mapped = optionMap[key] || { label: key, icon: '📌' };
      options.push({ id: key, label: mapped.label, icon: mapped.icon });
    }

    return options;
  }

  selectOption(optionId: string): { isComplete: boolean; filters?: any; fullPath?: any[] } {
    if (!this.currentNode) return { isComplete: true };

    // Guardar selección con contexto completo
    this.selections.set(this.currentNode.id, { 
      answer: optionId, 
      node: this.currentNode 
    });

    const nextNode = this.currentNode.getNextNode(optionId);

    if (!nextNode) return { isComplete: true };

    this.currentNode = nextNode;

    if (nextNode.isLeaf) {
      // Reconstruir todo el camino de decisiones
      const fullPath = this.getFullDecisionPath();
      
      return {
        isComplete: true,
        filters: nextNode.filters,
        fullPath: fullPath
      };
    }

    return { isComplete: false };
  }

  private getFullDecisionPath(): any[] {
    const path: any[] = [];
    let current = this.currentNode;
    
    while (current && current.parent) {
      // Encontrar qué respuesta llevó a este nodo
      for (const [answer, childNode] of current.parent.options) {
        if (childNode === current) {
          path.unshift({
            nodeId: current.parent.id,
            question: current.parent.question,
            answer: answer,
            answerLabel: this.getOptionLabel(answer)
          });
          break;
        }
      }
      current = current.parent;
    }
    
    return path;
  }

  private getOptionLabel(optionId: string): string {
    const labels: Record<string, string> = {
      'digital': 'Solo plantilla digital',
      'kit': 'Kit con materiales',
      'few': 'Pocas piezas',
      'many': 'Muchas piezas',
      'small': 'Piezas pequeñas',
      'large': 'Piezas grandes',
      'figures': 'Figuras',
      'decoration': 'Decoración',
      'functional': 'Funcional',
      'animals': 'Animales',
      'characters': 'Personajes',
      'objects': 'Objetos',
      'christmas': 'Navidad',
      'room': 'Habitación',
      'events': 'Eventos',
      'boxes': 'Cajas',
      'organizers': 'Organizadores',
      'lamps': 'Lámparas'
    };
    return labels[optionId] || optionId;
  }

  getCurrentSelections(): Map<string, { answer: string; node: DecisionNode }> {
    return new Map(this.selections);
  }

  getSummary(): string {
    const selections: string[] = [];
    for (const [_, value] of this.selections) {
      selections.push(`${value.node.question}: ${this.getOptionLabel(value.answer)}`);
    }
    return selections.join(' → ');
  }

  canGoBack(): boolean {
    return this.currentNode?.parent !== null;
  }

  goBack(): void {
    if (!this.canGoBack() || !this.currentNode) return;

    const previousNode = this.currentNode.parent;
    if (previousNode) {
      // Eliminar la selección del nodo actual y todos los descendientes
      const keysToDelete: string[] = [];
      for (const [key] of this.selections) {
        if (key.startsWith(this.currentNode.id.split('_')[0])) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.selections.delete(key));
      
      this.currentNode = previousNode;
    }
  }

  reset(): void {
    this.currentNode = this.root;
    this.selections.clear();
  }

  // Método adicional para validar que es un árbol perfecto
  validateTree(node: DecisionNode = this.root, visited: Set<string> = new Set()): boolean {
    if (visited.has(node.id)) {
      console.error('❌ Ciclo detectado en el nodo:', node.id);
      return false;
    }
    
    visited.add(node.id);
    
    // Verificar que todos los hijos tengan este nodo como padre
    for (const [answer, child] of node.options) {
      if (child.parent !== node) {
        console.error(`❌ El hijo ${child.id} no tiene como padre a ${node.id}`);
        return false;
      }
      
      // Verificar que no haya ciclos recursivamente
      if (!this.validateTree(child, new Set(visited))) {
        return false;
      }
    }
    
    return true;
  }
}
