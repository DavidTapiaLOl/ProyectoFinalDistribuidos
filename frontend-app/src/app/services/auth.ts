import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URLs de los contenedores Docker
  private nodeApi = 'http://localhost:3000/api';
  private netApi = 'http://localhost:5000/api/email';

  constructor() { }

  // --- NODE.JS ---
  register(data: any) {
    return axios.post(`${this.nodeApi}/register`, data);
  }

  login(data: any) {
    return axios.post(`${this.nodeApi}/login`, data);
  }

  resetPassword(data: any) {
    return axios.post(`${this.nodeApi}/reset-password`, data);
  }

  // --- .NET CORE ---
  solicitarOtp(email: string) {
    return axios.post(`${this.netApi}/solicitar-otp`, { email });
  }

  verificarOtp(email: string, otp: string) {
    return axios.post(`${this.netApi}/verificar-otp`, { email, otp });
  }

  updateProfile(data: any) {
    return axios.post(`${this.nodeApi}/update-profile`, data);
  }
  
}