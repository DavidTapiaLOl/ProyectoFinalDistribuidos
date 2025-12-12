import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html', 
  styleUrl: './register.component.css'      
})
export class RegisterComponent {
  user = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    telefono: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  async registrar() {
    try {
      await this.auth.register(this.user);
      alert('Usuario registrado correctamente. Intenta iniciar sesión.');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error(error);
      alert('Error al registrar. Verifica que el correo no esté duplicado.');
    }
  }
}