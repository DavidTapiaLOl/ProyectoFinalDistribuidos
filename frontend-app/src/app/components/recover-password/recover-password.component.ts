import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recover-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './recover-password.component.html',
  styleUrl: './recover-password.component.css'
})
export class RecoverPasswordComponent {
  step = 1;
  email = '';
  otp = '';
  newPassword = '';
  loading = false; // Para bloquear botones

  // 2. Inyectar NgZone en el constructor
  constructor(
    private auth: AuthService, 
    private router: Router,
   private cd: ChangeDetectorRef
  ) {}

  async solicitarCodigo() {
    if (this.loading) return;
    this.loading = true;

    try {
      await this.auth.solicitarOtp(this.email);
      alert('Código enviado.');
      
      this.step = 2;        // Cambiamos el paso
      this.loading = false; // Desbloqueamos
      this.cd.detectChanges(); // <--- 3. ¡FUERZA LA ACTUALIZACIÓN YA!

    } catch (error) {
      console.error(error);
      alert('Error al solicitar código');
      this.loading = false;
    }
  }

  async verificarCodigo() {
    if (this.loading) return;
    this.loading = true;

    try {
      await this.auth.verificarOtp(this.email, this.otp);
      
      this.step = 3;        // Cambiamos el paso
      this.loading = false; // Desbloqueamos
      this.cd.detectChanges(); // <--- 3. ¡FUERZA LA ACTUALIZACIÓN YA!

    } catch (error) {
      alert('Código incorrecto o expirado.');
      this.loading = false;
    }
  }

  async cambiarPassword() {
    if (this.loading) return;
    this.loading = true;

    try {
      await this.auth.resetPassword({ email: this.email, newPassword: this.newPassword });
      alert('¡Contraseña actualizada!');
      
      this.router.navigate(['/login']);
      // Aquí no hace falta detectChanges porque al navegar cambia de página
      
    } catch (error) {
      alert('Error al actualizar contraseña.');
      this.loading = false;
    }
  }
}
 