import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
  // FÍJATE AQUÍ: Deben coincidir con los nuevos nombres de tus archivos
  templateUrl: './login.component.html', 
  styleUrl: './login.component.css',     
})
export class LoginComponent { 
  credenciales = { email: '', password: '' };

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    try {
      const res: any = await this.auth.login(this.credenciales);
      const token = res.data ? res.data.token : res.token;
      // NUEVO: Obtenemos también el objeto usuario
      const user = res.data ? res.data.user : res.user;

      localStorage.setItem('token', token);
      // NUEVO: Guardamos los datos del usuario para usarlos en el perfil
      localStorage.setItem('user_data', JSON.stringify(user)); 

      alert('¡Login exitoso!');
      this.router.navigate(['/dashboard']); // Redirigir al perfil
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  }
}