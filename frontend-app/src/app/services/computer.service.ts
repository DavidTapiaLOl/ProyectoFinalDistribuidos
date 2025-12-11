import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Computer {
  id?: string;
  tipo_equipo: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  procesador: string;
  ram_gb: number;
  almacenamiento_gb: number;
  fecha_compra: string;
  estado: string;
  usuario_registro: string;
  usuario_nombre?: string;
  fecha_creacion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ComputerService {
  private http = inject(HttpClient);
  // URL de tu contenedor PHP expuesto en el puerto 8000
  private apiUrl = 'http://localhost:8000/index.php'; 

  getComputers(): Observable<Computer[]> {
    const timestamp = new Date().getTime();
    return this.http.get<Computer[]>(`${this.apiUrl}?t=${timestamp}`);
  }

  createComputer(computer: Computer): Observable<any> {
    return this.http.post(this.apiUrl, computer);
  }

  updateComputer(computer: Computer): Observable<any> {
    return this.http.put(this.apiUrl, computer);
  }

  deleteComputer(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}?id=${id}`);
  }
}