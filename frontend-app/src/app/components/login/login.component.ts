import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], 
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
      const user = res.data ? res.data.user : res.user;

      localStorage.setItem('token', token);
      localStorage.setItem('user_data', JSON.stringify(user)); 

      alert('¡Login exitoso!');
      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert('Credenciales incorrectas');
    }
  }
}