import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  // SOLUCIÓN: Usamos inject() aquí para evitar el error del DecoratorFactory
  private auth = inject(AuthService);
  private router = inject(Router);

  user: any = {};
  password = ''; 

  constructor() {
    // La lógica de inicialización se mantiene igual
    if (typeof window !== 'undefined' && window.localStorage) {
      const userData = localStorage.getItem('user_data');
      if (userData) {
        this.user = JSON.parse(userData);
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  async guardarCambios() {
    try {
      const updateData = {
        id: this.user.id,
        nombre: this.user.nombre,
        apellidos: this.user.apellidos,
        telefono: this.user.telefono,
        password: this.password 
      };

      await this.auth.updateProfile(updateData);
      
      // Actualizamos localStorage solo si estamos en el navegador
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_data', JSON.stringify(this.user));
      }
      
      alert('¡Datos actualizados correctamente!');
      this.password = ''; 
    } catch (error) {
      console.error(error);
      alert('Error al actualizar datos');
    }
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }
}