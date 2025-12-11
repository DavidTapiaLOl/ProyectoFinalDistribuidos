import { Component, inject, OnInit, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ComputerService, Computer } from '../../services/computer.service'; 
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  private router = inject(Router); 
  private computerService = inject(ComputerService);
  private cd = inject(ChangeDetectorRef);

  constructor() {}

  computers: Computer[] = []; // Asegúrate de agregar usuario_nombre a la interfaz Computer si da error
  currentUser: any = {};
  isLoading = true;
  isModalOpen = false;
  isEditing = false;
  currentComp: any = this.getEmptyComputer(); // Usamos any temporalmente para evitar error de tipo con usuario_nombre

  ngOnInit() {
    this.loadUser();
    this.loadComputers();
  }

  loadUser() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user_data');
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

 loadComputers() {
    this.isLoading = true; // Activamos spinner antes de pedir
    
    this.computerService.getComputers().subscribe({
      next: (data) => {
        this.computers = data;
        this.isLoading = false; // Desactivamos spinner
        this.cd.detectChanges(); // <--- 4. OBLIGAMOS A ANGULAR A PINTAR LA TABLA
      },
      error: (err) => {
        console.error('Error cargando', err);
        this.isLoading = false;
      }
    });
  }
  openModal(computer?: any) {
    this.isModalOpen = true;
    if (computer) {
      this.isEditing = true;
      this.currentComp = { ...computer };
    } else {
      this.isEditing = false;
      this.currentComp = this.getEmptyComputer();
    }
  }

  closeModal() {
    this.isModalOpen = false;
    // Forzamos la limpieza del formulario para evitar residuos
    this.currentComp = this.getEmptyComputer();
  }

  saveComputer() {
    console.log('1. Intentando guardar...'); // DEBUG

    // Validación de seguridad: Si no hay usuario, usamos un fallback
    const userId = this.currentUser?.id || 'anonimo';
    const userName = this.currentUser?.nombre || this.currentUser?.email || 'Usuario Sin Nombre';

    // 1. Preparar datos
    this.currentComp.usuario_registro = userId;
    
    // Solo asignamos nombre si no existe (para no sobrescribir al editar si no quieres)
    if (!this.currentComp.usuario_nombre) {
        this.currentComp.usuario_nombre = userName;
    }

    console.log('2. Datos a enviar:', this.currentComp); // DEBUG

    // 2. Definir si es crear o actualizar
    let requestObservable;

    if (this.isEditing) {
      requestObservable = this.computerService.updateComputer(this.currentComp);
    } else {
      requestObservable = this.computerService.createComputer(this.currentComp);
    }

    // 3. Ejecutar la petición
    requestObservable.subscribe({
      next: (response) => {
        console.log('3. ÉXITO - Respuesta del servidor:', response); 
        this.closeModal(); 
        this.loadComputers(); 
        alert(this.isEditing ? 'Actualizado correctamente' : 'Creado correctamente');
      },
      error: (error) => {
        console.error('3. ERROR - Falló la petición:', error);
        alert('Error al guardar. Revisa la consola.');
      }
    });
  }

  // Función auxiliar para manejar el éxito y CERRAR EL MODAL
  handleSuccess(msg: string) {
    this.closeModal(); // <--- CIERRE AUTOMÁTICO
    this.loadComputers(); // Recargamos la tabla
    alert(msg);
  }

  deleteComputer(id: string | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de eliminar este equipo?')) {
      this.computerService.deleteComputer(id).subscribe(() => {
        this.loadComputers();
      });
    }
  }

  getEmptyComputer() {
    return {
      tipo_equipo: 'Laptop', marca: '', modelo: '', numero_serie: '',
      procesador: '', ram_gb: 8, almacenamiento_gb: 256, 
      fecha_compra: new Date().toISOString().split('T')[0],
      estado: 'Nuevo', usuario_registro: '', usuario_nombre: ''
    };
  }

  // Lógica visual para mostrar el nombre
 // Helper visual para mostrar el nombre
 getCreatorName(pc: any): string {
    // Protección contra nulos
    if (!pc) return '';

    // 1. Si soy yo
    if (pc.usuario_registro === this.currentUser.id) {
      return `Tú (${this.currentUser.nombre})`;
    }

    // 2. Si viene el nombre desde la BD (Aquí es donde fallaba antes)
    if (pc.usuario_nombre) {
      return pc.usuario_nombre;
    }

    // 3. Fallback al ID si no hay nombre
    if (pc.usuario_registro) {
      return `ID: ${pc.usuario_registro.substring(0, 8)}...`;
    }

    return 'Desconocido';
  }

  logout() {
    if (typeof window !== 'undefined') { localStorage.clear(); }
    this.router.navigate(['/login']);
  }
}