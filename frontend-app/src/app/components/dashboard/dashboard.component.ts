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

  computers: Computer[] = []; 
  currentUser: any = {};
  isLoading = true;
  isModalOpen = false;
  isEditing = false;
  currentComp: any = this.getEmptyComputer(); 

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
    this.isLoading = true; 
    
    this.computerService.getComputers().subscribe({
      next: (data) => {
        this.computers = data;
        this.isLoading = false; 
        this.cd.detectChanges();
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
    this.currentComp = this.getEmptyComputer();
  }

  saveComputer() {
    const userId = this.currentUser?.id || 'anonimo';
    const userName = this.currentUser?.nombre || this.currentUser?.email || 'Usuario Sin Nombre';


    this.currentComp.usuario_registro = userId;
  
    if (!this.currentComp.usuario_nombre) {
        this.currentComp.usuario_nombre = userName;
    }

    console.log('2. Datos a enviar:', this.currentComp); 


    let requestObservable;

    if (this.isEditing) {
      requestObservable = this.computerService.updateComputer(this.currentComp);
    } else {
      requestObservable = this.computerService.createComputer(this.currentComp);
    }


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

 
  handleSuccess(msg: string) {
    this.closeModal(); 
    this.loadComputers(); 
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


 getCreatorName(pc: any): string {
  
    if (!pc) return '';

 
    if (pc.usuario_registro === this.currentUser.id) {
      return `Tú (${this.currentUser.nombre})`;
    }

    if (pc.usuario_nombre) {
      return pc.usuario_nombre;
    }

    
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