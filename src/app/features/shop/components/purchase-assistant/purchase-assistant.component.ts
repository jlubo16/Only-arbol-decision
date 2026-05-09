// src/app/features/shop/components/purchase-assistant/purchase-assistant.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecisionTreeService } from '../../../../core/services/decision-tree.service';

@Component({
  selector: 'app-purchase-assistant',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-assistant.component.html',
  styleUrls: ['./purchase-assistant.component.scss']
})
export class PurchaseAssistantComponent implements OnInit {
  @Output() productsSelected = new EventEmitter<any>();
  
  currentQuestion: string = '';
  currentOptions: { id: string; label: string; icon: string }[] = [];
  selectedAnswers: { question: string; answer: string }[] = [];
  
  // Las preguntas completas que se muestran en el progreso
  stepQuestions: string[] = [
    '¿Qué tipo de producto buscas?',
    '¿Cantidad de piezas?',
    '¿Tamaño de las piezas?',
    '¿Para qué lo quieres?',
    '¿Qué temática te gusta?'
  ];
  
  constructor(private treeService: DecisionTreeService) {}
  
  ngOnInit() {
    this.treeService.reset();
    this.loadCurrentNode();
  }
  
  loadCurrentNode() {
    this.currentQuestion = this.treeService.getCurrentQuestion();
    this.currentOptions = this.treeService.getCurrentOptions();
    
    // Actualizar resumen de selecciones - CORREGIDO
    const selections = this.treeService.getCurrentSelections();
    this.selectedAnswers = Array.from(selections.entries()).map(([nodeId, selection]) => ({
      question: this.getFullQuestionText(nodeId),
      answer: this.getAnswerLabel(selection.answer) // selection.answer es el string
    }));
    
    console.log('📢 Pregunta actual:', this.currentQuestion);
    console.log('📢 Opciones:', this.currentOptions);
  }
  
  selectOption(optionId: string) {
    console.log('📢 Opción seleccionada:', optionId);
    const result = this.treeService.selectOption(optionId);
    console.log('📢 Resultado:', result);
    
    if (result.isComplete && result.filters) {
      console.log('🎯 Emitiendo filtros:', result.filters);
      this.productsSelected.emit(result.filters);
    } else if (result.isComplete && !result.filters) {
      console.error('❌ Error: isComplete true pero sin filters');
    } else {
      this.loadCurrentNode();
    }
  }
  
  goBack() {
    if (this.treeService.canGoBack()) {
      this.treeService.goBack();
      this.loadCurrentNode();
    }
  }
  
  resetAssistant() {
    this.treeService.reset();
    this.loadCurrentNode();
  }
  
  private getFullQuestionText(nodeId: string): string {
    // Mejorar la detección basada en el ID del nodo
    if (nodeId.includes('type')) return 'Tipo de producto';
    if (nodeId.includes('pieces')) return 'Cantidad de piezas';
    if (nodeId.includes('size')) return 'Tamaño de piezas';
    if (nodeId.includes('category')) return 'Categoría';
    if (nodeId.includes('figures') || nodeId.includes('decoration') || nodeId.includes('functional')) return 'Temática';
    
    const fullQuestions: Record<string, string> = {
      'type': 'Tipo de producto',
      'pieces_digital': 'Cantidad de piezas',
      'pieces_kit': 'Cantidad de piezas',
      'size_few_digital': 'Tamaño de piezas',
      'size_many_digital': 'Tamaño de piezas',
      'size_few_kit': 'Tamaño de piezas',
      'size_many_kit': 'Tamaño de piezas',
      'category_digital_small': 'Categoría',
      'category_digital_large': 'Categoría',
      'category_kit_small': 'Categoría',
      'category_kit_large': 'Categoría'
    };
    return fullQuestions[nodeId] || 'Pregunta';
  }
  
  private getAnswerLabel(answerId: string): string {
    const labels: Record<string, string> = {
      'digital': 'Digital',
      'kit': 'Kit',
      'few': 'Pocas piezas',
      'many': 'Muchas piezas',
      'small': 'Pequeñas',
      'large': 'Grandes',
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
    return labels[answerId] || answerId;
  }
  
  get hasSelections(): boolean {
    return this.selectedAnswers.length > 0;
  }
}